#!/usr/bin/env node
/**
 * Static site build — Node built-ins only, no npm install required.
 *
 *   node scripts/build.mjs
 *
 * Renders src/pages/*.html with data from src/data/, writes one detail page per project
 * to dist/projects/<slug>/index.html, bundles CSS, copies assets, writes sitemap/robots
 * and finally checks every internal link in dist/.
 *
 * Env (set automatically by the GitHub Pages workflow):
 *   BASE_PATH  e.g. "/portfolio" for project sites, "" for user sites (used by 404.html)
 *   SITE_URL   absolute site URL for canonical tags + sitemap (if site.url is empty)
 */
import fs from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const { site } = await import('../src/data/site.js');
const { projects } = await import('../src/data/projects.js');
const { skillGroups } = await import('../src/data/skills.js');
const { training, achievements } = await import('../src/data/achievements.js');
const L = await import('../src/templates/layout.js');
const C = await import('../src/templates/components.js');
const { projectDetail } = await import('../src/templates/detail.js');
const { icon } = await import('../src/templates/icons.js');
const { esc, asArray, isExternal, normImage } = await import('../src/templates/util.js');

const started = Date.now();
const BASE_PATH = (process.env.BASE_PATH || '').replace(/\/+$/, '');
if (!site.url && process.env.SITE_URL) site.url = process.env.SITE_URL.replace(/\/+$/, '');

const warnings = [];
const warn = (m) => warnings.push(m);
const fail = (m) => {
  console.error(`\n✖ ${m}\n`);
  process.exit(1);
};

/* ───────────────────────── Validate project data ───────────────────────── */

const slugs = new Set();
for (const [i, p] of projects.entries()) {
  const where = `projects[${i}]${p?.slug ? ` (${p.slug})` : ''}`;
  for (const key of ['id', 'slug', 'title', 'shortDescription', 'category']) {
    if (p[key] == null || p[key] === '') fail(`${where} is missing required field "${key}" in src/data/projects.js`);
  }
  if (!Array.isArray(p.technologies)) fail(`${where}: "technologies" must be an array`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) fail(`${where}: slug "${p.slug}" must be lowercase-with-dashes`);
  if (slugs.has(p.slug)) fail(`${where}: duplicate slug "${p.slug}"`);
  slugs.add(p.slug);

  // Local images that don't exist are dropped (with a warning) so the site never shows broken images.
  const localMissing = (src) => src && !isExternal(src) && !existsSync(path.join(SRC, src));
  if (localMissing(p.thumbnail)) {
    warn(`${p.slug}: thumbnail "${p.thumbnail}" not found — using generated cover`);
    p.thumbnail = undefined;
  }
  for (const key of ['gallery', 'screenshots']) {
    if (!p[key]) continue;
    p[key] = asArray(p[key]).filter((img) => {
      const { src } = normImage(img);
      if (localMissing(src)) {
        warn(`${p.slug}: ${key} image "${src}" not found — skipped`);
        return false;
      }
      return true;
    });
  }
}

/* ───────────────────────── Assets: CSS bundle + version ───────────────────────── */

await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

const CSS_ORDER = ['tokens', 'base', 'components', 'sections', 'pages', 'motion', 'mobile'];
const cssDir = path.join(SRC, 'assets', 'css');
const cssFiles = (await fs.readdir(cssDir)).filter((f) => f.endsWith('.css'));
cssFiles.sort((a, b) => {
  const ia = CSS_ORDER.indexOf(a.replace('.css', ''));
  const ib = CSS_ORDER.indexOf(b.replace('.css', ''));
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
});
let css = '';
for (const f of cssFiles) css += `/* ── ${f} ── */\n${await fs.readFile(path.join(cssDir, f), 'utf8')}\n`;

async function copyDir(from, to, skip = () => false) {
  await fs.mkdir(to, { recursive: true });
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    if (skip(a)) continue;
    if (entry.isDirectory()) await copyDir(a, b, skip);
    else await fs.copyFile(a, b);
  }
}
await copyDir(path.join(SRC, 'assets'), path.join(DIST, 'assets'), (p) => p === cssDir);
await fs.mkdir(path.join(DIST, 'assets', 'css'), { recursive: true });
await fs.writeFile(path.join(DIST, 'assets', 'css', 'styles.css'), css);

const jsDir = path.join(SRC, 'assets', 'js');
const hash = crypto.createHash('sha1').update(css);
for (const f of (await fs.readdir(jsDir)).sort()) hash.update(await fs.readFile(path.join(jsDir, f)));
const version = hash.digest('hex').slice(0, 8);

