'use client';
// EmailChipsInput — matches Figma compose "To" field:
// Green pill chips for each added email, +N overflow badge, text input to add more
import React, { useState, useRef, KeyboardEvent } from 'react';

interface EmailChipsInputProps {
  value: string[];            // list of already-added emails
  onChange: (emails: string[]) => void;
  placeholder?: string;
}

const MAX_VISIBLE = 3; // show max 3 chips, then "+N"

export function EmailChipsInput({ value, onChange, placeholder = 'recipient@example.com' }: EmailChipsInputProps) {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addEmail = (raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    if (!email.includes('@')) return;
    if (value.includes(email)) { setInputText(''); return; }
    onChange([...value, email]);
    setInputText('');
  };

  const removeEmail = (email: string) => {
    onChange(value.filter(e => e !== email));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addEmail(inputText);
    } else if (e.key === 'Backspace' && !inputText && value.length > 0) {
      removeEmail(value[value.length - 1]);
    }
  };

  const visibleChips = value.slice(0, MAX_VISIBLE);
  const overflow = value.length - MAX_VISIBLE;

  return (
    <div
      className="flex items-center flex-wrap gap-1.5 flex-1 min-w-0 cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Visible chips */}
      {visibleChips.map(email => (
        <span
          key={email}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-green-400 text-xs text-green-700 bg-white"
        >
          {email}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); removeEmail(email); }}
            className="ml-0.5 text-green-500 hover:text-green-700 leading-none"
          >
            ×
          </button>
        </span>
      ))}

      {/* +N overflow badge */}
      {overflow > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-green-400 text-xs text-green-700 bg-white">
          +{overflow}
        </span>
      )}

      {/* Text input */}
      <input
        ref={inputRef}
        type="email"
        value={inputText}
        onChange={e => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addEmail(inputText)}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] text-sm text-gray-700 placeholder-gray-300 outline-none bg-transparent"
      />
    </div>
  );
}
