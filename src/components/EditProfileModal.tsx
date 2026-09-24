import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserRound, Mail, Lock, AlertCircle, Check, MapPin, Briefcase, Trophy } from 'lucide-react';
import { User, Gender, FounderBackground, Commitment, StartupStage, AcquisitionSource } from '../types';
import { store } from '../services/store';
import { BACKGROUND_OPTIONS, COMMITMENT_OPTIONS, SOURCE_OPTIONS, STAGE_OPTIONS } from '../data/profileOptions';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">
      {label} {hint && <span className="font-normal">{hint}</span>}
    </label>
    {children}
  </div>
);

const SectionTitle: React.FC<{ icon: React.ElementType; title: string; text: string }> = ({ icon: Icon, title, text }) => (
  <div className="pt-5 border-t border-[var(--nxt-line)]">
    <h4 className="text-sm font-bold text-[var(--nxt-ink)] flex items-center gap-2">
      <Icon className="w-4 h-4 text-[var(--nxt-mint-strong)]" /> {title}
    </h4>
    <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">{text}</p>
  </div>
);

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [location, setLocation] = useState(currentUser.location || '');
  const [gender, setGender] = useState<Gender | ''>(currentUser.gender || '');
  const [password, setPassword] = useState('');
  const [background, setBackground] = useState<FounderBackground | ''>(currentUser.background || '');
  const [firstTime, setFirstTime] = useState<'' | 'yes' | 'no'>(
    currentUser.first_time_founder === undefined ? '' : currentUser.first_time_founder ? 'yes' : 'no'
  );
  const [commitment, setCommitment] = useState<Commitment | ''>(currentUser.commitment || '');
  const [stage, setStage] = useState<StartupStage | ''>(currentUser.startup_stage || '');
  const [fundingTotal, setFundingTotal] = useState(currentUser.funding_raised_total?.toString() || '');
  const [hasRevenue, setHasRevenue] = useState<'' | 'yes' | 'no'>(
    currentUser.has_revenue === undefined ? '' : currentUser.has_revenue ? 'yes' : 'no'
  );
  const [source, setSource] = useState<AcquisitionSource | ''>(currentUser.acquisition_source || '');
  const [pilots, setPilots] = useState(currentUser.outcomes?.pilots_signed.toString() || '');
  const [filings, setFilings] = useState(currentUser.outcomes?.regulatory_filings.toString() || '');
  const [fundingSinceJoining, setFundingSinceJoining] = useState(currentUser.outcomes?.funding_raised_since_joining.toString() || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const toNumber = (v: string) => Math.max(0, Number(v.replace(/[^0-9]/g, '')) || 0);
  const hasOutcomes = pilots !== '' || filings !== '' || fundingSinceJoining !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = store.updateProfile(currentUser.id, {
      name,
      email,
      location,
      ...(gender ? { gender } : {}),
      ...(password ? { password } : {}),
      ...(background ? { background } : {}),
      ...(firstTime ? { first_time_founder: firstTime === 'yes' } : {}),
      ...(commitment ? { commitment } : {}),
      ...(stage ? { startup_stage: stage } : {}),
      ...(fundingTotal !== '' ? { funding_raised_total: toNumber(fundingTotal) } : {}),
      ...(hasRevenue ? { has_revenue: hasRevenue === 'yes' } : {}),
      ...(source ? { acquisition_source: source } : {}),
      ...(hasOutcomes ? {
        outcomes: {
          pilots_signed: toNumber(pilots),
          regulatory_filings: toNumber(filings),
          funding_raised_since_joining: toNumber(fundingSinceJoining),
        },
      } : {}),
    });
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Profile updated.');
      setPassword('');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 py-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[var(--nxt-line)]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-10 h-10 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center">
              <UserRound className="w-5 h-5" />
            </span>
            <h3 className="font-display text-xl font-bold text-[var(--nxt-ink)]">Edit profile</h3>
          </div>
          <p className="text-sm text-[var(--nxt-ink-soft)] mb-5">
            Everything below your email is optional. It helps us match you with the right problems, mentors and partners.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full name">
              <div className="relative">
                <UserRound className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="input-profile-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </Field>

            <Field label="Email">
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input id="input-profile-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} pl-9`} />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Location">
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input id="input-profile-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className={`${inputClass} pl-9`} />
                </div>
              </Field>
              <Field label="Gender">
                <select id="input-profile-gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={inputClass}>
                  <option value="">Prefer not to say</option>
                  {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </Field>
            </div>

            <SectionTitle icon={Briefcase} title="Founder profile" text="Your background and where your startup is today." />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Background">
                <select id="input-profile-background" value={background} onChange={(e) => setBackground(e.target.value as FounderBackground)} className={inputClass}>
                  <option value="">Select…</option>
                  {BACKGROUND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="First-time founder?">
                <select value={firstTime} onChange={(e) => setFirstTime(e.target.value as '' | 'yes' | 'no')} className={inputClass}>
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">No, I've founded before</option>
                </select>
              </Field>
              <Field label="Commitment">
                <select value={commitment} onChange={(e) => setCommitment(e.target.value as Commitment)} className={inputClass}>
                  <option value="">Select…</option>
                  {COMMITMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Startup stage">
                <select id="input-profile-stage" value={stage} onChange={(e) => setStage(e.target.value as StartupStage)} className={inputClass}>
                  <option value="">Select…</option>
                  {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Total funding raised" hint="(USD)">
                <input inputMode="numeric" value={fundingTotal} onChange={(e) => setFundingTotal(e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Generating revenue?">
                <select value={hasRevenue} onChange={(e) => setHasRevenue(e.target.value as '' | 'yes' | 'no')} className={inputClass}>
                  <option value="">Select…</option>
                  <option value="yes">Yes</option>
                  <option value="no">Not yet</option>
                </select>
              </Field>
            </div>
            <Field label="How did you hear about us?">
              <select value={source} onChange={(e) => setSource(e.target.value as AcquisitionSource)} className={inputClass}>
                <option value="">Select…</option>
                {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>

            <SectionTitle
              icon={Trophy}
              title="Outcomes since joining"
              text={currentUser.outcomes
                ? `Last updated ${new Date(currentUser.outcomes.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. We ask every few months — it shows what's working.`
                : "We ask every few months — it shows what's working."}
            />
            <div className="grid grid-cols-3 gap-3">
              <Field label="Hospital pilots signed">
                <input id="input-outcome-pilots" inputMode="numeric" value={pilots} onChange={(e) => setPilots(e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Regulatory filings">
                <input inputMode="numeric" value={filings} onChange={(e) => setFilings(e.target.value)} placeholder="0" className={inputClass} />
              </Field>
              <Field label="Funding raised" hint="(USD)">
                <input inputMode="numeric" value={fundingSinceJoining} onChange={(e) => setFundingSinceJoining(e.target.value)} placeholder="0" className={inputClass} />
              </Field>
            </div>

            <div className="pt-5 border-t border-[var(--nxt-line)]">
              <Field label="New password">
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-profile-password"
                    type="password"
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </Field>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/30 text-[var(--nxt-peach-deep)] text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-[var(--nxt-mint)]/50 border border-[var(--nxt-mint-strong)]/30 text-[var(--nxt-mint-deep)] text-sm font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" /> {success}
              </div>
            )}

            <button
              id="btn-save-profile"
              type="submit"
              className="w-full py-3 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white font-bold rounded-full text-sm shadow-md shadow-[var(--nxt-mint-strong)]/20 transition-colors"
            >
              Save changes
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