// Stamp every relative module import with the build version (./nav.js → ./nav.js?v=…), so after a
// deploy browsers fetch fresh copies of all modules, not just main.js, and never mix old and new files.
const distJs = path.join(DIST, 'assets', 'js');
for (const f of await fs.readdir(distJs)) {
  if (!f.endsWith('.js')) continue;
  const file = path.join(distJs, f);
  const code = await fs.readFile(file, 'utf8');
  const stamped = code.replace(
    /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}\/[^'"?]+\.js)\2/g,
    (_, lead, q, spec) => `${lead}${q}${spec}?v=${version}${q}`,
  );
  await fs.writeFile(file, stamped);
}

/* ───────────────────────── Templating ───────────────────────── */

async function template(name) {
  return fs.readFile(path.join(SRC, 'pages', name), 'utf8');
}

/** Replace {{key}} and {{icon:name}} placeholders. Unknown keys fail the build loudly. */
function fill(tpl, vars, file) {
  return tpl.replace(/\{\{\s*([\w:-]+)\s*\}\}/g, (_, key) => {
    if (key.startsWith('icon:')) return icon(key.slice(5), { size: 18 });
    if (!(key in vars)) fail(`Unknown placeholder {{${key}}} in src/pages/${file}`);
    return String(vars[key]);
  });
}

async function write(rel, html) {
  const out = path.join(DIST, rel);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, html);
}

const pageTitle = (t) => (t ? `${t} — ${site.name}` : `${site.name} — ${site.title}`);

/* ───────────────────────── Home ───────────────────────── */

const featured = (projects.some((p) => p.featured) ? projects.filter((p) => p.featured) : projects).slice(0, 4);

function portrait(root) {
  if (site.profileImage && existsSync(path.join(SRC, site.profileImage))) {
    return `<img class="portrait__img" src="${root}${esc(site.profileImage)}" alt="Portrait of ${esc(site.name)}" width="960" height="1192" fetchpriority="high" decoding="async">`;
  }
  warn(`Profile photo not found at src/${site.profileImage} — showing placeholder`);
  const initials = site.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
  return `<div class="portrait__placeholder" role="img" aria-label="Profile photo placeholder">
      <span class="portrait__initials">${esc(initials)}</span>
      <span class="portrait__ph-ico">${icon('user', { size: 22 })}</span>
    </div>`;
}

{
  const root = './';
  const s = site.socials;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    jobTitle: site.roles.join(', '),
    ...(site.url ? { url: site.url + '/' } : {}),
    email: `mailto:${site.email}`,
    address: { '@type': 'PostalAddress', addressCountry: site.location },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Daffodil International University' },
    sameAs: Object.values(s).map((x) => x.url),
  };
  const html = fill(
    await template('index.html'),
    {
      head: L.head({ title: pageTitle(), root, path: '', version, jsonLd, preconnectCdn: true }),
      chrome: L.chrome(),
      nav: L.nav({ root, page: 'home' }),
      footer: L.footer({ root, page: 'home' }),
      root,
      name: esc(site.name),
      location: esc(site.location),
      email: esc(site.email),
      linkedinUrl: esc(s.linkedin.url),
      linkedinHandle: esc(s.linkedin.handle),
      githubUrl: esc(s.github.url),
      githubHandle: esc(s.github.handle),
      web3formsKey: esc(site.web3formsAccessKey || ''),
      socials: L.socialLinks(),
      portrait: portrait(root),
      cvButton:
        site.cvFile && existsSync(path.join(SRC, site.cvFile))
          ? `<a class="btn btn--soft btn--lg btn--cv" href="${root}${esc(site.cvFile)}" download>${icon('download', { size: 18 })}Download CV</a>`
          : (warn(`CV not found at src/${site.cvFile} — Download CV button shows "Soon"`),
            `<button class="btn btn--soft btn--lg btn--cv" type="button" disabled title="CV coming soon">${icon('download', { size: 18 })}Download CV<span class="course__soon">Soon</span></button>`),
      marquee: C.marquee(skillGroups),
      skills: C.skillsTabs(skillGroups),
      featured: featured.map((p, i) => C.projectCard(p, { root, index: i, featured: true })).join('\n'),
      projectCount: projects.length,
      training: C.trainingCards(training, { root }),
      achievements: C.achievementsTimeline(achievements),
    },
    'index.html',
  );
  await write('index.html', html);
}

/* ───────────────────────── Projects list ───────────────────────── */

