const { isValidSession } = require('../lib/session');

module.exports = (req, res) => {
  const secret = process.env.SESSION_SECRET;
  const authenticated = Boolean(secret) && isValidSession(req.headers.cookie, secret);
  res.status(200).json({ authenticated });
};
