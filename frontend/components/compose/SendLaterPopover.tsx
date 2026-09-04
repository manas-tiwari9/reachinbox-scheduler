'use client';
// SendLaterPopover — matches Figma: white card with "Pick date & time", quick options, Cancel/Done
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { addHours, startOfTomorrow, setHours, setMinutes, format } from 'date-fns';

interface SendLaterPopoverProps {
  onCancel: () => void;
  onDone: (scheduledAt: Date) => void;
  delayMs: number;
  hourlyLimit: number;
}

export function SendLaterPopover({ onCancel, onDone, delayMs, hourlyLimit }: SendLaterPopoverProps) {
  const tomorrow = startOfTomorrow();

  const quickOptions = [
    { label: 'Tomorrow', date: tomorrow },
    { label: 'Tomorrow, 10:00 AM', date: setMinutes(setHours(tomorrow, 10), 0) },
    { label: 'Tomorrow, 11:00 AM', date: setMinutes(setHours(tomorrow, 11), 0) },
    { label: 'Tomorrow, 3:00 PM', date: setMinutes(setHours(tomorrow, 15), 0) },
  ];

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [customDateTime, setCustomDateTime] = useState('');

  const handleDone = () => {
    const date = selectedDate ?? (customDateTime ? new Date(customDateTime) : quickOptions[1].date);
    onDone(date);
  };

  return (
    <div
      className="absolute right-0 top-14 z-50 w-56 bg-white rounded-xl shadow-lg border border-gray-200 p-4"
      style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
    >
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Send Later</h3>

      {/* Date picker input */}
      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5 mb-3">
        <input
          type="datetime-local"
          value={customDateTime}
          onChange={e => { setCustomDateTime(e.target.value); setSelectedDate(null); }}
          className="flex-1 text-xs text-gray-500 outline-none bg-transparent"
          placeholder="Pick date & time"
        />
        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
      </div>

      {/* Quick options */}
      <div className="space-y-0.5 mb-4">
        {quickOptions.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => { setSelectedDate(opt.date); setCustomDateTime(''); }}
            className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-colors ${
              selectedDate?.getTime() === opt.date.getTime()
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDone}
          className="px-3 py-1 text-xs text-green-600 border border-green-500 rounded-full hover:bg-green-50 transition-colors font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );
}
