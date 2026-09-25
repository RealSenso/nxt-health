import {
  createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, sendPasswordResetEmail,
  signInWithEmailAndPassword, signOut, updateProfile as updateFirebaseProfile, type User as FirebaseUser,
} from 'firebase/auth';
import {
  AcquisitionSource, AppNotification, ApplicationStatus, Booking, Category, Commitment, Consultation, FounderBackground,
  FounderOutcomes, FundingApplication, Gender, MembershipStatus, MentorProfile, MentorRequest, Message,
  ProblemStatement, PublicFounder, PublicProfileSettings, PublicTeam, Resource, ResourceView, Rsvp,
  StartupStage, Step, StepRating, StepSubmission, StepWorkspace, SubmissionStatus, Team, TeamInvite,
  Thread, User, UserProgress, UserRole,
} from '../types';
import { api, ApiError } from './api';
import { auth } from './firebase';

export const PLATFORM_NAME = 'NxT Health';

export type ProfileUpdates = {
  name?: string;
  location?: string;
  gender?: Gender;
  background?: FounderBackground;
  first_time_founder?: boolean;
  commitment?: Commitment;
  startup_stage?: StartupStage;
  funding_raised_total?: number;
  has_revenue?: boolean;
  acquisition_source?: AcquisitionSource;
  outcomes?: Omit<FounderOutcomes, 'updated_at'>;
};

type RawUser = Omit<User, 'is_member'>;

interface ScopeData {
  key: string;
  working_problem_ids: string[];
  category_locks: Record<string, string>;
  project_notes: Record<string, string>;
}

interface BootstrapData {
  content: {
    problems: ProblemStatement[];
    categories: Category[];
    steps: Step[];
    resources: Resource[];
    slack_url: string;
    booked_slots: Record<string, string[]>;
  };
  me: RawUser | null;
  needs_profile: boolean;
  team?: Team | null;
  team_members?: { id: string; name: string; email: string }[];
  invites?: { incoming: TeamInvite[]; outgoing: TeamInvite[] };
  scope?: ScopeData;
  progress?: UserProgress[];
  workspaces?: Record<string, StepWorkspace>;
  applications?: FundingApplication[];
  submissions?: StepSubmission[];
  notifications?: AppNotification[];
  threads?: Thread[];
  my_rsvps?: string[];
  my_bookings?: Booking[];
  my_ratings?: StepRating[];
  public_profile?: (PublicProfileSettings & { id: string }) | null;
  mentors?: MentorProfile[];
  mentor_requests?: MentorRequest[];
  consultations?: Consultation[];
  consultation_rate_usd?: number;
  admin?: {
    users: RawUser[];
    teams: Team[];
    scopes: (Omit<ScopeData, 'key'> & { id: string })[];
    resource_views: ResourceView[];
    step_ratings: StepRating[];
    rsvps: Rsvp[];
    bookings: Booking[];
  };
}

const EMPTY: BootstrapData = {
  content: { problems: [], categories: [], steps: [], resources: [], slack_url: 'https://join.slack.com/', booked_slots: {} },
  me: null,
  needs_profile: false,
};

const withMembership = (u: RawUser): User => ({ ...u, is_member: u.role === 'admin' || u.membership_status === 'active' });

class ApiStore {
  private listeners = new Set<() => void>();
  private errorListeners = new Set<(message: string) => void>();
  private data: BootstrapData = EMPTY;
  private firebaseUser: FirebaseUser | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: Promise<void> | null = null;
  private signingUp = false;
  public ready = false;
  public loadError: string | null = null;

