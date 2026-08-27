import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib';
import { Button } from './button';

function Dialog({ ...props }: Readonly<DialogPrimitive.Root.Props>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: Readonly<DialogPrimitive.Trigger.Props>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: Readonly<DialogPrimitive.Portal.Props>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: Readonly<DialogPrimitive.Close.Props>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }: Readonly<DialogPrimitive.Backdrop.Props>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-[2px]',
        'transition-opacity duration-200 ease-out',
        'data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[ending-style]:duration-150',
        'motion-reduce:transition-none',
        className
      )}
      {...props}
    />
  );
}

const dialogContentVariants = cva(
  [
    'relative z-50 flex w-full flex-col overflow-hidden',
    'max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)]',
    'rounded-2xl bg-white text-sm text-foreground',
    'shadow-elevated ring-1 ring-ink-950/10 outline-none',
    'pointer-events-auto',
    'transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'data-[starting-style]:translate-y-2 data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0',
    'data-[ending-style]:translate-y-2 data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0',
    'data-[ending-style]:duration-150',
    'motion-reduce:transition-none motion-reduce:data-[starting-style]:translate-y-0',
    'motion-reduce:data-[starting-style]:scale-100 motion-reduce:data-[ending-style]:translate-y-0',
    'motion-reduce:data-[ending-style]:scale-100',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
        xl: 'sm:max-w-2xl',
        '2xl': 'sm:max-w-4xl',
        full: 'sm:max-w-6xl',
      },
    },
    defaultVariants: {
      size: 'lg',
    },
  }
);

interface DialogContentProps
  extends DialogPrimitive.Popup.Props, VariantProps<typeof dialogContentVariants> {
  showCloseButton?: boolean;
  closeLabel?: string;
}

function DialogContent({
  className,
  children,
  size,
  showCloseButton = true,
  closeLabel = 'Fermer la fenêtre',
  ...props
}: Readonly<DialogContentProps>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        data-slot="dialog-viewport"
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-4 sm:p-6"
      >
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(dialogContentVariants({ size }), className)}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              aria-label={closeLabel}
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-3 right-3 z-10 rounded-full text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                />
              }
            >
              <XIcon aria-hidden="true" />
              <span className="sr-only">{closeLabel}</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Popup>
      </div>
    </DialogPortal>
  );
}

interface DialogHeaderProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  icon?: React.ReactNode;
  iconClassName?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
}

function DialogHeader({
  className,
  icon,
  iconClassName,
  title,
  description,
  children,
  ...props
}: Readonly<DialogHeaderProps>) {
  const hasStructuredContent = Boolean(icon || title || description);

  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex shrink-0 flex-col gap-2 border-b border-ink-100 bg-white px-5 py-4 sm:px-6',
        className
      )}
      {...props}
    >
      {hasStructuredContent ? (
        <div className="flex items-start gap-3 pr-10">
          {icon && (
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 [&>svg]:size-4.5',
                iconClassName
              )}
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 space-y-1">
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}

function DialogBody({ className, ...props }: Readonly<React.ComponentProps<'div'>>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        'min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6',
        className
      )}
      {...props}
    />
  );
}

interface DialogFooterProps extends React.ComponentProps<'div'> {
  showCloseButton?: boolean;
  closeLabel?: string;
}

function DialogFooter({
  className,
  showCloseButton = false,
  closeLabel = 'Fermer',
  children,
  ...props
}: Readonly<DialogFooterProps>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex shrink-0 flex-col-reverse gap-2 border-t border-ink-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6',
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          {closeLabel}
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: Readonly<DialogPrimitive.Title.Props>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-base leading-tight font-semibold text-ink-900 sm:text-lg', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: Readonly<DialogPrimitive.Description.Props>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-sm leading-relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
};
