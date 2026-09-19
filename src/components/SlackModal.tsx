import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { store } from '../services/store';

interface SlackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlackModal: React.FC<SlackModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const slackUrl = store.getSlackUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(slackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[var(--nxt-line)]"
          >
            <button
              id="btn-close-slack-modal"
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#E01E5A]/10 text-[#E01E5A] flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--nxt-ink)]">Founder & Clinician Slack</h3>
              <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">
                Connect with fellow healthcare entrepreneurs, clinical trialists, and medical advisors in real time.
              </p>
            </div>

            <div className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-3 mb-5">
              <label className="text-[11px] font-semibold text-[var(--nxt-ink-soft)] uppercase tracking-wider block mb-1">
                Static Invite Link (MVP)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={slackUrl}
                  className="w-full text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-full px-2.5 py-1.5 text-[var(--nxt-ink-soft)] select-all font-mono focus:outline-hidden"
                />
                <button
                  id="btn-copy-slack-link"
                  onClick={handleCopy}
                  className="p-2 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-surface)] rounded-full border border-[var(--nxt-line)] transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-[var(--nxt-mint-strong)]" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {copied && (
                <p className="text-[11px] text-[var(--nxt-mint-strong)] mt-1 font-medium">Copied link to clipboard!</p>
              )}
            </div>

            <div className="space-y-2">
              <motion.a
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                id="btn-open-slack-link"
                href={slackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#4A154B] hover:bg-[#3d113e] text-white font-semibold rounded-full text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>Launch Slack Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.a>
              <button
                onClick={onClose}
                className="w-full py-2 px-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] text-xs font-medium transition-colors"
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
