const { isValidSession } = require('../lib/session');
const { readJSON } = require('../lib/store');
const { buildIcs } = require('../lib/ics');

const PATH = 'data/calendar.json';

module.exports = async (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).send('No autorizado');
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    const id = String((req.query && req.query.id) || '');
    if (!id) {
      res.status(400).send('Falta el parámetro id');
      return;
    }

    const events = await readJSON(PATH, []);
    const event = events.find((item) => item.id === id);
    if (!event) {
      res.status(404).send('Evento no encontrado');
      return;
    }

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="evento-procesalab.ics"');
    res.status(200).send(buildIcs(event));
  } catch (err) {
    res.status(500).send('Error al generar el calendario: ' + String(err));
  }
};
