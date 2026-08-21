const { isValidClientSession } = require('../lib/clientSession');

module.exports = (req, res) => {
  const secret = process.env.SESSION_SECRET;
  const { slug } = req.query || {};
  const authenticated = Boolean(secret) && isValidClientSession(req.headers.cookie, slug, secret);
  res.status(200).json({ authenticated });
};
