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
const YES_NO = ['Yes', 'No'];

export const FUNDING_FORM: FormSection[] = [
  {
    id: 'you',
    title: 'About you',
    intro: 'Tell us who is applying and how to reach you.',
    questions: [
      { id: 'applicant_name', label: 'Your full name', type: 'text', required: true },
      { id: 'applicant_email', label: 'Contact email', type: 'text', required: true },
      { id: 'phone', label: 'Phone or WhatsApp number', type: 'text' },
      { id: 'city', label: 'City and country you are based in', type: 'text' },
      { id: 'linkedin', label: 'LinkedIn profile', type: 'url', placeholder: 'https://www.linkedin.com/in/…' },
      { id: 'role', label: 'What is your role in the venture?', type: 'select', options: ['Founder or co-founder', 'Chief executive', 'Chief technology or product', 'Clinical lead', 'Other'] },
    ],
  },
  {
    id: 'background',
    title: 'Your background',
    intro: 'Funders back people first. Help us understand yours.',
    questions: [
      { id: 'profession', label: 'What is your profession or training?', type: 'select', options: ['Doctor or clinician', 'Nurse or allied health', 'Engineer or technologist', 'Scientist or researcher', 'Business or operations', 'Designer', 'Other'] },
      { id: 'years_experience', label: 'Years of professional experience', type: 'number' },
      { id: 'background_summary', label: 'Summarise your experience in a few sentences', help: 'Roles, organisations, anything relevant to this problem.', type: 'long', required: true },
      { id: 'prior_ventures', label: 'Have you built or run a venture before?', type: 'select', options: ['No, this is my first', 'Yes, it was not funded', 'Yes, it raised funding', 'Yes, it had an exit'] },
      { id: 'prior_detail', label: 'If yes, what happened?', type: 'long' },
      { id: 'close_to_problem', label: 'How close are you to this problem personally or professionally?', help: 'For example, you treat these patients, you have lived with the condition, or you work in the hospital where it happens.', type: 'long' },
    ],
  },
  {
    id: 'startup',
    title: 'Your venture',
    intro: 'The company or team behind the application.',
    questions: [
      { id: 'startup_name', label: 'Venture or company name', type: 'text', required: true },
      { id: 'one_liner', label: 'What does it do, in one sentence?', type: 'text', required: true },
      { id: 'startup_stage', label: 'Where are you today?', type: 'select', options: STAGES, required: true },
      { id: 'legal_entity', label: 'Is the venture a registered company?', type: 'select', options: ['Not yet', 'Private limited company', 'LLP', 'Other registration', 'Outside India'] },
      { id: 'dpiit', label: 'Is it recognised under Startup India (DPIIT)?', type: 'select', options: ['Yes', 'No', 'Applied', 'Not applicable'] },
      { id: 'website', label: 'Website or demo link', type: 'url' },
      { id: 'founded', label: 'When did you start working on this?', type: 'text', placeholder: 'Month and year' },
    ],
  },
  {
    id: 'problem',
    title: 'The problem',
    intro: 'Show us you understand the problem, not just the idea.',
    questions: [
      { id: 'problem_view', label: 'In your own words, what is the problem and who has it?', type: 'long', required: true },
      { id: 'how_you_know', label: 'How do you know this problem is real?', help: 'Interviews, data, your own experience, published studies.', type: 'long', required: true },
      { id: 'people_spoken_to', label: 'How many patients, clinicians or buyers have you spoken to?', type: 'number' },
      { id: 'current_alternatives', label: 'What do people do about it today?', type: 'long' },
      { id: 'why_now', label: 'Why is this the right time to solve it?', type: 'long' },
    ],
  },
  {
    id: 'solution',
    title: 'Your solution',
    intro: 'What you are building and why it is better.',
    questions: [
      { id: 'pitch', label: 'Describe your solution', help: 'What it is, how it works and how it solves the problem for the people who have it.', type: 'long', required: true },
      { id: 'differentiator', label: 'What makes it different from what exists?', type: 'long', required: true },
      { id: 'solution_type', label: 'What kind of solution is it?', type: 'multi', options: ['Physical device', 'Software or app', 'AI or algorithm', 'Diagnostic test', 'Service or care model', 'Drug or therapeutic', 'Platform or marketplace', 'Other'] },
      { id: 'maturity', label: 'How far along is the product?', type: 'select', options: ['Concept', 'Design or mock-ups', 'Working prototype', 'Tested with users', 'Used in a real setting', 'Selling'], required: true },
      { id: 'ip', label: 'Intellectual property', help: 'Patents filed or planned, trade secrets, trademarks, or none yet.', type: 'long' },
    ],
  },
  {
    id: 'team',
    title: 'Your team',
    intro: 'Who is building this with you.',
    questions: [
      { id: 'team_size', label: 'How many people work on this?', type: 'number' },
      { id: 'team_members', label: 'List the core team and what each person does', type: 'long' },
      { id: 'full_time', label: 'How many are working on this full time?', type: 'number' },
      { id: 'clinical_advisor', label: 'Do you have a clinical advisor or champion?', type: 'select', options: ['Yes', 'No, looking for one'] },
      { id: 'team_gaps', label: 'What skills is your team missing?', type: 'long' },
    ],
  },
  {
    id: 'traction',
    title: 'Evidence and traction',
    intro: 'What you have already proven.',
    questions: [
      { id: 'pilots', label: 'Pilots, trials or studies done or underway', type: 'long' },
      { id: 'users', label: 'Number of users or patients reached so far', type: 'number' },
      { id: 'revenue', label: 'Revenue to date (INR), if any', type: 'number' },
      { id: 'letters', label: 'Letters of intent, partnerships or hospital agreements', type: 'long' },
      { id: 'results', label: 'What results do you have so far?', help: 'Numbers are best: accuracy, time saved, outcomes, satisfaction.', type: 'long' },
    ],
  },
  {
    id: 'regulatory',
    title: 'Regulation and safety',
    intro: 'Healthcare products need a route to approval. A first view is enough.',
    questions: [
      { id: 'regulated', label: 'Do you think the product is a regulated medical device or software?', type: 'select', options: ['Yes', 'No', 'Not sure yet'] },
      { id: 'risk_class', label: 'If you know it, what class do you expect?', type: 'select', options: ['Class A', 'Class B', 'Class C', 'Class D', 'Not applicable', 'Not sure'] },
      { id: 'regulatory_plan', label: 'What is your plan for approvals and clinical evidence?', type: 'long' },
      { id: 'data_handling', label: 'Will you handle patient data? How will you protect it?', type: 'long' },
      { id: 'safety_risks', label: 'What could go wrong for a patient, and how would you limit it?', type: 'long' },
    ],
  },
  {
    id: 'market',
    title: 'Market and business model',
    intro: 'Who pays, how much, and how you will reach them.',
    questions: [
      { id: 'customer', label: 'Who is your first paying customer?', type: 'long', required: true },
      { id: 'payer', label: 'Who ultimately pays?', type: 'select', options: ['Patient', 'Hospital or clinic', 'Insurer', 'Employer', 'Government', 'Pharma or industry', 'Not decided'] },
      { id: 'revenue_model', label: 'How will you make money?', type: 'long' },
      { id: 'market_size', label: 'How big is the opportunity?', help: 'A realistic estimate and where it comes from.', type: 'long' },
      { id: 'go_to_market', label: 'How will you reach your first customers?', type: 'long' },
    ],
  },
  {
    id: 'funding',
    title: 'The funding',
    intro: 'What you are asking for and how it will be used.',
    questions: [
      { id: 'amount_requested', label: 'Amount you are asking for (USD)', type: 'number', required: true },
      { id: 'use_of_funds', label: 'How will you spend it?', help: 'Break it into lines with rough amounts, for example build, testing, regulatory, pilots.', type: 'long', required: true },
      { id: 'milestones', label: 'What will be true when the money is spent?', help: 'The milestones you will reach and when.', type: 'long', required: true },
      { id: 'timeline_months', label: 'Months to reach those milestones', type: 'number' },
      { id: 'other_funding', label: 'Other funding raised or applied for', type: 'long' },
      { id: 'co_funding', label: 'Can you contribute any of your own money or in-kind support?', type: 'long' },
    ],
  },
  {
    id: 'support',
    title: 'Risks and support',
    intro: 'Be honest. It helps us help you.',
    questions: [
      { id: 'top_risks', label: 'What are the three biggest risks to this working?', type: 'long' },
      { id: 'support_needed', label: 'What support would help you most from NXT Health?', type: 'multi', options: ['Clinical validation', 'Regulatory guidance', 'Hospital pilot access', 'Introductions to experts', 'Fundraising help', 'Technical help', 'Commercial strategy'] },
      { id: 'supporting_notes', label: 'Anything else we should know?', type: 'long' },
    ],
  },
  {
    id: 'commitment',
    title: 'Commitment',
    intro: 'What you can give to the programme.',
    questions: [
      { id: 'hours_per_week', label: 'Hours per week you can give to this', type: 'number' },
      { id: 'start_when', label: 'When could you start?', type: 'select', options: ['Immediately', 'Within a month', 'Within three months', 'Later'] },
      { id: 'reporting', label: 'Are you willing to share monthly progress updates with NXT Health?', type: 'select', options: YES_NO },
    ],
  },
  {
    id: 'declaration',
    title: 'Review and declaration',
    intro: 'Check your answers, then confirm.',
    questions: [
      { id: 'declare_accurate', label: 'I confirm that the information in this application is accurate to the best of my knowledge.', type: 'checkbox' },
      { id: 'declare_share', label: 'I agree that NXT Health may share this application with its review panel, experts and the sponsor of this problem statement.', type: 'checkbox' },
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
