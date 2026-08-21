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
    const meta = await head(u);
    const downloadUrl = meta.downloadUrl || meta.url;

    // This account's Blob store authenticates via System Environment
    // Variables (OIDC), not a static BLOB_READ_WRITE_TOKEN. Serverless
    // functions get a short-lived token in VERCEL_OIDC_TOKEN — needed to
    // actually fetch bytes from a private blob's download URL.
    const oidcToken = process.env.VERCEL_OIDC_TOKEN;
    const upstream = await fetch(downloadUrl, {
      headers: oidcToken ? { Authorization: `Bearer ${oidcToken}` } : {},
    });
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
