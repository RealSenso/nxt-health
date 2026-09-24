import {
  User, UserProgress, FundingApplication, StepSubmission, ResourceView, StepRating, StepWorkStatus,
} from '../types';

const DAY = 86_400_000;
export const daysAgo = (n: number): string => new Date(Date.now() - n * DAY).toISOString();

export const USER_EXTRAS: Record<string, Partial<User>> = {
  'user-admin-1': { created_at: daysAgo(400), last_active_at: daysAgo(0) },
  'user-member-1': {
    created_at: daysAgo(200), membership_started_at: daysAgo(192), last_active_at: daysAgo(1),
    background: 'engineering', first_time_founder: true, commitment: 'full_time', startup_stage: 'pre_seed',
    funding_raised_total: 150000, has_revenue: false, acquisition_source: 'university',
    outcomes: { pilots_signed: 0, regulatory_filings: 0, funding_raised_since_joining: 100000, updated_at: daysAgo(40) },
  },
  'user-guest-1': {
    created_at: daysAgo(40), last_active_at: daysAgo(35),
    background: 'business', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', acquisition_source: 'search',
  },
  'user-member-2': {
    created_at: daysAgo(150), membership_started_at: daysAgo(148), last_active_at: daysAgo(3),
    background: 'clinical', first_time_founder: false, commitment: 'full_time', startup_stage: 'seed',
    funding_raised_total: 1200000, has_revenue: true, acquisition_source: 'linkedin',
    outcomes: { pilots_signed: 2, regulatory_filings: 1, funding_raised_since_joining: 800000, updated_at: daysAgo(20) },
  },
  'user-member-3': {
    created_at: daysAgo(120), membership_started_at: daysAgo(110), last_active_at: daysAgo(10),
    background: 'engineering', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea',
    funding_raised_total: 0, has_revenue: false, acquisition_source: 'event',
  },
  'user-member-4': {
    created_at: daysAgo(60), last_active_at: daysAgo(58),
    background: 'engineering', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', acquisition_source: 'linkedin',
  },
  'user-member-5': {
    created_at: daysAgo(95), membership_started_at: daysAgo(90), last_active_at: daysAgo(2),
    background: 'science', first_time_founder: false, commitment: 'full_time', startup_stage: 'seed',
    funding_raised_total: 2500000, has_revenue: false, acquisition_source: 'hospital_partner',
    outcomes: { pilots_signed: 1, regulatory_filings: 0, funding_raised_since_joining: 1500000, updated_at: daysAgo(15) },
  },
  'user-member-6': {
    created_at: daysAgo(20), last_active_at: daysAgo(5),
    background: 'clinical', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', acquisition_source: 'referral',
  },
};

export const EXTRA_SEED_USERS: User[] = [
  {
    id: 'user-member-7', email: 'sofia@suturesense.it', name: 'Sofia Rossi (Founder, SutureSense)', role: 'member',
    is_member: true, password: 'demo1234', location: 'Milan, Italy', gender: 'female',
    created_at: daysAgo(80), membership_started_at: daysAgo(74), last_active_at: daysAgo(4),
    background: 'clinical', first_time_founder: true, commitment: 'full_time', startup_stage: 'pre_seed',
    funding_raised_total: 250000, has_revenue: false, acquisition_source: 'referral',
  },
  {
    id: 'user-member-8', email: 'rahul@lungbeat.in', name: 'Rahul Mehta (Founder, LungBeat)', role: 'member',
    is_member: true, password: 'demo1234', location: 'Mumbai, India', gender: 'male',
    created_at: daysAgo(45), membership_started_at: daysAgo(30), last_active_at: daysAgo(1),
    background: 'engineering', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea',
    funding_raised_total: 0, has_revenue: false, acquisition_source: 'university',
  },
  {
    id: 'user-member-9', email: 'hannah@sterivue.de', name: 'Hannah Berg (Founder, SteriVue)', role: 'member',
    is_member: true, password: 'demo1234', location: 'Berlin, Germany', gender: 'female',
    created_at: daysAgo(170), membership_started_at: daysAgo(168), last_active_at: daysAgo(0),
    background: 'business', first_time_founder: false, commitment: 'full_time', startup_stage: 'series_a_plus',
    funding_raised_total: 6000000, has_revenue: true, acquisition_source: 'event',
    outcomes: { pilots_signed: 3, regulatory_filings: 2, funding_raised_since_joining: 4000000, updated_at: daysAgo(10) },
  },
  {
    id: 'user-member-10', email: 'kwame@bilicheck.gh', name: 'Kwame Asante (Exploring Founder)', role: 'member',
    is_member: false, password: 'demo1234', location: 'Accra, Ghana', gender: 'male',
    created_at: daysAgo(10), last_active_at: daysAgo(2),
    background: 'science', first_time_founder: true, commitment: 'part_time', startup_stage: 'idea', acquisition_source: 'search',
  },
  {
    id: 'user-member-11', email: 'lucia@rapidast.mx', name: 'Lucia Gomez (Founder, RapidAST)', role: 'member',
    is_member: true, password: 'demo1234', location: 'Mexico City, Mexico', gender: 'female',
    created_at: daysAgo(30), membership_started_at: daysAgo(26), last_active_at: daysAgo(12),
    background: 'clinical', first_time_founder: true, commitment: 'full_time', startup_stage: 'idea',
    funding_raised_total: 0, has_revenue: false, acquisition_source: 'linkedin',
  },
];

