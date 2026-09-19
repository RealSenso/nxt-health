import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  DollarSign, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Search,
  Sparkles, Stethoscope, Lock, Building2, Plus, ShieldCheck, Users, Zap, Clock, Bookmark,
  Calendar, ExternalLink, Hospital, Video, UserRound
} from 'lucide-react';
import { ProblemStatement, User, FundingApplication, Resource } from '../types';
import { store } from '../services/store';
import { Reveal, RevealGroup, RevealItem, PillButton } from './ui/Reveal';
import { FundingApplicationModal } from './FundingApplicationModal';

interface ProblemStatementsListProps {
  currentUser: User | null;
  onNavigateToRoadmap: (problemId?: string) => void;
  onNavigateToFunds: () => void;
  onOpenMembershipModal: () => void;
  onOpenLogin: () => void;
  onOpenAdminPanel: () => void;
}

export const ProblemStatementsList: React.FC<ProblemStatementsListProps> = ({
  currentUser,
  onNavigateToRoadmap,
  onNavigateToFunds,
  onOpenMembershipModal,
  onOpenLogin,
  onOpenAdminPanel,
}) => {
  const [filter, setFilter] = useState<'all' | 'funded' | 'unfunded' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyModalProblem, setApplyModalProblem] = useState<ProblemStatement | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemStatement | null>(null);

  const isMember = !!currentUser?.is_member;
  const problems = store.getProblems();
  const userApplications = currentUser ? store.getScopedApplications(currentUser) : [];
  const savedProblemIds = currentUser ? store.getSavedProblemIds(currentUser.id) : [];

  const handleToggleSaved = (problem: ProblemStatement) => {
    if (!currentUser) {
      onOpenLogin();
    } else {
      store.toggleSavedProblem(currentUser.id, problem.id);
    }
  };

  const filteredProblems = problems.filter(p => {
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'funded' ? p.funded :
      filter === 'unfunded' ? !p.funded :
      savedProblemIds.includes(p.id);

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.department.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const fundedCount = problems.filter(p => p.funded).length;
  const unfundedCount = problems.filter(p => !p.funded).length;

  const [applyModalDraft, setApplyModalDraft] = useState<FundingApplication | null>(null);

  const handleApplyClick = (problem: ProblemStatement) => {
    if (!currentUser) {
      onOpenLogin();
    } else if (!currentUser.is_member) {
      onOpenMembershipModal();
    } else {
      const draft = store.getUserApplications(currentUser.id).find(
        a => a.problem_statement_id === problem.id && a.status === 'Draft'
      ) || null;
      setApplyModalDraft(draft);
      setApplyModalProblem(problem);
    }
  };

  const handleRoadmapClick = (problem: ProblemStatement) => {
    if (!currentUser) {
      onOpenLogin();
    } else if (!currentUser.is_member) {
      onOpenMembershipModal();
    } else {
      onNavigateToRoadmap(problem.id);
    }
  };

  if (selectedProblem) {
    const problem = problems.find(p => p.id === selectedProblem.id) || selectedProblem;
    const existingApp = userApplications.find(
      a => a.problem_statement_id === problem.id && a.status !== 'Draft'
    );
    const relatedResources = store.getResources().filter(r => r.assigned_problem_id === problem.id);
    const isSaved = savedProblemIds.includes(problem.id);
    const authorName = store.getUsers().find(u => u.id === problem.created_by_admin)?.name || problem.created_by_admin;

    const resourceIcon = (type: Resource['type']) =>
      type === 'hospital_connection' ? Hospital : type === 'webinar' ? Video : Calendar;

    return (
      <div className="space-y-6">
        <button
          id="btn-back-to-problems"
          onClick={() => setSelectedProblem(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Problem Statements</span>
        </button>

        <Reveal className="nxt-grid-lines nxt-dot-grid bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-3xl p-6 sm:p-10 text-[var(--nxt-ink)] shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[11px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
                {problem.department}
              </span>
              {problem.funded ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--nxt-ink-fixed)] text-white">
                  <CheckCircle className="w-3 h-3 text-[var(--nxt-mint-strong)]" />
                  <span>Funded</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--nxt-surface)] text-[var(--nxt-ink-soft)] border border-[var(--nxt-line)]">
                  <AlertCircle className="w-3 h-3 text-[var(--nxt-ink-soft)]" />
                  <span>Unfunded</span>
                </span>
              )}
              <button
                id={`btn-save-detail-${problem.id}`}
                onClick={() => handleToggleSaved(problem)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                  isSaved
                    ? 'bg-[var(--nxt-blue-strong)] text-white'
                    : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink-soft)] border border-[var(--nxt-line)] hover:text-[var(--nxt-blue-strong)]'
                }`}
              >
                <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save for later'}</span>
              </button>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold leading-tight text-[var(--nxt-ink)] mb-4">
              {problem.title}
            </h1>

            <p className="text-sm sm:text-base text-[var(--nxt-ink-soft)] leading-relaxed whitespace-pre-line mb-6">
              {problem.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--nxt-ink-soft)] mb-6">
              <span className="flex items-center gap-1.5">
                <UserRound className="w-3.5 h-3.5" />
                Authored by {authorName}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Published {new Date(problem.created_at).toLocaleDateString('en-US')}
              </span>
              {problem.funding_amount && (
                <span className="flex items-center gap-1.5 font-semibold text-[var(--nxt-mint-strong)]">
                  <DollarSign className="w-3.5 h-3.5" />
                  Allocation: {problem.funding_amount}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                if (existingApp?.status === 'Pending') {
                  return (
                    <button
                      onClick={onNavigateToFunds}
                      className="py-2.5 px-4 text-xs rounded-full font-semibold flex items-center justify-center gap-1.5 bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] hover:bg-[var(--nxt-peach)]/70 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Application Pending</span>
                    </button>
                  );
                }
                if (existingApp?.status === 'Approved') {
                  return (
                    <button
                      onClick={onNavigateToFunds}
                      className="py-2.5 px-4 text-xs rounded-full font-semibold flex items-center justify-center gap-1.5 bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] hover:bg-[var(--nxt-mint)]/70 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Application Approved</span>
                    </button>
                  );
                }
                if (problem.funded) {
                  return (
                    <PillButton
                      tone="mint"
                      onClick={() => handleApplyClick(problem)}
                      className="px-4 py-2.5 text-xs"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{existingApp?.status === 'Rejected' ? 'Reapply for Funding' : 'Apply for Funding'}</span>
                      {!isMember && <Lock className="w-3 h-3 opacity-70 ml-0.5" />}
                    </PillButton>
                  );
                }
                return null;
              })()}

              <PillButton
                tone="blue"
                onClick={() => handleRoadmapClick(problem)}
                className="px-4 py-2.5 text-xs"
              >
                <span>View Category Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
                {!isMember && <Lock className="w-3 h-3 opacity-70 ml-0.5" />}
              </PillButton>
            </div>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.12] pointer-events-none hidden sm:flex items-center justify-center">
            <Building2 className="w-72 h-72 text-[var(--nxt-blue-strong)] -mr-16" />
          </div>
        </Reveal>

        {relatedResources.length > 0 && (
          <Reveal className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--nxt-ink)] px-1">Resources Recommended for This Problem</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedResources.map(resource => {
                const Icon = resourceIcon(resource.type);
                return (
                  <div key={resource.id} className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--nxt-ink)]">{resource.title}</p>
                        <p className="text-xs text-[var(--nxt-ink-soft)] mt-1 leading-relaxed">{resource.description}</p>
                        {(resource.hospital_name || resource.host_or_speaker) && (
                          <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-1.5">
                            {resource.hospital_name || resource.host_or_speaker}
                          </p>
                        )}
                        {resource.link && (
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-[var(--nxt-blue-strong)] hover:underline"
                          >
                            <span>Open Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}

        {currentUser && (
          <FundingApplicationModal
            isOpen={!!applyModalProblem}
            onClose={() => setApplyModalProblem(null)}
            currentUser={currentUser}
            problem={applyModalProblem}
            existingApplication={applyModalDraft}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Reveal className="nxt-grid-lines nxt-dot-grid bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-3xl pt-6 sm:pt-10 text-[var(--nxt-ink)] shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl px-6 sm:px-10">
          <Reveal delay={0.05} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] border border-[var(--nxt-mint-strong)]/20 text-xs font-semibold mb-4">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Unmet Needs & Translational Pipeline</span>
          </Reveal>
          <Reveal delay={0.1} as="h1" className="font-hero text-4xl sm:text-6xl leading-[0.95] text-[var(--nxt-ink)] mb-4">
            Medicine has a lot of problems.
          </Reveal>
          <Reveal delay={0.15} as="p" className="text-sm sm:text-base text-[var(--nxt-ink-soft)] leading-relaxed mb-5 max-w-xl">
            Verified clinical pain points authored by clinical department heads, hospital surgeons, and academic research chairs.
            Apply for dedicated grant funding or launch your healthcare startup along structured milestones.
          </Reveal>

          <Reveal delay={0.2} className="flex flex-wrap items-center gap-3">
            {!currentUser ? (
              <PillButton
                tone="mint"
                onClick={onOpenLogin}
                className="px-4 py-2.5 text-xs sm:text-sm shadow-lg shadow-[var(--nxt-mint-strong)]/20"
                id="btn-banner-login"
              >
                <Sparkles className="w-4 h-4" />
                <span>Log In / Register to Apply for Grants</span>
              </PillButton>
            ) : !currentUser.is_member ? (
              <PillButton
                tone="mint"
                onClick={onOpenMembershipModal}
                className="px-4 py-2.5 text-xs sm:text-sm shadow-lg shadow-[var(--nxt-mint-strong)]/20"
                id="btn-banner-join"
              >
                <Sparkles className="w-4 h-4" />
                <span>Join as Member to Apply for Grants</span>
              </PillButton>
            ) : (
              <PillButton
                tone="blue"
                onClick={() => onNavigateToRoadmap()}
                className="px-4 py-2.5 text-xs sm:text-sm shadow-lg shadow-[var(--nxt-blue-strong)]/20"
                id="btn-banner-roadmap"
              >
                <span>Explore Task Roadmaps</span>
                <ArrowRight className="w-4 h-4" />
              </PillButton>
            )}

            {currentUser?.role === 'admin' && (
              <button
                onClick={onOpenAdminPanel}
                className="px-3 py-2 bg-[var(--nxt-surface)] hover:bg-[var(--nxt-bg)] text-[var(--nxt-ink)] text-xs font-medium rounded-full border border-[var(--nxt-line)] transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Problem (Admin)</span>
              </button>
            )}
          </Reveal>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-[0.15] pointer-events-none flex items-center justify-center">
          <Building2 className="w-80 h-80 text-[var(--nxt-blue-strong)] -mr-16" />
        </div>

        <div className="relative z-10 mt-8 border-t border-[var(--nxt-line)] overflow-hidden py-3">
          <div className="nxt-marquee-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center shrink-0">
                {['Clinical Unmet Needs', 'Grant-Ready Pipelines', 'Founder-Built Devices', 'Hospital-Validated'].map((word) => (
                  <span
                    key={word}
                    className="font-hero text-xl sm:text-2xl text-[var(--nxt-ink)]/10 px-6 whitespace-nowrap"
                  >
                    {word} <span className="text-[var(--nxt-blue-strong)]">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl px-6 sm:px-10 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-0 sm:divide-x sm:divide-[var(--nxt-line)] text-[var(--nxt-ink)] shadow-sm">
        {[
          { icon: ShieldCheck, label: `${problems.length}+ Verified Problem Statements`, tone: 'mint' },
          { icon: Users, label: `${fundedCount} Funded By Grant Committees`, tone: 'blue' },
          { icon: Zap, label: `${unfundedCount} Open & Awaiting Founders`, tone: 'mint' },
        ].map(({ icon: Icon, label, tone }, i) => (
          <div key={label} className={`flex items-center gap-3 ${i > 0 ? 'sm:pl-6' : ''}`}>
            <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${
              tone === 'blue' ? 'border-[var(--nxt-blue-strong)]/30 bg-[var(--nxt-blue)]' : 'border-[var(--nxt-mint-strong)]/30 bg-[var(--nxt-mint)]'
            }`}>
              <Icon className={`w-4 h-4 ${tone === 'blue' ? 'text-[var(--nxt-blue-strong)]' : 'text-[var(--nxt-mint-strong)]'}`} />
            </div>
            <span className="text-xs sm:text-sm font-semibold tracking-tight">{label}</span>
          </div>
        ))}
      </Reveal>

      {!isMember && (
        <Reveal className="bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--nxt-surface)]/60 text-[var(--nxt-peach-deep)] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--nxt-ink)]">
                {currentUser ? 'Member-Only Execution Features' : 'Browsing as a Guest'}
              </p>
              <p className="text-xs text-[var(--nxt-ink-soft)]">
                {currentUser
                  ? 'You are currently previewing problem statements as a visitor. Membership is required to submit funding applications and access the 21-category task management roadmaps & hospital connections.'
                  : 'Problem statements are open to everyone. Create a free account and become a member to submit funding applications and access the 21-category task management roadmaps & hospital connections.'}
              </p>
            </div>
          </div>
          <PillButton
            tone="mint"
            id="btn-banner-activate-membership"
            onClick={currentUser ? onOpenMembershipModal : onOpenLogin}
            className="shrink-0 px-3.5 py-1.5 text-xs"
          >
            {currentUser ? 'Unlock Membership ($49/mo)' : 'Log In / Register'}
          </PillButton>
        </Reveal>
      )}

      <Reveal className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest text-[var(--nxt-ink-soft)] mr-1">Filter</span>
          <button
            id="filter-all"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-[var(--nxt-ink-fixed)] text-white'
                : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink-soft)] hover:opacity-80 border border-[var(--nxt-line)]'
            }`}
          >
            All Problems ({problems.length})
          </button>
          <button
            id="filter-funded"
            onClick={() => setFilter('funded')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filter === 'funded'
                ? 'bg-[var(--nxt-mint-strong)] text-white'
                : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink-soft)] hover:opacity-80 border border-[var(--nxt-line)]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Funded ({fundedCount})</span>
          </button>
          <button
            id="filter-unfunded"
            onClick={() => setFilter('unfunded')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filter === 'unfunded'
                ? 'bg-[var(--nxt-ink-soft)] text-white'
                : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink-soft)] hover:opacity-80 border border-[var(--nxt-line)]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unfunded ({unfundedCount})</span>
          </button>
          <button
            id="filter-saved"
            onClick={() => (currentUser ? setFilter('saved') : onOpenLogin())}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filter === 'saved'
                ? 'bg-[var(--nxt-blue-strong)] text-white'
                : 'bg-[var(--nxt-surface)] text-[var(--nxt-ink-soft)] hover:opacity-80 border border-[var(--nxt-line)]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({savedProblemIds.length})</span>
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-problems"
            type="text"
            placeholder="Search medical problems, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)] placeholder:text-[var(--nxt-ink-soft)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:bg-[var(--nxt-surface)] transition-all"
          />
        </div>
      </Reveal>

      <RevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 nxt-dot-grid bg-[var(--nxt-bg-soft)] rounded-3xl p-4 sm:p-6" stagger={0.06}>
        {filteredProblems.map((problem, i) => (
          <RevealItem key={problem.id}>
            <motion.div
              id={`problem-card-${problem.id}`}
              initial={{ rotate: i % 2 === 0 ? -0.8 : 0.8 }}
              whileHover={{ y: -6, rotate: 0, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              style={{ filter: 'drop-shadow(0 6px 14px rgba(10,10,12,0.08))' }}
              className="h-full"
            >
              <div
                onClick={() => setSelectedProblem(problem)}
                className="nxt-stamp-edge bg-[var(--nxt-surface)] pt-6 pb-7 px-5 sm:px-6 flex flex-col justify-between h-full border-x border-[var(--nxt-line)] cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
                      {problem.department}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {problem.funded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--nxt-ink-fixed)] text-white">
                          <CheckCircle className="w-3 h-3 text-[var(--nxt-mint-strong)]" />
                          <span>Funded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] border border-[var(--nxt-line)]">
                          <AlertCircle className="w-3 h-3 text-[var(--nxt-ink-soft)]" />
                          <span>Unfunded</span>
                        </span>
                      )}
                      <button
                        id={`btn-save-${problem.id}`}
                        onClick={(e) => { e.stopPropagation(); handleToggleSaved(problem); }}
                        title={savedProblemIds.includes(problem.id) ? 'Remove from Saved' : 'Save for later'}
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          savedProblemIds.includes(problem.id)
                            ? 'bg-[var(--nxt-blue-strong)] text-white'
                            : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-blue)] hover:text-[var(--nxt-blue-strong)] border border-[var(--nxt-line)]'
                        }`}
                      >
                        <Bookmark className={`w-3 h-3 ${savedProblemIds.includes(problem.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-[var(--nxt-ink)] leading-snug mb-2 tracking-tight">
                    {problem.title}
                  </h3>

                  <p className="text-xs text-[var(--nxt-ink-soft)] leading-relaxed line-clamp-4 mb-4">
                    {problem.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-dashed border-[var(--nxt-line)]">
                  {problem.funding_amount && (
                    <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-[var(--nxt-ink-soft)]">
                      <DollarSign className="w-3.5 h-3.5 text-[var(--nxt-mint-strong)] shrink-0" />
                      <span className="text-[var(--nxt-ink-soft)]">Allocation:</span>
                      <span className="font-semibold text-[var(--nxt-mint-strong)]">{problem.funding_amount}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {problem.funded && (() => {
                      const existingApp = userApplications.find(
                        a => a.problem_statement_id === problem.id && a.status !== 'Draft'
                      );

                      if (existingApp?.status === 'Pending') {
                        return (
                          <button
                            id={`btn-apply-funding-${problem.id}`}
                            onClick={(e) => { e.stopPropagation(); onNavigateToFunds(); }}
                            className="flex-1 py-2 px-3 text-xs rounded-full font-semibold flex items-center justify-center gap-1.5 bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] hover:bg-[var(--nxt-peach)]/70 transition-colors"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Application Pending</span>
                          </button>
                        );
                      }

                      if (existingApp?.status === 'Approved') {
                        return (
                          <button
                            id={`btn-apply-funding-${problem.id}`}
                            onClick={(e) => { e.stopPropagation(); onNavigateToFunds(); }}
                            className="flex-1 py-2 px-3 text-xs rounded-full font-semibold flex items-center justify-center gap-1.5 bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)] hover:bg-[var(--nxt-mint)]/70 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Application Approved</span>
                          </button>
                        );
                      }

                      return (
                        <PillButton
                          tone="mint"
                          id={`btn-apply-funding-${problem.id}`}
                          onClick={(e) => { e.stopPropagation(); handleApplyClick(problem); }}
                          className="flex-1 py-2 px-3 text-xs"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{existingApp?.status === 'Rejected' ? 'Reapply for Funding' : 'Apply for Funding'}</span>
                          {!isMember && <Lock className="w-3 h-3 opacity-70 ml-0.5" />}
                        </PillButton>
                      );
                    })()}

                    <button
                      id={`btn-roadmap-${problem.id}`}
                      onClick={(e) => { e.stopPropagation(); handleRoadmapClick(problem); }}
                      className={`py-2 px-3 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                        problem.funded ? '' : 'flex-1'
                      }`}
                      title="View category roadmap"
                    >
                      <span>Roadmap</span>
                      <ArrowRight className="w-3 h-3 text-[var(--nxt-ink-soft)]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </RevealItem>
        ))}

        {filteredProblems.length === 0 && (
          <div className="col-span-2 py-12 text-center bg-[var(--nxt-surface)] rounded-2xl border border-dashed border-[var(--nxt-line)] p-8">
            <Stethoscope className="w-10 h-10 text-[var(--nxt-ink-soft)] mx-auto mb-3" />
            <p className="text-sm font-bold text-[var(--nxt-ink)]">No medical problem statements found</p>
            <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Try resetting the filter or search query.</p>
            <button
              onClick={() => { setFilter('all'); setSearchQuery(''); }}
              className="mt-3 text-xs text-[var(--nxt-mint-strong)] font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </RevealGroup>

      {currentUser && (
        <FundingApplicationModal
          isOpen={!!applyModalProblem}
          onClose={() => setApplyModalProblem(null)}
          currentUser={currentUser}
          problem={applyModalProblem}
          existingApplication={applyModalDraft}
        />
      )}
    </div>
  );
};
