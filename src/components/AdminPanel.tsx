import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Plus, Trash2, Edit, Check, X, Clock, CheckCircle2,
  XCircle, ListFilter, AlertCircle, Hospital,
  Users, FolderPlus, FileText, ChevronDown, Layers, ShieldOff, Copy,
  BarChart3, TrendingUp, Paperclip, Download, MessageSquareWarning
} from 'lucide-react';
import {
  ProblemStatement, FundingApplication, Category, Step, Resource,
  ApplicationStatus, ResourceType, User, SubmissionStatus
} from '../types';
import { store } from '../services/store';
import { SimpleBarChart, SimpleLineChart } from './ui/Charts';

interface AdminPanelProps {
  currentUser: User;
  onNavigateToTab: (tab: string) => void;
}

type AdminTab = 'applications' | 'problems' | 'categories' | 'steps' | 'resources' | 'users' | 'analytics' | 'submissions';

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onNavigateToTab }) => {
  const [adminTab, setAdminTab] = useState<AdminTab>('applications');
  const [showSectionMenu, setShowSectionMenu] = useState(false);

  const problems = store.getProblems();
  const [editingProblem, setEditingProblem] = useState<Partial<ProblemStatement> | null>(null);

  const applications = store.getApplications().filter(a => a.status !== 'Draft');
  const [applicationFilter, setApplicationFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const categories = store.getCategories();
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const [selectedCategoryIdForSteps, setSelectedCategoryIdForSteps] = useState<string>(categories[0]?.id || 'cat-1');
  const categorySteps = store.getSteps(selectedCategoryIdForSteps);
  const [editingStep, setEditingStep] = useState<Partial<Step> | null>(null);

  const [selectedStepIdForResources, setSelectedStepIdForResources] = useState<string>(categorySteps[0]?.id || '');
  const stepResources = store.getResources(selectedStepIdForResources);
  const commonStepResources = stepResources.filter(r => !r.assigned_user_id);
  const recommendedStepResources = stepResources.filter(r => !!r.assigned_user_id);
  const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);

  const allUsers = store.getUsers();
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const allSubmissions = store.getAllStepSubmissions();
  const [submissionFilter, setSubmissionFilter] = useState<'all' | SubmissionStatus>('Submitted');
  const [submissionFeedback, setSubmissionFeedback] = useState<Record<string, string>>({});


  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProblem?.title || !editingProblem.description) return;
    store.saveProblem({
      id: editingProblem.id,
      title: editingProblem.title,
      description: editingProblem.description,
      department: editingProblem.department || 'General Clinical',
      funded: editingProblem.funded ?? false,
      funding_amount: editingProblem.funding_amount || (editingProblem.funded ? '$100,000 Grant Pool' : 'Unfunded'),
      created_by_admin: currentUser.id,
    });
    setEditingProblem(null);
  };

  const handleDeleteProblem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this problem statement?')) {
      store.deleteProblem(id);
    }
  };

  const handleReviewApplication = (id: string, status: ApplicationStatus) => {
    const feedback = reviewNotes[id] || (status === 'Approved' ? 'Proposal approved by clinical review panel.' : 'Application does not meet current stage eligibility criteria.');
    store.updateApplicationStatus(id, status, feedback);
  };

  const handleReopenApplication = (id: string) => {
    store.updateApplicationStatus(id, 'Pending');
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;
    store.saveCategory({
      id: editingCategory.id,
      name: editingCategory.name,
      description: editingCategory.description || '',
      order: Number(editingCategory.order || (categories.length + 1)),
    });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Delete category and its attached steps?')) {
      store.deleteCategory(id);
      if (selectedCategoryIdForSteps === id) {
        setSelectedCategoryIdForSteps(categories[0]?.id || '');
      }
    }
  };

  const handleSaveStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStep?.name) return;
    store.saveStep({
      id: editingStep.id,
      category_id: selectedCategoryIdForSteps,
      name: editingStep.name,
      description: editingStep.description || '',
      order: Number(editingStep.order || (categorySteps.length + 1)),
      stage_tag: editingStep.stage_tag || 'Milestone',
    });
    setEditingStep(null);
  };

  const handleDeleteStep = (id: string) => {
    if (window.confirm('Delete this step and attached resources?')) {
      store.deleteStep(id);
      if (selectedStepIdForResources === id) {
        setSelectedStepIdForResources('');
      }
    }
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource?.title || !selectedStepIdForResources) return;
    store.saveResource({
      id: editingResource.id,
      step_id: selectedStepIdForResources,
      type: editingResource.type || 'session',
      title: editingResource.title,
      description: editingResource.description || '',
      link: editingResource.link || '',
      date: editingResource.date || '',
      host_or_speaker: editingResource.host_or_speaker || '',
      hospital_name: editingResource.hospital_name || '',
      clinical_department: editingResource.clinical_department || '',
      contact_person: editingResource.contact_person || '',
      contact_email: editingResource.contact_email || '',
      pilot_status: editingResource.pilot_status || '',
      assigned_user_id: editingResource.assigned_user_id || undefined,
      assigned_problem_id: editingResource.assigned_user_id ? (editingResource.assigned_problem_id || undefined) : undefined,
    });
    setEditingResource(null);
  };

  const handleSetUserRole = (user: User, role: 'admin' | 'member') => {
    if (user.id === currentUser.id && role === 'member') {
      if (!window.confirm("Revoke your own admin access? You'll immediately lose access to this Admin Panel.")) return;
    }
    store.setUserRole(user.id, role);
  };

  const handleCopyUserId = (userId: string) => {
    navigator.clipboard?.writeText(userId).catch(() => {});
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 1200);
  };

  const handleDeleteResource = (id: string) => {
    if (window.confirm('Delete this resource?')) {
      store.deleteResource(id);
    }
  };

  const handleReviewSubmission = (id: string, status: SubmissionStatus) => {
    const feedback = submissionFeedback[id] || (
      status === 'Approved' ? 'Evidence reviewed and accepted.' : 'Please revise and resubmit with more detail.'
    );
    store.reviewStepSubmission(id, status, feedback);
  };

  const handleReopenSubmission = (id: string) => {
    store.reviewStepSubmission(id, 'Submitted');
  };

  const handleDeleteSubmission = (id: string) => {
    if (window.confirm('Delete this submission? This removes it and its files permanently.')) {
      store.deleteStepSubmission(id);
    }
  };

  const filteredApplications = applications.filter(a =>
    applicationFilter === 'all' ? true : a.status === applicationFilter
  );

  const filteredSubmissions = allSubmissions.filter(s =>
    submissionFilter === 'all' ? true : s.status === submissionFilter
  );

  const ADMIN_SECTIONS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: 'applications', label: `Funding Queue (${applications.filter(a => a.status === 'Pending').length} Pending)`, icon: FileText },
    { id: 'problems', label: `Problem Statements (${problems.length})`, icon: ListFilter },
    { id: 'categories', label: `Categories (${categories.length} Configurable)`, icon: FolderPlus },
    { id: 'steps', label: 'Category Steps & Roadmaps', icon: Layers },
    { id: 'resources', label: 'Step Resources & Hospital Hub', icon: Hospital },
    { id: 'submissions', label: `Step Submissions (${allSubmissions.filter(s => s.status === 'Submitted').length} Pending)`, icon: Paperclip },
    { id: 'users', label: `Users & Access (${allUsers.length})`, icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[var(--nxt-ink-fixed)] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[var(--nxt-lavender-strong)]/20 text-[var(--nxt-lavender)] border border-[var(--nxt-lavender-strong)]/30">
              <Shield className="w-5 h-5 text-[var(--nxt-lavender-deep)]" />
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold">Admin Management Console</h1>
          </div>
          <p className="text-xs sm:text-sm text-white/70">
            Manage clinical problem statements, review grant applications, and configure categories, steps, and hospital resources.
          </p>
        </div>
      </div>

      <div className="relative inline-block">
        <button
          id="btn-admin-section-switcher"
          onClick={() => setShowSectionMenu(!showSectionMenu)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl shadow-sm hover:border-[var(--nxt-mint-strong)]/40 transition-colors"
        >
          {(() => {
            const current = ADMIN_SECTIONS.find(s => s.id === adminTab) || ADMIN_SECTIONS[0];
            const Icon = current.icon;
            return (
              <>
                <span className="p-1 rounded-lg bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs sm:text-sm font-bold text-[var(--nxt-ink)]">{current.label}</span>
              </>
            );
          })()}
          <ChevronDown className={`w-3.5 h-3.5 text-[var(--nxt-ink-soft)] transition-transform ${showSectionMenu ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showSectionMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSectionMenu(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 mt-2 w-80 bg-[var(--nxt-surface)] rounded-2xl shadow-lg border border-[var(--nxt-line)] py-2 z-50"
              >
                <p className="px-3 pt-1 pb-2 text-[11px] font-bold uppercase tracking-widest text-[var(--nxt-ink-soft)]">
                  Editing
                </p>
                {ADMIN_SECTIONS.map(section => {
                  const isActive = adminTab === section.id;
                  return (
                    <button
                      key={section.id}
                      id={`admin-section-${section.id}`}
                      onClick={() => { setAdminTab(section.id); setShowSectionMenu(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-[var(--nxt-mint)]/50 text-[var(--nxt-mint-deep)] font-bold'
                          : 'text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] hover:text-[var(--nxt-ink)]'
                      }`}
                    >
                      <section.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{section.label}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-[var(--nxt-mint-strong)]" />}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {adminTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--nxt-surface)] p-4 rounded-xl border border-[var(--nxt-line)] shadow-sm">
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)]">Grant Applications Review Queue</h3>
              <p className="text-xs text-[var(--nxt-ink-soft)]">Review entrepreneur pitches, check requested capital, and Approve or Reject.</p>
            </div>

            <div className="flex items-center gap-1">
              {(['all', 'Pending', 'Approved', 'Rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setApplicationFilter(status)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors ${
                    applicationFilter === status
                      ? 'bg-[var(--nxt-ink-fixed)] text-white'
                      : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-line)]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center bg-[var(--nxt-surface)] rounded-xl border border-dashed border-[var(--nxt-line)] text-xs text-[var(--nxt-ink-soft)]">
              No applications match the current filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map(app => (
                <div
                  key={app.id}
                  id={`admin-app-card-${app.id}`}
                  className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-[var(--nxt-line)]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[var(--nxt-mint-strong)] bg-[var(--nxt-mint)]/40 px-2 py-0.5 rounded">
                          {app.startup_name}
                        </span>
                        <span className="text-xs text-[var(--nxt-ink-soft)]">•</span>
                        <span className="text-xs text-[var(--nxt-ink-soft)]">
                          Lead: {app.applicant_name} ({app.applicant_email})
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--nxt-ink)]">
                        Problem: {app.problem_title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-[var(--nxt-ink-soft)] font-semibold uppercase">Requested</p>
                        <p className="text-sm font-extrabold text-[var(--nxt-mint-strong)]">
                          ${app.amount_requested.toLocaleString('en-US')}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        app.status === 'Approved' ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]' :
                        'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-1">
                      Proposed Solution & Technical Pitch
                    </p>
                    <p className="text-xs text-[var(--nxt-ink-soft)] bg-[var(--nxt-bg-soft)] p-3 rounded-lg border border-[var(--nxt-line)] leading-relaxed">
                      {app.pitch}
                    </p>
                  </div>

                  {app.supporting_notes && (
                    <div>
                      <p className="text-[10px] font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-1">
                        Supporting Notes & Clinical Readiness
                      </p>
                      <p className="text-xs text-[var(--nxt-ink-soft)]">{app.supporting_notes}</p>
                    </div>
                  )}

                  {app.status === 'Pending' ? (
                    <div className="pt-2 border-t border-[var(--nxt-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Admin feedback / reviewer notes for applicant..."
                          defaultValue={app.admin_feedback || ''}
                          onChange={(e) => setReviewNotes({ ...reviewNotes, [app.id]: e.target.value })}
                          className="w-full text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[var(--nxt-mint-strong)]"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-approve-app-${app.id}`}
                          onClick={() => handleReviewApplication(app.id, 'Approved')}
                          className="px-3 py-1.5 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          id={`btn-reject-app-${app.id}`}
                          onClick={() => handleReviewApplication(app.id, 'Rejected')}
                          className="px-3 py-1.5 bg-[var(--nxt-peach-deep)] hover:opacity-90 text-white rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[var(--nxt-line)] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-1">
                          Reviewer Feedback
                        </p>
                        <p className={`text-xs rounded-lg px-2.5 py-1.5 border ${
                          app.status === 'Approved'
                            ? 'bg-[var(--nxt-mint)]/30 border-[var(--nxt-mint-strong)]/20 text-[var(--nxt-mint-deep)]'
                            : 'bg-[var(--nxt-peach)]/40 border-[var(--nxt-peach-deep)]/20 text-[var(--nxt-peach-deep)]'
                        }`}>
                          {app.admin_feedback || 'No feedback left.'}
                        </p>
                        {app.reviewed_at && (
                          <p className="text-[10px] text-[var(--nxt-ink-soft)] mt-1">
                            Reviewed {new Date(app.reviewed_at).toLocaleDateString('en-US')}
                          </p>
                        )}
                      </div>

                      <button
                        id={`btn-reopen-app-${app.id}`}
                        onClick={() => handleReopenApplication(app.id)}
                        className="shrink-0 px-3 py-1.5 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-semibold transition-colors"
                      >
                        Reopen for Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {adminTab === 'problems' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[var(--nxt-surface)] p-4 rounded-xl border border-[var(--nxt-line)] shadow-sm">
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)]">Problem Statements Management</h3>
              <p className="text-xs text-[var(--nxt-ink-soft)]">Create, edit, delete, or toggle Funded / Unfunded status on clinical problems.</p>
            </div>
            <button
              id="btn-admin-add-problem"
              onClick={() => setEditingProblem({ title: '', description: '', department: 'General Clinical', funded: true, funding_amount: '$150,000 Grant Pool' })}
              className="px-3 py-1.5 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Problem Statement</span>
            </button>
          </div>

          {editingProblem && (
            <form onSubmit={handleSaveProblem} className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-mint-strong)]/20 rounded-xl p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider">
                {editingProblem.id ? 'Edit Problem Statement' : 'New Problem Statement'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={editingProblem.title || ''}
                    onChange={(e) => setEditingProblem({ ...editingProblem, title: e.target.value })}
                    className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2 focus:ring-1 focus:ring-[var(--nxt-mint-strong)]"
                    placeholder="e.g. Real-Time Pediatric Respiratory Acoustic Monitor"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Clinical Department</label>
                  <input
                    type="text"
                    value={editingProblem.department || ''}
                    onChange={(e) => setEditingProblem({ ...editingProblem, department: e.target.value })}
                    className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                    placeholder="e.g. Critical Care & Anesthesiology"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Clinical Description</label>
                <textarea
                  rows={3}
                  required
                  value={editingProblem.description || ''}
                  onChange={(e) => setEditingProblem({ ...editingProblem, description: e.target.value })}
                  className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2 focus:ring-1 focus:ring-[var(--nxt-mint-strong)]"
                  placeholder="Describe clinical deterioration, standard-of-care bottlenecks, and required parameters..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="chk-funded"
                    checked={editingProblem.funded || false}
                    onChange={(e) => setEditingProblem({ ...editingProblem, funded: e.target.checked })}
                    className="w-4 h-4 text-[var(--nxt-mint-strong)] rounded"
                  />
                  <label htmlFor="chk-funded" className="text-xs font-semibold text-[var(--nxt-ink)]">
                    Mark as Funded (Active Grant Pool)
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Funding Pool Label</label>
                  <input
                    type="text"
                    value={editingProblem.funding_amount || ''}
                    onChange={(e) => setEditingProblem({ ...editingProblem, funding_amount: e.target.value })}
                    className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                    placeholder="e.g. $250,000 Non-Dilutive Grant Pool"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[var(--nxt-mint-strong)] text-white rounded-full text-xs font-semibold hover:bg-[var(--nxt-mint-deep)]"
                >
                  Save Problem Statement
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProblem(null)}
                  className="px-3 py-1.5 text-xs text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {problems.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-[var(--nxt-bg-soft)] transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--nxt-mint)]/40 text-[var(--nxt-mint-strong)]">
                        {p.department}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.funded ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]' : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]'
                      }`}>
                        {p.funded ? `Funded • ${p.funding_amount}` : 'Unfunded'}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--nxt-ink)]">{p.title}</h4>
                    <p className="text-xs text-[var(--nxt-ink-soft)] line-clamp-1 mt-0.5">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProblem(p)}
                      className="p-1.5 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint)]/40 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProblem(p.id)}
                      className="p-1.5 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] hover:bg-[var(--nxt-peach)]/50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[var(--nxt-surface)] p-4 rounded-xl border border-[var(--nxt-line)] shadow-sm">
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)]">Healthcare Startup Categories ({categories.length})</h3>
              <p className="text-xs text-[var(--nxt-ink-soft)]">Admin configurable list of 21 domains. Add, rename, or reorder categories.</p>
            </div>
            <button
              onClick={() => setEditingCategory({ name: '', description: '', order: categories.length + 1 })}
              className="px-3 py-1.5 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Category</span>
            </button>
          </div>

          {editingCategory && (
            <form onSubmit={handleSaveCategory} className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-mint-strong)]/20 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider">
                {editingCategory.id ? 'Edit Category' : 'New Healthcare Category'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                    placeholder="e.g. Wearable Biometric Sensor"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingCategory.order || 1}
                    onChange={(e) => setEditingCategory({ ...editingCategory, order: Number(e.target.value) })}
                    className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Description / Sub-domains</label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                  placeholder="e.g. Skin patches, ambulatory ECG, smart fabrics"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="px-4 py-1.5 bg-[var(--nxt-mint-strong)] text-white rounded-full text-xs font-semibold hover:bg-[var(--nxt-mint-deep)]">
                  Save Category
                </button>
                <button type="button" onClick={() => setEditingCategory(null)} className="px-3 py-1.5 text-xs text-[var(--nxt-ink-soft)]">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] font-semibold border-b border-[var(--nxt-line)]">
                <tr>
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-4">Category Name</th>
                  <th className="py-2.5 px-4 hidden sm:table-cell">Description</th>
                  <th className="py-2.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--nxt-bg-soft)]">
                    <td className="py-2.5 px-4 font-bold text-[var(--nxt-ink-soft)]">{c.order}</td>
                    <td className="py-2.5 px-4 font-bold text-[var(--nxt-ink)]">
                      {c.name}
                      <p className="sm:hidden text-[10px] text-[var(--nxt-ink-soft)] font-normal">{c.description}</p>
                    </td>
                    <td className="py-2.5 px-4 text-[var(--nxt-ink-soft)] hidden sm:table-cell">{c.description}</td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingCategory(c)}
                          className="p-1 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-mint-strong)] rounded"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'steps' && (
        <div className="space-y-4">
          <div className="bg-[var(--nxt-surface)] p-4 rounded-xl border border-[var(--nxt-line)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)]">Category-Specific Steps Configurator</h3>
              <p className="text-xs text-[var(--nxt-ink-soft)]">Each category has its own distinct ordered list of steps.</p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[var(--nxt-ink-soft)] shrink-0">Select Category:</label>
              <select
                value={selectedCategoryIdForSteps}
                onChange={(e) => setSelectedCategoryIdForSteps(e.target.value)}
                className="text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-lg p-1.5 font-bold text-[var(--nxt-ink)]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    #{c.order} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold text-[var(--nxt-ink-soft)]">
              Steps for "{categories.find(c => c.id === selectedCategoryIdForSteps)?.name}" ({categorySteps.length})
            </span>
            <button
              onClick={() => setEditingStep({ name: '', description: '', order: categorySteps.length + 1, stage_tag: 'Milestone' })}
              className="px-3 py-1 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Step to this Category</span>
            </button>
          </div>

          {editingStep && (
            <form onSubmit={handleSaveStep} className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-mint-strong)]/20 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider">
                {editingStep.id ? 'Edit Step' : 'Add Step to Category'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Step Name</label>
                  <input
                    type="text"
                    required
                    value={editingStep.name || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, name: e.target.value })}
                    className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                    placeholder="e.g. Clinical Validation & Usability Testing"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Step Order (1, 2, 3...)</label>
                  <input
                    type="number"
                    value={editingStep.order || 1}
                    onChange={(e) => setEditingStep({ ...editingStep, order: Number(e.target.value) })}
                    className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Stage Tag</label>
                  <input
                    type="text"
                    value={editingStep.stage_tag || ''}
                    onChange={(e) => setEditingStep({ ...editingStep, stage_tag: e.target.value })}
                    className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                    placeholder="e.g. Clinical Validation, Regulatory, Feasibility"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Step Description & Objectives</label>
                <textarea
                  rows={2}
                  value={editingStep.description || ''}
                  onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                  placeholder="Explain what the entrepreneur must achieve in this milestone..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="px-4 py-1.5 bg-[var(--nxt-mint-strong)] text-white rounded-full text-xs font-semibold hover:bg-[var(--nxt-mint-deep)]">
                  Save Step
                </button>
                <button type="button" onClick={() => setEditingStep(null)} className="px-3 py-1.5 text-xs text-[var(--nxt-ink-soft)]">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {categorySteps.length === 0 ? (
              <div className="p-6 text-center bg-[var(--nxt-surface)] rounded-xl border border-dashed border-[var(--nxt-line)] text-xs text-[var(--nxt-ink-soft)]">
                No steps defined for this category yet. Click "Add Step to this Category" above.
              </div>
            ) : (
              categorySteps.map((step) => {
                const resources = store.getResources(step.id);
                return (
                  <div
                    key={step.id}
                    className="p-3 bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] flex items-center justify-between gap-3 shadow-sm hover:border-[var(--nxt-line)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] font-bold flex items-center justify-center text-xs">
                        {step.order}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--nxt-ink)]">{step.name}</span>
                          {step.stage_tag && (
                            <span className="text-[10px] bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] px-1.5 py-0.2 rounded font-semibold">
                              {step.stage_tag}
                            </span>
                          )}
                          <span className="text-[10px] bg-[var(--nxt-mint)]/40 text-[var(--nxt-mint-strong)] px-1.5 py-0.2 rounded font-semibold">
                            {resources.length} Resources
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--nxt-ink-soft)] line-clamp-1">{step.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedStepIdForResources(step.id);
                          setAdminTab('resources');
                        }}
                        className="px-2 py-1 text-[11px] font-semibold text-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint)]/40 rounded"
                        title="Manage Resources"
                      >
                        Resources →
                      </button>
                      <button
                        onClick={() => setEditingStep(step)}
                        className="p-1 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-mint-strong)] rounded"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-1 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {adminTab === 'resources' && (
        <div className="space-y-4">
          <div className="bg-[var(--nxt-surface)] p-4 rounded-xl border border-[var(--nxt-line)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)]">Step Resources & Hospital Connections Hub</h3>
              <p className="text-xs text-[var(--nxt-ink-soft)]">
                Attach webinars, sessions, or hospital validation contacts directly to steps.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-[var(--nxt-ink-soft)] shrink-0">Attached Step:</label>
              <select
                value={selectedStepIdForResources}
                onChange={(e) => setSelectedStepIdForResources(e.target.value)}
                className="text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-lg p-1.5 font-bold text-[var(--nxt-ink)] max-w-xs"
              >
                {store.getSteps().map(s => {
                  const cat = categories.find(c => c.id === s.category_id);
                  return (
                    <option key={s.id} value={s.id}>
                      [{cat?.name || 'Cat'}] Step {s.order}: {s.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold text-[var(--nxt-ink-soft)]">
              Assigned Resources ({stepResources.length})
            </span>

            <div className="flex items-center gap-2">
              <button
                id="btn-add-hospital-conn"
                onClick={() => setEditingResource({
                  type: 'hospital_connection',
                  title: '',
                  description: '',
                  hospital_name: '',
                  clinical_department: '',
                  contact_person: '',
                  contact_email: '',
                  pilot_status: 'Accepting Pilot Applications'
                })}
                className="px-3 py-1 bg-[var(--nxt-lavender-strong)] hover:bg-[var(--nxt-lavender-deep)] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Hospital className="w-3.5 h-3.5" />
                <span>+ Hospital Connection</span>
              </button>

              <button
                id="btn-add-generic-resource"
                onClick={() => setEditingResource({
                  type: 'session',
                  title: '',
                  description: '',
                  link: '',
                  date: '',
                  host_or_speaker: ''
                })}
                className="px-3 py-1 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Generic Resource (Session/Webinar)</span>
              </button>
            </div>
          </div>

          {editingResource && (
            <form onSubmit={handleSaveResource} className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-lavender-strong)]/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider">
                  {editingResource.id ? 'Edit Resource' : 'Add New Resource'}
                </h4>
                <div className="flex items-center gap-1">
                  <label className="text-[11px] font-bold text-[var(--nxt-ink-soft)]">Resource Type:</label>
                  <select
                    value={editingResource.type || 'session'}
                    onChange={(e) => setEditingResource({ ...editingResource, type: e.target.value as ResourceType })}
                    className="text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded p-1 font-semibold"
                  >
                    <option value="session">Expert Session (1-on-1)</option>
                    <option value="webinar">Webinar</option>
                    <option value="seminar">Seminar / Masterclass</option>
                    <option value="hospital_connection">🏥 Hospital Connection (Validation Directory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingResource.title || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                  className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                  placeholder="e.g. Johns Hopkins Device Testing Core or FDA 510(k) Pre-sub Masterclass"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingResource.description || ''}
                  onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                  className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                  placeholder="Resource overview or hospital testbed capabilities..."
                />
              </div>

              {editingResource.type === 'hospital_connection' ? (
                <div className="bg-[var(--nxt-lavender)]/50/50 p-3 rounded-xl border border-[var(--nxt-lavender-strong)]/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--nxt-lavender-strong)] mb-1">
                    <Hospital className="w-4 h-4 text-[var(--nxt-lavender-strong)]" />
                    <span>Hospital Directory Contact Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--nxt-ink-soft)]">Hospital / Health System Name</label>
                      <input
                        type="text"
                        value={editingResource.hospital_name || ''}
                        onChange={(e) => setEditingResource({ ...editingResource, hospital_name: e.target.value })}
                        className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded p-1.5"
                        placeholder="e.g. Mayo Clinic"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--nxt-ink-soft)]">Clinical Department</label>
                      <input
                        type="text"
                        value={editingResource.clinical_department || ''}
                        onChange={(e) => setEditingResource({ ...editingResource, clinical_department: e.target.value })}
                        className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded p-1.5"
                        placeholder="e.g. Surgical Innovation Center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--nxt-ink-soft)]">Contact / CMO Lead</label>
                      <input
                        type="text"
                        value={editingResource.contact_person || ''}
                        onChange={(e) => setEditingResource({ ...editingResource, contact_person: e.target.value })}
                        className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded p-1.5"
                        placeholder="e.g. Dr. Jane Smith, MD"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--nxt-ink-soft)]">Contact Email</label>
                      <input
                        type="email"
                        value={editingResource.contact_email || ''}
                        onChange={(e) => setEditingResource({ ...editingResource, contact_email: e.target.value })}
                        className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded p-1.5"
                        placeholder="trials@hospital.edu"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--nxt-ink-soft)]">Pilot Window Status</label>
                      <input
                        type="text"
                        value={editingResource.pilot_status || ''}
                        onChange={(e) => setEditingResource({ ...editingResource, pilot_status: e.target.value })}
                        className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded p-1.5"
                        placeholder="e.g. Reviewing Pilots Q2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Date / Schedule</label>
                    <input
                      type="text"
                      value={editingResource.date || ''}
                      onChange={(e) => setEditingResource({ ...editingResource, date: e.target.value })}
                      className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                      placeholder="e.g. Every Thursday 2pm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Speaker / Advisor</label>
                    <input
                      type="text"
                      value={editingResource.host_or_speaker || ''}
                      onChange={(e) => setEditingResource({ ...editingResource, host_or_speaker: e.target.value })}
                      className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                      placeholder="e.g. Dr. Vance, FDA Reviewer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Meeting / Resource URL</label>
                    <input
                      type="url"
                      value={editingResource.link || ''}
                      onChange={(e) => setEditingResource({ ...editingResource, link: e.target.value })}
                      className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg p-2"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              <div className="bg-[var(--nxt-surface)] p-3 rounded-xl border border-[var(--nxt-line)] space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--nxt-ink)]">
                  <input
                    type="checkbox"
                    checked={!!editingResource.assigned_user_id}
                    onChange={(e) => setEditingResource({
                      ...editingResource,
                      assigned_user_id: e.target.checked ? (editingResource.assigned_user_id || '') : undefined,
                      assigned_problem_id: e.target.checked ? editingResource.assigned_problem_id : undefined,
                    })}
                    className="w-4 h-4"
                  />
                  <span>Recommend to one specific user instead of everyone</span>
                </label>

                {editingResource.assigned_user_id !== undefined && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--nxt-ink-soft)] mb-1">User ID</label>
                      <input
                        type="text"
                        required
                        value={editingResource.assigned_user_id}
                        onChange={(e) => setEditingResource({ ...editingResource, assigned_user_id: e.target.value.trim() })}
                        className="w-full text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded p-1.5 font-mono"
                        placeholder="e.g. user-member-1"
                        list="admin-user-id-options"
                      />
                      <datalist id="admin-user-id-options">
                        {allUsers.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--nxt-ink-soft)] mb-1">Only for this project (optional)</label>
                      <select
                        value={editingResource.assigned_problem_id || ''}
                        onChange={(e) => setEditingResource({ ...editingResource, assigned_problem_id: e.target.value || undefined })}
                        className="w-full text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded p-1.5"
                      >
                        <option value="">Any project</option>
                        {problems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    </div>
                    <p className="text-[10px] text-[var(--nxt-ink-soft)] sm:col-span-2">
                      Look up a user's ID under Users &amp; Access — copy it from there and paste it here.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="px-4 py-1.5 bg-[var(--nxt-lavender-strong)] text-white rounded-lg text-xs font-semibold hover:bg-[var(--nxt-lavender-deep)]">
                  Save Resource
                </button>
                <button type="button" onClick={() => setEditingResource(null)} className="px-3 py-1.5 text-xs text-[var(--nxt-ink-soft)]">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider px-1">
                Common Resources ({commonStepResources.length})
              </p>
              {commonStepResources.length === 0 ? (
                <div className="p-6 text-center bg-[var(--nxt-surface)] rounded-xl border border-dashed border-[var(--nxt-line)] text-xs text-[var(--nxt-ink-soft)]">
                  No shared resources currently assigned to this step.
                </div>
              ) : (
                commonStepResources.map((r) => (
                  <AdminResourceRow key={r.id} resource={r} onEdit={() => setEditingResource(r)} onDelete={() => handleDeleteResource(r.id)} />
                ))
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[var(--nxt-mint-deep)] uppercase tracking-wider px-1">
                Recommended For You ({recommendedStepResources.length})
              </p>
              {recommendedStepResources.length === 0 ? (
                <div className="p-6 text-center bg-[var(--nxt-surface)] rounded-xl border border-dashed border-[var(--nxt-line)] text-xs text-[var(--nxt-ink-soft)]">
                  No personal recommendations yet. Check "Recommend to one specific user" above to add one.
                </div>
              ) : (
                recommendedStepResources.map((r) => {
                  const targetUser = allUsers.find(u => u.id === r.assigned_user_id);
                  const targetProblem = r.assigned_problem_id ? problems.find(p => p.id === r.assigned_problem_id) : null;
                  return (
                    <AdminResourceRow
                      key={r.id}
                      resource={r}
                      onEdit={() => setEditingResource(r)}
                      onDelete={() => handleDeleteResource(r.id)}
                      targetLabel={`${targetUser ? targetUser.name : r.assigned_user_id}${targetProblem ? ` · ${targetProblem.title}` : ''}`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-[var(--nxt-surface)] p-4 rounded-xl border border-[var(--nxt-line)] shadow-sm">
            <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)]">Users & Access</h3>
            <p className="text-xs text-[var(--nxt-ink-soft)]">
              Grant or revoke admin access, and copy a user's ID to target them with a personal resource recommendation.
            </p>
          </div>

          <div className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {allUsers.map(u => (
                <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--nxt-bg-soft)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-[var(--nxt-ink)]">{u.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'admin' ? 'bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)]' : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]'
                      }`}>
                        {u.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.is_member ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]' : 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]'
                      }`}>
                        {u.is_member ? 'PAYING MEMBER' : 'UNPAID'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--nxt-ink-soft)]">{u.email}</p>
                    <button
                      onClick={() => handleCopyUserId(u.id)}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-mint-strong)] bg-[var(--nxt-bg-soft)] hover:bg-[var(--nxt-mint)]/30 px-2 py-0.5 rounded transition-colors"
                      title="Copy user ID"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{u.id}</span>
                      {copiedUserId === u.id && <span className="text-[var(--nxt-mint-strong)] font-semibold">Copied!</span>}
                    </button>
                  </div>

                  <div className="shrink-0">
                    {u.role === 'admin' ? (
                      <button
                        id={`btn-revoke-admin-${u.id}`}
                        onClick={() => handleSetUserRole(u, 'member')}
                        className="px-3 py-1.5 border border-[var(--nxt-peach-deep)]/30 hover:bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ShieldOff className="w-3.5 h-3.5" />
                        <span>Revoke Admin</span>
                      </button>
                    ) : (
                      <button
                        id={`btn-grant-admin-${u.id}`}
                        onClick={() => handleSetUserRole(u, 'admin')}
                        className="px-3 py-1.5 bg-[var(--nxt-lavender-strong)] hover:bg-[var(--nxt-lavender-deep)] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Grant Admin</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--nxt-surface)] p-4 rounded-xl border border-[var(--nxt-line)] shadow-sm">
            <div>
              <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)]">Step Submissions Review</h3>
              <p className="text-xs text-[var(--nxt-ink-soft)]">Founders keep working while a submission is in review — this is an accountability trail, not a blocker.</p>
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'Submitted', 'Approved', 'Changes Requested'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setSubmissionFilter(status)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                    submissionFilter === status
                      ? 'bg-[var(--nxt-ink-fixed)] text-white'
                      : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-line)]'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="p-8 text-center bg-[var(--nxt-surface)] rounded-xl border border-dashed border-[var(--nxt-line)] text-xs text-[var(--nxt-ink-soft)]">
              No submissions match the current filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map(sub => {
                const step = store.getSteps().find(s => s.id === sub.step_id);
                const category = categories.find(c => c.id === sub.category_id);
                const problem = problems.find(p => p.id === sub.problem_id);

                return (
                  <div key={sub.id} className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-[var(--nxt-line)]">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold text-[var(--nxt-mint-strong)] bg-[var(--nxt-mint)]/40 px-2 py-0.5 rounded">
                            {sub.submitted_by_name}
                          </span>
                          <span className="text-xs text-[var(--nxt-ink-soft)]">•</span>
                          <span className="text-xs text-[var(--nxt-ink-soft)]">
                            {category?.name || 'Category'} — Step {step?.order}: {step?.name || 'Step'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[var(--nxt-ink)]">
                          For: {problem?.title || 'Unknown problem'}
                        </h4>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                        sub.status === 'Approved' ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]' :
                        sub.status === 'Changes Requested' ? 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]' :
                        'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    {sub.note && (
                      <div>
                        <p className="text-[10px] font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-1">Founder Note</p>
                        <p className="text-xs text-[var(--nxt-ink-soft)] bg-[var(--nxt-bg-soft)] p-3 rounded-lg border border-[var(--nxt-line)] leading-relaxed">{sub.note}</p>
                      </div>
                    )}

                    {sub.files.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-1">Attached Evidence ({sub.files.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {sub.files.map((f, i) => (
                            <a
                              key={i}
                              href={f.dataUrl}
                              download={f.name}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-lg text-[11px] font-semibold text-[var(--nxt-ink)] hover:border-[var(--nxt-mint-strong)]/40 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              <span className="truncate max-w-[160px]">{f.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {sub.status === 'Submitted' ? (
                      <div className="pt-2 border-t border-[var(--nxt-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Feedback for the founder..."
                            defaultValue={sub.admin_feedback || ''}
                            onChange={(e) => setSubmissionFeedback({ ...submissionFeedback, [sub.id]: e.target.value })}
                            className="w-full text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[var(--nxt-mint-strong)]"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReviewSubmission(sub.id, 'Approved')}
                            className="px-3 py-1.5 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReviewSubmission(sub.id, 'Changes Requested')}
                            className="px-3 py-1.5 bg-[var(--nxt-peach-deep)] hover:opacity-90 text-white rounded-full text-xs font-semibold shadow-sm flex items-center gap-1 transition-colors"
                          >
                            <MessageSquareWarning className="w-3.5 h-3.5" />
                            <span>Request Changes</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="p-1.5 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[var(--nxt-line)] flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-1">Reviewer Feedback</p>
                          <p className={`text-xs rounded-lg px-2.5 py-1.5 border ${
                            sub.status === 'Approved'
                              ? 'bg-[var(--nxt-mint)]/30 border-[var(--nxt-mint-strong)]/20 text-[var(--nxt-mint-deep)]'
                              : 'bg-[var(--nxt-peach)]/40 border-[var(--nxt-peach-deep)]/20 text-[var(--nxt-peach-deep)]'
                          }`}>
                            {sub.admin_feedback || 'No feedback left.'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleReopenSubmission(sub.id)}
                          className="shrink-0 px-3 py-1.5 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-semibold transition-colors"
                        >
                          Reopen for Review
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {adminTab === 'analytics' && (
        <AdminAnalytics />
      )}
    </div>
  );
};

const AdminResourceRow: React.FC<{
  resource: Resource;
  onEdit: () => void;
  onDelete: () => void;
  targetLabel?: string;
}> = ({ resource: r, onEdit, onDelete, targetLabel }) => (
  <div
    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
      targetLabel
        ? 'bg-[var(--nxt-mint)]/20 border-[var(--nxt-mint-strong)]/30'
        : r.type === 'hospital_connection' ? 'bg-[var(--nxt-lavender)]/40 border-[var(--nxt-lavender-strong)]/20' : 'bg-[var(--nxt-surface)] border-[var(--nxt-line)]'
    }`}
  >
    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
          r.type === 'hospital_connection' ? 'bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)]' : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]'
        }`}>
          {r.type.replace('_', ' ').toUpperCase()}
        </span>
        {r.hospital_name && (
          <span className="text-xs font-bold text-[var(--nxt-ink)]">{r.hospital_name}</span>
        )}
        {targetLabel && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--nxt-mint-strong)] text-white">
            For: {targetLabel}
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-[var(--nxt-ink)]">{r.title}</p>
      <p className="text-[11px] text-[var(--nxt-ink-soft)] line-clamp-1">{r.description}</p>
    </div>

    <div className="flex items-center gap-1 shrink-0">
      <button onClick={onEdit} className="p-1 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-mint-strong)] rounded" title="Edit">
        <Edit className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDelete} className="p-1 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] rounded" title="Delete">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

