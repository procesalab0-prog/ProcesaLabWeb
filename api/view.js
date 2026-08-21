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

  let meta;
  try {
    meta = await head(u);
  } catch (err) {
    res.status(500).send('head() falló: ' + String(err));
    return;
  }

  const downloadUrl = meta.downloadUrl || meta.url;
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;

  const attempts = [
    { label: 'sin header extra', headers: {} },
    { label: 'con Authorization Bearer OIDC', headers: oidcToken ? { Authorization: `Bearer ${oidcToken}` } : null },
  ].filter((a) => a.headers !== null);

  const results = [];
  for (const attempt of attempts) {
    try {
      const upstream = await fetch(downloadUrl, { headers: attempt.headers });
      if (upstream.ok) {
        const buf = Buffer.from(await upstream.arrayBuffer());
        res.setHeader('Content-Type', meta.contentType || 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'private, no-store');
        res.status(200).send(buf);
        return;
      }
      const bodyText = await upstream.text().catch(() => '(sin cuerpo)');
      results.push(`[${attempt.label}] status ${upstream.status}: ${bodyText.slice(0, 300)}`);
    } catch (err) {
      results.push(`[${attempt.label}] excepción: ${String(err)}`);
    }
  }

  res.status(502).send(
    'No se pudo descargar el blob. Diagnóstico:\n' +
      `- meta.url: ${meta.url}\n` +
      `- meta.downloadUrl: ${meta.downloadUrl || '(no viene)'}\n` +
      `- hay VERCEL_OIDC_TOKEN: ${Boolean(oidcToken)}\n` +
      results.map((r) => '- ' + r).join('\n')
  );
};
