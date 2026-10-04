import React, { useState } from 'react';
import { AlertCircle, CreditCard, X } from 'lucide-react';
import type { Consultation } from '../../types';
import { store } from '../../services/store';
import { bookingMinutes, formatRate, istDayLabel, istTime } from '../../data/experts';
import { Btn } from './ui';

interface Props {
  booking: Consultation;
  onClose: () => void;
  /** Called with the new chat's id once payment goes through. */
  onPaid: (threadId: string | undefined) => void;
}

/** The pay step for a booked session. Payment is a demo: nothing is charged. */
export const PayConsultationDialog: React.FC<Props> = ({ booking, onClose, onPaid }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      const paid = await store.payConsultation(booking.id);
      onPaid(paid.thread_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-[var(--nxt-surface)] text-[var(--nxt-ink)] rounded-[22px] max-w-md w-full p-7 border border-[var(--nxt-line)] shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display font-bold text-2xl tracking-[-0.02em]">Pay to confirm your session</h3>
          <button onClick={onClose} className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <dl className="mt-6 rounded-2xl bg-[var(--nxt-bg-soft)] p-5 text-[15px] space-y-2.5">
          <div className="flex justify-between gap-4"><dt className="text-[var(--nxt-ink-soft)]">Expert</dt><dd className="font-semibold text-right">{booking.mentor_name}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-[var(--nxt-ink-soft)]">Session</dt><dd className="text-right">{bookingMinutes(booking)} minutes at {formatRate(booking.rate_usd)}/hr</dd></div>
          {booking.slot && (
            <div className="flex justify-between gap-4"><dt className="text-[var(--nxt-ink-soft)]">When</dt><dd className="text-right">{istDayLabel(booking.slot)} · {istTime(booking.slot)} IST</dd></div>
          )}
          <div className="flex justify-between gap-4 pt-3 border-t border-[var(--nxt-line)]"><dt className="font-bold">Total</dt><dd className="font-display font-bold text-xl">${booking.amount_usd}</dd></div>
        </dl>
        {error && <p className="mt-4 text-sm font-semibold text-[var(--nxt-peach-deep)] flex items-center gap-1.5"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</p>}
        <Btn id="btn-pay-consultation" full onClick={pay} disabled={busy} className="mt-6">
          <CreditCard className="w-4 h-4" /> {busy ? 'Processing…' : `Pay $${booking.amount_usd}`}
        </Btn>
        <p className="mt-3 text-center text-sm text-[var(--nxt-ink-soft)]">Demo payment — no card is charged. Your private chat opens as soon as you pay.</p>
        <button onClick={onClose} className="mt-2 w-full py-2 text-sm font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]">Pay later</button>
      </div>
    </div>
  );
};
