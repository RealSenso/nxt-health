import React, { useState } from 'react';
import {
  Check, CheckCircle, Hospital, Sparkles, ArrowRight, ArrowLeft, Paperclip, Upload, Download,
  AlertCircle, Clock, MessageSquareWarning, X, Plus, Trash2, Target, AlertTriangle, Users,
  NotebookPen, ListChecks, Flag, Lightbulb, Star
} from 'lucide-react';
import { Step, User, Category, SubmissionFile, StepWorkspace, StepWorkStatus } from '../types';
import { store } from '../services/store';
import { getStepGuide } from '../data/stepGuides';
import { Reveal } from './ui/Reveal';

const MAX_FILE_BYTES = 4 * 1024 * 1024;

const STATUS_OPTIONS: { value: StepWorkStatus; label: string; tone: string }[] = [
  { value: 'not_started', label: 'Not started', tone: 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]' },
  { value: 'in_progress', label: 'In progress', tone: 'bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]' },
  { value: 'blocked', label: 'Blocked', tone: 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]' },
  { value: 'done', label: 'Done', tone: 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]' },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function daysBetween(fromIso: string, to: Date = new Date()): number {
  return Math.floor((to.getTime() - new Date(fromIso).getTime()) / 86_400_000);
}

interface StepPageProps {
  step: Step;
  category: Category;
  categorySteps: Step[];
  currentUser: User;
  problemId: string;
  scopeKey: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNavigateStep: (stepId: string) => void;
  onViewResources: (stepId: string) => void;
}

