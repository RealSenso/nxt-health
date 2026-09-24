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

export interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface Step {
  id: string;
  category_id: string;
  name: string;
  description: string;
  order: number;
  stage_tag?: string;
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
  | 'application_status' | 'submission_review' | 'team_invite' | 'membership' | 'message' | 'mentorship' | 'event';

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
  context: { type: 'application' | 'submission' | 'mentorship'; id: string };
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
