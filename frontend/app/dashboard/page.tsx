'use client';
// Dashboard — matches Figma layout:
// Dark outer frame | white inner panel | left sidebar | right email list or compose view
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/layout/Sidebar';
import { EmailList } from '@/components/dashboard/EmailList';
import { ComposePage } from '@/components/compose/ComposePage';

type View = 'scheduled' | 'sent' | 'compose';

export default function DashboardPage() {
  const { user, isLoading, mutate } = useAuth();
  const router = useRouter();
  const [view, setView] = useState<View>('scheduled');

  useEffect(() => {
    // Check if token was passed in query parameter from Google OAuth callback
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        localStorage.setItem('token', token);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        if (mutate) mutate();
        return;
      }
    }

    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router, mutate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    // Outer dark frame (matches Figma outer bg)
    <div className="min-h-screen bg-[#1c1c1c] flex items-start justify-center p-0">
      {/* Inner white panel — full width */}
      <div className="flex w-full min-h-screen bg-white">
        {/* Left sidebar */}
        <Sidebar
          activeView={view}
          onViewChange={(v) => setView(v as View)}
        />

        {/* Right content area */}
        {view === 'compose' ? (
          <ComposePage onBack={() => setView('scheduled')} />
        ) : (
          <EmailList tab={view} />
        )}
      </div>
    </div>
  );
}
