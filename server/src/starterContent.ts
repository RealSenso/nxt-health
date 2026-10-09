// Starting content, loaded or refreshed by an admin via POST /api/admin/starter-content.
// The categories come from the NXT Platform "Categories" sheet in Google Drive. Roadmap steps are built
// from a checklist that is imported separately (see roadmapTypes.ts) and is deliberately not in this repository.
import type { RoadmapContent } from './roadmapTypes.js';

type Doc = Record<string, unknown> & { id: string };

export const STARTER_PROBLEMS: Doc[] = [
  {
    id: 'prob-womens-psychological',
    title: 'In women, what is “psychological” and what is not?',
    description: [
      'I am a 9-to-5 professional. I love movies, travel, life and, most of all, my wife. I love my mom too, and of course, my sisters.',
      'Over the years, I have noticed something that bothers me.',
      'Women are often told that what they are experiencing is “psychological”. Sometimes by others. Sometimes, after hearing it enough times, they start believing it themselves.',
      'And the problem is that by the time many women finally seek medical help, they may have already suffered for far too long.',
      'So I have a question: Can we solve this?',
      'If you are working on a solution to help women recognise what is actually happening to them and get the right help at the right time, I would genuinely be happy!',
      'I can offer (only when I am free) my perspective, ask questions, give feedback, review what you are building or simply help as a husband, son, brother and fellow human being.',
      '— Ashwath',
    ].join('\n\n'),
    department: "Women's Health",
    funded: false,
  },
  {
    id: 'prob-migraine',
    title: 'Solve Migraine',
    description: [
      'I have lived with migraine for most of my life.',
      'I know the medicines are available. I also know the long list of things friends and family will tell you to do: stay in the dark, drink coffee, drink water, hydrate, eat a proper meal, sleep.',
      'And yes, medicines can work. But when a migraine attack hits, trust me, nothing else really works. You just want it to stop.',
      'So here’s my question: is it possible to create a truly foolproof solution for migraine, something that works every single time? Maybe a device, sunglasses, a cap!',
      'Ideally, something non-invasive. Because not everyone wants to keep reaching for medication every time an attack happens.',
      'I am a creative professional. I can help with the brand, communication, user perspective or simply give you feedback from someone who has lived with migraine for years.',
      '— Vinit Singh',
    ].join('\n\n'),
    department: 'Neurology',
    funded: false,
  },
];


type Complexity = 'low' | 'moderate' | 'high' | 'very_high';

interface CategoryDef {
  slug: string;
  name: string;
  /** What the startup builds. */
  description: string;
  example: string;
  complexity?: Complexity;
  complexity_note?: string;
}

/**
 * The 25 solution types. The first six (the "green" priority list) are open to founders;
 * the rest are listed as coming soon, ordered from lowest to highest complexity.
 */
