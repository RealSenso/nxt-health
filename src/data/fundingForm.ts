export type QuestionType = 'text' | 'long' | 'select' | 'multi' | 'number' | 'url' | 'checkbox';

export interface Question {
  id: string;
  label: string;
  help?: string;
  type: QuestionType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface FormSection {
  id: string;
  title: string;
  intro: string;
  questions: Question[];
}

/** Ids whose answers are also stored in the application's own fields. */
export const CORE_FIELDS = ['applicant_name', 'applicant_email', 'startup_name', 'pitch', 'amount_requested', 'supporting_notes'] as const;

const STAGES = ['Idea', 'Prototype built', 'Pilot running', 'First customers', 'Revenue', 'Scaling'];

/**
 * The application reads as a pitch in six chapters, answered one question at a time:
 * who you are, the problem, what you built, who pays, the ask, and the sign-off.
 */
export const FUNDING_FORM: FormSection[] = [
  {
    id: 'you',
    title: 'You',
    intro: 'Funders back people first. Start with who is behind this.',
    questions: [
      { id: 'applicant_name', label: 'What is your name?', type: 'text', required: true },
      { id: 'applicant_email', label: 'Where can we reach you?', help: 'The email we will write to about this application.', type: 'text', required: true },
      { id: 'startup_name', label: 'What is your venture called?', type: 'text', required: true },
      { id: 'role', label: 'What is your role in it?', type: 'select', options: ['Founder or co-founder', 'Chief executive', 'Chief technology or product', 'Clinical lead', 'Other'] },
      { id: 'background_summary', label: 'Why are you the person to solve this?', help: 'Your training, roles and how close you are to the problem: treating these patients, living with the condition, or working where it happens.', type: 'long', required: true },
      { id: 'linkedin', label: 'Where can we read more about you?', type: 'url', placeholder: 'LinkedIn or a personal page' },
    ],
  },
  {
    id: 'problem',
    title: 'The problem',
    intro: 'Show us you understand the problem, not just the idea.',
    questions: [
      { id: 'problem_view', label: 'What is going wrong, and for whom?', type: 'long', required: true },
      { id: 'how_you_know', label: 'How do you know it is real?', help: 'Interviews, data, your own experience, published studies.', type: 'long', required: true },
      { id: 'people_spoken_to', label: 'How many patients, clinicians or buyers have you spoken to?', type: 'number' },
      { id: 'current_alternatives', label: 'What do people do about it today?', type: 'long' },
    ],
  },
  {
    id: 'solution',
    title: 'What you built',
    intro: 'What it is, why it is better and how far along it is.',
    questions: [
      { id: 'one_liner', label: 'Say it in one sentence.', type: 'text', required: true },
      { id: 'pitch', label: 'How does it work, and how does it fix the problem?', type: 'long', required: true },
      { id: 'differentiator', label: 'Why is it better than what exists?', type: 'long', required: true },
      { id: 'solution_type', label: 'What kind of solution is it?', help: 'Pick all that apply.', type: 'multi', options: ['Physical device', 'Software or app', 'AI or algorithm', 'Diagnostic test', 'Service or care model', 'Drug or therapeutic', 'Platform or marketplace', 'Other'] },
      { id: 'startup_stage', label: 'Where are you today?', type: 'select', options: STAGES, required: true },
      { id: 'results', label: 'What have you proven so far?', help: 'Pilots, users, revenue, letters of intent. Numbers are best.', type: 'long' },
      { id: 'regulated', label: 'Will it need regulatory approval?', help: 'A first view is enough. Healthcare products need a route to approval.', type: 'select', options: ['Yes', 'No', 'Not sure yet'] },
    ],
  },
  {
    id: 'market',
    title: 'Who pays',
    intro: 'The customer, the money and the team that will get you there.',
    questions: [
      { id: 'customer', label: 'Who is your first paying customer?', type: 'long', required: true },
      { id: 'payer', label: 'Who ultimately pays?', type: 'select', options: ['Patient', 'Hospital or clinic', 'Insurer', 'Employer', 'Government', 'Pharma or industry', 'Not decided'] },
      { id: 'revenue_model', label: 'How will you make money?', type: 'long' },
      { id: 'team_members', label: 'Who is on the team, and what does each person do?', type: 'long' },
      { id: 'team_gaps', label: 'What skills is your team missing?', type: 'long' },
    ],
  },
  {
    id: 'funding',
    title: 'The ask',
    intro: 'What you want from us and what it will have bought.',
    questions: [
      { id: 'amount_requested', label: 'How much are you asking for? (USD)', type: 'number', required: true },
      { id: 'use_of_funds', label: 'Where will the money go?', help: 'Rough lines with amounts, for example build, testing, regulatory, pilots.', type: 'long', required: true },
      { id: 'milestones', label: 'What will be true when it is spent?', help: 'The milestones you will reach, and when.', type: 'long', required: true },
      { id: 'support_needed', label: 'Besides money, what would help most?', help: 'Pick all that apply.', type: 'multi', options: ['Clinical validation', 'Regulatory guidance', 'Hospital pilot access', 'Introductions to experts', 'Fundraising help', 'Technical help', 'Commercial strategy'] },
      { id: 'supporting_notes', label: 'Anything else we should know?', type: 'long' },
    ],
  },
  {
    id: 'declaration',
    title: 'Sign-off',
    intro: 'Read it back, then confirm.',
    questions: [
      { id: 'declare_accurate', label: 'I confirm that the information in this application is accurate to the best of my knowledge.', type: 'checkbox', required: true },
      { id: 'declare_share', label: 'I agree that SirOsler may share this application with its review panel, experts and the sponsor of this problem.', type: 'checkbox', required: true },
    ],
  },
];

export type Answers = Record<string, string | string[]>;

export const isAnswered = (value: string | string[] | undefined): boolean =>
  Array.isArray(value) ? value.length > 0 : !!value && value.trim() !== '' && value !== 'false';

export const sectionComplete = (section: FormSection, answers: Answers): boolean =>
  hasRequired(section) && section.questions.filter(q => q.required).every(q => isAnswered(answers[q.id]));

/** A section is only ticked when it has required fields and every one is filled. */
export const hasRequired = (section: FormSection): boolean => section.questions.some(q => q.required);

export const missingRequired = (answers: Answers): { section: FormSection; question: Question }[] =>
  FUNDING_FORM.flatMap(section => section.questions.filter(q => q.required && !isAnswered(answers[q.id])).map(question => ({ section, question })));

