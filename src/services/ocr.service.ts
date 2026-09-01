import type { PDFPageProxy } from 'pdfjs-dist';
import { parseCvText, type ParsedCv } from '@/utils';

export const ACCEPTED_CV_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

const MAX_CV_SIZE = 10 * 1024 * 1024;

export interface OcrProgress {
  percent: number;
  label: string;
}

export interface OcrResult {
  text: string;
  parsed: ParsedCv;
  usedOcr: boolean;
  pages: number;
}

type OcrErrorKind = 'unsupported' | 'too_large' | 'unreadable' | 'failed';

export class OcrError extends Error {
  readonly kind: OcrErrorKind;

  constructor(message: string, kind: OcrErrorKind = 'failed') {
    super(message);
    this.name = 'OcrError';
    this.kind = kind;
  }
}

function validateCvFile(file: File): void {
  if (!ACCEPTED_CV_TYPES.includes(file.type)) {
    throw new OcrError(
      'Format non supporté. Utilisez un PDF ou une image (JPG, PNG, WebP).',
      'unsupported'
    );
  }
  if (file.size > MAX_CV_SIZE) {
    throw new OcrError('Le fichier dépasse 10 Mo.', 'too_large');
  }
}

async function loadPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  return pdfjs;
}

async function recognize(
  image: Blob | HTMLCanvasElement,
  onProgress?: (progress: OcrProgress) => void,
  progressBase = 0,
  progressSpan = 100
): Promise<string> {
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker(['fra', 'eng'], undefined, {
    logger: (message: { status: string; progress: number }) => {
      if (message.status === 'recognizing text') {
        onProgress?.({
          percent: Math.round(progressBase + message.progress * progressSpan),
          label: 'Reconnaissance du texte…',
        });
      }
    },
  });

  try {
    const { data } = await worker.recognize(image);
    return data.text ?? '';
  } finally {
    await worker.terminate();
  }
}

async function renderPageToCanvas(page: PDFPageProxy): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');
  if (!context) throw new OcrError("Impossible d'initialiser le rendu du PDF.");
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return canvas;
}

interface TextFragment {
  str?: string;
  transform?: number[];
  width?: number;
}

function detectColumnCut({
  items,
  pageWidth,
}: {
  items: TextFragment[];
  pageWidth: number;
}): number | null {
  const visible = items.filter((item) => item.str?.trim());
  if (visible.length < 20) return null;

  const starts = visible.map((item) => item.transform?.[4] ?? 0).sort((a, b) => a - b);
  const groups: Array<{ x: number; count: number }> = [];
  for (const x of starts) {
    const last = groups.at(-1);
    if (last && x - last.x <= 6) {
      last.count += 1;
    } else {
      groups.push({ x, count: 1 });
    }
  }

  const anchors = groups.filter((group) => group.count >= 3);
  if (anchors.length < 2) return null;

  let best: { cut: number; score: number } | null = null;

  for (const anchor of anchors) {
    const candidate = scoreColumnCut(anchor.x - 4, visible, pageWidth);
    if (candidate && (!best || candidate.score > best.score)) best = candidate;
  }

  return best?.cut ?? null;
}

function scoreColumnCut(
  cut: number,
  visible: TextFragment[],
  pageWidth: number
): { cut: number; score: number } | null {
  if (cut < pageWidth * 0.15 || cut > pageWidth * 0.7) return null;

  const left = visible.filter((item) => (item.transform?.[4] ?? 0) < cut);
  const rightCount = visible.length - left.length;
  if (left.length < visible.length * 0.15 || rightCount < visible.length * 0.15) return null;

  const overflow = left.filter(
    (item) => (item.transform?.[4] ?? 0) + (item.width ?? 0) > cut + 6
  ).length;
  const overflowRatio = overflow / left.length;
  if (overflowRatio > 0.15) return null;

  const balance = Math.min(left.length, rightCount) / visible.length;
  return { cut, score: balance - overflowRatio };
}

