const crypto = require('crypto');
const { isValidSession } = require('../lib/session');
const { readJSON, writeJSON } = require('../lib/store');

const PATH = 'data/clients.json';
const VALID_STATUSES = new Set(['active', 'paused', 'finished', 'possible']);

function clean(value, maxLength = 300) {
  return value ? String(value).trim().slice(0, maxLength) : '';
}

function cleanEstimatedValue(value) {
  const num = Number(value);
  if (value === '' || value === undefined || value === null || Number.isNaN(num)) return '';
  return Math.max(0, Math.round(num));
}

function clientFromBody(body, previous = {}) {
  const status = clean(body.status, 20);
  return {
    ...previous,
    name: clean(body.name, 200),
    contact: clean(body.contact, 300),
    status: VALID_STATUSES.has(status) ? status : 'active',
    estimatedValue: cleanEstimatedValue(body.estimatedValue),
    nextPayment: clean(body.nextPayment, 10),
    domainRenewal: clean(body.domainRenewal, 10),
    hostingRenewal: clean(body.hostingRenewal, 10),
    notes: clean(body.notes, 1000),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = async (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const clients = await readJSON(PATH, []);
      clients.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      res.status(200).json({ clients });
      return;
    }

    if (req.method === 'POST') {
      const client = clientFromBody(req.body || {});
      if (!client.name) {
        res.status(400).json({ error: 'Falta el nombre del cliente' });
        return;
      }
      client.id = crypto.randomUUID();
      client.createdAt = client.updatedAt;
      const clients = await readJSON(PATH, []);
      clients.push(client);
      await writeJSON(PATH, clients);
      res.status(200).json({ ok: true, client });
      return;
    }

    if (req.method === 'PUT') {
      const { id } = req.body || {};
      const clients = await readJSON(PATH, []);
      const index = clients.findIndex((item) => item.id === id);
      if (index === -1) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }
      const client = clientFromBody(req.body, clients[index]);
      if (!client.name) {
        res.status(400).json({ error: 'Falta el nombre del cliente' });
        return;
      }
      clients[index] = client;
      await writeJSON(PATH, clients);
      res.status(200).json({ ok: true, client });
      return;
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) {
        res.status(400).json({ error: 'Falta id' });
        return;
      }
      const clients = await readJSON(PATH, []);
      const next = clients.filter((item) => item.id !== id);
      if (next.length === clients.length) {
        res.status(404).json({ error: 'Cliente no encontrado' });
        return;
      }
      await writeJSON(PATH, next);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: 'Error del directorio de clientes', detail: String(err) });
  }
};
