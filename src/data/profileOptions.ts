import { AcquisitionSource, Commitment, FounderBackground, StartupStage } from '../types';

export const BACKGROUND_OPTIONS: { value: FounderBackground; label: string }[] = [
  { value: 'clinical', label: 'Clinical (MD, RN, allied health)' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'science', label: 'Science / research' },
  { value: 'business', label: 'Business / operations' },
  { value: 'other', label: 'Other' },
];

export const SOURCE_OPTIONS: { value: AcquisitionSource; label: string }[] = [
  { value: 'referral', label: 'Friend or colleague' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'university', label: 'University / accelerator' },
  { value: 'event', label: 'Conference or event' },
  { value: 'hospital_partner', label: 'Partner hospital' },
  { value: 'search', label: 'Search engine' },
  { value: 'other', label: 'Other' },
];

export const STAGE_OPTIONS: { value: StartupStage; label: string }[] = [
  { value: 'idea', label: 'Idea' },
  { value: 'pre_seed', label: 'Pre-seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a_plus', label: 'Series A+' },
];

export const COMMITMENT_OPTIONS: { value: Commitment; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
];

export const labelFor = <T extends string>(options: { value: T; label: string }[], value: T | undefined): string =>
  options.find(o => o.value === value)?.label.split(' (')[0] || 'Not provided';
