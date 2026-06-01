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
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(BLOB_URL + '?t=' + Date.now(), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('[build] Blob unreachable, skipping SEO inject:', e.message);
    return null;
  }
}

function inject(html, marker, content) {
  const start = `<!-- ${marker}_START -->`;
  const end = `<!-- ${marker}_END -->`;
  if (!html.includes(start) || !html.includes(end)) return html;
  const section = content
    ? `<section class="seo-static" aria-label="${marker.toLowerCase().replace(/_/g,' ')}">${content}\n</section>`
    : '';
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  return html.replace(re, `${start}${section}${end}`);
}

function worksHtml(works) {
  if (!works?.length) return '';
  return works.map(w => `
  <article>
    <h2>${esc(w.title)}</h2>
    ${w.category ? `<p>${esc(w.category)}</p>` : ''}
    ${w.year ? `<p>${esc(w.year)}</p>` : ''}
    ${w.description ? `<p>${esc(w.description)}</p>` : ''}
  </article>`).join('');
}

function labHtml(lab) {
  if (!lab?.length) return '';
  return lab.map(l => {
    const desc = typeof l.description === 'string'
      ? l.description
      : (l.description?.fr || l.description?.en || '');
    return `
  <article>
    <h2>${esc(l.title)}</h2>
    ${l.meta ? `<p>${esc(l.meta)}</p>` : ''}
    ${desc ? `<p>${esc(desc)}</p>` : ''}
    ${l.link ? `<a href="${esc(l.link)}">${esc(l.title)}</a>` : ''}
  </article>`;
  }).join('');
}

function insightsHtml(insights) {
  if (!insights?.length) return '';
  return `
  <h2>Kérosène — Veille créative</h2>
  <p>Sélection d'articles et de références sur le motion design, le branding, la culture visuelle et l'IA créative. Curatée par Germain Trillat via PARAFFINE studio.</p>
  ` + insights.map(i => `
  <article>
    <h3>${esc(i.title)}</h3>
    ${i.description ? `<p>${esc(i.description)}</p>` : ''}
    ${i.link ? `<a href="${esc(i.link)}" rel="noopener">${esc(i.title)}</a>` : ''}
  </article>`).join('');
}

function studioHtml(studio) {
  if (!studio) return '';
  const bio = typeof studio.bio === 'string' ? studio.bio : (studio.bio?.fr || studio.bio?.en || '');
  const cleanBio = bio.replace(/<[^>]+>/g, ' ').trim();
  const clients = (studio.clients || []).join(', ');
  const awards = (studio.awards || []).map(a => `${a.name} — ${a.client} (${a.year})`).join('. ');
  return `
  <h2>Germain Trillat — Creative Director</h2>
  ${cleanBio ? `<p>${esc(cleanBio)}</p>` : ''}
  ${clients ? `<p>Clients : ${esc(clients)}</p>` : ''}
  ${awards ? `<p>Récompenses : ${esc(awards)}</p>` : ''}
  <p>Contact : germain@paraffine.studio</p>
  <p>
    <a href="https://www.linkedin.com/in/germaintrillat">LinkedIn</a>
    <a href="https://www.behance.net/glitterinalarm">Behance</a>
    <a href="https://www.instagram.com/glitterin77alarm">Instagram</a>
  </p>`;
}

function homeHtml(data) {
  const bio = data?.studio?.bio;
  const cleanBio = (typeof bio === 'string' ? bio : (bio?.fr || bio?.en || ''))
    .replace(/<[^>]+>/g, ' ').trim();
  const labTitles = (data?.lab || []).map(l => esc(l.title)).join(', ');
  return `
  <h2>Germain Trillat — Directeur créatif, Paris</h2>
  ${cleanBio ? `<p>${esc(cleanBio)}</p>` : ''}
  <p>Fondateur de PARAFFINE studio — direction artistique, motion design, branding et IA générative.</p>
  ${labTitles ? `<p>Projets Lab : ${labTitles}</p>` : ''}
  <p>Kérosène — veille créative curatée par IA à destination des créatifs et directeurs artistiques.</p>`;
}

const data = await fetchData();
if (!data) process.exit(0);

// work.html
const workRaw = readFileSync('work.html', 'utf8');
writeFileSync('work.html', inject(workRaw, 'SEO_INJECT_WORKS', worksHtml(data.works)));
console.log(`[build] Works injected: ${data.works?.length ?? 0} items`);

// lab.html — lab projects + insights
let labRaw = readFileSync('lab.html', 'utf8');
labRaw = inject(labRaw, 'SEO_INJECT_LAB', labHtml(data.lab));
labRaw = inject(labRaw, 'SEO_INJECT_INSIGHTS', insightsHtml(data.insights));
writeFileSync('lab.html', labRaw);
console.log(`[build] Lab injected: ${data.lab?.length ?? 0} items, Insights: ${data.insights?.length ?? 0}`);

// studio.html
const studioRaw = readFileSync('studio.html', 'utf8');
writeFileSync('studio.html', inject(studioRaw, 'SEO_INJECT_STUDIO', studioHtml(data.studio)));
console.log(`[build] Studio injected`);

// index.html
const indexRaw = readFileSync('index.html', 'utf8');
writeFileSync('index.html', inject(indexRaw, 'SEO_INJECT_HOME', homeHtml(data)));
console.log(`[build] Home injected`);

// sitemap — update lastmod
const today = new Date().toISOString().split('T')[0];
const sitemapRaw = readFileSync('sitemap.xml', 'utf8');
const sitemapUpdated = sitemapRaw
  .replace(/(<lastmod>)[^<]*(<\/lastmod>)/g, `$1${today}$2`);
writeFileSync('sitemap.xml', sitemapUpdated);
console.log(`[build] Sitemap lastmod updated: ${today}`);
