'use client';
// EmailList — full email list panel with search bar, filter/refresh icons.
// Clicking a row opens EmailDetailView.
import React, { useState } from 'react';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useScheduledEmails, useSentEmails, useSearchEmails } from '@/hooks/useEmails';
import { EmailListItem } from './EmailListItem';
import { EmailDetailView } from './EmailDetailView';
import { EmailJob } from '@/types';

type Tab = 'scheduled' | 'sent';

interface EmailListProps {
  tab: Tab;
}

export function EmailList({ tab }: EmailListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page] = useState(1);
  const [selected, setSelected] = useState<EmailJob | null>(null);

  const { data: scheduledData, isLoading: scheduledLoading, mutate: mutateScheduled } = useScheduledEmails(page, 20);
  const { data: sentData, isLoading: sentLoading, mutate: mutateSent } = useSentEmails(page, 20);
  const { data: searchResults, isLoading: searchLoading } = useSearchEmails(searchQuery);

  const isLoading = searchQuery ? searchLoading : (tab === 'scheduled' ? scheduledLoading : sentLoading);

  const emails: EmailJob[] = searchQuery
    ? (searchResults ?? [])
    : tab === 'scheduled'
    ? (scheduledData?.data ?? [])
    : (sentData?.data ?? []);

  const refresh = () => { mutateScheduled(); mutateSent(); };

  // If an email is selected, show detail view instead of list
  if (selected) {
    return (
      <EmailDetailView
        job={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-screen">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
          />
        </div>
        <button onClick={() => {}} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Filter">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <button onClick={refresh} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors" title="Refresh">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && emails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <div className="text-sm">
              {searchQuery ? 'No results found' : tab === 'scheduled' ? 'No scheduled emails' : 'No sent emails'}
            </div>
          </div>
        )}

        {!isLoading && emails.map((job) => (
          <EmailListItem
            key={job.id}
            job={job}
            onClick={() => setSelected(job)}
          />
        ))}
      </div>
    </div>
  );
}
