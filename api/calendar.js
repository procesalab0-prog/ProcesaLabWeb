const crypto = require('crypto');
const { isValidSession } = require('../lib/session');
const { readJSON, writeJSON } = require('../lib/store');

const PATH = 'data/calendar.json';

module.exports = async (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const events = await readJSON(PATH, []);
      events.sort((a, b) => `${a.date}T${a.time || '00:00'}`.localeCompare(`${b.date}T${b.time || '00:00'}`));
      res.status(200).json({ events });
      return;
    }

    if (req.method === 'POST') {
      const { title, date, time, notes, sourceKey } = req.body || {};
      if (!title || !date) {
        res.status(400).json({ error: 'Falta título o fecha' });
        return;
      }
      const events = await readJSON(PATH, []);
      const normalizedSourceKey = sourceKey ? String(sourceKey).slice(0, 300) : '';
      if (normalizedSourceKey) {
        const existing = events.find((item) => item.sourceKey === normalizedSourceKey);
        if (existing) {
          res.status(200).json({ ok: true, event: existing, created: false });
          return;
        }
      }
      const event = {
        id: crypto.randomUUID(),
        title: String(title).slice(0, 200),
        date: String(date),
        time: time ? String(time) : '',
        notes: notes ? String(notes).slice(0, 1000) : '',
        sourceKey: normalizedSourceKey,
        createdAt: new Date().toISOString(),
      };
      events.push(event);
      await writeJSON(PATH, events);
      res.status(200).json({ ok: true, event, created: true });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) {
        res.status(400).json({ error: 'Falta id' });
        return;
      }
      const events = await readJSON(PATH, []);
      const next = events.filter((e) => e.id !== id);
      await writeJSON(PATH, next);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Error del calendario', detail: String(err) });
  }
};
