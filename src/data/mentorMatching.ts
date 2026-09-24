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
