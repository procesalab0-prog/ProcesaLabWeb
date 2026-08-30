function escapeText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function compactDate(date) {
  return String(date).replace(/-/g, '');
}

function addMinutes(date, time, minutes) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute + minutes));
  return {
    date: value.toISOString().slice(0, 10),
    time: value.toISOString().slice(11, 16),
  };
}

function buildIcs(event, now = new Date()) {
  const datePart = compactDate(event.date);
  let dtStart;
  let dtEnd;

  if (event.time) {
    const end = addMinutes(event.date, event.time, 60);
    dtStart = `DTSTART:${datePart}T${event.time.replace(':', '')}00`;
    dtEnd = `DTEND:${compactDate(end.date)}T${end.time.replace(':', '')}00`;
  } else {
    const end = addMinutes(event.date, '00:00', 24 * 60);
    dtStart = `DTSTART;VALUE=DATE:${datePart}`;
    dtEnd = `DTEND;VALUE=DATE:${compactDate(end.date)}`;
  }

  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ProcesaLab//Calendario//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@procesalab`,
    `DTSTAMP:${stamp}`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeText(event.title)}`,
    event.notes ? `DESCRIPTION:${escapeText(event.notes)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].filter((line) => line !== '').join('\r\n') + '\r\n';
}

module.exports = { buildIcs };
