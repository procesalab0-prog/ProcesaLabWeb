const { readJSON, writeJSON } = require('../lib/store');

const PATH = 'data/stats.json';
const ALLOWED = /^(main|client:[a-z0-9-]+)$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { path } = req.body || {};
  if (!path || !ALLOWED.test(path)) {
    res.status(400).json({ error: 'path inválido' });
    return;
  }

  try {
    const stats = await readJSON(PATH, { counts: {} });
    if (!stats.counts) stats.counts = {};
    stats.counts[path] = (stats.counts[path] || 0) + 1;
    stats.updatedAt = new Date().toISOString();
    await writeJSON(PATH, stats);
    res.status(200).json({ ok: true });
  } catch (err) {
    // Never let tracking failures be visible/loud to real visitors.
    res.status(200).json({ ok: false });
  }
};
