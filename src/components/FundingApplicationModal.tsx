import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertCircle, Check, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { FundingApplication, ProblemStatement, User } from '../types';
import { store } from '../services/store';
import { Answers, FUNDING_FORM, missingRequired, sectionComplete, type Question } from '../data/fundingForm';

interface FundingApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  problem: ProblemStatement | null;
  existingApplication?: FundingApplication | null;
  onSubmitted?: () => void;
}

const field = 'w-full text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-xl p-3 text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-ink)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors';

const QuestionField: React.FC<{ q: Question; value: string | string[] | undefined; onChange: (value: string | string[]) => void }> = ({ q, value, onChange }) => {
  const text = typeof value === 'string' ? value : '';
  const list = Array.isArray(value) ? value : [];
  const id = `q-${q.id}`;
  return (
    <div>
      <label htmlFor={id} className="block text-[15px] font-semibold text-[var(--nxt-ink)]">
        {q.label}{q.required && <span className="text-[var(--nxt-peach-deep)]"> *</span>}
      </label>
      {q.help && <p className="text-sm text-[var(--nxt-ink-soft)] mt-0.5">{q.help}</p>}
      <div className="mt-2">
        {q.type === 'long' && <textarea id={id} rows={5} maxLength={5000} value={text} onChange={(e) => onChange(e.target.value)} className={field} />}
        {(q.type === 'text' || q.type === 'url') && <input id={id} type="text" maxLength={500} value={text} placeholder={q.placeholder} onChange={(e) => onChange(e.target.value)} className={field} />}
        {q.type === 'number' && <input id={id} type="number" min={0} value={text} onChange={(e) => onChange(e.target.value)} className={`${field} max-w-xs`} />}
        {q.type === 'select' && (
          <select id={id} value={text} onChange={(e) => onChange(e.target.value)} className={field}>
            <option value="">Choose one</option>
            {q.options?.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {q.type === 'multi' && (
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby={id}>
            {q.options?.map(o => {
              const on = list.includes(o);
              return (
                <button key={o} type="button" aria-pressed={on}
                  onClick={() => onChange(on ? list.filter(x => x !== o) : [...list, o])}
                  className={`rounded-full border px-4 py-2 text-sm ${on ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent font-semibold' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'}`}>
                  {o}
                </button>
              );
            })}
          </div>
        )}
        {q.type === 'checkbox' && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input id={id} type="checkbox" checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : '')} className="mt-1 w-4 h-4" />
            <span className="text-[15px] text-[var(--nxt-ink-soft)]">I agree</span>
          </label>
        )}
      </div>
    </div>
  );
};

