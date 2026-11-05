import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle,
  XCircle,
  UserCheck,
  BookOpen
} from 'lucide-react';
import { NotificationItem } from '../lib/types';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick?: (notification: NotificationItem) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll,
  onNotificationClick,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => (filterMode === 'unread' ? !n.isRead : true));
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatRelativeTime = (isoString: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'APPLICATION_ACCEPTED':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'APPLICATION_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'APPLICATION_RECEIVED':
        return <UserCheck className="w-4 h-4 text-blue-400" />;
      case 'POST_APPROVED':
        return <BookOpen className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-[#0B0F19]/95 backdrop-blur-xl border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Panel Header */}
      <div className="p-4 border-b border-blue-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-600 text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Real-time alerts for posts &amp; applicants</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Mark All as Read Subbar */}
      <div className="px-4 py-2 bg-[#111827]/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('unread')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              filterMode === 'unread'
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-1">
            <Bell className="w-8 h-8 mx-auto text-slate-700" />
            <p className="text-xs font-semibold text-slate-400">No notifications here</p>
            <p className="text-[10px]">You are completely caught up!</p>
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              onClick={() => {
                if (!item.isRead) onMarkAsRead(item.id);
                if (onNotificationClick) onNotificationClick(item);
              }}
              className={`p-3.5 hover:bg-[#111827]/80 transition-colors cursor-pointer flex items-start gap-3 relative group ${
                !item.isRead ? 'bg-blue-950/20' : ''
              }`}
            >
              <div className="p-2 rounded-xl bg-[#070A12] border border-slate-800 shrink-0 mt-0.5">
                {getNotificationIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-semibold truncate ${!item.isRead ? 'text-white' : 'text-slate-300'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed mt-0.5 line-clamp-2">
                  {item.message}
                </p>

                {item.linkText && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-blue-400 font-medium mt-1">
                    <span>{item.linkText}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              {/* Action buttons on hover */}
              <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {!item.isRead && (
                  <button
                    type="button"
                    title="Mark as read"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(item.id);
                    }}
                    className="p-1 rounded-lg hover:bg-slate-800 text-blue-400"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  title="Delete notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNotification(item.id);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {!item.isRead && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute left-1 top-4" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Panel Footer */}
      {notifications.length > 0 && (
        <div className="p-2.5 bg-[#0B0F19] border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-slate-400 hover:text-rose-400 font-mono transition-colors"
          >
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};
