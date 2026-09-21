import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookMarked, Search, Video, Calendar, Hospital, ExternalLink, ArrowLeft, ArrowRight,
  Mail, User as UserIcon, Lock, ChevronRight
} from 'lucide-react';
import { Resource, ResourceType, User } from '../types';
import { store } from '../services/store';
import { Reveal, RevealGroup, RevealItem, PillButton } from './ui/Reveal';

interface ResourcesPageProps {
  currentUser: User | null;
  initialStepId?: string;
  onOpenLogin: () => void;
  onOpenMembershipModal: () => void;
}

const TYPE_LABEL: Record<ResourceType, string> = {
  session: 'Session',
  webinar: 'Webinar',
  seminar: 'Seminar',
  hospital_connection: 'Hospital Connection',
};

const TYPE_ICON: Record<ResourceType, React.ElementType> = {
  session: Calendar,
  webinar: Video,
  seminar: Video,
  hospital_connection: Hospital,
};

const PREVIEW_UNLOCKED_COUNT = 6;

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  currentUser,
  initialStepId,
  onOpenLogin,
  onOpenMembershipModal,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ResourceType>('all');
  const [stepFilter, setStepFilter] = useState<string | null>(initialStepId || null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const isMember = !!currentUser?.is_member;
  const categories = store.getCategories();
  const allSteps = store.getSteps();
  const resources = store.getResources();

  const stepById = new Map(allSteps.map(s => [s.id, s]));
  const categoryById = new Map(categories.map(c => [c.id, c]));

  const enriched = resources.map(r => {
    const step = stepById.get(r.step_id);
    const category = step ? categoryById.get(step.category_id) : undefined;
    return { resource: r, step, category };
  });

  const filtered = enriched.filter(({ resource, step, category }) => {
    if (stepFilter && resource.step_id !== stepFilter) return false;
    if (categoryFilter !== 'all' && category?.id !== categoryFilter) return false;
    if (typeFilter !== 'all' && resource.type !== typeFilter) return false;
    const q = search.toLowerCase();
    if (q) {
      const haystack = `${resource.title} ${resource.description} ${step?.name || ''} ${category?.name || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const upgradeAction = currentUser ? onOpenMembershipModal : onOpenLogin;
  const upgradeLabel = currentUser ? 'Become a Member' : 'Log In / Register';

  if (selectedResource) {
    const step = stepById.get(selectedResource.step_id);
    const category = step ? categoryById.get(step.category_id) : undefined;
    const Icon = TYPE_ICON[selectedResource.type];
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedResource(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resources</span>
        </button>

        <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--nxt-blue-strong)] bg-[var(--nxt-blue)] px-2.5 py-0.5 rounded-full">
              <Icon className="w-3 h-3" />
              {TYPE_LABEL[selectedResource.type]}
            </span>
            {category && (
              <span className="text-[11px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2.5 py-0.5 rounded-full">
                {category.name}
              </span>
            )}
          </div>

          <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-ink)] mb-3">
            {selectedResource.title}
          </h1>
          <p className="text-sm text-[var(--nxt-ink-soft)] leading-relaxed mb-6">
            {selectedResource.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {step && (
              <div className="flex items-center gap-2 text-[var(--nxt-ink-soft)]">
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <span>For step: <span className="font-semibold text-[var(--nxt-ink)]">{step.name}</span></span>
              </div>
            )}
            {selectedResource.date && (
              <div className="flex items-center gap-2 text-[var(--nxt-ink-soft)]">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{new Date(selectedResource.date).toLocaleDateString('en-US')}</span>
              </div>
            )}
            {selectedResource.host_or_speaker && (
              <div className="flex items-center gap-2 text-[var(--nxt-ink-soft)]">
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedResource.host_or_speaker}</span>
              </div>
            )}
            {selectedResource.hospital_name && (
              <div className="flex items-center gap-2 text-[var(--nxt-ink-soft)]">
                <Hospital className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedResource.hospital_name}{selectedResource.clinical_department ? ` — ${selectedResource.clinical_department}` : ''}</span>
              </div>
            )}
            {selectedResource.contact_person && (
              <div className="flex items-center gap-2 text-[var(--nxt-ink-soft)]">
                <UserIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedResource.contact_person}</span>
              </div>
            )}
            {selectedResource.contact_email && (
              <div className="flex items-center gap-2 text-[var(--nxt-ink-soft)]">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span>{selectedResource.contact_email}</span>
              </div>
            )}
            {selectedResource.pilot_status && (
              <div className="flex items-center gap-2 text-[var(--nxt-ink-soft)]">
                <span className="font-semibold text-[var(--nxt-ink)]">Pilot status:</span>
                <span>{selectedResource.pilot_status}</span>
              </div>
            )}
          </div>

          {selectedResource.link && (
            <a
              href={selectedResource.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-6 text-xs font-bold text-[var(--nxt-blue-strong)] hover:underline"
            >
              <span>Open Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </Reveal>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]">
            <BookMarked className="w-5 h-5" />
          </span>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-ink)]">Resources</h1>
        </div>
        <p className="text-xs sm:text-sm text-[var(--nxt-ink-soft)]">
          Sessions, webinars, and hospital connections curated for each roadmap step.
        </p>
      </Reveal>

      {!isMember && (
        <Reveal className="bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-[var(--nxt-peach-deep)] shrink-0" />
            <p className="text-xs font-semibold text-[var(--nxt-peach-deep)]">
              You're seeing a preview of {PREVIEW_UNLOCKED_COUNT} resources — {currentUser ? 'become a member' : 'log in and become a member'} to unlock the full library.
            </p>
          </div>
          <PillButton tone="ghost" onClick={upgradeAction} className="px-3.5 py-1.5 text-xs shrink-0">
            {upgradeLabel}
          </PillButton>
        </Reveal>
      )}

      <Reveal className="bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)] placeholder:text-[var(--nxt-ink-soft)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)] transition-all"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setStepFilter(null); }}
          className="px-3 py-1.5 text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)]"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-1.5 text-xs bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--nxt-mint-strong)]"
        >
          <option value="all">All Types</option>
          {(Object.keys(TYPE_LABEL) as ResourceType[]).map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
        {stepFilter && (
          <button
            onClick={() => setStepFilter(null)}
            className="px-3 py-1.5 text-xs font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] border border-[var(--nxt-line)] rounded-full bg-[var(--nxt-surface)]"
          >
            Clear step filter
          </button>
        )}
      </Reveal>

      <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" stagger={0.03}>
        {filtered.map(({ resource, step, category }, i) => {
          const locked = !isMember && i >= PREVIEW_UNLOCKED_COUNT;
          const Icon = TYPE_ICON[resource.type];
          if (locked) {
            return (
              <RevealItem key={resource.id}>
                <button
                  onClick={upgradeAction}
                  className="w-full text-left bg-[var(--nxt-bg-soft)] border border-dashed border-[var(--nxt-line)] rounded-2xl p-5 h-full flex flex-col justify-between opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--nxt-ink-soft)] bg-[var(--nxt-line)] px-2 py-0.5 rounded-full">
                      <Icon className="w-3 h-3" />
                      {TYPE_LABEL[resource.type]}
                    </span>
                    <h3 className="font-display text-sm font-bold text-[var(--nxt-ink-soft)] leading-snug mt-2">
                      {resource.title}
                    </h3>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-[var(--nxt-peach-deep)]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Members only</span>
                  </div>
                </button>
              </RevealItem>
            );
          }
          return (
            <RevealItem key={resource.id}>
              <motion.button
                whileHover={{ y: -3 }}
                onClick={() => setSelectedResource(resource)}
                className="w-full text-left bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[var(--nxt-blue-strong)]/30 transition-shadow h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--nxt-blue-strong)] bg-[var(--nxt-blue)] px-2 py-0.5 rounded-full">
                      <Icon className="w-3 h-3" />
                      {TYPE_LABEL[resource.type]}
                    </span>
                    {category && (
                      <span className="text-[10px] font-semibold text-[var(--nxt-mint-deep)] bg-[var(--nxt-mint)] px-2 py-0.5 rounded-full truncate max-w-[100px]">
                        {category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-sm font-bold text-[var(--nxt-ink)] leading-snug">
                    {resource.title}
                  </h3>
                  <p className="text-xs text-[var(--nxt-ink-soft)] leading-relaxed line-clamp-2 mt-1.5">
                    {resource.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-end gap-1 text-xs font-bold text-[var(--nxt-blue-strong)]">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.button>
            </RevealItem>
          );
        })}
      </RevealGroup>

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-[var(--nxt-surface)] rounded-2xl border border-dashed border-[var(--nxt-line)]">
          <BookMarked className="w-10 h-10 text-[var(--nxt-ink-soft)] mx-auto mb-3" />
          <p className="text-sm font-bold text-[var(--nxt-ink)]">No resources found</p>
          <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Try a different search or filter.</p>
        </div>
      )}
    </div>
  );
};