const CATEGORY_DEFS: CategoryDef[] = [
  { slug: 'marketplace-network', name: 'Marketplace / Network', description: 'Connects healthcare participants', example: 'Specialist network, doctor-startup network', complexity: 'low', complexity_note: 'Low regulatory burden; mainly business, technology, contracts and operations' },
  { slug: 'healthcare-services', name: 'Healthcare Services', description: 'Solves problem through people/process rather than technology', example: 'Specialty care management, home healthcare', complexity: 'low', complexity_note: 'Primarily service design, clinical governance, staffing and operations' },
  { slug: 'patient-education', name: 'Patient Education / Engagement', description: 'Improves understanding/adherence/behaviour', example: 'Regional-language disease education', complexity: 'low', complexity_note: 'Usually low regulatory complexity unless making medical claims' },
  { slug: 'workflow-ops-tech', name: 'Workflow / Operational Tech', description: 'Removes inefficiency from healthcare operations', example: 'Bed management, OT scheduling, inventory optimisation', complexity: 'low', complexity_note: 'Usually non-medical software; focus is integration, security, procurement' },
  { slug: 'training-simulation', name: 'Training / Simulation', description: 'Improves clinician capability', example: 'VR surgical training, simulation systems', complexity: 'low', complexity_note: 'Relatively straightforward unless making clinical/diagnostic claims' },
  { slug: 'clinical-infrastructure', name: 'Clinical Infrastructure / Platform', description: 'Infrastructure enabling healthcare delivery', example: 'Clinical trial platform, hospital integration platform', complexity: 'low', complexity_note: 'More technical/integration complexity, but generally limited medical-device regulation' },

  { slug: 'preventive-consumer', name: 'Preventive / Consumer Health', description: 'Addresses health before it becomes a clinical problem', example: 'Screening, risk assessment, lifestyle platform', complexity: 'moderate', complexity_note: 'Depends heavily on claims' },
  { slug: 'interoperability', name: 'Interoperability / Infrastructure', description: 'Makes different healthcare systems communicate', example: 'HL7/FHIR integration, health-data exchange', complexity: 'moderate', complexity_note: 'Technically complex, regulatory burden usually moderate' },
  { slug: 'data-intelligence', name: 'Data / Intelligence Platform', description: 'Converts healthcare data into usable intelligence', example: 'Population health analytics, clinical intelligence', complexity: 'moderate', complexity_note: 'Data governance, privacy, validation become important' },
  { slug: 'digital-health', name: 'Digital Health / HealthTech', description: 'Software that improves healthcare delivery', example: 'Patient management platform, hospital workflow software', complexity: 'moderate', complexity_note: 'Depends on whether it crosses into medical function' },

  { slug: 'remote-monitoring', name: 'Remote Patient Monitoring', description: 'Continuous/periodic collection of patient data outside hospital', example: 'Wearable monitoring BP, ECG, SpO₂', complexity: 'high', complexity_note: 'Hardware + software + clinical monitoring + potentially device regulation' },
  { slug: 'wearables', name: 'Wearables', description: 'Sensors worn on or attached to the body', example: 'CGM, smart patch, cardiac monitor', complexity: 'high', complexity_note: 'Hardware, sensors, validation; regulatory status varies' },
  { slug: 'ai-decision-support', name: 'AI for Clinical Decision Support', description: 'AI assists clinicians without necessarily making the final decision', example: 'Treatment recommendation, risk prediction', complexity: 'high', complexity_note: 'Evidence, clinical validation and potentially SaMD/device regulation' },
  { slug: 'digital-therapeutics', name: 'Digital Therapeutics', description: 'Software delivers an evidence-based therapeutic intervention', example: 'Digital CBT, diabetes management programme', complexity: 'high', complexity_note: 'Clinical evidence becomes much more important' },
  { slug: 'diagnostics-service', name: 'Diagnostics-as-a-Service', description: 'Provides diagnostic capability as a service', example: 'Mobile diagnostic screening', complexity: 'high', complexity_note: 'Diagnostic equipment + trained personnel + quality/regulatory requirements' },
  { slug: 'clinical-trial-tech', name: 'Research / Clinical Trial Tech', description: 'Makes research faster/cheaper', example: 'Patient recruitment, trial data platform, decentralised trials', complexity: 'high', complexity_note: 'GxP/clinical-trial requirements depending on function' },

  { slug: 'medical-device', name: 'Medical Device', description: 'Physical device used for diagnosis, monitoring or treatment', example: 'Portable ECG, infusion device, surgical device', complexity: 'very_high', complexity_note: 'Design controls, testing, QMS, regulatory approval, manufacturing' },
  { slug: 'samd', name: 'SaMD', description: 'Software that itself performs a medical function', example: 'AI radiology diagnosis, clinical decision support', complexity: 'very_high', complexity_note: 'Software lifecycle + clinical evidence + cybersecurity + regulation' },
  { slug: 'ivd', name: 'IVD / Diagnostic Test', description: 'Tests a biological sample to diagnose/monitor disease', example: 'Blood test, molecular diagnostic, biomarker test', complexity: 'very_high', complexity_note: 'Analytical + clinical performance + regulatory + manufacturing' },
  { slug: 'ai-ml-device', name: 'AI/ML in Medical Device', description: 'AI embedded into a device or medical software', example: 'AI detecting diabetic retinopathy from retinal images', complexity: 'very_high', complexity_note: 'Device regulation + AI validation/data/model lifecycle' },
  { slug: 'robotics', name: 'Robotics / Automation', description: 'Automates or augments clinical procedures', example: 'Surgical robot, rehabilitation robot', complexity: 'very_high', complexity_note: 'Hardware + software + safety + clinical validation' },
  { slug: 'biomaterials', name: 'Biomaterials / Advanced Materials', description: 'New material solves a clinical problem', example: 'Bioadhesive, wound dressing, implant material', complexity: 'very_high', complexity_note: 'Materials science + biocompatibility + manufacturing + clinical evidence' },
  { slug: 'drug-device', name: 'Drug-Device Combination', description: 'Drug + device work together', example: 'Drug-eluting stent, inhaler + drug', complexity: 'very_high', complexity_note: 'Multiple regulatory domains' },
  { slug: 'therapeutics-biotech', name: 'Therapeutics / Biotech', description: 'Develops a biological/pharmaceutical intervention', example: 'Cell therapy, gene therapy, biologic', complexity: 'very_high', complexity_note: 'Discovery → preclinical → clinical trials → manufacturing → regulatory' },

  // Listed in the categories sheet but not yet rated on the complexity sheet.
  { slug: 'care-service', name: 'Care-as-a-Service', description: 'Delivers an entire care pathway', example: 'Chronic disease management' },
];