interface JourneyStep {
  step: string;
  status: StepWorkStatus;
  startedDaysAgo: number;
  completedDaysAgo?: number;
  lastTouchedDaysAgo?: number;
  doneTasks: number;
  blocker?: string;
  log?: string[];
}

interface Journey {
  user: string;
  authorName: string;
  problem: string;
  category: string;
  steps: JourneyStep[];
}

export const JOURNEYS: Journey[] = [
  {
    user: 'user-member-1', authorName: 'Marcus Vance', problem: 'prob-1', category: 'cat-1',
    steps: [
      { step: 'step-dev-1', status: 'done', startedDaysAgo: 185, completedDaysAgo: 140, doneTasks: 5 },
      { step: 'step-dev-2', status: 'done', startedDaysAgo: 140, completedDaysAgo: 60, doneTasks: 5 },
      { step: 'step-dev-3', status: 'in_progress', startedDaysAgo: 60, doneTasks: 2, log: ['Protocol draft shared with Dr. Lin for feedback.'] },
    ],
  },
  {
    user: 'user-member-2', authorName: 'Priya Raman', problem: 'prob-4', category: 'cat-2',
    steps: [
      { step: 'step-dh-1', status: 'done', startedDaysAgo: 145, completedDaysAgo: 120, doneTasks: 3 },
      { step: 'step-dh-2', status: 'done', startedDaysAgo: 120, completedDaysAgo: 75, doneTasks: 5 },
      { step: 'step-dh-3', status: 'done', startedDaysAgo: 75, completedDaysAgo: 30, doneTasks: 6 },
      { step: 'step-dh-4', status: 'blocked', startedDaysAgo: 30, doneTasks: 1, blocker: 'Waiting on payer medical director meeting', lastTouchedDaysAgo: 21 },
    ],
  },
  {
    user: 'user-member-3', authorName: 'James Okafor', problem: 'prob-2', category: 'cat-1',
    steps: [
      { step: 'step-dev-1', status: 'done', startedDaysAgo: 105, completedDaysAgo: 75, doneTasks: 5 },
      { step: 'step-dev-2', status: 'in_progress', startedDaysAgo: 75, doneTasks: 1, lastTouchedDaysAgo: 45 },
    ],
  },
  {
    user: 'user-member-5', authorName: 'Diego Fernandez', problem: 'prob-6', category: 'cat-3',
    steps: [
      { step: 'step-diag-1', status: 'done', startedDaysAgo: 88, completedDaysAgo: 70, doneTasks: 3 },
      { step: 'step-diag-2', status: 'done', startedDaysAgo: 70, completedDaysAgo: 35, doneTasks: 4 },
      { step: 'step-diag-3', status: 'blocked', startedDaysAgo: 35, doneTasks: 2, blocker: 'Waiting on biobank specimen access', lastTouchedDaysAgo: 28 },
    ],
  },
  {
    user: 'user-member-7', authorName: 'Sofia Rossi', problem: 'prob-3', category: 'cat-1',
    steps: [
      { step: 'step-dev-1', status: 'done', startedDaysAgo: 70, completedDaysAgo: 40, doneTasks: 5 },
      { step: 'step-dev-2', status: 'in_progress', startedDaysAgo: 40, doneTasks: 3 },
    ],
  },
  {
    user: 'user-member-8', authorName: 'Rahul Mehta', problem: 'prob-5', category: 'cat-2',
    steps: [{ step: 'step-dh-1', status: 'in_progress', startedDaysAgo: 25, doneTasks: 1 }],
  },
  {
    user: 'user-member-9', authorName: 'Hannah Berg', problem: 'prob-2', category: 'cat-1',
    steps: [
      { step: 'step-dev-1', status: 'done', startedDaysAgo: 165, completedDaysAgo: 150, doneTasks: 5 },
      { step: 'step-dev-2', status: 'done', startedDaysAgo: 150, completedDaysAgo: 110, doneTasks: 5 },
      { step: 'step-dev-3', status: 'done', startedDaysAgo: 110, completedDaysAgo: 55, doneTasks: 6 },
      { step: 'step-dev-4', status: 'done', startedDaysAgo: 55, completedDaysAgo: 12, doneTasks: 5 },
      { step: 'step-dev-5', status: 'in_progress', startedDaysAgo: 12, doneTasks: 1 },
    ],
  },
  {
    user: 'user-member-11', authorName: 'Lucia Gomez', problem: 'prob-6', category: 'cat-3',
    steps: [{ step: 'step-diag-1', status: 'blocked', startedDaysAgo: 22, doneTasks: 1, blocker: 'Waiting on biobank specimen access', lastTouchedDaysAgo: 14 }],
  },
];

