import { Check, Monitor, Moon, Sun } from 'lucide-react';
import React from 'react';

import { useTheme, type ThemeMode } from '@/contexts/ThemeContext';
import { cn } from '@/lib';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

const OPTIONS: ReadonlyArray<{ value: ThemeMode; label: string; Icon: typeof Sun }> = [
  { value: 'light', label: 'Clair', Icon: Sun },
  { value: 'dark', label: 'Sombre', Icon: Moon },
  { value: 'system', label: 'Système', Icon: Monitor },
];

interface ThemeToggleProps {
  variant?: 'select' | 'cycle';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'select', className }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (variant === 'cycle') {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={className}
        onClick={toggleTheme}
        aria-label={isDark ? 'Activer le thème clair' : 'Activer le thème sombre'}
        aria-pressed={isDark}
        title="Changer de thème"
      >
        {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-md">
        <Button
          variant="ghost"
          size="icon"
          className={cn('text-ink-700 hover:text-brand-600', className)}
          aria-label="Choisir le thème de l'interface"
          title="Thème de l'interface"
        >
          {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36">
        {OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            className="flex cursor-pointer items-center gap-2"
            onClick={() => setTheme(value)}
          >
            <Icon className="size-4 text-ink-500" />
            <span>{label}</span>
            {theme === value && <Check className="ml-auto size-4 text-brand-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeToggle };
