import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Circle, ArrowRight, ArrowLeft, Hospital,
  Layers, Search, ChevronRight, Check, X, RotateCcw, Plus,
  FolderKanban, DollarSign, AlertCircle, Settings, Sparkles, Paperclip, Bookmark, Lock
} from 'lucide-react';
import { User, Step, ProblemStatement, Category } from '../types';
import { store } from '../services/store';
import { StepDetailModal } from './StepDetailModal';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { Reveal, RevealGroup, RevealItem, PillButton } from './ui/Reveal';

interface TaskManagementPageProps {
  currentUser: User | null;
  initialProblemId?: string;
  onOpenAdminPanel?: () => void;
  onOpenLogin: () => void;
  onOpenMembershipModal: () => void;
  onViewResources: (stepId: string) => void;
}

type View = 'problems' | 'categories' | 'roadmap';

const PREVIEW_UNLOCKED_STEPS = 3;

export const TaskManagementPage: React.FC<TaskManagementPageProps> = ({
  currentUser,
  initialProblemId,
  onOpenLogin,
  onOpenMembershipModal,
  onViewResources,
}) => {
  const categories = store.getCategories();
  const allProblems = store.getProblems();
  const scopeKey = currentUser ? store.getScopeKey(currentUser) : '';

  const [view, setView] = useState<View>('problems');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [settingsProblemId, setSettingsProblemId] = useState<string | null>(null);

  const workingProblemIds = store.getWorkingProblemIds(scopeKey);
  const workingProblems = allProblems.filter(p => workingProblemIds.includes(p.id));
  const unselectedProblems = allProblems.filter(p => !workingProblemIds.includes(p.id));

  const appliedProblemIds = new Set(
    currentUser
      ? store.getScopedApplications(currentUser).filter(a => a.status !== 'Draft').map(a => a.problem_statement_id)
      : []
  );
  const savedProblemIds = new Set(currentUser ? store.getSavedProblemIds(currentUser.id) : []);

  useEffect(() => {
    if (initialProblemId && currentUser) {
      store.addWorkingProblem(scopeKey, initialProblemId);
      setSelectedProblemId(initialProblemId);
      setSelectedCategoryId(null);
      setView('categories');
    }
  }, [initialProblemId, currentUser]);

  if (!currentUser || !currentUser.is_member) {
    return (
      <RoadmapTrailer
        isLoggedIn={!!currentUser}
        onOpenLogin={onOpenLogin}
        onOpenMembershipModal={onOpenMembershipModal}
      />
    );
  }

  const selectedProblem = allProblems.find(p => p.id === selectedProblemId) || null;
  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || null;

  const steps = selectedCategoryId ? store.getSteps(selectedCategoryId) : [];
  const userProgress = selectedCategoryId ? store.getUserProgress(scopeKey, selectedCategoryId) : {};
  const completedCount = useMemo(() => steps.filter(s => !!userProgress[s.id]).length, [steps, userProgress]);
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.description.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleToggleStep = (stepId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!selectedCategoryId) return;
    store.toggleStepProgress(scopeKey, selectedCategoryId, stepId);
  };

  const handleSelectProblem = (problemId: string) => {
    setSelectedProblemId(problemId);
    setSelectedCategoryId(null);
    setCategorySearch('');
    setView('categories');
  };

  const handleAddProblem = (problemId: string) => {
    store.addWorkingProblem(scopeKey, problemId);
    setShowPicker(false);
    handleSelectProblem(problemId);
  };

  const handleRemoveProblem = (problemId: string) => {
    store.removeWorkingProblem(scopeKey, problemId);
    if (problemId === selectedProblemId) {
      setSelectedProblemId(null);
      setSelectedCategoryId(null);
      setView('problems');
    }
  };

  const handleResetSelection = () => {
    if (window.confirm('Clear every problem from your roadmap workspace and start over? Tracked milestone progress is kept, but you will need to reselect which problems to work on.')) {
      store.clearWorkingProblems(scopeKey);
      setSelectedProblemId(null);
      setSelectedCategoryId(null);
      setView('problems');
    }
  };

  const handleResetProgress = () => {
    if (!selectedCategoryId || !selectedCategory) return;
    if (window.confirm(`Reset all completed milestones for "${selectedCategory.name}"? This can't be undone.`)) {
      store.resetCategoryProgress(scopeKey, selectedCategoryId);
    }
  };

  const categoryProgressPercent = (categoryId: string) => {
    const catSteps = store.getSteps(categoryId);
    if (catSteps.length === 0) return 0;
    const progress = store.getUserProgress(scopeKey, categoryId);
    const done = catSteps.filter(s => !!progress[s.id]).length;
    return Math.round((done / catSteps.length) * 100);
  };

  if (view === 'problems') {
    return (
      <div className="space-y-6">
        <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]">
                <FolderKanban className="w-5 h-5" />
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-ink)]">
                My Task Roadmaps
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--nxt-ink-soft)]">
              Pick a problem statement you're working on, then choose a category to see its step-by-step roadmap.
            </p>
          </div>
          {workingProblems.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn-add-working-problem"
                onClick={() => setShowPicker(true)}
                className="px-3.5 py-2 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Problem
              </button>
              <button
                id="btn-reset-selection"
                onClick={handleResetSelection}
                className="px-3.5 py-2 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reselect All
              </button>
            </div>
          )}
        </Reveal>

        {workingProblems.length === 0 ? (
          <div className="space-y-4">
            <Reveal className="bg-[var(--nxt-blue)] border border-[var(--nxt-blue-strong)]/20 rounded-2xl p-4 text-xs text-[var(--nxt-blue-deep)] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>You haven't picked any problem statements to work on yet — choose one or more below to get started.</span>
            </Reveal>
            <ProblemPickerGrid problems={allProblems} onPick={handleAddProblem} appliedIds={appliedProblemIds} savedIds={savedProblemIds} />
          </div>
        ) : (
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4" stagger={0.05}>
            {workingProblems.map(problem => (
              <RevealItem key={problem.id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  onClick={() => handleSelectProblem(problem.id)}
                  className="cursor-pointer bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-5 shadow-sm hover:shadow-md hover:border-[var(--nxt-blue-strong)]/30 transition-shadow h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
                        {problem.department}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSettingsProblemId(problem.id); }}
                        title="Project settings"
                        className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 -m-1 rounded-full hover:bg-[var(--nxt-bg-soft)] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-display text-base font-bold text-[var(--nxt-ink)] leading-snug">
                      {problem.title}
                    </h3>
                    <p className="text-xs text-[var(--nxt-ink-soft)] leading-relaxed line-clamp-2 mt-1.5">
                      {problem.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--nxt-line)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--nxt-ink-soft)]">21 categories available</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--nxt-blue-strong)]">
                      <span>View Category Roadmaps</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 py-8"
              onClick={() => setShowPicker(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-[var(--nxt-line)] max-h-[80vh] overflow-y-auto"
              >
                <button
                  onClick={() => setShowPicker(false)}
                  className="absolute top-4 right-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-display text-lg font-bold text-[var(--nxt-ink)] mb-4">Add a problem to work on</h3>
                {unselectedProblems.length === 0 ? (
                  <p className="text-xs text-[var(--nxt-ink-soft)]">You've already added every available problem statement.</p>
                ) : (
                  <ProblemPickerGrid problems={unselectedProblems} onPick={handleAddProblem} appliedIds={appliedProblemIds} savedIds={savedProblemIds} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <ProjectSettingsModal
          isOpen={!!settingsProblemId}
          onClose={() => setSettingsProblemId(null)}
          currentUser={currentUser}
          problem={allProblems.find(p => p.id === settingsProblemId) || null}
          currentCategory={null}
          currentProgressPercent={0}
          onReselectCategory={() => {
            if (settingsProblemId) handleSelectProblem(settingsProblemId);
            setSettingsProblemId(null);
          }}
          onResetProgress={() => setSettingsProblemId(null)}
          onRemoveProject={() => {
            if (settingsProblemId) handleRemoveProblem(settingsProblemId);
            setSettingsProblemId(null);
          }}
        />
      </div>
    );
  }

  if (view === 'categories' && selectedProblem) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'My Problems', onClick: () => setView('problems') },
            { label: selectedProblem.title },
          ]}
        />

        <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
              {selectedProblem.department}
            </span>
            <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--nxt-ink)] mt-2">
              {selectedProblem.title}
            </h1>
            <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">
              Choose a category below to view its step-by-step roadmap for this problem.
            </p>
          </div>
          <button
            onClick={() => setView('problems')}
            className="shrink-0 px-3.5 py-2 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Change Problem
          </button>
        </Reveal>

        <Reveal delay={0.05} className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[var(--nxt-ink-soft)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 21 categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)] placeholder:text-[var(--nxt-ink-soft)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-blue-strong)] transition-all shadow-sm"
          />
        </Reveal>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.03}>
          {filteredCategories.map((cat) => {
            const pct = categoryProgressPercent(cat.id);
            return (
              <RevealItem key={cat.id}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  onClick={() => { setSelectedCategoryId(cat.id); setView('roadmap'); }}
                  className="cursor-pointer bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-4 shadow-sm hover:shadow-md hover:border-[var(--nxt-blue-strong)]/30 transition-shadow h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-[var(--nxt-ink-soft)]">#{cat.order}</span>
                      {pct > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          pct === 100 ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]' : 'bg-[var(--nxt-blue)] text-[var(--nxt-blue-deep)]'
                        }`}>
                          {pct}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)] leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-1 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-end text-[var(--nxt-blue-strong)]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {filteredCategories.length === 0 && (
          <p className="text-xs text-[var(--nxt-ink-soft)] text-center py-6">No categories matched your search.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'My Problems', onClick: () => setView('problems') },
          { label: selectedProblem?.title || '—', onClick: () => setView('categories') },
          { label: selectedCategory?.name || '—' },
        ]}
      />

      <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]">
                <Layers className="w-5 h-5" />
              </span>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-ink)]">
                {selectedCategory?.name} Roadmap
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--nxt-ink-soft)]">
              For: <span className="font-semibold text-[var(--nxt-ink)]">{selectedProblem?.title}</span>
            </p>
          </div>

          <div className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-3 sm:min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-[var(--nxt-ink-soft)]">Progress</span>
              <span className="text-[var(--nxt-mint-strong)] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-[var(--nxt-line)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--nxt-blue-strong)] to-[var(--nxt-mint-strong)] rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-[var(--nxt-ink-soft)] mt-1 flex justify-between">
              <span>{completedCount} of {steps.length} milestones complete</span>
              {progressPercent === 100 && (
                <span className="text-[var(--nxt-mint-strong)] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Fully Validated
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--nxt-line)] flex flex-wrap items-center gap-2">
          <button
            id="btn-open-project-settings"
            onClick={() => selectedProblemId && setSettingsProblemId(selectedProblemId)}
            className="px-3 py-1.5 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Project Settings
          </button>
        </div>
      </Reveal>

      {steps.length === 0 ? (
        <div className="bg-[var(--nxt-surface)] rounded-2xl border border-dashed border-[var(--nxt-line)] p-10 text-center">
          <Layers className="w-10 h-10 text-[var(--nxt-ink-soft)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--nxt-ink)]">No steps defined for this category yet</h3>
          <p className="text-xs text-[var(--nxt-ink-soft)] mt-1 max-w-sm mx-auto">
            Admins can configure distinct ordered steps and attach expert webinars or hospital connections in the Admin Panel.
          </p>
        </div>
      ) : (
        <RevealGroup className="space-y-4" stagger={0.05}>
          {steps.map((step) => {
            const isCompleted = !!userProgress[step.id];
            const { common: commonResources, recommended: recommendedResources } = store.getResourcesForUser(step.id, currentUser.id, selectedProblemId || undefined);
            const stepResources = [...recommendedResources, ...commonResources];
            const hospitalConnections = stepResources.filter(r => r.type === 'hospital_connection');
            const hasHospital = hospitalConnections.length > 0;
            const hasRecommended = recommendedResources.length > 0;
            const stepSubmissions = selectedProblemId
              ? store.getStepSubmissionsForStep(step.id, store.getScopeUserIds(currentUser)).filter(s => s.problem_id === selectedProblemId)
              : [];
            const pendingSubmission = stepSubmissions.find(s => s.status === 'Submitted');
            const approvedSubmission = stepSubmissions.find(s => s.status === 'Approved');

            return (
              <RevealItem key={step.id}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                id={`step-card-${step.id}`}
                onClick={() => setSelectedStep(step)}
                className={`bg-[var(--nxt-surface)] rounded-2xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${
                  isCompleted
                    ? 'border-[var(--nxt-mint-strong)]/30 bg-[var(--nxt-mint)]/10'
                    : hasHospital
                    ? 'border-[var(--nxt-lavender-strong)]/30 hover:border-[var(--nxt-lavender-strong)]/50'
                    : 'border-[var(--nxt-line)] hover:border-[var(--nxt-blue-strong)]/40'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      id={`btn-step-toggle-${step.id}`}
                      onClick={(e) => handleToggleStep(step.id, e)}
                      className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors mt-0.5 ${
                        isCompleted
                          ? 'bg-[var(--nxt-mint-strong)] text-white shadow-sm'
                          : 'bg-[var(--nxt-bg-soft)] hover:bg-[var(--nxt-line)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'
                      }`}
                      title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[var(--nxt-blue-strong)]">
                          Step {step.order}
                        </span>
                        {step.stage_tag && (
                          <span className="text-[10px] font-semibold bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] px-2 py-0.5 rounded-full">
                            {step.stage_tag}
                          </span>
                        )}
                        {hasHospital && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)] px-2 py-0.5 rounded-full border border-[var(--nxt-lavender-strong)]/20">
                            <Hospital className="w-3 h-3 text-[var(--nxt-lavender-strong)]" />
                            <span>Hospital Validation Hub ({hospitalConnections.length})</span>
                          </span>
                        )}
                        {hasRecommended && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[var(--nxt-mint-strong)] text-white px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            <span>Recommended for You</span>
                          </span>
                        )}
                        {pendingSubmission && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] px-2 py-0.5 rounded-full">
                            <Paperclip className="w-3 h-3" />
                            <span>Evidence Pending Review</span>
                          </span>
                        )}
                        {!pendingSubmission && approvedSubmission && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)] px-2 py-0.5 rounded-full">
                            <Paperclip className="w-3 h-3" />
                            <span>Evidence Approved</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-[var(--nxt-mint-strong)] bg-[var(--nxt-mint)] px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-base font-bold text-[var(--nxt-ink)] group-hover:text-[var(--nxt-blue-strong)] transition-colors">
                        {step.name}
                      </h3>

                      <p className="text-xs text-[var(--nxt-ink-soft)] mt-1 line-clamp-2">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--nxt-line)]">
                    <div className="flex items-center gap-1 text-xs text-[var(--nxt-ink-soft)] bg-[var(--nxt-bg-soft)] px-2.5 py-1.5 rounded-full border border-[var(--nxt-line)]">
                      <span>{stepResources.length} Resources</span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--nxt-blue-strong)] group-hover:translate-x-0.5 transition-transform">
                      <span>View Resources</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}

      {selectedStep && (
        <StepDetailModal
          step={selectedStep}
          category={selectedCategory}
          currentUser={currentUser}
          problemId={selectedProblemId || undefined}
          isCompleted={!!userProgress[selectedStep.id]}
          onToggleComplete={() => handleToggleStep(selectedStep.id)}
          onClose={() => setSelectedStep(null)}
          onViewResources={onViewResources}
        />
      )}

      <ProjectSettingsModal
        isOpen={!!settingsProblemId}
        onClose={() => setSettingsProblemId(null)}
        currentUser={currentUser}
        problem={allProblems.find(p => p.id === settingsProblemId) || null}
        currentCategory={settingsProblemId === selectedProblemId ? selectedCategory : null}
        currentProgressPercent={settingsProblemId === selectedProblemId ? progressPercent : 0}
        onReselectCategory={() => {
          if (settingsProblemId === selectedProblemId && selectedCategoryId) {
            store.resetCategoryProgress(scopeKey, selectedCategoryId);
          }
          setSelectedCategoryId(null);
          setView('categories');
          setSettingsProblemId(null);
        }}
        onResetProgress={() => {
          handleResetProgress();
          setSettingsProblemId(null);
        }}
        onRemoveProject={() => {
          if (settingsProblemId) handleRemoveProblem(settingsProblemId);
          setSettingsProblemId(null);
        }}
      />
    </div>
  );
};

const RoadmapTrailer: React.FC<{
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onOpenMembershipModal: () => void;
}> = ({ isLoggedIn, onOpenLogin, onOpenMembershipModal }) => {
  const categories = store.getCategories();
  const allProblems = store.getProblems();
  const [view, setView] = useState<View>('problems');
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState('');

  const selectedProblem = allProblems.find(p => p.id === selectedProblemId) || null;
  const selectedCategory = categories.find(c => c.id === selectedCategoryId) || null;
  const steps = selectedCategoryId ? store.getSteps(selectedCategoryId) : [];

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.description.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const upgradeAction = isLoggedIn ? onOpenMembershipModal : onOpenLogin;
  const upgradeLabel = isLoggedIn ? 'Become a Member' : 'Log In / Register';

  const UpgradeBanner = () => (
    <Reveal className="bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-[var(--nxt-peach-deep)] shrink-0" />
        <p className="text-xs font-semibold text-[var(--nxt-peach-deep)]">
          You're viewing a preview — {isLoggedIn ? 'become a member' : 'log in and become a member'} to unlock every category, track progress, and submit evidence.
        </p>
      </div>
      <PillButton tone="ghost" onClick={upgradeAction} className="px-3.5 py-1.5 text-xs shrink-0">
        {upgradeLabel}
      </PillButton>
    </Reveal>
  );

  if (view === 'problems') {
    return (
      <div className="space-y-6">
        <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-ink)]">
              Task Roadmaps
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--nxt-ink-soft)]">
            A preview of the step-by-step roadmap founders follow once they join — pick a problem to look around.
          </p>
        </Reveal>

        <UpgradeBanner />

        <ProblemPickerGrid
          problems={allProblems}
          onPick={(id) => { setSelectedProblemId(id); setSelectedCategoryId(null); setView('categories'); }}
        />
      </div>
    );
  }

  if (view === 'categories' && selectedProblem) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Roadmaps', onClick: () => setView('problems') },
            { label: selectedProblem.title },
          ]}
        />

        <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 shadow-sm">
          <span className="text-[11px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
            {selectedProblem.department}
          </span>
          <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--nxt-ink)] mt-2">
            {selectedProblem.title}
          </h1>
        </Reveal>

        <UpgradeBanner />

        <Reveal delay={0.05} className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[var(--nxt-ink-soft)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search 21 categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)] placeholder:text-[var(--nxt-ink-soft)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-blue-strong)] transition-all shadow-sm"
          />
        </Reveal>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.03}>
          {filteredCategories.map((cat) => (
            <RevealItem key={cat.id}>
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => { setSelectedCategoryId(cat.id); setView('roadmap'); }}
                className="cursor-pointer bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-4 shadow-sm hover:shadow-md hover:border-[var(--nxt-blue-strong)]/30 transition-shadow h-full flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-[var(--nxt-ink-soft)]">#{cat.order}</span>
                  <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)] leading-snug mt-1">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-end text-[var(--nxt-blue-strong)]">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Roadmaps', onClick: () => setView('problems') },
          { label: selectedProblem?.title || '—', onClick: () => setView('categories') },
          { label: selectedCategory?.name || '—' },
        ]}
      />

      <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]">
            <Layers className="w-5 h-5" />
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-ink)]">
            {selectedCategory?.name} Roadmap
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--nxt-ink-soft)]">
          For: <span className="font-semibold text-[var(--nxt-ink)]">{selectedProblem?.title}</span>
        </p>
      </Reveal>

      <UpgradeBanner />

      <RevealGroup className="space-y-3" stagger={0.04}>
        {steps.map((step, i) => {
          const unlocked = i < PREVIEW_UNLOCKED_STEPS;
          return (
            <RevealItem key={step.id}>
              <div className={`rounded-2xl border p-5 ${unlocked ? 'bg-[var(--nxt-surface)] border-[var(--nxt-line)] shadow-sm' : 'bg-[var(--nxt-bg-soft)] border-[var(--nxt-line)] border-dashed'}`}>
                <div className="flex items-start gap-3.5">
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${unlocked ? 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]' : 'bg-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}>
                    {unlocked ? <Circle className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-[var(--nxt-blue-strong)]">Step {step.order}</span>
                    <h3 className={`font-display text-base font-bold mt-0.5 ${unlocked ? 'text-[var(--nxt-ink)]' : 'text-[var(--nxt-ink-soft)]'}`}>
                      {step.name}
                    </h3>
                    {unlocked ? (
                      <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">{step.description}</p>
                    ) : (
                      <p className="text-xs text-[var(--nxt-ink-soft)] mt-1 italic">Unlock membership to view this milestone.</p>
                    )}
                  </div>
                </div>
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
};

const Breadcrumb: React.FC<{ items: { label: string; onClick?: () => void }[] }> = ({ items }) => (
  <div className="flex items-center flex-wrap gap-1.5 text-xs font-medium text-[var(--nxt-ink-soft)] px-1">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
        {item.onClick ? (
          <button onClick={item.onClick} className="hover:text-[var(--nxt-blue-strong)] transition-colors">
            {item.label}
          </button>
        ) : (
          <span className="text-[var(--nxt-ink)] font-bold truncate max-w-[240px]">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

const ProblemPickerCard: React.FC<{
  problem: ProblemStatement;
  onPick: (id: string) => void;
  applied?: boolean;
  saved?: boolean;
}> = ({ problem, onPick, applied, saved }) => (
  <motion.button
    whileHover={{ y: -3 }}
    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    onClick={() => onPick(problem.id)}
    className="w-full text-left bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-5 shadow-sm hover:shadow-md hover:border-[var(--nxt-blue-strong)]/30 transition-shadow h-full flex flex-col justify-between"
  >
    <div>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
          {problem.department}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {applied && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--nxt-blue-strong)] bg-[var(--nxt-blue)] px-2 py-0.5 rounded-full">
              <DollarSign className="w-3 h-3" /> Applied
            </span>
          )}
          {saved && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--nxt-lavender-strong)] bg-[var(--nxt-lavender)] px-2 py-0.5 rounded-full">
              <Bookmark className="w-3 h-3" /> Saved
            </span>
          )}
          {problem.funded && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--nxt-mint-deep)]">
              <DollarSign className="w-3 h-3" /> Funded
            </span>
          )}
        </div>
      </div>
      <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)] leading-snug">
        {problem.title}
      </h3>
      <p className="text-xs text-[var(--nxt-ink-soft)] leading-relaxed line-clamp-2 mt-1.5">
        {problem.description}
      </p>
    </div>
    <div className="mt-3 flex items-center justify-end gap-1 text-xs font-bold text-[var(--nxt-blue-strong)]">
      <Plus className="w-3.5 h-3.5" />
      <span>Work on this</span>
    </div>
  </motion.button>
);

const ProblemPickerGrid: React.FC<{
  problems: ProblemStatement[];
  onPick: (id: string) => void;
  appliedIds?: Set<string>;
  savedIds?: Set<string>;
}> = ({ problems, onPick, appliedIds, savedIds }) => {
  const isPriority = (id: string) => !!appliedIds?.has(id) || !!savedIds?.has(id);
  const priorityProblems = problems.filter(p => isPriority(p.id));
  const otherProblems = problems.filter(p => !isPriority(p.id));

  return (
    <div className="space-y-6">
      {priorityProblems.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--nxt-mint-strong)] mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Applied or Saved by You
          </p>
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4" stagger={0.04}>
            {priorityProblems.map(problem => (
              <RevealItem key={problem.id}>
                <ProblemPickerCard
                  problem={problem}
                  onPick={onPick}
                  applied={appliedIds?.has(problem.id)}
                  saved={savedIds?.has(problem.id)}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      )}

      {otherProblems.length > 0 && (
        <div>
          {priorityProblems.length > 0 && (
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)] mb-3">
              Other Problem Statements
            </p>
          )}
          <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4" stagger={0.04}>
            {otherProblems.map(problem => (
              <RevealItem key={problem.id}>
                <ProblemPickerCard problem={problem} onPick={onPick} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      )}
    </div>
  );
};
