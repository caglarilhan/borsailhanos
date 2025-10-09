export function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function buildICS(opts: {
  title: string;
  description?: string;
  start: string; // ISO like 2025-10-06T14:00:00
  durationMinutes?: number;
  url?: string;
}): string {
  const dt = new Date(opts.start);
  const y = dt.getUTCFullYear();
  const m = pad2(dt.getUTCMonth() + 1);
  const d = pad2(dt.getUTCDate());
  const hh = pad2(dt.getUTCHours());
  const mm = pad2(dt.getUTCMinutes());
  const ss = pad2(dt.getUTCSeconds());
  const dtStart = `${y}${m}${d}T${hh}${mm}${ss}Z`;

  const end = new Date(dt.getTime() + (opts.durationMinutes ?? 50) * 60 * 1000);
  const y2 = end.getUTCFullYear();
  const m2 = pad2(end.getUTCMonth() + 1);
  const d2 = pad2(end.getUTCDate());
  const hh2 = pad2(end.getUTCHours());
  const mm2 = pad2(end.getUTCMinutes());
  const ss2 = pad2(end.getUTCSeconds());
  const dtEnd = `${y2}${m2}${d2}T${hh2}${mm2}${ss2}Z`;

  const uid = `mt-${Date.now()}@mindtrack`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MindTrack//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(opts.title)}`,
    opts.description ? `DESCRIPTION:${escapeICS(opts.description)}` : undefined,
    opts.url ? `URL:${escapeICS(opts.url)}` : undefined,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean) as string[];
  return lines.join('\r\n');
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}




