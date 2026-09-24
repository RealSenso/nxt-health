export interface StepGuide {
  typicalDuration: string;
  whyItMatters: string;
  deliverables: string[];
  exitCriteria: string[];
  pitfalls: string[];
  whoToTalkTo: string[];
}

const GUIDES: Record<string, StepGuide> = {
  'Discovery': {
    typicalDuration: '1–3 months',
    whyItMatters: 'Most medtech startups fail because they solve a problem clinicians do not prioritise or budget for. Discovery de-risks everything downstream.',
    deliverables: [
      'Conduct 20+ clinician and stakeholder interviews',
      'Map the current standard of care and its cost',
      'Size the addressable market (TAM / SAM / SOM)',
      'Run a freedom-to-operate and prior-art search',
      'Write a one-page need statement signed off by a clinical champion',
    ],
    exitCriteria: [
      'At least one clinical champion willing to co-develop',
      'Evidence that the problem costs the hospital measurable money or outcomes',
      'No blocking patents in your intended design space',
    ],
    pitfalls: [
      'Interviewing only friendly doctors — include nurses, procurement, and administrators',
      'Designing a solution before the need statement is validated',
    ],
    whoToTalkTo: ['Department heads', 'Charge nurses', 'Hospital procurement / VAC members', 'IP attorney'],
  },
  'Engineering': {
    typicalDuration: '3–6 months',
    whyItMatters: 'A low-fidelity prototype proves the core mechanism works before you spend on design controls and regulated development.',
    deliverables: [
      'Define user needs and design inputs',
      'Build a benchtop proof-of-concept',
      'Run feasibility tests against key performance metrics',
      'Start a design history file (DHF)',
      'Get clinician feedback on the prototype',
    ],
    exitCriteria: [
      'Core mechanism works on the bench against target specs',
      'Design inputs are traceable to user needs',
    ],
    pitfalls: [
      'Over-engineering before feasibility is proven',
      'Skipping documentation — retrofitting a DHF later is expensive',
    ],
    whoToTalkTo: ['Biomedical engineers', 'Rapid-prototyping labs', 'Clinical champion'],
  },
  'Hardware MVP': {
    typicalDuration: '4–8 months',
    whyItMatters: 'The MVP is the first version that looks and behaves like the final product, enabling realistic usability and analytical testing.',
    deliverables: [
      'Freeze MVP architecture and bill of materials',
      'Build 5–10 functional units',
      'Complete electrical safety pre-checks (IEC 60601)',
      'Run internal verification tests',
    ],
    exitCriteria: ['Units pass internal verification', 'BOM cost within target for commercial pricing'],
    pitfalls: ['Choosing components with long lead times or end-of-life risk'],
    whoToTalkTo: ['Contract engineering firms', 'Component suppliers', 'Test labs'],
  },
  'Software Engineering': {
    typicalDuration: '3–6 months',
    whyItMatters: 'Health software must be secure, auditable, and interoperable from day one — hospitals will not pilot software that fails a security review.',
    deliverables: [
      'Design a HIPAA-compliant architecture',
      'Implement audit logging and role-based access',
      'Build the MVP with FHIR/HL7 integration points',
      'Complete a penetration test or security review',
      'Start SOC 2 readiness',
    ],
    exitCriteria: ['Passes a hospital IT security questionnaire', 'MVP runs end-to-end on synthetic patient data'],
    pitfalls: ['Storing PHI before a BAA is in place', 'Building custom integrations instead of standards (FHIR)'],
    whoToTalkTo: ['Hospital CISO / IT security', 'EHR integration teams', 'Compliance consultants'],
  },
  'Assay Dev': {
    typicalDuration: '6–12 months',
    whyItMatters: 'Analytical performance (sensitivity, specificity, limit of detection) is the foundation of any diagnostic claim.',
    deliverables: [
      'Define target analyte and clinical cut-offs',
      'Establish limit of detection and linearity',
      'Run precision / reproducibility studies',
      'Assess interfering substances',
    ],
    exitCriteria: ['Analytical sensitivity and specificity meet target product profile'],
    pitfalls: ['Using contrived samples only — secure real specimens early'],
    whoToTalkTo: ['Clinical lab directors', 'Biobanks', 'Assay development CROs'],
  },
  'Clinical Validation': {
    typicalDuration: '6–18 months',
    whyItMatters: 'Clinical evidence is what regulators, hospitals, and payers ultimately buy. This step often takes the longest — plan for it.',
    deliverables: [
      'Write the clinical study protocol',
      'Obtain IRB approval',
      'Sign a site agreement with a partner hospital',
      'Enroll participants and collect data',
      'Complete usability / human-factors testing',
      'Write the clinical study report',
    ],
    exitCriteria: [
      'Primary endpoint met with statistical significance',
      'Usability study shows no critical use errors',
      'Clinical champion willing to publish or present results',
    ],
    pitfalls: [
      'Under-powered sample sizes — get a biostatistician involved early',
      'Slow site activation — start contracting with hospitals in parallel with IRB',
    ],
    whoToTalkTo: ['Hospital research offices', 'IRB coordinators', 'Biostatisticians', 'CROs'],
  },
  'Regulatory': {
    typicalDuration: '6–12 months',
    whyItMatters: 'Clearance is the legal gate to selling. The right pathway choice can save a year and millions of dollars.',
    deliverables: [
      'Confirm device classification and regulatory pathway',
      'Identify predicate devices (if 510(k))',
      'Hold an FDA Pre-Submission (Q-Sub) meeting',
      'Implement an ISO 13485 quality management system',
      'Compile and file the submission',
    ],
    exitCriteria: ['Submission accepted for review', 'QMS audit-ready'],
    pitfalls: ['Skipping the Pre-Sub', 'Treating the QMS as paperwork rather than a real process'],
    whoToTalkTo: ['Regulatory consultants', 'FDA CDRH reviewers (via Q-Sub)', 'Notified bodies (EU)'],
  },
  'Manufacturing': {
    typicalDuration: '4–9 months',
    whyItMatters: 'Scaling from tens to thousands of units without quality failures requires a validated manufacturing process.',
    deliverables: [
      'Select a contract manufacturer (CMO)',
      'Complete design transfer',
      'Run process validation (IQ / OQ / PQ)',
      'Set up supplier quality agreements',
    ],
    exitCriteria: ['First production lot passes release testing', 'Unit cost at or below target'],
    pitfalls: ['Single-sourcing critical components'],
    whoToTalkTo: ['CMOs', 'Supply-chain advisors', 'Quality engineers'],
  },
  'Commercialization': {
    typicalDuration: '6–12 months',
    whyItMatters: 'Hospitals buy through committees. A clear value story and champion network turn clearance into revenue.',
    deliverables: [
      'Build a hospital ROI / value analysis model',
      'Prepare a Value Analysis Committee (VAC) dossier',
      'Secure first paying pilot or purchase order',
      'Define pricing and sales model',
    ],
    exitCriteria: ['At least one signed purchase agreement', 'Repeatable sales playbook documented'],
    pitfalls: ['Selling to clinicians only — procurement and finance hold the budget'],
    whoToTalkTo: ['VAC members', 'Group purchasing organisations (GPOs)', 'Hospital CFOs'],
  },
  'Reimbursement': {
    typicalDuration: '6–18 months',
    whyItMatters: 'Without a payment pathway, providers cannot afford to adopt — even clinically superior products stall.',
    deliverables: [
      'Identify existing CPT / HCPCS codes',
      'Build a health-economic model',
      'Engage payers and medical directors',
      'Plan for new code application if needed',
    ],
    exitCriteria: ['Clear billing pathway for the first customers'],
    pitfalls: ['Assuming a code exists without verifying coverage policies'],
    whoToTalkTo: ['Reimbursement consultants', 'Payer medical directors', 'Hospital billing teams'],
  },
  'Global Access': {
    typicalDuration: '6–12 months per market',
    whyItMatters: 'International markets diversify revenue but each has distinct regulatory and distribution requirements.',
    deliverables: [
      'Prioritise target countries',
      'Map local regulatory requirements (CE, CDSCO, PMDA, etc.)',
      'Select distribution partners',
      'Localise labelling and training material',
    ],
    exitCriteria: ['Regulatory approval in at least one additional market'],
    pitfalls: ['Expanding before the home market is repeatable'],
    whoToTalkTo: ['In-country regulatory agents', 'Distributors', 'Trade commissions'],
  },
};

const FALLBACK: StepGuide = {
  typicalDuration: '1–6 months',
  whyItMatters: 'Each milestone builds the evidence and assets investors, hospitals, and regulators look for.',
  deliverables: ['Define what "done" means for this step', 'Complete the core work', 'Document the outcome and evidence'],
  exitCriteria: ['Evidence reviewed and approved by an admin'],
  pitfalls: ['Moving on without documenting decisions'],
  whoToTalkTo: ['Your clinical champion', 'Platform mentors'],
};

export function getStepGuide(stageTag?: string): StepGuide {
  return (stageTag && GUIDES[stageTag]) || FALLBACK;
}
