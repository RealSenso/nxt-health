import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Circle, ArrowRight, Hospital,
  Layers, Search, ChevronRight, Check, X, RotateCcw, Plus,
  DollarSign, AlertCircle, Settings, Sparkles, Paperclip, Bookmark, Lock, Route
} from 'lucide-react';
import { User, ProblemStatement } from '../types';
import { store } from '../services/store';
import { StepPage } from './StepPage';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { Reveal, RevealGroup, RevealItem, PillButton } from './ui/Reveal';
import { PageHeader } from './ui/PageHeader';
import { categoryIcon, departmentIcon } from '../data/icons';

interface TaskManagementPageProps {
  currentUser: User | null;
  initialProblemId?: string;
  onOpenAdminPanel?: () => void;
  onOpenLogin: () => void;
  onOpenMembershipModal: () => void;
  onViewResources: (stepId: string) => void;
}

type View = 'problems' | 'categories' | 'roadmap' | 'step';

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
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
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

  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (initialProblemId && currentUser) {
      store.addWorkingProblem(scopeKey, initialProblemId);
      const locked = store.getLockedCategoryId(scopeKey, initialProblemId);
      setSelectedProblemId(initialProblemId);
      setSelectedCategoryId(locked);
      setView(locked ? 'roadmap' : 'categories');
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
  const completedCount = steps.filter(s => !!userProgress[s.id]).length;
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
    const locked = store.getLockedCategoryId(scopeKey, problemId);
    setSelectedProblemId(problemId);
    setSelectedCategoryId(locked);
    setCategorySearch('');
    setView(locked ? 'roadmap' : 'categories');
  };

  const handleConfirmCategory = () => {
    if (!selectedProblemId || !pendingCategoryId) return;
    store.lockCategory(scopeKey, selectedProblemId, pendingCategoryId);
    setSelectedCategoryId(pendingCategoryId);
    setPendingCategoryId(null);
    setView('roadmap');
  };

  const handleResetCategory = (problemId: string) => {
    const locked = store.getLockedCategoryId(scopeKey, problemId);
    if (locked) store.resetCategoryProgress(scopeKey, locked);
    store.clearStepWorkspaces(scopeKey, problemId);
    store.unlockCategory(scopeKey, problemId);
    setSelectedProblemId(problemId);
    setSelectedCategoryId(null);
    setSelectedStepId(null);
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


  const categoryProgressPercent = (categoryId: string) => {
    const catSteps = store.getSteps(categoryId);
    if (catSteps.length === 0) return 0;
    const progress = store.getUserProgress(scopeKey, categoryId);
    const done = catSteps.filter(s => !!progress[s.id]).length;
    return Math.round((done / catSteps.length) * 100);
  };

  const settingsProblem = allProblems.find(p => p.id === settingsProblemId) || null;
  const settingsCategoryId = settingsProblemId ? store.getLockedCategoryId(scopeKey, settingsProblemId) : null;
  const settingsModal = (
    <ProjectSettingsModal
      isOpen={!!settingsProblemId}
      onClose={() => setSettingsProblemId(null)}
      currentUser={currentUser}
      problem={settingsProblem}
      currentCategory={categories.find(c => c.id === settingsCategoryId) || null}
      currentProgressPercent={settingsCategoryId ? categoryProgressPercent(settingsCategoryId) : 0}
      onReselectCategory={() => {
        if (settingsProblemId) handleResetCategory(settingsProblemId);
        setSettingsProblemId(null);
      }}
      onResetProgress={() => {
        if (settingsCategoryId && settingsProblem &&
          window.confirm(`Reset all completed milestones for "${settingsProblem.title}"? This can't be undone.`)) {
          store.resetCategoryProgress(scopeKey, settingsCategoryId);
          if (settingsProblemId) store.clearStepWorkspaces(scopeKey, settingsProblemId);
        }
        setSettingsProblemId(null);
      }}
      onRemoveProject={() => {
        if (settingsProblemId) handleRemoveProblem(settingsProblemId);
        setSettingsProblemId(null);
      }}
    />
  );

  if (view === 'problems') {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Route}
          eyebrow="My roadmaps"
          title="Your projects"
          subtitle="Each project pairs a clinical problem with the one product category you're building for it. Open a project to pick up where you left off."
          illustration="roadmap"
          actions={workingProblems.length > 0 && (
            <>
              <PillButton tone="mint" id="btn-add-working-problem" onClick={() => setShowPicker(true)} className="px-5 py-2.5 text-sm">
                <Plus className="w-4 h-4" /> Add a problem
              </PillButton>
              <PillButton tone="ghost" id="btn-reset-selection" onClick={handleResetSelection} className="px-4 py-2.5 text-sm">
                <RotateCcw className="w-4 h-4" /> Start over
              </PillButton>
            </>
          )}
        />

        {workingProblems.length === 0 ? (
          <div className="space-y-5">
            <Reveal className="bg-[var(--nxt-blue)] border border-[var(--nxt-blue-strong)]/20 rounded-2xl p-4 text-sm text-[var(--nxt-blue-deep)] font-medium flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>You haven't picked a problem yet — choose one below to start your first project.</span>
            </Reveal>
            <ProblemPickerGrid problems={allProblems} onPick={handleAddProblem} appliedIds={appliedProblemIds} savedIds={savedProblemIds} />
          </div>
        ) : (
          <RevealGroup className="grid grid-cols-1 lg:grid-cols-2 gap-5" stagger={0.05}>
            {workingProblems.map(problem => {
              const lockedId = store.getLockedCategoryId(scopeKey, problem.id);
              const lockedCategory = categories.find(c => c.id === lockedId) || null;
              const lockedSteps = lockedId ? store.getSteps(lockedId) : [];
              const lockedProgress = lockedId ? store.getUserProgress(scopeKey, lockedId) : {};
              const doneCount = lockedSteps.filter(st => !!lockedProgress[st.id]).length;
              const pct = lockedSteps.length ? Math.round((doneCount / lockedSteps.length) * 100) : 0;
              const DeptIcon = departmentIcon(problem.department);
              const CatIcon = categoryIcon(lockedId);
              return (
                <RevealItem key={problem.id}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleSelectProblem(problem.id)}
                    className="cursor-pointer bg-[var(--nxt-surface)] rounded-3xl border border-[var(--nxt-line)] p-6 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-11 h-11 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center shrink-0">
                          <DeptIcon className="w-5 h-5" />
                        </span>
                        <span className="text-xs font-semibold text-[var(--nxt-ink-soft)] leading-tight">{problem.department}</span>
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSettingsProblemId(problem.id); }}
                        title="Project settings"
                        className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-2 -m-1 rounded-full hover:bg-[var(--nxt-bg-soft)] transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--nxt-ink)] leading-snug mt-4">{problem.title}</h3>

                    <div className="mt-auto pt-5">
                      <div className="pt-5 border-t border-[var(--nxt-line)]">
                        {lockedCategory ? (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-xl bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)] flex items-center justify-center shrink-0">
                                <CatIcon className="w-5 h-5" />
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-[var(--nxt-ink-soft)] flex items-center gap-1"><Lock className="w-3 h-3" /> Building</p>
                                <p className="text-sm font-bold text-[var(--nxt-ink)] truncate">{lockedCategory.name}</p>
                              </div>
                              <span className="font-display text-lg font-bold text-[var(--nxt-mint-strong)]">{pct}%</span>
                            </div>
                            <div className="w-full h-2 bg-[var(--nxt-line)] rounded-full overflow-hidden mt-3">
                              <div className="h-full bg-[var(--nxt-mint-strong)] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="mt-4 flex items-center justify-between text-sm">
                              <span className="text-[var(--nxt-ink-soft)]">{doneCount} of {lockedSteps.length} steps done</span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[var(--nxt-mint-strong)]">
                                Continue <ArrowRight className="w-4 h-4" />
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[var(--nxt-ink-soft)]">No category chosen yet</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-[var(--nxt-mint-strong)]">
                              Choose what to build <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </RevealItem>
              );
            })}
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

        {settingsModal}
      </div>
    );
  }

  if (view === 'categories' && selectedProblem) {
    const pendingCategory = categories.find(c => c.id === pendingCategoryId) || null;
    const PendingIcon = categoryIcon(pendingCategoryId);
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'My projects', onClick: () => setView('problems') },
            { label: selectedProblem.title },
          ]}
        />

        <PageHeader
          icon={Layers}
          eyebrow="Choose what to build"
          title="What are you building for this problem?"
          subtitle={<>For <span className="font-semibold text-[var(--nxt-ink)]">{selectedProblem.title}</span>. Pick one product category — your roadmap, deliverables and resources are tailored to it.</>}
          illustration="roadmap"
        >
          <p className="text-sm text-[var(--nxt-ink-soft)] flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5 shrink-0 text-[var(--nxt-mint-strong)]" />
            Your choice is locked to this project. To switch later, reset it in Project Settings — that clears progress for this project.
          </p>
        </PageHeader>

        <Reveal delay={0.05} className="relative">
          <Search className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${categories.length} categories...`}
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)] placeholder:text-[var(--nxt-ink-soft)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)] shadow-sm"
          />
        </Reveal>

        <RevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.03}>
          {filteredCategories.map(cat => {
            const CatIcon = categoryIcon(cat.id);
            const stepCount = store.getSteps(cat.id).length;
            return (
              <RevealItem key={cat.id}>
                <motion.button
                  id={`category-card-${cat.id}`}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setPendingCategoryId(cat.id)}
                  className="w-full text-left bg-[var(--nxt-surface)] rounded-3xl border border-[var(--nxt-line)] p-5 shadow-sm hover:shadow-md hover:border-[var(--nxt-mint-strong)]/40 transition-shadow h-full flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="w-12 h-12 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center">
                      <CatIcon className="w-6 h-6" />
                    </span>
                    <span className="text-xs font-semibold text-[var(--nxt-ink-soft)]">#{cat.order}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[var(--nxt-ink)] leading-snug mt-4">{cat.name}</h3>
                  <p className="text-sm text-[var(--nxt-ink-soft)] mt-1 line-clamp-2">{cat.description}</p>
                  <p className="mt-auto pt-4 text-xs font-semibold text-[var(--nxt-ink-soft)]">
                    {stepCount > 0 ? `${stepCount}-step roadmap` : 'Roadmap coming soon'}
                  </p>
                </motion.button>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {filteredCategories.length === 0 && (
          <p className="text-sm text-[var(--nxt-ink-soft)] text-center py-6">No categories matched your search.</p>
        )}

        <AnimatePresence>
          {pendingCategory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setPendingCategoryId(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[var(--nxt-surface)] rounded-3xl max-w-md w-full p-7 shadow-2xl border border-[var(--nxt-line)]"
              >
                <span className="w-14 h-14 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center">
                  <PendingIcon className="w-7 h-7" />
                </span>
                <h3 className="font-display text-xl font-bold text-[var(--nxt-ink)] mt-4">Build a {pendingCategory.name}?</h3>
                <p className="text-sm text-[var(--nxt-ink-soft)] mt-2">For <span className="font-semibold text-[var(--nxt-ink)]">{selectedProblem.title}</span></p>
                <ul className="mt-5 space-y-3 text-sm text-[var(--nxt-ink)]">
                  <li className="flex gap-2.5"><Check className="w-4 h-4 mt-0.5 text-[var(--nxt-mint-strong)] shrink-0" /> This project will open straight into the {pendingCategory.name} roadmap.</li>
                  <li className="flex gap-2.5"><Lock className="w-4 h-4 mt-0.5 text-[var(--nxt-mint-strong)] shrink-0" /> Other categories are hidden for this project.</li>
                  <li className="flex gap-2.5"><RotateCcw className="w-4 h-4 mt-0.5 text-[var(--nxt-peach-deep)] shrink-0" /> To switch later, reset the category in Project Settings — this clears progress on this project.</li>
                </ul>
                <div className="flex flex-col-reverse sm:flex-row gap-2 mt-7">
                  <button
                    onClick={() => setPendingCategoryId(null)}
                    className="flex-1 px-4 py-3 rounded-full border border-[var(--nxt-line)] text-sm font-semibold text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] transition-colors"
                  >
                    Pick another
                  </button>
                  <button
                    id="btn-confirm-lock-category"
                    onClick={handleConfirmCategory}
                    className="flex-1 px-4 py-3 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-4 h-4" /> Lock it in
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const selectedStep = steps.find(s => s.id === selectedStepId) || null;
  if (view === 'step' && selectedStep && selectedCategory && selectedProblemId) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'My projects', onClick: () => setView('problems') },
            { label: selectedProblem?.title || '—', onClick: () => setView('roadmap') },
            { label: `Step ${selectedStep.order}` },
          ]}
        />
        <StepPage
          key={selectedStep.id}
          step={selectedStep}
          category={selectedCategory}
          categorySteps={steps}
          currentUser={currentUser}
          problemId={selectedProblemId}
          scopeKey={scopeKey}
          isCompleted={!!userProgress[selectedStep.id]}
          onToggleComplete={() => handleToggleStep(selectedStep.id)}
          onNavigateStep={(stepId) => { setSelectedStepId(stepId); window.scrollTo({ top: 0 }); }}
          onViewResources={onViewResources}
        />
      </div>
    );
  }

  const RoadmapIcon = categoryIcon(selectedCategoryId);
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'My projects', onClick: () => setView('problems') },
          { label: selectedProblem?.title || '—' },
        ]}
      />

      <PageHeader
        icon={RoadmapIcon}
        eyebrow={`${selectedCategory?.name || ''} roadmap`}
        title={selectedProblem?.title || ''}
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] text-sm font-semibold text-[var(--nxt-ink-soft)]">
              <Lock className="w-4 h-4" /> Category locked
            </span>
            <PillButton tone="ghost" id="btn-open-project-settings" onClick={() => selectedProblemId && setSettingsProblemId(selectedProblemId)} className="px-4 py-2 text-sm">
              <Settings className="w-4 h-4" /> Project settings
            </PillButton>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-2.5 bg-[var(--nxt-line)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--nxt-mint-strong)] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-sm text-[var(--nxt-ink-soft)] mt-2">{completedCount} of {steps.length} steps complete</p>
          </div>
          <span className="font-display text-3xl font-extrabold text-[var(--nxt-mint-strong)]">{progressPercent}%</span>
        </div>
      </PageHeader>

      {steps.length === 0 ? (
        <div className="bg-[var(--nxt-surface)] rounded-3xl border border-dashed border-[var(--nxt-line)] p-10 text-center">
          <Layers className="w-10 h-10 text-[var(--nxt-ink-soft)] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[var(--nxt-ink)]">This roadmap is still being written</h3>
          <p className="text-sm text-[var(--nxt-ink-soft)] mt-1 max-w-sm mx-auto">
            Our clinical team hasn't published steps for this category yet. You'll be notified when they're live.
          </p>
        </div>
      ) : (
        <RevealGroup className="relative space-y-4" stagger={0.05}>
          <span aria-hidden className="absolute left-[27px] sm:left-[31px] top-6 bottom-6 w-0.5 bg-[var(--nxt-line)]" />
          {steps.map((step) => {
            const isCompleted = !!userProgress[step.id];
            const { common: commonResources, recommended: recommendedResources } = store.getResourcesForUser(step.id, currentUser.id, selectedProblemId || undefined);
            const stepResources = [...recommendedResources, ...commonResources];
            const hospitalCount = stepResources.filter(r => r.type === 'hospital_connection').length;
            const stepSubmissions = selectedProblemId
              ? store.getStepSubmissionsForStep(step.id, store.getScopeUserIds(currentUser)).filter(s => s.problem_id === selectedProblemId)
              : [];
            const workspace = selectedProblemId ? store.getStepWorkspace(scopeKey, selectedProblemId, step.id) : null;
            const pendingSubmission = stepSubmissions.find(s => s.status === 'Submitted');
            const approvedSubmission = stepSubmissions.find(s => s.status === 'Approved');
            const tasksDone = workspace ? workspace.checklist.filter(t => t.done).length : 0;

            return (
              <RevealItem key={step.id}>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  id={`step-card-${step.id}`}
                  onClick={() => { setSelectedStepId(step.id); setView('step'); window.scrollTo({ top: 0 }); }}
                  className={`relative flex gap-4 sm:gap-5 rounded-3xl border p-4 sm:p-5 cursor-pointer group transition-shadow hover:shadow-md ${
                    isCompleted ? 'bg-[var(--nxt-surface)] border-[var(--nxt-mint-strong)]/30' : 'bg-[var(--nxt-surface)] border-[var(--nxt-line)]'
                  }`}
                >
                  <button
                    id={`btn-step-toggle-${step.id}`}
                    onClick={(e) => handleToggleStep(step.id, e)}
                    title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    className={`relative z-10 shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-display font-bold transition-colors ${
                      isCompleted
                        ? 'bg-[var(--nxt-mint-strong)] text-white'
                        : 'bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] hover:border-[var(--nxt-mint-strong)] hover:text-[var(--nxt-mint-strong)]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.order}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {step.stage_tag && (
                        <span className="text-xs font-semibold bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] px-2.5 py-0.5 rounded-full">{step.stage_tag}</span>
                      )}
                      {isCompleted && <StatusChip tone="mint">Completed</StatusChip>}
                      {!isCompleted && workspace?.status === 'in_progress' && <StatusChip tone="blue">In progress</StatusChip>}
                      {!isCompleted && workspace?.status === 'blocked' && <StatusChip tone="peach">Blocked</StatusChip>}
                      {hospitalCount > 0 && (
                        <StatusChip tone="lavender"><Hospital className="w-3.5 h-3.5" /> {hospitalCount} hospital partner{hospitalCount === 1 ? '' : 's'}</StatusChip>
                      )}
                      {recommendedResources.length > 0 && <StatusChip tone="mint"><Sparkles className="w-3.5 h-3.5" /> Recommended</StatusChip>}
                      {pendingSubmission && <StatusChip tone="peach"><Paperclip className="w-3.5 h-3.5" /> Evidence in review</StatusChip>}
                      {!pendingSubmission && approvedSubmission && <StatusChip tone="blue"><Paperclip className="w-3.5 h-3.5" /> Evidence approved</StatusChip>}
                    </div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[var(--nxt-ink)] group-hover:text-[var(--nxt-mint-strong)] transition-colors">
                      {step.name}
                    </h3>
                    <p className="text-sm text-[var(--nxt-ink-soft)] mt-1 line-clamp-2">{step.description}</p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-sm text-[var(--nxt-ink-soft)]">
                      {workspace && <span>{tasksDone}/{workspace.checklist.length} tasks</span>}
                      <span>{stepResources.length} resource{stepResources.length === 1 ? '' : 's'}</span>
                      <span className="ml-auto inline-flex items-center gap-1 font-semibold text-[var(--nxt-mint-strong)]">
                        Open step <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      )}

      {settingsModal}
    </div>
  );
};