  constructor() {
    onAuthStateChanged(auth, async (user) => {
      this.firebaseUser = user;
      await this.refresh();
      this.ready = true;
      this.notify();
    });
    setInterval(() => { if (document.visibilityState === 'visible') void this.refresh(); }, 30_000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void this.refresh(); });
  }

  // ---------- plumbing ----------

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  public onError(listener: (message: string) => void): () => void {
    this.errorListeners.add(listener);
    return () => { this.errorListeners.delete(listener); };
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }

  private reportError(e: unknown): void {
    const message = e instanceof Error ? e.message : 'Something went wrong.';
    this.errorListeners.forEach(cb => cb(message));
  }

  public async refresh(): Promise<void> {
    if (this.inFlight) return this.inFlight;
    this.inFlight = (async () => {
      try {
        // Pick up a verification done in another tab so the banner clears and gated actions work.
        if (this.firebaseUser && !this.firebaseUser.emailVerified) {
          await this.firebaseUser.reload().catch(() => undefined);
          if (this.firebaseUser.emailVerified) await this.firebaseUser.getIdToken(true);
        }
        let data = await api.get<BootstrapData>('/bootstrap');
        if (data.needs_profile && this.firebaseUser && !this.signingUp) {
          const fallbackName = this.firebaseUser.displayName || this.firebaseUser.email?.split('@')[0] || 'Founder';
          await api.post('/users/me', { name: fallbackName });
          data = await api.get<BootstrapData>('/bootstrap');
        }
        this.data = data;
        this.loadError = null;
      } catch (e) {
        this.loadError = e instanceof ApiError ? e.message : 'Could not load data.';
      } finally {
        this.inFlight = null;
        this.notify();
      }
    })();
    return this.inFlight;
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => { void this.refresh(); }, 350);
  }

  /** Optimistic write: update the cache now, send to the API, then reconcile. Errors surface as toasts. */
  private mutate(apply: (d: BootstrapData) => void, request: () => Promise<unknown>): Promise<void> {
    apply(this.data);
    this.notify();
    return request()
      .then(() => this.scheduleRefresh())
      .catch((e) => { this.reportError(e); void this.refresh(); });
  }

  /** Awaited write whose errors the caller handles. */
  private async write<T>(request: () => Promise<T>): Promise<T> {
    const result = await request();
    await this.refresh();
    return result;
  }

  // ---------- auth ----------

  public isAuthenticated(): boolean {
    return !!this.firebaseUser && !!this.data.me;
  }

  public getCurrentUser(): User {
    if (!this.data.me) throw new Error('Not signed in');
    return withMembership({ ...this.data.me, email_verified: this.firebaseUser?.emailVerified ?? this.data.me.email_verified });
  }

  public isEmailVerified(): boolean {
    return !!this.firebaseUser?.emailVerified;
  }

  public async signup(
    name: string,
    email: string,
    password: string,
    extra?: { location?: string; gender?: Gender; acquisition_source?: AcquisitionSource; background?: FounderBackground },
  ): Promise<void> {
    this.signingUp = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateFirebaseProfile(cred.user, { displayName: name.trim() });
      await sendEmailVerification(cred.user).catch(() => undefined);
      await api.post('/users/me', {
        name: name.trim(),
        ...(extra?.location?.trim() ? { location: extra.location.trim() } : {}),
        ...(extra?.gender ? { gender: extra.gender } : {}),
        ...(extra?.acquisition_source ? { acquisition_source: extra.acquisition_source } : {}),
        ...(extra?.background ? { background: extra.background } : {}),
      });
    } finally {
      this.signingUp = false;
    }
    await this.refresh();
  }

  public async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    await this.refresh();
  }

  public async logout(): Promise<void> {
    await signOut(auth);
    this.data = { ...EMPTY, content: this.data.content };
    this.notify();
    await this.refresh();
  }

  public async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  }

  public async resendVerificationEmail(): Promise<void> {
    if (this.firebaseUser) await sendEmailVerification(this.firebaseUser);
  }

  /** Call after the user clicks the link in their inbox. */
  public async recheckEmailVerification(): Promise<boolean> {
    if (!this.firebaseUser) return false;
    await this.firebaseUser.reload();
    await this.firebaseUser.getIdToken(true);
    this.firebaseUser = auth.currentUser;
    await this.refresh();
    return !!this.firebaseUser?.emailVerified;
  }

  public touchActivity(_userId: string): void {
    api.post('/users/me/activity').catch(() => undefined);
  }

  // ---------- users, membership, admin user management ----------

  public getUsers(): User[] {
    if (this.data.admin) return this.data.admin.users.map(withMembership);
    const me = this.data.me;
    if (!me) return [];
    const teammates = (this.data.team_members || [])
      .filter(m => m.id !== me.id)
      .map(m => withMembership({ id: m.id, name: m.name, email: m.email, role: 'member', membership_status: 'active' }));
    return [withMembership(me), ...teammates];
  }

  public isAdmin(user: User | RawUser): boolean {
    return user.role === 'admin';
  }

  public async updateProfile(_userId: string, updates: ProfileUpdates): Promise<{ error?: string }> {
    try {
      await this.write(() => api.patch('/users/me', updates));
      if (updates.name && this.firebaseUser) await updateFirebaseProfile(this.firebaseUser, { displayName: updates.name });
      return {};
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Could not save your profile.' };
    }
  }

  public requestMembership(): Promise<void> {
    return this.write(() => api.post('/users/me/membership-request'));
  }

  public setMembershipStatus(userId: string, status: MembershipStatus): Promise<void> {
    return this.mutate(
      d => { const u = d.admin?.users.find(x => x.id === userId); if (u) u.membership_status = status; },
      () => api.patch(`/admin/users/${userId}`, { membership_status: status }),
    );
  }

  public setUserRole(userId: string, role: UserRole): Promise<void> {
    return this.mutate(
      d => { const u = d.admin?.users.find(x => x.id === userId); if (u) u.role = role; },
      () => api.patch(`/admin/users/${userId}`, { role }),
    );
  }

  public setMentor(userId: string, isMentor: boolean): Promise<void> {
    return this.mutate(
      d => { const u = d.admin?.users.find(x => x.id === userId); if (u) u.is_mentor = isMentor; },
      () => api.patch(`/admin/users/${userId}`, { is_mentor: isMentor }),
    );
  }

  // ---------- teams ----------

  public getScopeKey(user: User | RawUser): string {
    if (this.data.me && user.id === this.data.me.id && this.data.scope) return this.data.scope.key;
    return user.team_id || user.id;
  }

  public getScopeUserIds(user: User): string[] {
    if (!user.team_id) return [user.id];
    const team = this.getTeam(user.team_id);
    return team ? team.member_ids : [user.id];
  }

  public getTeams(): Team[] {
    if (this.data.admin) return this.data.admin.teams;
    return this.data.team ? [this.data.team] : [];
  }

  public getTeam(teamId: string): Team | undefined {
    return this.getTeams().find(t => t.id === teamId);
  }

  public getMyTeam(user: User): Team | null {
    return user.team_id ? this.getTeam(user.team_id) || null : null;
  }

  public getTeamMemberName(uid: string): string {
    return this.data.team_members?.find(m => m.id === uid)?.name
      || this.data.admin?.users.find(u => u.id === uid)?.name
      || 'Teammate';
  }

  public getIncomingInvites(): TeamInvite[] {
    return this.data.invites?.incoming || [];
  }

  public getOutgoingInvites(): TeamInvite[] {
    return this.data.invites?.outgoing || [];
  }

  public async createTeam(name: string): Promise<void> {
    await this.write(() => api.post('/teams', { name }));
  }

  public async inviteTeammateByEmail(_user: User, email: string): Promise<{ success?: boolean; registered?: boolean; error?: string }> {
    try {
      const res = await this.write(() => api.post<{ registered: boolean }>('/teams/invites', { email }));
      return { success: true, registered: res.registered };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Could not send the invite.' };
    }
  }

  public respondToInvite(inviteId: string, accept: boolean): Promise<void> {
    return this.write(() => api.post(`/teams/invites/${inviteId}/${accept ? 'accept' : 'decline'}`));
  }

  public cancelInvite(inviteId: string): Promise<void> {
    return this.mutate(
      d => { if (d.invites) d.invites.outgoing = d.invites.outgoing.filter(i => i.id !== inviteId); },
      () => api.delete(`/teams/invites/${inviteId}`),
    );
  }

  public async removeTeammate(_user: User, memberId: string): Promise<{ success?: boolean; error?: string }> {
    try {
      await this.write(() => api.delete(`/teams/members/${memberId}`));
      return { success: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Could not remove that member.' };
    }
  }

  public leaveTeam(_user: User): Promise<void> {
    return this.write(() => api.post('/teams/leave'));
  }

  public updateMyTeam(fields: { name?: string; tagline?: string; website?: string; is_public?: boolean }): Promise<void> {
    return this.write(() => api.patch('/teams/mine', fields));
  }

  // ---------- notifications ----------

  public getNotifications(_userId: string): AppNotification[] {
    return this.data.notifications || [];
  }

  public getUnreadNotificationCount(userId: string): number {
    return this.getNotifications(userId).filter(n => !n.read).length;
  }

  public markNotificationRead(id: string): void {
    void this.mutate(
      d => { const n = d.notifications?.find(x => x.id === id); if (n) n.read = true; },
      () => api.post(`/notifications/${id}/read`),
    );
  }

  public markAllNotificationsRead(_userId: string): void {
    void this.mutate(
      d => d.notifications?.forEach(n => { n.read = true; }),
      () => api.post('/notifications/read-all'),
    );
  }

  // ---------- content ----------

  public getSlackUrl(): string {
    return this.data.content.slack_url;
  }

  public setSlackUrl(url: string): Promise<void> {
    return this.mutate(d => { d.content.slack_url = url; }, () => api.put('/admin/settings/slack', { url }));
  }

  public isContentEmpty(): boolean {
    return this.data.content.categories.length === 0;
  }

  public loadStarterContent(): Promise<void> {
    return this.write(() => api.post('/admin/starter-content'));
  }

  public getProblems(): ProblemStatement[] {
    return this.data.content.problems;
  }

  public getProblemById(id: string): ProblemStatement | undefined {
    return this.getProblems().find(p => p.id === id);
  }

  private saveContent<T extends { id?: string }>(kind: 'problems' | 'categories' | 'steps' | 'resources', item: T): Promise<void> {
    const { id, ...body } = item as T & Record<string, unknown>;
    for (const key of ['created_at', 'created_by_admin', 'rsvp_count', 'locked']) delete (body as Record<string, unknown>)[key];
    return this.write(() => (id ? api.put(`/admin/${kind}/${id}`, body) : api.post(`/admin/${kind}`, body))).then(() => undefined, e => this.reportError(e));
  }

  private deleteContent(kind: 'problems' | 'categories' | 'steps' | 'resources', id: string): Promise<void> {
    return this.mutate(
      d => { (d.content[kind] as { id: string }[]) = (d.content[kind] as { id: string }[]).filter(x => x.id !== id); },
      () => api.delete(`/admin/${kind}/${id}`),
    );
  }

  public saveProblem(problem: Omit<ProblemStatement, 'id' | 'created_at' | 'created_by_admin'> & { id?: string }): Promise<void> {
    return this.saveContent('problems', problem);
  }

  public deleteProblem(id: string): Promise<void> {
    return this.deleteContent('problems', id);
  }

  public getCategories(): Category[] {
    return [...this.data.content.categories].sort((a, b) => a.order - b.order);
  }

  public saveCategory(category: Omit<Category, 'id'> & { id?: string }): Promise<void> {
    return this.saveContent('categories', category);
  }

  public deleteCategory(id: string): Promise<void> {
    return this.deleteContent('categories', id);
  }

  public getSteps(categoryId?: string): Step[] {
    const steps = categoryId ? this.data.content.steps.filter(s => s.category_id === categoryId) : this.data.content.steps;
    return [...steps].sort((a, b) => a.order - b.order);
  }

  public saveStep(step: Omit<Step, 'id'> & { id?: string }): Promise<void> {
    return this.saveContent('steps', step);
  }

  public deleteStep(id: string): Promise<void> {
    return this.deleteContent('steps', id);
  }

  public getResources(stepId?: string): Resource[] {
    const all = this.data.content.resources;
    return stepId ? all.filter(r => r.step_id === stepId) : all;
  }

  public getResourcesForUser(stepId: string, userId: string, problemId?: string): { common: Resource[]; recommended: Resource[] } {
    const resources = this.getResources(stepId);
    return {
      common: resources.filter(r => !r.assigned_user_id),
      recommended: resources.filter(r => r.assigned_user_id === userId && (!r.assigned_problem_id || r.assigned_problem_id === problemId)),
    };
  }

  public saveResource(res: Omit<Resource, 'id'> & { id?: string }): Promise<void> {
    return this.saveContent('resources', res);
  }

  public deleteResource(id: string): Promise<void> {
    return this.deleteContent('resources', id);
  }

  // ---------- applications ----------

  public getApplications(): FundingApplication[] {
    return this.data.applications || [];
  }

  public getUserApplications(userId: string): FundingApplication[] {
    return this.getApplications().filter(a => a.user_id === userId);
  }

  public getScopedApplications(user: User): FundingApplication[] {
    const key = this.getScopeKey(user);
    return this.getApplications().filter(a => a.scope_key === key || (!a.scope_key && a.user_id === user.id));
  }

  public async upsertApplication(
    appData: Omit<FundingApplication, 'id' | 'status' | 'submitted_at' | 'user_id'> & { id?: string; user_id?: string },
    status: 'Draft' | 'Pending',
  ): Promise<void> {
    const body = {
      applicant_name: appData.applicant_name,
      applicant_email: appData.applicant_email,
      startup_name: appData.startup_name,
      problem_statement_id: appData.problem_statement_id,
      pitch: appData.pitch,
      amount_requested: Number(appData.amount_requested) || 0,
      supporting_notes: appData.supporting_notes,
      status,
    };
    await this.write(() => (appData.id ? api.patch(`/applications/${appData.id}`, body) : api.post('/applications', body)));
  }

  public deleteApplication(id: string): Promise<void> {
    return this.mutate(
      d => { d.applications = d.applications?.filter(a => a.id !== id); },
      () => api.delete(`/applications/${id}`),
    );
  }

  public updateApplicationStatus(id: string, status: ApplicationStatus, adminFeedback?: string): Promise<void> {
    return this.mutate(
      d => {
        const a = d.applications?.find(x => x.id === id);
        if (a) { a.status = status; if (adminFeedback !== undefined) a.admin_feedback = adminFeedback; }
      },
      () => api.post(`/admin/applications/${id}/decision`, { status, ...(adminFeedback !== undefined ? { admin_feedback: adminFeedback } : {}) }),
    );
  }

  // ---------- roadmap scope ----------

  private scope(): ScopeData {
    return this.data.scope || { key: '', working_problem_ids: [], category_locks: {}, project_notes: {} };
  }

  private scopeFor(scopeKey: string): Omit<ScopeData, 'key'> | undefined {
    if (this.data.scope?.key === scopeKey) return this.data.scope;
    return this.data.admin?.scopes.find(s => s.id === scopeKey);
  }

  public getWorkingProblemIds(scopeKey: string): string[] {
    return this.scopeFor(scopeKey)?.working_problem_ids || [];
  }

  public getAllWorkingProblems(): Record<string, string[]> {
    if (this.data.admin) return Object.fromEntries(this.data.admin.scopes.map(s => [s.id, s.working_problem_ids || []]));
    const s = this.scope();
    return s.key ? { [s.key]: s.working_problem_ids } : {};
  }

  public addWorkingProblem(_scopeKey: string, problemId: string): void {
    if (this.scope().working_problem_ids.includes(problemId)) return;
    void this.mutate(
      d => { d.scope?.working_problem_ids.push(problemId); },
      () => api.put(`/scope/working-problems/${problemId}`),
    );
  }

  public removeWorkingProblem(_scopeKey: string, problemId: string): void {
    void this.mutate(
      d => { if (d.scope) d.scope.working_problem_ids = d.scope.working_problem_ids.filter(id => id !== problemId); },
      () => api.delete(`/scope/working-problems/${problemId}`),
    );
  }

  public clearWorkingProblems(_scopeKey: string): void {
    void this.mutate(d => { if (d.scope) d.scope.working_problem_ids = []; }, () => api.delete('/scope/working-problems'));
  }

  public getSavedProblemIds(_userId: string): string[] {
    return this.data.me?.saved_problem_ids || [];
  }

  public isProblemSaved(userId: string, problemId: string): boolean {
    return this.getSavedProblemIds(userId).includes(problemId);
  }

  public toggleSavedProblem(_userId: string, problemId: string): void {
    void this.mutate(
      d => {
        if (!d.me) return;
        const saved = d.me.saved_problem_ids || [];
        d.me.saved_problem_ids = saved.includes(problemId) ? saved.filter(id => id !== problemId) : [...saved, problemId];
      },
      () => api.post('/users/me/saved', { problem_id: problemId }),
    );
  }

  public getProjectNote(scopeKey: string, problemId: string): string {
    return this.scopeFor(scopeKey)?.project_notes?.[problemId] || '';
  }

  public setProjectNote(_scopeKey: string, problemId: string, note: string): void {
    void this.mutate(
      d => { if (d.scope) d.scope.project_notes = { ...d.scope.project_notes, [problemId]: note }; },
      () => api.put(`/scope/notes/${problemId}`, { note }),
    );
  }

  public getLockedCategoryId(scopeKey: string, problemId: string): string | null {
    const id = this.scopeFor(scopeKey)?.category_locks?.[problemId];
    return id && this.data.content.categories.some(c => c.id === id) ? id : null;
  }

  public getAllCategoryLocks(): Record<string, Record<string, string>> {
    if (this.data.admin) return Object.fromEntries(this.data.admin.scopes.map(s => [s.id, s.category_locks || {}]));
    const s = this.scope();
    return s.key ? { [s.key]: s.category_locks } : {};
  }

  public lockCategory(_scopeKey: string, problemId: string, categoryId: string): void {
    void this.mutate(
      d => { if (d.scope) d.scope.category_locks = { ...d.scope.category_locks, [problemId]: categoryId }; },
      () => api.put(`/scope/locks/${problemId}`, { category_id: categoryId }),
    );
  }

  public unlockCategory(_scopeKey: string, problemId: string): void {
    void this.mutate(
      d => { if (d.scope) { const { [problemId]: _, ...rest } = d.scope.category_locks; d.scope.category_locks = rest; } },
      () => api.delete(`/scope/locks/${problemId}`),
    );
  }

  public getAllProgress(): UserProgress[] {
    return this.data.progress || [];
  }

  public getUserProgress(scopeKey: string, categoryId: string): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    this.getAllProgress()
      .filter(p => p.user_id === scopeKey && p.category_id === categoryId)
      .forEach(p => { map[p.step_id] = p.completed; });
    return map;
  }

  public toggleStepProgress(scopeKey: string, categoryId: string, stepId: string): void {
    void this.mutate(
      d => {
        d.progress ||= [];
        const existing = d.progress.find(p => p.user_id === scopeKey && p.category_id === categoryId && p.step_id === stepId);
        if (existing) { existing.completed = !existing.completed; existing.updated_at = new Date().toISOString(); }
        else d.progress.push({ user_id: scopeKey, category_id: categoryId, step_id: stepId, completed: true, updated_at: new Date().toISOString() });
      },
      () => api.post('/scope/progress/toggle', { category_id: categoryId, step_id: stepId }),
    );
  }

  public resetCategoryProgress(scopeKey: string, categoryId: string): void {
    void this.mutate(
      d => { d.progress = d.progress?.filter(p => !(p.user_id === scopeKey && p.category_id === categoryId)); },
      () => api.delete(`/scope/progress/${categoryId}`),
    );
  }

  private workspaceKey(scopeKey: string, problemId: string, stepId: string): string {
    return `${scopeKey}::${problemId}::${stepId}`;
  }

  public getStepWorkspace(scopeKey: string, problemId: string, stepId: string): StepWorkspace | null {
    return this.data.workspaces?.[this.workspaceKey(scopeKey, problemId, stepId)] || null;
  }

  public getAllStepWorkspaces(): Record<string, StepWorkspace> {
    return this.data.workspaces || {};
  }

  public saveStepWorkspace(scopeKey: string, problemId: string, stepId: string, workspace: StepWorkspace): void {
    const { status, started_at, target_date, blocker, checklist, log } = workspace;
    void this.mutate(
      d => { d.workspaces = { ...d.workspaces, [this.workspaceKey(scopeKey, problemId, stepId)]: { ...workspace, updated_at: new Date().toISOString() } }; },
      () => api.put(`/scope/workspaces/${problemId}/${stepId}`, {
        status, checklist, log,
        ...(started_at ? { started_at } : {}),
        ...(target_date ? { target_date } : {}),
        ...(blocker ? { blocker } : {}),
      }),
    );
  }

  public clearStepWorkspaces(scopeKey: string, problemId: string): void {
    const prefix = `${scopeKey}::${problemId}::`;
    void this.mutate(
      d => { d.workspaces = Object.fromEntries(Object.entries(d.workspaces || {}).filter(([k]) => !k.startsWith(prefix))); },
      () => api.delete(`/scope/workspaces/${problemId}`),
    );
  }

  // ---------- evidence ----------

  public getAllStepSubmissions(): StepSubmission[] {
    return this.data.submissions || [];
  }

  public getStepSubmissionsForStep(stepId: string, scopeUserIds?: string[]): StepSubmission[] {
    return this.getAllStepSubmissions()
      .filter(s => s.step_id === stepId && (!scopeUserIds || scopeUserIds.includes(s.user_id)))
      .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  }

  public getPendingStepSubmissions(): StepSubmission[] {
    return this.getAllStepSubmissions().filter(s => s.status === 'Submitted').sort((a, b) => a.submitted_at.localeCompare(b.submitted_at));
  }

  public async submitStepEvidence(payload: { step_id: string; category_id: string; problem_id: string; note: string; files: File[] }): Promise<void> {
    const form = new FormData();
    form.append('step_id', payload.step_id);
    form.append('category_id', payload.category_id);
    form.append('problem_id', payload.problem_id);
    form.append('note', payload.note);
    payload.files.forEach(f => form.append('files', f));
    await this.write(() => api.post('/submissions', form));
  }

  public downloadSubmissionFile(fileId: string, name: string): Promise<void> {
    return api.download(`/files/${fileId}`, name).catch(e => this.reportError(e));
  }

  public reviewStepSubmission(id: string, status: SubmissionStatus, adminFeedback?: string): Promise<void> {
    return this.mutate(
      d => { const s = d.submissions?.find(x => x.id === id); if (s) { s.status = status; s.admin_feedback = adminFeedback; } },
      () => api.post(`/admin/submissions/${id}/review`, { status, ...(adminFeedback !== undefined ? { admin_feedback: adminFeedback } : {}) }),
    );
  }

  public deleteStepSubmission(id: string): Promise<void> {
    return this.mutate(
      d => { d.submissions = d.submissions?.filter(s => s.id !== id); },
      () => api.delete(`/admin/submissions/${id}`),
    );
  }

  // ---------- analytics events ----------

  public logResourceView(_userId: string, resourceId: string): void {
    api.post('/events/resource-view', { resource_id: resourceId }).catch(() => undefined);
  }

  public getResourceViews(): ResourceView[] {
    return this.data.admin?.resource_views || [];
  }

  public getStepRatings(): StepRating[] {
    return this.data.admin?.step_ratings || this.data.my_ratings || [];
  }

  public getUserStepRating(userId: string, stepId: string): StepRating | null {
    return (this.data.my_ratings || []).find(r => r.step_id === stepId && r.user_id === userId) || null;
  }

  public rateStep(userId: string, stepId: string, score: number, comment?: string): void {
    void this.mutate(
      d => {
        const rating = { user_id: userId, step_id: stepId, score, ...(comment ? { comment } : {}), created_at: new Date().toISOString() };
        d.my_ratings = [...(d.my_ratings || []).filter(r => r.step_id !== stepId), rating];
      },
      () => api.put(`/ratings/${stepId}`, { score, ...(comment ? { comment } : {}) }),
    );
  }

  // ---------- messaging ----------

  public getThreads(): Thread[] {
    return this.data.threads || [];
  }

  public getUnreadThreadCount(): number {
    return this.getThreads().filter(t => t.unread).length;
  }

  public async openContextThread(type: 'application' | 'submission', id: string): Promise<string> {
    const { thread } = await api.post<{ thread: Thread }>('/threads/context', { type, id });
    this.scheduleRefresh();
    return thread.id;
  }

  public async fetchThread(threadId: string): Promise<{ thread: Thread; messages: Message[] }> {
    const result = await api.get<{ thread: Thread; messages: Message[] }>(`/threads/${threadId}/messages`);
    const cached = this.data.threads?.find(t => t.id === threadId);
    if (cached?.unread) { cached.unread = false; this.notify(); }
    return result;
  }

  public async sendMessage(threadId: string, body: string): Promise<Message> {
    const { message } = await api.post<{ message: Message }>(`/threads/${threadId}/messages`, { body });
    this.scheduleRefresh();
    return message;
  }

  // ---------- events: RSVP & booking ----------

  public hasRsvp(resourceId: string): boolean {
    return (this.data.my_rsvps || []).includes(resourceId);
  }

  public rsvp(resourceId: string): Promise<void> {
    return this.write(() => api.post(`/events/${resourceId}/rsvp`));
  }

  public cancelRsvp(resourceId: string): Promise<void> {
    return this.mutate(
      d => {
        d.my_rsvps = (d.my_rsvps || []).filter(id => id !== resourceId);
        const r = d.content.resources.find(x => x.id === resourceId);
        if (r?.rsvp_count) r.rsvp_count -= 1;
      },
      () => api.delete(`/events/${resourceId}/rsvp`),
    );
  }

  public getBookedSlots(resourceId: string): string[] {
    return this.data.content.booked_slots[resourceId] || [];
  }

  public getMyBooking(resourceId: string): Booking | null {
    return (this.data.my_bookings || []).find(b => b.resource_id === resourceId) || null;
  }

  public getMyBookings(): Booking[] {
    return this.data.my_bookings || [];
  }

  public getMyRsvpIds(): string[] {
    return this.data.my_rsvps || [];
  }

  public bookSlot(resourceId: string, slot: string): Promise<void> {
    return this.write(() => api.post(`/events/${resourceId}/bookings`, { slot }));
  }

  public cancelBooking(resourceId: string, slot: string): Promise<void> {
    return this.write(() => api.delete(`/events/${resourceId}/bookings/${encodeURIComponent(slot)}`));
  }

  public getEventAttendees(resourceId: string): { rsvps: Rsvp[]; bookings: Booking[] } {
    return {
      rsvps: (this.data.admin?.rsvps || []).filter(r => r.resource_id === resourceId),
      bookings: (this.data.admin?.bookings || []).filter(b => b.resource_id === resourceId),
    };
  }

  // ---------- mentors ----------

  public getMentors(): MentorProfile[] {
    return this.data.mentors || [];
  }

  public getMentorRequests(): MentorRequest[] {
    return this.data.mentor_requests || [];
  }

  public requestMentor(mentorUid: string, message: string): Promise<void> {
    return this.write(() => api.post('/mentor-requests', { mentor_uid: mentorUid, message }));
  }

  public respondToMentorRequest(requestId: string, accept: boolean): Promise<void> {
    return this.write(() => api.post(`/mentor-requests/${requestId}/respond`, { accept }));
  }

  public endMentorship(requestId: string): Promise<void> {
    return this.write(() => api.post(`/mentor-requests/${requestId}/end`));
  }

  // ---------- paid consultations ----------

  public getConsultations(): Consultation[] {
    return this.data.consultations || [];
  }

  public getConsultationRate(): number {
    return this.data.consultation_rate_usd ?? 200;
  }

  public bookConsultation(input: { mentor_uid: string; hours: number; topic: string; preferred_time?: string }): Promise<Consultation> {
    return this.write(async () => (await api.post<{ consultation: Consultation }>('/consultations', input)).consultation);
  }

  /** Demo payment: marks the booking paid and opens the chat. No card is charged. */
  public payConsultation(id: string): Promise<Consultation> {
    return this.write(async () => (await api.post<{ consultation: Consultation }>(`/consultations/${id}/pay`)).consultation);
  }

  public cancelConsultation(id: string): Promise<void> {
    return this.write(() => api.post(`/consultations/${id}/cancel`));
  }

  public saveMentorProfile(profile: MentorProfileInput, forUserId?: string): Promise<void> {
    return this.write(() => (forUserId ? api.put(`/admin/mentors/${forUserId}`, profile) : api.put('/mentor/profile', profile)));
  }

  // ---------- public profiles ----------

  public getMyPublicProfile(): PublicProfileSettings {
    return this.data.public_profile || { is_public: false };
  }

  public savePublicProfile(settings: PublicProfileSettings): Promise<void> {
    return this.write(() => api.put('/users/me/public-profile', settings));
  }

  public async fetchPublicFounder(uid: string): Promise<PublicFounder> {
    const { profile } = await api.get<{ profile: PublicFounder }>(`/public/founders/${uid}`);
    return profile;
  }

  public async fetchPublicTeam(teamId: string): Promise<PublicTeam> {
    const { team } = await api.get<{ team: PublicTeam }>(`/public/teams/${teamId}`);
    return team;
  }
}

export interface MentorProfileInput {
  headline: string;
  bio: string;
  expertise_stages: string[];
  category_ids: string[];
  background?: FounderBackground;
  availability: string;
  capacity: number;
  accepting: boolean;
}

export const store = new ApiStore();
