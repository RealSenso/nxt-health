import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Globe, Linkedin, MapPin, Lock, Users, GraduationCap, Briefcase, Rocket } from 'lucide-react';
import { PublicFounder, PublicTeam } from '../types';
import { store } from '../services/store';
import { BACKGROUND_OPTIONS, STAGE_OPTIONS, labelFor } from '../data/profileOptions';

function usePublicResource<T>(load: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setMissing(false);
    load().then(d => { if (!cancelled) setData(d); }).catch(() => { if (!cancelled) setMissing(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, missing };
}

const Private: React.FC<{ kind: string }> = ({ kind }) => (
  <div className="max-w-xl mx-auto rounded-3xl border border-dashed border-[var(--nxt-line)] p-10 text-center">
    <Lock className="w-10 h-10 mx-auto text-[var(--nxt-ink-soft)]" />
    <h1 className="font-display text-xl font-bold text-[var(--nxt-ink)] mt-3">This {kind} is private</h1>
    <p className="text-sm text-[var(--nxt-ink-soft)] mt-1">It may not exist, or its owner hasn't made it public.</p>
    <Link to="/problems" className="inline-block mt-5 px-5 py-2.5 rounded-full bg-[var(--nxt-mint-strong)] text-white text-sm font-semibold">Browse problem statements</Link>
  </div>
);

const Loading = () => <div className="max-w-3xl mx-auto h-64 rounded-3xl bg-[var(--nxt-surface)] border border-[var(--nxt-line)] animate-pulse" />;

const safeHref = (url: string) => (/^https?:\/\//i.test(url) ? url : undefined);

export const PublicFounderPage: React.FC = () => {
  const { uid = '' } = useParams<{ uid: string }>();
  const { data: profile, missing } = usePublicResource<PublicFounder>(() => store.fetchPublicFounder(uid), [uid]);
  if (missing) return <Private kind="profile" />;
  if (!profile) return <Loading />;

  return (
    <article className="max-w-3xl mx-auto space-y-5">
      {!profile.is_public && (
        <p className="rounded-2xl bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] text-sm font-semibold px-4 py-3">
          Preview — your profile is private, so only you and admins can see this page. Turn it on in Edit profile.
        </p>
      )}
      <section className="nxt-hero-glow rounded-3xl border border-[var(--nxt-line)] p-8">
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-2xl bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center font-display text-2xl font-bold">{profile.name.charAt(0)}</span>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--nxt-ink)]">{profile.name}</h1>
            {profile.headline && <p className="text-base text-[var(--nxt-ink-soft)] mt-1">{profile.headline}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          {profile.location && <Chip icon={MapPin}>{profile.location}</Chip>}
          {profile.background && <Chip icon={Briefcase}>{labelFor(BACKGROUND_OPTIONS, profile.background as never)}</Chip>}
          {profile.startup_stage && <Chip icon={Rocket}>{labelFor(STAGE_OPTIONS, profile.startup_stage as never)} stage</Chip>}
          {profile.is_mentor && <Chip icon={GraduationCap}>NxT Health mentor</Chip>}
        </div>
      </section>
      {profile.bio && (
        <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6">
          <h2 className="text-sm font-bold text-[var(--nxt-ink)] mb-2">About</h2>
          <p className="text-sm text-[var(--nxt-ink-soft)] whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
        </section>
      )}
      <div className="flex flex-wrap gap-3">
        {profile.team && (
          <Link to={`/teams/${profile.team.id}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] text-sm font-semibold text-[var(--nxt-ink)]">
            <Users className="w-4 h-4" /> {profile.team.name}
          </Link>
        )}
        {safeHref(profile.website) && (
          <a href={safeHref(profile.website)} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] text-sm font-semibold text-[var(--nxt-ink)]">
            <Globe className="w-4 h-4" /> Website
          </a>
        )}
        {safeHref(profile.linkedin) && (
          <a href={safeHref(profile.linkedin)} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--nxt-line)] bg-[var(--nxt-surface)] text-sm font-semibold text-[var(--nxt-ink)]">
            <Linkedin className="w-4 h-4" /> LinkedIn
          </a>
        )}
      </div>
    </article>
  );
};

export const PublicTeamPage: React.FC = () => {
  const { teamId = '' } = useParams<{ teamId: string }>();
  const { data: team, missing } = usePublicResource<PublicTeam>(() => store.fetchPublicTeam(teamId), [teamId]);
  if (missing) return <Private kind="team page" />;
  if (!team) return <Loading />;
  const hidden = team.member_count - team.members.length;

  return (
    <article className="max-w-3xl mx-auto space-y-5">
      {!team.is_public && (
        <p className="rounded-2xl bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] text-sm font-semibold px-4 py-3">
          Preview — this team page is private. The team owner can turn it on in the team settings.
        </p>
      )}
      <section className="nxt-hero-glow rounded-3xl border border-[var(--nxt-line)] p-8">
        <span className="w-14 h-14 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center"><Users className="w-7 h-7" /></span>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--nxt-ink)] mt-4">{team.name}</h1>
        {team.tagline && <p className="text-base text-[var(--nxt-ink-soft)] mt-1">{team.tagline}</p>}
        {safeHref(team.website) && (
          <a href={safeHref(team.website)} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[var(--nxt-mint-strong)] hover:underline">
            <Globe className="w-4 h-4" /> {team.website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </section>
      <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-6">
        <h2 className="text-sm font-bold text-[var(--nxt-ink)] mb-3">Team ({team.member_count})</h2>
        <ul className="space-y-2">
          {team.members.map(m => (
            <li key={m.id} className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center text-sm font-bold">{m.name.charAt(0)}</span>
              {m.has_public_profile ? (
                <Link to={`/founders/${m.id}`} className="text-sm font-semibold text-[var(--nxt-ink)] hover:underline">{m.name}</Link>
              ) : (
                <span className="text-sm font-semibold text-[var(--nxt-ink)]">{m.name}</span>
              )}
              {m.headline && <span className="text-sm text-[var(--nxt-ink-soft)] truncate">· {m.headline}</span>}
            </li>
          ))}
          {hidden > 0 && <li className="text-sm text-[var(--nxt-ink-soft)]">+ {hidden} member{hidden === 1 ? '' : 's'} with private profiles</li>}
        </ul>
      </section>
    </article>
  );
};

const Chip: React.FC<{ icon: React.ElementType; children: React.ReactNode }> = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-[var(--nxt-surface)] border border-[var(--nxt-line)] text-[var(--nxt-ink)]">
    <Icon className="w-4 h-4 text-[var(--nxt-mint-strong)]" /> {children}
  </span>
);
