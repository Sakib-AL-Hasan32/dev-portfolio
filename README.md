# Sakibul Hasan Sakib — Portfolio

Personal portfolio built with **plain HTML, CSS and JavaScript**: no frameworks, no npm packages, no runtime libraries.
A small Node script turns the templates and data files into static pages, and **GitHub Actions** deploys them to **GitHub Pages**.

- `/`: home (hero, about, skills, featured projects, training, achievements, contact)
- `/projects/`: all projects, with search, a category filter and a technology filter
- `/projects/<slug>/`: a detail page for each project, generated automatically

---

## Quick start

You need Node.js 20 or newer. Nothing to install from npm.

```bash
node scripts/dev.mjs     # builds, serves http://localhost:5173 and live-reloads when src/ changes
node scripts/build.mjs   # production build → dist/
```

(`npm run dev` / `npm run build` do the same thing.)

---

## Common edits

| What | Where |
| --- | --- |
| Name, title, email, LinkedIn, GitHub | `src/data/site.js` |
| **Projects** | `src/data/projects.js` |
| Skills / tech stack | `src/data/skills.js` |
| Training (Ostad) & achievements | `src/data/achievements.js` |
| Hero, About and Contact text | `src/pages/index.html` |
| Colours, fonts, spacing | `src/assets/css/tokens.css` |

### Add a project

Add one object to the `projects` array in `src/data/projects.js`:

```js
{
  id: 9,
  slug: 'my-new-project',            // URL: /projects/my-new-project/
  title: 'My New Project',
  shortDescription: 'One sentence for the card.',
  category: 'Backend API',           // a new category gets its own filter chip automatically
  technologies: ['Java', 'Spring Boot', 'PostgreSQL'],
  // everything below is optional — leave it out and that section is simply hidden
  fullDescription: ['Paragraph one.', 'Paragraph two.'],
  features: [{ title: 'Feature', description: 'What it does.' }],
  architecture: 'Microservices',
  githubUrl: 'https://github.com/…',
  status: 'completed',               // completed | in-progress | maintained | archived | planned
  featured: true,                    // also show it on the home page (first 4 featured are used)
  thumbnail: 'assets/images/projects/my-new-project/cover.webp',
  gallery: [{ src: 'assets/images/projects/my-new-project/1.webp', alt: 'Dashboard', caption: 'Admin dashboard' }],
}
```

Push it. The card, its filters, the project count, the previous/next links, `sitemap.xml` and the detail page all update on their own.
Every field is documented at the top of `projects.js`, and the types are in `src/data/types.js`.

Images go under `src/assets/images/…`. If a listed image file doesn't exist, the build warns you and skips it, so the site never shows a broken image. A project without a thumbnail gets a generated cover.

### Add your photo

Put a portrait (about 4:5, for example 800×1000) at **`src/assets/images/profile.jpg`**.
Until that file exists, the hero shows an initials placeholder. To use a different file name, change `profileImage` in `site.js`.

### Turn on the contact form

The form sends email through [Web3Forms](https://web3forms.com) (free):

1. On web3forms.com, enter the email address that should receive messages. They send you an access key.
2. Paste the key into `web3formsAccessKey` in `src/data/site.js`. The key is meant to be public.

Until a key is set, the form says it isn't connected and opens the visitor's email app with the message filled in instead. It never shows a fake "sent" message.

---

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch.
   - If the repo is named `<username>.github.io`, the site is served at `https://<username>.github.io/`.
   - Any other name is served at `https://<username>.github.io/<repo>/`. Both work, because every link is relative.
2. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it. You can also start it by hand from the **Actions** tab.

The workflow passes the site's base URL to the build, which fills in canonical URLs, `sitemap.xml` and the 404 page links. For a custom domain, set `url` in `site.js`.

---

## How it's built

```
src/
  data/        site, projects, skills, achievements   ← content lives here
  pages/       HTML shells with {{placeholders}}
  templates/   JS functions that render cards, sections and the project detail page
  assets/
    css/       tokens · base · components · sections · pages · motion  (bundled into styles.css)
    js/        browser modules (theme, nav, reveal, hero, effects, filters, lightbox, contact)
    images/
scripts/
  build.mjs    renders everything into dist/ and checks every internal link
  dev.mjs      local server with rebuild and live reload
```

**Animations** are all hand-written: CSS keyframes, the Web Animations API, IntersectionObserver, and the View Transitions API. That covers:

- smooth page transitions, and a project cover that morphs from its card into the detail page
- a circular reveal when switching theme
- split-text entrances in the hero
- scroll reveals and count-up numbers
- a sliding nav indicator
- 3D tilt, cursor spotlights and magnetic buttons
- FLIP animations when filtering projects
- a timeline that fills as you scroll
- a scroll progress bar and back-to-top ring

Everything respects `prefers-reduced-motion`. Browsers without cross-document View Transitions (currently Firefox) get a simple fade instead.

**Theme:** the site follows the system setting until the visitor picks one. The choice is saved in `localStorage` and applied before the first paint, so the wrong theme never flashes.
