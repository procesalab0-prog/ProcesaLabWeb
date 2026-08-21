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
    // No manual token needed — this account's Blob store authenticates
    // implicitly via its System Environment Variables (BLOB_STORE_ID),
    // the same way upload/list/delete already do.
    const meta = await head(u);
    const downloadUrl = meta.downloadUrl || meta.url;

    const upstream = await fetch(downloadUrl);
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
