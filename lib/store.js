const { put, get } = require('@vercel/blob');

async function readJSON(pathname, fallback) {
  const result = await get(pathname, {
    access: 'private',
    // Calendar and analytics are mutable JSON documents. Bypassing the CDN
    // prevents a reload immediately after a write from seeing an older copy.
    useCache: false,
  });
  if (!result || result.statusCode !== 200 || !result.stream) return fallback;

  return new Response(result.stream).json();
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
