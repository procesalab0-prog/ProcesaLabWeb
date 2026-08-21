const { createSessionCookie } = require('../lib/session');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const expected = process.env.PRIVATE_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!expected || !secret) {
    res.status(500).json({ error: 'Falta configurar PRIVATE_PASSWORD o SESSION_SECRET en Vercel' });
    return;
  }

  const { password } = req.body || {};

  if (!password || password !== expected) {
    res.status(401).json({ error: 'Contraseña incorrecta' });
    return;
  }

  res.setHeader('Set-Cookie', createSessionCookie(secret));
  res.status(200).json({ ok: true });
};
