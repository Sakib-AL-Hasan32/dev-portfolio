/** Small helpers shared by all templates (run at build time in Node). */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape text for safe use in HTML content and attributes. */
export const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ESC[c]);

/** Always get an array (undefined → [], string → [string]). */
export const asArray = (v) => (v == null || v === '' ? [] : Array.isArray(v) ? v : [v]);

/** Normalise an image entry ('path' or {src, alt, caption}). */
export const normImage = (img, fallbackAlt = '') =>
  typeof img === 'string' ? { src: img, alt: fallbackAlt } : { alt: fallbackAlt, ...img };

/** Normalise a feature entry ('text' or {title, description}). */
export const normFeature = (f) => (typeof f === 'string' ? { title: f } : f);

export const isExternal = (url = '') => /^(https?:)?\/\//.test(url);

/** Prefix a src/-relative asset path with the page root, leave URLs alone. */
export const assetUrl = (root, p) => (!p ? '' : isExternal(p) || p.startsWith('data:') ? p : root + p.replace(/^\/+/, ''));

const STATUS = {
  completed: 'Completed',
  'in-progress': 'In progress',
  maintained: 'Maintained',
  archived: 'Archived',
  planned: 'Planned',
};
export const statusLabel = (s) => (s ? STATUS[s] || s : '');

/** Deterministic warm hue (crimson → orange → amber) for generated covers, from a string. */
export function hueFor(str) {
  let h = 0;
  for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const palette = [355, 8, 18, 28, 2, 14, 36, 22]; // warm: crimson → orange → amber
  return palette[h % palette.length];
}

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Format 'YYYY-MM' or 'YYYY-MM-DD' as 'Jan 2025'. */
export function formatDate(d) {
  if (!d) return '';
  const [y, m] = String(d).split('-');
  if (!m) return y;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(m) - 1] || ''} ${y}`.trim();
}

/** Join paragraphs (string or string[]) into <p> tags. */
export const paragraphs = (v, cls = '') =>
  asArray(v)
    .map((p) => `<p${cls ? ` class="${cls}"` : ''}>${esc(p)}</p>`)
    .join('');
