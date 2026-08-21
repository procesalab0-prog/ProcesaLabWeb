const { CLIENTS } = require('../lib/clients');
const { createClientSessionCookie } = require('../lib/clientSession');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Falta configurar SESSION_SECRET en Vercel' });
    return;
  }

  const { slug, password } = req.body || {};
  const client = slug && CLIENTS[slug];

  if (!client || !password || password !== client.password) {
    res.status(401).json({ error: 'Contraseña incorrecta' });
    return;
  }

  res.setHeader('Set-Cookie', createClientSessionCookie(slug, secret));
  res.status(200).json({ ok: true });
};
