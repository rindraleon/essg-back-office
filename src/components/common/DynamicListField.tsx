import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/floating-input';
import { Label } from '@/components/ui/label';

interface DynamicListFieldProps {
  label: string;
  itemPlaceholder?: string;
  items: string[];
  error?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, value: string) => void;
}

const DynamicListField = ({
  label,
  itemPlaceholder = label,
  items,
  error,
  onAdd,
  onRemove,
  onChange,
}: DynamicListFieldProps) => {
  return (
    <div className="w-full space-y-2">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-sm font-medium text-ink-700">{label}</Label>

        <Button size="sm" onClick={onAdd} className="normal-case">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="flex items-start gap-2">
            <FloatingInput
              label={`${itemPlaceholder} ${index + 1}`}
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              className="rounded-xl bg-white"
            />

            {items.length > 1 && (
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onRemove(index)}
                className="mt-1 h-9 w-9"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
export default DynamicListField;