{
  const root = '../';
  const categories = [...new Set(projects.map((p) => p.category))];
  const techCount = new Map();
  for (const p of projects) for (const t of p.technologies) techCount.set(t, (techCount.get(t) || 0) + 1);
  const techs = [...techCount.keys()].sort((a, b) => a.localeCompare(b));

  const categoryButtons = [
    `<button type="button" class="segmented__btn is-active" data-cat="" aria-pressed="true">All<span class="segmented__count">${projects.length}</span></button>`,
    ...categories.map(
      (c) =>
        `<button type="button" class="segmented__btn" data-cat="${esc(c)}" aria-pressed="false">${esc(c)}<span class="segmented__count">${projects.filter((p) => p.category === c).length}</span></button>`,
    ),
  ].join('');

  const html = fill(
    await template('projects.html'),
    {
      head: L.head({
        title: pageTitle('Projects'),
        description: `Projects by ${site.name}: Java & Spring Boot backends, REST APIs and AI automation workflows.`,
        root,
        path: 'projects/',
        version,
      }),
      chrome: L.chrome(),
      nav: L.nav({ root, page: 'projects' }),
      footer: L.footer({ root, page: 'projects' }),
      root,
      projectCount: projects.length,
      categoryButtons,
      techOptions: techs.map((t) => `<option value="${esc(t)}">${esc(t)} (${techCount.get(t)})</option>`).join(''),
      grid: projects.map((p, i) => C.projectCard(p, { root, index: i })).join('\n'),
    },
    'projects.html',
  );
  await write('projects/index.html', html);
}

/* ───────────────────────── Project detail pages ───────────────────────── */

{
  const root = '../../';
  const tpl = await template('project.html');
  const n = projects.length;
  for (const [i, p] of projects.entries()) {
    const prev = n > 1 ? projects[(i - 1 + n) % n] : null;
    const next = n > 1 ? projects[(i + 1) % n] : null;
    const html = fill(
      tpl,
      {
        head: L.head({
          title: pageTitle(p.title),
          description: p.shortDescription,
          root,
          path: `projects/${p.slug}/`,
          version,
          type: 'article',
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: p.title,
            description: p.shortDescription,
            author: { '@type': 'Person', name: site.name },
            keywords: p.technologies.join(', '),
            ...(p.githubUrl ? { codeRepository: p.githubUrl } : {}),
          },
        }),
        chrome: L.chrome(),
        nav: L.nav({ root, page: 'project' }),
        footer: L.footer({ root, page: 'project' }),
        detail: projectDetail(p, { root, prev: prev !== p ? prev : null, next: next !== p ? next : null }),
      },
      'project.html',
    );
    await write(`projects/${p.slug}/index.html`, html);
  }
}

/* ───────────────────────── 404 ───────────────────────── */

{
  // GitHub Pages serves 404.html at any missing URL, so links must be absolute here.
  const root = `${BASE_PATH}/`;
  const html = fill(
    await template('404.html'),
    {
      head: L.head({ title: pageTitle('Page not found'), root, version }),
      chrome: L.chrome(),
      nav: L.nav({ root, page: '404' }),
      footer: L.footer({ root, page: '404' }),
      root,
    },
    '404.html',
  );
  await write('404.html', html);
}

/* ───────────────────────── sitemap / robots / .nojekyll ───────────────────────── */

if (site.url) {
  const urls = ['', 'projects/', ...projects.map((p) => `projects/${p.slug}/`)];
  const today = new Date().toISOString().slice(0, 10);
  await write(
    'sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${esc(site.url)}/${u}</loc><lastmod>${today}</lastmod></url>`)
      .join('\n')}\n</urlset>\n`,
  );
}
await write('robots.txt', `User-agent: *\nAllow: /\n${site.url ? `Sitemap: ${site.url}/sitemap.xml\n` : ''}`);
await write('.nojekyll', '');

/* ───────────────────────── Internal link check ───────────────────────── */

async function htmlFiles(dir) {
  const out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const broken = [];
for (const file of await htmlFiles(DIST)) {
  const html = await fs.readFile(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, raw] of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    if (!raw || /^(?:[a-z]+:|\/\/)/i.test(raw)) continue; // external, mailto:, data:, etc.
    const [pathPart, hashPart] = raw.split('#');
    const clean = pathPart.split('?')[0];
    if (!clean) {
      if (hashPart && !ids.has(hashPart)) broken.push(`${path.relative(DIST, file)} → #${hashPart} (no such id)`);
      continue;
    }
    let target = clean.startsWith('/')
      ? path.join(DIST, clean.slice(BASE_PATH.length))
      : path.resolve(path.dirname(file), clean);
    if (clean.endsWith('/') || (existsSync(target) && statSync(target).isDirectory())) target = path.join(target, 'index.html');
    if (!existsSync(target)) {
      broken.push(`${path.relative(DIST, file)} → ${raw}`);
      continue;
    }
    if (hashPart && target.endsWith('.html')) {
      const other = await fs.readFile(target, 'utf8');
      if (!other.includes(`id="${hashPart}"`)) broken.push(`${path.relative(DIST, file)} → ${raw} (no such id)`);
    }
  }
}

/* ───────────────────────── Report ───────────────────────── */

for (const w of [...new Set(warnings)]) console.warn(`  ⚠ ${w}`);
if (broken.length) {
  console.error(`\n✖ ${broken.length} broken internal link(s):\n  ${broken.join('\n  ')}\n`);
  process.exit(1);
}
console.log(`✔ Built ${projects.length + 3} pages (${projects.length} projects) → dist/  [v${version}, ${Date.now() - started} ms]`);
