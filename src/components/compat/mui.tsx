import * as React from 'react';
import { Button as UiButton } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

export function Box({ className, children, sx: _sx, component: _c, ...props }: React.HTMLAttributes<HTMLDivElement> & { sx?: unknown; component?: string }) {
  return <div className={className} {...props}>{children}</div>;
}

export function Typography({ className, children, variant, ...props }: React.HTMLAttributes<HTMLElement> & { variant?: string }) {
  const getTag = () => {
    if (variant === 'h6') return 'h2';
    if (variant === 'h5') return 'h3';
    return 'p';
  };
  const Tag = getTag();
  return <Tag className={cn('text-ink-800', className)} {...props}>{children}</Tag>;
}

export function Card({ className, children, variant: _v, sx: _sx, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: string; sx?: unknown }) {
  return <div className={cn('rounded-xl border border-ink-100 bg-white shadow-card', className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }: Readonly<React.HTMLAttributes<HTMLDivElement>>) {
  return <div className={cn('p-4', className)} {...props}>{children}</div>;
}

export function Divider({ className }: Readonly<{ className?: string }>) {
  return <div className={cn('h-px w-full bg-ink-100', className)} />;
}

export function Avatar({
  src,
  alt,
  className,
  children,
  onError,
}: Readonly<{
  src?: string;
  alt?: string;
  className?: string;
  sx?: unknown;
  children?: React.ReactNode;
  onError?: () => void;
}>) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        onError={onError}
        className={cn('size-16 rounded-full object-cover', className)}
      />
    );
  }
  return (
    <div className={cn('flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-semibold', className)}>
      {children}
    </div>
  );
}

export function Grid({ children, className, container: _c, spacing: _s, size: _size }: React.HTMLAttributes<HTMLDivElement> & { container?: boolean; spacing?: number; size?: unknown }) {
  return <div className={cn('grid gap-4', className)}>{children}</div>;
}

export function IconButton({ children, className, onClick, disabled, type = 'button', color: _c, size: _s }: React.ButtonHTMLAttributes<HTMLButtonElement> & { color?: string; size?: string }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn('inline-flex size-8 items-center justify-center rounded-md text-ink-600 hover:bg-ink-50', className)}>
      {children}
    </button>
  );
}

export function Button({
  children,
  className,
  variant = 'contained',
  startIcon,
  fullWidth,
  sx: _sx,
  size: _size,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; startIcon?: React.ReactNode; fullWidth?: boolean; sx?: unknown; size?: string }) {
  const getVariant = () => {
    if (variant === 'outlined') return 'outline';
    if (variant === 'text') return 'ghost';
    return 'default';
  };
  const mapped = getVariant();
  return (
    <UiButton className={cn(fullWidth && 'w-full', className)} variant={mapped as 'default' | 'outline' | 'ghost'} {...props}>
      {startIcon}
      {children}
    </UiButton>
  );
}

export function TextField({
  label,
  helperText,
  error,
  multiline,
  rows,
  fullWidth,
  size: _size,
  className,
  InputLabelProps: _inputLabelProps,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string;
  helperText?: string;
  error?: boolean;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  size?: string;
  InputLabelProps?: unknown;
}) {
  return (
    <div className={cn('space-y-1.5', fullWidth && 'w-full', className)}>
      {label && <label className="text-sm font-medium text-ink-700">{label}</label>}
      {multiline ? (
        <Textarea rows={rows} className={cn(error && 'border-red-400')} {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <Input className={cn(error && 'border-red-400')} {...props} />
      )}
      {helperText && <p className={cn('text-xs', error ? 'text-red-500' : 'text-ink-500')}>{helperText}</p>}
    </div>
  );
}

export function FormControl({ children, className, fullWidth, error: _e, size }: React.HTMLAttributes<HTMLDivElement> & { fullWidth?: boolean; size?: string; error?: boolean }) {
  return <div className={cn(fullWidth && 'w-full', size === 'small' && 'text-sm', className)}>{children}</div>;
}

export function InputLabel({ children }: Readonly<{ children?: React.ReactNode }>) {
  return <label className="mb-1.5 block text-sm font-medium text-ink-700">{children}</label>;
}

export function Select({
  children,
  value,
  onChange,
  onBlur,
  multiple: _m,
  renderValue: _r,
}: Readonly<{
  children?: React.ReactNode;
  value?: string | string[];
  onChange?: (event: { target: { value: string } }) => void;
  onBlur?: () => void;
  label?: string;
  multiple?: boolean;
  renderValue?: (selected: unknown) => React.ReactNode;
}>) {
  return (
    <select
      value={Array.isArray(value) ? value[0] : value}
      onChange={(event) => onChange?.({ target: { value: event.target.value } })}
      onBlur={onBlur}
      className="flex h-10 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm"
    >
      {children}
    </select>
  );
}

export function MenuItem({ children, value }: Readonly<{ children?: React.ReactNode; value?: string }>) {
  return <option value={value}>{children}</option>;
}

export function FormHelperText({ children }: Readonly<{ children?: React.ReactNode }>) {
  return <p className="mt-1 text-xs text-red-500">{children}</p>;
}

export function Chip({ label, onDelete, className }: Readonly<{ label?: React.ReactNode; onDelete?: () => void; className?: string; size?: string; sx?: unknown }>) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800', className)}>
      {label}
      {onDelete && (
        <button type="button" onClick={onDelete} aria-label="Supprimer">
          ×
        </button>
      )}
    </span>
  );
}

export function Collapse({ in: open = true, children }: Readonly<{ in?: boolean; children?: React.ReactNode }>) {
  if (!open) return null;
  return <div className="animate-fade-in">{children}</div>;
}
