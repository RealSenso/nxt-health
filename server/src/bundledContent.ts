import type { Database } from './db.js';
import { SAMD_ROADMAP } from './bundled/samdRoadmap.js';
import { syncStarterContent } from './syncContent.js';

/**
 * Loads the roadmaps that ship with the server: the SaMD checklist, only while that category has no steps,
 * so edits made in the admin console are kept. Safe to run at every start.
 */
export async function loadBundledContent(database: Database): Promise<{ steps: number }> {
  if (await database.col('steps').countDocuments({ category_id: SAMD_ROADMAP.category })) return { steps: 0 };
  return { steps: (await syncStarterContent(database, 'system', SAMD_ROADMAP)).steps };
}
