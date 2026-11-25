/**
 * /projects/ — search, category + technology filters with FLIP animations.
 * Cards are pre-rendered by the build; each carries data-category, data-tech and data-search.
 * Filter state is mirrored in the URL (?q=&category=&tech=) so results can be shared.
 */
import { $, $$, reducedMotion, debounce, EASE_OUT } from './utils.js';
import { markRevealed } from './reveal.js';

export function initProjectsPage() {
  const grid = $('[data-projects-grid]');
  if (!grid) return;
  const cards = $$('.pcard', grid);
  const search = $('[data-filter-search]');
  const techSelect = $('[data-filter-tech]');
  const catWrap = $('[data-filter-cats]');
  const catBtns = $$('[data-cat]', catWrap);
  const pill = $('.segmented__pill', catWrap);
  const results = $('[data-results]');
  const empty = $('[data-empty]');
  const total = cards.length;

  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    cat: params.get('category') || '',
    tech: params.get('tech') || '',
  };
  if (!catBtns.some((b) => b.dataset.cat === state.cat)) state.cat = '';
  if (![...techSelect.options].some((o) => o.value === state.tech)) state.tech = '';
  search.value = state.q;
  techSelect.value = state.tech;

  /* ---------- Category pill ---------- */
  function movePill(instant = false) {
    const btn = catBtns.find((b) => b.dataset.cat === state.cat) || catBtns[0];
    if (instant) pill.classList.add('no-anim');
    pill.style.setProperty('--sx', `${btn.offsetLeft}px`);
    pill.style.setProperty('--sy', `${btn.offsetTop}px`);
    pill.style.setProperty('--sw', `${btn.offsetWidth}px`);
    pill.style.setProperty('--sh', `${btn.offsetHeight}px`);
    if (instant) requestAnimationFrame(() => requestAnimationFrame(() => pill.classList.remove('no-anim')));
    for (const b of catBtns) {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    }
  }

  /* ---------- Matching ---------- */
  const matches = (card) => {
    const terms = state.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (state.cat && card.dataset.category !== state.cat) return false;
    if (state.tech && !card.dataset.tech.split('|').includes(state.tech)) return false;
    return terms.every((t) => card.dataset.search.includes(t));
  };

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.cat) p.set('category', state.cat);
    if (state.tech) p.set('tech', state.tech);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
  }

  function updateText(count) {
    const filtered = state.q || state.cat || state.tech;
    results.innerHTML = `Showing <b>${count}</b> of ${total}${filtered ? ' · filtered' : ''}`;
    empty.hidden = count !== 0;
  }

  /* ---------- Apply with FLIP ---------- */
  let token = 0;
  function apply({ animate = true } = {}) {
    const run = ++token;
    syncUrl();
    const want = new Set(cards.filter(matches));
    updateText(want.size);

    // Finish anything still running so measurements are clean.
    cards.forEach((c) => c.getAnimations().forEach((a) => a.id === 'flip' && a.finish()));

    const visible = cards.filter((c) => !c.classList.contains('is-hidden'));
    const leaving = visible.filter((c) => !want.has(c));
    const entering = cards.filter((c) => c.classList.contains('is-hidden') && want.has(c));
    const staying = visible.filter((c) => want.has(c));

    if (!animate || reducedMotion()) {
      leaving.forEach((c) => c.classList.add('is-hidden'));
      entering.forEach((c) => {
        c.classList.remove('is-hidden');
        markRevealed(c);
      });
      return;
    }

    const outAnims = leaving.map((c) => {
      const a = c.animate(
        { opacity: [1, 0], scale: ['1', '0.92'], filter: ['blur(0px)', 'blur(6px)'] },
        { duration: 200, easing: 'ease-in', fill: 'forwards' },
      );
      a.id = 'flip';
      return a.finished.catch(() => {});
    });

    Promise.all(outAnims).then(() => {
      if (run !== token) return;
      const first = new Map(staying.map((c) => [c, c.getBoundingClientRect()]));
      leaving.forEach((c) => {
        c.classList.add('is-hidden');
        c.getAnimations().forEach((a) => a.cancel());
      });
      entering.forEach((c) => {
        c.classList.remove('is-hidden');
        markRevealed(c);
      });

      staying.forEach((c) => {
        const f = first.get(c);
        const l = c.getBoundingClientRect();
        const dx = f.left - l.left;
        const dy = f.top - l.top;
        if (!dx && !dy) return;
        const a = c.animate({ translate: [`${dx}px ${dy}px`, '0 0'] }, { duration: 600, easing: EASE_OUT });
        a.id = 'flip';
      });
      entering.forEach((c, i) => {
        const a = c.animate(
          { opacity: [0, 1], scale: ['0.94', '1'], translate: ['0 20px', '0 0'] },
          { duration: 620, delay: 80 + i * 60, easing: EASE_OUT, fill: 'backwards' },
        );
        a.id = 'flip';
      });
    });
  }

  /* ---------- Events ---------- */
  const onSearch = debounce(() => {
    state.q = search.value;
    apply();
  }, 140);
  search.addEventListener('input', onSearch);
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && search.value) {
      search.value = '';
      state.q = '';
      apply();
    }
  });

  techSelect.addEventListener('change', () => {
    state.tech = techSelect.value;
    apply();
  });

  catWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn || btn.dataset.cat === state.cat) return;
    state.cat = btn.dataset.cat;
    movePill();
    apply();
  });

  $('[data-filter-reset]')?.addEventListener('click', () => {
    state.q = state.cat = state.tech = '';
    search.value = '';
    techSelect.value = '';
    movePill();
    apply();
    search.focus();
  });

  // "/" focuses search (when not already typing somewhere).
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
    const t = e.target;
    if (t.closest('input, textarea, select, [contenteditable]')) return;
    e.preventDefault();
    search.focus();
  });

  movePill(true);
  document.fonts?.ready.then(() => movePill(true));
  addEventListener('resize', debounce(() => movePill(true), 100));
  apply({ animate: false });
}
