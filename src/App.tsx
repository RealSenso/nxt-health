import React, { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Bell, BookMarked, GraduationCap, ListTodo, MailWarning, Stethoscope, X } from 'lucide-react';
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
import { MessagesPage } from './components/MessagesPage';
import { MentorsPage, MentoringPage } from './components/MentorsPage';
import { PublicFounderPage, PublicTeamPage } from './components/PublicProfilePages';
import { SegmentedTabs } from './components/ui/PageHeader';
import { AppNotification, User } from './types';

const TAB_PATHS: Record<string, string> = {
  problems: '/problems',
  tasks: '/roadmaps',
  resources: '/resources',
  mentors: '/mentors',
  mentoring: '/mentoring',
  funds: '/funds',
  dashboard: '/dashboard',
  messages: '/messages',
  admin: '/admin/funding',
};

function tabForPath(pathname: string): string {
  const first = pathname.split('/')[1] || 'problems';
  return first === 'roadmaps' ? 'tasks' : first;
}

function useStoreVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => store.subscribe(() => setVersion(v => v + 1)), []);
  return version;
}

interface Modals {
  openMembership: () => void;
  openTeam: () => void;
  openEditProfile: () => void;
  openSlack: () => void;
  goToLogin: () => void;
}

export default function App() {
  const version = useStoreVersion();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = store.isAuthenticated();
  const currentUser = isAuthenticated ? store.getCurrentUser() : null;

  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const goToLogin = () => navigate('/login', { state: { from: location.pathname } });
  const modals: Modals = {
    openMembership: () => setIsMembershipModalOpen(true),
    openTeam: () => setIsTeamModalOpen(true),
    openEditProfile: () => setIsEditProfileModalOpen(true),
    openSlack: () => setIsSlackModalOpen(true),
    goToLogin,
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const currentUserId = currentUser?.id ?? null;
  useEffect(() => {
    if (currentUserId) store.touchActivity(currentUserId);
  }, [currentUserId]);

  const { toasts, dismiss } = useToasts(currentUserId, version);

  if (!store.ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nxt-bg)]">
        <div className="flex items-center gap-3 text-[var(--nxt-ink-soft)]">
          <span className="w-10 h-10 rounded-2xl bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center animate-pulse">
            <Stethoscope className="w-5 h-5" />
          </span>
          <span className="text-sm font-semibold">{store.loadError || `Loading ${PLATFORM_NAME}…`}</span>
        </div>
      </div>
    );
  }

  const loginRedirect = (location.state as { from?: string } | null)?.from || '/problems';

  return (
    <>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/problems" replace /> : (
          <HomePage onGetStarted={() => navigate('/signup')} onBrowseProblems={() => navigate('/problems')} />
        )} />
        {(['login', 'signup', 'reset-password'] as const).map(path => (
          <React.Fragment key={path}><Route
            path={`/${path}`}
            element={isAuthenticated ? <Navigate to={loginRedirect} replace /> : (
              <LoginPage
                initialMode={path === 'signup' ? 'signup' : path === 'reset-password' ? 'reset' : 'login'}
                onModeChange={(mode) => navigate(mode === 'signup' ? '/signup' : mode === 'reset' ? '/reset-password' : '/login', { replace: true, state: location.state })}
                onBack={() => navigate('/')}
              />
            )}
          /></React.Fragment>
        ))}

        <Route element={<Shell currentUser={currentUser} modals={modals} />}>
          <Route path="/problems/:problemId?" element={
            <ProblemStatementsList
              currentUser={currentUser}
              onNavigateToRoadmap={(problemId) => navigate(problemId ? `/roadmaps/${problemId}` : '/roadmaps')}
              onNavigateToFunds={() => navigate('/funds')}
              onOpenMembershipModal={modals.openMembership}
              onOpenLogin={goToLogin}
              onOpenAdminPanel={() => navigate('/admin/problems')}
            />
          } />
          {['/roadmaps', '/roadmaps/:problemId', '/roadmaps/:problemId/steps/:stepId'].map(path => (
            <React.Fragment key={path}><Route path={path} element={
              <RoadmapTabs>
                <TaskManagementPage
                  currentUser={currentUser}
                  onOpenLogin={goToLogin}
                  onOpenMembershipModal={modals.openMembership}
                  onViewResources={(stepId) => navigate(`/resources?step=${stepId}`)}
                />
              </RoadmapTabs>
            } /></React.Fragment>
          ))}
          <Route path="/resources/:resourceId?" element={
            <RoadmapTabs>
              <ResourcesPage currentUser={currentUser} onOpenLogin={goToLogin} onOpenMembershipModal={modals.openMembership} />
            </RoadmapTabs>
          } />
          <Route path="/founders/:uid" element={<PublicFounderPage />} />
          <Route path="/teams/:teamId" element={<PublicTeamPage />} />

          <Route element={<RequireAuth currentUser={currentUser} />}>
            <Route path="/dashboard" element={currentUser && (
              <FounderDashboard
                currentUser={currentUser}
                onNavigateToProblems={() => navigate('/problems')}
                onNavigateToFunds={() => navigate('/funds')}
                onNavigateToRoadmap={(problemId) => {
                  if (!currentUser.is_member) modals.openMembership();
                  else navigate(problemId ? `/roadmaps/${problemId}` : '/roadmaps');
                }}
                onOpenTeamModal={modals.openTeam}
                onOpenSlackModal={modals.openSlack}
                onOpenEditProfile={modals.openEditProfile}
              />
            )} />
            <Route path="/messages/:threadId?" element={currentUser && <MessagesPage currentUser={currentUser} />} />
            <Route path="/mentoring" element={currentUser?.is_mentor ? <MentoringPage currentUser={currentUser} /> : <Navigate to="/problems" replace />} />

            <Route element={<RequireMember currentUser={currentUser} onOpenMembership={modals.openMembership} />}>
              <Route path="/funds" element={currentUser && (
                <FundsPage
                  currentUser={currentUser}
                  onNavigateToRoadmap={(problemId) => navigate(problemId ? `/roadmaps/${problemId}` : '/roadmaps')}
                  onNavigateToProblems={() => navigate('/problems')}
                />
              )} />
              <Route path="/mentors" element={currentUser && <RoadmapTabs><MentorsPage currentUser={currentUser} /></RoadmapTabs>} />
            </Route>

            <Route path="/admin/:section?" element={currentUser && store.isAdmin(currentUser)
              ? <AdminPanel currentUser={currentUser} />
              : <Navigate to="/problems" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]" aria-live="polite">
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
              <span className={`w-7 h-7 rounded-full text-white flex items-center justify-center shrink-0 ${t.kind === 'error' ? 'bg-[var(--nxt-peach-deep)]' : 'bg-[var(--nxt-mint-strong)]'}`}>
                {t.kind === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
              </span>
              <button className="flex-1 min-w-0 text-left" onClick={() => { if (t.link) navigate(t.link); dismiss(t.id); }}>
                <p className="text-xs font-bold text-[var(--nxt-ink)] leading-snug">{t.title}</p>
                <p className="text-xs text-[var(--nxt-ink-soft)] mt-0.5 line-clamp-2">{t.message}</p>
              </button>
              <button onClick={() => dismiss(t.id)} className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] shrink-0" aria-label="Dismiss">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {currentUser && isMembershipModalOpen && (
        <MembershipModal isOpen onClose={() => setIsMembershipModalOpen(false)} currentUser={currentUser} />
      )}
      <SlackModal isOpen={isSlackModalOpen} onClose={() => setIsSlackModalOpen(false)} />
      {currentUser && isTeamModalOpen && (
        <TeamModal isOpen onClose={() => setIsTeamModalOpen(false)} currentUser={currentUser} />
      )}
      {currentUser && isEditProfileModalOpen && (
        <EditProfileModal isOpen onClose={() => setIsEditProfileModalOpen(false)} currentUser={currentUser} />
      )}
    </>
  );
}

