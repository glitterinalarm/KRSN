import { readFileSync, writeFileSync } from 'fs';

const BLOB_URL = 'https://2vfzwmqqws8h2xfv.public.blob.vercel-storage.com/paraffine/site-data.json';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchData() {
  try {
    const res = await fetch(BLOB_URL + '?t=' + Date.now());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('[build] Blob unreachable, skipping SEO inject:', e.message);
    return null;
  }
}

function worksHtml(works) {
  if (!works?.length) return '';
  return works.map(w => `
  <article>
    <h2>${esc(w.title)}</h2>
    ${w.category ? `<p>${esc(w.category)}</p>` : ''}
    ${w.description ? `<p>${esc(w.description)}</p>` : ''}
  </article>`).join('');
}

function labHtml(lab) {
  if (!lab?.length) return '';
  return lab.map(l => {
    const desc = typeof l.description === 'string'
      ? l.description
      : (l.description?.en || l.description?.fr || '');
    return `
  <article>
    <h2>${esc(l.title)}</h2>
    ${l.category ? `<p>${esc(l.category)}</p>` : ''}
    ${desc ? `<p>${esc(desc)}</p>` : ''}
  </article>`;
  }).join('');
}

function inject(html, marker, content) {
  const start = `<!-- ${marker}_START -->`;
  const end = `<!-- ${marker}_END -->`;
  if (!html.includes(start) || !html.includes(end)) return html;
  const section = content
    ? `<section class="seo-static" aria-label="Projects">${content}\n</section>`
    : '';
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  return html.replace(re, `${start}${section}${end}`);
}

const data = await fetchData();
if (!data) process.exit(0);

const workRaw = readFileSync('work.html', 'utf8');
writeFileSync('work.html', inject(workRaw, 'SEO_INJECT_WORKS', worksHtml(data.works)));
console.log(`[build] Works injected: ${data.works?.length ?? 0} items`);

const labRaw = readFileSync('lab.html', 'utf8');
writeFileSync('lab.html', inject(labRaw, 'SEO_INJECT_LAB', labHtml(data.lab)));
console.log(`[build] Lab injected: ${data.lab?.length ?? 0} items`);

// Update sitemap <lastmod> for dynamic pages
const today = new Date().toISOString().split('T')[0];
const sitemapRaw = readFileSync('sitemap.xml', 'utf8');
const sitemapUpdated = sitemapRaw
  .replace(/(<url>\s*<loc>https:\/\/paraffine\.studio\/(?:work|lab|insights)[^<]*<\/loc>)(\s*(?:<lastmod>[^<]*<\/lastmod>\s*)?)/g,
    (_, locPart, rest) => `${locPart}\n    <lastmod>${today}</lastmod>\n    `)
  .replace(/(<url>\s*<loc>https:\/\/paraffine\.studio\/<\/loc>)(\s*(?:<lastmod>[^<]*<\/lastmod>\s*)?)/g,
    (_, locPart) => `${locPart}\n    <lastmod>${today}</lastmod>\n    `);
writeFileSync('sitemap.xml', sitemapUpdated);
console.log(`[build] Sitemap lastmod updated: ${today}`);
