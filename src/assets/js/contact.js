/**
 * Contact form — client-side validation + delivery through Web3Forms.
 *
 * Honest by design:
 *  - with an access key (src/data/site.js → web3formsAccessKey) the message is POSTed to
 *    Web3Forms and success is only shown when the API confirms it;
 *  - without a key, the form says so and opens the visitor's email app with the message
 *    pre-filled instead. Nothing ever pretends to have been sent.
 */
import { $, $$ } from './utils.js';

const ENDPOINT = 'https://api.web3forms.com/submit';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ICONS = {
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
};
const svg = (name) =>
  `<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const RULES = {
  name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
  email: (v) => (!v.trim() ? 'Please enter your email.' : !EMAIL_RE.test(v.trim()) ? 'That email address doesn’t look right.' : ''),
  subject: (v) => (v.trim().length < 3 ? 'Please add a short subject.' : ''),
  message: (v) => (v.trim().length < 10 ? 'Your message should be at least 10 characters.' : ''),
};

function copyButtons() {
  for (const btn of $$('[data-copy]')) {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.classList.add('is-copied');
        btn.setAttribute('aria-label', 'Email address copied');
        setTimeout(() => {
          btn.classList.remove('is-copied');
          btn.setAttribute('aria-label', 'Copy email address');
        }, 1800);
      } catch {
        location.href = `mailto:${btn.dataset.copy}`;
      }
    });
  }
}

export function initContact() {
  copyButtons();
  const form = $('[data-contact-form]');
  if (!form) return;

  const key = form.dataset.accessKey.trim();
  const email = form.dataset.email;
  const status = $('[data-form-status]', form);
  const notice = $('[data-form-notice]', form);
  const submit = $('.form__submit', form);
  const label = $('.form__submit-label', submit);
  const fields = Object.keys(RULES).map((name) => form.elements[name]);

  if (!key) {
    notice.innerHTML = `${svg('info')}<p>The form isn’t connected to an email service yet — sending will open your email app with your message filled in.<span class="form__notice-alt"> You can also write to <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>.</span></p>`;
    notice.hidden = false;
    label.textContent = 'Write this email';
  }

  const touched = new Set();

  function validate(input) {
    const msg = RULES[input.name](input.value);
    const field = input.closest('.field');
    const err = $('.field__error', field);
    field.classList.toggle('is-invalid', Boolean(msg));
    err.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) input.setAttribute('aria-describedby', err.id);
    else input.removeAttribute('aria-describedby');
    return !msg;
  }

  for (const input of fields) {
    input.addEventListener('blur', () => {
      if (input.value) touched.add(input.name);
      if (touched.has(input.name)) validate(input);
    });
    input.addEventListener('input', () => {
      if (touched.has(input.name)) validate(input);
    });
  }

  function setStatus(type, html) {
    status.className = `form__status${type ? ` is-${type}` : ''}`;
    status.innerHTML = html;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    fields.forEach((f) => touched.add(f.name));
    const results = fields.map(validate);
    if (results.includes(false)) {
      fields[results.indexOf(false)].focus();
      setStatus('error', `${svg('alert')}Please fix the highlighted fields.`);
      return;
    }

    const data = Object.fromEntries(fields.map((f) => [f.name, f.value.trim()]));

    // No email service configured → hand off to the visitor's mail app (clearly labelled).
    if (!key) {
      const body = `${data.message}\n\n— ${data.name} (${data.email})`;
      location.href = `mailto:${email}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
      setStatus('', `${svg('mail')}Your email app should open with the message filled in. Nothing is sent until you press send there.`);
      return;
    }

    submit.disabled = true;
    submit.classList.add('is-loading');
    label.textContent = 'Sending…';
    setStatus('', '');

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          ...data,
          subject: `Portfolio: ${data.subject}`,
          from_name: `${form.dataset.from} — Portfolio`,
          replyto: data.email,
          botcheck: form.elements.botcheck.checked,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || `Request failed (${res.status})`);

      form.reset();
      touched.clear();
      fields.forEach((f) => {
        f.closest('.field').classList.remove('is-invalid');
        f.removeAttribute('aria-invalid');
      });
      setStatus('success', `${svg('check')}Thanks! Your message has been sent — I’ll get back to you soon.`);
    } catch (err) {
      setStatus(
        'error',
        `${svg('alert')}<span>Sorry, the message couldn’t be sent (${escapeHtml(String(err.message || err))}). Please email me at <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>.</span>`,
      );
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-loading');
      label.textContent = 'Send message';
    }
  });
}
