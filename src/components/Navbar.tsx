import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope, DollarSign, ListTodo, Shield,
  CheckCircle2, Sparkles, Lock, FileQuestion, LogOut, LogIn, Users2, UserCog,
  LayoutDashboard, BookMarked, ChevronDown, Sun, Moon, Monitor
} from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';
import { NotificationsBell } from './NotificationsBell';
import { ThemeChoice, applyTheme, getStoredTheme } from '../services/theme';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  platformName: string;
  onOpenMembershipModal: () => void;
  onOpenTeamModal: () => void;
  onOpenEditProfile: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

type Mode = { id: string; label: string; icon: React.ElementType; locked?: boolean; preview?: boolean };

const PROBLEMS_MODE: Mode = { id: 'problems', label: 'Problem Statements', icon: FileQuestion };
const ROADMAP_SUBMODES: Mode[] = [
  { id: 'tasks', label: 'Roadmaps', icon: ListTodo, locked: true, preview: true },
  { id: 'resources', label: 'Resources', icon: BookMarked, locked: true, preview: true },
];
const FUNDS_MODE: Mode = { id: 'funds', label: 'Funds & Grants', icon: DollarSign, locked: true };
const ADMIN_MODE: Mode = { id: 'admin', label: 'Admin Panel', icon: Shield };

