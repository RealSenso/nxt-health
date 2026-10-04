import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { api } from '../../services/api';
import { EXPERT_AREAS } from '../../data/experts';
import { Btn, Field, fieldClass, fieldClassDark } from './ui';

export const LEAD_ROLES = {
  pharma: 'Pharma company with a problem to fund',
  hospital: 'Hospital with a problem to list',
  founder: 'Physician-founder or startup',
  incubator: 'Incubator or accelerator',
  us: 'Founder planning US entry',
} as const;
export type LeadRole = keyof typeof LEAD_ROLES;

interface Props {
  kind: 'lead' | 'expert';
  /** Which "I am a" option starts selected (leads only). */
  initialRole?: LeadRole;
  /** Style for a white card on a dark section (default) or a plain light form. */
  tone?: 'card' | 'dark';
}

const sentThanks = {
  lead: "Thank you — we've got it. Someone from NXT Health will be in touch by email.",
  expert: "Thank you — we've got your introduction. We'll be in touch by email to talk it through.",
};

/** The public "get in touch" forms. Both post to /api/public/inquiries. */
export const InquiryForm: React.FC<Props> = ({ kind, initialRole = 'pharma', tone = 'card' }) => {
  const dark = tone === 'dark';
  const input = dark ? fieldClassDark : fieldClass;
  const [role, setRole] = useState<LeadRole>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [focus, setFocus] = useState<string>(EXPERT_AREAS[0]);
  const [message, setMessage] = useState('');
  const [trap, setTrap] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  // Follow the button the visitor came from (e.g. "List a problem" preselects Hospital).
  React.useEffect(() => setRole(initialRole), [initialRole]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/public/inquiries', kind === 'lead'
        ? { kind, role: LEAD_ROLES[role], email, message, website: trap }
        : { kind, name, email, linkedin: linkedin || undefined, focus, message, website: trap });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className={`${dark ? 'text-white' : 'text-[#111]'} flex items-start gap-3 py-2`} role="status">
        <Check className="w-6 h-6 mt-0.5 shrink-0" />
        <p className="text-lg leading-snug">{sentThanks[kind]}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`space-y-5 ${dark ? 'text-white' : 'text-[#111]'}`}>
      {/* Honeypot: hidden from people, tempting to bots. */}
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website" />
      {kind === 'lead' ? (
        <>
          <Field label="I am a">
            <select value={role} onChange={(e) => setRole(e.target.value as LeadRole)} className={input} id="input-inquiry-role">
              {Object.entries(LEAD_ROLES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Field>
          <Field label="Work email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={input} id="input-inquiry-email" />
          </Field>
          <Field label="The problem, in a line or two">
            <textarea required rows={4} maxLength={3000} value={message} onChange={(e) => setMessage(e.target.value)} className={input} id="input-inquiry-message" />
          </Field>
        </>
      ) : (
        <>
          <Field label="Full name"><input required value={name} onChange={(e) => setName(e.target.value)} className={input} id="input-expert-name" /></Field>
          <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} id="input-expert-email" /></Field>
          <Field label="LinkedIn profile"><input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={input} id="input-expert-linkedin" /></Field>
          <Field label="Where you help most">
            <select value={focus} onChange={(e) => setFocus(e.target.value)} className={input} id="input-expert-focus">
              {EXPERT_AREAS.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
          </Field>
          <Field label="What have you taken to market or to patients?">
            <textarea required rows={5} maxLength={3000} value={message} onChange={(e) => setMessage(e.target.value)} className={input} id="input-expert-message" />
          </Field>
        </>
      )}
      {error && <p className={`text-sm ${dark ? 'text-[#ffb59c]' : 'text-[#a04a2a]'}`} role="alert">{error}</p>}
      <Btn type="submit" variant={dark ? 'light' : 'solid'} disabled={busy} full={kind === 'lead'} id="btn-inquiry-submit">
        {busy ? 'Sending…' : kind === 'lead' ? 'Get started' : 'Introduce yourself'}
      </Btn>
    </form>
  );
};
