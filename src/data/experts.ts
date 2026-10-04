import type { Consultation } from '../types';

export const EXPERT_AREAS = [
  'Medical devices', 'Clinical validation', 'Regulatory', 'Hospital pilots', 'Market access', 'Funding and grants', 'AI and digital health',
] as const;

/** The five stages every founder works through, as named on the home page. */
export const GATES = ['Find a problem', 'Apply for funding', 'Pick a roadmap', 'Clear each gate', 'Get matched help'] as const;

export const WEEKDAYS = [
  { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' }, { id: 3, label: 'Wed' }, { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' }, { id: 6, label: 'Sat' }, { id: 0, label: 'Sun' },
];

/** Sessions are scheduled in India Standard Time. */
export const SESSION_TZ = 'Asia/Kolkata';

const dayParts = (iso: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: SESSION_TZ, weekday: 'short', day: 'numeric', month: 'short' }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find(p => p.type === type)?.value || '';
  return `${get('weekday')} ${get('day')} ${get('month')}`;
};

/** "2026-10-06" in IST — used to group slots by day. */
export const istDateKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: SESSION_TZ });
/** "Tue 6 Oct" */
export const istDayLabel = dayParts;
/** "11:30" */
export const istTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { timeZone: SESSION_TZ, hour: '2-digit', minute: '2-digit', hour12: false });

export const formatRate = (usd: number) => (usd === 0 ? 'Free' : `$${usd}`);
export const bookingMinutes = (c: Pick<Consultation, 'minutes' | 'hours'>) => c.minutes ?? (c.hours ?? 1) * 60;
export const initials = (name: string) =>
  name.replace(/^(dr|prof)\.?\s+/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
