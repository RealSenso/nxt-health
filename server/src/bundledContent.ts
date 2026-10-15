import type { Database } from './db.js';
import { SEED_BLOGS } from './bundled/seedBlogs.js';
import { START_IN_INDIA_ROADMAP } from './bundled/startIndiaRoadmap.js';
import { buildRoadmapSteps, STARTER_CATEGORIES } from './starterContent.js';

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
  return { steps, blogs };
}
