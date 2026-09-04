'use client';
// EmailListItem — matches Figma email row design:
// "To: Name" | orange timestamp badge (scheduled) OR green "Sent" badge | Subject - preview | star
import React from 'react';
import { Star } from 'lucide-react';
import { EmailJob } from '@/types';
import { format } from 'date-fns';

interface EmailListItemProps {
  job: EmailJob;
  onClick?: () => void;
}

export function EmailListItem({ job, onClick }: EmailListItemProps) {
  const isScheduled = job.status === 'scheduled' || job.status === 'rate_limited';
  const isSent = job.status === 'sent';

  // Format scheduled time like "Tue 9:15:12 AM"
  const timeLabel = job.scheduledAt
    ? format(new Date(job.scheduledAt), 'EEE h:mm:ss aa')
    : '';

  // Strip HTML from body for preview
  const preview = job.body
    ? job.body.replace(/<[^>]+>/g, '').slice(0, 60)
    : '';

  // Recipient name = email or just truncate the email
  const recipientName = job.recipientEmail.split('@')[0];

  return (
    <div
      onClick={onClick}
      className="flex items-center px-6 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group transition-colors"
    >
      {/* Left: To + badge + subject + preview */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Recipient */}
        <span className="text-sm font-medium text-gray-800 w-36 flex-shrink-0 truncate">
          To: <span className="capitalize">{recipientName}</span>
        </span>

        {/* Badge */}
        {isScheduled && timeLabel ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200 flex-shrink-0">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            {timeLabel}
          </span>
        ) : isSent ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200 flex-shrink-0">
            Sent
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-red-200 flex-shrink-0">
            Failed
          </span>
        )}

        {/* Subject + preview */}
        <div className="flex-1 min-w-0 flex items-center gap-1 truncate">
          <span className="text-sm text-gray-800 font-medium truncate">{job.subject}</span>
          {preview && (
            <span className="text-sm text-gray-400 truncate">
              &nbsp;—&nbsp;{preview}
            </span>
          )}
        </div>
      </div>

      {/* Right: Star */}
      <button className="opacity-0 group-hover:opacity-100 p-1 ml-2 text-gray-300 hover:text-yellow-400 transition-all">
        <Star className="w-4 h-4" />
      </button>
    </div>
  );
}
