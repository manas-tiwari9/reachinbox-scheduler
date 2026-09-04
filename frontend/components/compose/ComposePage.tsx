'use client';
// ComposePage — matches Figma full-page compose view:
// ← Compose New Email | paperclip, clock, Send/Send Later button
// From (dropdown) | To (chips + Upload List) | Subject | Delay/Hourly | Rich text editor
import React, { useState, useRef } from 'react';
import { ArrowLeft, Paperclip, Clock, Upload } from 'lucide-react';
import { api } from '@/lib/api';
import { RichTextEditor } from '@/components/compose/RichTextEditor';
import { SendLaterPopover } from '@/components/compose/SendLaterPopover';
import { EmailChipsInput } from '@/components/compose/EmailChipsInput';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface ComposePageProps {
  onBack: () => void;
}

export function ComposePage({ onBack }: ComposePageProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [toEmails, setToEmails] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [delayBetween, setDelayBetween] = useState('00');
  const [hourlyLimit, setHourlyLimit] = useState('00');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [showSendLater, setShowSendLater] = useState(false);
  const [sending, setSending] = useState(false);

  const senderEmail = user?.email ?? '';

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCsvFile(file); }
  };

  const handleSendLaterDone = (date: Date) => {
    setScheduledAt(date);
    setShowSendLater(false);
  };

  const handleSend = async () => {
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    if (!body.trim() || body === '<p></p>') { toast.error('Body is required'); return; }
    if (toEmails.length === 0 && !csvFile) { toast.error('Add at least one recipient or upload a CSV'); return; }

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('body', body);
      formData.append('senderEmail', senderEmail);
      formData.append('startTime', (scheduledAt ?? new Date()).toISOString());
      formData.append('delayBetweenMs', String(parseInt(delayBetween) * 1000 || 2000));
      formData.append('hourlyLimit', String(parseInt(hourlyLimit) || 100));

      if (csvFile) {
        formData.append('csv', csvFile);
      } else {
        formData.append('recipients', JSON.stringify(toEmails));
      }

      const res = await api.post('/api/emails/schedule', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`✅ Scheduled ${res.data.scheduled} email(s)!`);
      onBack();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to schedule';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen relative">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-base font-semibold">Compose New Email</span>
        </button>

        <div className="flex items-center gap-3 relative">
          {/* Attachment (paperclip with CSV count badge) */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Attach CSV"
          >
            <Paperclip className="w-4 h-4" />
            {csvFile && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                1
              </span>
            )}
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />

          {/* Schedule clock */}
          <button
            type="button"
            onClick={() => setShowSendLater(v => !v)}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Schedule send time"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Send / Send Later */}
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-1.5 text-sm font-medium text-green-600 border border-green-500 rounded-full hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {sending ? 'Sending…' : scheduledAt ? 'Send Later' : 'Send'}
          </button>

          {/* Send Later popover */}
          {showSendLater && (
            <SendLaterPopover
              onCancel={() => setShowSendLater(false)}
              onDone={handleSendLaterDone}
              delayMs={parseInt(delayBetween) * 1000 || 2000}
              hourlyLimit={parseInt(hourlyLimit) || 100}
            />
          )}
        </div>
      </div>

      {/* ── Form ── */}
      <div className="flex-1 flex flex-col px-12 py-1 max-w-4xl w-full">

        {/* From */}
        <div className="flex items-center border-b border-gray-100 py-3">
          <span className="text-sm text-gray-500 w-16 flex-shrink-0">From</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-md">
            <span className="text-sm text-gray-700">{senderEmail || 'your@email.com'}</span>
            <svg className="w-3 h-3 text-gray-400" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L2 4h8L6 8z" />
            </svg>
          </div>
        </div>

        {/* To — email chips + Upload List */}
        <div className="flex items-center border-b border-gray-100 py-2.5">
          <span className="text-sm text-gray-500 w-16 flex-shrink-0">To</span>
          <EmailChipsInput value={toEmails} onChange={setToEmails} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium ml-4 flex-shrink-0"
          >
            <Upload className="w-3 h-3" />
            {csvFile ? csvFile.name.slice(0, 12) + (csvFile.name.length > 12 ? '…' : '') : 'Upload List'}
          </button>
        </div>

        {/* Subject */}
        <div className="flex items-center border-b border-gray-100 py-3">
          <span className="text-sm text-gray-500 w-16 flex-shrink-0">Subject</span>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            className="flex-1 text-sm text-gray-700 placeholder-gray-300 outline-none bg-transparent"
          />
        </div>

        {/* Delay + Hourly Limit */}
        <div className="flex items-center gap-8 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Delay between 2 emails</span>
            <input
              type="number"
              min="0"
              value={delayBetween}
              onChange={e => setDelayBetween(e.target.value)}
              className="w-14 text-center text-sm border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:border-green-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Hourly Limit</span>
            <input
              type="number"
              min="1"
              value={hourlyLimit}
              onChange={e => setHourlyLimit(e.target.value)}
              className="w-14 text-center text-sm border border-gray-200 rounded px-1.5 py-0.5 outline-none focus:border-green-400"
            />
          </div>
        </div>

        {/* Rich text editor */}
        <div className="flex-1 mt-3 flex flex-col" style={{ minHeight: '320px' }}>
          <RichTextEditor value={body} onChange={setBody} />
        </div>
      </div>
    </div>
  );
}
