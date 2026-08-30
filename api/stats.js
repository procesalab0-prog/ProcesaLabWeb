const { isValidSession } = require('../lib/session');
const { readJSON } = require('../lib/store');

const PATH = 'data/stats.json';

module.exports = async (req, res) => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || !isValidSession(req.headers.cookie, secret)) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  try {
    const stats = await readJSON(PATH, { counts: {} });
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Error al leer analítica', detail: String(err) });
  }
};
