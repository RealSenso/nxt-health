export type UserRole = 'admin' | 'member';
export type MembershipStatus = 'none' | 'requested' | 'active' | 'declined';
export type Gender = 'female' | 'male' | 'other' | 'prefer_not_to_say';

export type FounderBackground = 'clinical' | 'engineering' | 'science' | 'business' | 'other';
export type Commitment = 'full_time' | 'part_time';
export type StartupStage = 'idea' | 'pre_seed' | 'seed' | 'series_a_plus';
export type AcquisitionSource = 'referral' | 'linkedin' | 'university' | 'event' | 'search' | 'hospital_partner' | 'other';

export interface FounderOutcomes {
  pilots_signed: number;
  regulatory_filings: number;
  funding_raised_since_joining: number;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /** Derived on the client: active membership or admin. */
  is_member: boolean;
  membership_status: MembershipStatus;
  membership_requested_at?: string;
  is_mentor?: boolean;
  email_verified?: boolean;
  saved_problem_ids?: string[];
  team_id?: string | null;
  location?: string;
  gender?: Gender;
  created_at?: string;
  membership_started_at?: string;
  last_active_at?: string;
  background?: FounderBackground;
  first_time_founder?: boolean;
  commitment?: Commitment;
  startup_stage?: StartupStage;
  funding_raised_total?: number;
  has_revenue?: boolean;
  acquisition_source?: AcquisitionSource;
  outcomes?: FounderOutcomes;
}

export interface ResourceView {
  user_id: string;
  resource_id: string;
  viewed_at: string;
}

export interface StepRating {
  user_id: string;
  step_id: string;
  score: number;
  comment?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  member_ids: string[];
  created_at: string;
  tagline?: string;
  website?: string;
  is_public?: boolean;
}

export interface TeamInvite {
  id: string;
  team_id: string;
  team_name: string;
  from_uid: string;
  from_name: string;
  to_email: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
}

export interface ProblemStatement {
  id: string;
  title: string;
  description: string;
  department: string;
  funded: boolean;
  funding_amount?: string;
  /** The person who posted the problem. */
  sponsor_name?: string;
  sponsor_linkedin?: string;
  sponsor_photo_url?: string;
  created_by_admin: string;
  created_at: string;
}

export type ApplicationStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected';

export interface FundingApplication {
  id: string;
  user_id: string;
  applicant_name: string;
  applicant_email: string;
  startup_name: string;
  problem_statement_id: string;
  problem_title?: string;
  pitch: string;
  amount_requested: number;
  supporting_notes: string;
  status: ApplicationStatus;
  admin_feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
  scope_key?: string;
}

export type Complexity = 'low' | 'moderate' | 'high' | 'very_high';

export interface CategoryPlaybook {
  model: { component: string; question: string; output: string }[];
  cost_inputs: { category: string; input: string; why: string; approach: string }[];
  how_to_use: string[];
}

export interface Category {
  id: string;
  name: string;
  /** What a startup in this category builds. */
  description: string;
  example?: string;
  order: number;
  /** Listed for founders to see, but not open to start yet. */
  coming_soon?: boolean;
  /** 1–6 for the categories open today. */
  priority?: number;
  complexity?: Complexity;
  complexity_note?: string;
  roadmap_note?: string;
  playbook?: CategoryPlaybook;
}

/** One row of a roadmap checklist. */
export interface StepTask {
  id: string;
  label: string;
  detail: string;
  sub_stage: string;
  experts: string;
  resources: string;
  deliverable: string;
  depends_on: string;
  duration: string;
  gate?: string;
  owner: string;
}

export interface Step {
  id: string;
  category_id: string;
  name: string;
  description: string;
  order: number;
  stage_tag?: string;
  /** Planned work for the step; when present it replaces the generic checklist. */
  tasks?: StepTask[];
  typical_duration?: string;
  /** What a founder is expected to spend on this step, in rupees. Set by admins, informed by what founders report. */
  expected_cost_inr?: number;
  locked?: boolean;
}

export type ResourceType = 'session' | 'webinar' | 'seminar' | 'hospital_connection';

export interface Resource {
  id: string;
  step_id: string;
  type: ResourceType;
  title: string;
  description: string;
  link?: string;
  date?: string;
  host_or_speaker?: string;
  hospital_name?: string;
  clinical_department?: string;
  contact_person?: string;
  contact_email?: string;
  pilot_status?: string;
  assigned_user_id?: string;
  assigned_problem_id?: string;
  /** Machine-readable start time for RSVP deadlines and calendar invites; `date` stays a display label. */
  starts_at?: string;
  capacity?: number | null;
  rsvp_count?: number;
  slots?: string[];
  slot_minutes?: number;
  /** Set when a non-member receives only a preview of this item. */
  locked?: boolean;
}

export interface Rsvp {
  id: string;
  resource_id: string;
  user_id: string;
  user_name: string;
  created_at: string;
}

export interface Booking {
  id?: string;
  resource_id: string;
  slot: string;
  user_id?: string;
  user_name?: string;
}

export interface UserProgress {
  user_id: string;
  category_id: string;
  step_id: string;
  completed: boolean;
  updated_at: string;
}