export const SEED_JOURNEY_PROGRESS: UserProgress[] = JOURNEYS.flatMap(j =>
  j.steps
    .filter(s => s.status === 'done')
    .map(s => ({ user_id: j.user, category_id: j.category, step_id: s.step, completed: true, updated_at: daysAgo(s.completedDaysAgo ?? 0) }))
);

export const SEED_JOURNEY_WORKING_PROBLEMS: Record<string, string[]> = Object.fromEntries(JOURNEYS.map(j => [j.user, [j.problem]]));

export const SEED_JOURNEY_CATEGORY_LOCKS: Record<string, Record<string, string>> = Object.fromEntries(
  JOURNEYS.map(j => [j.user, { [j.problem]: j.category }])
);

export const SEED_RESOURCE_VIEWS: ResourceView[] = [
  ['user-member-1', 'res-mr-1', 180], ['user-member-1', 'res-mr-2', 178], ['user-member-1', 'res-hosp-1', 55],
  ['user-member-1', 'res-gen-1', 50], ['user-member-3', 'res-mr-1', 100], ['user-member-7', 'res-mr-1', 68],
  ['user-member-7', 'res-mr-2', 66], ['user-member-9', 'res-mr-1', 160], ['user-member-9', 'res-hosp-2', 100],
  ['user-member-9', 'res-hosp-1', 98], ['user-member-9', 'res-reg-1', 50], ['user-member-9', 'res-gen-2', 95],
  ['user-member-2', 'res-dh-hosp-1', 70], ['user-guest-1', 'res-mr-1', 38], ['user-member-6', 'res-mr-2', 6],
  ['user-member-10', 'res-mr-1', 3],
].map(([user_id, resource_id, d]) => ({ user_id: user_id as string, resource_id: resource_id as string, viewed_at: daysAgo(d as number) }));

export const SEED_STEP_RATINGS: StepRating[] = [
  ['user-member-1', 'step-dev-1', 9, 'Deliverables list was spot on.', 140],
  ['user-member-1', 'step-dev-2', 7, undefined, 60],
  ['user-member-2', 'step-dh-1', 10, undefined, 120],
  ['user-member-2', 'step-dh-2', 8, undefined, 75],
  ['user-member-2', 'step-dh-3', 6, 'Needed more hospital IT contacts.', 30],
  ['user-member-3', 'step-dev-1', 8, undefined, 75],
  ['user-member-5', 'step-diag-1', 9, undefined, 70],
  ['user-member-5', 'step-diag-2', 5, 'Assay guidance was too generic.', 35],
  ['user-member-7', 'step-dev-1', 10, undefined, 40],
  ['user-member-9', 'step-dev-1', 9, undefined, 150],
  ['user-member-9', 'step-dev-2', 9, undefined, 110],
  ['user-member-9', 'step-dev-3', 8, undefined, 55],
  ['user-member-9', 'step-dev-4', 4, 'Regulatory section needs EU MDR detail.', 12],
].map(([user_id, step_id, score, comment, d]) => ({
  user_id: user_id as string, step_id: step_id as string, score: score as number,
  ...(comment ? { comment: comment as string } : {}), created_at: daysAgo(d as number),
}));

