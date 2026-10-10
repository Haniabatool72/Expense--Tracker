(() => {
  'use strict';

  // ---- Settings (change currency/locale here) ----
  const CONFIG = { key: 'expense-tracker.transactions.v1', locale: 'en-US', currency: 'USD', maxAmount: 100000000 };
  const CATEGORIES = {
    expense: ['Food', 'Transport', 'Housing', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Other'],
    income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
  };
  const ICONS = {
    income: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7L7 17M7 8v9h9"/></svg>',
    expense: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>',
    trash: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></svg>',
  };

  const $ = (id) => document.getElementById(id);
  const form = $('tx-form'), list = $('tx-list'), empty = $('empty');
  const fields = { description: $('description'), amount: $('amount'), date: $('date'), category: $('category') };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const money = new Intl.NumberFormat(CONFIG.locale, { style: 'currency', currency: CONFIG.currency });
  const fmt = (cents) => money.format(cents / 100);
  const pad = (n) => String(n).padStart(2, '0');
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const fmtDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(CONFIG.locale, { month: 'short', day: 'numeric', year: 'numeric' }); };

  // ---- State & storage ----
  const isValid = (t) => t && typeof t.id === 'string' && (t.type === 'income' || t.type === 'expense') &&
    typeof t.description === 'string' && typeof t.category === 'string' && Number.isInteger(t.cents) && t.cents > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.date) && Number.isFinite(t.createdAt);

  const load = () => {
    try { const data = JSON.parse(localStorage.getItem(CONFIG.key)); return Array.isArray(data) ? data.filter(isValid) : []; }
    catch { return []; }
  };
  const state = { items: load(), filter: 'all', lastAdded: null };
  const save = () => {
    try { localStorage.setItem(CONFIG.key, JSON.stringify(state.items)); }
    catch { toast('Could not save. Browser storage may be full or disabled.'); }
  };

  // ---- UI helpers ----
  function toast(message) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    $('toasts').appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  function setError(name, message) {
    const input = fields[name], err = $(`${name}-error`);
    const box = input.closest('.affix') || input;
    err.hidden = !message;
    err.textContent = message || '';
    box.classList.toggle('invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function tween(el, to) {
    const from = Number(el.dataset.v || 0);
    el.dataset.v = to;
    if (reduceMotion || from === to) { el.textContent = fmt(to); return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 600, 1);
      el.textContent = fmt(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function fillCategories(type) {
    const first = new Option('Select a category', '');
    fields.category.replaceChildren(first, ...CATEGORIES[type].map((c) => new Option(c, c)));
  }

  // ---- Rendering ----
  function renderSummary() {
    const sum = (type) => state.items.filter((t) => t.type === type).reduce((s, t) => s + t.cents, 0);
    const income = sum('income'), expense = sum('expense'), total = income + expense;
    tween($('total-income'), income);
    tween($('total-expense'), expense);
    tween($('balance'), income - expense);
    $('balance').classList.toggle('neg', income - expense < 0);
    $('bar-income').style.width = total ? `calc(${(income / total) * 100}% - 1.5px)` : '0';
    $('bar-expense').style.width = total ? `calc(${(expense / total) * 100}% - 1.5px)` : '0';
  }

  function renderList() {
    const items = state.items
      .filter((t) => state.filter === 'all' || t.type === state.filter)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

    list.replaceChildren(...items.map((t) => {
      const li = document.createElement('li');
      li.className = `tx tx--${t.type}${t.id === state.lastAdded ? ' is-new' : ''}`;
      li.dataset.id = t.id;
      li.innerHTML = `<span class="tx__icon">${ICONS[t.type]}</span>
        <div><p class="tx__title"></p><p class="tx__meta"><span class="chip"></span><time></time></p></div>
        <span class="tx__amount"></span>
        <button type="button" class="icon-btn" data-delete>${ICONS.trash}</button>`;
      li.querySelector('.tx__title').textContent = t.description;
      li.querySelector('.chip').textContent = t.category;
      li.querySelector('time').textContent = fmtDate(t.date);
      li.querySelector('.tx__amount').textContent = `${t.type === 'income' ? '+' : '-'}${fmt(t.cents)}`;
      li.querySelector('[data-delete]').setAttribute('aria-label', `Delete ${t.description}`);
      return li;
    }));

    empty.hidden = items.length > 0;
    if (!items.length) {
      empty.textContent = state.items.length
        ? 'No transactions match this filter.'
        : 'No transactions yet. Add your first income or expense using the form.';
    }
  }

  const render = () => { renderSummary(); renderList(); };

  // ---- Validation & submit ----
  function validate() {
    const errors = {};
    const description = fields.description.value.trim().replace(/\s+/g, ' ');
    if (description.length < 2) errors.description = 'Enter at least 2 characters.';
    else if (description.length > 60) errors.description = 'Keep the description under 60 characters.';

    const raw = fields.amount.value.trim();
    let cents = 0;
    if (fields.amount.validity.badInput) errors.amount = 'Enter numbers only.';
    else if (!raw) errors.amount = 'Enter an amount.';
    else if (!/^\d+(\.\d{1,2})?$/.test(raw)) errors.amount = 'Use a positive number with up to 2 decimals.';
    else {
      cents = Math.round(parseFloat(raw) * 100);
      if (cents < 1) errors.amount = 'Amount must be at least 0.01.';
      else if (cents > CONFIG.maxAmount * 100) errors.amount = `Amount cannot exceed ${CONFIG.maxAmount.toLocaleString(CONFIG.locale)}.`;
    }

    const date = fields.date.value;
    if (!date) errors.date = 'Choose a date.';
    else if (date > todayISO()) errors.date = 'Date cannot be in the future.';

    if (!fields.category.value) errors.category = 'Select a category.';

    Object.keys(fields).forEach((name) => setError(name, errors[name]));
    const firstBad = Object.keys(fields).find((name) => errors[name]);
    if (firstBad) { fields[firstBad].focus(); return null; }
    return { description, cents, date, category: fields.category.value };
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = validate();
    if (!data) return;
    const tx = {
      id: window.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: form.elements.type.value, createdAt: Date.now(), ...data,
    };
    state.items.push(tx);
    state.lastAdded = tx.id;
    save();
    render();
    fields.description.value = '';
    fields.amount.value = '';
    fields.category.value = '';
    fields.description.focus();
    toast('Transaction added');
  });

  Object.entries(fields).forEach(([name, input]) => {
    input.addEventListener('input', () => setError(name, ''));
    input.addEventListener('change', () => setError(name, ''));
  });
  form.querySelectorAll('input[name="type"]').forEach((r) => r.addEventListener('change', () => { fillCategories(r.value); setError('category', ''); }));

  // ---- Delete ----
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    const li = btn.closest('.tx');
    if (li.classList.contains('is-leaving')) return;
    const finish = () => {
      state.items = state.items.filter((t) => t.id !== li.dataset.id);
      state.lastAdded = null;
      save();
      render();
      toast('Transaction deleted');
    };
    if (reduceMotion) return finish();
    li.classList.add('is-leaving');
    let done = false;
    const once = () => { if (!done) { done = true; finish(); } };
    li.addEventListener('animationend', once, { once: true });
    setTimeout(once, 400);
  });

  // ---- Filters ----
  document.querySelectorAll('[data-filter]').forEach((btn) => btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    state.lastAdded = null;
    document.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    renderList();
  }));

  // ---- Init ----
  $('today').textContent = new Date().toLocaleDateString(CONFIG.locale, { weekday: 'long', month: 'long', day: 'numeric' });
  $('currency-symbol').textContent = new Intl.NumberFormat(CONFIG.locale, { style: 'currency', currency: CONFIG.currency })
    .formatToParts(0).find((p) => p.type === 'currency').value;
  fields.date.value = todayISO();
  fields.date.max = todayISO();
  fillCategories('expense');
  render();
})();
