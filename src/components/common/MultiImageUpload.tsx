import { ImagePlus, LoaderCircle, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadImage } from '@/services';
import { getImageUrl } from '@/utils';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface MultiImageUploadProps {
  label?: string;
  hint?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  disabled?: boolean;
  folder?: string;
}

const ACCEPTED = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
const MAX_SIZE = 5 * 1024 * 1024;

export default function MultiImageUpload({
  label = 'Galerie',
  hint = 'JPG, PNG, GIF, WebP — max 5 Mo par image',
  value,
  onChange,
  max = 12,
  disabled = false,
  folder = 'images',
}: Readonly<MultiImageUploadProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const remaining = Math.max(0, max - value.length);

  const uploadFiles = async (files: File[]) => {
    const accepted = files.filter((file) => {
      if (!ACCEPTED.split(',').includes(file.type)) {
        toast.error(`Format non supporté : ${file.name}`);
        return false;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} dépasse 5 Mo`);
        return false;
      }
      return true;
    });

    const toUpload = accepted.slice(0, remaining);
    if (accepted.length > remaining) {
      toast.error(`Maximum ${max} images. ${remaining} emplacement(s) restant(s).`);
    }
    if (toUpload.length === 0) return;

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of toUpload) {
        uploaded.push(await uploadImage(file, folder));
      }
      onChange([...value, ...uploaded]);
      toast.success(
        uploaded.length > 1 ? `${uploaded.length} images ajoutées` : 'Image ajoutée à la galerie'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Échec du téléversement d'une image.");
      if (uploaded.length > 0) onChange([...value, ...uploaded]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || uploading) return;
    void uploadFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wide text-ink-600">{label}</Label>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url) => (
            <div
              key={url}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-ink-100"
            >
              <img
                loading="lazy"
                decoding="async"
                src={getImageUrl(url)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== url))}
                disabled={disabled || uploading}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink-950/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Retirer l'image"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-start gap-2 rounded-xl border border-dashed p-3 transition-colors ${
          isDragging ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-ink-50/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          disabled={disabled || uploading || remaining === 0}
          onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || uploading || remaining === 0}
          onClick={() => inputRef.current?.click()}
          className="h-8 gap-1.5 bg-white text-xs"
        >
          {uploading ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          {uploading ? 'Téléversement...' : 'Ajouter des images'}
        </Button>
        <p className="flex items-center gap-1 text-[10px] text-ink-400">
          <Upload className="h-3 w-3" />
          {hint} · {value.length}/{max}
        </p>
      </div>
    </div>
  );
}
