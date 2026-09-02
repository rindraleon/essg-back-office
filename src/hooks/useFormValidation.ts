import { useState, useCallback } from 'react';
import { VALIDATION_MESSAGES } from '@/constants/validation.constants';

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

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function validateRequiredField(value: unknown): string | undefined {
  if (isEmptyValue(value) || (typeof value === 'string' && !value.trim())) {
    return VALIDATION_MESSAGES.required;
  }
  return undefined;
}

function validateLength(value: unknown, config: FieldConfig<unknown>): string | undefined {
  if (typeof value !== 'string') return undefined;
  if (config.minLength && value.length < config.minLength.value) {
    return config.minLength.message;
  }
  if (config.maxLength && value.length > config.maxLength.value) {
    return config.maxLength.message;
  }
  return undefined;
}

function validatePattern(value: unknown, config: FieldConfig<unknown>): string | undefined {
  if (config.pattern && typeof value === 'string' && !config.pattern.regex.test(value)) {
    return config.pattern.message;
  }
  return undefined;
}

function validateCustomRules<T extends Record<string, unknown> | object>(
  value: unknown,
  data: T,
  config: FieldConfig<unknown>
): string | undefined {
  const asRecord = data as unknown as Record<string, unknown>;
  if (config.custom) return config.custom(value, asRecord);
  for (const rule of config.rules ?? []) {
    const error = rule.validate(value, asRecord);
    if (error) return error;
  }
  return undefined;
}

function computeFieldError<T extends Record<string, unknown> | object>(
  field: keyof T,
  data: T,
  validators: FieldValidators<T>
): string | undefined {
  const config = validators[field];
  if (!config) return undefined;

  const value = data[field];

  // 1. Obligatoire d'abord — mais sans court-circuiter les autres règles
  //    quand le champ est renseigné (pattern/longueur doivent s'appliquer).
  if (config.required) {
    const requiredError = validateRequiredField(value);
    if (requiredError) return requiredError;
  }

  // 2. Champ facultatif vide : pas d'autre contrôle.
  if (isEmptyValue(value)) return undefined;

  // 3. Longueurs, motifs et règles personnalisées.
  return (
    validateLength(value, config as FieldConfig<unknown>) ??
    validatePattern(value, config as FieldConfig<unknown>) ??
    validateCustomRules(value, data, config as FieldConfig<unknown>)
  );
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

  const [formData, setFormData] = useState<T>(defaultValues);
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
      setFormData((prev) => {
        const next = { ...prev, [field]: value } as T;
        applyChangeErrors(next, [field]);
        return next;
      });
    },
    [applyChangeErrors]
  );

  const handleChanges = useCallback(
    (patch: Partial<T>) => {
      setFormData((prev) => {
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

  const resetForm = useCallback(() => {
    setFormData(defaultValues);
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
