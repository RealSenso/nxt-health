import { defaultRate } from './routes/expertPipeline.js';
import type { Database } from './db.js';
import { SEED_BLOGS } from './bundled/seedBlogs.js';
import { START_IN_INDIA_ROADMAP } from './bundled/startIndiaRoadmap.js';
import { SAMD_ROADMAP, SAMD_CONTRIBUTOR } from './bundled/samdRoadmap.js';
import { ONBOARDING_ROADMAP } from './bundled/onboardingRoadmap.js';
import { buildRoadmapSteps, CATALOG_REV, GUIDE_PROBLEM, LIVE_SLUGS, STARTER_CATEGORIES } from './starterContent.js';

type Doc = Record<string, unknown> & { id: string };
const toDoc = ({ id, ...rest }: Doc) => ({ _id: id, ...rest });

/**
 * Loads the content that ships with the server, only where it is missing, so edits made in the admin console are kept:
 *  - the free "How to start a startup in India" guide (its category and steps), and
 *  - the first blog posts.
 * Safe to run at every start.
 */
export async function loadBundledContent(database: Database): Promise<{ steps: number; blogs: number }> {
  const { col } = database;
  let steps = 0;

  const guideId = START_IN_INDIA_ROADMAP.category!;
  if (!(await col('steps').countDocuments({ category_id: guideId }))) {
    const category = STARTER_CATEGORIES.find(c => c.id === guideId);
    if (category) {
      const { _id, ...fields } = toDoc(category);
      await col('categories').updateOne({ _id }, { $set: { ...fields, playbook: START_IN_INDIA_ROADMAP.playbook } }, { upsert: true });
    }
    for (const step of buildRoadmapSteps(START_IN_INDIA_ROADMAP)) {
      const doc = toDoc(step);
      await col('steps').replaceOne({ _id: doc._id }, doc, { upsert: true });
      steps++;
    }
  }

  // Once per catalog revision: only SaMD and onboarding are open, every other roadmap is coming soon, and the bundled roadmaps are (re)loaded.
  const meta = (await col('settings').findOne({ _id: 'catalog' })) as { rev?: number } | null;
  if ((meta?.rev ?? 0) < CATALOG_REV) {
    for (const c of STARTER_CATEGORIES) {
      const { _id, priority, roadmap_note: _note, ...fields } = toDoc(c) as Record<string, unknown> & { _id: string };
      const unset: Record<string, ''> = { roadmap_note: '', ...(priority === undefined ? { priority: '' } : {}) };
      await col('categories').updateOne({ _id }, { $set: { ...fields, ...(priority !== undefined ? { priority } : {}) }, $unset: unset }, { upsert: true });
    }
    for (const roadmap of [SAMD_ROADMAP, ONBOARDING_ROADMAP]) {
      const fresh = buildRoadmapSteps(roadmap);
      // Steps of an earlier version of this roadmap that the new one no longer has.
      await col('steps').deleteMany({ category_id: roadmap.category!, _id: { $nin: fresh.map(d => d.id) } });
      for (const step of fresh) {
        const doc = toDoc(step);
        await col('steps').replaceOne({ _id: doc._id }, doc, { upsert: true });
        steps++;
      }
    }
    await col('categories').updateOne({ _id: SAMD_ROADMAP.category! }, { $set: { playbook: SAMD_ROADMAP.playbook, contributor: SAMD_CONTRIBUTOR } });
    await col('settings').updateOne({ _id: 'catalog' }, { $set: { rev: CATALOG_REV, live: LIVE_SLUGS } }, { upsert: true });
  }

  // The project that holds the free guide in Roadmaps.
  const { _id: guideProblemId, ...guideFields } = toDoc(GUIDE_PROBLEM);
  await col('problems').updateOne(
    { _id: guideProblemId },
    { $setOnInsert: { ...guideFields, created_by_admin: 'system', created_at: new Date(Date.now() - 365 * 86_400_000).toISOString() } },
    { upsert: true },
  );

  let blogs = 0;
  const created = new Date().toISOString();
  for (const { id, published_at, ...post } of SEED_BLOGS) {
    const result = await col('blogs').updateOne(
      { _id: id },
      { $setOnInsert: { ...post, cover_url: '', status: 'published', published_at, created_at: created } },
      { upsert: true },
    );
    if (result.upsertedCount) blogs++;
  }

  // Give every expert in the network a starting rate, so it can be edited rather than typed from scratch.
  const unrated = await col('expertPipeline').find({ rate_usd: { $exists: false } }, { projection: { _id: 1 } }).toArray();
  for (const d of unrated) {
    await col('expertPipeline').updateOne({ _id: d._id }, { $set: { rate_usd: defaultRate(d._id as string) } });
  }

  return { steps, blogs };
}
