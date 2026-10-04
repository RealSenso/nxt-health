/** Expert sessions are offered at fixed clock times in India Standard Time (UTC+5:30, no daylight saving). */
const IST_OFFSET_MINUTES = 330;
export const SESSION_TIMEZONE = 'Asia/Kolkata';
export const HOLD_MINUTES = 30;

/**
 * The bookable start times (ISO, UTC) for an expert who offers the given weekdays (0 = Sunday … 6 = Saturday)
 * and clock times ("HH:MM", IST) over the next `horizonDays` days. Times closer than `leadMinutes` are dropped.
 */
export function upcomingSlots(
  days: number[],
  times: string[],
  from = Date.now(),
  horizonDays = 14,
  leadMinutes = 120,
): string[] {
  if (!days.length || !times.length) return [];
  const local = new Date(from + IST_OFFSET_MINUTES * 60_000);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  const date = local.getUTCDate();
  const sortedTimes = [...times].sort();
  const slots: string[] = [];
  for (let i = 0; i < horizonDays; i++) {
    const dayStart = Date.UTC(year, month, date + i);
    if (!days.includes(new Date(dayStart).getUTCDay())) continue;
    for (const time of sortedTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const utc = dayStart + (hours * 60 + minutes - IST_OFFSET_MINUTES) * 60_000;
      if (utc >= from + leadMinutes * 60_000) slots.push(new Date(utc).toISOString());
    }
  }
  return slots;
}
