// Full wipe: every Friday 17:00 MSK (UTC+3) = 14:00 UTC
// Partial wipe: every Tuesday 18:00 MSK (UTC+3) = 15:00 UTC
const FRIDAY = 5;
const TUESDAY = 2;
const FULL_WIPE_UTC_H = 14;  // 17:00 MSK
const FULL_WIPE_UTC_M = 0;
const PARTIAL_WIPE_UTC_H = 15; // 18:00 MSK
const PARTIAL_WIPE_UTC_M = 0;

function getNextOccurrence(weekday: number, hourUTC: number, minUTC: number): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const daysUntil = (weekday - day + 7) % 7;
  const isToday = daysUntil === 0;
  const pastToday = isToday && (now.getUTCHours() > hourUTC || (now.getUTCHours() === hourUTC && now.getUTCMinutes() >= minUTC));
  const daysToAdd = pastToday ? 7 : daysUntil === 0 && !pastToday ? 0 : daysUntil;
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + daysToAdd);
  next.setUTCHours(hourUTC, minUTC, 0, 0);
  return next;
}

export interface WipeInfo {
  nextFull: Date;
  nextPartial: Date;
  msUntilFull: number;
  msUntilPartial: number;
  fullLocal: string;
  partialLocal: string;
  countdownFull: string;
  countdownPartial: string;
}

export function getWipeInfo(): WipeInfo {
  const nextFull = getNextOccurrence(FRIDAY, FULL_WIPE_UTC_H, FULL_WIPE_UTC_M);
  const nextPartial = getNextOccurrence(TUESDAY, PARTIAL_WIPE_UTC_H, PARTIAL_WIPE_UTC_M);
  const now = new Date();
  const msUntilFull = nextFull.getTime() - now.getTime();
  const msUntilPartial = nextPartial.getTime() - now.getTime();

  const formatTime = (d: Date) =>
    d.toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return '—';
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
  };

  return {
    nextFull,
    nextPartial,
    msUntilFull,
    msUntilPartial,
    fullLocal: formatTime(nextFull),
    partialLocal: formatTime(nextPartial),
    countdownFull: formatCountdown(msUntilFull),
    countdownPartial: formatCountdown(msUntilPartial),
  };
}
