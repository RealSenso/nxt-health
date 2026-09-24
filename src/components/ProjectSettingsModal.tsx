import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, AlertTriangle, RotateCcw, Trash2, Check, Save } from 'lucide-react';
import { Category, ProblemStatement, User } from '../types';
import { store } from '../services/store';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  problem: ProblemStatement | null;
  currentCategory: Category | null;
  currentProgressPercent: number;
  onReselectCategory: () => void;
  onResetProgress: () => void;
  onRemoveProject: () => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  problem,
  currentCategory,
  currentProgressPercent,
  onReselectCategory,
  onResetProgress,
  onRemoveProject,
}) => {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmingReselect, setConfirmingReselect] = useState(false);

  const scopeKey = store.getScopeKey(currentUser);

  useEffect(() => {
    if (isOpen && problem) {
      setNote(store.getProjectNote(scopeKey, problem.id));
      setSaved(false);
      setConfirmingReselect(false);
    }
  }, [isOpen, problem?.id, scopeKey]);

  if (!problem) return null;

  const handleSaveNote = () => {
    store.setProjectNote(scopeKey, problem.id, note.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleRemove = () => {
    if (window.confirm(`Remove "${problem.title}" from your roadmap workspace? Milestone progress you've tracked stays saved and reappears if you add it back.`)) {
      onRemoveProject();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 py-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[var(--nxt-line)]"
          >
            <button
              id="btn-close-project-settings"
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]">
                <Settings className="w-4 h-4" />
              </span>
              <h3 className="font-display text-lg font-bold text-[var(--nxt-ink)]">Project Settings</h3>
            </div>
            <p className="text-xs text-[var(--nxt-ink-soft)] mb-5">
              {store.getMyTeam(currentUser)
                ? 'Shared with your team — teammates see the same note, category, and progress.'
                : 'Personal to your account — nothing here is visible to other users.'}
            </p>

            <div className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-4 mb-5">
              <span className="text-xs font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
                {problem.department}
              </span>
              <h4 className="font-display text-sm font-bold text-[var(--nxt-ink)] mt-2">
                {problem.title}
              </h4>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-1.5">
                Personal Note
              </label>
              <textarea
                id="input-project-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Jot down anything you want to remember about this project — next steps, contacts, reminders..."
                className="w-full text-xs sm:text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-3 text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-blue-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  id="btn-save-project-note"
                  onClick={handleSaveNote}
                  className="px-3 py-1.5 bg-[var(--nxt-ink-fixed)] hover:opacity-90 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-opacity"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
                {saved && (
                  <span className="text-xs text-[var(--nxt-mint-deep)] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>
            </div>

            <div className="mb-5 pt-5 border-t border-[var(--nxt-line)]">
              <label className="block text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-2">
                Product Category
              </label>
              {currentCategory ? (
                <p className="text-xs text-[var(--nxt-ink-soft)] mb-3">
                  Locked to <span className="font-semibold text-[var(--nxt-ink)]">{currentCategory.name}</span>
                  {currentProgressPercent > 0 && <> — <span className="font-semibold text-[var(--nxt-blue-strong)]">{currentProgressPercent}%</span> complete</>}.
                </p>
              ) : (
                <p className="text-xs text-[var(--nxt-ink-soft)] mb-3">No category picked yet for this project.</p>
              )}

              {!confirmingReselect ? (
                <button
                  id="btn-open-reselect-warning"
                  onClick={() => setConfirmingReselect(true)}
                  className="px-3.5 py-2 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {currentCategory ? 'Reset & choose a different category' : 'Choose a category'}
                </button>
              ) : (
                <div className="bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/30 rounded-2xl p-3.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-[var(--nxt-peach-deep)] shrink-0 mt-0.5" />
                    <p className="text-xs text-[var(--nxt-peach-deep)] font-medium leading-relaxed">
                      {currentCategory && currentProgressPercent > 0 ? (
                        <>This unlocks <span className="font-bold">{currentCategory.name}</span>, clears your <span className="font-bold">{currentProgressPercent}%</span> progress, deliverables and log for this project, and takes you back to pick a category. This can't be undone.</>
                      ) : currentCategory ? (
                        <>This unlocks <span className="font-bold">{currentCategory.name}</span> and takes you back to pick a category. Any deliverables and log entries for this project are cleared.</>
                      ) : (
                        <>You'll pick a category next. Once chosen, it's locked to this project until you reset it here.</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      id="btn-confirm-reselect-category"
                      onClick={onReselectCategory}
                      className="px-3 py-1.5 bg-[var(--nxt-peach-deep)] hover:opacity-90 text-white rounded-full text-xs font-semibold transition-opacity"
                    >
                      {currentCategory ? 'Unlock & reset' : 'Continue to category picker'}
                    </button>
                    <button
                      onClick={() => setConfirmingReselect(false)}
                      className="px-3 py-1.5 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-5 border-t border-[var(--nxt-line)] flex flex-wrap items-center gap-2">
              {currentCategory && currentProgressPercent > 0 && (
                <button
                  id="btn-settings-reset-progress"
                  onClick={onResetProgress}
                  className="px-3.5 py-2 border border-[var(--nxt-peach-deep)]/30 hover:bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Progress
                </button>
              )}
              <button
                id="btn-settings-remove-project"
                onClick={handleRemove}
                className="px-3.5 py-2 border border-[var(--nxt-peach-deep)]/30 hover:bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Project
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
