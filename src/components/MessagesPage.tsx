import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send, ShieldCheck, FileCheck, DollarSign, GraduationCap } from 'lucide-react';
import { Message, Thread, User } from '../types';
import { store } from '../services/store';
import { PageHeader } from './ui/PageHeader';

const CONTEXT_ICON: Record<Thread['context']['type'], React.ElementType> = {
  application: DollarSign,
  submission: FileCheck,
  mentorship: GraduationCap,
  consultation: GraduationCap,
};

const timeLabel = (iso: string) => {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay ? d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const MessagesPage: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const { threadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const threads = store.getThreads();

  return (
    <div className="space-y-8 lg:space-y-10">
      <PageHeader
        icon={MessageSquare}
        eyebrow="Messages"
        title="Conversations"
        subtitle="Discussions about your funding applications and evidence, and chats with your mentors."
      />
      <div className="grid lg:grid-cols-[340px_1fr] gap-6 lg:gap-8 items-start">
        <aside className={`${threadId ? 'hidden lg:block' : ''} rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] overflow-hidden`}>
          {threads.length === 0 ? (
            <p className="p-6 text-sm text-[var(--nxt-ink-soft)]">
              No conversations yet. Use "Discuss" on an application or evidence submission, or request a mentor, to start one.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--nxt-line)]">
              {threads.map(t => {
                const Icon = CONTEXT_ICON[t.context.type];
                const active = t.id === threadId;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => navigate(`/messages/${t.id}`)}
                      className={`w-full text-left px-4 py-3.5 flex gap-3 transition-colors ${active ? 'bg-[var(--nxt-mint)]/40' : 'hover:bg-[var(--nxt-bg-soft)]'}`}
                    >
                      <span className="w-9 h-9 rounded-xl bg-[var(--nxt-bg-soft)] text-[var(--nxt-mint-strong)] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center justify-between gap-2">
                          <span className={`text-sm truncate ${t.unread ? 'font-bold text-[var(--nxt-ink)]' : 'font-semibold text-[var(--nxt-ink)]'}`}>{t.subject}</span>
                          <span className="text-xs text-[var(--nxt-ink-soft)] shrink-0">{timeLabel(t.last_message_at)}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-[var(--nxt-ink-soft)] truncate flex-1">{t.last_message_preview || 'No messages yet'}</span>
                          {t.unread && <span className="w-2 h-2 rounded-full bg-[var(--nxt-mint-strong)] shrink-0" />}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {threadId ? (
          <ThreadView key={threadId} threadId={threadId} currentUser={currentUser} onBack={() => navigate('/messages')} />
        ) : (
          <div className="hidden lg:flex rounded-3xl border border-dashed border-[var(--nxt-line)] p-10 items-center justify-center text-sm text-[var(--nxt-ink-soft)]">
            Pick a conversation to read it.
          </div>
        )}
      </div>
    </div>
  );
};

const ThreadView: React.FC<{ threadId: string; currentUser: User; onBack: () => void }> = ({ threadId, currentUser, onBack }) => {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => store.fetchThread(threadId)
      .then(res => { if (!cancelled) { setThread(res.thread); setMessages(res.messages); setError(''); } })
      .catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load this conversation.'); });
    void load();
    const timer = setInterval(() => { if (document.visibilityState === 'visible') void load(); }, 5000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const message = await store.sendMessage(threadId, body);
      setMessages(prev => [...prev, message]);
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message not sent.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] flex flex-col h-[70vh] min-h-[420px]">
      <header className="px-5 py-4 border-b border-[var(--nxt-line)] flex items-center gap-3">
        <button onClick={onBack} className="lg:hidden p-1 -ml-1 text-[var(--nxt-ink-soft)]" aria-label="Back to conversations">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-[var(--nxt-ink)] truncate">{thread?.subject || 'Conversation'}</h2>
          {thread?.admin_visible && <p className="text-xs text-[var(--nxt-ink-soft)]">Visible to your team and the NxT Health review team</p>}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && !error && <p className="text-sm text-[var(--nxt-ink-soft)] text-center py-8">No messages yet — say hello.</p>}
        {messages.map(m => {
          const mine = m.author_uid === currentUser.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-[var(--nxt-mint-strong)] text-white' : 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink)]'}`}>
                {!mine && (
                  <p className="text-xs font-bold mb-0.5 flex items-center gap-1">
                    {m.author_name}
                    {m.author_is_admin && <ShieldCheck className="w-3 h-3 text-[var(--nxt-mint-strong)]" aria-label="NxT Health team" />}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`text-[11px] mt-1 ${mine ? 'text-white/70' : 'text-[var(--nxt-ink-soft)]'}`}>{timeLabel(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-5 text-sm text-[var(--nxt-peach-deep)] font-semibold">{error}</p>}
      <form onSubmit={handleSend} className="p-4 border-t border-[var(--nxt-line)] flex gap-2">
        <textarea
          id="input-message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(e); } }}
          rows={1}
          maxLength={5000}
          placeholder="Write a message… (Enter to send, Shift+Enter for a new line)"
          className="flex-1 resize-none text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl px-4 py-2.5 text-[var(--nxt-ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)]"
        />
        <button id="btn-send-message" disabled={sending || !draft.trim()} className="px-4 rounded-2xl bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] disabled:opacity-50 text-white" aria-label="Send">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};
