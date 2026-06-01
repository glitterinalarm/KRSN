const crypto = require('crypto');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = '';
  await new Promise((resolve, reject) => {
    req.on('data', chunk => body += chunk);
    req.on('end', resolve);
    req.on('error', reject);
  });

  const { password } = JSON.parse(body);
  if (!password) return res.status(400).json({ error: 'Missing password' });

  const hash = crypto.createHash('sha256').update(password).digest('hex');

  // Vérifie d'abord un hash resetté (stocké dans Blob), sinon env var
  let expected = process.env.ADMIN_HASH;
  try {
    const { list } = require('@vercel/blob');
    const { blobs } = await list({ prefix: 'admin_hash' });
    if (blobs.length > 0) {
      const r = await fetch(blobs[0].url);
      const stored = (await r.text()).trim();
      if (stored) expected = stored;
    }
  } catch (_) {}

  if (!expected) return res.status(500).json({ error: 'Server misconfigured' });
  if (hash !== expected) return res.status(401).json({ error: 'Invalid password' });

  // Token = HMAC signé avec ADMIN_HASH — valide côté API sans état
  const token = crypto.createHmac('sha256', expected).update('session').digest('hex');
  return res.status(200).json({ token });
};
