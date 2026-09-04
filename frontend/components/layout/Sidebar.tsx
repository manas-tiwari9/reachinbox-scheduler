'use client';
// Sidebar — matches Figma:
// "ONB" logo, user profile, Compose button, CORE nav items (Scheduled + Sent)
import React from 'react';
import { Clock, Send, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useScheduledEmails, useSentEmails } from '@/hooks/useEmails';

type View = 'scheduled' | 'sent' | 'compose';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const { data: scheduledData } = useScheduledEmails(1, 1);
  const { data: sentData } = useSentEmails(1, 1);

  const scheduledCount = scheduledData?.total ?? 0;
  const sentCount = sentData?.total ?? 0;

  return (
    <aside className="w-[200px] min-h-screen flex flex-col bg-white border-r border-gray-200 flex-shrink-0">
      {/* Logo */}
      <div className="px-4 pt-5 pb-3">
        <span className="text-2xl font-black tracking-tight text-gray-900" style={{ fontFamily: 'monospace' }}>
          ONB
        </span>
      </div>

      {/* User profile */}
      <div className="mx-3 mb-3 flex items-center gap-2 px-2 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-800 truncate">{user?.name ?? 'User'}</div>
          <div className="text-[10px] text-gray-500 truncate">{user?.email ?? ''}</div>
        </div>
        <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
      </div>

      {/* Compose button */}
      <div className="px-3 mb-4">
        <button
          onClick={() => onViewChange('compose')}
          className="w-full py-1.5 rounded-full border border-green-500 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors"
        >
          Compose
        </button>
      </div>

      {/* Nav */}
      <div className="px-3">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 px-2">
          Core
        </div>

        {/* Scheduled */}
        <button
          onClick={() => onViewChange('scheduled')}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
            activeView === 'scheduled'
              ? 'bg-green-50 text-green-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock className={`w-4 h-4 flex-shrink-0 ${activeView === 'scheduled' ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="flex-1 text-left">Scheduled</span>
          {scheduledCount > 0 && (
            <span className={`text-xs font-semibold ${activeView === 'scheduled' ? 'text-green-600' : 'text-gray-400'}`}>
              {scheduledCount}
            </span>
          )}
        </button>

        {/* Sent */}
        <button
          onClick={() => onViewChange('sent')}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'sent'
              ? 'bg-green-50 text-green-700'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Send className={`w-4 h-4 flex-shrink-0 ${activeView === 'sent' ? 'text-green-600' : 'text-gray-400'}`} />
          <span className="flex-1 text-left">Sent</span>
          {sentCount > 0 && (
            <span className={`text-xs font-semibold ${activeView === 'sent' ? 'text-green-600' : 'text-gray-400'}`}>
              {sentCount}
            </span>
          )}
        </button>
      </div>

      {/* Logout at bottom */}
      <div className="mt-auto px-3 pb-8">
        <button
          onClick={logout}
          className="w-full px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg text-left transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
