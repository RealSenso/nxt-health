import {
  User, UserRole, ProblemStatement, FundingApplication, Category, Step, Resource, UserProgress, ApplicationStatus,
  Team, AppNotification, NotificationType, StepSubmission, SubmissionStatus, SubmissionFile, Gender,
  StepWorkspace
} from '../types';
import {
  SEED_USERS, SEED_PROBLEM_STATEMENTS, SEED_CATEGORIES,
  SEED_STEPS, SEED_RESOURCES, SEED_APPLICATIONS, SEED_PROGRESS
} from '../data/seedData';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'medplatform_current_user_id_v1',
  USERS: 'medplatform_users_v2',
  PROBLEMS: 'medplatform_problems_v1',
  APPLICATIONS: 'medplatform_applications_v1',
  CATEGORIES: 'medplatform_categories_v1',
  STEPS: 'medplatform_steps_v1',
  RESOURCES: 'medplatform_resources_v1',
  PROGRESS: 'medplatform_progress_v1',
  SLACK_URL: 'medplatform_slack_url_v1',
  WORKING_PROBLEMS: 'medplatform_working_problems_v1',
  SAVED_PROBLEMS: 'medplatform_saved_problems_v1',
  PROJECT_NOTES: 'medplatform_project_notes_v1',
  AUTH_SESSION: 'medplatform_auth_session_v1',
  NOTIFICATIONS: 'medplatform_notifications_v1',
  TEAMS: 'medplatform_teams_v1',
  STEP_SUBMISSIONS: 'medplatform_step_submissions_v1',
  STEP_WORKSPACES: 'medplatform_step_workspaces_v1',
};

export const PLATFORM_NAME = 'NxT Health';

const DEFAULT_SLACK_URL = 'https://join.slack.com/t/medtech-founders-hub/shared_invite/zt-placeholder-medtech-mvp';

