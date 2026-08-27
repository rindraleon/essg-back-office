import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { cn } from '@/lib';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Rechercher...',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'relative w-full min-w-0 max-w-md sm:w-[22rem] sm:max-w-none sm:shrink-0',
        className
      )}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full min-w-0 rounded-md pl-9"
      />
    </div>
  );
};

export default SearchInput;
