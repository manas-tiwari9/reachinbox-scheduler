import useSWR from 'swr';
import { api } from '@/lib/api';
import { User } from '@/types';

// /api/auth/me returns { user: User } — unwrap the nested object
const fetcher = (url: string) => api.get(url).then(res => res.data.user);

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<User>('/api/auth/me', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,  // Don't re-fetch on every tab focus
  });

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('token');
      mutate(undefined, false); // Clear local SWR cache
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return {
    user: data,
    isLoading,
    isError: error,
    logout,
  };
}
