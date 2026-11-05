// Comma-separated list of allowed origins, e.g.
// CLIENT_URL=http://localhost:3000,https://my-app.vercel.app
// When unset, every origin is allowed (convenient for local development).
const allowed = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const corsOrigin = allowed.length ? allowed : '*';

module.exports = { corsOrigin };
