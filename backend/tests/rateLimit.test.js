// Verifies the limiters are wired into the real routes (limits enabled).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, createClient } = require('./helpers/testServer');

let env;
let api;

before(async () => {
  env = await startTestServer({ rateLimits: true });
  api = createClient(env.baseUrl);
});

after(async () => {
  if (env) await env.stop();
});

test('login is limited to 10 attempts per IP and email per window', async () => {
  const body = { email: 'nobody@test.dev', password: 'wrong-password' };
  for (let i = 0; i < 10; i++) {
    assert.equal((await api.post('/api/users/login', { body })).status, 401);
  }
  const blocked = await api.post('/api/users/login', { body });
  assert.equal(blocked.status, 429);
  assert.ok(blocked.headers.get('retry-after'));

  // Another email from the same IP is still allowed.
  const other = await api.post('/api/users/login', { body: { email: 'other@test.dev', password: 'x' } });
  assert.equal(other.status, 401);
});

test('2FA code guessing is limited to 5 attempts', async () => {
  const body = { tempToken: 'invalid', code: '123456' };
  for (let i = 0; i < 5; i++) {
    assert.equal((await api.post('/api/auth/2fa/validate', { body })).status, 401);
  }
  assert.equal((await api.post('/api/auth/2fa/validate', { body })).status, 429);
});
