/**
 * Entry point — loaded once as a module.
 * Page features are (re)initialised by the router after every in-site navigation;
 * each feature initialises only if its markup is present.
 */
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initHero } from './hero.js';
import { initReveal } from './reveal.js';
import { initEffects } from './effects.js';
import { initChrome, initPageLinks } from './transitions.js';
import { initProjectsPage } from './projects-page.js';
import { initDetail } from './detail.js';
import { initContact } from './contact.js';
import { initSkills } from './skills.js';
import { initCodeWindow } from './code-window.js';
import { initRouter } from './router.js';
import { initViewToggle } from './view-toggle.js';
import { initCourses } from './courses.js';
import { initReadMore } from './readmore.js';

function initPage() {
  const page = document.body.dataset.page;
  initTheme();
  initNav();
  initHero();
  initSkills();
  initCodeWindow();
  initReveal();
  initEffects();
  initPageLinks();
  initViewToggle();
  initCourses();
  initReadMore();
  if (page === 'projects') initProjectsPage();
  if (page === 'project') initDetail();
  if (document.querySelector('[data-contact-form], [data-copy]')) initContact();
}

initChrome(); // scroll progress + back-to-top (persist across pages)
initRouter(initPage); // runs initPage now and after every in-site navigation
