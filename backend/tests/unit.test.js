const { test } = require('node:test');
const assert = require('node:assert/strict');
const { rateLimit } = require('../middleware/rateLimit');
const { generateBackupCodes, findBackupCode } = require('../utils/backupCodes');
const pick = require('../utils/pick');

const fakeRes = () => {
  const res = { statusCode: 200, headers: {}, body: null };
  res.status = (code) => ((res.statusCode = code), res);
  res.json = (body) => ((res.body = body), res);
  res.set = (k, v) => ((res.headers[k] = v), res);
  return res;
};

test('rate limiter blocks after max requests per key and reports Retry-After', () => {
  const limiter = rateLimit({ windowMs: 60000, max: 2, message: 'slow down' });
  let passed = 0;
  const next = () => passed++;

  for (let i = 0; i < 3; i++) limiter({ ip: '1.1.1.1' }, fakeRes(), next);
  assert.equal(passed, 2);

  const res = fakeRes();
  limiter({ ip: '1.1.1.1' }, res, next);
  assert.equal(res.statusCode, 429);
  assert.equal(res.body.message, 'slow down');
  assert.ok(Number(res.headers['Retry-After']) > 0);

  // Different key is unaffected.
  limiter({ ip: '2.2.2.2' }, fakeRes(), next);
  assert.equal(passed, 3);
});

test('backup codes: hashed storage, case/space-insensitive match, legacy plain codes', () => {
  const { plain, hashed } = generateBackupCodes();
  assert.equal(plain.length, 8);
  assert.notDeepEqual(plain, hashed);
  assert.equal(findBackupCode(hashed, plain[3].toLowerCase()), 3);
  assert.equal(findBackupCode(hashed, ` ${plain[0].slice(0, 4)}-${plain[0].slice(4)} `), 0);
  assert.equal(findBackupCode(hashed, 'DEADBEEF'), -1);
  assert.equal(findBackupCode(hashed, ''), -1);
  assert.equal(findBackupCode(['ABCD1234'], 'abcd1234'), 0);
});

test('pick keeps only whitelisted, non-empty fields', () => {
  assert.deepEqual(pick({ a: 1, b: '', c: 3, role: 'admin' }, ['a', 'b', 'c']), { a: 1, c: 3 });
});
