'use client';
import React, { forwardRef } from 'react';

// Use a single props interface that covers both input and textarea use-cases.
// We pick the common HTML attributes and add our own, avoiding the
// "cannot simultaneously extend" conflict between InputHTMLAttributes and
// TextareaHTMLAttributes (they disagree on autocomplete types).
interface InputProps {
  label: string;
  name?: string;
  id?: string;
  type?: string;
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  accept?: string;
  autoComplete?: string;
  error?: string;
  className?: string;
  /** When true, renders a <textarea> instead of <input> */
  multiline?: boolean;
  /** Number of visible text rows (textarea only) */
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const baseClasses =
  'w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-md px-3 py-2 text-white ' +
  'placeholder-gray-500 focus:outline-none focus:border-[#6366F1] focus:ring-1 ' +
  'focus:ring-[#6366F1] transition-colors text-sm resize-none';

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, multiline, className = '', rows = 4, ...rest }, ref) => {
    const errorClasses = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '';
    const combinedClass = `${baseClasses} ${errorClasses} ${className}`;

    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>

        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            rows={rows}
            className={combinedClass}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={combinedClass}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
