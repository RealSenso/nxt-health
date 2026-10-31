import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, AlertCircle, Check, ChevronLeft, ChevronDown, Send } from 'lucide-react';
import { FundingApplication, ProblemStatement, User } from '../types';
import { store } from '../services/store';
import { APPLICATION_STAGES, stageIndex } from '../data/applicationStages';
import { Answers, FUNDING_FORM, isAnswered, missingRequired, sectionComplete, visibleQuestions, type Question } from '../data/fundingForm';

interface FundingApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  problem: ProblemStatement | null;
  existingApplication?: FundingApplication | null;
  onSubmitted?: () => void;
}

const SESSION_KEY = 'nxt-open-application';
export interface ApplicationSession { path: string; problemId: string; applicationId?: string; index: number; answers: Answers }
/** The application someone had open, so a refresh puts them back where they were. */
export const readApplicationSession = (): ApplicationSession | null => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
};
const writeApplicationSession = (s: ApplicationSession | null) => {
  try { if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); else sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
};

const field = 'w-full text-[clamp(1.2rem,2.2vw,1.6rem)] font-light bg-transparent border-0 border-b border-[var(--nxt-line)] px-0 py-3 text-[var(--nxt-ink)] placeholder:text-[var(--nxt-ink-soft)]/50 [outline:none] focus:[outline:none] focus:border-[var(--nxt-green)] focus:shadow-[0_1px_0_0_var(--nxt-green)] transition-[border-color,box-shadow] duration-300';
const area = 'w-full text-[18px] font-light leading-relaxed bg-transparent border-0 border-b border-[var(--nxt-line)] px-0 py-3 text-[var(--nxt-ink)] [outline:none] focus:[outline:none] focus:border-[var(--nxt-green)] focus:shadow-[0_1px_0_0_var(--nxt-green)] transition-[border-color,box-shadow] duration-300 resize-none';

/** One question, asked on its own: the question is the heading and the answer is the only thing to fill in. */
const Ask: React.FC<{ q: Question; value: string | string[] | undefined; onChange: (value: string | string[]) => void; onEnter?: () => void; heading?: boolean }> = ({ q, value, onChange, onEnter, heading = true }) => {
  const text = typeof value === 'string' ? value : '';
  const list = Array.isArray(value) ? value : [];
  const id = `q-${q.id}`;
  const enter = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(); } };
  return (
    <div>
      {heading && (
        <label htmlFor={id} className="block font-display font-light leading-[1.15] tracking-[-0.01em] text-[clamp(1.6rem,3.4vw,2.7rem)]">
          {q.label}{q.required && <span className="sr-only"> (required)</span>}
        </label>
      )}
      {q.help && <p className="mt-3 text-[var(--nxt-ink-soft)] max-w-xl leading-relaxed">{q.help}</p>}
      <div className={heading ? 'mt-9' : 'mt-3'}>
        {q.type === 'long' && <textarea id={id} autoFocus rows={5} maxLength={5000} value={text} onChange={(e) => onChange(e.target.value)} className={area} placeholder="Type your answer" />}
        {(q.type === 'text' || q.type === 'url') && <input id={id} autoFocus type="text" maxLength={500} value={text} placeholder={q.placeholder || 'Type your answer'} onKeyDown={enter} onChange={(e) => onChange(e.target.value)} className={field} />}
        {q.type === 'number' && <input id={id} autoFocus type="number" min={0} value={text} placeholder="0" onKeyDown={enter} onChange={(e) => onChange(e.target.value)} className={`${field} max-w-xs`} />}
        {(q.type === 'select' || q.type === 'multi') && (
          <div className="flex flex-wrap gap-2.5" role="group" aria-labelledby={id}>
            {q.options?.map(o => {
              const on = q.type === 'multi' ? list.includes(o) : text === o;
              return (
                <motion.button key={o} type="button" aria-pressed={on} whileTap={{ scale: 0.95 }}
                  onClick={() => (q.type === 'multi' ? onChange(on ? list.filter(x => x !== o) : [...list, o]) : onChange(on ? '' : o))}
                  className={`rounded-full border px-5 py-2.5 text-[15px] transition-colors duration-200 ${on ? 'bg-[var(--nxt-green)] text-[var(--nxt-green-ink)] border-transparent shadow-[0_0_18px_-4px_var(--nxt-green)]' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] hover:border-[var(--nxt-green)]'}`}>
                  {o}
                </motion.button>
              );
            })}
          </div>
        )}
        {q.type === 'checkbox' && (
          <label className="flex items-start gap-4 cursor-pointer">
            <input id={id} type="checkbox" checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : '')} className="sr-only peer" />
            <span className="mt-1 w-6 h-6 shrink-0 rounded-full border border-[var(--nxt-line)] flex items-center justify-center peer-checked:bg-[var(--nxt-green)] peer-checked:border-transparent peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--nxt-green)] text-transparent peer-checked:text-[var(--nxt-green-ink)] transition-colors"><Check className="w-3.5 h-3.5" /></span>
            <span className="text-[17px] font-light leading-snug">{q.label}</span>
          </label>
        )}
      </div>
    </div>
  );
};

