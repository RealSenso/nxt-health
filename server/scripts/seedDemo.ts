/**
 * Loads demo accounts and activity into a real database, for showing the platform before launch.
 *
 *   MONGODB_URI="..." FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/key.json npm run seed-demo
 *
 * Creates Firebase logins (email already verified) plus matching profiles, roadmap progress,
 * funding applications, evidence reviews, ratings and a mentor. Loads the starter content first
 * if the database has none.
 *
 * Re-running resets the demo: everything the demo accounts did (messages, RSVPs, bookings, teams,
 * mentor requests, consultations, uploads, notifications) is wiped and the seeded activity is restored. Passwords
 * are reset to the ones printed at the end (or DEMO_ADMIN_PASSWORD / DEMO_MEMBER_PASSWORD if set).
 * Add --reset-content to also restore the starter problems, roadmaps and resources — this discards
 * any content admins added or edited. Accounts that are not demo accounts are never touched.
 */
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ObjectId } from 'mongodb';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { connect } from '../src/db.js';
import { roadmapContentSchema } from '../src/roadmapTypes.js';
import { syncStarterContent } from '../src/syncContent.js';

const uri = process.env.MONGODB_URI;
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT || (keyPath ? readFileSync(keyPath, 'utf8') : '');
if (!uri || !keyJson) {
  console.error('Usage: MONGODB_URI="..." FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/key.json npm run seed-demo');
  process.exit(1);
}

const password = () => randomBytes(9).toString('base64url');
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || password();
const MEMBER_PASSWORD = process.env.DEMO_MEMBER_PASSWORD || password();

const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

type Membership = 'active' | 'none' | 'requested';
interface DemoUser {
  key: string;
  email: string;
  name: string;
  admin?: boolean;
  membership: Membership;
  profile: Record<string, unknown>;
}

