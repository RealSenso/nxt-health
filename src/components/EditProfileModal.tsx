import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserRound, Mail, Lock, AlertCircle, Check, MapPin } from 'lucide-react';
import { User, Gender } from '../types';
import { store } from '../services/store';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [location, setLocation] = useState(currentUser.location || '');
  const [gender, setGender] = useState<Gender | ''>(currentUser.gender || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

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
        className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 py-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[var(--nxt-line)]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]">
              <UserRound className="w-4 h-4" />
            </span>
            <h3 className="font-display text-lg font-bold text-[var(--nxt-ink)]">Edit Profile</h3>
          </div>
          <p className="text-xs text-[var(--nxt-ink-soft)] mb-5">
            Update your name, email, or password. Leave the password blank to keep your current one.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Full Name</label>
              <div className="relative">
                <UserRound className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-profile-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-profile-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-profile-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">Gender</label>
                <select
                  id="input-profile-gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full px-3 py-2.5 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                >
                  <option value="">Prefer not to say</option>
                  {GENDER_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--nxt-ink-soft)] mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-profile-password"
                  type="password"
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
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
            {success && (
              <div className="p-2.5 rounded-xl bg-[var(--nxt-mint)]/50 border border-[var(--nxt-mint-strong)]/30 text-[var(--nxt-mint-deep)] text-xs font-semibold flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              id="btn-save-profile"
              type="submit"
              className="w-full py-3 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white font-bold rounded-full text-sm shadow-md shadow-[var(--nxt-mint-strong)]/20 transition-colors"
            >
              Save Changes
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
