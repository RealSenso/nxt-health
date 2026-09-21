import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, AlertCircle, MapPin } from 'lucide-react';
import { store, PLATFORM_NAME } from '../services/store';
import { Gender } from '../types';
import { ThemeToggle } from './ThemeToggle';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

interface LoginPageProps {
  onBack?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = mode === 'login'
      ? store.login(email, password)
      : store.signup(name, email, password, { location, ...(gender ? { gender } : {}) });
    if (result.error) setError(result.error);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--nxt-bg)] flex items-center justify-center p-4 py-10">
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
          <div className="w-11 h-11 rounded-2xl bg-[var(--nxt-ink-fixed)] text-[var(--nxt-mint)] flex items-center justify-center">
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
            {mode === 'login' ? 'Welcome back' : 'Join as a founder'}
          </h1>
          <p className="text-xs text-[var(--nxt-ink-soft)] mb-5">
            {mode === 'login'
              ? 'Log in to continue working on your problem statements and roadmaps.'
              : 'New accounts start as members — admin access is granted separately.'}
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Location <span className="font-normal text-[var(--nxt-ink-soft)]">(optional)</span></label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-signup-location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State"
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Gender <span className="font-normal text-[var(--nxt-ink-soft)]">(optional)</span></label>
                    <select
                      id="input-signup-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value as Gender)}
                      className="w-full px-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@healthtech.io"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-auth-password"
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>
              </div>

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
                className="w-full py-3 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white font-bold rounded-full text-sm shadow-md shadow-[var(--nxt-mint-strong)]/20 transition-colors flex items-center justify-center gap-2"
              >
                <span>{mode === 'login' ? 'Log In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
