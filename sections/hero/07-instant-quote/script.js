const $ = (id) => document.getElementById(id);
const fa = (n) => Math.round(n).toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ⚠ همه‌ی قیمت‌ها و زمان‌ها «نمونه» هستند. با تعرفه‌ی واقعی خودت جایگزین کن (واحد: تومان و روز) */
const TYPES = [
    { k: 'site', ic: '🌐', name: 'سایت شرکتی', base: 12e6, perPage: 1.2e6, days: 10, perDay: 0.6 },
    { k: 'shop', ic: '🛒', name: 'فروشگاه آنلاین', base: 30e6, perPage: 0.8e6, days: 25, perDay: 0.4 },
    { k: 'app', ic: '📱', name: 'اپلیکیشن وب', base: 45e6, perPage: 1.5e6, days: 40, perDay: 0.8 },
    { k: 'bot', ic: '🤖', name: 'ربات تلگرام', base: 8e6, perPage: 0.5e6, days: 7, perDay: 0.3 },
];
const OPTS = [
    { k: 'admin', name: 'پنل مدیریت', cost: 10e6, days: 6 },
    { k: 'pay', name: 'درگاه پرداخت', cost: 5e6, days: 3 },
    { k: 'lang', name: 'چندزبانه', cost: 6e6, days: 4 },
    { k: 'seo', name: 'سئوی پایه', cost: 4e6, days: 3 },
];
const SPREAD = [0.85, 1.25];   // بازه‌ی عدم‌قطعیت قیمت و زمان
let cur = TYPES[0];

/* ---------- ساخت دکمه‌ها ---------- */
TYPES.forEach((t, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', i === 0);
    const ic = document.createElement('span'); ic.textContent = t.ic;
    b.append(ic, t.name);
    b.addEventListener('click', () => { cur = t; document.querySelectorAll('#types button').forEach((x) => x.setAttribute('aria-checked', x === b)); calc(); });
    $('types').appendChild(b);
});
OPTS.forEach((o) => {
    const l = document.createElement('label'), i = document.createElement('input'), s = document.createElement('span');
    i.type = 'checkbox'; i.dataset.k = o.k; s.textContent = o.name;
    i.addEventListener('change', calc);
    l.append(i, s); $('opts').appendChild(l);
});
$('pg').addEventListener('input', calc);

/* ---------- محاسبه و انیمیشن عدد ---------- */
const shown = { lo: 0, hi: 0, dlo: 0, dhi: 0 };
let raf = 0;
function render() {
    $('price').textContent = `${fa(shown.lo / 1e6)} تا ${fa(shown.hi / 1e6)} میلیون تومان`;
    $('days').textContent = `${fa(shown.dlo)} تا ${fa(shown.dhi)} روز`;
}
function calc() {
    const pages = +$('pg').value, on = OPTS.filter((o) => $('opts').querySelector(`[data-k="${o.k}"]`).checked);
    $('pgv').textContent = fa(pages);
    const cost = cur.base + cur.perPage * Math.max(0, pages - 1) + on.reduce((s, o) => s + o.cost, 0);
    const days = cur.days + cur.perDay * pages + on.reduce((s, o) => s + o.days, 0);
    const to = { lo: cost * SPREAD[0], hi: cost * SPREAD[1], dlo: days * SPREAD[0], dhi: days * SPREAD[1] };
    $('q').dataset.summary = `${cur.name} | ${fa(pages)} صفحه${on.length ? ' | ' + on.map((o) => o.name).join('، ') : ''}`;
    if (reduced) { Object.assign(shown, to); render(); return; }
    const from = { ...shown }, t0 = performance.now();
    cancelAnimationFrame(raf);
    (function step(t) {
        const p = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - p, 3);
        for (const k in to) shown[k] = from[k] + (to[k] - from[k]) * e;
        render();
        if (p < 1) raf = requestAnimationFrame(step);
    })(t0);
}

/* ---------- ثبت درخواست (نمونه) ---------- */
$('q').addEventListener('submit', (e) => {
    e.preventDefault();
    // اینجا درخواست را با fetch به بک‌اند خودت بفرست (به‌همراه مشخصات پروژه و راه تماس)
    $('msg').textContent = `درخواست ثبت شد (نمونه): ${$('q').dataset.summary}`;
});
calc();