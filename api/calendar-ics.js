const { isValidSession } = require('../lib/session');
const { readJSON } = require('../lib/store');

const PATH = 'data/calendar.json';

function escapeText(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function addOneDay(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

module.exports = async (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).send('No autorizado');
    return;
  }

  const { id } = req.query || {};
  if (!id) {
    res.status(400).send('Falta el parámetro id');
    return;
  }

  let event;
  try {
    const events = await readJSON(PATH, []);
    event = events.find((e) => e.id === id);
  } catch (err) {
    res.status(500).send('Error al leer el calendario: ' + String(err));
    return;
  }

  if (!event) {
    res.status(404).send('Evento no encontrado');
    return;
  }

  const datePart = event.date.replace(/-/g, '');
  let dtStart;
  let dtEnd;

  if (event.time) {
    const timePart = event.time.replace(':', '') + '00';
    dtStart = `DTSTART:${datePart}T${timePart}`;
    dtEnd = `DTEND:${datePart}T${timePart}`; // simple 0-length; most apps default to a visible block anyway
  } else {
    const nextDay = addOneDay(event.date).replace(/-/g, '');
    dtStart = `DTSTART;VALUE=DATE:${datePart}`;
    dtEnd = `DTEND;VALUE=DATE:${nextDay}`;
  }

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ProcesaLab//Calendario//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@procesalab`,
    dtStart,
    dtEnd,
    `SUMMARY:${escapeText(event.title)}`,
    event.notes ? `DESCRIPTION:${escapeText(event.notes)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="evento.ics"');
  res.status(200).send(ics);
};
