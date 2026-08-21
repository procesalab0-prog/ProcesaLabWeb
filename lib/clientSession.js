const crypto = require('crypto');

const COOKIE_PREFIX = 'pl_client_';
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function cookieName(slug) {
  return `${COOKIE_PREFIX}${slug}`;
}

function sign(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function createClientSessionCookie(slug, secret, maxAgeSeconds = DEFAULT_MAX_AGE) {
  const expires = Date.now() + maxAgeSeconds * 1000;
  const payload = `${slug}:${expires}`;
  const signature = sign(payload, secret);
  const token = `${payload}.${signature}`;
  return `${cookieName(slug)}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`;
}

function isValidClientSession(cookieHeader, slug, secret) {
  if (!cookieHeader || !slug) return false;
  const name = cookieName(slug);
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  if (!match) return false;
  const token = decodeURIComponent(match[1]);
  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!payload || !signature) return false;

  const expected = sign(payload, secret);
  const expectedBuf = Buffer.from(expected, 'hex');
  const signatureBuf = Buffer.from(signature, 'hex');
  if (expectedBuf.length !== signatureBuf.length) return false;
  if (!crypto.timingSafeEqual(expectedBuf, signatureBuf)) return false;

  const [payloadSlug, expiresStr] = payload.split(':');
  if (payloadSlug !== slug) return false;
  const expiresAt = Number(expiresStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

module.exports = { createClientSessionCookie, isValidClientSession };