/** The funding application: a sectioned form with a progress list, saved as a draft or submitted for review. */
export const FundingApplicationModal: React.FC<FundingApplicationModalProps> = ({
  isOpen, onClose, currentUser, problem, existingApplication, onSubmitted,
}) => {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedNotice, setSavedNotice] = useState<'draft' | 'submitted' | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const start: Answers = { ...(existingApplication?.answers || {}) };
    const seed = (id: string, value: string | undefined) => { if (value && !start[id]) start[id] = value; };
    seed('applicant_name', existingApplication?.applicant_name || currentUser.name);
    seed('applicant_email', existingApplication?.applicant_email || currentUser.email);
    seed('startup_name', existingApplication?.startup_name && existingApplication.startup_name !== 'Undisclosed Venture' ? existingApplication.startup_name : '');
    seed('pitch', existingApplication?.pitch);
    seed('supporting_notes', existingApplication?.supporting_notes);
    seed('amount_requested', existingApplication?.amount_requested ? String(existingApplication.amount_requested) : '');
    setAnswers(start);
    setIndex(0);
    setErrorMessage('');
    setSavedNotice(null);
    setDirty(false);
  }, [isOpen, problem?.id, existingApplication?.id]);

  const section = FUNDING_FORM[index];
  const missing = useMemo(() => missingRequired(answers), [answers]);
  const last = index === FUNDING_FORM.length - 1;

  if (!problem) return null;

  const set = (id: string, value: string | string[]) => { setAnswers(a => ({ ...a, [id]: value })); setDirty(true); };
  const text = (id: string) => (typeof answers[id] === 'string' ? (answers[id] as string).trim() : '');

  const payload = () => ({
    id: existingApplication?.id,
    user_id: currentUser.id,
    applicant_name: text('applicant_name'),
    applicant_email: text('applicant_email'),
    startup_name: text('startup_name') || 'Undisclosed Venture',
    problem_statement_id: problem.id,
    problem_title: problem.title,
    pitch: text('pitch'),
    amount_requested: Number(text('amount_requested')) || 0,
    supporting_notes: text('supporting_notes'),
    answers: Object.fromEntries(Object.entries(answers).filter(([, v]) => (Array.isArray(v) ? v.length > 0 : v !== ''))) as Answers,
  });

  const handleSaveDraft = () => {
    if (!text('applicant_name') || !text('applicant_email')) {
      setErrorMessage('Add at least your name and email before saving a draft.');
      setIndex(0);
      return;
    }
    setErrorMessage('');
    void store.upsertApplication(payload(), 'Draft');
    setSavedNotice('draft');
    setDirty(false);
    setTimeout(onClose, 900);
  };

  const handleSubmit = () => {
    if (missing.length) {
      const first = missing[0];
      setIndex(FUNDING_FORM.findIndex(s => s.id === first.section.id));
      setErrorMessage(`${missing.length} required answer${missing.length === 1 ? ' is' : 's are'} still empty. Start with “${first.question.label}”.`);
      return;
    }
    setErrorMessage('');
    void store.upsertApplication(payload(), 'Pending');
    setSavedNotice('submitted');
    setDirty(false);
    onSubmitted?.();
    setTimeout(onClose, 1200);
  };

  const close = () => {
    if (dirty && !window.confirm('Close without saving? Your answers will be lost. Use "Save draft" to keep them.')) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[var(--nxt-bg)] flex flex-col"
          role="dialog" aria-modal="true" aria-label="Funding application"
        >
          <header className="border-b border-[var(--nxt-line)] px-4 sm:px-8 h-16 flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-[var(--nxt-ink-soft)]">Funding application</p>
              <p className="font-display font-bold text-[15px] truncate">{problem.title}</p>
            </div>
            <button id="btn-close-funding-modal" onClick={close} className="p-2 rounded-full text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]" aria-label="Close"><X className="w-5 h-5" /></button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
              <nav aria-label="Sections" className="lg:sticky lg:top-4 self-start">
                <p className="text-xs font-semibold text-[var(--nxt-ink-soft)] flex justify-between">
                  <span>SECTIONS</span><span>{FUNDING_FORM.filter(s => sectionComplete(s, answers)).length} of {FUNDING_FORM.length} done</span>
                </p>
                <div className="mt-2 flex gap-1" aria-hidden="true">
                  {FUNDING_FORM.map(s => <span key={s.id} className={`h-1 flex-1 rounded-full ${sectionComplete(s, answers) ? 'bg-[var(--nxt-ink)]' : 'bg-[var(--nxt-line)]'}`} />)}
                </div>
                <ol className="mt-4 flex lg:block gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:space-y-1">
                  {FUNDING_FORM.map((s, i) => {
                    const done = sectionComplete(s, answers);
                    return (
                      <li key={s.id} className="shrink-0 lg:shrink">
                        <button
                          onClick={() => setIndex(i)}
                          aria-current={i === index ? 'step' : undefined}
                          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-left whitespace-nowrap ${i === index ? 'bg-[var(--nxt-bg-soft)] font-semibold ring-1 ring-[var(--nxt-ink)]' : 'text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)]'}`}
                        >
                          <span className={`w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[10px] font-bold ${done ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-ink-soft)]'}`}>
                            {done ? <Check className="w-3 h-3" /> : String(i + 1).padStart(2, '0')}
                          </span>
                          {s.title}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div>
                {savedNotice && (
                  <div className="mb-5 p-4 rounded-xl bg-[var(--nxt-mint)]/50 border border-[var(--nxt-mint-strong)]/30 text-[var(--nxt-mint-deep)] flex items-center gap-3" role="status">
                    <Check className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-bold">{savedNotice === 'draft' ? 'Draft saved. Find it under Funds & Grants.' : 'Application submitted. It is now in the review queue.'}</p>
                  </div>
                )}
                {errorMessage && (
                  <div className="mb-5 p-3 rounded-xl bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/30 text-[var(--nxt-peach-deep)] flex items-start gap-2 text-sm font-semibold" role="alert">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pb-4 border-b border-[var(--nxt-line)]">
                  <span className="w-11 h-11 rounded-full border-2 border-[var(--nxt-ink)] flex items-center justify-center font-bold">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 className="font-display font-bold text-2xl tracking-[-0.02em]">{section.title}</h2>
                    <p className="text-sm text-[var(--nxt-ink-soft)]">{section.intro}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-7">
                  {section.questions.map(q => (
                    <QuestionField key={q.id} q={q} value={answers[q.id]} onChange={(v) => set(q.id, v)} />
                  ))}
                </div>

                {last && missing.length > 0 && (
                  <p className="mt-8 text-sm text-[var(--nxt-peach-deep)] font-semibold">
                    {missing.length} required answer{missing.length === 1 ? '' : 's'} left: {Array.from(new Set(missing.map(m => m.section.title))).join(', ')}.
                  </p>
                )}
              </div>
            </div>
          </div>

          <footer className="border-t border-[var(--nxt-line)] px-4 sm:px-8 py-3 shrink-0 bg-[var(--nxt-surface)]">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-3 justify-between">
              <button onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--nxt-line)] px-4 py-2.5 text-sm font-semibold disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-3">
                <button id="btn-save-funding-draft" onClick={handleSaveDraft} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--nxt-line)] px-4 py-2.5 text-sm font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]">
                  <Save className="w-4 h-4" /> Save draft
                </button>
                <span className="hidden sm:inline text-sm text-[var(--nxt-ink-soft)]">{index + 1} of {FUNDING_FORM.length}</span>
                {last ? (
                  <button id="btn-submit-funding-application" onClick={handleSubmit} className="inline-flex items-center gap-2 rounded-lg bg-[var(--nxt-ink-fixed)] text-white px-5 py-2.5 text-sm font-bold">
                    <Send className="w-4 h-4" /> Submit application
                  </button>
                ) : (
                  <button onClick={() => setIndex(i => Math.min(FUNDING_FORM.length - 1, i + 1))} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--nxt-ink-fixed)] text-white px-5 py-2.5 text-sm font-bold">
                    Save &amp; next <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
