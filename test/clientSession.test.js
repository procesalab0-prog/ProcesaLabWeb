const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createClientSessionCookie,
  isValidClientSession,
  createClientAccessToken,
  isValidClientAccessToken,
} = require('../lib/clientSession');
const { createSessionCookie } = require('../lib/session');
const clientLogin = require('../api/client-login');

const SECRET = 'test-session-secret';

test('creates a client session cookie that can be validated', () => {
  const cookie = createClientSessionCookie('renta-carga', SECRET, 60);
  assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);
  assert.equal(isValidClientSession(cookie, 'renta-carga', SECRET), true);
  assert.equal(isValidClientSession(cookie, 'bm-cubica', SECRET), false);
});

test('signed client access token only authorizes its client', () => {
  const { token, expiresAt } = createClientAccessToken('renta-carga', SECRET, 60);
  assert.ok(expiresAt > Date.now());
  assert.equal(isValidClientAccessToken(token, 'renta-carga', SECRET), true);
  assert.equal(isValidClientAccessToken(token, 'bm-cubica', SECRET), false);
  assert.equal(isValidClientAccessToken(`${token}x`, 'renta-carga', SECRET), false);
});

test('expired client access token is rejected', () => {
  const { token } = createClientAccessToken('renta-carga', SECRET, -1);
  assert.equal(isValidClientAccessToken(token, 'renta-carga', SECRET), false);
});

function responseRecorder() {
  return {
    headers: {},
    statusCode: 200,
    body: null,
    redirectTo: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
    redirect(code, path) { this.statusCode = code; this.redirectTo = path; return this; },
  };
}

test('owner can create a link and the link starts a client session', () => {
  const previousSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = SECRET;

  try {
    const ownerResponse = responseRecorder();
    clientLogin({
      method: 'GET',
      query: { action: 'link', slug: 'renta-carga' },
      headers: { cookie: createSessionCookie(SECRET, 60) },
    }, ownerResponse);

    assert.equal(ownerResponse.statusCode, 200);
    assert.match(ownerResponse.body.path, /^\/api\/client-login\?slug=renta-carga&token=/);

    const token = new URL(`https://example.test${ownerResponse.body.path}`).searchParams.get('token');
    const clientResponse = responseRecorder();
    clientLogin({
      method: 'GET',
      query: { slug: 'renta-carga', token },
      headers: {},
    }, clientResponse);

    assert.equal(clientResponse.statusCode, 302);
    assert.equal(clientResponse.redirectTo, '/clientes/renta-carga/');
    assert.match(clientResponse.headers['set-cookie'], /^pl_client_renta-carga=/);
  } finally {
    if (previousSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previousSecret;
  }
});

test('link creation requires the private owner session', () => {
  const previousSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = SECRET;

  try {
    const response = responseRecorder();
    clientLogin({
      method: 'GET',
      query: { action: 'link', slug: 'renta-carga' },
      headers: {},
    }, response);
    assert.equal(response.statusCode, 401);
  } finally {
    if (previousSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previousSecret;
  }
});
