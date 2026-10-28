import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Clock } from 'lucide-react';
import type { BlogPost } from '../../types';
import { api, ApiError } from '../../services/api';
import { store } from '../../services/store';
import { PublicLayout } from './PublicLayout';
import { RichText } from '../ui/RichText';
import { Btn, Eyebrow, H1 } from './ui';

const dateLabel = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

/** A cover image, or a plain tile with the domain when the post has none. */
export const BlogCover: React.FC<{ post: Pick<BlogPost, 'cover_url' | 'domain' | 'title'>; className?: string }> = ({ post, className = '' }) => (
  post.cover_url
    ? <img src={post.cover_url} alt="" className={`object-cover ${className}`} loading="lazy" />
    : (
      <div className={`flex items-end bg-[#111] text-white p-5 ${className}`} aria-hidden="true">
        <span className="text-[12px] uppercase tracking-[0.14em] text-white/70">{post.domain || 'SirOsler'}</span>
      </div>
    )
);

/** A card for one post, used on the home page and the blog index. */
export const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <Link to={`/blog/${post.id}`} className="group flex flex-col rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)] overflow-hidden hover:border-[var(--nxt-ink)] transition-colors">
    <BlogCover post={post} className="h-40 w-full" />
    <div className="p-6 flex flex-col flex-1">
      <p className="text-[13px] text-[var(--nxt-ink-soft)] flex flex-wrap gap-x-3">
        {post.content_type && <span className="font-semibold text-[var(--nxt-ink)]">{post.content_type}</span>}
        {post.domain && <span>{post.domain}</span>}
      </p>
      <h3 className="mt-3 font-display font-bold text-[1.25rem] leading-snug tracking-[-0.02em]">{post.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)] line-clamp-3">{post.excerpt}</p>
      <p className="mt-auto pt-5 text-[13px] text-[var(--nxt-ink-soft)] flex items-center gap-3">
        <span>NXT</span>
        {post.read_minutes > 0 && <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.read_minutes} min read</span>}
        <ArrowRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-0.5" />
      </p>
    </div>
  </Link>
);

export const BlogListPage: React.FC = () => {
  const posts = store.getBlogs().filter(p => p.status === 'published');
  const [domain, setDomain] = useState('All');
  const domains = useMemo(() => ['All', ...Array.from(new Set(posts.map(p => p.domain).filter(Boolean)))], [posts]);
  const shown = posts.filter(p => domain === 'All' || p.domain === domain);

  return (
    <PublicLayout variant="home">
      <section className="nxt-container pt-14 sm:pt-20 pb-20">
        <Eyebrow>The SirOsler blog</Eyebrow>
        <H1 className="mt-6 max-w-[18ch]">Ideas for people building health.</H1>
        <p className="mt-6 max-w-xl text-lg text-[var(--nxt-ink-soft)]">Regulation, hospitals, AI and funding in Indian healthcare, written for founders and clinicians.</p>

        {domains.length > 2 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {domains.map(d => (
              <button key={d} onClick={() => setDomain(d)} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${domain === d ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'}`}>{d}</button>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <p className="mt-12 text-[var(--nxt-ink-soft)]">Posts are coming soon.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{shown.map(p => <BlogCard key={p.id} post={p} />)}</div>
        )}
      </section>
    </PublicLayout>
  );
};

export const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setPost(null); setNotFound(false); setError('');
    api.get<{ post: BlogPost }>(`/public/blogs/${id}`)
      .then(r => { if (alive) setPost(r.post); })
      .catch(e => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
        else setError(e instanceof Error ? e.message : 'Could not load this post.');
      });
    return () => { alive = false; };
  }, [id]);

  const more = store.getBlogs().filter(p => p.status === 'published' && p.id !== id).slice(0, 3);

  if (notFound) {
    return (
      <PublicLayout variant="home">
        <section className="nxt-container py-24">
          <h1 className="font-display font-bold text-4xl tracking-[-0.03em]">We couldn't find that post.</h1>
          <Btn to="/blog" className="mt-8">All posts</Btn>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout variant="home">
      <article className="nxt-container pt-10 pb-20">
        <Link to="/blog" className="inline-flex items-center gap-1 text-[15px] hover:underline"><ChevronLeft className="w-4 h-4" /> All posts</Link>
        {error && <p className="mt-8 font-semibold text-[var(--nxt-peach-deep)]">{error}</p>}
        {!post && !error && <p className="mt-8 text-[var(--nxt-ink-soft)]">Loading…</p>}
        {post && (
          <div className="mt-8 max-w-3xl mx-auto">
            <p className="text-[13px] uppercase tracking-[0.14em] text-[var(--nxt-ink-soft)] flex flex-wrap gap-x-4">
              {post.content_type && <span>{post.content_type}</span>}
              {post.domain && <span>{post.domain}</span>}
              {post.status === 'draft' && <span className="text-[var(--nxt-peach-deep)] font-bold">Draft</span>}
            </p>
            <h1 className="mt-4 font-display font-bold text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.08] tracking-[-0.035em]">{post.title}</h1>
            <p className="mt-6 text-[15px] text-[var(--nxt-ink-soft)] flex flex-wrap gap-x-4 gap-y-1">
              <span>By <span className="font-semibold text-[var(--nxt-ink)]">NXT</span></span>
              {post.published_at && <span>{dateLabel(post.published_at)}</span>}
              {post.read_minutes > 0 && <span>{post.read_minutes} min read</span>}
            </p>
            {post.cover_url && <img src={post.cover_url} alt="" className="mt-8 w-full rounded-[18px] object-cover max-h-[26rem]" />}
            <RichText text={post.body || ''} className="mt-10" />
          </div>
        )}
      </article>

      {more.length > 0 && (
        <section className="nxt-container pb-20 border-t border-[var(--nxt-line)] pt-14">
          <h2 className="font-display font-bold text-2xl tracking-[-0.025em]">Keep reading</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{more.map(p => <BlogCard key={p.id} post={p} />)}</div>
        </section>
      )}
    </PublicLayout>
  );
};
