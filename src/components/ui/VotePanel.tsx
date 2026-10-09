import React from 'react';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ProblemVote } from '../../types';
import { store } from '../../services/store';

interface Props {
  problemId: string;
  signedIn: boolean;
  onOpenLogin: () => void;
  /** Narrow side column: the two choices stack and there is no bottom margin. */
  stacked?: boolean;
}

/** "Do you agree this is a real problem?" with live results. One vote each; pressing the same button again takes it back. */
export const VotePanel: React.FC<Props> = ({ problemId, signedIn, onOpenLogin, stacked }) => {
  const tally = store.getVotes(problemId);
  const mine = store.getMyVote(problemId);
  const total = tally.agree + tally.disagree;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const [message, setMessage] = React.useState('');

  const vote = (choice: ProblemVote) => {
    if (!signedIn) { onOpenLogin(); return; }
    if (!store.isEmailVerified()) { setMessage('Please verify your email address to vote.'); return; }
    setMessage('');
    void store.voteOnProblem(problemId, choice);
  };

  const options: { choice: ProblemVote; label: string; icon: React.ElementType; count: number }[] = [
    { choice: 'agree', label: 'I agree', icon: ThumbsUp, count: tally.agree },
    { choice: 'disagree', label: "I don't agree", icon: ThumbsDown, count: tally.disagree },
  ];

  return (
    <section className={`rounded-2xl border border-[var(--nxt-line)] p-5 ${stacked ? '' : 'mb-6'}`} aria-label="Vote on this problem">
      <h2 className="font-display text-base font-bold text-[var(--nxt-ink)]">Do you agree this is a problem worth solving?</h2>
      <div className={`mt-4 grid gap-3 ${stacked ? '' : 'sm:grid-cols-2'}`}>
        {options.map(({ choice, label, icon: Icon, count }) => {
          const active = mine === choice;
          return (
            <button
              key={choice}
              id={`btn-vote-${choice}`}
              onClick={() => vote(choice)}
              aria-pressed={active}
              className={`relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-colors ${active ? 'border-[var(--nxt-ink)]' : 'border-[var(--nxt-line)] hover:border-[var(--nxt-ink-soft)]'}`}
            >
              <span className="absolute inset-y-0 left-0 bg-[var(--nxt-bg-soft)]" style={{ width: `${pct(count)}%` }} aria-hidden="true" />
              <span className="relative flex items-center justify-between gap-3">
                <span className={`flex items-center gap-2 text-sm ${active ? 'font-bold' : 'font-semibold'} text-[var(--nxt-ink)]`}>
                  <Icon className={`w-4 h-4 ${active ? 'fill-current' : ''}`} /> {label}
                </span>
                <span className="text-sm text-[var(--nxt-ink-soft)] tabular-nums">{pct(count)}% · {count}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-[var(--nxt-ink-soft)]" role="status">
        {message || (total === 0 ? 'No votes yet — be the first.' : `${total} vote${total === 1 ? '' : 's'}.`)}
        {!signedIn && ' Sign in to vote.'}
      </p>
    </section>
  );
};
