const { head } = require('@vercel/blob');
const { isValidSession } = require('../lib/session');

module.exports = async (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).send('No autorizado');
    return;
  }

  const { u } = req.query || {};
  if (!u || typeof u !== 'string' || !u.includes('/privado/')) {
    res.status(400).send('Falta el parámetro u');
    return;
  }

  try {
    // The blob is stored with access:'public', so its own URL is fetchable
    // directly — no auth needed here. The browser never sees that URL
    // though: it only ever talks to this endpoint, which requires a valid
    // session cookie before it will fetch and return anything.
    const meta = await head(u);
    const upstream = await fetch(meta.url);
    if (!upstream.ok) {
      res.status(upstream.status).send('No se pudo obtener el archivo desde Blob (' + upstream.status + ')');
      return;
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', meta.contentType || 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).send(buf);
  } catch (err) {
    res.status(500).send('Error al leer el archivo: ' + String(err));
  }
};
