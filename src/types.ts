export type UserRole = 'admin' | 'member';
export type Gender = 'female' | 'male' | 'other' | 'prefer_not_to_say';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_member: boolean;
  password?: string;
  team_id?: string;
  location?: string;
  gender?: Gender;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  member_ids: string[];
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
}

export interface UserProgress {
  user_id: string;
  category_id: string;
  step_id: string;
  completed: boolean;
  updated_at: string;
}

export type NotificationType = 'application_status' | 'submission_review' | 'team_invite';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
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
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

export interface StepSubmission {
  id: string;
  step_id: string;
  category_id: string;
  problem_id: string;
  user_id: string;
  submitted_by_name: string;
  note: string;
  files: SubmissionFile[];
  status: SubmissionStatus;
  admin_feedback?: string;
  submitted_at: string;
  reviewed_at?: string;
}
