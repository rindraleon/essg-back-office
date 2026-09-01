import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  FormHelperText,
  Button,
} from '@/components/compat/mui';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';

interface FormTextFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  error: string | undefined;
  touched?: boolean;
  type?: 'text' | 'email' | 'number' | 'url';
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export const FormTextField: React.FC<FormTextFieldProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  type = 'text',
  multiline = false,
  rows = 4,
  placeholder,
  fullWidth = true,
  size = 'small',
}) => {
  return (
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      error={Boolean(error && touched)}
      helperText={error && touched ? error : undefined}
      type={type}
      multiline={multiline}
      rows={rows}
      placeholder={placeholder}
      fullWidth={fullWidth}
      size={size}
    />
  );
};

interface FormSelectProps {
  label: string;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  options: { value: string; label: string }[];
  multiple?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  renderValue?: (selected: unknown) => React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options,
  multiple = false,
  fullWidth = true,
  size = 'small',
  renderValue,
}) => {
  return (
    <FormControl fullWidth={fullWidth} size={size} error={Boolean(error && touched)}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple={multiple}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        renderValue={renderValue}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {error && touched && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

interface ArrayFieldProps {
  label: string;
  icon?: React.ReactNode;
  items: string[];
  onChange: (items: string[]) => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  minItems?: number;
  itemPrefix?: string;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  label,
  icon,
  items,
  onChange,
  error,
  touched,
  placeholder = 'Élément',
  minItems = 1,
  itemPrefix = 'Élément',
}) => {
  const handleChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleAdd = () => {
    onChange([...items, '']);
  };

  const handleRemove = (index: number) => {
    if (items.length > minItems) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 text-sm font-medium text-ink-700 mb-2">
        {icon}
        {label}
        {error && touched && <span className="text-red-500 text-xs ml-1">{error}</span>}
      </label>
      {items.map((item, index) => (
        <div
          key={`${itemPrefix.toLowerCase()}-${index}-${item}`}
          className="flex gap-2 mb-2 items-center"
        >
          <TextField
            value={item}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={`${placeholder} ${index + 1}`}
            fullWidth
            size="small"
            error={Boolean(error && touched && !item.trim())}
          />
          <IconButton
            type="button"
            onClick={() => handleRemove(index)}
            color="error"
            size="small"
            disabled={items.length === minItems}
          >
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      ))}
      <Button
        type="button"
        onClick={handleAdd}
        variant="outlined"
        size="small"
        startIcon={<Plus className="size-4" />}
      >
        Ajouter
      </Button>
    </div>
  );
};

// Composant pour l'upload d'image
interface ImageUploadProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  imageUrl,
  onImageChange,
  onUpload,
  uploading,

  label = 'Image',
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-ink-700 mb-2">{label}</label>

      {imageUrl && (
        <Box className="mb-3">
          <img
            src={imageUrl}
            alt="Aperçu"
            className="w-full h-48 object-cover rounded-lg border border-ink-300"
            onError={() => onImageChange('')}
          />
        </Box>
      )}

      <Box className="mb-3">
        <input
          ref={fileInputRef}
          id="image-upload-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="contained"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          size="small"
        >
          {uploading ? '⏳ Upload en cours...' : '📁 Sélectionner une image'}
        </Button>
        <p className="text-xs text-ink-500 mt-2">Formats acceptés: JPG, PNG, GIF, WebP (max 5MB)</p>
      </Box>

      <input
        type="hidden"
        id="image"
        value={imageUrl}
        onChange={(e) => onImageChange(e.target.value)}
      />
    </div>
  );
};

// Composant pour un champ checkbox
interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={label.toLowerCase().replace(/\s+/g, '-')}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-brand-600 rounded focus:ring-2 focus:ring-brand-500"
      />
      <label
        htmlFor={label.toLowerCase().replace(/\s+/g, '-')}
        className="text-sm font-medium text-ink-700 cursor-pointer"
      >
        {label}
      </label>
    </div>
  );
};
