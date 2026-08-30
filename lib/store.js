const { put, list, getDownloadUrl } = require('@vercel/blob');

async function readJSON(pathname, fallback) {
  const { blobs } = await list({ prefix: pathname });
  const match = blobs.find((b) => b.pathname === pathname);
  if (!match) return fallback;

  const signedUrl = await getDownloadUrl(match.url);
  const res = await fetch(signedUrl);
  if (!res.ok) return fallback;
  return res.json();
}

async function writeJSON(pathname, data) {
  await put(pathname, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

module.exports = { readJSON, writeJSON };
