import React from 'react';

interface BadgeProps {
  status: 'scheduled' | 'sent' | 'failed' | 'rate_limited';
}

// Displays email job status with proper colors
export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const statusStyles = {
    scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    sent: 'bg-green-500/10 text-green-500 border-green-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    rate_limited: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  const label = status.replace('_', ' ').toUpperCase();

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
      {label}
    </span>
  );
};
