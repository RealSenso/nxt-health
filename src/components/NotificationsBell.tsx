import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, CheckCheck, DollarSign, FileCheck, Users } from 'lucide-react';
import { AppNotification, User } from '../types';
import { store } from '../services/store';

interface NotificationsBellProps {
  currentUser: User;
}

const ICONS: Record<AppNotification['type'], React.ElementType> = {
  application_status: DollarSign,
  submission_review: FileCheck,
  team_invite: Users,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationsBell: React.FC<NotificationsBellProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = store.getNotifications(currentUser.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        id="btn-notifications-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--nxt-peach-deep)] text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 mt-2 w-80 max-h-[70vh] overflow-y-auto bg-[var(--nxt-surface)] rounded-2xl shadow-lg border border-[var(--nxt-line)] py-2 z-50"
            >
              <div className="flex items-center justify-between px-3 pt-1 pb-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--nxt-ink-soft)]">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => store.markAllNotificationsRead(currentUser.id)}
                    className="text-[11px] font-semibold text-[var(--nxt-mint-strong)] hover:text-[var(--nxt-mint-deep)] flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-[var(--nxt-ink-soft)] px-3 py-6 text-center">
                  Nothing yet — you'll see application decisions and reviewer feedback here.
                </p>
              ) : (
                notifications.map(n => {
                  const Icon = ICONS[n.type] || Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => !n.read && store.markNotificationRead(n.id)}
                      className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 transition-colors ${
                        n.read ? 'hover:bg-[var(--nxt-bg-soft)]' : 'bg-[var(--nxt-mint)]/20 hover:bg-[var(--nxt-mint)]/30'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        n.read ? 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]' : 'bg-[var(--nxt-mint-strong)] text-white'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs leading-snug ${n.read ? 'font-medium text-[var(--nxt-ink)]' : 'font-bold text-[var(--nxt-ink)]'}`}>
                            {n.title}
                          </p>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[var(--nxt-mint-strong)] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-[var(--nxt-ink-soft)] mt-1">{timeAgo(n.created_at)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
