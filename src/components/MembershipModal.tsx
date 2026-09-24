import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Sparkles, MessageSquare, DollarSign, ListTodo, Hospital } from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccess?: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const handleActivate = () => {
    store.toggleCurrentUserMembership(true);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleDeactivate = () => {
    store.toggleCurrentUserMembership(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[var(--nxt-line)]"
          >
            <button
              id="btn-close-membership-modal"
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.6, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
                className="w-12 h-12 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center mx-auto mb-3"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
              <h3 className="font-display text-2xl font-bold text-[var(--nxt-ink)]">
                {currentUser.is_member ? 'Entrepreneur Membership Active' : 'Unlock Entrepreneur Membership'}
              </h3>
              <p className="text-sm text-[var(--nxt-ink-soft)] mt-1.5">
                Full access to medical problem grants, category roadmaps, and clinical hospital networks.
              </p>
            </div>

            <div className="space-y-3 bg-[var(--nxt-bg-soft)] rounded-2xl p-4 mb-6 border border-[var(--nxt-line)]">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center shrink-0 mt-0.5">
                  <DollarSign className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--nxt-ink)]">Apply for Non-Dilutive Clinical Problem Grants</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)]">Directly pitch solutions to funded clinical unmet needs ($100k-$500k allocations).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--nxt-sky)] text-[var(--nxt-sky-deep)] flex items-center justify-center shrink-0 mt-0.5">
                  <ListTodo className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--nxt-ink)]">21 Medical Category Execution Roadmaps</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)]">Custom tailored step-by-step milestones (Market Research → Prototype → Validation → Regulatory FDA/CE → GTM).</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)] flex items-center justify-center shrink-0 mt-0.5">
                  <Hospital className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--nxt-ink)]">Direct Hospital Validation Network</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)]">Connect with Johns Hopkins, Mayo Clinic, and Cleveland Clinic pilot programs & trialists.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--nxt-ink)]">Private Founder & Expert Slack Channel</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)]">Immediate access to MedTech peer founders, regulatory experts, and surgical consultants.</p>
                </div>
              </div>
            </div>

            <div className="border border-[var(--nxt-mint-strong)]/20 bg-[var(--nxt-mint)]/30 rounded-2xl p-4 mb-6 text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-display text-3xl font-extrabold text-[var(--nxt-ink)]">$49</span>
                <span className="text-xs text-[var(--nxt-ink-soft)] font-medium">/ month</span>
              </div>
              <p className="text-xs text-[var(--nxt-mint-strong)] mt-1 font-medium">
                Cancel anytime — billed monthly
              </p>
            </div>

            <div className="space-y-2">
              {!currentUser.is_member ? (
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  id="btn-confirm-membership"
                  onClick={handleActivate}
                  className="w-full py-3 px-4 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white font-semibold rounded-full text-sm shadow-md shadow-[var(--nxt-mint-strong)]/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Unlock Membership Now</span>
                </motion.button>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] text-xs font-medium text-center flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4 text-[var(--nxt-mint-strong)]" />
                    <span>You are currently an Active Paying Member!</span>
                  </div>
                  <button
                    id="btn-deactivate-membership"
                    onClick={handleDeactivate}
                    className="w-full py-2 px-3 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] text-xs font-medium transition-colors"
                  >
                    Deactivate Membership
                  </button>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