/** How many of the first categories are open to founders (the six priority "green" categories). */
export const LIVE_CATEGORY_COUNT = 6;

/** Categories that are open because they have a checklist written for them, in addition to the first six. */
const DEDICATED_ROADMAP_SLUGS = ['medical-device', 'samd'];
/** Of those, the ones whose checklist is complete and are open to founders. Medical Device opens once its full checklist is imported. */
const OPEN_DEDICATED_SLUGS = ['samd'];

const categoryId = (slug: string) => `cat-${slug}`;

export const STARTER_CATEGORIES: Doc[] = CATEGORY_DEFS.map((def, index) => {
  const dedicated = DEDICATED_ROADMAP_SLUGS.includes(def.slug);
  const live = index < LIVE_CATEGORY_COUNT || OPEN_DEDICATED_SLUGS.includes(def.slug);
  return {
    id: categoryId(def.slug),
    name: def.name,
    description: def.description,
    example: def.example,
    order: index + 1,
    coming_soon: !live,
    ...(index < LIVE_CATEGORY_COUNT ? { priority: index + 1 } : {}),
    ...(def.complexity ? { complexity: def.complexity, complexity_note: def.complexity_note } : {}),
    ...(live && !dedicated && index > 0
      ? { roadmap_note: 'This starter roadmap is built from the Marketplace checklist. A checklist written for this category is coming.' }
      : {}),
  };
});

/**
 * Parses a checklist duration such as "1–2 weeks", "3–5 days" or "1 week" into [min, max] working weeks.
 * "Ongoing" and anything unrecognised returns null.
 */
export function durationInWeeks(text: string): [number, number] | null {
  const match = text.match(/^(\d+)(?:[–-](\d+))?\+?\s*(day|week|month)s?$/i);
  if (!match) return null;
  const unit = { day: 1 / 5, week: 1, month: 4 }[match[3].toLowerCase() as 'day' | 'week' | 'month'];
  const low = Number(match[1]) * unit;
  return [low, Number(match[2] ?? match[1]) * unit];
}

/** Id of the category whose checklist the roadmap content is written for. */
export const ROADMAP_SOURCE_CATEGORY = 'cat-marketplace-network';

/** One roadmap step per checklist phase: for the category the checklist names, or else for every open category without a checklist of its own. */
export function buildRoadmapSteps(roadmap: RoadmapContent): Doc[] {
  const own = new Set(DEDICATED_ROADMAP_SLUGS.map(categoryId));
  const targets = roadmap.category
    ? STARTER_CATEGORIES.filter(c => c.id === roadmap.category)
    : STARTER_CATEGORIES.filter(c => !c.coming_soon && !own.has(String(c.id)));
  return targets.flatMap(category =>
    roadmap.phases.map(phase => {
      const weeks = phase.tasks.map(t => durationInWeeks(t.duration)).filter((w): w is [number, number] => !!w);
      const low = Math.max(1, Math.round(weeks.reduce((n, w) => n + w[0], 0)));
      const high = Math.max(low, Math.round(weeks.reduce((n, w) => n + w[1], 0)));
      return {
        id: `step-${String(category.id).replace(/^cat-/, '')}-${phase.no}`,
        category_id: category.id,
        name: phase.name,
        description: `${phase.tasks.length} tasks · ${phase.sub_stages.join(' · ')}`,
        order: phase.no + 1,
        stage_tag: phase.name,
        typical_duration: low === high ? `about ${low} week${low === 1 ? '' : 's'} of work` : `about ${low}–${high} weeks of work`,
        tasks: phase.tasks,
      };
    }),
  );
}

/** The sheets include no events or hospital partners yet, so there are no starter resources. */
export const STARTER_RESOURCES: Doc[] = [];

/** Ids from earlier starter content that the current content replaces. */
export const OBSOLETE_CATEGORY_ID = /^cat-\d+$/;
/** The six sample problem statements that were never in the Drive sheets (prob-1 … prob-6). */
export const OBSOLETE_PROBLEM_ID = /^prob-[1-6]$/;
