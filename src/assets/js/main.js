/**
 * Entry point — loaded as a module on every page.
 * Each feature initialises only if its markup is present.
 */
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initHero } from './hero.js';
import { initReveal } from './reveal.js';
import { initEffects } from './effects.js';
import { initChrome } from './transitions.js';
import { initProjectsPage } from './projects-page.js';
import { initDetail } from './detail.js';
import { initContact } from './contact.js';

const page = document.body.dataset.page;

initTheme();
initNav();
initHero();
initReveal();
initEffects();
initChrome();

if (page === 'projects') initProjectsPage();
if (page === 'project') initDetail();
if (document.querySelector('[data-contact-form], [data-copy]')) initContact();