export type NotificationType =
  | 'application_status' | 'submission_review' | 'team_invite' | 'membership' | 'message' | 'mentorship' | 'event' | 'inquiry';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export type SubmissionStatus = 'Submitted' | 'Approved' | 'Changes Requested';

export type StepWorkStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';

export interface StepChecklistItem {
  id: string;
  label: string;
  done: boolean;
  custom: boolean;
}

export interface StepLogEntry {
  id: string;
  text: string;
  author_name: string;
  created_at: string;
}

export interface StepWorkspace {
  status: StepWorkStatus;
  started_at?: string;
  target_date?: string;
  blocker?: string;
  /** What the founder reports having spent on this step, in rupees. */
  spent_inr?: number;
  checklist: StepChecklistItem[];
  log: StepLogEntry[];
  updated_at: string;
}

export interface SubmissionFile {
  file_id: string;
  name: string;
  size: number;
  type: string;
}

export interface StepSubmission {
  id: string;
  step_id: string;
  category_id: string;
  problem_id: string;
  user_id: string;
  scope_key?: string;
  submitted_by_name: string;
  note: string;
  files: SubmissionFile[];
  status: SubmissionStatus;
  admin_feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
}

export interface Thread {
  id: string;
  subject: string;
  context: { type: 'application' | 'submission' | 'mentorship' | 'consultation'; id: string };
  scope_key?: string;
  participant_uids: string[];
  admin_visible: boolean;
  last_message_at: string;
  last_message_preview: string;
  unread?: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  author_uid: string;
  author_name: string;
  author_is_admin: boolean;
  body: string;
  created_at: string;
}

export interface MentorProfile {
  id: string;
  name: string;
  headline?: string;
  bio?: string;
  expertise_stages?: string[];
  category_ids?: string[];
  background?: FounderBackground;
  user_background?: FounderBackground;
  availability?: string;
  capacity?: number;
  accepting?: boolean;
  active_mentees: number;
  has_profile: boolean;
  /** Public expert listing and paid sessions */
  rate_usd?: number;
  photo_url?: string;
  topics?: string[];
  expert_areas?: string[];
  fits_gates?: number[];
  book_when?: string[];
  session_days?: number[];
  session_times?: string[];
  /** Private video-call link — only present on your own profile (or for admins). */
  meeting_url?: string;
}

/** An onboarded expert shown in the list: name, role and LinkedIn. */
export interface ListedExpert {
  id: string;
  name: string;
  title: string;
  linkedin: string;
  photo_url?: string;
}

/** The full public profile of a listed expert. */
export interface ListedExpertProfile extends ListedExpert {
  photo_url: string;
  bio: string;
  specialisation: string;
  organisation: string;
  city: string;
  years_experience: string;
  credentials: string;
  languages: string;
  how_to_help: string;
}

export type ProblemVote = 'agree' | 'disagree';
export type VoteBreakdown = { problem_id: string; agree: number; disagree: number; members: number; guests: number }[];
export type VoteTally = Record<string, { agree: number; disagree: number }>;

export interface PublicExpert {
  id: string;
  name: string;
  headline: string;
  bio: string;
  topics: string[];
  expert_areas: string[];
  fits_gates: number[];
  book_when: string[];
  rate_usd: number;
  photo_url: string;
  open_slots: number;
}

export interface Inquiry {
  id: string;
  kind: 'lead' | 'expert';
  role?: string;
  name?: string;
  email: string;
  linkedin?: string;
  focus?: string;
  message: string;
  status: 'new' | 'handled';
  created_at: string;
}

export type MentorRequestStatus = 'pending' | 'accepted' | 'declined' | 'ended';

export interface MentorRequest {
  id: string;
  mentor_uid: string;
  mentor_name: string;
  founder_uid: string;
  founder_name: string;
  message: string;
  status: MentorRequestStatus;
  thread_id?: string;
  created_at: string;
}

export type ConsultationStatus = 'awaiting_payment' | 'paid' | 'cancelled';

export interface Consultation {
  id: string;
  mentor_uid: string;
  mentor_name: string;
  founder_uid: string;
  founder_name: string;
  /** Session length. Older bookings recorded whole hours instead. */
  minutes?: number;
  hours?: number;
  /** Start time (ISO, UTC) */
  slot?: string;
  rate_usd: number;
  amount_usd: number;
  expert_share_usd?: number;
  topic: string;
  preferred_time?: string;
  status: ConsultationStatus;
  thread_id?: string;
  /** Video-call link, shared once the booking is paid. */
  meeting_url?: string;
  paid_at?: string;
  created_at: string;
}

export interface PublicProfileSettings {
  is_public: boolean;
  headline?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  show_location?: boolean;
  show_background?: boolean;
  show_startup_stage?: boolean;
  show_team?: boolean;
}

export interface PublicFounder {
  id: string;
  name: string;
  is_public: boolean;
  headline: string;
  bio: string;
  website: string;
  linkedin: string;
  location: string;
  background: string;
  startup_stage: string;
  is_mentor: boolean;
  team: { id: string; name: string } | null;
}

export interface PublicTeam {
  id: string;
  name: string;
  tagline: string;
  website: string;
  is_public: boolean;
  member_count: number;
  members: { id: string; name: string; headline: string; has_public_profile: boolean }[];
}
