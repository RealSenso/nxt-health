import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X, CheckCircle, Calendar, ExternalLink, Hospital,
  Video, BookOpen, Users, Mail, Building, Check, Sparkles,
  Paperclip, Upload, Download, AlertCircle, Clock, MessageSquareWarning
} from 'lucide-react';
import { Step, Resource, User, Category, SubmissionFile } from '../types';
import { store } from '../services/store';

const MAX_FILE_BYTES = 4 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface StepDetailModalProps {
  step: Step | null;
  category: Category | null;
  currentUser: User;
  problemId?: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onClose: () => void;
}
export const StepDetailModal: React.FC<StepDetailModalProps> = ({
  step,
  category,
  currentUser,
  problemId,
  isCompleted,
  onToggleComplete,
  onClose,
}) => {
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'hospital' | 'session' | 'webinar_seminar'>('all');
  const [requestedIntroId, setRequestedIntroId] = useState<string | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [pendingFiles, setPendingFiles] = useState<SubmissionFile[]>([]);
  const [fileError, setFileError] = useState('');
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  if (!step) return null;
  const { common: resources, recommended: recommendedResources } = store.getResourcesForUser(step.id, currentUser.id, problemId);

  const scopeUserIds = store.getScopeUserIds(currentUser);
  const submissions = problemId
    ? store.getStepSubmissionsForStep(step.id, scopeUserIds).filter(s => s.problem_id === problemId)
    : [];
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
        const dataUrl = await readFileAsDataUrl(file);
        accepted.push({ name: file.name, size: file.size, type: file.type, dataUrl });
      }
      setPendingFiles(prev => [...prev, ...accepted]);
    } finally {
      setIsReadingFiles(false);
    }
  };
  const handleRemovePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };
  const handleSubmitEvidence = () => {
    if (!problemId || !category) return;
    if (!submissionNote.trim() && pendingFiles.length === 0) {
      setFileError('Add a note or attach at least one file before submitting.');
      return;
    }
    store.submitStepEvidence({
      step_id: step.id,
      category_id: category.id,
      problem_id: problemId,
      user_id: currentUser.id,
      submitted_by_name: currentUser.name,
      note: submissionNote.trim(),
      files: pendingFiles,
    });
    setSubmissionNote('');
    setPendingFiles([]);
    setFileError('');
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 3000);
  };

  const hospitalConnections = resources.filter(r => r.type === 'hospital_connection');
  const filteredResources = resources.filter(r => {
    if (activeTypeFilter === 'all') return true;
    if (activeTypeFilter === 'hospital') return r.type === 'hospital_connection';
    if (activeTypeFilter === 'session') return r.type === 'session';
    if (activeTypeFilter === 'webinar_seminar') return r.type === 'webinar' || r.type === 'seminar';
    return true;
  });
  const handleRequestIntro = (resId: string) => {
    setRequestedIntroId(resId);
    setTimeout(() => {
      setRequestedIntroId(null);
    }, 4000);
  };
  const getResourceTypeBadge = (type: string) => {
    switch (type) {
      case 'hospital_connection':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)] border border-[var(--nxt-lavender-strong)]/20">
            <Hospital className="w-3 h-3 text-[var(--nxt-lavender-strong)]" />
            Hospital Connection
          </span>
        );
      case 'session':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--nxt-sky)] text-[var(--nxt-sky-deep)] border border-[var(--nxt-sky-deep)]/20">
            <Users className="w-3 h-3 text-[var(--nxt-sky-deep)]" />
            Expert 1-on-1 Session
          </span>
        );
      case 'webinar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] border border-[var(--nxt-peach-deep)]/20">
            <Video className="w-3 h-3 text-[var(--nxt-peach-deep)]" />
            Webinar
          </span>
        );
      case 'seminar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] border border-[var(--nxt-mint-strong)]/20">
            <BookOpen className="w-3 h-3 text-[var(--nxt-mint-strong)]" />
            Masterclass Seminar
          </span>
        );
      default:
        return null;
    }
  };
  const isValidationStep =
    step.name.toLowerCase().includes('validation') ||
    (step.stage_tag && step.stage_tag.toLowerCase().includes('validation')) ||
    hospitalConnections.length > 0;
  const renderResourceCard = (res: Resource) => {
    const isHospital = res.type === 'hospital_connection';
    return (
      <div
        key={res.id}
        id={`resource-item-${res.id}`}
        className={`p-4 rounded-xl border transition-all ${
          res.assigned_user_id
            ? 'bg-[var(--nxt-mint)]/20 border-[var(--nxt-mint-strong)]/40 hover:border-[var(--nxt-mint-strong)]/60'
            : isHospital
            ? 'bg-[var(--nxt-lavender)]/30 border-[var(--nxt-lavender-strong)]/30 hover:border-[var(--nxt-lavender-strong)]/50'
            : 'bg-[var(--nxt-surface)] border-[var(--nxt-line)] hover:border-[var(--nxt-mint-strong)]/30'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-1.5 flex-wrap">
              {getResourceTypeBadge(res.type)}
              {res.assigned_user_id && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--nxt-mint-strong)] text-white">
                  <Sparkles className="w-3 h-3" />
                  Recommended for You
                </span>
              )}
            </div>
            <h5 className="text-sm font-bold text-[var(--nxt-ink)] leading-snug">
              {res.title}
            </h5>
          </div>
        </div>
        <p className="text-xs text-[var(--nxt-ink-soft)] leading-relaxed mb-3">
          {res.description}
        </p>
        {isHospital && (
          <div className="bg-[var(--nxt-surface)] rounded-xl p-3 border border-[var(--nxt-lavender-strong)]/20 space-y-1.5 mb-3 text-xs">
            {res.hospital_name && (
              <div className="flex items-center gap-2 text-[var(--nxt-ink)] font-semibold">
                <Building className="w-3.5 h-3.5 text-[var(--nxt-lavender-strong)]" />
                <span>{res.hospital_name}</span>
              </div>
            )}
            {res.clinical_department && (
              <p className="text-[var(--nxt-ink-soft)] text-[11px]">
                <strong>Department:</strong> {res.clinical_department}
              </p>
            )}
            {res.contact_person && (
              <div className="flex items-center gap-1.5 text-[var(--nxt-ink-soft)] text-[11px]">
                <Users className="w-3 h-3 text-[var(--nxt-ink-soft)]" />
                <span>Clinical Lead: {res.contact_person}</span>
              </div>
            )}
            {res.pilot_status && (
              <div className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] border border-[var(--nxt-mint-strong)]/20">
                Status: {res.pilot_status}
              </div>
            )}
          </div>
        )}
        {!isHospital && (res.date || res.host_or_speaker) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--nxt-ink-soft)] mb-3">
            {res.date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--nxt-ink-soft)]" />
                <span>{res.date}</span>
              </div>
            )}
            {res.host_or_speaker && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[var(--nxt-ink-soft)]" />
                <span>Host: {res.host_or_speaker}</span>
              </div>
            )}
          </div>
        )}
        <div className="pt-2 border-t border-[var(--nxt-line)] flex items-center justify-between">
          {isHospital ? (
            <div className="flex items-center gap-2">
              <button
                id={`btn-connect-hospital-${res.id}`}
                onClick={() => handleRequestIntro(res.id)}
                className="px-3 py-1.5 bg-[var(--nxt-lavender-strong)] hover:bg-[var(--nxt-lavender-deep)] text-white rounded-full text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Request Pilot Introduction</span>
              </button>
              {requestedIntroId === res.id && (
                <span className="text-[11px] text-[var(--nxt-mint-strong)] font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Intro packet sent to {res.contact_person || 'Clinical Liaison'}!
                </span>
              )}
            </div>
          ) : res.link ? (
            <a
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--nxt-mint-strong)] hover:text-[var(--nxt-mint-deep)] hover:underline"
            >
              <span>Access Resource / Register</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-[11px] text-[var(--nxt-ink-soft)]">Included in Founder Membership</span>
          )}
        </div>
      </div>
    );
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[var(--nxt-line)] max-h-[90vh] flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--nxt-line)] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[var(--nxt-mint-strong)] uppercase tracking-wider">
                Step {step.order} • {category?.name || 'Category Roadmap'}
              </span>
              {step.stage_tag && (
                <span className="text-[10px] font-semibold bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] px-2 py-0.5 rounded-full">
                  {step.stage_tag}
                </span>
              )}
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[var(--nxt-ink)]">
              {step.name}
            </h2>
          </div>
          <button
            id="btn-close-step-modal"
            onClick={onClose}
            className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          <div className="bg-[var(--nxt-bg-soft)] p-4 rounded-2xl border border-[var(--nxt-line)]">
            <h4 className="text-xs font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-1">
              Milestone Objective & Scope
            </h4>
            <p className="text-xs sm:text-sm text-[var(--nxt-ink-soft)] leading-relaxed">
              {step.description}
            </p>
          </div>
          {isValidationStep && (
            <div className="bg-gradient-to-r from-[var(--nxt-lavender-strong)] to-[var(--nxt-lavender-deep)] rounded-2xl p-4 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-1 text-white/80">
                <Hospital className="w-4 h-4 text-white" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Clinical Validation Directory Active
                </span>
              </div>
              <p className="text-xs text-white/90">
                This validation step grants direct introduction pathways to partner health systems, IRB fast-tracks, and surgical testbeds.
              </p>
            </div>
          )}
          {recommendedResources.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[var(--nxt-mint-deep)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended for You ({recommendedResources.length})
              </h4>
              <div className="space-y-3">
                {recommendedResources.map(renderResourceCard)}
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider">
                Common Resources ({resources.length})
              </h4>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTypeFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTypeFilter === 'all'
                      ? 'bg-[var(--nxt-ink-fixed)] text-white'
                      : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-line)]'
                  }`}
                >
                  All
                </button>
                {hospitalConnections.length > 0 && (
                  <button
                    onClick={() => setActiveTypeFilter('hospital')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                      activeTypeFilter === 'hospital'
                        ? 'bg-[var(--nxt-lavender-strong)] text-white'
                        : 'bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)] hover:bg-[var(--nxt-lavender)]/70'
                    }`}
                  >
                    <Hospital className="w-3 h-3" />
                    <span>Hospitals ({hospitalConnections.length})</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTypeFilter('session')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTypeFilter === 'session'
                      ? 'bg-[var(--nxt-sky-deep)] text-white'
                      : 'bg-[var(--nxt-sky)] text-[var(--nxt-sky-deep)] hover:bg-[var(--nxt-sky)]/70'
                  }`}
                >
                  Sessions
                </button>
                <button
                  onClick={() => setActiveTypeFilter('webinar_seminar')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    activeTypeFilter === 'webinar_seminar'
                      ? 'bg-[var(--nxt-peach-deep)] text-white'
                      : 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] hover:bg-[var(--nxt-peach)]/70'
                  }`}
                >
                  Webinars
                </button>
              </div>
            </div>
            {filteredResources.length === 0 ? (
              <div className="p-8 text-center bg-[var(--nxt-bg-soft)] rounded-2xl border border-dashed border-[var(--nxt-line)]">
                <p className="text-xs font-semibold text-[var(--nxt-ink-soft)]">No resources assigned to this filter yet.</p>
                <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-0.5">Admin can add expert sessions, seminars, or hospital connections in the Admin Panel.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResources.map(renderResourceCard)}
              </div>
            )}
          </div>
          {problemId && category && (
            <div>
              <h4 className="text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                Submit Evidence for Review
              </h4>
              <p className="text-xs text-[var(--nxt-ink-soft)] mb-3">
                Attach documents or photos proving this milestone (e.g. IRB approval, prototype photos) and send them for admin review.
                Submitting doesn't block your progress — mark the step complete and keep working while it's reviewed.
              </p>
              {submissions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {submissions.map(sub => (
                    <div key={sub.id} className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-[var(--nxt-ink)]">
                          {sub.submitted_by_name} <span className="text-[var(--nxt-ink-soft)] font-normal">· {new Date(sub.submitted_at).toLocaleDateString('en-US')}</span>
                        </p>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'Approved' ? 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]' :
                          sub.status === 'Changes Requested' ? 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]' :
                          'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]'
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
                              className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-lg text-[10px] font-semibold text-[var(--nxt-ink)] hover:border-[var(--nxt-mint-strong)]/40 transition-colors"
                            >
                              <Download className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[120px]">{f.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      {sub.admin_feedback && sub.status !== 'Submitted' && (
                        <p className={`text-[11px] rounded-lg px-2 py-1 mt-1 ${
                          sub.status === 'Approved' ? 'bg-[var(--nxt-mint)]/40 text-[var(--nxt-mint-deep)]' : 'bg-[var(--nxt-peach)]/50 text-[var(--nxt-peach-deep)]'
                        }`}>
                          "{sub.admin_feedback}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-xl p-3 space-y-2.5">
                <textarea
                  rows={2}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="Describe what you're submitting as evidence for this milestone..."
                  className="w-full text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-lg p-2.5 focus:ring-1 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden"
                />
                {pendingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pendingFiles.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1 bg-[var(--nxt-mint)]/40 text-[var(--nxt-mint-deep)] rounded-lg text-[10px] font-semibold">
                        {f.name}
                        <button onClick={() => handleRemovePendingFile(i)} className="hover:text-[var(--nxt-peach-deep)]">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {fileError && (
                  <p className="text-[11px] text-[var(--nxt-peach-deep)] font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {fileError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 border border-[var(--nxt-line)] hover:bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isReadingFiles ? 'Reading...' : 'Attach Files'}</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFilesSelected(e.target.files)}
                    />
                  </label>
                  <button
                    id="btn-submit-step-evidence"
                    onClick={handleSubmitEvidence}
                    className="px-3.5 py-1.5 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Submit for Review</span>
                  </button>
                  {justSubmitted && (
                    <span className="text-[11px] text-[var(--nxt-mint-strong)] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Submitted!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-[var(--nxt-line)] shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--nxt-ink-soft)]">Milestone Status:</span>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--nxt-mint-strong)] bg-[var(--nxt-mint)] px-2 py-0.5 rounded-full border border-[var(--nxt-mint-strong)]/20">
                <Check className="w-3 h-3 text-[var(--nxt-mint-strong)]" /> Completed
              </span>
            ) : (
              <span className="text-xs font-semibold text-[var(--nxt-peach-deep)] bg-[var(--nxt-peach)] px-2 py-0.5 rounded-full border border-[var(--nxt-peach-deep)]/20">
                In Progress
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-modal-toggle-complete"
              onClick={onToggleComplete}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                isCompleted
                  ? 'bg-[var(--nxt-line)] text-[var(--nxt-ink)] hover:bg-[var(--nxt-line)]/70'
                  : 'bg-[var(--nxt-mint-strong)] text-white hover:bg-[var(--nxt-mint-deep)]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isCompleted ? 'Mark as Incomplete' : 'Mark Step Complete'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] rounded-full text-xs font-medium hover:bg-[var(--nxt-bg-soft)] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};