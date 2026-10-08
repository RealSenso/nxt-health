import type { Database } from './db.js';
import type { RoadmapContent } from './roadmapTypes.js';
import { buildRoadmapSteps, OBSOLETE_CATEGORY_ID, ROADMAP_SOURCE_CATEGORY, STARTER_CATEGORIES, STARTER_PROBLEMS, STARTER_RESOURCES } from './starterContent.js';

type Doc = Record<string, unknown> & { id: string };
const toDoc = ({ id, ...rest }: Doc) => ({ _id: id, ...rest });

export interface SyncResult {
  categories: number;
  steps: number;
  problems_added: number;
  removed_categories: number;
}

/**
 * Brings the database up to date with the starter content. Safe to run any time:
 *  - categories are written by id (a re-run refreshes them) and, when a roadmap is supplied, so are its steps,
 *  - problem statements and resources are only added when missing, so edits are never overwritten,
 *  - the first-generation starter categories (cat-1 … cat-21) and everything hanging off them are removed.
 */
export async function syncStarterContent(database: Database, adminId: string, roadmap?: RoadmapContent): Promise<SyncResult> {
  const { col } = database;

  // $set rather than replace, so a playbook imported earlier survives a refresh of the category list.
  for (const category of STARTER_CATEGORIES) {
    const { _id, ...fields } = toDoc(category);
    await col('categories').updateOne({ _id }, { $set: fields }, { upsert: true });
  }
  let stepCount = 0;
  if (roadmap) {
    for (const step of buildRoadmapSteps(roadmap)) {
      const doc = toDoc(step);
      await col('steps').replaceOne({ _id: doc._id }, doc, { upsert: true });
      stepCount++;
    }
    if (roadmap.playbook) await col('categories').updateOne({ _id: ROADMAP_SOURCE_CATEGORY }, { $set: { playbook: roadmap.playbook } });
  }

  let problemsAdded = 0;
  for (const [index, problem] of STARTER_PROBLEMS.entries()) {
    const { _id, ...fields } = toDoc(problem);
    // Earlier entries are newer, so they list first.
    const added = await col('problems').updateOne(
      { _id },
      { $setOnInsert: { ...fields, created_by_admin: adminId, created_at: new Date(Date.now() - index * 1000).toISOString() } },
      { upsert: true },
    );
    if (added.upsertedCount) problemsAdded++;
  }
  for (const resource of STARTER_RESOURCES) {
    const { _id, ...fields } = toDoc(resource);
    await col('resources').updateOne({ _id }, { $setOnInsert: { ...fields, rsvp_count: 0 } }, { upsert: true });
  }

  // Remove the first-generation starter categories and what depended on them.
  const oldCategories = (await col('categories').find({ _id: { $regex: OBSOLETE_CATEGORY_ID.source } }).toArray()).map(c => c._id);
  if (oldCategories.length) {
    const oldSteps = (await col('steps').find({ category_id: { $in: oldCategories } }).toArray()).map(s => s._id);
    await Promise.all([
      col('resources').deleteMany({ step_id: { $in: oldSteps } }),
      col('steps').deleteMany({ _id: { $in: oldSteps } }),
      col('categories').deleteMany({ _id: { $in: oldCategories } }),
      col('progress').deleteMany({ category_id: { $in: oldCategories } }),
      col('workspaces').deleteMany({ step_id: { $in: oldSteps } }),
      col('scopes').updateMany({}, [{
        $set: {
          category_locks: {
            $arrayToObject: {
              $filter: {
                input: { $objectToArray: { $ifNull: ['$category_locks', {}] } },
                cond: { $not: [{ $in: ['$$this.v', oldCategories] }] },
              },
            },
          },
        },
      }]),
    ]);
  }

  return { categories: STARTER_CATEGORIES.length, steps: stepCount, problems_added: problemsAdded, removed_categories: oldCategories.length };
}

