const { put } = require('@vercel/blob');
const crypto = require('crypto');
const { isValidSession } = require('../lib/session');

const PREFIX = 'privado/';
const MAX_CHARS = 4 * 1024 * 1024; // ~4MB of HTML text

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

  const { filename, content } = req.body || {};

  if (!filename || typeof filename !== 'string' || !content || typeof content !== 'string') {
    res.status(400).json({ error: 'Falta filename o content' });
    return;
  }
  if (!filename.toLowerCase().endsWith('.html') && !filename.toLowerCase().endsWith('.htm')) {
    res.status(400).json({ error: 'Solo se aceptan archivos .html' });
    return;
  }
  if (content.length > MAX_CHARS) {
    res.status(413).json({ error: 'El archivo es demasiado grande' });
    return;
  }

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const pathname = `${PREFIX}${crypto.randomUUID()}-${safeName}`;

  try {
    const blob = await put(pathname, content, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,
    });
    res.status(200).json({ ok: true, file: blob });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo subir el archivo', detail: String(err) });
  }
};
