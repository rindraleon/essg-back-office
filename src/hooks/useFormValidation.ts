import { useState, useCallback } from 'react';

export interface ValidationRule<T> {
  validate: (value: T, formData: Record<string, unknown>) => string | undefined;
}

export interface FieldConfig<T> {
  rules?: ValidationRule<T>[];
  required?: boolean;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { regex: RegExp; message: string };
  custom?: (value: T, formData: Record<string, unknown>) => string | undefined;
}

export type FieldValidators<T> = {
  [K in keyof T]?: FieldConfig<T[K]>;
};

export interface UseFormValidationOptions<T> {
  defaultValues: T;
  validators: FieldValidators<T>;
  stepFields?: Record<number, (keyof T)[]>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn<T> {
  formData: T;
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  activeStep: number;
  setActiveStep: (step: number | ((prev: number) => number)) => void;
  handleChange: (field: keyof T, value: unknown) => void;
  handleChanges: (patch: Partial<T>) => void;
  handleBlur: (field: keyof T) => void;
  validateField: (field: keyof T) => string | undefined;
  validateStep: (step: number) => boolean;
  validateAllSteps: () => boolean;
  setFormData: (data: T | ((prev: T) => T)) => void;
  resetForm: () => void;
}

function computeFieldError<T extends Record<string, unknown> | object>(
  field: keyof T,
  data: T,
  validators: FieldValidators<T>
): string | undefined {
  const config = validators[field];
  if (!config) return undefined;

  const value = data[field];
  const fieldName = String(field);

  if (config.required) {
    if (value === undefined || value === null || value === '') {
      return `Le champ ${fieldName} est requis`;
    }
    if (typeof value === 'string' && !value.trim()) {
      return `Le champ ${fieldName} est requis`;
    }
  }

  if (!config.required && (value === undefined || value === null || value === '')) {
    return undefined;
  }

  if (config.minLength && typeof value === 'string') {
    if (value.length < config.minLength.value) {
      return config.minLength.message;
    }
  }

  if (config.maxLength && typeof value === 'string') {
    if (value.length > config.maxLength.value) {
      return config.maxLength.message;
    }
  }

  if (config.pattern && typeof value === 'string') {
    if (!config.pattern.regex.test(value)) {
      return config.pattern.message;
    }
  }

  const asRecord = data as unknown as Record<string, unknown>;

  if (config.custom) {
    return config.custom(value as T[keyof T], asRecord);
  }

  if (config.rules) {
    for (const rule of config.rules) {
      const error = rule.validate(value as T[keyof T], asRecord);
      if (error) return error;
    }
  }

  return undefined;
}

export function useFormValidation<T extends object>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> {
  const {
    defaultValues,
    validators,
    stepFields = {},
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [formData, setFormDataState] = useState<T>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [activeStep, setActiveStep] = useState(0);

  const applyChangeErrors = useCallback(
    (next: T, fields: (keyof T)[]) => {
      if (!validateOnChange) return;
      const nextErrors: Record<string, string | undefined> = {};
      let shouldUpdate = false;
      fields.forEach((field) => {
        if (!touched[String(field)]) return;
        shouldUpdate = true;
        nextErrors[String(field)] = computeFieldError(field, next, validators);
      });
      if (shouldUpdate) {
        setErrors((prev) => ({ ...prev, ...nextErrors }));
      }
    },
    [validateOnChange, touched, validators]
  );

  const validateField = useCallback(
    (field: keyof T): string | undefined => computeFieldError(field, formData, validators),
    [formData, validators]
  );

  const validateStep = useCallback(
    (step: number): boolean => {
      const fields = stepFields[step] || [];
      const stepErrors: Record<string, string | undefined> = {};
      const touchedFields: Record<string, boolean> = {};
      let hasError = false;

      fields.forEach((field) => {
        const error = computeFieldError(field, formData, validators);
        if (error) {
          stepErrors[String(field)] = error;
          hasError = true;
        }
        touchedFields[String(field)] = true;
      });

      setTouched((prev) => ({ ...prev, ...touchedFields }));
      setErrors((prev) => {
        const updated = { ...prev };
        fields.forEach((f) => {
          const fieldStr = String(f);
          if (stepErrors[fieldStr]) {
            updated[fieldStr] = stepErrors[fieldStr];
          } else {
            delete updated[fieldStr];
          }
        });
        return updated;
      });

      return !hasError;
    },
    [formData, validators, stepFields]
  );

  const validateAllSteps = useCallback((): boolean => {
    const allErrors: Record<string, string | undefined> = {};
    const allTouched: Record<string, boolean> = {};

    Object.keys(validators).forEach((field) => {
      const key = field as keyof T;
      const error = computeFieldError(key, formData, validators);
      if (error) {
        allErrors[field] = error;
      }
      allTouched[field] = true;
    });

    setTouched(allTouched);
    setErrors(allErrors);

    if (Object.keys(allErrors).length > 0) {
      const steps = Object.keys(stepFields)
        .map(Number)
        .sort((a, b) => a - b);
      for (const step of steps) {
        const fields = stepFields[step] || [];
        if (fields.some((f) => allErrors[String(f)])) {
          setActiveStep(step);
          return false;
        }
      }
      return false;
    }

    return true;
  }, [formData, validators, stepFields]);

  const handleChange = useCallback(
    (field: keyof T, value: unknown) => {
      setFormDataState((prev) => {
        const next = { ...prev, [field]: value } as T;
        applyChangeErrors(next, [field]);
        return next;
      });
    },
    [applyChangeErrors]
  );

  const handleChanges = useCallback(
    (patch: Partial<T>) => {
      setFormDataState((prev) => {
        const next = { ...prev, ...patch };
        applyChangeErrors(next, Object.keys(patch) as (keyof T)[]);
        return next;
      });
    },
    [applyChangeErrors]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      const fieldName = String(field);
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      if (validateOnBlur) {
        const error = computeFieldError(field, formData, validators);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [formData, validators, validateOnBlur]
  );

  // `setFormDataState` accepte déjà une valeur ou une fonction de mise à
  // jour : le test `typeof data === 'function'` était inutile (les deux
  // branches étaient identiques).
  const setFormData = useCallback((data: T | ((prev: T) => T)) => {
    setFormDataState(data);
  }, []);

  const resetForm = useCallback(() => {
    setFormDataState(defaultValues);
    setErrors({});
    setTouched({});
    setActiveStep(0);
  }, [defaultValues]);

  return {
    formData,
    errors,
    touched,
    activeStep,
    setActiveStep,
    handleChange,
    handleChanges,
    handleBlur,
    validateField,
    validateStep,
    validateAllSteps,
    setFormData,
    resetForm,
  };
}

export default useFormValidation;
