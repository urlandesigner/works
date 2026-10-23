import type { ChangeEvent } from 'react';

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function FormField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  placeholder,
  type = 'text',
  required,
  disabled,
  autoFocus,
}: Props) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-400 focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-zinc-200 focus:border-zinc-400 focus:ring-zinc-100'
        }`}
      />
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-1 text-xs text-zinc-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
