// Starts an isolated MongoDB + API server for integration tests.
//
// - Uses MONGODB_TEST_URI when set; otherwise spawns `mongod` (or MONGOD_PATH)
//   on a random port with a temporary data directory.
// - Spawns `node server.js` exactly as in production, on a random port.
// Everything is torn down (and the temp DB deleted) by stop().

const { spawn } = require('child_process');
const fs = require('fs');
const net = require('net');
const os = require('os');
const path = require('path');
const mongoose = require('mongoose');

const BACKEND_DIR = path.join(__dirname, '..', '..');

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

const waitFor = async (check, { timeoutMs = 30000, label }) => {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      if (await check()) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ''}`);
};

const startTestServer = async ({ rateLimits = false } = {}) => {
  const children = [];
  let tmpDir = null;
  let mongoUri = process.env.MONGODB_TEST_URI;

  if (!mongoUri) {
    const mongoPort = await freePort();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'car-mgmt-test-'));
    const mongod = spawn(
      process.env.MONGOD_PATH || 'mongod',
      ['--dbpath', tmpDir, '--port', String(mongoPort), '--bind_ip', '127.0.0.1', '--quiet'],
      { stdio: 'ignore' }
    );
    mongod.on('error', (error) => {
      throw new Error(`Could not start mongod (set MONGOD_PATH or MONGODB_TEST_URI): ${error.message}`);
    });
    children.push(mongod);
    mongoUri = `mongodb://127.0.0.1:${mongoPort}/car-mgmt-test`;
  }

  // Connection used by tests to seed admins and inspect stored documents.
  await waitFor(
    async () => {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 1000 });
      return true;
    },
    { label: 'MongoDB' }
  );
  await mongoose.connection.dropDatabase();

  const apiPort = await freePort();
  const server = spawn(process.execPath, ['server.js'], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      PORT: String(apiPort),
      MONGODB_URI: mongoUri,
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'test',
      CLIENT_URL: '',
      VERCEL: '',
      CLOUDINARY_CLOUD_NAME: '',
      DISABLE_RATE_LIMIT: rateLimits ? '' : '1',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverOutput = '';
  server.stdout.on('data', (d) => (serverOutput += d));
  server.stderr.on('data', (d) => (serverOutput += d));
  children.push(server);

  const baseUrl = `http://127.0.0.1:${apiPort}`;
  await waitFor(
    async () => {
      if (server.exitCode !== null) throw new Error(`server exited:\n${serverOutput}`);
      const res = await fetch(`${baseUrl}/api/health`);
      return res.ok;
    },
    { label: 'API server' }
  );

  const stop = async () => {
    await mongoose.disconnect().catch(() => {});
    for (const child of children.reverse()) {
      if (child.exitCode === null) {
        child.kill();
        await new Promise((r) => child.once('exit', r));
      }
    }
    if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
  };

  return { baseUrl, mongoose, stop, output: () => serverOutput };
};

// Small fetch wrapper: JSON in, { status, body } out.
const createClient = (baseUrl) => {
  const request = async (method, url, { token, body, form } = {}) => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    let payload;
    if (form) {
      payload = form;
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await fetch(baseUrl + url, { method, headers, body: payload });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, body: json, headers: res.headers };
  };

  return {
    get: (url, opts) => request('GET', url, opts),
    post: (url, opts) => request('POST', url, opts),
    put: (url, opts) => request('PUT', url, opts),
    del: (url, opts) => request('DELETE', url, opts),
  };
};

module.exports = { startTestServer, createClient, BACKEND_DIR };
