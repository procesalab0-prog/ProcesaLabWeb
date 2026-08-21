const { del } = require('@vercel/blob');
const { isValidSession } = require('../lib/session');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string' || !url.includes('/privado/')) {
    res.status(400).json({ error: 'Falta url' });
    return;
  }

  try {
    await del(url);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar', detail: String(err) });
  }
};
