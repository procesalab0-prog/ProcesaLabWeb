const { createSessionCookie } = require('../lib/session');
const { createClientSessionCookie } = require('../lib/clientSession');
const { CLIENTS } = require('../lib/clients');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ownerPassword = process.env.PRIVATE_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!ownerPassword || !secret) {
    res.status(500).json({ error: 'Falta configurar PRIVATE_PASSWORD o SESSION_SECRET en Vercel' });
    return;
  }

  const { password } = req.body || {};
  if (!password) {
    res.status(400).json({ error: 'Falta la contraseña' });
    return;
  }

  // Owner password → the private dashboard.
  if (password === ownerPassword) {
    res.setHeader('Set-Cookie', createSessionCookie(secret));
    res.status(200).json({ ok: true, type: 'owner' });
    return;
  }

  // Otherwise, check if it matches a client's viewing password.
  const clientEntry = Object.entries(CLIENTS).find(([, c]) => c.password === password);
  if (clientEntry) {
    const [slug] = clientEntry;
    res.setHeader('Set-Cookie', createClientSessionCookie(slug, secret));
    res.status(200).json({ ok: true, type: 'client', redirect: `/clientes/${slug}/` });
    return;
  }

  res.status(401).json({ error: 'Contraseña incorrecta' });
};
