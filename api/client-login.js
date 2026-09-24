const { CLIENTS } = require('../lib/clients');
const { isValidSession } = require('../lib/session');
const {
  createClientSessionCookie,
  createClientAccessToken,
  isValidClientAccessToken,
} = require('../lib/clientSession');

module.exports = (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Falta configurar SESSION_SECRET en Vercel' });
    return;
  }

  if (req.method === 'GET') {
    const { slug, token, action } = req.query || {};
    const client = slug && CLIENTS[slug];

    if (!client) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    if (action === 'link') {
      if (!isValidSession(req.headers.cookie, secret)) {
        res.status(401).json({ error: 'Sesión privada requerida' });
        return;
      }

      const access = createClientAccessToken(slug, secret);
      const path = `/api/client-login?slug=${encodeURIComponent(slug)}&token=${encodeURIComponent(access.token)}`;
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ ok: true, path, expiresAt: access.expiresAt });
      return;
    }

    if (!isValidClientAccessToken(token, slug, secret)) {
      res.redirect(302, `/clientes/${encodeURIComponent(slug)}/login.html?error=enlace`);
      return;
    }

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Set-Cookie', createClientSessionCookie(slug, secret));
    res.redirect(302, `/clientes/${encodeURIComponent(slug)}/`);
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
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
