import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { store, PLATFORM_NAME } from './services/store';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { ProblemStatementsList } from './components/ProblemStatementsList';
import { FundsPage } from './components/FundsPage';
import { TaskManagementPage } from './components/TaskManagementPage';
import { AdminPanel } from './components/AdminPanel';
import { MembershipModal } from './components/MembershipModal';
import { SlackModal } from './components/SlackModal';
import { TeamModal } from './components/TeamModal';
import { EditProfileModal } from './components/EditProfileModal';
import { FounderDashboard } from './components/FounderDashboard';
import { ResourcesPage } from './components/ResourcesPage';
import { AppNotification } from './types';
import { SegmentedTabs } from './components/ui/PageHeader';
import { ListTodo, BookMarked, Stethoscope } from 'lucide-react';

export default function App() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const isAuthenticated = store.isAuthenticated();
  const currentUser = isAuthenticated ? store.getCurrentUser() : null;

  const [publicView, setPublicView] = useState<'home' | 'login' | 'app'>('home');
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'problems' | 'funds' | 'tasks' | 'resources' | 'admin'>('problems');
  const [roadmapProblemId, setRoadmapProblemId] = useState<string | undefined>(undefined);
  const [resourceStepId, setResourceStepId] = useState<string | undefined>(undefined);

  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  useEffect(() => {
    if (currentTab === 'admin' && (!currentUser || !store.isAdmin(currentUser))) {
      setCurrentTab('problems');
    }
    if (currentTab === 'dashboard' && !currentUser) {
      setCurrentTab('problems');
    }
  }, [currentTab, currentUser]);

  const wasAuthenticated = useRef(isAuthenticated);
  useEffect(() => {
    if (!wasAuthenticated.current && isAuthenticated) {
      setCurrentTab('problems');
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const seenNotificationIds = useRef<Set<string> | null>(null);
  const currentUserId = currentUser?.id ?? null;
  useEffect(() => {
    if (currentUserId) store.touchActivity(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [currentTab]);

  useEffect(() => {
    if (!currentUserId) {
      seenNotificationIds.current = null;
      return;
    }
    const latest = store.getNotifications(currentUserId);
    if (seenNotificationIds.current === null) {
      seenNotificationIds.current = new Set(latest.map(n => n.id));
      return;
    }
    const fresh = latest.filter(n => !seenNotificationIds.current!.has(n.id));
    if (fresh.length > 0) {
      fresh.forEach(n => seenNotificationIds.current!.add(n.id));
      setToasts(prev => [...fresh, ...prev].slice(0, 3));
      fresh.forEach(n => {
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== n.id)), 6000);
      });
    }
  }, [currentUserId, tick]);

  const handleNavigateToRoadmap = (problemId?: string) => {
    setRoadmapProblemId(problemId);
    setCurrentTab('tasks');
  };

  if (!isAuthenticated && publicView === 'home') {
    return (
      <HomePage
        onGetStarted={() => setPublicView('login')}
        onBrowseProblems={() => setPublicView('app')}
      />
    );
  }

  if (!isAuthenticated && publicView === 'login') {
    return <LoginPage onBack={() => setPublicView('home')} />;
  }

  return (
    <div className="min-h-screen bg-[var(--nxt-bg)] text-[var(--nxt-ink)] flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'funds' && !(currentUser && currentUser.is_member)) {
            if (!currentUser) setPublicView('login');
            else setIsMembershipModalOpen(true);
          } else {
            if (tab === 'resources') setResourceStepId(undefined);
            setCurrentTab(tab as any);
          }
        }}
        currentUser={currentUser}
        platformName={PLATFORM_NAME}
        onOpenMembershipModal={() => setIsMembershipModalOpen(true)}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
        onLoginClick={() => setPublicView('login')}
        onLogout={() => { store.logout(); setPublicView('home'); }}
      />

      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--nxt-surface)] rounded-2xl shadow-lg border border-[var(--nxt-line)] p-3.5 flex items-start gap-2.5"
            >
              <span className="w-7 h-7 rounded-full bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center shrink-0">
                <Bell className="w-3.5 h-3.5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--nxt-ink)] leading-snug">{t.title}</p>
                <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-0.5 line-clamp-2">{t.message}</p>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 md:pb-10">
        {(currentTab === 'tasks' || currentTab === 'resources') && (
          <div className="mb-5">
            <SegmentedTabs
              tabs={[{ id: 'tasks', label: 'Roadmaps', icon: ListTodo }, { id: 'resources', label: 'Resources', icon: BookMarked }]}
              active={currentTab}
              onChange={(tab) => { if (tab === 'resources') setResourceStepId(undefined); setCurrentTab(tab as 'tasks' | 'resources'); }}
            />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {currentTab === 'dashboard' && currentUser && (
              <FounderDashboard
                currentUser={currentUser}
                onNavigateToProblems={() => setCurrentTab('problems')}
                onNavigateToFunds={() => setCurrentTab('funds')}
                onNavigateToRoadmap={(problemId) => {
                  if (!currentUser.is_member) {
                    setIsMembershipModalOpen(true);
                  } else {
                    handleNavigateToRoadmap(problemId);
                  }
                }}
                onOpenTeamModal={() => setIsTeamModalOpen(true)}
                onOpenSlackModal={() => setIsSlackModalOpen(true)}
                onOpenEditProfile={() => setIsEditProfileModalOpen(true)}
              />
            )}

            {currentTab === 'problems' && (
              <ProblemStatementsList
                currentUser={currentUser}
                onNavigateToRoadmap={handleNavigateToRoadmap}
                onNavigateToFunds={() => setCurrentTab('funds')}
                onOpenMembershipModal={() => setIsMembershipModalOpen(true)}
                onOpenLogin={() => setPublicView('login')}
                onOpenAdminPanel={() => setCurrentTab('admin')}
              />
            )}

            {currentTab === 'funds' && currentUser && (
              <FundsPage
                currentUser={currentUser}
                onNavigateToRoadmap={handleNavigateToRoadmap}
                onNavigateToProblems={() => setCurrentTab('problems')}
              />
            )}

            {currentTab === 'tasks' && (
              <TaskManagementPage
                currentUser={currentUser}
                initialProblemId={roadmapProblemId}
                onOpenLogin={() => setPublicView('login')}
                onOpenMembershipModal={() => setIsMembershipModalOpen(true)}
                onViewResources={(stepId) => { setResourceStepId(stepId); setCurrentTab('resources'); }}
              />
            )}

            {currentTab === 'resources' && (
              <ResourcesPage
                currentUser={currentUser}
                initialStepId={resourceStepId}
                onOpenLogin={() => setPublicView('login')}
                onOpenMembershipModal={() => setIsMembershipModalOpen(true)}
              />
            )}

            {currentTab === 'admin' && currentUser && store.isAdmin(currentUser) && (
              <AdminPanel
                currentUser={currentUser}
                onNavigateToTab={(tab) => setCurrentTab(tab as any)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="hidden md:block border-t border-[var(--nxt-line)] bg-[var(--nxt-surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </span>
            <div>
              <p className="font-display font-bold text-[var(--nxt-ink)] text-sm">{PLATFORM_NAME}</p>
              <p className="text-xs text-[var(--nxt-ink-soft)]">From clinical problem to hospital pilot.</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-[var(--nxt-ink-soft)]">
            <button onClick={() => setIsSlackModalOpen(true)} className="hover:text-[var(--nxt-ink)] transition-colors">
              Founder Slack
            </button>
            {currentUser ? (
              <button onClick={() => setIsMembershipModalOpen(true)} className="hover:text-[var(--nxt-ink)] transition-colors">
                Membership: <span className="font-semibold text-[var(--nxt-ink)]">{currentUser.is_member ? 'Active' : 'Inactive'}</span>
              </button>
            ) : (
              <button onClick={() => setPublicView('login')} className="font-semibold text-[var(--nxt-mint-strong)] hover:underline">
                Log in / Register
              </button>
            )}
          </div>
        </div>
      </footer>

      {currentUser && (
        <MembershipModal
          isOpen={isMembershipModalOpen}
          onClose={() => setIsMembershipModalOpen(false)}
          currentUser={currentUser}
          onSuccess={() => {
          }}
        />
      )}

      <SlackModal
        isOpen={isSlackModalOpen}
        onClose={() => setIsSlackModalOpen(false)}
      />

      {currentUser && (
        <TeamModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          currentUser={currentUser}
        />
      )}

      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