export const StepPage: React.FC<StepPageProps> = ({
  step,
  category,
  categorySteps,
  currentUser,
  problemId,
  scopeKey,
  isCompleted,
  onToggleComplete,
  onNavigateStep,
  onViewResources,
}) => {
  const [newTask, setNewTask] = useState('');
  const [newLogEntry, setNewLogEntry] = useState('');

  const guide = getStepGuide(step.stage_tag);
  const workspace: StepWorkspace = store.getStepWorkspace(scopeKey, problemId, step.id) || {
    status: 'not_started',
    checklist: guide.deliverables.map((label, i) => ({ id: `g-${i}`, label, done: false, custom: false })),
    log: [],
    updated_at: new Date().toISOString(),
  };
  const displayStatus: StepWorkStatus = isCompleted ? 'done' : workspace.status === 'done' ? 'in_progress' : workspace.status;

  const save = (updates: Partial<StepWorkspace>) => {
    const next = { ...workspace, ...updates };
    if (next.status === 'not_started' && (updates.checklist || updates.log)) {
      next.status = 'in_progress';
    }
    if (next.status !== 'not_started' && !next.started_at) {
      next.started_at = new Date().toISOString();
    }
    store.saveStepWorkspace(scopeKey, problemId, step.id, next);
  };

  const handleStatusChange = (status: StepWorkStatus) => {
    if ((status === 'done') !== isCompleted) onToggleComplete();
    save({ status });
  };

  const handleToggleComplete = () => {
    save({ status: isCompleted ? 'in_progress' : 'done' });
    onToggleComplete();
  };

  const handleAddTask = () => {
    const label = newTask.trim();
    if (!label) return;
    save({ checklist: [...workspace.checklist, { id: `c-${Date.now()}`, label, done: false, custom: true }] });
    setNewTask('');
  };

  const handleAddLog = () => {
    const text = newLogEntry.trim();
    if (!text) return;
    save({
      log: [{ id: `l-${Date.now()}`, text, author_name: currentUser.name, created_at: new Date().toISOString() }, ...workspace.log],
    });
    setNewLogEntry('');
  };

  const doneTasks = workspace.checklist.filter(t => t.done).length;
  const taskPct = workspace.checklist.length ? Math.round((doneTasks / workspace.checklist.length) * 100) : 0;

  const { common, recommended } = store.getResourcesForUser(step.id, currentUser.id, problemId);
  const stepResources = [...recommended, ...common];
  const hasHospital = stepResources.some(r => r.type === 'hospital_connection');

  const stepIndex = categorySteps.findIndex(s => s.id === step.id);
  const prevStep = stepIndex > 0 ? categorySteps[stepIndex - 1] : null;
  const nextStep = stepIndex < categorySteps.length - 1 ? categorySteps[stepIndex + 1] : null;

  const daysActive = workspace.started_at ? daysBetween(workspace.started_at) : null;
  const daysToTarget = workspace.target_date ? -daysBetween(workspace.target_date) : null;

  return (
    <div className="space-y-6">
      <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[var(--nxt-mint-strong)] uppercase tracking-wider">
                Step {step.order} of {categorySteps.length} · {category.name}
              </span>
              {step.stage_tag && (
                <span className="text-[11px] font-semibold bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] px-2 py-0.5 rounded-full">
                  {step.stage_tag}
                </span>
              )}
              {hasHospital && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)] px-2 py-0.5 rounded-full">
                  <Hospital className="w-3 h-3" /> Hospital Validation Hub
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--nxt-ink)] leading-tight">
              {step.name}
            </h1>
            <p className="text-sm text-[var(--nxt-ink-soft)] leading-relaxed mt-2 max-w-3xl">{step.description}</p>
          </div>

          <button
            id="btn-step-toggle-complete"
            onClick={handleToggleComplete}
            className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 self-start ${
              isCompleted
                ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] hover:bg-[var(--nxt-line)]'
                : 'bg-[var(--nxt-mint-strong)] text-white hover:bg-[var(--nxt-mint-deep)]'
            }`}
          >
            {isCompleted ? <Check className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            {isCompleted ? 'Completed — mark incomplete' : 'Mark step complete'}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Status">
            <select
              id="select-step-status"
              value={displayStatus}
              onChange={(e) => handleStatusChange(e.target.value as StepWorkStatus)}
              className={`w-full text-xs font-bold rounded-full px-2.5 py-1 border-0 focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)] ${
                STATUS_OPTIONS.find(s => s.value === displayStatus)?.tone
              }`}
            >
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Stat>
          <Stat label="Deliverables">
            <span className="text-sm font-bold text-[var(--nxt-ink)]">{doneTasks}/{workspace.checklist.length}</span>
            <div className="w-full h-1.5 bg-[var(--nxt-line)] rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-[var(--nxt-mint-strong)] rounded-full transition-all duration-300" style={{ width: `${taskPct}%` }} />
            </div>
          </Stat>
          <Stat label="Time on step">
            <span className="text-sm font-bold text-[var(--nxt-ink)]">
              {daysActive === null ? '—' : `${daysActive} day${daysActive === 1 ? '' : 's'}`}
            </span>
            <span className="block text-[11px] text-[var(--nxt-ink-soft)]">Typical: {guide.typicalDuration}</span>
          </Stat>
          <Stat label="Target date">
            <input
              type="date"
              value={workspace.target_date || ''}
              onChange={(e) => save({ target_date: e.target.value || undefined })}
              className="w-full text-xs bg-transparent text-[var(--nxt-ink)] focus:outline-hidden"
            />
            {daysToTarget !== null && !isCompleted && (
              <span className={`block text-[11px] font-semibold ${daysToTarget < 0 ? 'text-[var(--nxt-peach-deep)]' : 'text-[var(--nxt-ink-soft)]'}`}>
                {daysToTarget < 0 ? `${-daysToTarget} days overdue` : `${daysToTarget} days left`}
              </span>
            )}
          </Stat>
        </div>

        {displayStatus === 'blocked' && (
          <div className="mt-4 bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/20 rounded-2xl p-3">
            <label className="text-xs font-bold text-[var(--nxt-peach-deep)] uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> What's blocking you?
            </label>
            <input
              type="text"
              defaultValue={workspace.blocker || ''}
              onBlur={(e) => save({ blocker: e.target.value.trim() || undefined })}
              placeholder="e.g. Waiting on IRB response from partner hospital"
              className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-xl px-3 py-2 text-[var(--nxt-ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-peach-deep)]"
            />
          </div>
        )}
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Section icon={Lightbulb} title="Why this step matters">
            <p className="text-sm text-[var(--nxt-ink-soft)] leading-relaxed">{guide.whyItMatters}</p>
          </Section>

          <Section icon={ListChecks} title="Deliverables" aside={`${taskPct}% done`}>
            <ul className="space-y-1.5">
              {workspace.checklist.map(item => (
                <li key={item.id} className="group flex items-start gap-2.5 rounded-xl px-2 py-1.5 hover:bg-[var(--nxt-bg-soft)] transition-colors">
                  <button
                    onClick={() => save({ checklist: workspace.checklist.map(t => t.id === item.id ? { ...t, done: !t.done } : t) })}
                    className={`shrink-0 mt-0.5 w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-colors ${
                      item.done ? 'bg-[var(--nxt-mint-strong)] border-[var(--nxt-mint-strong)] text-white' : 'border-[var(--nxt-line)] hover:border-[var(--nxt-mint-strong)]'
                    }`}
                  >
                    {item.done && <Check className="w-3 h-3" />}
                  </button>
                  <span className={`flex-1 text-sm ${item.done ? 'line-through text-[var(--nxt-ink-soft)]' : 'text-[var(--nxt-ink)]'}`}>
                    {item.label}
                  </span>
                  {item.custom && (
                    <button
                      onClick={() => save({ checklist: workspace.checklist.filter(t => t.id !== item.id) })}
                      title="Remove task"
                      className="opacity-0 group-hover:opacity-100 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Add your own task..."
                className="flex-1 text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-full px-3.5 py-2 text-[var(--nxt-ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)]"
              />
              <button
                onClick={handleAddTask}
                className="px-3.5 py-2 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </Section>

          <Section icon={NotebookPen} title="Progress log" aside={`${workspace.log.length} entr${workspace.log.length === 1 ? 'y' : 'ies'}`}>
            <p className="text-xs text-[var(--nxt-ink-soft)] mb-3">
              Keep a running record of meetings, decisions, and results — useful for your team, investors, and your regulatory file.
            </p>
            <textarea
              rows={3}
              value={newLogEntry}
              onChange={(e) => setNewLogEntry(e.target.value)}
              placeholder="e.g. Met Dr. Patel's cardiology team — they'll share de-identified waveform data once the DUA is signed."
              className="w-full text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-3 text-[var(--nxt-ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)]"
            />
            <div className="flex justify-end mt-2">
              <button
                id="btn-add-log-entry"
                onClick={handleAddLog}
                className="px-3.5 py-1.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-xs font-semibold transition-colors"
              >
                Add entry
              </button>
            </div>
            {workspace.log.length > 0 && (
              <ol className="mt-4 border-l border-[var(--nxt-line)] ml-1.5 space-y-4">
                {workspace.log.map(entry => (
                  <li key={entry.id} className="relative pl-4 group">
                    <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--nxt-mint-strong)]" />
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-[var(--nxt-ink-soft)]">
                        <span className="font-semibold text-[var(--nxt-ink)]">{entry.author_name}</span> ·{' '}
                        {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <button
                        onClick={() => save({ log: workspace.log.filter(l => l.id !== entry.id) })}
                        title="Delete entry"
                        className="opacity-0 group-hover:opacity-100 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm text-[var(--nxt-ink)] mt-0.5 whitespace-pre-wrap">{entry.text}</p>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          <EvidencePanel step={step} category={category} currentUser={currentUser} problemId={problemId} />

          {isCompleted && <StepRatingPanel stepId={step.id} userId={currentUser.id} />}
        </div>

        <aside className="space-y-6">
          <Section icon={Flag} title="Exit criteria">
            <p className="text-xs text-[var(--nxt-ink-soft)] mb-2">You're ready to move on when:</p>
            <BulletList items={guide.exitCriteria} />
          </Section>

          <Section icon={AlertTriangle} title="Common pitfalls">
            <BulletList items={guide.pitfalls} />
          </Section>

          <Section icon={Users} title="Who to talk to">
            <div className="flex flex-wrap gap-1.5">
              {guide.whoToTalkTo.map(w => (
                <span key={w} className="text-xs font-medium bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] border border-[var(--nxt-line)] px-2.5 py-1 rounded-full">
                  {w}
                </span>
              ))}
            </div>
          </Section>

          <Section icon={Sparkles} title="Resources" aside={`${stepResources.length}`}>
            {stepResources.length === 0 ? (
              <p className="text-xs text-[var(--nxt-ink-soft)]">No resources attached to this step yet.</p>
            ) : (
              <ul className="space-y-2">
                {stepResources.slice(0, 4).map(r => (
                  <li key={r.id} className="text-xs">
                    <p className="font-semibold text-[var(--nxt-ink)] leading-snug">{r.title}</p>
                    <p className="text-[11px] text-[var(--nxt-ink-soft)] capitalize">
                      {r.type.replace('_', ' ')}{recommended.some(x => x.id === r.id) ? ' · Recommended for you' : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => onViewResources(step.id)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--nxt-mint-strong)] hover:underline"
            >
              Open resources for this step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Section>
        </aside>
      </div>

      <div className="flex items-stretch justify-between gap-3">
        {prevStep ? (
          <StepNavButton direction="prev" step={prevStep} onClick={() => onNavigateStep(prevStep.id)} />
        ) : <span />}
        {nextStep && <StepNavButton direction="next" step={nextStep} onClick={() => onNavigateStep(nextStep.id)} />}
      </div>
    </div>
  );
};

const StepRatingPanel: React.FC<{ stepId: string; userId: string }> = ({ stepId, userId }) => {
  const existing = store.getUserStepRating(userId, stepId);
  const [score, setScore] = useState<number | null>(existing?.score ?? null);
  const [comment, setComment] = useState(existing?.comment || '');
  const [saved, setSaved] = useState(!!existing);

  const handleSave = () => {
    if (score === null) return;
    store.rateStep(userId, stepId, score, comment.trim() || undefined);
    setSaved(true);
  };

  return (
    <Section icon={Star} title="Rate this step">
      <p className="text-sm text-[var(--nxt-ink-soft)] mb-3">
        How likely are you to recommend this step's guidance to another founder? <span className="whitespace-nowrap">(0 = not at all, 10 = definitely)</span>
      </p>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            onClick={() => { setScore(n); setSaved(false); }}
            className={`h-10 rounded-xl text-sm font-bold transition-colors ${
              score === n
                ? 'bg-[var(--nxt-mint-strong)] text-white'
                : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-mint)] hover:text-[var(--nxt-mint-deep)]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {score !== null && (
        <div className="mt-3 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => { setComment(e.target.value); setSaved(false); }}
            placeholder="What would have made this step easier? (optional)"
            className="flex-1 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-full px-4 py-2.5 text-[var(--nxt-ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)]"
          />
          <button
            id="btn-save-step-rating"
            onClick={handleSave}
            disabled={saved}
            className="px-5 py-2.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            {saved ? <><Check className="w-4 h-4" /> Thanks!</> : 'Send feedback'}
          </button>
        </div>
      )}
    </Section>
  );
};

