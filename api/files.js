const { list } = require('@vercel/blob');
const { isValidSession } = require('../lib/session');

const PREFIX = 'privado/';

module.exports = async (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    const { blobs } = await list({ prefix: PREFIX });
    const files = blobs
      .map((b) => ({
        url: b.url,
        pathname: b.pathname,
        name: b.pathname.slice(PREFIX.length).replace(/^[0-9a-f-]{36}-/, ''),
        uploadedAt: b.uploadedAt,
        size: b.size,
      }))
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    res.status(200).json({ files });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo listar los archivos', detail: String(err) });
  }
};
