const { put, head } = require('@vercel/blob');
const crypto = require('crypto');

const BLOB_KEY = 'paraffine/site-data.json';

async function getBlobUrl() {
  const base = 'https://2vfzwmqqws8h2xfv.public.blob.vercel-storage.com/' + BLOB_KEY;
  return base;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const url = await getBlobUrl();
      const response = await fetch(url + '?t=' + Date.now());
      if (!response.ok) throw new Error('Blob not found');
      const data = await response.json();
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json(data);
    } catch (e) {
      return res.status(404).json({ error: 'Data not found', detail: e.message });
    }
  }

  if (req.method === 'POST') {
    const key = req.headers['x-admin-key'];

    // Même logique que auth.js : Blob en priorité, sinon env var
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

    const validToken = crypto.createHmac('sha256', expected).update('session').digest('hex');
    if (!expected || key !== validToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      let body = '';
      await new Promise((resolve, reject) => {
        req.on('data', chunk => body += chunk);
        req.on('end', resolve);
        req.on('error', reject);
      });

      const data = JSON.parse(body);

      await put(BLOB_KEY, JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
