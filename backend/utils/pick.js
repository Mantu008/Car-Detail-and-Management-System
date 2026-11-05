// Copy only whitelisted keys from a request body (prevents mass assignment).
// Empty strings are dropped so optional numeric fields don't fail casting.
const pick = (source, keys) =>
  keys.reduce((result, key) => {
    if (source[key] !== undefined && source[key] !== '') result[key] = source[key];
    return result;
  }, {});

module.exports = pick;
