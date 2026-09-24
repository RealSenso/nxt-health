import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock, CheckCircle2, XCircle, ArrowRight,
  FileText, PenLine, Trash2
} from 'lucide-react';
import { User, FundingApplication } from '../types';
import { store } from '../services/store';
import { RevealGroup, RevealItem, PillButton } from './ui/Reveal';
import { FundingApplicationModal } from './FundingApplicationModal';
import { PageHeader } from './ui/PageHeader';
import { BadgeDollarSign } from 'lucide-react';

interface FundsPageProps {
  currentUser: User;
  onNavigateToRoadmap: (problemId?: string) => void;
  onNavigateToProblems: () => void;
}

export const FundsPage: React.FC<FundsPageProps> = ({
  currentUser,
  onNavigateToRoadmap,
  onNavigateToProblems,
}) => {
  const userApplications = store.getScopedApplications(currentUser);
  const [editingDraft, setEditingDraft] = useState<FundingApplication | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] border border-[var(--nxt-mint-strong)]/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--nxt-mint-strong)]" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] border border-[var(--nxt-peach-deep)]/30">
            <XCircle className="w-3.5 h-3.5 text-[var(--nxt-peach-deep)]" />
            Rejected
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] border border-[var(--nxt-line)]">
            <PenLine className="w-3.5 h-3.5" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] border border-[var(--nxt-peach-deep)]/30">
            <Clock className="w-3.5 h-3.5 text-[var(--nxt-peach-deep)] animate-pulse" />
            Pending Review
          </span>
        );
    }
  };

  const editingProblem = editingDraft ? store.getProblemById(editingDraft.problem_statement_id) : null;

  const handleDeleteDraft = (id: string) => {
    if (window.confirm('Discard this draft application? This cannot be undone.')) {
      store.deleteApplication(id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BadgeDollarSign}
        eyebrow="Funding"
        title="Your grant applications"
        subtitle="Track every application from draft to decision. To apply, open a funded problem statement and choose Apply for funding."
        illustration="funds"
        actions={
          <>
            <PillButton tone="mint" id="btn-browse-problems" onClick={onNavigateToProblems} className="px-5 py-2.5 text-sm">
              Browse funded problems <ArrowRight className="w-4 h-4" />
            </PillButton>
            <PillButton tone="ghost" id="btn-proceed-roadmap" onClick={() => onNavigateToRoadmap()} className="px-4 py-2.5 text-sm">
              My roadmaps
            </PillButton>
          </>
        }
      />

      {userApplications.length === 0 ? (
        <div className="bg-[var(--nxt-surface)] rounded-2xl border border-dashed border-[var(--nxt-line)] p-10 text-center">
          <FileText className="w-10 h-10 text-[var(--nxt-ink-soft)] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[var(--nxt-ink)]">No Funding Applications Yet</h3>
          <p className="text-xs text-[var(--nxt-ink-soft)] mt-1 max-w-sm mx-auto">
            Applications open from a problem statement's card — click "Apply for Funding" there to get started.
          </p>
          <button
            onClick={onNavigateToProblems}
            className="mt-4 px-4 py-2 bg-[var(--nxt-mint-strong)] text-white rounded-full text-xs font-semibold hover:bg-[var(--nxt-mint-deep)] transition-colors"
          >
            Browse Problem Statements
          </button>
        </div>
      ) : (
        <RevealGroup className="grid grid-cols-1 gap-4" stagger={0.06}>
          {userApplications.map((app) => (
            <RevealItem key={app.id}>
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                id={`application-card-${app.id}`}
                className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-5 sm:p-6 shadow-sm hover:border-[var(--nxt-mint-strong)]/30 transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-[var(--nxt-line)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--nxt-sky-deep)] bg-[var(--nxt-sky)] px-2 py-0.5 rounded-full">
                        {app.startup_name}
                      </span>
                      <span className="text-xs text-[var(--nxt-ink-soft)]">•</span>
                      <span className="text-xs text-[var(--nxt-ink-soft)]">
                        {app.status === 'Draft' ? 'Last saved' : 'Submitted'} {new Date(app.submitted_at).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    <h4 className="font-display text-sm sm:text-base font-bold text-[var(--nxt-ink)] mt-1">
                      {app.problem_title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[var(--nxt-ink-soft)] font-medium">Requested</p>
                      <p className="text-sm font-extrabold text-[var(--nxt-mint-strong)]">
                        ${app.amount_requested.toLocaleString('en-US')}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {app.pitch && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-1">
                      Pitch & Technical Solution
                    </p>
                    <p className="text-xs text-[var(--nxt-ink-soft)] leading-relaxed bg-[var(--nxt-bg-soft)] p-3 rounded-xl border border-[var(--nxt-line)]">
                      {app.pitch}
                    </p>
                  </div>
                )}

                {app.admin_feedback && (
                  <div className="mt-3 p-3 rounded-lg bg-[var(--nxt-lavender)] border border-[var(--nxt-lavender-strong)]/20 text-xs text-[var(--nxt-lavender-strong)]">
                    <p className="font-bold text-[var(--nxt-lavender-strong)]">Reviewer Feedback:</p>
                    <p className="mt-0.5 text-[var(--nxt-ink)] font-medium">{app.admin_feedback}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-[var(--nxt-line)] flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--nxt-ink-soft)]">
                    Applicant: {app.applicant_name} ({app.applicant_email})
                  </span>

                  {app.status === 'Draft' ? (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => handleDeleteDraft(app.id)}
                        className="text-xs font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Discard</span>
                      </button>
                      <PillButton
                        tone="mint"
                        onClick={() => setEditingDraft(app)}
                        className="px-3 py-1.5 text-xs"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        <span>Continue Draft</span>
                      </PillButton>
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigateToRoadmap(app.problem_statement_id)}
                      className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:text-[var(--nxt-mint-deep)] flex items-center gap-1 shrink-0"
                    >
                      <span>Work on Category Roadmap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      <FundingApplicationModal
        isOpen={!!editingDraft}
        onClose={() => setEditingDraft(null)}
        currentUser={currentUser}
        problem={editingProblem || null}
        existingApplication={editingDraft}
      />
    </div>
  );
};
