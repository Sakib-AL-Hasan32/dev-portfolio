/**
 * /projects/ — search, category + technology filters and pagination (9 per page), all animated,
 * no page reloads. Cards are pre-rendered by the build; each carries data-category, data-tech and
 * data-search. State is mirrored in the URL (?q=&category=&tech=&page=) so results can be shared.
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
  const pager = $('[data-pagination]');
  const PAGE_SIZE = 9;
  const empty = $('[data-empty]');
  const total = cards.length;

  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get('q') || '',
    cat: params.get('category') || '',
    tech: params.get('tech') || '',
    page: Math.max(1, parseInt(params.get('page'), 10) || 1),
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
    if (state.page > 1) p.set('page', String(state.page));
    const qs = p.toString();
    // keep the router's history state (needed for Back)
    history.replaceState(history.state, '', qs ? `?${qs}` : location.pathname);
  }

  function updateText(matched, start, shown, pages) {
    const filtered = state.q || state.cat || state.tech;
    const range = pages > 1 ? `${start + 1}–${start + shown}` : String(matched);
    results.innerHTML = `Showing <b>${range}</b> of ${matched}${filtered ? ` · filtered from ${total}` : ''}`;
    empty.hidden = matched !== 0;
  }

  /* ---------- Pagination controls ---------- */
  const arrow = (d) =>
    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d < 0 ? '<path d="m15 18-6-6 6-6"/>' : '<path d="m9 18 6-6-6-6"/>'}</svg>`;
  function renderPager(pages) {
    if (!pager) return;
    pager.hidden = pages <= 1;
    if (pages <= 1) return;
    let html = `<button type="button" class="pagination__btn pagination__arrow" data-page="${state.page - 1}" aria-label="Previous page"${state.page === 1 ? ' disabled' : ''}>${arrow(-1)}</button>`;
    for (let n = 1; n <= pages; n++) {
      const on = n === state.page;
      html += `<button type="button" class="pagination__btn${on ? ' is-active' : ''}" data-page="${n}" aria-label="Page ${n}"${on ? ' aria-current="page"' : ''}>${n}</button>`;
    }
    html += `<button type="button" class="pagination__btn pagination__arrow" data-page="${state.page + 1}" aria-label="Next page"${state.page === pages ? ' disabled' : ''}>${arrow(1)}</button>`;
    pager.innerHTML = html;
  }

  /* ---------- Apply with FLIP ---------- */
  let token = 0;
  function apply({ animate = true, dir = 0 } = {}) {
    const run = ++token;
    const matched = cards.filter(matches);
    const pages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
    state.page = Math.min(Math.max(1, state.page), pages);
    const start = (state.page - 1) * PAGE_SIZE;
    const want = new Set(matched.slice(start, start + PAGE_SIZE));
    syncUrl();
    updateText(matched.length, start, want.size, pages);
    renderPager(pages);

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
        dir
          ? { opacity: [1, 0], translate: ['0 0', `${-dir * 48}px 0`], filter: ['blur(0px)', 'blur(6px)'] }
          : { opacity: [1, 0], scale: ['1', '0.92'], filter: ['blur(0px)', 'blur(6px)'] },
        { duration: dir ? 260 : 200, easing: 'ease-in', fill: 'forwards' },
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
          dir
            ? { opacity: [0, 1], translate: [`${dir * 48}px 0`, '0 0'], filter: ['blur(6px)', 'blur(0px)'] }
            : { opacity: [0, 1], scale: ['0.94', '1'], translate: ['0 20px', '0 0'] },
          { duration: 620, delay: 60 + i * 50, easing: EASE_OUT, fill: 'backwards' },
        );
        a.id = 'flip';
      });
    });
  }

  /* ---------- Events ---------- */
  const onSearch = debounce(() => {
    state.q = search.value;
    state.page = 1;
    apply();
  }, 140);
  search.addEventListener('input', onSearch);
  search.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && search.value) {
      search.value = '';
      state.q = '';
      state.page = 1;
      apply();
    }
  });

  techSelect.addEventListener('change', () => {
    state.tech = techSelect.value;
    state.page = 1;
    apply();
  });

  catWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn || btn.dataset.cat === state.cat) return;
    state.cat = btn.dataset.cat;
    state.page = 1;
    movePill();
    apply();
  });

  $('[data-filter-reset]')?.addEventListener('click', () => {
    state.q = state.cat = state.tech = '';
    state.page = 1;
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

  // Page buttons: slide the grid to the next/previous page and bring it into view.
  pager?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled) return;
    const next = parseInt(btn.dataset.page, 10);
    if (!next || next === state.page) return;
    const dir = next > state.page ? 1 : -1;
    state.page = next;
    apply({ dir });
    const top = results.getBoundingClientRect().top + scrollY - 110;
    if (scrollY > top) scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
  });

  movePill(true);
  document.fonts?.ready.then(() => movePill(true));
  addEventListener('resize', debounce(() => movePill(true), 100));
  apply({ animate: false });
}