const USERS: DemoUser[] = [
  { key: 'admin', email: 'admin@example.com', name: 'Dr. Sarah Lin', admin: true, membership: 'active',
    profile: { location: 'Boston, MA', gender: 'female', created_at: daysAgo(400), last_active_at: daysAgo(0) } },
  { key: 'marcus', email: 'marcus@example.com', name: 'Marcus Vance', membership: 'active',
    profile: { location: 'Austin, TX', gender: 'male', created_at: daysAgo(200), membership_started_at: daysAgo(192), last_active_at: daysAgo(1),
      background: 'engineering', first_time_founder: true, commitment: 'full_time', startup_stage: 'pre_seed',
      funding_raised_total: 150000, has_revenue: false, acquisition_source: 'university',
      outcomes: { pilots_signed: 0, regulatory_filings: 0, funding_raised_since_joining: 100000, updated_at: daysAgo(40) } } },
  { key: 'alex', email: 'alex@example.com', name: 'Alex Chen', membership: 'none',
    profile: { location: 'San Francisco, CA', gender: 'prefer_not_to_say', created_at: daysAgo(40), last_active_at: daysAgo(35),
      background: 'business', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', acquisition_source: 'search' } },
  { key: 'priya', email: 'priya@example.com', name: 'Priya Raman', membership: 'active',
    profile: { location: 'Bengaluru, India', gender: 'female', created_at: daysAgo(150), membership_started_at: daysAgo(148), last_active_at: daysAgo(3),
      background: 'clinical', first_time_founder: false, commitment: 'full_time', startup_stage: 'seed',
      funding_raised_total: 1200000, has_revenue: true, acquisition_source: 'linkedin',
      outcomes: { pilots_signed: 2, regulatory_filings: 1, funding_raised_since_joining: 800000, updated_at: daysAgo(20) } } },
  { key: 'james', email: 'james@example.com', name: 'James Okafor', membership: 'active',
    profile: { location: 'London, UK', gender: 'male', created_at: daysAgo(120), membership_started_at: daysAgo(110), last_active_at: daysAgo(10),
      background: 'engineering', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', funding_raised_total: 0, has_revenue: false, acquisition_source: 'event' } },
  { key: 'mei', email: 'mei@example.com', name: 'Mei Tanaka', membership: 'requested',
    profile: { location: 'Toronto, Canada', gender: 'other', created_at: daysAgo(60), membership_requested_at: daysAgo(2), last_active_at: daysAgo(2),
      background: 'engineering', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', acquisition_source: 'linkedin' } },
  { key: 'diego', email: 'diego@example.com', name: 'Diego Fernandez', membership: 'active',
    profile: { location: 'Austin, TX', gender: 'male', created_at: daysAgo(95), membership_started_at: daysAgo(90), last_active_at: daysAgo(2),
      background: 'science', first_time_founder: false, commitment: 'full_time', startup_stage: 'seed',
      funding_raised_total: 2500000, has_revenue: false, acquisition_source: 'hospital_partner',
      outcomes: { pilots_signed: 1, regulatory_filings: 0, funding_raised_since_joining: 1500000, updated_at: daysAgo(15) } } },
  { key: 'amara', email: 'amara@example.com', name: 'Amara Okonkwo', membership: 'none',
    profile: { location: 'Boston, MA', gender: 'female', created_at: daysAgo(20), last_active_at: daysAgo(5),
      background: 'clinical', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', acquisition_source: 'referral' } },
  { key: 'sofia', email: 'sofia@example.com', name: 'Sofia Rossi', membership: 'active',
    profile: { location: 'Milan, Italy', gender: 'female', created_at: daysAgo(80), membership_started_at: daysAgo(74), last_active_at: daysAgo(4),
      background: 'clinical', first_time_founder: true, commitment: 'full_time', startup_stage: 'pre_seed', funding_raised_total: 250000, has_revenue: false, acquisition_source: 'referral' } },
  { key: 'rahul', email: 'rahul@example.com', name: 'Rahul Mehta', membership: 'active',
    profile: { location: 'Mumbai, India', gender: 'male', created_at: daysAgo(45), membership_started_at: daysAgo(30), last_active_at: daysAgo(1),
      background: 'engineering', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', funding_raised_total: 0, has_revenue: false, acquisition_source: 'university' } },
  { key: 'hannah', email: 'hannah@example.com', name: 'Hannah Berg', membership: 'active',
    profile: { location: 'Berlin, Germany', gender: 'female', created_at: daysAgo(170), membership_started_at: daysAgo(168), last_active_at: daysAgo(0),
      background: 'business', first_time_founder: false, commitment: 'full_time', startup_stage: 'series_a_plus',
      funding_raised_total: 6000000, has_revenue: true, acquisition_source: 'event',
      outcomes: { pilots_signed: 3, regulatory_filings: 2, funding_raised_since_joining: 4000000, updated_at: daysAgo(10) } } },
  { key: 'kwame', email: 'kwame@example.com', name: 'Kwame Asante', membership: 'none',
    profile: { location: 'Accra, Ghana', gender: 'male', created_at: daysAgo(10), last_active_at: daysAgo(2),
      background: 'science', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', acquisition_source: 'search' } },
  { key: 'lucia', email: 'lucia@example.com', name: 'Lucia Gomez', membership: 'active',
    profile: { location: 'Mexico City, Mexico', gender: 'female', created_at: daysAgo(30), membership_started_at: daysAgo(26), last_active_at: daysAgo(12),
      background: 'clinical', first_time_founder: true, commitment: 'full_time', startup_stage: 'idea', funding_raised_total: 0, has_revenue: false, acquisition_source: 'linkedin' } },
];

interface JourneyStep { step: string; status: 'done' | 'in_progress' | 'blocked'; started: number; completed?: number; done: number; blocker?: string; log?: string[] }
const EXPERT_USERS: DemoUser[] = [
  ['ravi', 'Ravi Menon', 'Mumbai, India'],
  ['elena', 'Elena Petrova', 'London, UK'],
  ['omar', 'Omar Haddad', 'Dubai, UAE'],
  ['grace', 'Grace Lindqvist', 'Stockholm, Sweden'],
  ['tomas', 'Tomás Reyes', 'Madrid, Spain'],
  ['nadia', 'Nadia Iqbal', 'Pune, India'],
].map(([key, name, location]) => ({
  key, email: `${key}@example.com`, name, membership: 'none' as Membership,
  profile: { location, created_at: daysAgo(120), last_active_at: daysAgo(2), background: 'clinical' },
}));
USERS.push(...EXPERT_USERS);

const WEEKDAYS_ALL = [1, 2, 3, 4, 5];
/** Fictional experts for the public directory; roles mirror the kinds of people the directory is meant to hold. */
const EXPERTS: Record<string, Record<string, unknown>> = {
  hannah: {
    headline: 'Took a Class II device from prototype to EU & US clearance',
    bio: 'Second-time founder (SteriVue). Happy to help with hospital pilots, regulatory strategy and first fundraising rounds.',
    topics: ['US FDA 510(k)', 'CE Mark', 'First fundraising round'],
    expert_areas: ['Medical devices', 'Regulatory', 'Market access'],
    fits_gates: [3, 4], rate_usd: 200, session_times: ['10:00', '11:30', '15:00', '17:30'],
    expertise_stages: ['Legal & Compliance', 'Revenue', 'Launch'], category_ids: ['cat-marketplace-network'], background: 'business', availability: '2 calls a month',
    book_when: ['Plan the evidence a regulator will ask for', 'Choose between the EU and US route first', 'Prepare a first fundraising conversation'],
  },
  ravi: {
    headline: 'Medical device regulatory lead',
    bio: 'Medical device regulatory lead. Has taken devices through CDSCO, the US FDA and CE Mark, from classification to final submission.',
    topics: ['CDSCO', 'US FDA', 'CE Mark'],
    expert_areas: ['Medical devices', 'Regulatory'],
    fits_gates: [3, 4], rate_usd: 150, session_times: ['10:00', '11:30', '15:00', '17:30'],
    expertise_stages: ['Legal & Compliance'], category_ids: ['cat-marketplace-network', 'cat-healthcare-services'], background: 'science', availability: 'Weekday mornings',
    book_when: ['Work out your device class and the route that follows from it', 'Plan the evidence a regulator will ask for', 'Check a regulatory file before you submit it', 'Decide whether India, the GCC or the US comes first'],
  },
  elena: {
    headline: 'Clinical validation and study design',
    bio: 'Clinical validation and study design. Has run hospital pilots and built the evidence packages that buyers ask for.',
    topics: ['Hospital pilots', 'Evidence generation', 'KOL engagement'],
    expert_areas: ['Clinical validation', 'Hospital pilots'],
    fits_gates: [3, 4], rate_usd: 180, session_times: ['09:30', '14:00', '16:30'],
    expertise_stages: ['Strategy', 'Marketplace Validation'], category_ids: ['cat-healthcare-services', 'cat-clinical-infrastructure'], background: 'clinical', availability: 'Weekdays',
    book_when: ['Design a pilot a hospital will actually sign', 'Choose endpoints and a sample size', 'Line up a clinical champion'],
  },
  omar: {
    headline: 'Grants and non-dilutive funding',
    bio: 'Grants and non-dilutive funding. Knows which international grants are open to Indian teams and what reviewers look for.',
    topics: ['International grants open to India', 'Applications'],
    expert_areas: ['Funding and grants'],
    fits_gates: [2], rate_usd: 0, session_times: ['11:00', '15:30'],
    expertise_stages: ['Revenue'], category_ids: ['cat-marketplace-network'], background: 'business', availability: 'Two sessions a week',
    book_when: ['Pick the right grant for your stage', 'Review an application before you submit', 'Plan a resubmission after feedback'],
  },
  grace: {
    headline: 'UK and EU market entry',
    bio: 'UK and EU market entry. Has validated products in India and won first contracts abroad.',
    topics: ['Validation in India', 'First contracts abroad'],
    expert_areas: ['Market access', 'Medical devices'],
    fits_gates: [3, 5], rate_usd: 120, session_times: ['12:00', '17:00'],
    expertise_stages: ['Market', 'Scale'], category_ids: ['cat-marketplace-network'], background: 'business', availability: 'Weekday afternoons',
    book_when: ['Choose your first overseas market', 'Find a launch partner', 'Plan UK and EU registration'],
  },
  tomas: {
    headline: 'AI and digital health product',
    bio: 'AI and digital health product. Specialises in taking software to market as a medical device.',
    topics: ['Software as a medical device', 'Clinical AI'],
    expert_areas: ['AI and digital health', 'Regulatory'],
    fits_gates: [3, 4], rate_usd: 220, session_times: ['10:30', '14:30', '18:00'],
    expertise_stages: ['Technology', 'Legal & Compliance'], category_ids: ['cat-workflow-ops-tech', 'cat-clinical-infrastructure'], background: 'engineering', availability: 'Weekdays',
    book_when: ['Decide whether your software is a medical device', 'Plan clinical validation for an AI model', 'Choose a data and privacy approach'],
  },
  nadia: {
    headline: 'Hospital operator and innovation lead',
    bio: 'Hospital operator and innovation lead. Knows how pilots, procurement and vendor onboarding really work inside a hospital.',
    topics: ['Pilots', 'Procurement', 'Vendor onboarding'],
    expert_areas: ['Hospital pilots', 'Market access'],
    fits_gates: [4, 5], rate_usd: 100, session_times: ['09:00', '13:00', '16:00'],
    expertise_stages: ['Operations', 'Marketplace Validation'], category_ids: ['cat-healthcare-services', 'cat-workflow-ops-tech'], background: 'clinical', availability: 'Weekdays',
    book_when: ['Get a pilot approved inside a hospital', 'Understand how procurement decides', 'Prepare for vendor onboarding'],
  },
};

/** Roadmap step ids are `step-<category slug>-<phase number>`; phases 0–9 are Strategy … Scale. */
const J = (user: string, problem: string, slug: string, steps: JourneyStep[]) =>
  ({ user, problem, category: `cat-${slug}`, steps: steps.map(st => ({ ...st, step: `step-${slug}-${st.step}` })) });

const JOURNEYS: { user: string; problem: string; category: string; steps: JourneyStep[] }[] = [
  J('marcus', 'prob-womens-psychological', 'marketplace-network', [
    { step: '0', status: 'done', started: 185, completed: 140, done: 5 },
    { step: '1', status: 'done', started: 140, completed: 60, done: 7 },
    { step: '2', status: 'in_progress', started: 60, done: 3, log: ['Participation rules drafted with Dr. Lin for feedback.'] },
  ]),
  J('priya', 'prob-migraine', 'workflow-ops-tech', [
    { step: '0', status: 'done', started: 145, completed: 120, done: 5 },
    { step: '1', status: 'done', started: 120, completed: 75, done: 7 },
    { step: '2', status: 'done', started: 75, completed: 30, done: 10 },
    { step: '3', status: 'blocked', started: 30, done: 1, blocker: 'Waiting on the hospital IT security review' },
  ]),
  J('james', 'prob-womens-psychological', 'healthcare-services', [
    { step: '0', status: 'done', started: 105, completed: 75, done: 5 },
    { step: '1', status: 'in_progress', started: 75, done: 2 },
  ]),
  J('diego', 'prob-migraine', 'clinical-infrastructure', [
    { step: '0', status: 'done', started: 88, completed: 70, done: 5 },
    { step: '1', status: 'done', started: 70, completed: 35, done: 7 },
    { step: '2', status: 'blocked', started: 35, done: 2, blocker: 'Waiting on a data-sharing agreement with the partner hospital' },
  ]),
  J('sofia', 'prob-migraine', 'patient-education', [
    { step: '0', status: 'done', started: 70, completed: 40, done: 5 },
    { step: '1', status: 'in_progress', started: 40, done: 3 },
  ]),
  J('rahul', 'prob-womens-psychological', 'training-simulation', [{ step: '0', status: 'in_progress', started: 25, done: 2 }]),
  J('hannah', 'prob-migraine', 'marketplace-network', [
    { step: '0', status: 'done', started: 165, completed: 150, done: 5 },
    { step: '1', status: 'done', started: 150, completed: 110, done: 7 },
    { step: '2', status: 'done', started: 110, completed: 55, done: 10 },
    { step: '3', status: 'done', started: 55, completed: 12, done: 5 },
    { step: '4', status: 'in_progress', started: 12, done: 2 },
  ]),
  J('lucia', 'prob-migraine', 'clinical-infrastructure', [
    { step: '0', status: 'blocked', started: 22, done: 1, blocker: 'Waiting on access to a partner hospital' },
  ]),
];

/** Old sample evidence/ratings name steps as "...-N" (1-based); this points them at the user's own roadmap. */
const stepFor = (who: string, oldStep: string) => {
  const journey = JOURNEYS.find(j => j.user === who)!;
  return `step-${journey.category.replace(/^cat-/, '')}-${Number(oldStep.match(/(\d+)$/)![1]) - 1}`;
};

/** Sample events for the demo; they hang off the Marketplace roadmap. */
const inDays = (n: number, hour = 10) => { const d = new Date(Date.now() + n * DAY); d.setUTCHours(hour, 0, 0, 0); return d.toISOString(); };
const DEMO_RESOURCES = [
  { id: 'res-demo-1', step_id: 'step-marketplace-network-1', type: 'seminar', title: 'Sizing a healthcare market: TAM, SAM and a realistic SOM', description: 'A working session on estimating the market for a healthcare network before you build it.', host_or_speaker: 'NXT Health team', starts_at: inDays(7, 10), date: 'In a week, 3:30 PM IST', capacity: 40 },
  { id: 'res-demo-2', step_id: 'step-marketplace-network-4', type: 'webinar', title: 'Contracts and terms for healthcare platforms', description: 'What a platform needs in its terms of use and its provider and customer agreements.', host_or_speaker: 'NXT Health team', starts_at: inDays(14, 11), date: 'In two weeks, 4:30 PM IST', capacity: 100 },
  { id: 'res-demo-3', step_id: 'step-marketplace-network-0', type: 'session', title: '1-on-1: validate your problem', description: 'A short call to pressure-test your problem statement and your first interviews.', host_or_speaker: 'NXT Health team', slots: [inDays(3, 9), inDays(3, 11), inDays(4, 9)], slot_minutes: 30 },
  { id: 'res-demo-4', step_id: 'step-marketplace-network-7', type: 'hospital_connection', title: 'Pilot desk at a partner hospital', description: 'A named contact who can help you run real transactions inside a hospital.', hospital_name: 'Demo City Hospital', clinical_department: 'Innovation office', contact_person: 'Demo contact', pilot_status: 'Accepting pilots' },
];

const APPLICATIONS: [string, string, string, number, 'Pending' | 'Approved' | 'Rejected', number, number?][] = [
  ['marcus', 'PulseVibe Biosystems', 'prob-womens-psychological', 125000, 'Pending', 55],
  ['priya', 'NeuroTrack', 'prob-migraine', 200000, 'Approved', 110, 95],
  ['hannah', 'SteriVue', 'prob-womens-psychological', 175000, 'Approved', 140, 128],
  ['diego', 'OncoScan', 'prob-migraine', 300000, 'Pending', 20],
  ['james', 'CardiaIQ', 'prob-womens-psychological', 90000, 'Rejected', 70, 60],
];

const SUBMISSIONS: [string, string, 'Approved' | 'Changes Requested' | 'Submitted', number, number?][] = [
  ['marcus', 'step-dev-1', 'Approved', 142, 139],
  ['marcus', 'step-dev-2', 'Approved', 62, 58],
  ['priya', 'step-dh-2', 'Approved', 77, 76],
  ['priya', 'step-dh-3', 'Changes Requested', 40, 35],
  ['priya', 'step-dh-3', 'Approved', 32, 30],
  ['diego', 'step-diag-2', 'Approved', 37, 33],
  ['hannah', 'step-dev-3', 'Changes Requested', 60, 52],
  ['hannah', 'step-dev-3', 'Approved', 56, 55],
  ['hannah', 'step-dev-4', 'Approved', 14, 12],
  ['sofia', 'step-dev-1', 'Submitted', 3],
];

const RATINGS: [string, string, number, string | undefined, number][] = [
  ['marcus', 'step-dev-1', 9, 'Deliverables list was spot on.', 140],
  ['marcus', 'step-dev-2', 7, undefined, 60],
  ['priya', 'step-dh-1', 10, undefined, 120],
  ['priya', 'step-dh-2', 8, undefined, 75],
  ['priya', 'step-dh-3', 6, 'Needed more hospital IT contacts.', 30],
  ['james', 'step-dev-1', 8, undefined, 75],
  ['diego', 'step-diag-1', 9, undefined, 70],
  ['diego', 'step-diag-2', 5, 'Assay guidance was too generic.', 35],
  ['sofia', 'step-dev-1', 10, undefined, 40],
  ['hannah', 'step-dev-1', 9, undefined, 150],
  ['hannah', 'step-dev-2', 9, undefined, 110],
  ['hannah', 'step-dev-3', 8, undefined, 55],
  ['hannah', 'step-dev-4', 4, 'Regulatory section needs EU MDR detail.', 12],
];

const VIEWS: [string, string, number][] = [
  ['marcus', 'res-demo-1', 180], ['marcus', 'res-demo-3', 178], ['marcus', 'res-demo-4', 55], ['marcus', 'res-demo-2', 50],
  ['james', 'res-demo-1', 100], ['sofia', 'res-demo-1', 68], ['sofia', 'res-demo-3', 66], ['hannah', 'res-demo-1', 160],
  ['hannah', 'res-demo-4', 100], ['hannah', 'res-demo-2', 98], ['hannah', 'res-demo-3', 95],
  ['priya', 'res-demo-2', 70], ['alex', 'res-demo-1', 38], ['amara', 'res-demo-3', 6], ['kwame', 'res-demo-1', 3],
];

// ---------------------------------------------------------------------------

initializeApp({ credential: cert(JSON.parse(keyJson)) });
const auth = getAuth();
const { client, database } = await connect(uri, process.env.MONGODB_DB || 'nxt_health');
const col = database.col;

async function firebaseUid(u: DemoUser): Promise<string> {
  const pw = u.admin ? ADMIN_PASSWORD : MEMBER_PASSWORD;
  try {
    const existing = await auth.getUserByEmail(u.email);
    await auth.updateUser(existing.uid, { password: pw, emailVerified: true, displayName: u.name });
    return existing.uid;
  } catch (e) {
    if ((e as { code?: string }).code !== 'auth/user-not-found') throw e;
    return (await auth.createUser({ email: u.email, password: pw, emailVerified: true, displayName: u.name })).uid;
  }
}

const uid: Record<string, string> = {};
for (const u of USERS) {
  uid[u.key] = await firebaseUid(u);
  await col('users').replaceOne({ _id: uid[u.key] }, {
    email: u.email,
    name: u.name,
    role: u.admin ? 'admin' : 'member',
    membership_status: u.membership,
    is_mentor: u.key in EXPERTS,
    team_id: null,
    saved_problem_ids: [],
    demo: true,
    ...u.profile,
  }, { upsert: true });
}
console.log(`✓ ${USERS.length} accounts`);

// The categories, roadmaps and problem statements. Existing site content is refreshed in place;
// --reset-content wipes it first (this discards anything admins added or edited).
if (process.argv.includes('--reset-content')) {
  await Promise.all(['categories', 'steps', 'resources', 'problems'].map(name => col(name as 'steps').deleteMany({})));
}
// The roadmap checklist is not in the repository: it lives in server/content/ (git-ignored) or at $ROADMAP_FILE.
const roadmapPath = process.env.ROADMAP_FILE || new URL('../content/marketplace-roadmap.json', import.meta.url).pathname;
let roadmap;
try {
  roadmap = roadmapContentSchema.parse(JSON.parse(readFileSync(roadmapPath, 'utf8')));
} catch {
  console.error(`Could not read the roadmap file at ${roadmapPath}.\nThe demo journeys need it — put the roadmap JSON there, or set ROADMAP_FILE=/path/to/file.json.`);
  process.exit(1);
}
const synced = await syncStarterContent(database, uid.admin, roadmap);
console.log(`✓ starter content: ${synced.categories} categories, ${synced.steps} roadmap steps, ${synced.problems_added} new problems${synced.removed_categories ? `, ${synced.removed_categories} older categories removed` : ''}`);

// Wipe everything earlier demo sessions created, so each run starts from the same state.
// Include demo users from earlier runs whose login was recreated (their uid changed).
const staleUsers = await col('users').find({ email: { $in: USERS.map(u => u.email) }, _id: { $nin: Object.values(uid) } }).toArray();
await col('users').deleteMany({ _id: { $in: staleUsers.map(u => u._id) } });
const demoIds = [...Object.values(uid), ...staleUsers.map(u => u._id)];
const demoTeams = await col('teams').find({ member_ids: { $in: demoIds } }).toArray();
const teamIds = demoTeams.map(t => t._id);
const scopeKeys = [...demoIds, ...teamIds];

const oldSubmissions = await col('submissions').find({ $or: [{ user_id: { $in: demoIds } }, { scope_key: { $in: scopeKeys } }] }).toArray();
for (const sub of oldSubmissions) {
  for (const file of (sub.files as { file_id: string }[] | undefined) || []) {
    await database.files.delete(new ObjectId(file.file_id)).catch(() => undefined);
  }
}
const oldThreads = await col('threads').find({ $or: [{ participant_uids: { $in: demoIds } }, { scope_key: { $in: scopeKeys } }] }).toArray();
await Promise.all([
  col('messages').deleteMany({ thread_id: { $in: oldThreads.map(t => t._id) } }),
  col('threads').deleteMany({ _id: { $in: oldThreads.map(t => t._id) } }),
  col('notifications').deleteMany({ user_id: { $in: demoIds } }),
  col('rsvps').deleteMany({ user_id: { $in: demoIds } }),
  col('bookings').deleteMany({ user_id: { $in: demoIds } }),
  col('mentorRequests').deleteMany({ $or: [{ founder_uid: { $in: demoIds } }, { mentor_uid: { $in: demoIds } }] }),
  col('consultations').deleteMany({ $or: [{ founder_uid: { $in: demoIds } }, { mentor_uid: { $in: demoIds } }] }),
  col('teamInvites').deleteMany({ $or: [{ team_id: { $in: teamIds } }, { to_email: { $in: USERS.map(u => u.email) } }] }),
  col('teams').deleteMany({ _id: { $in: teamIds } }),
  col('publicProfiles').deleteMany({ _id: { $in: demoIds } }),
]);
// Non-demo users who had joined a demo team go back to working solo.
await col('users').updateMany({ team_id: { $in: teamIds } }, { $set: { team_id: null } });
// Keep RSVP counters in line with the RSVPs that remain.
await col('resources').updateMany({}, { $set: { rsvp_count: 0 } });
for (const { _id, n } of await col('rsvps').aggregate<{ _id: string; n: number }>([{ $group: { _id: '$resource_id', n: { $sum: 1 } } }]).toArray()) {
  await col('resources').updateOne({ _id }, { $set: { rsvp_count: n } });
}

await Promise.all([
  col('scopes').deleteMany({ _id: { $in: scopeKeys } }),
  col('progress').deleteMany({ user_id: { $in: scopeKeys } }),
  col('workspaces').deleteMany({ scope_key: { $in: scopeKeys } }),
  col('applications').deleteMany({ $or: [{ user_id: { $in: demoIds } }, { scope_key: { $in: scopeKeys } }] }),
  col('submissions').deleteMany({ _id: { $in: oldSubmissions.map(s => s._id) } }),
  col('applications').deleteMany({ _id: { $regex: '^app-demo-' } }),
  col('submissions').deleteMany({ _id: { $regex: '^sub-demo-' } }),
  col('stepRatings').deleteMany({ $or: [{ user_id: { $in: demoIds } }, { _id: { $regex: '^rating-demo-' } }] }),
  col('resourceViews').deleteMany({ $or: [{ user_id: { $in: demoIds } }, { _id: { $regex: '^view-demo-' } }] }),
  col('mentorProfiles').deleteMany({ _id: { $in: demoIds } }),
]);

const steps = await col('steps').find({}).toArray();
const tasksOf = (stepId: string) => (steps.find(s => s._id === stepId)?.tasks as { id: string; label: string }[] | undefined) || [];
const nameOf = (key: string) => USERS.find(u => u.key === key)!.name;
const problems = await col('problems').find({}).toArray();
const titleOf = (id: string) => (problems.find(p => p._id === id)?.title as string) || id;

for (const j of JOURNEYS) {
  const key = uid[j.user];
  await col('scopes').insertOne({ _id: key, working_problem_ids: [j.problem], category_locks: { [j.problem]: j.category }, project_notes: {} });
  for (const s of j.steps) {
    if (s.status === 'done') {
      await col('progress').insertOne({ _id: `${key}:${j.category}:${s.step}`, user_id: key, category_id: j.category, step_id: s.step, completed: true, updated_at: daysAgo(s.completed ?? 0) });
    }
    const tasks = tasksOf(s.step);
    await col('workspaces').insertOne({
      _id: `${key}::${j.problem}::${s.step}`,
      scope_key: key, problem_id: j.problem, step_id: s.step,
      status: s.status,
      started_at: daysAgo(s.started),
      ...(s.blocker ? { blocker: s.blocker } : {}),
      checklist: tasks.map((task, i) => ({ id: task.id, label: task.label, done: i < s.done, custom: false })),
      log: (s.log || []).map((text, i) => ({ id: `l-demo-${i}`, text, author_name: nameOf(j.user), created_at: daysAgo(Math.max(1, s.started - 5)) })),
      updated_at: daysAgo(s.completed ?? Math.min(s.started, 7)),
    });
  }
}
console.log(`✓ ${JOURNEYS.length} roadmap journeys`);

await col('applications').insertMany(APPLICATIONS.map(([who, startup, problem, amount, status, submitted, reviewed], i) => ({
  _id: `app-demo-${i + 1}`,
  user_id: uid[who], scope_key: uid[who],
  applicant_name: nameOf(who), applicant_email: USERS.find(u => u.key === who)!.email,
  startup_name: startup, problem_statement_id: problem, problem_title: titleOf(problem),
  pitch: `${startup} is building a solution for this clinical need, with early benchtop results and a partner hospital lined up for validation.`,
  amount_requested: amount, supporting_notes: '', status,
  submitted_at: daysAgo(submitted),
  ...(reviewed !== undefined ? { reviewed_at: daysAgo(reviewed) } : {}),
})));
console.log(`✓ ${APPLICATIONS.length} funding applications`);

const categoryOfStep = (stepId: string) => steps.find(s => s._id === stepId)?.category_id as string;
const problemOf = (who: string) => JOURNEYS.find(j => j.user === who)!.problem;
await col('submissions').insertMany(SUBMISSIONS.map(([who, step, status, submitted, reviewed], i) => ({
  _id: `sub-demo-${i + 1}`,
  step_id: stepFor(who, step), category_id: categoryOfStep(stepFor(who, step)), problem_id: problemOf(who),
  note: 'Evidence attached.', files: [],
  user_id: uid[who], scope_key: uid[who], submitted_by_name: nameOf(who),
  status, submitted_at: daysAgo(submitted),
  ...(reviewed !== undefined ? { reviewed_at: daysAgo(reviewed), admin_feedback: status === 'Approved' ? 'Looks good.' : 'Please add the signed site agreement.' } : {}),
})));
console.log(`✓ ${SUBMISSIONS.length} evidence submissions`);

await col('stepRatings').insertMany(RATINGS.map(([who, step, score, comment, d], i) => ({
  _id: `rating-demo-${i + 1}`, user_id: uid[who], step_id: stepFor(who, step), score, ...(comment ? { comment } : {}), created_at: daysAgo(d),
})));
await col('resources').deleteMany({ _id: { $regex: '^res-demo-' } });
await col('resources').insertMany(DEMO_RESOURCES.map(({ id, ...rest }) => ({ _id: id, rsvp_count: 0, ...rest })));
await col('resourceViews').insertMany(VIEWS.map(([who, res, d], i) => ({ _id: `view-demo-${i + 1}`, user_id: uid[who], resource_id: res, viewed_at: daysAgo(d) })));

await col('mentorProfiles').insertMany(Object.entries(EXPERTS).map(([key, profile]) => ({
  _id: uid[key],
  capacity: 3,
  accepting: true,
  session_days: WEEKDAYS_ALL,
  meeting_url: 'https://meet.example.com/nxt-demo',
  updated_at: daysAgo(30),
  ...profile,
})));
console.log(`✓ ratings, resource views and ${Object.keys(EXPERTS).length} experts for the public directory`);

await client.close();

console.log('\nDemo accounts (email already verified):');
console.log(`  Admin     admin@example.com  /  ${ADMIN_PASSWORD}`);
console.log(`  Members   password for all:  ${MEMBER_PASSWORD}`);
for (const u of USERS.filter(u => !u.admin)) {
  const label = u.key in EXPERTS && u.membership !== 'active' ? 'expert (free account)' : u.membership === 'active' ? (u.key in EXPERTS ? 'member + expert' : 'member') : u.membership === 'requested' ? 'awaiting approval' : 'free (not a member)';
  console.log(`    ${u.email.padEnd(20)} ${u.name.padEnd(16)} ${label}`);
}
