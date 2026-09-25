import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, AlertCircle, MapPin, CheckCircle2 } from 'lucide-react';
import { SpotIllustration } from './ui/Illustrations';
import { BACKGROUND_OPTIONS, SOURCE_OPTIONS } from '../data/profileOptions';
import { store, PLATFORM_NAME } from '../services/store';
import { Gender, AcquisitionSource, FounderBackground } from '../types';
import { ThemeToggle } from './ThemeToggle';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

type Mode = 'login' | 'signup' | 'reset';

interface LoginPageProps {
  onBack?: () => void;
  initialMode?: Mode;
  onModeChange?: (mode: Mode) => void;
}

function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code || '';
  if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')) return 'Incorrect email or password.';
  if (code.includes('email-already-in-use')) return 'An account with that email already exists — try logging in instead.';
  if (code.includes('weak-password')) return 'Choose a password with at least 8 characters.';
  if (code.includes('invalid-email')) return "That email address doesn't look right.";
  if (code.includes('too-many-requests')) return 'Too many attempts. Wait a few minutes and try again.';
  if (code.includes('network-request-failed')) return "Can't reach the sign-in service. Check your connection.";
  return e instanceof Error ? e.message : 'Something went wrong. Please try again.';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, initialMode = 'login', onModeChange }) => {
  const [mode, setModeState] = useState<Mode>(initialMode);
  const setMode = (next: Mode) => { setModeState(next); onModeChange?.(next); };
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [source, setSource] = useState<AcquisitionSource | ''>('');
  const [background, setBackground] = useState<FounderBackground | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    if (mode === 'signup' && password.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'reset') {
        await store.sendPasswordReset(email);
        setNotice('If an account exists for that email, a password reset link is on its way. Check your inbox and spam folder.');
      } else if (mode === 'login') {
        await store.login(email, password);
      } else {
        await store.signup(name, email, password, {
          location,
          ...(gender ? { gender } : {}),
          ...(source ? { acquisition_source: source } : {}),
          ...(background ? { background } : {}),
        });
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--nxt-bg)] lg:grid lg:grid-cols-2">
      <aside className="hidden lg:flex nxt-hero-glow border-r border-[var(--nxt-line)] flex-col justify-center px-14 xl:px-20">
        <SpotIllustration kind="login" className="w-64 mb-8" />
        <h2 className="font-display text-3xl font-extrabold text-[var(--nxt-ink)] leading-tight">
          Build the solutions doctors are asking for.
        </h2>
        <ul className="mt-8 space-y-4 text-base text-[var(--nxt-ink-soft)]">
          {['Verified clinical problems from doctors', 'Non-dilutive grants tied to each problem', 'Mentors and a roadmap to a hospital pilot'].map(item => (
            <li key={item} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[var(--nxt-mint-strong)] mt-0.5 shrink-0" /> {item}
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button
              id="btn-back-to-home"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
          ) : <span />}
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center">
            <Stethoscope className="w-5.5 h-5.5" />
          </div>
          <span className="font-display font-black text-xl text-[var(--nxt-ink)] tracking-tighter">{PLATFORM_NAME}</span>
        </div>

        <div className="bg-[var(--nxt-surface)] rounded-3xl border border-[var(--nxt-line)] shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-1 bg-[var(--nxt-bg-soft)] rounded-full p-1 mb-6">
            <button
              id="btn-login-tab"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-colors ${
                mode === 'login' ? 'bg-[var(--nxt-ink-fixed)] text-white' : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'
              }`}
            >
              Log In
            </button>
            <button
              id="btn-signup-tab"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-colors ${
                mode === 'signup' ? 'bg-[var(--nxt-ink-fixed)] text-white' : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="font-display text-lg font-bold text-[var(--nxt-ink)] mb-1">
            {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
          </h1>
          <p className="text-xs text-[var(--nxt-ink-soft)] mb-5">
            {mode === 'login'
              ? 'Log in to continue working on your problem statements and roadmaps.'
              : mode === 'signup'
              ? "We'll email you a link to verify your address. Membership is requested separately after you sign up."
              : "Enter your account email and we'll send you a link to choose a new password."}
          </p>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleSubmit}
              className="space-y-3.5"
            >
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Dr. Alex Mercer"
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                    />
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <>
                <p className="text-xs text-[var(--nxt-ink-soft)] pt-1">Optional — helps us match you with the right problems and mentors.</p>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1 truncate">Background</label>
                    <select
                      id="input-signup-background"
                      value={background}
                      onChange={(e) => setBackground(e.target.value as FounderBackground)}
                      className="h-11 w-full px-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden"
                    >
                      <option value="">Select…</option>
                      {BACKGROUND_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1 truncate">How you found us</label>
                    <select
                      id="input-signup-source"
                      value={source}
                      onChange={(e) => setSource(e.target.value as AcquisitionSource)}
                      className="h-11 w-full px-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden"
                    >
                      <option value="">Select…</option>
                      {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                </>
              )}

              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1 truncate">Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-signup-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State"
                        className="h-11 w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1 truncate">Gender</label>
                    <select
                      id="input-signup-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="h-11 w-full px-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                    >
                      <option value="">Prefer not to say</option>
                      {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-auth-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@startup.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)]">Password</label>
                  {mode === 'login' && (
                    <button type="button" id="btn-forgot-password" onClick={() => { setMode('reset'); setError(''); }} className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-auth-password"
                    type="password"
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>
              </div>
              )}

              {notice && (
                <div className="p-2.5 rounded-xl bg-[var(--nxt-mint)] border border-[var(--nxt-mint-strong)]/30 text-[var(--nxt-mint-deep)] text-xs font-semibold flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{notice}</span>
                </div>
              )}

              {error && (
                <div className="p-2.5 rounded-xl bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/30 text-[var(--nxt-peach-deep)] text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                id="btn-auth-submit"
                disabled={busy}
                className="w-full disabled:opacity-60 py-3 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white font-bold rounded-full text-sm shadow-md shadow-[var(--nxt-mint-strong)]/20 transition-colors flex items-center justify-center gap-2"
              >
                <span>{busy ? 'Please wait…' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send reset link'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              {mode === 'reset' && (
                <button type="button" onClick={() => { setMode('login'); setNotice(''); setError(''); }} className="w-full text-xs font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]">
                  Back to log in
                </button>
              )}
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
      </div>
    </div>
  );
};
