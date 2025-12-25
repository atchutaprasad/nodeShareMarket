const crypto = require('crypto');

function safeCompare(a, b) {
  // constant-time comparison
  const keyA = Buffer.from(a || '');
  const keyB = Buffer.from(b || '');
  if (keyA.length !== keyB.length) return false;
  return crypto.timingSafeEqual(keyA, keyB);
}

module.exports = function basicAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required. Contact site admin at india2010@gmail.com');
  }
  const b64 = auth.slice(6);
  let creds;
  try {
    creds = Buffer.from(b64, 'base64').toString('utf8');
  } catch (e) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Invalid authentication token. Contact site admin at india2010@gmail.com');
  }
  const idx = creds.indexOf(':');
  if (idx < 0) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Invalid authentication token. Contact site admin at india2010@gmail.com');
  }
  const user = creds.slice(0, idx);
  const pass = creds.slice(idx + 1);
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin';
  if (safeCompare(user, adminUser) && safeCompare(pass, adminPass)) {
    return next();
  }
  res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
  return res.status(401).send('Authentication failed., contact site admin at india2010@gmail.com');
};
