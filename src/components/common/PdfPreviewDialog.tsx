import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FileWarning,
  LoaderCircle,
  Maximize,
  Minus,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/api/types/api';
import type { DocumentBlob } from '@/api/client/http';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href;
GlobalWorkerOptions.workerSrc = workerUrl;

interface PdfPreviewDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  loadDocument: () => Promise<Blob | DocumentBlob>;
  fileName: string;
  showDownload?: boolean;
}

type Kind = 'pdf' | 'image' | 'unsupported';

function resolveKind(blob: Blob | DocumentBlob, fileName: string): Kind {
  const type = blob.type || '';
  const mimetype = (blob as DocumentBlob).mimetype || '';
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (type.includes('pdf') || mimetype.includes('pdf') || ext === 'pdf') return 'pdf';
  if (type.startsWith('image/') || mimetype.startsWith('image/')) return 'image';

  return 'unsupported';
}

const MIN_ZOOM = 50;
const MAX_ZOOM = 300;
const ZOOM_STEP = 25;

const PdfPreviewDialog = ({
  open,
  title,
  onClose,
  loadDocument,
  fileName,
  showDownload = true,
}: PdfPreviewDialogProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<Kind>('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [fitWidth, setFitWidth] = useState(true);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rendering, setRendering] = useState(false);

  const loadRef = useRef(loadDocument);
  useEffect(() => {
    loadRef.current = loadDocument;
  }, [loadDocument]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const currentPdfRef = useRef<PDFDocumentProxy | null>(null);

  const openDocument = useCallback(async () => {
    setLoading(true);
    setError(null);
    setZoom(100);
    setFitWidth(true);
    setPdf(null);
    setPageCount(0);
    setCurrentPage(1);
    currentPdfRef.current = null;
    try {
      const blob = await loadRef.current();
      const detected = resolveKind(blob, fileName);
      setKind(detected);
      setObjectUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      if (detected === 'pdf') {
        const doc = await getDocument({ data: await blob.arrayBuffer() }).promise;
        currentPdfRef.current = doc;
        setPdf(doc);
        setPageCount(doc.numPages);
        setCurrentPage(1);
      } else if (detected === 'unsupported') {
        try {
          const doc = await getDocument({ data: await blob.arrayBuffer() }).promise;
          currentPdfRef.current = doc;
          setPdf(doc);
          setPageCount(doc.numPages);
          setCurrentPage(1);
          setKind('pdf');
        } catch {
          setKind('unsupported');
        }
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Le document n'a pas pu être chargé. Réessayez ou téléchargez-le."
      );
    } finally {
      setLoading(false);
    }
  }, [fileName]);

  useEffect(() => {
    if (!open) return;
    void openDocument();

    return () => {
      renderTaskRef.current?.cancel();
      const doc = currentPdfRef.current;
      currentPdfRef.current = null;
      if (doc) void doc.destroy();
    };
  }, [open, openDocument]);

  const renderPage = useCallback(async () => {
    const doc = currentPdfRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;
    renderTaskRef.current?.cancel();
    setRendering(true);
    try {
      const page: PDFPageProxy = await doc.getPage(currentPage);
      const containerWidth = (containerRef.current?.clientWidth ?? canvas.clientWidth) || 800;
      const scale = fitWidth ? containerWidth / page.getViewport({ scale: 1 }).width : zoom / 100;
      const viewport = page.getViewport({ scale });
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      const task = page.render({
        canvas,
        canvasContext: ctx,
        viewport,
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
      });
      renderTaskRef.current = task;
      await task.promise;
      page.cleanup();
    } finally {
      setRendering(false);
    }
  }, [currentPage, zoom, fitWidth]);

  useEffect(() => {
    if (open && kind === 'pdf' && pdf) void renderPage();
  }, [open, kind, pdf, renderPage]);

  useEffect(() => {
    const onResize = () => {
      if (fitWidth && kind === 'pdf') void renderPage();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [fitWidth, kind, renderPage]);

  const handleDownload = useCallback(() => {
    if (!objectUrl) return;
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, [objectUrl, fileName]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const canZoom = Boolean(objectUrl) && kind !== 'unsupported';
  const showViewer = Boolean(objectUrl) && !loading && !error;
  const showPdfToolbar = kind === 'pdf' && pdf;

  return (
    <dialog
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/80 p-3 sm:p-6"
      open
      aria-label={title}
    >
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
          <h2 className="max-w-[45%] truncate text-base font-bold text-ink-900 sm:text-lg">
            {title}
          </h2>

          <div className="flex flex-wrap items-center gap-1.5">
            {showPdfToolbar && (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || rendering}
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex items-center gap-1 text-xs font-medium text-ink-600">
                  <input
                    type="number"
                    min={1}
                    max={pageCount}
                    value={currentPage}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value, 10);
                      if (value >= 1 && value <= pageCount) setCurrentPage(value);
                    }}
                    className="h-8 w-12 rounded-md border border-ink-200 bg-white px-1 text-center text-xs outline-none focus:border-brand-600"
                    aria-label="Numéro de page"
                  />
                  / {pageCount}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  disabled={currentPage >= pageCount || rendering}
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {canZoom && (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => {
                    setFitWidth(false);
                    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
                  }}
                  disabled={zoom <= MIN_ZOOM && !fitWidth}
                  aria-label="Réduire"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-12 text-center text-xs font-semibold text-ink-600">
                  {fitWidth ? 'Ajusté' : `${zoom}%`}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => {
                    setFitWidth(false);
                    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
                  }}
                  disabled={zoom >= MAX_ZOOM}
                  aria-label="Agrandir"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => {
                    setFitWidth(true);
                    setZoom(100);
                  }}
                  disabled={fitWidth && zoom === 100}
                  aria-label="Ajuster à la largeur"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </>
            )}

            {showDownload && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownload}
                disabled={!objectUrl}
                className="h-8"
              >
                <Download className="mr-1 h-4 w-4" />
                Télécharger
              </Button>
            )}

            <Button type="button" size="icon" variant="ghost" onClick={onClose} aria-label="Fermer">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div ref={containerRef} className="relative min-h-0 flex-1 overflow-auto bg-ink-100">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-600">
              <LoaderCircle className="h-8 w-8 animate-spin text-brand-600" />
              Chargement du document…
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-ink-600">
              <FileWarning className="h-8 w-8 text-red-600" />
              <p className="max-w-md">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => void openDocument()}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Réessayer
              </Button>
            </div>
          )}

          {showViewer && kind === 'pdf' && (
            <div className="flex min-h-full items-start justify-center p-4">
              <div className="relative">
                <canvas ref={canvasRef} className="mx-auto rounded-sm bg-white shadow-sm" />
                {rendering && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-sm bg-white/60">
                    <LoaderCircle className="h-7 w-7 animate-spin text-brand-600" />
                  </div>
                )}
              </div>
            </div>
          )}

          {showViewer && kind === 'image' && (
            <div className="flex min-h-full items-center justify-center p-4">
              <img
                src={objectUrl as string}
                alt={title}
                className="mx-auto max-h-full bg-white shadow-sm"
                style={{
                  width: fitWidth ? 'auto' : `${zoom}%`,
                  maxWidth: fitWidth ? '100%' : 'none',
                }}
              />
            </div>
          )}

          {showViewer && kind === 'unsupported' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <FileText className="h-10 w-10 text-ink-400" />
              <div>
                <p className="font-medium text-ink-800">
                  Ce format ne peut pas être affiché dans le navigateur
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {showDownload
                    ? "Téléchargez le document pour l'ouvrir avec l'application adaptée."
                    : "Ce document n'est pas lisible en ligne."}
                </p>
              </div>
              {showDownload && (
                <Button type="button" onClick={handleDownload}>
                  <Download className="mr-1 h-4 w-4" />
                  Télécharger le document
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default PdfPreviewDialog;