const THEME_ICONS: Record<ThemeChoice, React.ElementType> = { system: Monitor, light: Sun, dark: Moon };
const THEME_LABELS: Record<ThemeChoice, string> = { system: 'System', light: 'Light', dark: 'Dark' };
const THEME_NEXT: Record<ThemeChoice, ThemeChoice> = { system: 'light', light: 'dark', dark: 'system' };

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  platformName,
  onOpenMembershipModal,
  onOpenTeamModal,
  onOpenEditProfile,
  onLoginClick,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [showRoadmapMenu, setShowRoadmapMenu] = useState(false);
  const roadmapMenuRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<ThemeChoice>(getStoredTheme);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (roadmapMenuRef.current && !roadmapMenuRef.current.contains(e.target as Node)) {
        setShowRoadmapMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleTheme = () => {
    const next = THEME_NEXT[theme];
    setTheme(next);
    applyTheme(next);
  };
  const ThemeIcon = THEME_ICONS[theme];

  const roadmapActive = currentTab === 'tasks' || currentTab === 'resources';

  const handleSelectMode = (mode: Mode) => {
    if (mode.locked && !mode.preview) {
      if (!currentUser) onLoginClick();
      else onOpenMembershipModal();
      return;
    }
    setCurrentTab(mode.id);
  };

  const handleSelectRoadmapSubmode = (mode: Mode) => {
    setShowRoadmapMenu(false);
    handleSelectMode(mode);
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
      <div className={`h-0.5 w-full ${roleTone.accent} transition-colors`} />

      <div className="w-full px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <button
              id="btn-logo-home"
              onClick={() => setCurrentTab('problems')}
              className="flex items-center gap-2.5 shrink-0"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${roleTone.logoBg} ${roleTone.logoText}`}>
                <Stethoscope className="w-4.5 h-4.5" />
              </div>
              <span className="hidden sm:inline font-display font-black text-base text-[var(--nxt-ink)] tracking-tighter">
                {platformName}
              </span>
            </button>

            <nav className="flex items-center gap-1 min-w-0">
              {[PROBLEMS_MODE].map(mode => {
                const isActive = currentTab === mode.id;
                return (
                  <button
                    key={mode.id}
                    id={`nav-tab-${mode.id}`}
                    onClick={() => handleSelectMode(mode)}
                    title={mode.label}
                    className={`relative shrink-0 flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]'
                        : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]'
                    }`}
                  >
                    <mode.icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{mode.label}</span>
                  </button>
                );
              })}

              <div className="relative shrink-0" ref={roadmapMenuRef}>
                <button
                  id="nav-tab-roadmaps"
                  onClick={() => setShowRoadmapMenu(v => !v)}
                  title="Roadmaps"
                  className={`relative shrink-0 flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    roadmapActive
                      ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]'
                      : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]'
                  }`}
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Roadmaps</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showRoadmapMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showRoadmapMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.14 }}
                      className="absolute left-0 mt-2 w-48 bg-[var(--nxt-surface)] rounded-2xl shadow-lg border border-[var(--nxt-line)] py-1.5 z-50"
                    >
                      {ROADMAP_SUBMODES.map(mode => {
                        const isLocked = mode.locked && !mode.preview && !(currentUser && currentUser.is_member);
                        const isPreviewOnly = mode.preview && !(currentUser && currentUser.is_member);
                        const isActive = currentTab === mode.id;
                        return (
                          <button
                            key={mode.id}
                            id={`nav-tab-${mode.id}`}
                            onClick={() => handleSelectRoadmapSubmode(mode)}
                            className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                              isActive ? 'text-[var(--nxt-mint-deep)]' : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]'
                            }`}
                          >
                            <mode.icon className="w-3.5 h-3.5" />
                            <span className="flex-1">{mode.label}</span>
                            {isLocked && <Lock className="w-3 h-3 opacity-60" />}
                            {isPreviewOnly && !isLocked && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--nxt-peach-deep)]">Preview</span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {[FUNDS_MODE].map(mode => {
                const isLocked = mode.locked && !(currentUser && currentUser.is_member);
                const isActive = currentTab === mode.id;
                return (
                  <button
                    key={mode.id}
                    id={`nav-tab-${mode.id}`}
                    onClick={() => handleSelectMode(mode)}
                    title={mode.label}
                    className={`relative shrink-0 flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]'
                        : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]'
                    }`}
                  >
                    <mode.icon className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{mode.label}</span>
                    {isLocked && <Lock className="w-3 h-3 opacity-60" />}
                  </button>
                );
              })}

              {currentUser && store.isAdmin(currentUser) && (
                <button
                  id={`nav-tab-${ADMIN_MODE.id}`}
                  onClick={() => handleSelectMode(ADMIN_MODE)}
                  title={ADMIN_MODE.label}
                  className={`relative shrink-0 flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentTab === ADMIN_MODE.id
                      ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]'
                      : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)]'
                  }`}
                >
                  <ADMIN_MODE.icon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{ADMIN_MODE.label}</span>
                </button>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!currentUser && <ThemeToggleButton theme={theme} onToggle={handleToggleTheme} />}

            {!currentUser ? (
              <motion.button
                id="btn-navbar-login"
                onClick={onLoginClick}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Register</span>
              </motion.button>
            ) : (
              <>
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
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.14 }}
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
                            onClick={() => { setShowUserMenu(false); setCurrentTab('dashboard'); }}
                            className="w-full text-left px-2.5 py-1.5 rounded-full text-xs text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] font-medium flex items-center gap-1.5"
                          >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Dashboard
                          </button>
                          <button
                            onClick={() => { setShowUserMenu(false); onOpenMembershipModal(); }}
                            className="w-full text-left px-2.5 py-1.5 rounded-full text-xs text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] font-medium flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5">
                              {currentUser.is_member
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--nxt-mint-strong)]" />
                                : <Sparkles className="w-3.5 h-3.5" />}
                              {currentUser.is_member ? 'Membership' : 'Get Membership'}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              currentUser.is_member ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]' : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]'
                            }`}>
                              {currentUser.is_member ? 'Active' : 'Inactive'}
                            </span>
                          </button>
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

                        <div className="px-3 py-2 border-t border-[var(--nxt-line)]">
                          <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wide text-[var(--nxt-ink-soft)]">Settings</p>
                          <button
                            onClick={handleToggleTheme}
                            className="w-full text-left px-2.5 py-1.5 rounded-full text-xs text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] font-medium flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5">
                              <ThemeIcon className="w-3.5 h-3.5" />
                              Theme
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]">
                              {THEME_LABELS[theme]}
                            </span>
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

const ThemeToggleButton: React.FC<{ theme: ThemeChoice; onToggle: () => void }> = ({ theme, onToggle }) => {
  const Icon = THEME_ICONS[theme];
  return (
    <button
      id="btn-theme-toggle"
      onClick={onToggle}
      title={`Theme: ${THEME_LABELS[theme]}`}
      className="w-9 h-9 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] flex items-center justify-center transition-colors shrink-0"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};
