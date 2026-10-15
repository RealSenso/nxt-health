import { FounderBackground, MentorProfile, User } from '../types';
import { store } from '../services/store';

const COMPLEMENTS: Record<FounderBackground, FounderBackground[]> = {
  clinical: ['engineering', 'business'],
  engineering: ['clinical', 'business'],
  science: ['business', 'clinical'],
  business: ['clinical', 'engineering'],
  other: ['clinical', 'engineering', 'business'],
};

export interface MentorMatch {
  mentor: MentorProfile;
  score: number;
  reasons: string[];
}

/** Founder context: categories they've locked in and the stage of their next unfinished step in each. */
function founderContext(founder: User) {
  const scopeKey = store.getScopeKey(founder);
  const locks = store.getAllCategoryLocks()[scopeKey] || {};
  const categoryIds = new Set(Object.values(locks));
  const currentStages = new Set<string>();
  categoryIds.forEach(categoryId => {
    const progress = store.getUserProgress(scopeKey, categoryId);
    const next = store.getSteps(categoryId).find(s => !progress[s.id]);
    if (next?.stage_tag) currentStages.add(next.stage_tag);
  });
  return { categoryIds, currentStages };
}

export function rankMentors(founder: User): MentorMatch[] {
  const { categoryIds, currentStages } = founderContext(founder);
  const categoryName = new Map(store.getCategories().map(c => [c.id, c.name]));

  return store.getMentors()
    .filter(m => m.id !== founder.id && m.has_profile && m.accepting && m.active_mentees < (m.capacity || 0))
    .map(mentor => {
      const reasons: string[] = [];
      const sharedCategories = (mentor.category_ids || []).filter(id => categoryIds.has(id));
      const sharedStages = (mentor.expertise_stages || []).filter(stage => currentStages.has(stage));
      const mentorBackground = mentor.background || mentor.user_background;
      const complementary = !!founder.background && !!mentorBackground && COMPLEMENTS[founder.background].includes(mentorBackground);

      if (sharedCategories.length) reasons.push(`Knows ${sharedCategories.map(id => categoryName.get(id)).filter(Boolean).join(', ')}`);
      if (sharedStages.length) reasons.push(`Expert in your current stage: ${sharedStages.join(', ')}`);
      if (complementary) reasons.push(`${mentorBackground![0].toUpperCase()}${mentorBackground!.slice(1)} background complements yours`);

      return { mentor, reasons, score: sharedCategories.length * 3 + sharedStages.length * 2 + (complementary ? 1 : 0) };
    })
    .sort((a, b) => b.score - a.score || a.mentor.active_mentees - b.mentor.active_mentees);
}

export interface NetworkMatch {
  expert: import('../types').ListedExpert;
  score: number;
  reasons: string[];
}

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length >= 5);

/**
 * Matches a founder to the experts in the NXT network (people who are not bookable yet), using what an admin has recorded
 * about each expert: categories, stages, background and specialisation.
 */
export function rankNetworkExperts(founder: User): NetworkMatch[] {
  const { categoryIds, currentStages } = founderContext(founder);
  const categories = store.getCategories();
  const categoryName = new Map(categories.map(c => [c.id, c.name]));
  const lockedNames = Array.from(categoryIds).map(id => categoryName.get(id)).filter(Boolean) as string[];

  return store.getListedExperts()
    .map(expert => {
      const reasons: string[] = [];
      const sharedCategories = (expert.category_ids || []).filter(id => categoryIds.has(id));
      const sharedStages = (expert.expertise_stages || []).filter(stage => currentStages.has(stage));
      const complementary = !!founder.background && !!expert.background && COMPLEMENTS[founder.background].includes(expert.background as FounderBackground);

      const haystack = new Set(words(`${expert.specialisation || ''} ${expert.title}`));
      const textHits = lockedNames.filter(name => words(name).some(w => haystack.has(w)));

      if (sharedCategories.length) reasons.push(`Knows ${sharedCategories.map(id => categoryName.get(id)).filter(Boolean).join(', ')}`);
      if (textHits.length && !sharedCategories.length) reasons.push(`Works in an area close to ${textHits.join(', ')}`);
      if (sharedStages.length) reasons.push(`Expert in your current stage: ${sharedStages.join(', ')}`);
      if (complementary) reasons.push(`${(expert.background as string)[0].toUpperCase()}${(expert.background as string).slice(1)} background complements yours`);

      return { expert, reasons, score: sharedCategories.length * 3 + sharedStages.length * 2 + textHits.length + (complementary ? 1 : 0) };
    })
    .sort((a, b) => b.score - a.score || a.expert.name.localeCompare(b.expert.name));
}