function Shell({ currentUser, modals }: { currentUser: User | null; modals: Modals }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = tabForPath(location.pathname);

  return (
    <div className="min-h-screen bg-[var(--nxt-bg)] text-[var(--nxt-ink)] flex flex-col font-sans">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'funds' && !currentUser?.is_member) {
            if (!currentUser) modals.goToLogin();
            else modals.openMembership();
            return;
          }
          navigate(TAB_PATHS[tab] || '/problems');
        }}
        currentUser={currentUser}
        platformName={PLATFORM_NAME}
        onOpenMembershipModal={modals.openMembership}
        onOpenTeamModal={modals.openTeam}
        onOpenEditProfile={modals.openEditProfile}
        onLoginClick={modals.goToLogin}
        onLogout={() => { void store.logout().then(() => navigate('/')); }}
      />

      {currentUser && !store.isEmailVerified() && <VerifyEmailBanner email={currentUser.email} />}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-28 md:pb-10">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
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
            <button onClick={modals.openSlack} className="hover:text-[var(--nxt-ink)] transition-colors">Founder Slack</button>
            {currentUser ? (
              <button onClick={modals.openMembership} className="hover:text-[var(--nxt-ink)] transition-colors">
                Membership: <span className="font-semibold text-[var(--nxt-ink)]">{currentUser.is_member ? 'Active' : currentUser.membership_status === 'requested' ? 'Requested' : 'Not active'}</span>
              </button>
            ) : (
              <button onClick={modals.goToLogin} className="font-semibold text-[var(--nxt-mint-strong)] hover:underline">Log in / Register</button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoadmapTabs({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = tabForPath(location.pathname);
  const isMember = store.isAuthenticated() && store.getCurrentUser().is_member;
  const tabs = [
    { id: 'tasks', label: 'Roadmaps', icon: ListTodo },
    { id: 'resources', label: 'Resources', icon: BookMarked },
    ...(isMember ? [{ id: 'mentors', label: 'Mentors', icon: GraduationCap }] : []),
  ];
  return (
    <>
      <div className="mb-5 md:hidden">
        <SegmentedTabs tabs={tabs} active={active} onChange={(tab) => navigate(TAB_PATHS[tab])} />
      </div>
      {children}
    </>
  );
}

function RequireAuth({ currentUser }: { currentUser: User | null }) {
  const location = useLocation();
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function RequireMember({ currentUser, onOpenMembership }: { currentUser: User | null; onOpenMembership: () => void }) {
  if (currentUser?.is_member) return <Outlet />;
  return (
    <div className="max-w-xl mx-auto rounded-3xl border border-dashed border-[var(--nxt-line)] p-10 text-center">
      <h1 className="font-display text-xl font-bold text-[var(--nxt-ink)]">This area is for members</h1>
      <p className="text-sm text-[var(--nxt-ink-soft)] mt-2">
        {currentUser?.membership_status === 'requested'
          ? "Your membership request is being reviewed — we'll notify you as soon as it's approved."
          : 'Request membership to apply for funding, follow full roadmaps and connect with mentors.'}
      </p>
      {currentUser?.membership_status !== 'requested' && (
        <button onClick={onOpenMembership} className="mt-5 px-5 py-2.5 rounded-full bg-[var(--nxt-mint-strong)] text-white text-sm font-semibold">Request membership</button>
      )}
    </div>
  );
}

function VerifyEmailBanner({ email }: { email: string }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<string>) => {
    setBusy(true);
    try { setStatus(await action()); } catch (e) { setStatus(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(false); }
  };
  return (
    <div className="bg-[var(--nxt-blue)] border-b border-[var(--nxt-blue-strong)]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--nxt-blue-deep)]">
        <span className="flex items-center gap-2 font-medium"><MailWarning className="w-4 h-4" /> Verify your email ({email}) to request membership, apply and send messages.</span>
        <span className="flex items-center gap-3">
          <button disabled={busy} onClick={() => run(async () => ((await store.recheckEmailVerification()) ? 'Verified — thanks!' : 'Not verified yet — check your inbox.'))} className="font-semibold underline">I've verified</button>
          <button disabled={busy} onClick={() => run(async () => { await store.resendVerificationEmail(); return 'Verification email sent.'; })} className="font-semibold underline">Resend email</button>
          {status && <span className="text-xs">{status}</span>}
        </span>
      </div>
    </div>
  );
}

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="max-w-xl mx-auto rounded-3xl border border-dashed border-[var(--nxt-line)] p-10 text-center">
      <h1 className="font-display text-xl font-bold text-[var(--nxt-ink)]">Page not found</h1>
      <p className="text-sm text-[var(--nxt-ink-soft)] mt-2">That link may be out of date.</p>
      <button onClick={() => navigate('/problems')} className="mt-5 px-5 py-2.5 rounded-full bg-[var(--nxt-mint-strong)] text-white text-sm font-semibold">Go to problem statements</button>
    </div>
  );
}

type Toast = { id: string; title: string; message: string; link?: string; kind: 'notice' | 'error' };

function useToasts(currentUserId: string | null, version: number) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seen = useRef<Set<string> | null>(null);
  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const push = (toast: Toast) => {
    setToasts(prev => [toast, ...prev].slice(0, 3));
    setTimeout(() => dismiss(toast.id), toast.kind === 'error' ? 8000 : 6000);
  };

  useEffect(() => store.onError(message => push({ id: `err-${Date.now()}`, title: "That didn't save", message, kind: 'error' })), []);

  useEffect(() => {
    if (!currentUserId) {
      seen.current = null;
      return;
    }
    const latest: AppNotification[] = store.getNotifications(currentUserId);
    if (seen.current === null) {
      seen.current = new Set(latest.map(n => n.id));
      return;
    }
    latest.filter(n => !seen.current!.has(n.id)).forEach(n => {
      seen.current!.add(n.id);
      push({ id: n.id, title: n.title, message: n.message, link: n.link, kind: 'notice' });
    });
  }, [currentUserId, version]);

  return { toasts, dismiss };
}
