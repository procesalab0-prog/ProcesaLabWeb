const blobPkg = require('@vercel/blob');
const { isValidSession } = require('../lib/session');

module.exports = async (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).send('No autorizado');
    return;
  }

  let version = '(desconocida)';
  try {
    version = require('@vercel/blob/package.json').version;
  } catch (e) {
    version = 'error: ' + String(e);
  }

  const exportNames = Object.keys(blobPkg);
  const exportTypes = exportNames.map((k) => `${k}: ${typeof blobPkg[k]}`);

  res.status(200).send(
    `@vercel/blob version: ${version}\n\n` +
    `Exports:\n` +
    exportTypes.map((t) => '- ' + t).join('\n')
  );
};