function itemsToLines(items: TextFragment[]): string {
  const Y_TOLERANCE = 3;

  const rows: Array<{ y: number; parts: Array<{ x: number; str: string }> }> = [];

  for (const item of items) {
    const text = item.str ?? '';
    if (!text) continue;

    const transform = item.transform;
    if (!transform || transform.length < 6) {
      if (rows.length > 0) rows.at(-1)!.parts.push({ x: Number.MAX_SAFE_INTEGER, str: text });
      continue;
    }

    const x = transform[4];
    const y = transform[5];
    const row = rows.find((candidate) => Math.abs(candidate.y - y) <= Y_TOLERANCE);

    if (row) {
      row.parts.push({ x, str: text });
    } else {
      rows.push({ y, parts: [{ x, str: text }] });
    }
  }

  rows.sort((a, b) => b.y - a.y);

  return rows
    .map((row) => {
      const sortedParts = [...row.parts].sort((a, b) => a.x - b.x);
      return sortedParts
        .map((part) => part.str)
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
    })
    .filter(Boolean)
    .join('\n');
}

function pageToText(items: TextFragment[], pageWidth: number): string {
  const cut = detectColumnCut({ items, pageWidth });
  if (cut === null) return itemsToLines(items);

  const left = items.filter((item) => item.str?.trim() && (item.transform?.[4] ?? 0) < cut);
  const right = items.filter((item) => item.str?.trim() && (item.transform?.[4] ?? 0) >= cut);
  const [principal, lateral] = right.length >= left.length ? [right, left] : [left, right];

  return [itemsToLines(principal), itemsToLines(lateral)].filter(Boolean).join('\n');
}

async function extractFromPdf(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  onProgress?.({ percent: 5, label: 'Lecture du document…' });

  const pdfjs = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const document_ = await pdfjs.getDocument({ data: buffer }).promise;

  const pageCount = Math.min(document_.numPages, 10);
  const chunks: string[] = [];

  for (let index = 1; index <= pageCount; index++) {
    onProgress?.({
      percent: 5 + Math.round((index / pageCount) * 25),
      label: `Extraction du texte (page ${index}/${pageCount})…`,
    });
    const page = await document_.getPage(index);
    const content = await page.getTextContent();
    const { width } = page.getViewport({ scale: 1 });
    const text = pageToText(content.items as TextFragment[], width);
    if (text) chunks.push(text);
  }

  const direct = chunks.join('\n').trim();

  if (direct.length >= 120) {
    onProgress?.({ percent: 100, label: 'Analyse terminée' });
    return { text: direct, parsed: parseCvText(direct), usedOcr: false, pages: pageCount };
  }

  const ocrChunks: string[] = [];
  for (let index = 1; index <= pageCount; index++) {
    const page = await document_.getPage(index);
    const canvas = await renderPageToCanvas(page);
    const base = 30 + ((index - 1) / pageCount) * 65;
    const text = await recognize(canvas, onProgress, base, 65 / pageCount);
    ocrChunks.push(text);
    canvas.width = 0;
    canvas.height = 0;
  }

  const ocrText = ocrChunks.join('\n').trim();
  onProgress?.({ percent: 100, label: 'Analyse terminée' });

  if (ocrText.length < 40) {
    throw new OcrError(
      'Le document semble illisible. Essayez un fichier plus net ou de meilleure résolution.',
      'unreadable'
    );
  }

  return { text: ocrText, parsed: parseCvText(ocrText), usedOcr: true, pages: pageCount };
}

async function extractFromImage(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  onProgress?.({ percent: 10, label: "Préparation de l'image…" });
  const text = (await recognize(file, onProgress, 10, 88)).trim();
  onProgress?.({ percent: 100, label: 'Analyse terminée' });

  if (text.length < 40) {
    throw new OcrError(
      'Le document semble illisible. Essayez une image plus nette ou mieux cadrée.',
      'unreadable'
    );
  }

  return { text, parsed: parseCvText(text), usedOcr: true, pages: 1 };
}

export async function analyzeCv(
  file: File,
  onProgress?: (progress: OcrProgress) => void
): Promise<OcrResult> {
  validateCvFile(file);

  try {
    return file.type === 'application/pdf'
      ? await extractFromPdf(file, onProgress)
      : await extractFromImage(file, onProgress);
  } catch (error) {
    if (error instanceof OcrError) throw error;
    throw new OcrError(
      "L'analyse du document a échoué. Vérifiez le fichier puis réessayez.",
      'failed'
    );
  }
}