const AdminAnalytics: React.FC = () => {
  const problems = store.getProblems();
  const categories = store.getCategories();
  const applications = store.getApplications().filter(a => a.status !== 'Draft');
  const allProgress = store.getAllProgress();
  const workingProblemsMap = store.getAllWorkingProblems();
  const submissions = store.getAllStepSubmissions();

  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length;
  const approvalRate = applications.length > 0 ? Math.round((approvedCount / applications.length) * 100) : 0;

  const engagedScopes = new Set(allProgress.map(p => p.user_id));
  const scopesWithWorkingProblems = new Set(
    Object.entries(workingProblemsMap).filter(([, ids]) => ids.length > 0).map(([key]) => key)
  );

  const categoryStats = categories.map(cat => {
    const steps = store.getSteps(cat.id);
    const catProgress = allProgress.filter(p => p.category_id === cat.id);
    const scopes = Array.from(new Set(catProgress.map(p => p.user_id)));
    const avgPercent = steps.length === 0 || scopes.length === 0
      ? 0
      : Math.round(
          scopes.reduce((sum, scope) => {
            const done = catProgress.filter(p => p.user_id === scope && p.completed).length;
            return sum + (done / steps.length) * 100;
          }, 0) / scopes.length
        );
    return { category: cat, engagedScopes: scopes.length, avgPercent };
  }).sort((a, b) => b.engagedScopes - a.engagedScopes || b.avgPercent - a.avgPercent);

  const problemStats = problems.map(p => {
    const apps = applications.filter(a => a.problem_statement_id === p.id);
    const working = Object.values(workingProblemsMap).filter(ids => ids.includes(p.id)).length;
    return { problem: p, applicationCount: apps.length, approvedCount: apps.filter(a => a.status === 'Approved').length, workingCount: working };
  }).sort((a, b) => b.applicationCount - a.applicationCount);

  const stalledProblems = problemStats.filter(s => s.problem.funded && s.applicationCount === 0);

  const statusChartData = [
    { label: 'Pending', value: pendingCount, color: 'var(--nxt-peach-deep)' },
    { label: 'Approved', value: approvedCount, color: 'var(--nxt-mint-strong)' },
    { label: 'Rejected', value: rejectedCount, color: 'var(--nxt-blue-strong)' },
  ];

  const monthlyApplicationsData = (() => {
    const months: { key: string; label: string }[] = [];
    const cursor = new Date();
    cursor.setDate(1);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-US', { month: 'short' }) });
    }
    return months.map(({ key, label }) => {
      const value = applications.filter(a => {
        const d = new Date(a.submitted_at);
        return `${d.getFullYear()}-${d.getMonth()}` === key;
      }).length;
      return { label, value };
    });
  })();

  const funnelSteps = [
    { label: 'Problem Statements', value: problems.length, tone: 'mint' as const },
    { label: 'Applications Submitted', value: applications.length, tone: 'blue' as const },
    { label: 'Approved', value: approvedCount, tone: 'mint' as const },
    { label: 'Roadmaps Started', value: scopesWithWorkingProblems.size, tone: 'blue' as const },
    { label: 'Actively Tracking Progress', value: engagedScopes.size, tone: 'mint' as const },
  ];
  const funnelMax = Math.max(...funnelSteps.map(f => f.value), 1);

  return (
    <div className="space-y-4">
      <div className="bg-[var(--nxt-surface)] p-4 rounded-xl border border-[var(--nxt-line)] shadow-sm">
        <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)] flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[var(--nxt-blue-strong)]" />
          Platform Funnel
        </h3>
        <p className="text-xs text-[var(--nxt-ink-soft)]">From problem statement to active roadmap execution.</p>
      </div>

      <div className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] p-5 shadow-sm space-y-3">
        {funnelSteps.map(step => (
          <div key={step.label}>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-[var(--nxt-ink-soft)]">{step.label}</span>
              <span className="text-[var(--nxt-ink)] font-bold">{step.value}</span>
            </div>
            <div className="w-full h-2.5 bg-[var(--nxt-bg-soft)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  step.tone === 'blue' ? 'bg-[var(--nxt-blue-strong)]' : 'bg-[var(--nxt-mint-strong)]'
                }`}
                style={{ width: `${Math.max((step.value / funnelMax) * 100, step.value > 0 ? 3 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending Review', value: pendingCount, icon: Clock, tone: 'peach' as const },
          { label: 'Approval Rate', value: `${approvalRate}%`, icon: CheckCircle2, tone: 'mint' as const },
          { label: 'Rejected', value: rejectedCount, icon: XCircle, tone: 'peach' as const },
          { label: 'Step Submissions', value: submissions.length, icon: Paperclip, tone: 'blue' as const },
        ].map(tile => (
          <div key={tile.label} className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
              tile.tone === 'peach' ? 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]' :
              tile.tone === 'blue' ? 'bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]' :
              'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]'
            }`}>
              <tile.icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-extrabold text-[var(--nxt-ink)]">{tile.value}</p>
            <p className="text-[11px] text-[var(--nxt-ink-soft)] font-semibold">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] p-5 shadow-sm">
          <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-4">Applications by Status</h4>
          <SimpleBarChart data={statusChartData} />
        </div>
        <div className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] p-5 shadow-sm">
          <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-4">Applications Over Time</h4>
          <SimpleLineChart data={monthlyApplicationsData} />
        </div>
      </div>

      <div className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] p-5 shadow-sm">
        <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-3">Problems By Application Volume</h4>
        <div className="space-y-2">
          {problemStats.slice(0, 6).map(s => (
            <div key={s.problem.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--nxt-ink)] truncate">{s.problem.title}</p>
                <div className="w-full h-1.5 bg-[var(--nxt-bg-soft)] rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-[var(--nxt-mint-strong)] rounded-full"
                    style={{ width: `${problemStats[0].applicationCount > 0 ? (s.applicationCount / problemStats[0].applicationCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-bold text-[var(--nxt-ink-soft)] shrink-0">
                {s.applicationCount} apps • {s.approvedCount} approved
              </span>
            </div>
          ))}
        </div>
        {stalledProblems.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--nxt-line)]">
            <p className="text-[11px] font-bold text-[var(--nxt-peach-deep)] uppercase tracking-wider mb-1.5">
              Funded but Stalled — No Applications Yet ({stalledProblems.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stalledProblems.map(s => (
                <span key={s.problem.id} className="text-[11px] font-semibold bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] px-2 py-0.5 rounded-full">
                  {s.problem.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--nxt-surface)] rounded-xl border border-[var(--nxt-line)] p-5 shadow-sm">
        <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-3">Category Engagement & Completion</h4>
        <div className="space-y-2">
          {categoryStats.filter(c => c.engagedScopes > 0).slice(0, 8).map(c => (
            <div key={c.category.id} className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--nxt-ink)] truncate">#{c.category.order} {c.category.name}</p>
                <div className="w-full h-1.5 bg-[var(--nxt-bg-soft)] rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-[var(--nxt-blue-strong)] rounded-full" style={{ width: `${c.avgPercent}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-[var(--nxt-ink-soft)] shrink-0">
                {c.engagedScopes} founder{c.engagedScopes === 1 ? '' : 's'} • {c.avgPercent}% avg
              </span>
            </div>
          ))}
          {categoryStats.every(c => c.engagedScopes === 0) && (
            <p className="text-xs text-[var(--nxt-ink-soft)]">No roadmap activity tracked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
