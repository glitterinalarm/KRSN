const { put, head } = require('@vercel/blob');

const BLOB_KEY = 'paraffine/site-data.json';
const ADMIN_HASH = 'cecd08cd2d64e39f8266e707b2e3d32cb687cb0b5b6b4bde2b1086b31e1f716e';

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
    if (key !== ADMIN_HASH) {
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