const submission = (
  id: string, user: string, name: string, step: string, category: string, problem: string,
  status: StepSubmission['status'], submittedDaysAgo: number, reviewedDaysAgo?: number, note = 'Evidence attached.',
): StepSubmission => ({
  id, step_id: step, category_id: category, problem_id: problem, user_id: user, submitted_by_name: name,
  note, files: [], status, submitted_at: daysAgo(submittedDaysAgo),
  ...(reviewedDaysAgo !== undefined ? { reviewed_at: daysAgo(reviewedDaysAgo) } : {}),
  ...(status !== 'Submitted' ? { admin_feedback: status === 'Approved' ? 'Looks good.' : 'Please add the signed site agreement.' } : {}),
});

export const SEED_SUBMISSIONS: StepSubmission[] = [
  submission('sub-seed-1', 'user-member-1', 'Marcus Vance', 'step-dev-1', 'cat-1', 'prob-1', 'Approved', 142, 139),
  submission('sub-seed-2', 'user-member-1', 'Marcus Vance', 'step-dev-2', 'cat-1', 'prob-1', 'Approved', 62, 58),
  submission('sub-seed-3', 'user-member-2', 'Priya Raman', 'step-dh-2', 'cat-2', 'prob-4', 'Approved', 77, 76),
  submission('sub-seed-4', 'user-member-2', 'Priya Raman', 'step-dh-3', 'cat-2', 'prob-4', 'Changes Requested', 40, 35),
  submission('sub-seed-5', 'user-member-2', 'Priya Raman', 'step-dh-3', 'cat-2', 'prob-4', 'Approved', 32, 30),
  submission('sub-seed-6', 'user-member-5', 'Diego Fernandez', 'step-diag-2', 'cat-3', 'prob-6', 'Approved', 37, 33),
  submission('sub-seed-7', 'user-member-9', 'Hannah Berg', 'step-dev-3', 'cat-1', 'prob-2', 'Changes Requested', 60, 52),
  submission('sub-seed-8', 'user-member-9', 'Hannah Berg', 'step-dev-3', 'cat-1', 'prob-2', 'Approved', 56, 55),
  submission('sub-seed-9', 'user-member-9', 'Hannah Berg', 'step-dev-4', 'cat-1', 'prob-2', 'Approved', 14, 12),
  submission('sub-seed-10', 'user-member-7', 'Sofia Rossi', 'step-dev-1', 'cat-1', 'prob-3', 'Submitted', 3),
];

const application = (
  id: string, user: string, name: string, email: string, startup: string, problem: string, problemTitle: string,
  amount: number, status: FundingApplication['status'], submittedDaysAgo: number, reviewedDaysAgo?: number,
): FundingApplication => ({
  id, user_id: user, applicant_name: name, applicant_email: email, startup_name: startup, problem_statement_id: problem,
  problem_title: problemTitle, pitch: `${startup} is building a solution for this clinical need.`, amount_requested: amount,
  supporting_notes: '', status, submitted_at: daysAgo(submittedDaysAgo),
  ...(reviewedDaysAgo !== undefined ? { reviewed_at: daysAgo(reviewedDaysAgo) } : {}),
});

export const EXTRA_SEED_APPLICATIONS: FundingApplication[] = [
  application('app-seed-2', 'user-member-2', 'Priya Raman', 'priya@neurotrack.health', 'NeuroTrack', 'prob-4',
    'Automated Triaging of Emergent Cranial CT for Acute Intracranial Hemorrhage', 200000, 'Approved', 110, 95),
  application('app-seed-3', 'user-member-9', 'Hannah Berg', 'hannah@sterivue.de', 'SteriVue', 'prob-2',
    'Sterile Field Optical Tracking for Retained Surgical Sponges and Instruments', 175000, 'Approved', 140, 128),
  application('app-seed-4', 'user-member-5', 'Diego Fernandez', 'diego@oncoscan.health', 'OncoScan', 'prob-6',
    'Rapid Antimicrobial Susceptibility Testing (AST) for Bloodstream Infections in Under 2 Hours', 300000, 'Pending', 20),
  application('app-seed-5', 'user-member-3', 'James Okafor', 'james@cardiaiq.com', 'CardiaIQ', 'prob-2',
    'Sterile Field Optical Tracking for Retained Surgical Sponges and Instruments', 90000, 'Rejected', 70, 60),
];
