'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { LogOut, Mail } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#111111] border-b border-[#2A2A2A] flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="bg-[#6366F1] p-1.5 rounded-md">
          <Mail className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg text-white">ReachInbox Scheduler</span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-[#2A2A2A]" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-sm font-medium text-white">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="w-px h-6 bg-[#2A2A2A]"></div>
          <Button variant="secondary" size="sm" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      )}
    </header>
  );
};
