import useSWR from 'swr';
import { api } from '@/lib/api';
import { EmailJob, PaginatedResponse } from '@/types';

const fetcher = (url: string) => api.get(url).then(res => res.data);

// Hook for fetching scheduled emails with pagination and 10s auto-refresh
export function useScheduledEmails(page: number = 1, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<EmailJob>>(
    `/api/emails/scheduled?page=${page}&limit=${limit}`,
    fetcher,
    { refreshInterval: 10000 }
  );

  return { data, error, isLoading, mutate };
}

// Hook for fetching sent emails
export function useSentEmails(page: number = 1, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<EmailJob>>(
    `/api/emails/sent?page=${page}&limit=${limit}`,
    fetcher
  );

  return { data, error, isLoading, mutate };
}

// Hook for searching emails
export function useSearchEmails(query: string) {
  const { data, error, isLoading } = useSWR<EmailJob[]>(
    query ? `/api/emails/search?q=${encodeURIComponent(query)}` : null,
    fetcher
  );

  return { data, error, isLoading };
}
