import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope, DollarSign, ListTodo, Shield,
  CheckCircle2, Sparkles, MessageSquare, Check, ChevronDown, Lock, FileQuestion, LogOut, LogIn, Users2, UserCog,
  LayoutDashboard
} from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';
import { NotificationsBell } from './NotificationsBell';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  platformName: string;
  onOpenMembershipModal: () => void;
  onOpenSlackModal: () => void;
  onOpenTeamModal: () => void;
  onOpenEditProfile: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

type Mode = { id: string; label: string; icon: React.ElementType; locked?: boolean };

const DASHBOARD_MODE: Mode = { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard };
const BASE_MODES: Mode[] = [
  { id: 'problems', label: 'Problem Statements', icon: FileQuestion },
  { id: 'funds', label: 'Funds & Grants', icon: DollarSign, locked: true },
  { id: 'tasks', label: 'Task Roadmaps', icon: ListTodo, locked: true },
];
const ADMIN_MODE: Mode = { id: 'admin', label: 'Admin Panel', icon: Shield };

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  platformName,
  onOpenMembershipModal,
  onOpenSlackModal,
  onOpenTeamModal,
  onOpenEditProfile,
  onLoginClick,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setShowModeMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const MODES = currentUser
    ? [DASHBOARD_MODE, ...BASE_MODES, ...(store.isAdmin(currentUser) ? [ADMIN_MODE] : [])]
    : BASE_MODES;
  const currentMode = MODES.find(m => m.id === currentTab) || MODES[0];

  const handleSelectMode = (modeId: string, locked?: boolean) => {
    setShowModeMenu(false);
    if (locked && !currentUser) {
      onLoginClick();
    } else if (locked && !currentUser.is_member) {
      onOpenMembershipModal();
    } else {
      setCurrentTab(modeId);
    }
  };

  const roleTone = !currentUser
    ? { accent: 'bg-[var(--nxt-blue-strong)]', logoBg: 'bg-[var(--nxt-ink-fixed)]', logoText: 'text-[var(--nxt-blue)]' }
    : store.isAdmin(currentUser)
    ? { accent: 'bg-[var(--nxt-lavender-strong)]', logoBg: 'bg-[var(--nxt-lavender-strong)]', logoText: 'text-white' }
    : currentUser.is_member
    ? { accent: 'bg-[var(--nxt-mint-strong)]', logoBg: 'bg-[var(--nxt-ink-fixed)]', logoText: 'text-[var(--nxt-mint)]' }
    : { accent: 'bg-[var(--nxt-peach-deep)]', logoBg: 'bg-[var(--nxt-ink-fixed)]', logoText: 'text-[var(--nxt-peach)]' };

  return (
    <header className="sticky top-0 z-40 bg-[var(--nxt-bg)]/90 backdrop-blur-md border-b border-[var(--nxt-line)]">
      <div className={`h-1 w-full ${roleTone.accent} transition-colors`} />

      <div className="w-full px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="relative" ref={modeMenuRef}>
            <motion.button
              id="btn-logo-mode-switcher"
              onClick={() => setShowModeMenu(!showModeMenu)}
              className="flex items-center gap-2.5 cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${roleTone.logoBg} ${roleTone.logoText}`}>
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-base sm:text-lg text-[var(--nxt-ink)] tracking-tighter">
                    {platformName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--nxt-ink-soft)] transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-[11px] text-[var(--nxt-mint-strong)] font-semibold flex items-center gap-1">
                  <currentMode.icon className="w-3 h-3" />
                  {currentMode.label}
                </p>
              </div>
            </motion.button>

            <AnimatePresence>
              {showModeMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 mt-2 w-72 bg-[var(--nxt-surface)] rounded-2xl shadow-lg border border-[var(--nxt-line)] py-2 z-50"
                >
                  <p className="px-3 pt-1 pb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--nxt-ink-soft)]">
                    Switch Mode
                  </p>
                  {MODES.map(mode => {
                    const isLocked = mode.locked && !(currentUser && currentUser.is_member);
                    const isActive = currentTab === mode.id;
                    return (
                      <button
                        key={mode.id}
                        id={`mode-option-${mode.id}`}
                        onClick={() => handleSelectMode(mode.id, mode.locked)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-[var(--nxt-mint)]/50 text-[var(--nxt-mint-deep)] font-bold'
                            : 'text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] hover:text-[var(--nxt-ink)]'
                        }`}
                      >
                        <mode.icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1 text-left">{mode.label}</span>
                        {isLocked && <Lock className="w-3.5 h-3.5 text-[var(--nxt-peach-deep)]" />}
                        {isActive && <Check className="w-3.5 h-3.5 text-[var(--nxt-mint-strong)]" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              id="btn-slack-invite"
              onClick={onOpenSlackModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] text-xs font-semibold bg-[var(--nxt-surface)] hover:bg-[var(--nxt-bg-soft)] transition-colors shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#E01E5A]" />
              <span className="hidden sm:inline">Join Founder Slack</span>
              <span className="sm:hidden">Slack</span>
            </button>

            {!currentUser ? (
              <motion.button
                id="btn-navbar-login"
                onClick={onLoginClick}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Register</span>
              </motion.button>
            ) : (
              <>
                {currentUser.is_member ? (
                  <div
                    onClick={onOpenMembershipModal}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--nxt-mint)]/60 border border-[var(--nxt-mint-strong)]/30 text-[var(--nxt-mint-strong)] text-xs font-semibold cursor-pointer hover:bg-[var(--nxt-mint)]"
                    title="Active Membership. Click to view membership details"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--nxt-mint-strong)]" />
                    <span>Member</span>
                  </div>
                ) : (
                  <motion.button
                    id="btn-get-membership"
                    onClick={onOpenMembershipModal}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get Membership</span>
                  </motion.button>
                )}

                <NotificationsBell currentUser={currentUser} />

                <div className="relative" ref={userMenuRef}>
                  <button
                    id="btn-user-avatar"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] transition-colors text-left"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      currentUser.role === 'admin' ? 'bg-[var(--nxt-lavender-strong)]' : 'bg-[var(--nxt-mint-strong)]'
                    }`}>
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-semibold text-[var(--nxt-ink)] leading-tight truncate max-w-[110px]">
                        {currentUser.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-[var(--nxt-ink-soft)] leading-tight">
                        {currentUser.role === 'admin' ? 'Admin' : currentUser.is_member ? 'Member' : 'Guest'}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 mt-2 w-64 bg-[var(--nxt-surface)] rounded-2xl shadow-lg border border-[var(--nxt-line)] py-2 z-50"
                      >
                        <div className="px-3 py-2 border-b border-[var(--nxt-line)]">
                          <p className="text-xs font-bold text-[var(--nxt-ink)]">{currentUser.name}</p>
                          <p className="text-xs text-[var(--nxt-ink-soft)] truncate">{currentUser.email}</p>
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]">
                            Role: {currentUser.role.toUpperCase()} • {currentUser.is_member ? 'PAYING MEMBER' : 'UNPAID'}
                          </span>
                        </div>

                        <div className="px-3 py-2 space-y-1">
                          <button
                            onClick={() => { setShowUserMenu(false); onOpenEditProfile(); }}
                            className="w-full text-left px-2.5 py-1.5 rounded-full text-xs text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] font-medium flex items-center gap-1.5"
                          >
                            <UserCog className="w-3.5 h-3.5" />
                            Edit Profile
                          </button>
                          <button
                            onClick={() => { setShowUserMenu(false); onOpenTeamModal(); }}
                            className="w-full text-left px-2.5 py-1.5 rounded-full text-xs text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] font-medium flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5">
                              <Users2 className="w-3.5 h-3.5" />
                              My Team
                            </span>
                            {store.getMyTeam(currentUser) && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]">
                                {store.getMyTeam(currentUser)!.member_ids.length}
                              </span>
                            )}
                          </button>
                        </div>

                        <div className="px-3 pt-2 border-t border-[var(--nxt-line)]">
                          <button
                            onClick={onLogout}
                            className="w-full text-left px-2.5 py-1.5 rounded-full text-xs text-[var(--nxt-peach-deep)] hover:bg-[var(--nxt-peach)] font-semibold flex items-center gap-1.5"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