/** The sign-off is the last chapter; the others can be opened in any order. */
const SIGN_OFF = FUNDING_FORM.length - 1;
const preview = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(', ') : (v || '').replace(/\s+/g, ' ')).slice(0, 90);

/** The funding application: a sectioned form with a progress list, saved as a draft or submitted for review. */
export const FundingApplicationModal: React.FC<FundingApplicationModalProps> = ({
  isOpen, onClose, currentUser, problem, existingApplication, onSubmitted,
}) => {
  const [answers, setAnswers] = useState<Answers>({});
  /** -1 is the map of chapters; otherwise the chapter being answered. */
  const [index, setIndex] = useState(-1);
  const [openQ, setOpenQ] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [savedNotice, setSavedNotice] = useState<'draft' | 'submitted' | null>(null);
  const [dirty, setDirty] = useState(false);
  const [viewStage, setViewStage] = useState<string | null>(null);

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
    const saved = readApplicationSession();
    const resumed = !!saved && saved.problemId === problem?.id && saved.applicationId === existingApplication?.id && saved.path === window.location.pathname;
    setAnswers(resumed ? { ...start, ...saved!.answers } : start);
    setIndex(resumed ? Math.max(-1, Math.min(saved!.index, FUNDING_FORM.length - 1)) : -1);
    setOpenQ('');
    setViewStage(null);
    setDirty(resumed);
    setErrorMessage('');
    setSavedNotice(null);
  }, [isOpen, problem?.id, existingApplication?.id]);

  useEffect(() => {
    if (!isOpen || !problem) return;
    writeApplicationSession({ path: window.location.pathname, problemId: problem.id, applicationId: existingApplication?.id, index, answers });
  }, [isOpen, problem?.id, existingApplication?.id, index, answers]);

  const chapter = index >= 0 ? FUNDING_FORM[index] : null;
  const currentStage = stageIndex(existingApplication?.stage);
  const shownStage = viewStage || 'form';
  const missing = useMemo(() => missingRequired(answers), [answers]);

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
      openQuestion(0, text('applicant_name') ? 'applicant_email' : 'applicant_name');
      return;
    }
    setErrorMessage('');
    void store.upsertApplication(payload(), 'Draft');
    setSavedNotice('draft');
    setDirty(false);
    writeApplicationSession(null);
    setTimeout(onClose, 900);
  };

  const handleSubmit = () => {
    if (missing.length) {
      const first = missing[0];
      setErrorMessage(`${missing.length} required answer${missing.length === 1 ? ' is' : 's are'} still empty. Start with “${first.question.label}”.`);
      setIndex(SIGN_OFF);
      return;
    }
    setErrorMessage('');
    void store.upsertApplication(payload(), 'Pending');
    setSavedNotice('submitted');
    setDirty(false);
    onSubmitted?.();
    writeApplicationSession(null);
    setTimeout(onClose, 1200);
  };

  const close = () => {
    if (dirty && !window.confirm('Close without saving? Your answers will be lost. Use "Save draft" to keep them.')) return;
    writeApplicationSession(null);
    onClose();
  };

  const doneCount = FUNDING_FORM.filter(s => sectionComplete(s, answers)).length;
  const total = FUNDING_FORM.length;
  const allQuestions = FUNDING_FORM.flatMap(s => visibleQuestions(s, answers));
  const pct = Math.round((allQuestions.filter(q => isAnswered(answers[q.id])).length / allQuestions.length) * 100);
  const requiredLeft = (i: number) => missing.filter(m => m.section === FUNDING_FORM[i]).length;

  const openChapter = (i: number) => {
    setErrorMessage('');
    setIndex(i);
    const first = visibleQuestions(FUNDING_FORM[i], answers).find(q => !isAnswered(answers[q.id]));
    setOpenQ(i === SIGN_OFF ? '' : first?.id ?? '');
  };
  const openQuestion = (i: number, id: string) => { setErrorMessage(''); setIndex(i); setOpenQ(id); };
  /** Closes the question and opens the next one that still needs an answer, in the same chapter. */
  const nextQuestion = (id: string) => {
    if (!chapter) return;
    const list = visibleQuestions(chapter, answers);
    const after = list.slice(list.findIndex(q => q.id === id) + 1);
    setOpenQ((after.find(q => !isAnswered(answers[q.id])) ?? after[0])?.id ?? '');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-[var(--nxt-bg)] flex flex-col overflow-hidden"
          role="dialog" aria-modal="true" aria-label="Funding application"
        >
          {/* faint routes drifting behind the form */}
          <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.35]" preserveAspectRatio="none" viewBox="0 0 1000 600">
            <path className="nxt-flow" d="M-20 560 C 220 520 260 340 480 330 S 760 160 1020 40" fill="none" stroke="var(--nxt-green)" strokeWidth="1.2" />
            <path className="nxt-flow nxt-flow-slow" d="M-20 380 C 180 360 300 250 520 240 S 820 110 1020 160" fill="none" stroke="var(--nxt-ink-soft)" strokeWidth="1" />
          </svg>

          <header className="relative z-10 px-4 sm:px-10 h-[4.5rem] flex items-center justify-between gap-4 shrink-0">
            <div className="min-w-0 flex items-center gap-4">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--nxt-green)] opacity-60 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--nxt-green)]" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--nxt-ink-soft)]">Funding application</p>
                <p className="font-display text-[15px] truncate">{problem.title}</p>
              </div>
            </div>
            <button id="btn-close-funding-modal" onClick={close} className="p-2 rounded-full text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] hover:bg-[var(--nxt-bg-soft)] transition-colors" aria-label="Close"><X className="w-5 h-5" /></button>
          </header>

          {/* where this application sits on the pathway */}
          <div className="relative z-10 px-4 sm:px-10 pb-5 shrink-0 overflow-x-auto no-scrollbar">
            <ol className="flex items-center min-w-max max-w-5xl" aria-label="Application stages">
              {APPLICATION_STAGES.map((st, i) => {
                const reached = existingApplication ? i <= currentStage : i === 0;
                const active = shownStage === st.id;
                const passed = !!existingApplication && i < currentStage;
                return (
                  <li key={st.id} className="flex items-center">
                    {i > 0 && <span className={`h-px w-8 sm:w-14 transition-colors duration-500 ${reached ? 'bg-[var(--nxt-green)]' : 'bg-[var(--nxt-line)]'}`} />}
                    <button
                      onClick={() => setViewStage(st.id === 'form' ? null : st.id)}
                      aria-current={active ? 'step' : undefined}
                      className={`flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 text-sm whitespace-nowrap border transition-colors ${
                        active ? 'border-[var(--nxt-green)] text-[var(--nxt-ink)] bg-[var(--nxt-green-soft)]' : 'border-transparent text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${passed ? 'bg-[var(--nxt-green)] text-[var(--nxt-green-ink)]' : reached ? 'border border-[var(--nxt-green)] text-[var(--nxt-green)]' : 'border border-[var(--nxt-line)]'}`}>
                        {passed ? <Check className="w-3 h-3" /> : <st.icon className="w-3 h-3" />}
                      </span>
                      {st.label}
                      {st.id === 'ai_interview' && <span className="rounded-full border border-[var(--nxt-green)]/50 text-[var(--nxt-green)] text-[10px] uppercase tracking-wider px-2 py-0.5">Soon</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="relative z-10 flex-1 overflow-y-auto border-t border-[var(--nxt-line)]">
            {viewStage && (() => {
              const st = APPLICATION_STAGES.find(x => x.id === viewStage)!;
              const soon = st.id === 'ai_interview';
              const idx = APPLICATION_STAGES.findIndex(x => x.id === st.id);
              const status = !existingApplication ? 'Opens after you submit the form' : idx < currentStage ? 'Done' : idx === currentStage ? 'Current stage' : 'Opens when the previous stage is cleared';
              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                  <span className="w-14 h-14 rounded-full border border-[var(--nxt-green)] text-[var(--nxt-green)] flex items-center justify-center shadow-[0_0_30px_-6px_var(--nxt-green)]"><st.icon className="w-6 h-6" /></span>
                  <h2 className="mt-8 font-display font-light uppercase tracking-[0.05em] text-[clamp(1.8rem,3.4vw,2.8rem)]">{st.label}</h2>
                  <p className="mt-4 text-lg leading-relaxed text-[var(--nxt-ink-soft)] max-w-xl">{st.blurb}</p>
                  <p className="mt-6 text-sm text-[var(--nxt-green)]">{soon ? 'We are still building this stage. You will be told when it opens.' : status}</p>
                  <button onClick={() => setViewStage(null)} className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-[var(--nxt-line)] px-5 py-2.5 text-sm hover:border-[var(--nxt-green)] transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to the form
                  </button>
                </motion.div>
              );
            })()}
            <div className={`max-w-6xl mx-auto px-4 sm:px-10 py-10 ${viewStage ? 'hidden' : ''}`}>
              {errorMessage && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 max-w-3xl px-4 py-3 rounded-lg border border-[var(--nxt-peach-deep)]/40 text-[var(--nxt-peach-deep)] flex items-start gap-2 text-sm" role="alert">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{errorMessage}</span>
                </motion.div>
              )}

              <AnimatePresence mode="wait" initial={false}>
                {!chapter ? (
                  /* the map: every chapter is open from the start, in any order */
                  <motion.div key="map">
                    <p className="font-mono text-sm text-[var(--nxt-green)]">Your pitch · {doneCount}/{total} chapters</p>
                    <h2 className="mt-3 font-display font-light leading-[1.1] text-[clamp(1.8rem,3.8vw,3.1rem)] max-w-2xl">Start wherever you like.</h2>
                    <p className="mt-3 text-[var(--nxt-ink-soft)] max-w-xl leading-relaxed">Open any chapter, answer what you can and come back. Only a few answers are required, and the sign-off tells you which.</p>
                    <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {FUNDING_FORM.map((s, i) => {
                        const qs = visibleQuestions(s, answers);
                        const given = qs.filter(q => isAnswered(answers[q.id])).length;
                        const done = sectionComplete(s, answers);
                        const need = requiredLeft(i);
                        const signOff = i === SIGN_OFF;
                        return (
                          <motion.li key={s.id} className={i % 3 === 1 ? 'lg:mt-8' : i % 3 === 2 ? 'lg:mt-16' : ''}>
                            <button onClick={() => openChapter(i)} className={`group w-full h-full text-left rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${done ? 'border-[var(--nxt-green)]/60 bg-[var(--nxt-green-soft)]' : 'border-[var(--nxt-line)] bg-[var(--nxt-surface)] hover:border-[var(--nxt-green)]'}`}>
                              <span className="flex items-center justify-between">
                                <span className="font-mono text-sm text-[var(--nxt-ink-soft)]">{String(i + 1).padStart(2, '0')}</span>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${done ? 'bg-[var(--nxt-green)] text-[var(--nxt-green-ink)]' : 'border border-[var(--nxt-line)] text-transparent'}`}><Check className="w-3 h-3" /></span>
                              </span>
                              <span className="mt-6 block font-display font-light text-2xl tracking-[-0.01em]">{s.title}</span>
                              <span className="mt-2 block text-[15px] text-[var(--nxt-ink-soft)] leading-snug">{s.intro}</span>
                              <span className="mt-6 block h-px bg-[var(--nxt-line)] relative">
                                <span className="absolute left-0 top-0 h-px bg-[var(--nxt-green)] shadow-[0_0_8px_var(--nxt-green)] transition-[width] duration-500" style={{ width: signOff ? (done ? '100%' : '0%') : `${(given / qs.length) * 100}%` }} />
                              </span>
                              <span className="mt-3 flex items-center justify-between text-xs">
                                <span className="text-[var(--nxt-ink-soft)]">{signOff ? (missing.length ? 'Read back and submit' : 'Ready to submit') : `${given} of ${qs.length} answered`}</span>
                                {need > 0 && <span className="text-[var(--nxt-peach-deep)]">{need} required</span>}
                                {need === 0 && !done && !signOff && <span className="text-[var(--nxt-green)] opacity-0 group-hover:opacity-100 transition-opacity">Open</span>}
                              </span>
                            </button>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </motion.div>
                ) : index === SIGN_OFF ? (
                  <motion.div key="signoff" className="max-w-3xl">
                    <p className="font-mono text-sm text-[var(--nxt-green)]">{chapter.title}</p>
                    <h2 className="mt-3 font-display font-light leading-[1.1] text-[clamp(1.8rem,3.8vw,3.1rem)]">Your pitch, read back.</h2>
                    {missing.length > 0 && (
                      <div className="mt-8 rounded-xl border border-[var(--nxt-peach-deep)]/40 px-5 py-4">
                        <p className="text-sm text-[var(--nxt-peach-deep)]">Still needed before you can submit</p>
                        <ul className="mt-2 space-y-1">
                          {missing.map(m => (
                            <li key={m.question.id}>
                              <button onClick={() => openQuestion(FUNDING_FORM.indexOf(m.section), m.question.id)} className="text-left text-[15px] hover:text-[var(--nxt-green)] transition-colors">
                                {m.question.type === 'checkbox' ? 'Confirm: ' : ''}{m.question.label.slice(0, 80)}{m.question.label.length > 80 ? '…' : ''} <span className="text-xs text-[var(--nxt-ink-soft)]">· {m.section.title}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-10 space-y-10">
                      {FUNDING_FORM.slice(0, SIGN_OFF).map((s, si) => {
                        const rows = visibleQuestions(s, answers).filter(q => isAnswered(answers[q.id]));
                        return (
                          <section key={s.id}>
                            <div className="flex items-baseline justify-between border-b border-[var(--nxt-line)] pb-2">
                              <h3 className="font-display font-light text-xl">{s.title}</h3>
                              <button onClick={() => openChapter(si)} className="text-xs text-[var(--nxt-green)]">Edit</button>
                            </div>
                            {rows.length === 0 ? <p className="mt-3 text-sm text-[var(--nxt-ink-soft)]">Nothing answered yet.</p> : (
                              <dl className="mt-3 space-y-3">
                                {rows.map(q => (
                                  <div key={q.id}>
                                    <dt className="text-xs text-[var(--nxt-ink-soft)]">{q.label}</dt>
                                    <dd className="mt-0.5 text-[15px] font-light whitespace-pre-line">{preview(answers[q.id]) + (String(answers[q.id]).length > 90 ? '…' : '')}</dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                          </section>
                        );
                      })}
                    </div>
                    <div className="mt-12 space-y-6 border-t border-[var(--nxt-line)] pt-8">
                      {chapter.questions.map(q => <Ask key={q.id} q={q} heading={false} value={answers[q.id]} onChange={(v) => set(q.id, v)} />)}
                    </div>
                  </motion.div>
                ) : (
                  /* a chapter: every question is on the page, open whichever you want */
                  <motion.div key={chapter.id} className="grid gap-10 lg:grid-cols-[17rem_1fr]">
<nav aria-label="Chapters" className="lg:sticky lg:top-6 self-start">
                      <button onClick={() => { setErrorMessage(''); setIndex(-1); }} className="inline-flex items-center gap-1.5 text-sm text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-green)] transition-colors">
                        <ChevronLeft className="w-4 h-4" /> All chapters
                      </button>
                      <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-[var(--nxt-ink-soft)] flex justify-between">
                        <span>Your pathway</span><span className="text-[var(--nxt-green)]">{doneCount}/{total}</span>
                      </p>
                      <ol className="mt-5 flex lg:block gap-4 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 relative">
                        <span aria-hidden="true" className="hidden lg:block absolute left-[11px] top-3 bottom-3 w-px bg-[var(--nxt-line)]" />
                        <span aria-hidden="true" className="hidden lg:block absolute left-[11px] top-3 w-px bg-[var(--nxt-green)] shadow-[0_0_10px_var(--nxt-green)] transition-[height] duration-700 ease-out" style={{ height: `calc((100% - 1.5rem) * ${index / Math.max(1, FUNDING_FORM.length - 1)})` }} />
                        {FUNDING_FORM.map((s, i) => {
                          const done = sectionComplete(s, answers);
                          const current = i === index;
                          return (
                            <li key={s.id} className="shrink-0 lg:shrink relative">
                              <button onClick={() => openChapter(i)} aria-current={current ? 'step' : undefined} className={`w-full flex items-center gap-4 py-2.5 text-[15px] text-left whitespace-nowrap transition-colors ${current ? 'text-[var(--nxt-ink)]' : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'}`}>
                                <span className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                                  {current && <span className="absolute inset-0 rounded-full border border-[var(--nxt-green)] animate-ping opacity-50" />}
                                  <span className={`relative w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-300 bg-[var(--nxt-bg)] ${done ? 'bg-[var(--nxt-green)] text-[var(--nxt-green-ink)]' : current ? 'border border-[var(--nxt-green)] text-[var(--nxt-green)] shadow-[0_0_14px_-2px_var(--nxt-green)]' : 'border border-[var(--nxt-line)]'}`}>
                                    {done ? <Check className="w-3 h-3" /> : String(i + 1).padStart(2, '0')}
                                  </span>
                                </span>
                                {s.title}
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    </nav>

                    <div className="min-w-0 max-w-3xl">
                      <p className="font-mono text-sm text-[var(--nxt-green)]">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</p>
                      <h2 className="mt-3 font-display font-light leading-[1.1] text-[clamp(1.8rem,3.8vw,3.1rem)]">{chapter.title}</h2>
                      <p className="mt-3 text-[var(--nxt-ink-soft)] max-w-xl leading-relaxed">{chapter.intro}</p>
                      <ul className="mt-10 border-t border-[var(--nxt-line)]">
                        <AnimatePresence initial={false}>
                          {visibleQuestions(chapter, answers).map(q => {
                            const open = openQ === q.id;
                            const answered = isAnswered(answers[q.id]);
                            return (
                              <motion.li key={q.id} initial={false} exit={{ opacity: 0, height: 0 }} className="border-b border-[var(--nxt-line)] overflow-hidden">
                                <button onClick={() => setOpenQ(open ? '' : q.id)} aria-expanded={open} className="w-full flex items-center gap-4 py-5 text-left">
                                  <span className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${answered ? 'bg-[var(--nxt-green)] shadow-[0_0_8px_var(--nxt-green)]' : q.required ? 'bg-[var(--nxt-ink-soft)]/60' : 'border border-[var(--nxt-line)]'}`} />
                                  <span className="flex-1 min-w-0">
                                    <span className="block text-[clamp(1.05rem,1.8vw,1.3rem)] font-light leading-snug">{q.label}{q.required && <span className="sr-only"> (required)</span>}</span>
                                    {!open && answered && <span className="block mt-1 text-sm text-[var(--nxt-ink-soft)] truncate">{preview(answers[q.id])}</span>}
                                  </span>
                                  <ChevronDown className={`w-5 h-5 shrink-0 text-[var(--nxt-green)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                                </button>
                                {open && (
                                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="pb-7 pl-6">
                                    <Ask q={q} heading={false} value={answers[q.id]} onChange={(v) => set(q.id, v)} onEnter={() => nextQuestion(q.id)} />
                                    <button onClick={() => nextQuestion(q.id)} className="mt-5 text-sm text-[var(--nxt-green)] hover:underline underline-offset-4">{answered ? 'Done' : 'Skip for now'}</button>
                                  </motion.div>
                                )}
                              </motion.li>
                            );
                          })}
                        </AnimatePresence>
                      </ul>
                      <div className="mt-8 flex items-center gap-4 text-sm">
                        {index < SIGN_OFF - 1 && <button onClick={() => openChapter(index + 1)} className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-green)] transition-colors">Next chapter: {FUNDING_FORM[index + 1].title}</button>}
                        <button onClick={() => openChapter(SIGN_OFF)} className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-green)] transition-colors">Go to sign-off</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <footer className={`relative z-10 shrink-0 bg-[var(--nxt-bg)] ${viewStage ? 'hidden' : ''}`}>
            <div className="h-px bg-[var(--nxt-line)] relative">
              <div className="absolute left-0 top-0 h-px bg-[var(--nxt-green)] shadow-[0_0_12px_var(--nxt-green)] transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-10 py-3.5 flex flex-wrap items-center gap-3 justify-between">
              <button onClick={() => { setErrorMessage(''); setIndex(-1); }} disabled={index === -1} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--nxt-line)] px-5 py-2.5 text-sm hover:border-[var(--nxt-green)] transition-colors disabled:opacity-30 disabled:hover:border-[var(--nxt-line)]">
                <ChevronLeft className="w-4 h-4" /> All chapters
              </button>
              <div className="flex items-center gap-3">
                <button id="btn-save-funding-draft" onClick={handleSaveDraft} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] transition-colors">
                  <Save className="w-4 h-4" /> Save draft
                </button>
                <span className="hidden sm:inline font-mono text-xs text-[var(--nxt-ink-soft)]">{pct}%</span>
                {index === SIGN_OFF ? (
                  <button id="btn-submit-funding-application" onClick={handleSubmit} className="group inline-flex items-center gap-2 rounded-full bg-[var(--nxt-green)] text-[var(--nxt-green-ink)] px-6 py-2.5 text-sm hover:opacity-90 transition-opacity">
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /> Submit application
                  </button>
                ) : (
                  <button onClick={() => openChapter(SIGN_OFF)} className="inline-flex items-center gap-2 rounded-full bg-[var(--nxt-green)] text-[var(--nxt-green-ink)] px-6 py-2.5 text-sm hover:opacity-90 transition-opacity">
                    Review and submit{missing.length > 0 && <span className="opacity-70">· {missing.length} left</span>}
                  </button>
                )}
              </div>
            </div>
          </footer>

          {/* saved / submitted: the trail draws itself to a finished gate */}
          <AnimatePresence>
            {savedNotice && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-[var(--nxt-bg)]/95 flex items-center justify-center text-center px-6" role="status">
                <div className="flex flex-col items-center">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                    <motion.circle cx="60" cy="60" r="50" stroke="var(--nxt-green)" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                    <motion.path d="M38 62 L54 77 L84 44" stroke="var(--nxt-green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 0.5 }} />
                  </svg>
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-8 font-display font-light uppercase tracking-[0.06em] text-2xl">
                    {savedNotice === 'draft' ? 'Draft saved' : 'Application submitted'}
                  </motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }} className="mt-2 text-[var(--nxt-ink-soft)]">
                    {savedNotice === 'draft' ? 'Find it under Funds & Grants.' : 'It is now in the review queue.'}
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
