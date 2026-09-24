import type { LucideIcon } from 'lucide-react';
import {
  Cpu, Smartphone, TestTubeDiagonal, Scissors, MonitorSmartphone, Droplets, BrainCircuit, Watch,
  Accessibility, ClipboardList, Syringe, Bone, Microscope, Baby, Ribbon, HeartHandshake, Ambulance,
  Dna, ShieldPlus, HandHeart, Eye, Stethoscope, HeartPulse, Activity, Wind, Bug, Layers,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'cat-1': Cpu,
  'cat-2': Smartphone,
  'cat-3': TestTubeDiagonal,
  'cat-4': Scissors,
  'cat-5': MonitorSmartphone,
  'cat-6': Droplets,
  'cat-7': BrainCircuit,
  'cat-8': Watch,
  'cat-9': Accessibility,
  'cat-10': ClipboardList,
  'cat-11': Syringe,
  'cat-12': Bone,
  'cat-13': Microscope,
  'cat-14': Baby,
  'cat-15': Ribbon,
  'cat-16': HeartHandshake,
  'cat-17': Ambulance,
  'cat-18': Dna,
  'cat-19': ShieldPlus,
  'cat-20': HandHeart,
  'cat-21': Eye,
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
