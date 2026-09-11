export const loginFieldClass = (hasError: boolean): string =>
  [
    'h-12 w-full rounded-xl border bg-white/95 pl-11 text-sm text-ink-900 shadow-sm',
    'placeholder:text-ink-400',
    'transition-all duration-200 outline-none',
    'hover:bg-white',
    'focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/20',
    hasError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-ink-200/80',
  ].join(' ');
