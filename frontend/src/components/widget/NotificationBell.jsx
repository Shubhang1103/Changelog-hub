import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const NotificationBell = ({ className = '' }) => {
  const { isAuthenticated } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();

  return (
    <button
      onClick={openDrawer}
      className={`relative rounded-lg p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent ${className}`}
      title={
        isAuthenticated
          ? unreadCount > 0
            ? `${unreadCount} unread product updates`
            : "What's New - Product Updates"
          : "What's New - Recent Updates"
      }
      aria-label="Open product updates notification drawer"
    >
      <Bell className="h-5 w-5" />

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-cat-fixed px-1 text-[10px] font-bold text-paper ring-2 ring-paper">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
