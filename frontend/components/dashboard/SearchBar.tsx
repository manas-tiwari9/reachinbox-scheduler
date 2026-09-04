'use client';

import React, { useState, useEffect } from 'react';
import { useSearchEmails } from '@/hooks/useEmails';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data: searchResults, isLoading } = useSearchEmails(debouncedQuery);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search emails by recipient or subject..."
          className="w-full bg-[#111] border border-[#2A2A2A] rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#6366F1] transition-colors"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isFocused && debouncedQuery && searchResults && searchResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl z-10 max-h-80 overflow-y-auto">
          {searchResults.map((job) => (
            <div key={job.id} className="p-3 border-b border-[#2A2A2A] hover:bg-[#222] transition-colors cursor-pointer last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-white">{job.recipientEmail}</span>
                <Badge status={job.status} />
              </div>
              <p className="text-xs text-gray-400 truncate">{job.subject}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(job.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          ))}
        </div>
      )}

      {isFocused && debouncedQuery && searchResults?.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg shadow-xl z-10 p-4 text-center text-gray-400 text-sm">
          No results found for "{debouncedQuery}"
        </div>
      )}
    </div>
  );
};
