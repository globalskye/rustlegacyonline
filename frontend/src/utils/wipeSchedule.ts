// Default: Full wipe Friday 19:00 MSK, Partial Tuesday 19:00 MSK (16:00 UTC)
const DEFAULT_FULL = { weekday: 5, hour: 16, minute: 0 };
const DEFAULT_PARTIAL = { weekday: 2, hour: 16, minute: 0 };

export interface WipeScheduleInput {
  weekday: number;
  hour: number;
  minute: number;
}

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

/** locale: 'en' | 'ru' — для отображения даты на языке сайта. config — из API site-config */
export function getWipeInfo(locale?: string, config?: { fullWipe?: WipeScheduleInput; partialWipe?: WipeScheduleInput }): WipeInfo {
  const full = config?.fullWipe || DEFAULT_FULL;
  const partial = config?.partialWipe || DEFAULT_PARTIAL;
  const nextFull = getNextOccurrence(full.weekday, full.hour, full.minute);
  const nextPartial = getNextOccurrence(partial.weekday, partial.hour, partial.minute);
  const now = new Date();
  const msUntilFull = nextFull.getTime() - now.getTime();
  const msUntilPartial = nextPartial.getTime() - now.getTime();

  const loc = locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : undefined;
  const formatTime = (d: Date) =>
    d.toLocaleString(loc, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

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
