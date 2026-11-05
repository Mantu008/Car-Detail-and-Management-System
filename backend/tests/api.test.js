// End-to-end API tests. Run with `npm test` (needs a local `mongod`, or MONGODB_TEST_URI).
// Each regression test names the bug it guards against.

const { test, before, after, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const { startTestServer, createClient, BACKEND_DIR } = require('./helpers/testServer');

let env;
let api;

const state = {};

const register = async (name, email, password = 'secret123') => {
  const res = await api.post('/api/users/register', { body: { name, email, password } });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  return res.body.data;
};

const login = async (email, password = 'secret123') => {
  const res = await api.post('/api/users/login', { body: { email, password } });
  return res;
};

before(async () => {
  env = await startTestServer();
  api = createClient(env.baseUrl);

  // Admins cannot self-register, so insert one directly.
  const users = env.mongoose.connection.collection('users');
  await users.insertOne({
    name: 'Admin',
    email: 'admin@test.dev',
    password: await bcrypt.hash('adminpass', 10),
    role: 'admin',
    status: 'active',
    isTwoFactorEnabled: false,
    twoFactorBackupCodes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  state.admin = (await login('admin@test.dev', 'adminpass')).body.data;

  state.alice = await register('Alice', 'alice@test.dev');
  state.bob = await register('Bob', 'bob@test.dev');
});

after(async () => {
  if (env) await env.stop();
});

describe('authentication', () => {
  test('register returns the public user shape and no secrets', async () => {
    const { user, token } = state.alice;
    assert.ok(token);
    assert.deepEqual(Object.keys(user).sort(), ['_id', 'createdAt', 'email', 'isTwoFactorEnabled', 'name', 'role', 'status']);
    assert.equal(user.role, 'user');
  });

  test('registration ignores a role supplied by the client', async () => {
    const res = await api.post('/api/users/register', {
      body: { name: 'Mallory', email: 'mallory@test.dev', password: 'secret123', role: 'admin' },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.role, 'user');
  });

  test('duplicate email is a 409, not a 500', async () => {
    const res = await api.post('/api/users/register', {
      body: { name: 'Again', email: 'ALICE@test.dev', password: 'secret123' },
    });
    assert.equal(res.status, 409);
  });

  test('validation errors are 400 with a readable message', async () => {
    const res = await api.post('/api/users/register', { body: { name: 'X', email: 'x@test.dev', password: '123' } });
    assert.equal(res.status, 400);
    assert.match(res.body.message, /at least 6/);
  });

  test('login is case-insensitive on email', async () => {
    const res = await login('  Alice@Test.DEV ');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
  });

  test('wrong password is 401', async () => {
    const res = await login('alice@test.dev', 'nope-nope');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  test('profile never exposes password or 2FA secrets', async () => {
    const res = await api.get('/api/users/profile', { token: state.alice.token });
    assert.equal(res.status, 200);
    for (const key of ['password', 'twoFactorSecret', 'twoFactorPendingSecret', 'twoFactorBackupCodes']) {
      assert.equal(key in res.body.data, false, `${key} leaked`);
    }
  });

  test('updating a profile keeps the password valid', async () => {
    const res = await api.put('/api/users/profile', { token: state.bob.token, body: { name: 'Bobby' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.name, 'Bobby');
    assert.equal((await login('bob@test.dev')).status, 200);
  });

  test('regression: repeated saves of one user document keep the password valid', async () => {
    // Invariant guard. (The original hook re-hashed the in-memory password after
    // calling next(); with Mongoose 7 the write usually wins the race, so stored
    // data stayed valid, but the behaviour was timing-dependent.)
    const User = require('../models/User');
    const user = await User.create({ name: 'Saver', email: 'saver@test.dev', password: 'secret123' });
    user.name = 'Saver 2';
    await user.save();
    user.status = 'active';
    await user.save();
    await user.save();
    const fresh = await User.findById(user._id);
    assert.equal(await fresh.comparePassword('secret123'), true);
  });

  test('changing the password requires the current password', async () => {
    const bad = await api.put('/api/users/profile', {
      token: state.bob.token,
      body: { currentPassword: 'wrong', newPassword: 'newsecret1' },
    });
    assert.equal(bad.status, 400);

    const ok = await api.put('/api/users/profile', {
      token: state.bob.token,
      body: { currentPassword: 'secret123', newPassword: 'newsecret1' },
    });
    assert.equal(ok.status, 200);
    assert.equal((await login('bob@test.dev', 'newsecret1')).status, 200);
    assert.equal((await login('bob@test.dev', 'secret123')).status, 401);
  });

  test('requests without or with a forged token are 401', async () => {
    assert.equal((await api.get('/api/users/profile')).status, 401);
    assert.equal((await api.get('/api/users/profile', { token: 'abc.def.ghi' })).status, 401);
  });
});

describe('vehicles', () => {
  test('regression: GET /api/cars requires auth instead of crashing', async () => {
    assert.equal((await api.get('/api/cars')).status, 401);
  });

  test('create with empty optional fields succeeds (multipart)', async () => {
    // The old form sent mileage as the string "undefined", which failed casting with a 500.
    const form = new FormData();
    form.append('brand', 'Toyota');
    form.append('model', 'Corolla');
    form.append('year', '2021');
    form.append('price', '1500000');
    form.append('mileage', '');
    form.append('color', '');
    const res = await api.post('/api/cars', { token: state.alice.token, form });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal(res.body.data.mileage, undefined);
    state.aliceCar = res.body.data;
  });

  test('mass assignment of owner/status/services is ignored', async () => {
    const res = await api.post('/api/cars', {
      token: state.alice.token,
      body: {
        brand: 'Honda',
        model: 'City',
        year: 2020,
        price: 900000,
        owner: state.bob.user._id,
        status: 'suspicious',
        services: ['000000000000000000000000'],
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.owner._id, state.alice.user._id);
    assert.equal(res.body.data.status, 'normal');
    assert.deepEqual(res.body.data.services, []);
    state.aliceCar2 = res.body.data;
  });

  test('missing required fields are a 400', async () => {
    const res = await api.post('/api/cars', { token: state.alice.token, body: { brand: 'X' } });
    assert.equal(res.status, 400);
  });

  test('users only list their own vehicles; admins list all', async () => {
    const mine = await api.get('/api/cars', { token: state.bob.token });
    assert.equal(mine.status, 200);
    assert.equal(mine.body.data.length, 0);

    const all = await api.get('/api/cars', { token: state.admin.token });
    assert.ok(all.body.data.length >= 2);
  });

  test('another user cannot edit or delete a vehicle', async () => {
    const id = state.aliceCar._id;
    assert.equal((await api.put(`/api/cars/${id}`, { token: state.bob.token, body: { price: 1 } })).status, 403);
    assert.equal((await api.del(`/api/cars/${id}`, { token: state.bob.token })).status, 403);
  });

  test('public vehicle view hides the owner email; owner sees canManage', async () => {
    const id = state.aliceCar._id;
    const anon = await api.get(`/api/cars/${id}`);
    assert.equal(anon.status, 200);
    assert.equal(anon.body.data.canManage, false);
    assert.equal(anon.body.data.owner.email, undefined);
    assert.equal(anon.body.data.services, undefined);

    const owner = await api.get(`/api/cars/${id}`, { token: state.alice.token });
    assert.equal(owner.body.data.canManage, true);
    assert.equal(owner.body.data.owner.email, 'alice@test.dev');
  });

  test('invalid ids are a 400, unknown ids a 404', async () => {
    assert.equal((await api.get('/api/cars/not-an-id')).status, 400);
    assert.equal((await api.get('/api/cars/000000000000000000000000')).status, 404);
  });

  test('editing can clear optional fields', async () => {
    const id = state.aliceCar._id;
    await api.put(`/api/cars/${id}`, { token: state.alice.token, body: { color: 'Red', mileage: 100 } });
    const res = await api.put(`/api/cars/${id}`, { token: state.alice.token, body: { color: '', mileage: '' } });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.color, '');
    assert.equal(res.body.data.mileage, undefined);
  });

  test('uploads reject non-image files', async () => {
    const form = new FormData();
    form.append('brand', 'A');
    form.append('model', 'B');
    form.append('year', '2020');
    form.append('price', '1');
    form.append('image', new Blob(['<svg onload=alert(1)>'], { type: 'image/svg+xml' }), 'x.svg');
    const res = await api.post('/api/cars', { token: state.alice.token, form });
    assert.equal(res.status, 400);
  });

  test('image upload is stored and removed with the vehicle', async () => {
    // 1x1 transparent PNG
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );
    const form = new FormData();
    form.append('brand', 'Img');
    form.append('model', 'Test');
    form.append('year', '2020');
    form.append('price', '1');
    form.append('image', new Blob([png], { type: 'image/png' }), 'pixel.png');
    const res = await api.post('/api/cars', { token: state.alice.token, form });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    const imagePath = path.join(BACKEND_DIR, res.body.data.image);
    assert.ok(fs.existsSync(imagePath));

    const img = await fetch(env.baseUrl + res.body.data.image);
    assert.equal(img.status, 200);

    assert.equal((await api.del(`/api/cars/${res.body.data._id}`, { token: state.alice.token })).status, 200);
    await new Promise((r) => setTimeout(r, 200));
    assert.equal(fs.existsSync(imagePath), false);
  });
});

describe('service records', () => {
  test('owner can add a service; it is linked to the car', async () => {
    const res = await api.post('/api/services', {
      token: state.alice.token,
      body: { car: state.aliceCar._id, description: 'Oil change', cost: 2500, serviceType: 'maintenance' },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    state.service = res.body.data;

    const car = await api.get(`/api/cars/${state.aliceCar._id}`, { token: state.alice.token });
    assert.equal(car.body.data.services.length, 1);
  });

  test('other users cannot read, add, edit or delete service records', async () => {
    const carId = state.aliceCar._id;
    assert.equal((await api.get(`/api/services/${carId}`, { token: state.bob.token })).status, 403);
    assert.equal(
      (
        await api.post('/api/services', {
          token: state.bob.token,
          body: { car: carId, description: 'x', cost: 1 },
        })
      ).status,
      403
    );
    assert.equal(
      (await api.put(`/api/services/${state.service._id}`, { token: state.bob.token, body: { cost: 1 } })).status,
      403
    );
    assert.equal((await api.del(`/api/services/${state.service._id}`, { token: state.bob.token })).status, 403);
  });

  test('a service cannot be moved to another vehicle', async () => {
    const res = await api.put(`/api/services/${state.service._id}`, {
      token: state.alice.token,
      body: { car: state.aliceCar2._id, cost: 3000 },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.car._id, state.aliceCar._id);
    assert.equal(res.body.data.cost, 3000);
  });

  test('GET /api/services only returns the user’s own records', async () => {
    const bob = await api.get('/api/services', { token: state.bob.token });
    assert.equal(bob.body.data.length, 0);
    const alice = await api.get('/api/services', { token: state.alice.token });
    assert.equal(alice.body.data.length, 1);
  });

  test('admins can manage any vehicle’s services', async () => {
    const res = await api.get(`/api/services/${state.aliceCar._id}`, { token: state.admin.token });
    assert.equal(res.status, 200);
  });
});

describe('fuel log (endpoint was missing originally)', () => {
  test('adding entries updates the vehicle odometer', async () => {
    const carId = state.aliceCar._id;
    const first = await api.post(`/api/cars/${carId}/fuel-entries`, {
      token: state.alice.token,
      body: { date: '2026-01-01', fuelAmount: 30, cost: 3000, odometer: 10000, fuelType: 'petrol' },
    });
    assert.equal(first.status, 201, JSON.stringify(first.body));

    const second = await api.post(`/api/cars/${carId}/fuel-entries`, {
      token: state.alice.token,
      body: { date: '2026-01-15', fuelAmount: 25, cost: 2600, odometer: 10450, fuelType: 'petrol' },
    });
    assert.equal(second.status, 201);

    const list = await api.get(`/api/cars/${carId}/fuel-entries`, { token: state.alice.token });
    assert.deepEqual(
      list.body.data.map((e) => e.odometer),
      [10000, 10450]
    );

    const car = await api.get(`/api/cars/${carId}`, { token: state.alice.token });
    assert.equal(car.body.data.mileage, 10450);
  });

  test('odometer cannot go backwards', async () => {
    const res = await api.post(`/api/cars/${state.aliceCar._id}/fuel-entries`, {
      token: state.alice.token,
      body: { date: '2026-02-01', fuelAmount: 10, cost: 1000, odometer: 9000 },
    });
    assert.equal(res.status, 400);
  });

  test('fuel log is private to the owner', async () => {
    const res = await api.get(`/api/cars/${state.aliceCar._id}/fuel-entries`, { token: state.bob.token });
    assert.equal(res.status, 403);
  });
});

describe('admin', () => {
  test('non-admins get 403 on admin routes', async () => {
    for (const url of ['/api/admin/dashboard', '/api/admin/users', '/api/admin/logs', '/api/admin/support']) {
      assert.equal((await api.get(url, { token: state.alice.token })).status, 403, url);
    }
  });

  test('dashboard returns labelled monthly series', async () => {
    const res = await api.get('/api/admin/dashboard', { token: state.admin.token });
    assert.equal(res.status, 200);
    const { counts, monthlyServices, monthlySignups } = res.body.data;
    assert.ok(counts.users >= 2);
    assert.equal(monthlyServices.length, 6);
    assert.equal(monthlySignups.length, 6);
    assert.match(monthlySignups[5].label, /^[A-Z][a-z]{2} \d{4}$/);
  });

  test('admin users list includes vehicle counts and no secrets', async () => {
    const res = await api.get('/api/admin/users', { token: state.admin.token });
    const alice = res.body.data.find((u) => u.email === 'alice@test.dev');
    assert.ok(alice.vehicleCount >= 2);
    assert.equal('password' in alice, false);
    assert.equal('twoFactorSecret' in alice, false);
  });

  test('flagging is admin-only and owners cannot clear the flag', async () => {
    const id = state.aliceCar2._id;
    assert.equal(
      (await api.put(`/api/admin/vehicles/${id}/status`, { token: state.alice.token, body: { status: 'normal' } })).status,
      403
    );

    const flag = await api.put(`/api/admin/vehicles/${id}/status`, {
      token: state.admin.token,
      body: { status: 'suspicious' },
    });
    assert.equal(flag.status, 200);

    // Owner edits the car and tries to sneak the status back.
    await api.put(`/api/cars/${id}`, { token: state.alice.token, body: { status: 'normal', price: 950000 } });
    const flagged = await api.get('/api/admin/suspicious-vehicles', { token: state.admin.token });
    assert.ok(flagged.body.data.some((c) => c._id === id));

    assert.equal(
      (await api.put(`/api/admin/vehicles/${id}/status`, { token: state.admin.token, body: { status: 'bogus' } }))
        .status,
      400
    );
  });

  test('the owner is notified when their vehicle is flagged', async () => {
    const res = await api.get('/api/notifications', { token: state.alice.token });
    assert.equal(res.status, 200);
    assert.ok(res.body.unread >= 1);
    assert.ok(res.body.data.some((n) => /flagged/i.test(n.title)));

    assert.equal((await api.put('/api/notifications/read-all', { token: state.alice.token })).status, 200);
    const after = await api.get('/api/notifications', { token: state.alice.token });
    assert.equal(after.body.unread, 0);
  });

  test('audit log filters by action and rejects operator injection', async () => {
    const res = await api.get('/api/admin/logs?action=USER_LOGIN', { token: state.admin.token });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.data.every((l) => l.action === 'USER_LOGIN'));
    assert.ok(res.body.actions.includes('USER_LOGIN'));

    const injected = await api.get('/api/admin/logs?user[$ne]=x', { token: state.admin.token });
    assert.equal(injected.status, 400);
  });

  test('blocking a user ends their access; admins cannot be blocked', async () => {
    const mallory = await register('Temp', 'temp@test.dev');
    const block = await api.put(`/api/admin/users/${mallory.user._id}/status`, {
      token: state.admin.token,
      body: { status: 'blocked' },
    });
    assert.equal(block.status, 200);

    // Existing session is rejected and new logins are refused.
    assert.equal((await api.get('/api/users/profile', { token: mallory.token })).status, 403);
    assert.equal((await login('temp@test.dev')).status, 403);

    // Blocking saved the user - the password must still work after unblocking.
    await api.put(`/api/admin/users/${mallory.user._id}/status`, {
      token: state.admin.token,
      body: { status: 'active' },
    });
    assert.equal((await login('temp@test.dev')).status, 200);

    const self = await api.put(`/api/admin/users/${state.admin.user._id}/status`, {
      token: state.admin.token,
      body: { status: 'blocked' },
    });
    assert.equal(self.status, 400);
  });
});

describe('support and announcements', () => {
  test('ticket lifecycle with status validation', async () => {
    const created = await api.post('/api/support', {
      token: state.alice.token,
      body: { subject: 'Help', message: 'Something broke', priority: 'high' },
    });
    assert.equal(created.status, 201);
    const id = created.body.data._id;

    const others = await api.get('/api/support', { token: state.bob.token });
    assert.equal(others.body.data.length, 0);

    assert.equal(
      (await api.put(`/api/admin/support/${id}`, { token: state.admin.token, body: { status: 'nope' } })).status,
      400
    );
    const resolved = await api.put(`/api/admin/support/${id}`, {
      token: state.admin.token,
      body: { status: 'resolved', adminResponse: 'Fixed' },
    });
    assert.equal(resolved.status, 200);
    assert.ok(resolved.body.data.resolvedAt);

    const reopened = await api.put(`/api/admin/support/${id}`, { token: state.admin.token, body: { status: 'open' } });
    assert.equal(reopened.body.data.resolvedAt, undefined);
  });

  test('expired announcements are hidden and only admins can publish', async () => {
    assert.equal(
      (await api.post('/api/announcements', { token: state.alice.token, body: { title: 't', message: 'm' } })).status,
      403
    );
    const ok = await api.post('/api/announcements', {
      token: state.admin.token,
      body: { title: 'Live', message: 'Visible' },
    });
    assert.equal(ok.status, 201);

    await env.mongoose.connection.collection('announcements').insertOne({
      title: 'Old',
      message: 'Expired',
      type: 'info',
      active: true,
      expiresAt: new Date(Date.now() - 1000),
      createdAt: new Date(),
    });

    const list = await api.get('/api/announcements', { token: state.bob.token });
    const titles = list.body.data.map((a) => a.title);
    assert.ok(titles.includes('Live'));
    assert.ok(!titles.includes('Old'));
  });
});

describe('two-factor authentication', () => {
  const totp = (secret) => speakeasy.totp({ secret, encoding: 'base32' });

  test('2FA endpoints require a session', async () => {
    assert.equal((await api.post('/api/auth/2fa/setup', { body: {} })).status, 401);
    assert.equal((await api.post('/api/auth/2fa/disable', { body: { code: '123456' } })).status, 401);
  });

  test('full flow: setup, verify, login challenge, backup code, disable', async () => {
    const carol = await register('Carol', 'carol@test.dev');

    const setup = await api.post('/api/auth/2fa/setup', { token: carol.token });
    assert.equal(setup.status, 200);
    assert.match(setup.body.data.qrCode, /^data:image\/png;base64,/);
    const { secret } = setup.body.data;

    assert.equal((await api.post('/api/auth/2fa/verify', { token: carol.token, body: { code: '000000' } })).status, 400);
    const verify = await api.post('/api/auth/2fa/verify', { token: carol.token, body: { code: totp(secret) } });
    assert.equal(verify.status, 200);
    const { backupCodes } = verify.body.data;
    assert.equal(backupCodes.length, 8);

    // Backup codes are stored hashed, not in plain text.
    const stored = await env.mongoose.connection.collection('users').findOne({ email: 'carol@test.dev' });
    assert.equal(stored.twoFactorBackupCodes.length, 8);
    assert.ok(!stored.twoFactorBackupCodes.includes(backupCodes[0]));

    // Password alone no longer yields a session.
    const first = await login('carol@test.dev');
    assert.equal(first.status, 200);
    assert.equal(first.body.data.requires2FA, true);
    assert.equal(first.body.data.token, undefined);
    const { tempToken } = first.body.data;

    // The temporary token is not a session token.
    assert.equal((await api.get('/api/users/profile', { token: tempToken })).status, 401);

    assert.equal(
      (await api.post('/api/auth/2fa/validate', { body: { tempToken, code: '111111' } })).status,
      400
    );
    const ok = await api.post('/api/auth/2fa/validate', { body: { tempToken, code: totp(secret) } });
    assert.equal(ok.status, 200);
    assert.ok(ok.body.data.token);
    assert.equal(ok.body.data.user.isTwoFactorEnabled, true);

    // A backup code works exactly once.
    const viaBackup = await api.post('/api/auth/2fa/validate', {
      body: { tempToken, code: backupCodes[0].toLowerCase() },
    });
    assert.equal(viaBackup.status, 200);
    assert.equal(viaBackup.body.data.usedBackupCode, true);
    const reused = await api.post('/api/auth/2fa/validate', { body: { tempToken, code: backupCodes[0] } });
    assert.equal(reused.status, 400);

    // Disabling requires a valid code.
    const session = ok.body.data.token;
    assert.equal((await api.post('/api/auth/2fa/disable', { token: session, body: { code: '000000' } })).status, 400);
    const off = await api.post('/api/auth/2fa/disable', { token: session, body: { code: totp(secret) } });
    assert.equal(off.status, 200);
    const plain = await login('carol@test.dev');
    assert.ok(plain.body.data.token);
  });

  test('a session token cannot be used as a 2FA temp token', async () => {
    const res = await api.post('/api/auth/2fa/validate', { body: { tempToken: state.alice.token, code: '123456' } });
    assert.equal(res.status, 401);
  });
});

describe('vehicle deletion cascades', () => {
  test('deleting a vehicle removes its services and fuel entries', async () => {
    const id = state.aliceCar._id;
    assert.equal((await api.del(`/api/cars/${id}`, { token: state.alice.token })).status, 200);

    const db = env.mongoose.connection;
    const oid = new env.mongoose.Types.ObjectId(id);
    assert.equal(await db.collection('services').countDocuments({ car: oid }), 0);
    assert.equal(await db.collection('fuelentries').countDocuments({ car: oid }), 0);
  });
});

describe('http hardening', () => {
  test('security headers are set and x-powered-by is hidden', async () => {
    const res = await api.get('/api/health');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-powered-by'), null);
  });

  test('unknown routes are a JSON 404', async () => {
    const res = await api.get('/api/nope');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});
