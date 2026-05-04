/**
 * PARAFFINE — Language Utility
 * Simple FR/EN toggle stored in localStorage.
 * No auto-translation. Manual content in site_data.json.
 */

const LANG_KEY = 'prffn_lang';

/** Get current language ('fr' or 'en') */
function getLang() {
  return localStorage.getItem(LANG_KEY) || 'fr';
}

/** Set language and re-apply without full reload */
function setLang(l) {
  localStorage.setItem(LANG_KEY, l);
  applyLang();
}

/**
 * Translate a bilingual field.
 * field can be a string (returned as-is) or { fr: '...', en: '...' }
 */
function t(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  const lang = getLang();
  return field[lang] || field['fr'] || '';
}

/**
 * Apply current language to all elements with data-fr / data-en attributes.
 * Also handles data-fr-placeholder / data-en-placeholder for inputs.
 * Updates lang toggle button active state.
 */
function applyLang() {
  const lang = getLang();

  // Text content
  document.querySelectorAll('[data-fr]').forEach(el => {
    el.textContent = lang === 'en'
      ? (el.dataset.en || el.dataset.fr)
      : el.dataset.fr;
  });

  // HTML content (for elements with rich text)
  document.querySelectorAll('[data-fr-html]').forEach(el => {
    el.innerHTML = lang === 'en'
      ? (el.dataset.enHtml || el.dataset.frHtml)
      : el.dataset.frHtml;
  });

  // Placeholder attributes
  document.querySelectorAll('[data-fr-placeholder]').forEach(el => {
    el.placeholder = lang === 'en'
      ? (el.dataset.enPlaceholder || el.dataset.frPlaceholder)
      : el.dataset.frPlaceholder;
  });

  // Lang toggle button states
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/** Call once on DOMContentLoaded to init lang state */
function initLang() {
  applyLang();
}