const StatusChip: React.FC<{ tone: 'mint' | 'blue' | 'peach' | 'lavender'; children: React.ReactNode }> = ({ tone, children }) => {
  const tones = {
    mint: 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]',
    blue: 'bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]',
    peach: 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]',
    lavender: 'bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)]',
  };
  return <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${tones[tone]}`}>{children}</span>;
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
        <PageHeader
          icon={Route}
          eyebrow="Roadmaps preview"
          title="See how founders build, step by step"
          subtitle="Pick a problem and a product category to preview the milestone roadmap members follow — from discovery to hospital pilot."
          illustration="roadmap"
        />

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

        <PageHeader
          icon={departmentIcon(selectedProblem.department)}
          eyebrow={selectedProblem.department}
          title={selectedProblem.title}
          subtitle="Choose a product category to preview its roadmap."
        />

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
                className="cursor-pointer bg-[var(--nxt-surface)] rounded-3xl border border-[var(--nxt-line)] p-5 shadow-sm hover:shadow-md hover:border-[var(--nxt-blue-strong)]/30 transition-shadow h-full flex flex-col justify-between"
              >
                <div>
                  {(() => { const CatIcon = categoryIcon(cat.id); return (
                    <span className="w-11 h-11 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center mb-3">
                      <CatIcon className="w-5 h-5" />
                    </span>
                  ); })()}
                  <h3 className="font-display text-base font-bold text-[var(--nxt-ink)] leading-snug mt-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--nxt-ink-soft)] mt-1 line-clamp-2">
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
    className="w-full text-left bg-[var(--nxt-surface)] rounded-3xl border border-[var(--nxt-line)] p-6 shadow-sm hover:shadow-md hover:border-[var(--nxt-blue-strong)]/30 transition-shadow h-full flex flex-col justify-between"
  >
    <div>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="flex items-center gap-2.5 min-w-0">
          {(() => { const DeptIcon = departmentIcon(problem.department); return (
            <span className="w-10 h-10 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center shrink-0">
              <DeptIcon className="w-5 h-5" />
            </span>
          ); })()}
          <span className="text-xs font-semibold text-[var(--nxt-ink-soft)] leading-tight">{problem.department}</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {applied && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--nxt-blue-strong)] bg-[var(--nxt-blue)] px-2 py-0.5 rounded-full">
              <DollarSign className="w-3 h-3" /> Applied
            </span>
          )}
          {saved && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--nxt-lavender-strong)] bg-[var(--nxt-lavender)] px-2 py-0.5 rounded-full">
              <Bookmark className="w-3 h-3" /> Saved
            </span>
          )}
          {problem.funded && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--nxt-mint-deep)]">
              <DollarSign className="w-3 h-3" /> Funded
            </span>
          )}
        </div>
      </div>
      <h3 className="font-display text-base font-bold text-[var(--nxt-ink)] leading-snug">
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
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--nxt-mint-strong)] mb-3 flex items-center gap-1.5">
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
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)] mb-3">
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
