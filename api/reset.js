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

  const { resetToken, newPassword } = JSON.parse(body);
  if (!resetToken || !newPassword) return res.status(400).json({ error: 'Missing fields' });

  const expectedReset = process.env.RESET_TOKEN;
  if (!expectedReset) return res.status(500).json({ error: 'Reset not configured' });
  if (resetToken !== expectedReset) return res.status(401).json({ error: 'Invalid reset token' });

  const newHash = crypto.createHash('sha256').update(newPassword).digest('hex');

  // Stocke le nouveau hash dans Vercel Blob
  const { put } = require('@vercel/blob');
  await put('admin_hash.txt', newHash, { access: 'public', addRandomSuffix: false });

  return res.status(200).json({ ok: true });
};
