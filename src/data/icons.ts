import type { LucideIcon } from 'lucide-react';
import {
  Cpu, Smartphone, TestTubeDiagonal, Scissors, MonitorSmartphone, BrainCircuit, Watch, ClipboardList,
  Syringe, Microscope, HeartHandshake, Dna, ShieldPlus, HandHeart, Eye, Stethoscope, HeartPulse, Activity,
  Wind, Bug, Layers, Baby, Ribbon, Network, Workflow, GraduationCap, Server, Cable, Database, Bot, Pill,
  FlaskConical, Radar, BookOpenText, Waypoints, ScanSearch, Gem,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Open now
  'cat-marketplace-network': Network,
  'cat-healthcare-services': HeartHandshake,
  'cat-patient-education': BookOpenText,
  'cat-workflow-ops-tech': Workflow,
  'cat-training-simulation': GraduationCap,
  'cat-clinical-infrastructure': Server,
  // Coming soon
  'cat-preventive-consumer': ShieldPlus,
  'cat-interoperability': Cable,
  'cat-data-intelligence': Database,
  'cat-digital-health': Smartphone,
  'cat-remote-monitoring': MonitorSmartphone,
  'cat-wearables': Watch,
  'cat-ai-decision-support': BrainCircuit,
  'cat-digital-therapeutics': Pill,
  'cat-diagnostics-service': ScanSearch,
  'cat-clinical-trial-tech': ClipboardList,
  'cat-medical-device': Cpu,
  'cat-samd': Waypoints,
  'cat-ivd': TestTubeDiagonal,
  'cat-ai-ml-device': Bot,
  'cat-robotics': Scissors,
  'cat-biomaterials': Gem,
  'cat-drug-device': Syringe,
  'cat-therapeutics-biotech': Dna,
  'cat-care-service': HandHeart,
};

export function categoryIcon(categoryId: string | null | undefined): LucideIcon {
  return (categoryId && CATEGORY_ICONS[categoryId]) || Layers;
}

const DEPARTMENT_KEYWORDS: [RegExp, LucideIcon][] = [
  [/critical care|icu|cardio/i, HeartPulse],
  [/surg/i, Scissors],
  [/neonat|pediatric/i, Baby],
  [/emergency|neuro/i, BrainCircuit],
  [/pulmon|respir/i, Wind],
  [/infect|microbio/i, Bug],
  [/oncol/i, Ribbon],
  [/radiol|imaging/i, Activity],
];

export function departmentIcon(department: string): LucideIcon {
  return DEPARTMENT_KEYWORDS.find(([re]) => re.test(department))?.[1] || Stethoscope;
}