const Stat: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-3 min-w-0">
    <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--nxt-ink-soft)] mb-1.5">{label}</p>
    {children}
  </div>
);

const Section: React.FC<{ icon: React.ElementType; title: string; aside?: string; children: React.ReactNode }> = ({
  icon: Icon, title, aside, children,
}) => (
  <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-5 shadow-sm">
    <div className="flex items-center justify-between gap-2 mb-3">
      <h2 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-[var(--nxt-mint-strong)]" /> {title}
      </h2>
      {aside && <span className="text-xs font-semibold text-[var(--nxt-ink-soft)]">{aside}</span>}
    </div>
    {children}
  </Reveal>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-1.5">
    {items.map(item => (
      <li key={item} className="flex items-start gap-2 text-xs text-[var(--nxt-ink-soft)] leading-relaxed">
        <Target className="w-3 h-3 mt-0.5 shrink-0 text-[var(--nxt-ink-soft)]" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const StepNavButton: React.FC<{ direction: 'prev' | 'next'; step: Step; onClick: () => void }> = ({ direction, step, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 max-w-sm bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-4 hover:border-[var(--nxt-mint-strong)]/40 hover:shadow-sm transition-all ${
      direction === 'next' ? 'text-right ml-auto' : 'text-left'
    }`}
  >
    <p className={`text-[11px] font-bold uppercase tracking-wide text-[var(--nxt-ink-soft)] flex items-center gap-1 ${direction === 'next' ? 'justify-end' : ''}`}>
      {direction === 'prev' && <ArrowLeft className="w-3 h-3" />}
      {direction === 'prev' ? 'Previous step' : 'Next step'}
      {direction === 'next' && <ArrowRight className="w-3 h-3" />}
    </p>
    <p className="text-sm font-bold text-[var(--nxt-ink)] mt-1 leading-snug">Step {step.order}: {step.name}</p>
  </button>
);

const EvidencePanel: React.FC<{ step: Step; category: Category; currentUser: User; problemId: string }> = ({
  step, category, currentUser, problemId,
}) => {
  const [note, setNote] = useState('');
  const [pendingFiles, setPendingFiles] = useState<SubmissionFile[]>([]);
  const [fileError, setFileError] = useState('');
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const submissions = store
    .getStepSubmissionsForStep(step.id, store.getScopeUserIds(currentUser))
    .filter(s => s.problem_id === problemId);

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setFileError('');
    setIsReadingFiles(true);
    try {
      const accepted: SubmissionFile[] = [];
      for (const file of Array.from(fileList)) {
        if (file.size > MAX_FILE_BYTES) {
          setFileError(`"${file.name}" is over the 4MB demo limit — try a smaller file.`);
          continue;
        }
        accepted.push({ name: file.name, size: file.size, type: file.type, dataUrl: await readFileAsDataUrl(file) });
      }
      setPendingFiles(prev => [...prev, ...accepted]);
    } finally {
      setIsReadingFiles(false);
    }
  };

  const handleSubmit = () => {
    if (!note.trim() && pendingFiles.length === 0) {
      setFileError('Add a note or attach at least one file before submitting.');
      return;
    }
    store.submitStepEvidence({
      step_id: step.id,
      category_id: category.id,
      problem_id: problemId,
      user_id: currentUser.id,
      submitted_by_name: currentUser.name,
      note: note.trim(),
      files: pendingFiles,
    });
    setNote('');
    setPendingFiles([]);
    setFileError('');
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 3000);
  };

  return (
    <Section icon={Paperclip} title="Evidence for review" aside={submissions.length ? `${submissions.length} submitted` : undefined}>
      <p className="text-xs text-[var(--nxt-ink-soft)] mb-3">
        Attach documents proving this milestone (IRB approval, test reports, prototype photos) for admin review.
        Submitting doesn't block your progress.
      </p>

      {submissions.length > 0 && (
        <div className="space-y-2 mb-4">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-xs font-semibold text-[var(--nxt-ink)]">
                  {sub.submitted_by_name}{' '}
                  <span className="text-[var(--nxt-ink-soft)] font-normal">· {new Date(sub.submitted_at).toLocaleDateString('en-US')}</span>
                </p>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  sub.status === 'Approved' ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]' : 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]'
                }`}>
                  {sub.status === 'Submitted' && <Clock className="w-2.5 h-2.5" />}
                  {sub.status === 'Changes Requested' && <MessageSquareWarning className="w-2.5 h-2.5" />}
                  {sub.status === 'Approved' && <Check className="w-2.5 h-2.5" />}
                  {sub.status === 'Submitted' ? 'Pending Review' : sub.status}
                </span>
              </div>
              {sub.note && <p className="text-xs text-[var(--nxt-ink-soft)] mb-1.5">{sub.note}</p>}
              {sub.files.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {sub.files.map((f, i) => (
                    <a
                      key={i}
                      href={f.dataUrl}
                      download={f.name}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg text-[11px] font-semibold text-[var(--nxt-ink)] hover:border-[var(--nxt-mint-strong)]/40 transition-colors"
                    >
                      <Download className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[120px]">{f.name}</span>
                    </a>
                  ))}
                </div>
              )}
              {sub.admin_feedback && sub.status !== 'Submitted' && (
                <p className={`text-xs rounded-lg px-2 py-1 mt-1 ${
                  sub.status === 'Approved' ? 'bg-[var(--nxt-mint)]/40 text-[var(--nxt-mint-deep)]' : 'bg-[var(--nxt-peach)]/50 text-[var(--nxt-peach-deep)]'
                }`}>
                  "{sub.admin_feedback}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-3 space-y-2.5">
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe what you're submitting as evidence for this milestone..."
          className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-xl p-2.5 text-[var(--nxt-ink)] focus:ring-1 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden"
        />
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pendingFiles.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--nxt-mint)]/40 text-[var(--nxt-mint-deep)] rounded-lg text-[11px] font-semibold">
                {f.name}
                <button onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))} className="hover:text-[var(--nxt-peach-deep)]">
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        {fileError && (
          <p className="text-xs text-[var(--nxt-peach-deep)] font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {fileError}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <label className="px-3 py-1.5 border border-[var(--nxt-line)] bg-[var(--nxt-surface)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>{isReadingFiles ? 'Reading...' : 'Attach Files'}</span>
            <input type="file" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
          </label>
          <button
            id="btn-submit-step-evidence"
            onClick={handleSubmit}
            className="px-3.5 py-1.5 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5" /> Submit for Review
          </button>
          {justSubmitted && (
            <span className="text-xs text-[var(--nxt-mint-strong)] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Submitted!
            </span>
          )}
        </div>
      </div>
    </Section>
  );
};
