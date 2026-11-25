/**
 * About section: the Developer.java window types itself out when it scrolls into view —
 * character by character, keeping the syntax colours, with a blinking cursor — then shows
 * a "Compiled successfully" status line. Reduced motion shows the finished code at once.
 */
import { $, $$, reducedMotion } from './utils.js';

function finish(win) {
  win.classList.add('is-done');
}

function type(win) {
  const lines = $$('.ln', win);
  // Remember every text node's full text, then empty it; typing restores it char by char.
  const plan = lines.map((ln) => {
    const nodes = [];
    const walker = document.createTreeWalker(ln, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    return nodes.map((node) => {
      const text = node.textContent;
      node.textContent = '';
      return { node, text };
    });
  });

  const caret = document.createElement('span');
  caret.className = 'code-caret';
  caret.setAttribute('aria-hidden', 'true');
  win.classList.add('is-typing');

  let line = 0;
  let part = 0;
  let char = 0;

  const step = () => {
    if (line >= lines.length) {
      win.classList.remove('is-typing');
      finish(win);
      return; // caret stays blinking at the end of the last line
    }
    const ln = lines[line];
    if (!ln.classList.contains('is-on')) {
      ln.classList.add('is-on');
      ln.appendChild(caret);
    }
    const parts = plan[line];
    if (part >= parts.length) {
      line += 1;
      part = 0;
      char = 0;
      setTimeout(step, 45);
      return;
    }
    const p = parts[part];
    char += 1;
    p.node.textContent = p.text.slice(0, char);
    const typed = p.text[char - 1];
    if (char >= p.text.length) {
      part += 1;
      char = 0;
    }
    setTimeout(step, typed === ' ' ? 3 : 6 + Math.random() * 12);
  };
  step();
}

export function initCodeWindow() {
  const win = $('[data-code-window]');
  if (!win) return;
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    finish(win);
    return;
  }
  win.classList.add('is-armed');
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      setTimeout(() => type(win), 250);
    },
    { threshold: 0.4 },
  );
  io.observe(win);
}
