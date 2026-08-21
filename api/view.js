const { getDownloadUrl } = require('@vercel/blob');
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

  let signedUrl;
  try {
    signedUrl = await getDownloadUrl(u);
  } catch (err) {
    res.status(500).send('getDownloadUrl() falló: ' + String(err));
    return;
  }

  try {
    const upstream = await fetch(signedUrl);
    if (!upstream.ok) {
      const bodyText = await upstream.text().catch(() => '(sin cuerpo)');
      res.status(502).send(
        `No se pudo obtener el archivo desde Blob.\n` +
          `- signedUrl: ${signedUrl}\n` +
          `- status: ${upstream.status}\n` +
          `- cuerpo: ${bodyText.slice(0, 500)}`
      );
      return;
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).send(buf);
  } catch (err) {
    res.status(500).send('Error al leer el archivo: ' + String(err));
  }
};
