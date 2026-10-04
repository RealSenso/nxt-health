import { Router } from 'express';
import type { Database } from '../db.js';
import { HttpError } from '../auth.js';

import { openSlotsFor, DEFAULT_RATE_USD } from './consultations.js';

/** What anyone may see about an expert. Never includes the private video-call link. */
function publicExpert(user: Record<string, unknown> & { _id: string }, profile: Record<string, unknown> & { _id: string }, slotCount: number) {
  return {
    id: user._id,
    name: user.name as string,
    headline: (profile.headline as string) || '',
    bio: (profile.bio as string) || '',
    topics: (profile.topics as string[]) || [],
    expert_areas: (profile.expert_areas as string[]) || [],
    fits_gates: (profile.fits_gates as number[]) || [],
    book_when: (profile.book_when as string[]) || [],
    rate_usd: typeof profile.rate_usd === 'number' ? profile.rate_usd : DEFAULT_RATE_USD,
    photo_url: (profile.photo_url as string) || '',
    open_slots: slotCount,
  };
}

/** The public expert directory: mentors an admin has set up who are taking bookings. */
export function expertsRouter(database: Database): Router {
  const r = Router();

  async function listedExperts() {
    const profiles = await database.col('mentorProfiles').find({ accepting: true }).toArray();
    if (!profiles.length) return [];
    const users = await database.col('users').find({ _id: { $in: profiles.map(p => p._id) }, is_mentor: true }).toArray();
    return users.map(user => ({ user, profile: profiles.find(p => p._id === user._id)! }));
  }

  r.get('/public/experts', async (_req, res) => {
    const experts = await listedExperts();
    const items = await Promise.all(experts.map(async ({ user, profile }) =>
      publicExpert(user, profile, (await openSlotsFor(database, profile, user._id)).length)));
    items.sort((a, b) => a.name.localeCompare(b.name));
    res.json({ experts: items });
  });

  r.get('/public/experts/:id', async (req, res) => {
    const id = String(req.params.id);
    const expert = (await listedExperts()).find(e => e.user._id === id);
    if (!expert) throw new HttpError(404, 'Expert not found.');
    const slots = await openSlotsFor(database, expert.profile, id);
    res.json({ expert: publicExpert(expert.user, expert.profile, slots.length), slots });
  });

  return r;
}