class LocalDataStore {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initIfEmpty();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => cb());
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  }

  public initIfEmpty(forceReset = false): void {
    const isFirstInit = !localStorage.getItem(STORAGE_KEYS.USERS);
    if (forceReset || isFirstInit) {
      this.setItem(STORAGE_KEYS.SLACK_URL, DEFAULT_SLACK_URL);
      this.setItem(STORAGE_KEYS.USERS, SEED_USERS);
      this.setItem(STORAGE_KEYS.PROBLEMS, SEED_PROBLEM_STATEMENTS);
      this.setItem(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
      this.setItem(STORAGE_KEYS.STEPS, SEED_STEPS);
      this.setItem(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
      this.setItem(STORAGE_KEYS.APPLICATIONS, SEED_APPLICATIONS);
      this.setItem(STORAGE_KEYS.PROGRESS, SEED_PROGRESS);
      this.setItem(STORAGE_KEYS.WORKING_PROBLEMS, {});
      this.setItem(STORAGE_KEYS.SAVED_PROBLEMS, {});
      this.setItem(STORAGE_KEYS.PROJECT_NOTES, {});
      this.setItem(STORAGE_KEYS.NOTIFICATIONS, []);
      this.setItem(STORAGE_KEYS.TEAMS, []);
      this.setItem(STORAGE_KEYS.STEP_SUBMISSIONS, []);
      this.setItem(STORAGE_KEYS.STEP_WORKSPACES, {});
      if (isFirstInit) {
        this.setItem(STORAGE_KEYS.CURRENT_USER_ID, SEED_USERS[1].id);
      }
      this.notify();
    }
  }

  public getSlackUrl(): string {
    return this.getItem(STORAGE_KEYS.SLACK_URL, DEFAULT_SLACK_URL);
  }

  public setSlackUrl(url: string): void {
    this.setItem(STORAGE_KEYS.SLACK_URL, url);
    this.notify();
  }

  public getUsers(): User[] {
    return this.getItem(STORAGE_KEYS.USERS, SEED_USERS);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = this.getItem(STORAGE_KEYS.CURRENT_USER_ID, users[0]?.id || 'user-member-1');
    const found = users.find(u => u.id === currentId);
    return found || users[0] || SEED_USERS[1];
  }

  public setCurrentUser(userId: string): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    this.notify();
  }

  public isAdmin(user: User): boolean {
    return user.role === 'admin';
  }

  public setUserRole(userId: string, role: UserRole): void {
    const users = this.getUsers().map(u => (u.id === userId ? { ...u, role } : u));
    this.setItem(STORAGE_KEYS.USERS, users);
    this.notify();
  }

  public getNotifications(userId: string): AppNotification[] {
    const all = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all
      .filter(n => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getUnreadNotificationCount(userId: string): number {
    return this.getNotifications(userId).filter(n => !n.read).length;
  }

  public addNotification(userId: string, type: NotificationType, title: string, message: string): void {
    const all = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    all.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: userId,
      type,
      title,
      message,
      read: false,
      created_at: new Date().toISOString(),
    });
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, all);
    this.notify();
  }

  public markNotificationRead(id: string): void {
    const all = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = all.map(n => (n.id === id ? { ...n, read: true } : n));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    this.notify();
  }

  public markAllNotificationsRead(userId: string): void {
    const all = this.getItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const updated = all.map(n => (n.user_id === userId ? { ...n, read: true } : n));
    this.setItem(STORAGE_KEYS.NOTIFICATIONS, updated);
    this.notify();
  }

  public getScopeUserIds(user: User): string[] {
    if (!user.team_id) return [user.id];
    const team = this.getTeam(user.team_id);
    return team ? team.member_ids : [user.id];
  }

  public getScopeKey(user: User): string {
    return user.team_id || user.id;
  }

  public getTeams(): Team[] {
    return this.getItem<Team[]>(STORAGE_KEYS.TEAMS, []);
  }

  public getTeam(teamId: string): Team | undefined {
    return this.getTeams().find(t => t.id === teamId);
  }

  public getMyTeam(user: User): Team | null {
    return user.team_id ? this.getTeam(user.team_id) || null : null;
  }

  private migrateScopeData(fromKey: string, toKey: string): void {
    if (fromKey === toKey) return;

    const workingProblems = this.getItem<Record<string, string[]>>(STORAGE_KEYS.WORKING_PROBLEMS, {});
    if (workingProblems[fromKey]?.length) {
      const merged = Array.from(new Set([...(workingProblems[toKey] || []), ...workingProblems[fromKey]]));
      workingProblems[toKey] = merged;
      delete workingProblems[fromKey];
      this.setItem(STORAGE_KEYS.WORKING_PROBLEMS, workingProblems);
    }

    const notes = this.getItem<Record<string, Record<string, string>>>(STORAGE_KEYS.PROJECT_NOTES, {});
    if (notes[fromKey]) {
      notes[toKey] = { ...notes[fromKey], ...(notes[toKey] || {}) };
      delete notes[fromKey];
      this.setItem(STORAGE_KEYS.PROJECT_NOTES, notes);
    }

    const workspaces = this.getItem<Record<string, StepWorkspace>>(STORAGE_KEYS.STEP_WORKSPACES, {});
    const fromPrefix = `${fromKey}::`;
    let movedWorkspace = false;
    for (const key of Object.keys(workspaces)) {
      if (!key.startsWith(fromPrefix)) continue;
      const toWorkspaceKey = `${toKey}::${key.slice(fromPrefix.length)}`;
      if (!workspaces[toWorkspaceKey]) workspaces[toWorkspaceKey] = workspaces[key];
      delete workspaces[key];
      movedWorkspace = true;
    }
    if (movedWorkspace) this.setItem(STORAGE_KEYS.STEP_WORKSPACES, workspaces);

    const progress = this.getItem<UserProgress[]>(STORAGE_KEYS.PROGRESS, SEED_PROGRESS);
    const hasFromEntries = progress.some(p => p.user_id === fromKey);
    if (hasFromEntries) {
      const existingKeys = new Set(
        progress.filter(p => p.user_id === toKey).map(p => `${p.category_id}:${p.step_id}`)
      );
      const migrated = progress
        .filter(p => p.user_id === fromKey && !existingKeys.has(`${p.category_id}:${p.step_id}`))
        .map(p => ({ ...p, user_id: toKey }));
      const remaining = progress.filter(p => p.user_id !== fromKey);
      this.setItem(STORAGE_KEYS.PROGRESS, [...remaining, ...migrated]);
    }
  }

  public createTeam(user: User, name: string): Team {
    const teams = this.getTeams();
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: name.trim() || `${user.name.split(' ')[0]}'s Team`,
      owner_id: user.id,
      member_ids: [user.id],
      created_at: new Date().toISOString(),
    };
    teams.push(newTeam);
    this.setItem(STORAGE_KEYS.TEAMS, teams);

    const users = this.getUsers().map(u => (u.id === user.id ? { ...u, team_id: newTeam.id } : u));
    this.setItem(STORAGE_KEYS.USERS, users);
    this.migrateScopeData(user.id, newTeam.id);
    this.notify();
    return newTeam;
  }

  public inviteTeammateByEmail(user: User, email: string): { success?: boolean; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return { error: 'Enter an email address to invite.' };

    const target = this.getUsers().find(u => u.email.toLowerCase() === trimmedEmail);
    if (!target) {
      return { error: "No account found for that email yet — ask them to sign up first, then invite them again." };
    }
    if (target.id === user.id) {
      return { error: "That's your own account." };
    }
    if (target.team_id) {
      return { error: `${target.name} is already on a team.` };
    }

    let team = this.getMyTeam(user);
    if (!team) {
      team = this.createTeam(user, `${user.name.split(' ')[0]}'s Team`);
    }

    const teams = this.getTeams().map(t =>
      t.id === team!.id ? { ...t, member_ids: [...t.member_ids, target.id] } : t
    );
    this.setItem(STORAGE_KEYS.TEAMS, teams);

    const users = this.getUsers().map(u => (u.id === target.id ? { ...u, team_id: team!.id } : u));
    this.setItem(STORAGE_KEYS.USERS, users);
    this.migrateScopeData(target.id, team!.id);

    this.addNotification(
      target.id,
      'team_invite',
      "You've joined a team",
      `${user.name} added you to their team. You now share working problems, applications, and roadmap progress.`
    );
    this.notify();
    return { success: true };
  }

  public removeTeammate(user: User, memberId: string): { success?: boolean; error?: string } {
    const team = this.getMyTeam(user);
    if (!team) return { error: 'You are not on a team.' };
    if (team.owner_id !== user.id) return { error: 'Only the team owner can remove members.' };
    if (memberId === team.owner_id) return { error: "The owner can't remove themselves — use Leave Team instead." };

    const teams = this.getTeams().map(t =>
      t.id === team.id ? { ...t, member_ids: t.member_ids.filter(id => id !== memberId) } : t
    );
    this.setItem(STORAGE_KEYS.TEAMS, teams);

    const users = this.getUsers().map(u => (u.id === memberId ? { ...u, team_id: undefined } : u));
    this.setItem(STORAGE_KEYS.USERS, users);
    this.notify();
    return { success: true };
  }

  public leaveTeam(user: User): void {
    const team = this.getMyTeam(user);
    if (!team) return;

    const remaining = team.member_ids.filter(id => id !== user.id);
    let teams: Team[];
    if (remaining.length === 0) {
      teams = this.getTeams().filter(t => t.id !== team.id);
    } else {
      const nextOwner = team.owner_id === user.id ? remaining[0] : team.owner_id;
      teams = this.getTeams().map(t =>
        t.id === team.id ? { ...t, member_ids: remaining, owner_id: nextOwner } : t
      );
    }
    this.setItem(STORAGE_KEYS.TEAMS, teams);

    const users = this.getUsers().map(u => (u.id === user.id ? { ...u, team_id: undefined } : u));
    this.setItem(STORAGE_KEYS.USERS, users);
    this.notify();
  }

  public isAuthenticated(): boolean {
    const sessionUserId = this.getItem<string | null>(STORAGE_KEYS.AUTH_SESSION, null);
    return !!sessionUserId && this.getUsers().some(u => u.id === sessionUserId);
  }

  public getSessionUser(): User | null {
    const sessionUserId = this.getItem<string | null>(STORAGE_KEYS.AUTH_SESSION, null);
    if (!sessionUserId) return null;
    return this.getUsers().find(u => u.id === sessionUserId) || null;
  }

  public signup(
    name: string,
    email: string,
    password: string,
    extra?: { location?: string; gender?: Gender }
  ): { user?: User; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim() || !trimmedEmail || !password) {
      return { error: 'Name, email, and password are all required.' };
    }
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === trimmedEmail)) {
      return { error: 'An account with that email already exists — try logging in instead.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: trimmedEmail,
      name: name.trim(),
      role: 'member',
      is_member: false,
      password,
      ...(extra?.location ? { location: extra.location.trim() } : {}),
      ...(extra?.gender ? { gender: extra.gender } : {}),
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    this.setItem(STORAGE_KEYS.AUTH_SESSION, newUser.id);
    this.notify();
    return { user: newUser };
  }

  public login(email: string, password: string): { user?: User; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const user = this.getUsers().find(u => u.email.toLowerCase() === trimmedEmail);
    if (!user || user.password !== password) {
      return { error: 'Incorrect email or password.' };
    }
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    this.setItem(STORAGE_KEYS.AUTH_SESSION, user.id);
    this.notify();
    return { user };
  }

  public logout(): void {
    this.setItem(STORAGE_KEYS.AUTH_SESSION, null);
    this.notify();
  }

  public toggleCurrentUserMembership(isMember?: boolean): void {
    const current = this.getCurrentUser();
    const users = this.getUsers().map(u => {
      if (u.id === current.id) {
        return { ...u, is_member: isMember !== undefined ? isMember : !u.is_member };
      }
      return u;
    });
    this.setItem(STORAGE_KEYS.USERS, users);
    this.notify();
  }

  public updateProfile(
    userId: string,
    updates: { name?: string; email?: string; password?: string; location?: string; gender?: Gender }
  ): { error?: string } {
    const trimmedName = updates.name?.trim();
    const trimmedEmail = updates.email?.trim().toLowerCase();

    if (trimmedName !== undefined && !trimmedName) {
      return { error: 'Name cannot be empty.' };
    }
    if (trimmedEmail !== undefined) {
      if (!trimmedEmail) {
        return { error: 'Email cannot be empty.' };
      }
      const users = this.getUsers();
      if (users.some(u => u.id !== userId && u.email.toLowerCase() === trimmedEmail)) {
        return { error: 'Another account already uses that email.' };
      }
    }
    if (updates.password !== undefined && updates.password.length < 4) {
      return { error: 'Password must be at least 4 characters.' };
    }

    const users = this.getUsers().map(u => {
      if (u.id !== userId) return u;
      return {
        ...u,
        ...(trimmedName !== undefined ? { name: trimmedName } : {}),
        ...(trimmedEmail !== undefined ? { email: trimmedEmail } : {}),
        ...(updates.password ? { password: updates.password } : {}),
        ...(updates.location !== undefined ? { location: updates.location.trim() } : {}),
        ...(updates.gender !== undefined ? { gender: updates.gender } : {}),
      };
    });
    this.setItem(STORAGE_KEYS.USERS, users);
    this.notify();
    return {};
  }

  public createUser(email: string, name: string, role: 'admin' | 'member', isMember = false): User {
    const users = this.getUsers();
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      is_member: isMember || role === 'admin',
    };
    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    this.notify();
    return newUser;
  }

  public getProblems(): ProblemStatement[] {
    return this.getItem(STORAGE_KEYS.PROBLEMS, SEED_PROBLEM_STATEMENTS);
  }

  public getProblemById(id: string): ProblemStatement | undefined {
    return this.getProblems().find(p => p.id === id);
  }

  public saveProblem(problem: Omit<ProblemStatement, 'id' | 'created_at'> & { id?: string }): ProblemStatement {
    const problems = this.getProblems();
    if (problem.id) {
      const index = problems.findIndex(p => p.id === problem.id);
      if (index >= 0) {
        problems[index] = { ...problems[index], ...problem } as ProblemStatement;
        this.setItem(STORAGE_KEYS.PROBLEMS, problems);
        this.notify();
        return problems[index];
      }
    }
    const newProblem: ProblemStatement = {
      ...problem,
      id: `prob-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    problems.unshift(newProblem);
    this.setItem(STORAGE_KEYS.PROBLEMS, problems);
    this.notify();
    return newProblem;
  }

  public deleteProblem(id: string): void {
    const problems = this.getProblems().filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PROBLEMS, problems);
    this.notify();
  }

  public getApplications(): FundingApplication[] {
    return this.getItem(STORAGE_KEYS.APPLICATIONS, SEED_APPLICATIONS);
  }

  public getUserApplications(userId: string): FundingApplication[] {
    return this.getApplications().filter(a => a.user_id === userId);
  }

  public getScopedApplications(user: User): FundingApplication[] {
    const ids = this.getScopeUserIds(user);
    return this.getApplications().filter(a => ids.includes(a.user_id));
  }

  public upsertApplication(
    appData: Omit<FundingApplication, 'id' | 'status' | 'submitted_at'> & { id?: string },
    status: 'Draft' | 'Pending'
  ): FundingApplication {
    const apps = this.getApplications();
    const problem = this.getProblemById(appData.problem_statement_id);
    const problem_title = problem ? problem.title : appData.problem_title;

    if (appData.id) {
      const idx = apps.findIndex(a => a.id === appData.id);
      if (idx >= 0) {
        const wasDraft = apps[idx].status === 'Draft';
        apps[idx] = {
          ...apps[idx],
          ...appData,
          problem_title,
          status,
          submitted_at: status === 'Pending' && wasDraft ? new Date().toISOString() : apps[idx].submitted_at,
        };
        this.setItem(STORAGE_KEYS.APPLICATIONS, apps);
        this.notify();
        return apps[idx];
      }
    }

    const newApp: FundingApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      problem_title,
      status,
      submitted_at: new Date().toISOString(),
    };
    apps.unshift(newApp);
    this.setItem(STORAGE_KEYS.APPLICATIONS, apps);
    this.notify();
    return newApp;
  }

  public deleteApplication(id: string): void {
    const apps = this.getApplications().filter(a => a.id !== id);
    this.setItem(STORAGE_KEYS.APPLICATIONS, apps);
    this.notify();
  }

  public updateApplicationStatus(id: string, status: ApplicationStatus, adminFeedback?: string): void {
    const apps = this.getApplications().map(a => {
      if (a.id === id) {
        return {
          ...a,
          status,
          admin_feedback: adminFeedback !== undefined ? adminFeedback : a.admin_feedback,
          reviewed_at: new Date().toISOString(),
        };
      }
      return a;
    });
    this.setItem(STORAGE_KEYS.APPLICATIONS, apps);

    const app = apps.find(a => a.id === id);
    if (app && (status === 'Approved' || status === 'Rejected')) {
      this.addNotification(
        app.user_id,
        'application_status',
        status === 'Approved' ? 'Funding application approved 🎉' : 'Funding application update',
        `Your application for "${app.problem_title}" was ${status.toLowerCase()}.${app.admin_feedback ? ` "${app.admin_feedback}"` : ''}`
      );
    }
    this.notify();
  }

  public getWorkingProblemIds(userId: string): string[] {
    const all = this.getItem<Record<string, string[]>>(STORAGE_KEYS.WORKING_PROBLEMS, {});
    return all[userId] || [];
  }

  public addWorkingProblem(userId: string, problemId: string): void {
    const all = this.getItem<Record<string, string[]>>(STORAGE_KEYS.WORKING_PROBLEMS, {});
    const existing = all[userId] || [];
    if (!existing.includes(problemId)) {
      all[userId] = [...existing, problemId];
      this.setItem(STORAGE_KEYS.WORKING_PROBLEMS, all);
      this.notify();
    }
  }

  public removeWorkingProblem(userId: string, problemId: string): void {
    const all = this.getItem<Record<string, string[]>>(STORAGE_KEYS.WORKING_PROBLEMS, {});
    all[userId] = (all[userId] || []).filter(id => id !== problemId);
    this.setItem(STORAGE_KEYS.WORKING_PROBLEMS, all);
    this.notify();
  }

  public clearWorkingProblems(userId: string): void {
    const all = this.getItem<Record<string, string[]>>(STORAGE_KEYS.WORKING_PROBLEMS, {});
    all[userId] = [];
    this.setItem(STORAGE_KEYS.WORKING_PROBLEMS, all);
    this.notify();
  }

  public getSavedProblemIds(userId: string): string[] {
    const all = this.getItem<Record<string, string[]>>(STORAGE_KEYS.SAVED_PROBLEMS, {});
    return all[userId] || [];
  }

  public isProblemSaved(userId: string, problemId: string): boolean {
    return this.getSavedProblemIds(userId).includes(problemId);
  }

  public toggleSavedProblem(userId: string, problemId: string): void {
    const all = this.getItem<Record<string, string[]>>(STORAGE_KEYS.SAVED_PROBLEMS, {});
    const existing = all[userId] || [];
    all[userId] = existing.includes(problemId)
      ? existing.filter(id => id !== problemId)
      : [...existing, problemId];
    this.setItem(STORAGE_KEYS.SAVED_PROBLEMS, all);
    this.notify();
  }

  public resetCategoryProgress(userId: string, categoryId: string): void {
    const progressList = this.getItem<UserProgress[]>(STORAGE_KEYS.PROGRESS, SEED_PROGRESS);
    const remaining = progressList.filter(p => !(p.user_id === userId && p.category_id === categoryId));
    this.setItem(STORAGE_KEYS.PROGRESS, remaining);
    this.notify();
  }

  public getProjectNote(userId: string, problemId: string): string {
    const all = this.getItem<Record<string, Record<string, string>>>(STORAGE_KEYS.PROJECT_NOTES, {});
    return all[userId]?.[problemId] || '';
  }

  public setProjectNote(userId: string, problemId: string, note: string): void {
    const all = this.getItem<Record<string, Record<string, string>>>(STORAGE_KEYS.PROJECT_NOTES, {});
    all[userId] = { ...(all[userId] || {}), [problemId]: note };
    this.setItem(STORAGE_KEYS.PROJECT_NOTES, all);
    this.notify();
  }

  public getCategories(): Category[] {
    const cats = this.getItem(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
    return [...cats].sort((a, b) => a.order - b.order);
  }

  public saveCategory(category: Omit<Category, 'id'> & { id?: string }): Category {
    const cats = this.getCategories();
    if (category.id) {
      const idx = cats.findIndex(c => c.id === category.id);
      if (idx >= 0) {
        cats[idx] = { ...cats[idx], ...category } as Category;
        this.setItem(STORAGE_KEYS.CATEGORIES, cats);
        this.notify();
        return cats[idx];
      }
    }
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    cats.push(newCat);
    this.setItem(STORAGE_KEYS.CATEGORIES, cats);
    this.notify();
    return newCat;
  }

  public deleteCategory(id: string): void {
    const cats = this.getCategories().filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.CATEGORIES, cats);
    const steps = this.getSteps().filter(s => s.category_id !== id);
    this.setItem(STORAGE_KEYS.STEPS, steps);
    this.notify();
  }

  public getSteps(categoryId?: string): Step[] {
    const steps = this.getItem<Step[]>(STORAGE_KEYS.STEPS, SEED_STEPS);
    const filtered = categoryId ? steps.filter(s => s.category_id === categoryId) : steps;
    return [...filtered].sort((a, b) => a.order - b.order);
  }

  public saveStep(step: Omit<Step, 'id'> & { id?: string }): Step {
    const steps = this.getSteps();
    if (step.id) {
      const idx = steps.findIndex(s => s.id === step.id);
      if (idx >= 0) {
        steps[idx] = { ...steps[idx], ...step } as Step;
        this.setItem(STORAGE_KEYS.STEPS, steps);
        this.notify();
        return steps[idx];
      }
    }
    const newStep: Step = {
      ...step,
      id: `step-${Date.now()}`,
    };
    steps.push(newStep);
    this.setItem(STORAGE_KEYS.STEPS, steps);
    this.notify();
    return newStep;
  }

  public deleteStep(id: string): void {
    const steps = this.getSteps().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.STEPS, steps);
    const resources = this.getResources().filter(r => r.step_id !== id);
    this.setItem(STORAGE_KEYS.RESOURCES, resources);
    this.notify();
  }

  public getResources(stepId?: string): Resource[] {
    const resources = this.getItem<Resource[]>(STORAGE_KEYS.RESOURCES, SEED_RESOURCES);
    return stepId ? resources.filter(r => r.step_id === stepId) : resources;
  }

  public getResourcesForUser(stepId: string, userId: string, problemId?: string): { common: Resource[]; recommended: Resource[] } {
    const resources = this.getResources(stepId);
    const common = resources.filter(r => !r.assigned_user_id);
    const recommended = resources.filter(r =>
      r.assigned_user_id === userId && (!r.assigned_problem_id || r.assigned_problem_id === problemId)
    );
    return { common, recommended };
  }

  public saveResource(res: Omit<Resource, 'id'> & { id?: string }): Resource {
    const resources = this.getResources();
    if (res.id) {
      const idx = resources.findIndex(r => r.id === res.id);
      if (idx >= 0) {
        resources[idx] = { ...resources[idx], ...res } as Resource;
        this.setItem(STORAGE_KEYS.RESOURCES, resources);
        this.notify();
        return resources[idx];
      }
    }
    const newRes: Resource = {
      ...res,
      id: `res-${Date.now()}`,
    };
    resources.push(newRes);
    this.setItem(STORAGE_KEYS.RESOURCES, resources);
    this.notify();
    return newRes;
  }

  public deleteResource(id: string): void {
    const resources = this.getResources().filter(r => r.id !== id);
    this.setItem(STORAGE_KEYS.RESOURCES, resources);
    this.notify();
  }

  public getAllProgress(): UserProgress[] {
    return this.getItem<UserProgress[]>(STORAGE_KEYS.PROGRESS, SEED_PROGRESS);
  }

  public getAllWorkingProblems(): Record<string, string[]> {
    return this.getItem<Record<string, string[]>>(STORAGE_KEYS.WORKING_PROBLEMS, {});
  }

  public getUserProgress(userId: string, categoryId: string): Record<string, boolean> {
    const progress = this.getItem<UserProgress[]>(STORAGE_KEYS.PROGRESS, SEED_PROGRESS);
    const map: Record<string, boolean> = {};
    progress
      .filter(p => p.user_id === userId && p.category_id === categoryId)
      .forEach(p => {
        map[p.step_id] = p.completed;
      });
    return map;
  }

  public toggleStepProgress(userId: string, categoryId: string, stepId: string): boolean {
    const progressList = this.getItem<UserProgress[]>(STORAGE_KEYS.PROGRESS, SEED_PROGRESS);
    const index = progressList.findIndex(
      p => p.user_id === userId && p.category_id === categoryId && p.step_id === stepId
    );

    let newStatus = true;
    if (index >= 0) {
      newStatus = !progressList[index].completed;
      progressList[index] = {
        ...progressList[index],
        completed: newStatus,
        updated_at: new Date().toISOString(),
      };
    } else {
      progressList.push({
        user_id: userId,
        category_id: categoryId,
        step_id: stepId,
        completed: true,
        updated_at: new Date().toISOString(),
      });
      newStatus = true;
    }

    this.setItem(STORAGE_KEYS.PROGRESS, progressList);
    this.notify();
    return newStatus;
  }

  public getAllStepSubmissions(): StepSubmission[] {
    return this.getItem<StepSubmission[]>(STORAGE_KEYS.STEP_SUBMISSIONS, []);
  }

  public getStepSubmissionsForStep(stepId: string, scopeUserIds?: string[]): StepSubmission[] {
    return this.getAllStepSubmissions()
      .filter(s => s.step_id === stepId && (!scopeUserIds || scopeUserIds.includes(s.user_id)))
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public getPendingStepSubmissions(): StepSubmission[] {
    return this.getAllStepSubmissions()
      .filter(s => s.status === 'Submitted')
      .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
  }

  private stepWorkspaceKey(scopeKey: string, problemId: string, stepId: string): string {
    return `${scopeKey}::${problemId}::${stepId}`;
  }

  public getStepWorkspace(scopeKey: string, problemId: string, stepId: string): StepWorkspace | null {
    const all = this.getItem<Record<string, StepWorkspace>>(STORAGE_KEYS.STEP_WORKSPACES, {});
    return all[this.stepWorkspaceKey(scopeKey, problemId, stepId)] || null;
  }

  public saveStepWorkspace(scopeKey: string, problemId: string, stepId: string, workspace: StepWorkspace): void {
    const all = this.getItem<Record<string, StepWorkspace>>(STORAGE_KEYS.STEP_WORKSPACES, {});
    all[this.stepWorkspaceKey(scopeKey, problemId, stepId)] = { ...workspace, updated_at: new Date().toISOString() };
    this.setItem(STORAGE_KEYS.STEP_WORKSPACES, all);
    this.notify();
  }

  public submitStepEvidence(payload: {
    step_id: string;
    category_id: string;
    problem_id: string;
    user_id: string;
    submitted_by_name: string;
    note: string;
    files: SubmissionFile[];
  }): StepSubmission {
    const all = this.getAllStepSubmissions();
    const newSubmission: StepSubmission = {
      ...payload,
      id: `sub-${Date.now()}`,
      status: 'Submitted',
      submitted_at: new Date().toISOString(),
    };
    all.unshift(newSubmission);
    this.setItem(STORAGE_KEYS.STEP_SUBMISSIONS, all);
    this.notify();
    return newSubmission;
  }

  public reviewStepSubmission(id: string, status: SubmissionStatus, adminFeedback?: string): void {
    const all = this.getAllStepSubmissions();
    const updated = all.map(s =>
      s.id === id
        ? { ...s, status, admin_feedback: adminFeedback, reviewed_at: new Date().toISOString() }
        : s
    );
    this.setItem(STORAGE_KEYS.STEP_SUBMISSIONS, updated);

    const submission = updated.find(s => s.id === id);
    if (submission && status !== 'Submitted') {
      this.addNotification(
        submission.user_id,
        'submission_review',
        status === 'Approved' ? 'Evidence approved ✅' : 'Changes requested on your submission',
        `Your submission for a roadmap step was reviewed: ${status}.${adminFeedback ? ` "${adminFeedback}"` : ''}`
      );
    }
    this.notify();
  }

  public deleteStepSubmission(id: string): void {
    const all = this.getAllStepSubmissions().filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.STEP_SUBMISSIONS, all);
    this.notify();
  }
}

export const store = new LocalDataStore();
