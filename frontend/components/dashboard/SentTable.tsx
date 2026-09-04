'use client';

import React, { useState } from 'react';
import { useSentEmails } from '@/hooks/useEmails';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmailJob } from '@/types';
import { format } from 'date-fns';
import { Inbox, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export const SentTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading } = useSentEmails(page, limit);

  const columns = [
    {
      header: 'Recipient',
      accessor: (job: EmailJob) => <span className="font-medium text-white">{job.recipientEmail}</span>
    },
    {
      header: 'Subject',
      accessor: (job: EmailJob) => <span className="text-gray-300 truncate max-w-[200px] block" title={job.subject}>{job.subject}</span>
    },
    {
      header: 'Sender',
      accessor: (job: EmailJob) => <span className="text-gray-400">{job.senderEmail}</span>
    },
    {
      header: 'Sent At',
      accessor: (job: EmailJob) => <span className="text-gray-300">{job.sentAt ? format(new Date(job.sentAt), 'MMM d, yyyy HH:mm') : '-'}</span>
    },
    {
      header: 'Status',
      accessor: (job: EmailJob) => (
        <div className="flex flex-col gap-1 items-start">
          <Badge status={job.status} />
          {job.errorMessage && <span className="text-xs text-red-400 truncate max-w-[150px]" title={job.errorMessage}>{job.errorMessage}</span>}
        </div>
      )
    },
    {
      header: 'Preview',
      accessor: (job: EmailJob) => job.etherealUrl ? (
        <a 
          href={job.etherealUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-[#6366F1] hover:text-[#4F46E5] inline-flex items-center text-sm font-medium transition-colors"
        >
          View <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      ) : <span className="text-gray-500">-</span>
    }
  ];

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-4">
      <Table 
        columns={columns} 
        data={data?.data || []} 
        isLoading={isLoading} 
        emptyIcon={Inbox}
        emptyMessage="No sent emails yet"
      />
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A]">
          <span className="text-sm text-gray-400">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data?.total || 0)} of {data?.total} entries
          </span>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
