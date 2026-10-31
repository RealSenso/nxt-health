// "SaMD roadmap: idea to patient (India)": ten phases from a clinical problem to a licensed product.
// Built from the Osler SaMD roadmap document (30 Oct 2026), which follows the phase order recommended by
// Dr Arjun L Balaji and adds the CDSCO Medical Device Software guidance (21 July 2026) and MDR 2017.
// A planning aid, not legal advice: classification, forms and fees must be confirmed with a regulatory adviser.
import type { RoadmapContent } from '../roadmapTypes.js';

type Task = RoadmapContent['phases'][number]['tasks'][number];
const t = (id: string, label: string, detail: string, sub_stage: string, o: Partial<Task> = {}): Task => ({
  id, label, detail, sub_stage, experts: '', resources: '', deliverable: '', depends_on: '', duration: '', owner: 'Founders', ...o,
});

export const SAMD_ROADMAP: RoadmapContent = {
  category: 'cat-samd',
  phases: [
    {
      no: 0,
      name: 'Problem',
      sub_stages: ['The problem', 'Expert check', 'Go or no-go'],
      tasks: [
        t('samd1-1', 'Write the problem statement', 'One paragraph: who is affected, what goes wrong today, what it costs in outcomes, time or money, and where in the care pathway it happens.', 'The problem', { deliverable: 'Problem statement (1 page)' }),
        t('samd1-2', 'Interview clinicians who treat the condition every day', 'Find experts in the clinical domain, preferably people who see the problem daily, and test your statement with them. Ask how often they see it, what they do today, whether software would change a decision, and who has tried before.', 'Expert check', { experts: 'Clinical domain expert (KOL)', resources: 'Interview questions in this phase', deliverable: 'Expert interview log', depends_on: 'Problem statement' }),
        t('samd1-3', 'Log every interview', 'Record who you spoke to, their specialty and years of experience, and what they said. A regulator and your later panel will both want this trail.', 'Expert check', { deliverable: 'Interview log: specialty, experience, findings' }),
        t('samd1-4', 'Establish the unmet need and scan existing solutions', 'What clinicians do today, why current options fall short, and what a better result would look like. List competitors and existing solutions.', 'The problem', { experts: 'Startup and business adviser (optional)', deliverable: 'Unmet-need summary and competitor scan' }),
        t('samd1-5', 'Decide: is this the right problem to solve?', 'You can only decide to solve a problem once you know what the actual problem is. Go or no-go before designing anything.', 'Go or no-go', { gate: 'Gate 1', deliverable: 'Go / no-go note', depends_on: 'Interview log; unmet-need summary' }),
      ],
    },
    {
      no: 1,
      name: 'Solution, intended use and claims',
      sub_stages: ['Solution type', 'Intended use', 'Claims and class'],
      tasks: [
        t('samd2-1', 'Decide the solution type', 'Standalone software (web, mobile, cloud) is classified with CDSCO Table 2. Software that drives a hardware device takes the hardware\'s class. Software embedded in a device is part of that device\'s licence. Health-tech with no medical function is likely unregulated, but check every module.', 'Solution type', { deliverable: 'Solution-type decision' }),
        t('samd2-2', 'Write the intended use statement', 'State the medical purpose, the disease and whether it is critical, serious or non-serious, the patient population, the users, the use environment, contraindications, the software platform, and for AI whether it is rule-based, machine learning or adaptive and how autonomous it is. CDSCO expects the clinical role to be clear: decision support, drives a device, or definitive diagnosis.', 'Intended use', { experts: 'Regulatory affairs consultant', deliverable: 'Intended use statement (draft)', depends_on: 'Go / no-go note' }),
        t('samd2-3', 'Draft the claims', 'The specific performance and benefit statements you will make, such as sensitivity for a finding or time saved. Keep them honest and narrow at first: each claim needs evidence later, and wider claims mean more clinical work and a higher class.', 'Claims and class', { experts: 'Clinical domain expert (KOL)', deliverable: 'Claims list' }),
        t('samd2-4', 'Classify the software and look for a predicate', 'Apply the First Schedule of MDR 2017 and Table 2, and record the rationale. Check CDSCO\'s classification lists and approved-device database. A predicate (a comparable device already approved in India) can shorten the path; a device with no predicate usually needs clinical investigation. If your product is not on the lists, request classification through the Online System for Medical Devices.', 'Claims and class', { experts: 'Regulatory affairs consultant', resources: 'CDSCO classification lists; Table 2 in the playbook', deliverable: 'Classification rationale' }),
        t('samd2-5', 'Write the basic product plan', 'A short overview and not a full design file: product plan, roadmap and strategy, the first draft of intended use and claims, and the list of quality deliverables you will need. Keep the intended use identical across website, labels, instructions, marketing and submission.', 'Claims and class', { deliverable: 'Product plan and roadmap overview' }),
        t('samd2-6', 'Agree intended use, claims and class', 'Founders and at least one regulatory or clinical adviser sign off.', 'Claims and class', { gate: 'Gate 2', experts: 'Regulatory affairs consultant; Clinical domain expert (KOL)', deliverable: 'Agreed intended use, claims and class' }),
      ],
    },
    {
      no: 2,
      name: 'Quality, compliance and the team',
      sub_stages: ['Documents', 'People', 'QMS', 'Compliance'],
      tasks: [
        t('samd3-1', 'Enlist the quality and regulatory deliverables', 'Make a controlled list of every document the lifecycle will need, with an owner and a target phase for each. Lower-risk software needs fewer. For any item that does not apply, plan a written justification rather than silently leaving it out.', 'Documents', { resources: 'Document checklist by class in the playbook', deliverable: 'Controlled document list with owners' }),
        t('samd3-2', 'Name your quality and regulatory lead', 'A hire, a consultant or a company, chosen because they have taken software or devices through a regulator before. They tell you which standards apply, set up the QMS and guide the dossier. Do this early: fixing a missing process later costs much more.', 'People', { experts: 'Quality and QMS consultant (ISO 13485)', deliverable: 'Named quality and regulatory lead' }),
        t('samd3-3', 'Set up the quality management system', 'India requires a QMS covering the whole software lifecycle: design, development, planning, configuration, deployment and maintenance. ISO 13485 is the standard everyone aligns to, with the Fifth Schedule of MDR 2017 setting the Indian requirement. Your lead decides which standards apply (for example ISO 14971, IEC 62304, IEC 82304-1, IEC 81001-5-1, IEC 62366-1, ISO/IEC 27001) and records why.', 'QMS', { experts: 'Quality and QMS consultant (ISO 13485)', resources: 'Standards list in the playbook', deliverable: 'QMS plan and procedures; applicable-standards list', depends_on: 'Named lead' }),
        t('samd3-4', 'Put the team and responsibilities in place', 'Product owner and clinical lead, software lead and developers who work under controlled processes, the quality and regulatory lead, a cybersecurity and data protection owner, and clinical advisers (next phase).', 'People', { deliverable: 'Team and responsibilities chart' }),
        t('samd3-5', 'Know the compliance overlay beyond CDSCO', 'Digital Personal Data Protection Act 2023 for consent-based patient data. ABDM alignment if you handle health records (assess which building blocks apply; it is not universally required). An Authorized Indian Agent if the manufacturer is overseas. Company registration and Startup India recognition (see the guides on this platform).', 'Compliance', { experts: 'Data privacy and legal adviser; Authorized Indian Agent (if overseas)', deliverable: 'Data-protection and hosting approach' }),
        t('samd3-6', 'The QMS exists and your lead has reviewed intended use and class', 'The document list has owners, the QMS is running, and your regulatory person has reviewed the intended use and the class.', 'QMS', { gate: 'Gate 3', deliverable: 'QMS in place; document list owned' }),
      ],
    },
    {
      no: 3,
      name: 'Clinicians and stakeholders',
      sub_stages: ['Who to involve', 'KOL panel', 'Record'],
      tasks: [
        t('samd4-1', 'List the stakeholders you need', 'Clinicians in the therapy area (workflow, relevance, reference standard, annotation), the technology team or partners, the quality and regulatory adviser, patients or lay users if they use the product, and hospital or procurement stakeholders.', 'Who to involve', { deliverable: 'Stakeholder list with what each contributes' }),
        t('samd4-2', 'Choose clinicians by therapy area and real procedure experience', 'Not by degree alone: a recent radiology graduate cannot do justice to a question on maternal and fetal ultrasound. Check where they trained and practise, since some institutions lack equipment such as robotics. For rare procedures the pool is small, so start early.', 'KOL panel', { experts: 'Clinical domain expert (KOL)', deliverable: 'KOL panel list with selection rationale' }),
        t('samd4-3', 'Build a panel diverse in experience', 'For example one clinician with about 5 years of experience, one with about 10 and one with 20. Studies in radiology and gastroenterology use the same idea (multi-reader multi-case designs). Experience changes the accuracy of annotations, so decide who sets the reference standard with that in mind.', 'KOL panel', { deliverable: 'Panel by experience level; reference-standard owner' }),
        t('samd4-4', 'Avoid convenience testing', 'Do not rely on a neighbour or a local clinic because it is convenient. Casual testing in clinics without due diligence is a common mistake and produces evidence a regulator will not accept.', 'KOL panel', { deliverable: 'Engagement plan with due diligence' }),
        t('samd4-5', 'Record each engagement properly', 'Written clinical input on intended use and claims, each clinician\'s qualifications, experience and conflicts of interest, and agreements covering confidentiality, data and (if paid) fees.', 'Record', { deliverable: 'Clinical input summary; agreements on file' }),
        t('samd4-6', 'Decide the technology team or partner', 'Feasibility, architecture, and whether similar products have been built before.', 'Who to involve', { experts: 'Technology and software architecture adviser', deliverable: 'Tech team or partner decision' }),
        t('samd4-7', 'Panel chosen and its input written into the claims', 'Your clinical panel is chosen for relevance and diversity of experience, and their input is reflected in the intended use and claims.', 'Record', { gate: 'Gate 4', deliverable: 'Updated intended use and claims' }),
      ],
    },
    {
      no: 4,
      name: 'Data, evidence and clinical strategy',
      sub_stages: ['Data', 'Evidence route', 'AI requirements', 'Ethics'],
      tasks: [
        t('samd5-1', 'Identify the data you need and where it comes from', 'Data for development, training (if AI), testing and validation, and for live operation. Decide whether each dataset comes from your own collection, hospitals, public sources, partners or licensed data. Record permissions, consent basis and ethics approval for each.', 'Data', { deliverable: 'Data plan: sources, permissions' }),
        t('samd5-2', 'Curate and protect the data', 'Define inclusion and exclusion criteria, cleaning, labelling and annotation rules, and who the annotators are. Keep the labelling guide and quality checks. Plan de-identification, access control and storage under the Digital Personal Data Protection Act 2023.', 'Data', { experts: 'Data privacy and legal adviser', deliverable: 'Curation and annotation rules' }),
        t('samd5-3', 'Pick the evidence route for each claim', 'Not every product needs its own clinical study. Options: literature and clinical background; comparison with a predicate; a retrospective performance study on existing data; a prospective clinical performance study; or a clinical investigation with CDSCO permission. The Chapter VII exemptions may apply where the Central Licensing Authority is satisfied; confirm with your adviser before relying on them.', 'Evidence route', { experts: 'Clinical evidence and biostatistics expert', deliverable: 'Evidence strategy document' }),
        t('samd5-4', 'If you use AI, plan the extra disclosures', 'The final guidance says applicants shall disclose the composition of training, validation and testing data (demographics, geography, clinical diversity), justify applicability to Indian settings if the model was built or validated abroad, show evidence on bias, generalisability and robustness across relevant sub-populations, and state whether the training data is real-world or synthetic.', 'AI requirements', { experts: 'AI/ML and data science expert', deliverable: 'AI dataset description', depends_on: 'Data plan' }),
        t('samd5-5', 'Plan ethics and governance', 'Any study using patients or their data needs approval from a registered ethics committee and valid consent or a documented waiver. Follow the ICMR national ethical guidelines and its guidance on AI in healthcare.', 'Ethics', { experts: 'Ethics and clinical research adviser', deliverable: 'Ethics and consent approach' }),
        t('samd5-6', 'Name the dataset, reference standard and evidence route for every claim', 'And your regulatory adviser agrees the route fits the class.', 'Evidence route', { gate: 'Gate 5', experts: 'Regulatory affairs consultant', deliverable: 'Evidence plan signed off' }),
      ],
    },
    {
      no: 5,
      name: 'Develop the software',
      sub_stages: ['Plan and specify', 'Build under control', 'Security', 'India setting', 'AI controls'],
      tasks: [
        t('samd6-1', 'Plan and specify', 'A software development plan covering lifecycle, roles, tools, release process and the IEC 62304 safety class (this A, B, C scale is separate from the Indian risk class). A software requirements specification traceable to intended use, safety and effectiveness. An architecture and design specification with traceability from requirement to design to test.', 'Plan and specify', { experts: 'Medical software lifecycle expert (IEC 62304)', deliverable: 'Development plan, SRS, SDS, traceability matrix' }),
        t('samd6-2', 'Build under control', 'Source-code and version control, release and configuration management, defect tracking with documented resolution, and a history of tested versions with date, number and description of changes. Justify any third-party software and any non-device functions on the same platform.', 'Build under control', { deliverable: 'Version history and release records' }),
        t('samd6-3', 'Build security in', 'Secure by design: threat modelling and an architecture review at design stage, secure defaults (unused ports and debug off), safe operation during a cyber incident, encryption in transit and at rest, access controls and audit trails, and a maintained software bill of materials (SBOM) with a process to fix known vulnerabilities. Disclose hosting: for SaaS say whether it runs on a MeitY-empanelled cloud.', 'Security', { experts: 'Cybersecurity expert', deliverable: 'Threat model, architecture review, SBOM, hosting disclosure' }),
        t('samd6-4', 'Design for the Indian setting', 'Interoperability and consent-driven data exchange aligned with the DPDP Act and, where relevant, ABDM building blocks (ABHA, facility and professional registries). Language, accessibility and workflow fit for Indian clinics with variable operator training and infrastructure.', 'India setting', { experts: 'Interoperability and ABDM architect', deliverable: 'Interoperability and usability approach' }),
        t('samd6-5', 'Add the extra controls if you use AI or ML', 'Document the method (rule-based, machine learning, neural network, fixed or adaptive) and the degree of autonomy. Keep dataset splits, training records, model versions and metrics under version control. Plan for bias, lack of explainability, model drift, poor generalisability and hallucination. Consider an Algorithm Change Protocol where it fits the risks; it is not a mandatory pre-licence document for every AI product.', 'AI controls', { experts: 'AI/ML and data science expert', deliverable: 'AI development record' }),
        t('samd6-6', 'Release candidate built under the QMS with full traceability', 'From requirement to test.', 'Build under control', { gate: 'Gate 6', deliverable: 'Release candidate' }),
      ],
    },
    {
      no: 6,
      name: 'Test, verify, validate',
      sub_stages: ['Verification and validation', 'Usability', 'Security testing', 'Evaluation'],
      tasks: [
        t('samd7-1', 'Verify that it was built right', 'Each requirement is met by design and code. Write protocols before running tests: define the pass criteria first, then run, then report. Keep test data separate from the data used to build or tune the model.', 'Verification and validation', { deliverable: 'Test plan, cases, results, traceability matrix' }),
        t('samd7-2', 'Validate the finished system', 'It works as intended in its real environment: devices, browsers, network conditions and hospital IT.', 'Verification and validation', { deliverable: 'Validation protocol and report' }),
        t('samd7-3', 'Evaluate usability, early and final', 'Formative studies find design problems while you can still fix them; a summative test shows intended users can use the product safely. Reflect Indian clinical workflows, languages, accessibility and variable operator training.', 'Usability', { experts: 'Human factors and usability expert', deliverable: 'Formative and summative usability reports' }),
        t('samd7-4', 'Test cybersecurity', 'Find and fix vulnerabilities; review the SBOM.', 'Security testing', { experts: 'Cybersecurity expert (penetration testing)', deliverable: 'Vulnerability assessment and penetration test reports' }),
        t('samd7-5', 'Run the performance or clinical evaluation', 'Show the claims are true on suitable data or patients, using the reference standard and clinician panel from earlier phases. A multi-reader design with readers of different experience is more convincing. Ethics approval and consent come first, and a formal clinical investigation needs CDSCO permission before it starts.', 'Evaluation', { experts: 'Clinical evidence and biostatistics expert', deliverable: 'Study protocol, statistical plan and report' }),
        t('samd7-6', 'For AI, test robustness and bias', 'Performance should hold across sub-populations and settings: subgroup analysis, generalisability and drift tests.', 'Evaluation', { experts: 'AI/ML and data science expert', deliverable: 'Subgroup, generalisability and drift test results' }),
        t('samd7-7', 'Give every defect a disposition', 'Unresolved defects with a justified residual risk are acceptable. Hidden ones are not.', 'Verification and validation', { gate: 'Gate 7', deliverable: 'Defect log with dispositions; results meet pre-defined criteria' }),
      ],
    },
    {
      no: 7,
      name: 'Risk and the technical dossier',
      sub_stages: ['Risk management', 'Documents to finalise', 'Review'],
      tasks: [
        t('samd8-1', 'Keep the risk management file live (ISO 14971)', 'Start it in Phase 2 and keep it updated through development and after release. Cover hazards with severity and probability, clinical risks including indirect harm from wrong, late or misleading information, usability and misuse, data, interoperability and cybersecurity, AI risks, and mitigations with residual risk.', 'Risk management', { experts: 'Risk management expert (ISO 14971)', deliverable: 'Risk management plan, file and report' }),
        t('samd8-2', 'Decide whether you need a separate hazard analysis', 'Generally expected for higher-risk software, possibly not for the lowest-risk devices. Confirm with your regulatory adviser.', 'Risk management', { experts: 'Regulatory affairs consultant', deliverable: 'Hazard analysis, or a written justification' }),
        t('samd8-3', 'Finalise instructions for use and labelling', 'Electronic IFU is recognised. Labelling should show the device and software name, version or build, manufacturer, licence number, release date, intended use, storage conditions and the Rule 44 particulars.', 'Documents to finalise', { deliverable: 'IFU and labelling' }),
        t('samd8-4', 'Assemble the technical dossier', 'Usability file, software lifecycle records, cybersecurity file, clinical or performance evaluation report with the evidence behind each claim, post-market surveillance plan (including software and AI monitoring), and QMS evidence for the manufacturing site. Where there is no public sample, create generic templates and dummy examples and have your quality lead adapt them to your class.', 'Documents to finalise', { resources: 'Document checklist by class in the playbook', deliverable: 'Technical dossier ready for review' }),
        t('samd8-5', 'Get an independent review', 'Your quality lead or an outside consultant checks the dossier is complete, consistent and aligned with the intended use.', 'Review', { gate: 'Gate 8', experts: 'Regulatory affairs consultant; Risk management expert (ISO 14971)', deliverable: 'Review report' }),
      ],
    },
    {
      no: 8,
      name: 'Submit to CDSCO and get the licence',
      sub_stages: ['Choose the route', 'Prepare the filing', 'Respond', 'Finalise'],
      tasks: [
        t('samd9-1', 'Choose the route', 'Confirm the class and whether a predicate exists in India. Test licence for trials, evaluation or demonstrations: NSWS (MD-12 manufacture, MD-16 import). Clinical investigation: MD-22 to MD-23 on the Online System for Medical Devices, before the study starts. Commercial sale: MD-3, MD-7 or MD-14. A new device with no predicate follows a separate new-device route; confirm it with your adviser or CDSCO. If you are not on the classification lists, request classification first.', 'Choose the route', { experts: 'Regulatory affairs consultant', resources: 'Licence table in the playbook; NSWS; Online System for Medical Devices', deliverable: 'Chosen route and form numbers' }),
        t('samd9-2', 'Register on the portals and assemble the dossier', 'Register on NSWS and the Online System for Medical Devices. Follow the Fourth Schedule of MDR 2017 and the CDSCO checklist for your form. Where a listed document does not apply, give a justification.', 'Prepare the filing', { deliverable: 'Filing ready to submit' }),
        t('samd9-3', 'Submit the QMS evidence', 'Domestic manufacturers: the Fifth Schedule compliance undertaking. Overseas manufacturers: the quality certificate described in the guidance, and a power of attorney to an Authorized Indian Agent. Class C and D manufacturing licences need an audit of the site before approval.', 'Prepare the filing', { experts: 'Authorized Indian Agent (if you import)', deliverable: 'QMS evidence submitted' }),
        t('samd9-4', 'Pay the fee', 'Pay on the portal challan. The amounts in the playbook are typical Second Schedule figures from a secondary source, so check the current schedule first. There is no separate government fee for software; consultants, agent retainers, security testing and hosting are your own costs.', 'Prepare the filing', { deliverable: 'Fee paid; acknowledgement' }),
        t('samd9-5', 'Respond to every regulator query', 'Expect queries: the reviewer\'s job is to find gaps. Answer each fully and on time, defend what is defensible, fix what is not, and keep a log of every query and answer.', 'Respond', { experts: 'Regulatory affairs consultant', deliverable: 'Query and response log' }),
        t('samd9-6', 'Licence in hand, labelling and claims match', 'Check the licence conditions, the approved intended use and the device list. Align label, IFU, website and promotion exactly with the approved intended use.', 'Finalise', { gate: 'Gate 9', deliverable: 'Granted licence' }),
      ],
    },
    {
      no: 9,
      name: 'Price, launch and monitor',
      sub_stages: ['Commercial track', 'Post-market duties', 'Changes'],
      tasks: [
        t('samd10-1', 'Re-evaluate competitors now that claims and class are fixed', 'Pricing and go-to-market run as a separate commercial track alongside development, owned by your marketing and sales team.', 'Commercial track', { experts: 'Market access and pricing adviser', deliverable: 'Updated competitor view' }),
        t('samd10-2', 'Define the buyer and the user', 'They are often different: hospital administration versus clinician.', 'Commercial track', { experts: 'Hospital procurement or sales expert', deliverable: 'Buyer and user map' }),
        t('samd10-3', 'Choose a pricing model and plan channels', 'Subscription, per use or per site, tested with early customers. Plan channels, pilots and sales support, and check distribution and sale registration rules with the State authority. Keep promotion inside the approved intended use.', 'Commercial track', { experts: 'Market access and pricing adviser', deliverable: 'Pricing decision and GTM plan' }),
        t('samd10-4', 'Run post-market surveillance from day one', 'Proportionate to class: complaints, performance, software defects, patch tracking and cybersecurity vulnerabilities. For AI, track model drift, error rates and safety signals and gather real-world evidence from Indian settings.', 'Post-market duties', { experts: 'Post-market surveillance and vigilance expert', deliverable: 'Post-market surveillance plan in operation' }),
        t('samd10-5', 'Know your reporting duties', 'Report a suspected unexpected serious adverse event and any recall to the licensing authority within 15 days of becoming aware, and consider the Materiovigilance Programme of India. Software approved after a clinical investigation also owes periodic safety update reports. Confirm these timelines in the Rules and your licence conditions.', 'Post-market duties', { experts: 'Post-market surveillance and vigilance expert', deliverable: 'Vigilance and recall procedure; PSUR plan if applicable' }),
        t('samd10-6', 'Control changes after approval', 'Treat every release as a possible regulatory change. A new clinical claim, a new type of data input, or a version change affecting intended use, safety, effectiveness or risk controls is a major change that needs regulatory action. Define in your QMS how each release is classified, validated and documented, and notify CDSCO where required.', 'Changes', { deliverable: 'Change-control procedure', gate: 'Gate 10' }),
      ],
    },
  ],
  playbook: {
    model: [
      { component: 'Is it regulated?', question: 'Do you intend the software for a medical purpose: diagnosis, prevention, monitoring, treatment or alleviation of disease or injury, or support of a physiological process?', output: 'Regulated or not, module by module' },
      { component: 'Risk class', question: 'Is the condition critical, serious or non-serious, and does the software treat or diagnose, drive clinical management, or inform it?', output: 'Class A, B, C or D using CDSCO Table 2' },
      { component: 'Lay users', question: 'Is it for patients or lay carers in a serious condition without specialist support?', output: 'May be treated as critical, which raises the class' },
      { component: 'Predicate', question: 'Is a comparable device already approved in India?', output: 'Shorter path, or a clinical investigation if none' },
      { component: 'AI', question: 'Is it rule-based, machine learning or adaptive, and how autonomous is it?', output: 'Which AI disclosures and monitoring apply' },
    ],
    cost_inputs: [
      { category: 'Test licence (manufacture)', input: 'MD-12', why: 'To run trials, evaluation or demonstrations', approach: 'About INR 500 per device (verify the current Second Schedule)' },
      { category: 'Manufacture, Class A or B', input: 'MD-3', why: 'Commercial sale', approach: 'About INR 5,000 per site + INR 500 per device' },
      { category: 'Manufacture, Class C or D', input: 'MD-7', why: 'Commercial sale; site audit required', approach: 'About INR 50,000 per site + INR 1,000 per device' },
      { category: 'Import, Class A to D', input: 'MD-14', why: 'Overseas manufacturers selling in India', approach: 'About USD 1,000 to 3,000 per site + USD 50 to 1,500 per device by class' },
      { category: 'Clinical investigation', input: 'MD-22', why: 'Pilot or pivotal study permission', approach: 'About INR 100,000' },
      { category: 'Your own costs', input: 'Consultants, agent retainer, security testing, hosting', why: 'There is no separate government fee for software', approach: 'Quote with your regulatory adviser early' },
    ],
    how_to_use: [
      'Intended use drives everything. It decides whether the software is regulated at all, its risk class, the evidence you need and the documents you file. Write it early, in draft, and refine it.',
      'Enlist before you finish. In the early phases you need the list of documents, their owners and a basic plan, not finished documents. Complete them as development progresses.',
      'Get to about 80%, then defend. A regulator or auditor will always find gaps, which is their job. Reach a solid, defensible position and let the reviewer push you the rest of the way. Over-building to 100% first sets an even higher bar.',
      'A naming note: India\'s final guidance (21 July 2026) uses one umbrella term, Medical Device Software (MDSW), covering standalone software, software in hardware and IVD software. Where this roadmap says SaMD, it means standalone MDSW.',
      'This is a planning aid, not legal advice. Fees, forms, timelines and the class grid come partly from secondary sources: confirm each with a regulatory adviser against the official CDSCO text, and re-check whenever CDSCO issues a clarification.',
    ],
  },
};

/** The expert whose working session set the phase order of this roadmap. */
export const SAMD_CONTRIBUTOR = {
  name: 'Dr Arjun L Balaji',
  title: 'Global Senior Clinical Expert',
  linkedin: 'https://www.linkedin.com/in/arjunlb/',
  note: 'The phase order, the clinician-panel advice, the evidence and documentation approach and the "80%, then defend" principle in this roadmap come from a recorded working session with Dr Arjun on 29 October 2026.',
};
