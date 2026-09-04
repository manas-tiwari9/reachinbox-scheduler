'use client';
// EmailDetailView — matches Figma email reading pane:
// ← Subject | star/archive/trash/avatar icons
// Sender avatar circle + name + email | date
// Rendered HTML body | attachment thumbnails (Ethereal preview)
import React, { useState } from 'react';
import { ArrowLeft, Star, Archive, Trash2, ChevronDown, ExternalLink } from 'lucide-react';
import { EmailJob } from '@/types';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface EmailDetailViewProps {
  job: EmailJob;
  onBack: () => void;
}

// Generate a deterministic color for a letter avatar
const AVATAR_COLORS = [
  '#16a34a', '#2563eb', '#7c3aed', '#db2777', '#d97706', '#0891b2',
];
function avatarColor(name: string) {
  let n = 0;
  for (const c of name) n += c.charCodeAt(0);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

export function EmailDetailView({ job, onBack }: EmailDetailViewProps) {
  const { user } = useAuth();
  const [showRecipients, setShowRecipients] = useState(false);

  const senderInitial = (job.senderEmail?.[0] ?? 'S').toUpperCase();
  const senderColor = avatarColor(job.senderEmail ?? 'S');

  const sentDate = job.sentAt
    ? format(new Date(job.sentAt), 'MMM d, h:mm aa')
    : job.scheduledAt
    ? format(new Date(job.scheduledAt), 'MMM d, h:mm aa')
    : '';

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        {/* Left: back + subject */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors min-w-0"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <h1 className="text-base font-semibold truncate">{job.subject}</h1>
        </button>

        {/* Right: action icons + avatar */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <button className="p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-gray-100 rounded-md transition-colors">
            <Star className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
            <Archive className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          {/* User avatar */}
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ml-1 overflow-hidden flex-shrink-0"
            style={{ background: avatarColor(user?.name ?? 'U') }}
          >
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              (user?.name?.[0] ?? 'U').toUpperCase()
            )}
          </div>
        </div>
      </div>

      {/* Email body area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-4xl w-full">
        {/* Sender row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {/* Colored letter avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: senderColor }}
            >
              {senderInitial}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900">{job.senderEmail}</span>
                <span className="text-xs text-gray-400">&lt;{job.senderEmail}&gt;</span>
              </div>
              <button
                onClick={() => setShowRecipients(v => !v)}
                className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 mt-0.5 transition-colors"
              >
                to me
                <ChevronDown className={`w-3 h-3 transition-transform ${showRecipients ? 'rotate-180' : ''}`} />
              </button>
              {showRecipients && (
                <div className="mt-1 text-xs text-gray-500 bg-gray-50 rounded-md px-2 py-1">
                  To: {job.recipientEmail}
                </div>
              )}
            </div>
          </div>

          {/* Date */}
          <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{sentDate}</span>
        </div>

        {/* Rendered email body */}
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          style={{ fontSize: '14px' }}
          dangerouslySetInnerHTML={{ __html: job.body ?? '' }}
        />

        {/* Ethereal preview link (acts as attachment) */}
        {job.etherealUrl && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">Attachments</p>
            <a
              href={job.etherealUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Email Preview (Ethereal)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
