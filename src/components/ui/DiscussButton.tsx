import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { store } from '../../services/store';

export const DiscussButton: React.FC<{ type: 'application' | 'submission'; id: string; label?: string }> = ({ type, id, label = 'Discuss' }) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const thread = store.getThreads().find(t => t.context.type === type && t.context.id === id);

  const open = async () => {
    setBusy(true);
    setError('');
    try {
      navigate(`/messages/${thread?.id || (await store.openContextThread(type, id))}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the conversation.');
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={open}
        disabled={busy}
        className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:text-[var(--nxt-mint-deep)] inline-flex items-center gap-1 disabled:opacity-60"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {label}
        {thread?.unread && <span className="w-2 h-2 rounded-full bg-[var(--nxt-mint-strong)]" aria-label="unread" />}
      </button>
      {error && <span className="text-xs text-[var(--nxt-peach-deep)]">{error}</span>}
    </span>
  );
};
