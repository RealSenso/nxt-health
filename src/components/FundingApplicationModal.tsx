import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Save, AlertCircle, Check, DollarSign } from 'lucide-react';
import { FundingApplication, ProblemStatement, User } from '../types';
import { store } from '../services/store';

interface FundingApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  problem: ProblemStatement | null;
  existingApplication?: FundingApplication | null;
  onSubmitted?: () => void;
}

export const FundingApplicationModal: React.FC<FundingApplicationModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  problem,
  existingApplication,
  onSubmitted,
}) => {
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [startupName, setStartupName] = useState('');
  const [pitch, setPitch] = useState('');
  const [amountRequested, setAmountRequested] = useState<number>(100000);
  const [supportingNotes, setSupportingNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [savedNotice, setSavedNotice] = useState<'draft' | 'submitted' | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setApplicantName(existingApplication?.applicant_name || currentUser.name || '');
    setApplicantEmail(existingApplication?.applicant_email || currentUser.email || '');
    setStartupName(existingApplication?.startup_name || '');
    setPitch(existingApplication?.pitch || '');
    setAmountRequested(existingApplication?.amount_requested || 100000);
    setSupportingNotes(existingApplication?.supporting_notes || '');
    setErrorMessage('');
    setSavedNotice(null);
  }, [isOpen, problem?.id, existingApplication?.id]);

  if (!problem) return null;

  const buildPayload = () => ({
    id: existingApplication?.id,
    user_id: currentUser.id,
    applicant_name: applicantName.trim(),
    applicant_email: applicantEmail.trim(),
    startup_name: startupName.trim() || 'Undisclosed Venture',
    problem_statement_id: problem.id,
    problem_title: problem.title,
    pitch: pitch.trim(),
    amount_requested: Number(amountRequested),
    supporting_notes: supportingNotes.trim(),
  });

  const handleSaveDraft = () => {
    if (!applicantName.trim() || !applicantEmail.trim()) {
      setErrorMessage('Add at least your name and email before saving a draft.');
      return;
    }
    setErrorMessage('');
    store.upsertApplication(buildPayload(), 'Draft');
    setSavedNotice('draft');
    setTimeout(() => onClose(), 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!applicantName.trim() || !applicantEmail.trim() || !pitch.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, and Pitch).');
      return;
    }
    if (amountRequested <= 0) {
      setErrorMessage('Please enter a valid funding amount.');
      return;
    }

    store.upsertApplication(buildPayload(), 'Pending');
    setSavedNotice('submitted');
    if (onSubmitted) onSubmitted();
    setTimeout(() => onClose(), 1200);
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
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[var(--nxt-line)]"
          >
            <button
              id="btn-close-funding-modal"
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 pr-8">
              <span className="text-[11px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
                {problem.department}
              </span>
              <h3 className="font-display text-lg sm:text-xl font-bold text-[var(--nxt-ink)] leading-snug mt-2">
                {problem.title}
              </h3>
              {problem.funding_amount && (
                <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">
                  Grant pool: <span className="font-semibold text-[var(--nxt-mint-strong)]">{problem.funding_amount}</span>
                </p>
              )}
            </div>

            {savedNotice && (
              <div className="mb-5 p-4 rounded-xl bg-[var(--nxt-mint)]/50 border border-[var(--nxt-mint-strong)]/30 text-[var(--nxt-mint-deep)] flex items-center gap-3">
                <Check className="w-5 h-5 text-[var(--nxt-mint-strong)] shrink-0" />
                <div>
                  <p className="text-sm font-bold">
                    {savedNotice === 'draft' ? 'Draft saved' : 'Application submitted!'}
                  </p>
                  <p className="text-xs text-[var(--nxt-mint-deep)]">
                    {savedNotice === 'draft'
                      ? 'Find it under Funds & Grants → your applications whenever you want to finish it.'
                      : 'Your proposal is now in the admin review queue.'}
                  </p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/30 text-[var(--nxt-peach-deep)] flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">
                    Applicant Lead Name <span className="text-[var(--nxt-peach-deep)]">*</span>
                  </label>
                  <input
                    id="input-applicant-name"
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Dr. Alex Mercer"
                    className="w-full text-xs sm:text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-2.5 text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">
                    Contact Email <span className="text-[var(--nxt-peach-deep)]">*</span>
                  </label>
                  <input
                    id="input-applicant-email"
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="founder@biotech.com"
                    className="w-full text-xs sm:text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-2.5 text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">
                    Startup / Venture Name
                  </label>
                  <input
                    id="input-startup-name"
                    type="text"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="e.g. CardioSense Technologies"
                    className="w-full text-xs sm:text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-2.5 text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-1.5">
                  Funding Amount Requested (USD) <span className="text-[var(--nxt-peach-deep)]">*</span>
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nxt-ink-soft)] font-bold text-sm">$</span>
                  <input
                    id="input-amount-requested"
                    type="number"
                    step="5000"
                    min="10000"
                    value={amountRequested}
                    onChange={(e) => setAmountRequested(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] font-bold focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-1.5">
                  Pitch / Technical Description <span className="text-[var(--nxt-peach-deep)]">*</span>
                </label>
                <textarea
                  id="input-pitch"
                  rows={4}
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="Explain your proposed technological solution, mechanism of action, current prototype maturity, and how it solves this clinical problem..."
                  className="w-full text-xs sm:text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-3 text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">
                  Supporting Notes & Clinical Readiness
                </label>
                <textarea
                  id="input-supporting-notes"
                  rows={3}
                  value={supportingNotes}
                  onChange={(e) => setSupportingNotes(e.target.value)}
                  placeholder="List IP/provisional patent status, preliminary benchtop data, team credentials, or clinical advisors involved."
                  className="w-full text-xs sm:text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-3 text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                />
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  id="btn-submit-funding-application"
                  type="submit"
                  className="px-6 py-3 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white font-bold rounded-full text-xs sm:text-sm shadow-md shadow-[var(--nxt-mint-strong)]/20 transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Application</span>
                </motion.button>

                <button
                  id="btn-save-funding-draft"
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-3 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] font-semibold rounded-full text-xs sm:text-sm transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-3 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] text-xs font-medium transition-colors ml-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
