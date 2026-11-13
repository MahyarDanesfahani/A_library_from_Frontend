const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const pad = (n) => String(n).padStart(2, '0');

// همه‌ی داده‌ها نمونه و ساختگی هستند؛ با داده‌ی واقعی (API) جایگزین کن
const SHADES = [['N۱۰', '#f8e3d3', 22], ['N۲۰', '#f3d3bb', 18], ['N۳۰', '#ecc2a4', 9], ['N۴۰', '#e0ae8a', 25], ['N۵۰', '#d29a73', 4], ['N۶۰', '#bf825c', 16],
    ['W۱۰', '#f5dcc5', 12], ['W۲۰', '#e8c3a0', 20], ['W۳۰', '#d9aa80', 7], ['C۴۰', '#c58f66', 24], ['C۵۰', '#a8714b', 14], ['C۶۰', '#8a5a3c', 3]]
    .map(([code, color, stock], i) => ({ code, color, stock, max: 30, sold: 6 + ((i * 7) % 13) }));
const EXP = [['سرم ویتامین C', 21, 730], ['کرم ضدآفتاب SPF50', 48, 1095], ['ماسک مو کراتین', 95, 730], ['لاک ژلی صورتی', 190, 1095], ['ژل شست‌وشوی صورت', 340, 1095]].map(([n, days, life]) => ({ n, days, life, off: false }));
const CATS = [['شامپو و مراقبت مو', 62], ['صابون و شوینده', 41], ['ضدعفونی و بهداشتی', 17], ['لوازم آرایش چشم', 73], ['مراقبت پوست', 55]];
let sel = -1, sold = 312; const GOAL = 500;
const end = Date.now() + (3 * 3600 + 25 * 60) * 1000;   // پایان کمپین (نمونه: ۳ ساعت و ۲۵ دقیقه‌ی دیگر)

let tt;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2400); }

/* ---------- KPI ---------- */
[['🛍', 'فروش امروز', fa(24.6, 1), ' میلیون تومان'], ['📦', 'سفارش‌ها', fa(63), ' سفارش'], ['↩️', 'مرجوعی', fa(2), ' مورد'], ['⭐', 'رضایت مشتریان', fa(4.8, 1), ' از ۵']].forEach(([ic, lb, v, un]) => {
    const c = el('article', 'card kpi'), b = el('b', '', v); b.appendChild(el('small', '', un));
    c.append(el('span', 'ic', ic), el('span', 'lb', lb), b); $('kpis').appendChild(c);
});

/* ---------- پالت رنگ‌ها ---------- */
SHADES.forEach((s, i) => {
    const b = el('button', 'sh'); b.type = 'button'; b.setAttribute('role', 'radio'); b.appendChild(el('i'));
    b.style.setProperty('--c', s.color); b.addEventListener('click', () => { sel = i; shades(); });
    $('pal').appendChild(b); s.el = b;
});
function shades() {
    SHADES.forEach((s, i) => {
        const p = (s.stock / s.max) * 100;
        s.el.style.setProperty('--p', p); s.el.className = 'sh' + (s.stock <= 5 ? ' crit' : s.stock <= 10 ? ' low' : '');
        s.el.setAttribute('aria-checked', i === sel); s.el.setAttribute('aria-label', `رنگ ${s.code}، موجودی ${fa(s.stock)} از ${fa(s.max)}`);
    });
    const box = $('sel'); box.replaceChildren();
    if (sel < 0) { box.appendChild(el('p', 'ph', 'یک رنگ را انتخاب کن تا جزئیات موجودی‌اش را ببینی.')); return; }
    const s = SHADES[sel], big = el('span', 'big'); big.style.setProperty('--c', s.color);
    const info = el('div'); info.append(el('b', '', `کرم‌پودر رنگ ${s.code}`),
        el('small', '', `موجودی: ${fa(s.stock)} از ${fa(s.max)} | فروش هفته: ${fa(s.sold)} عدد`),
        el('small', '', s.stock <= 5 ? '⚠ موجودی بحرانی است' : s.stock <= 10 ? 'رو به اتمام' : 'موجودی مناسب'));
    const bt = el('div', 'bt');
    const sell = el('button', 'alt', 'ثبت فروش ۱ عدد'); sell.type = 'button';
    sell.addEventListener('click', () => { if (s.stock > 0) { s.stock--; s.sold++; shades(); } else toast('موجودی این رنگ صفر است'); });
    const re = el('button', '', 'سفارش مجدد ۱۰ عدد'); re.type = 'button';
    re.addEventListener('click', () => { s.stock = Math.min(s.max, s.stock + 10); toast(`سفارش ۱۰ عدد رنگ ${s.code} ثبت شد (نمونه)`); shades(); });   // اینجا سفارش را به بک‌اند بفرست
    bt.append(sell, re); box.append(big, info, bt);
}

/* ---------- کمپین ---------- */
function camp() {
    const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
    const cd = $('cd'); cd.replaceChildren();
    [[Math.floor(left / 3600), 'ساعت'], [Math.floor((left % 3600) / 60), 'دقیقه'], [left % 60, 'ثانیه']].forEach(([v, l]) => {
        const d = el('div'); d.append(el('b', '', pad(v).replace(/\d/g, (x) => '۰۱۲۳۴۵۶۷۸۹'[x])), el('small', '', l)); cd.appendChild(d);
    });
    $('cfill').style.width = (sold / GOAL) * 100 + '%';
    $('cn').textContent = left ? `${fa(sold)} از ${fa(GOAL)} عدد فروخته شد | ۲۰٪ تخفیف تا پایان کمپین` : 'کمپین به پایان رسید.';
}
setInterval(camp, 1000);
setInterval(() => { if (!document.hidden && sold < GOAL) { sold += 1 + Math.floor(Math.random() * 3); camp(); } }, 4000);   // فروش زنده‌ی نمونه

/* ---------- تاریخ انقضا ---------- */
function exp() {
    const ul = $('exp'); ul.replaceChildren();
    [...EXP].sort((a, b) => a.days - b.days).forEach((p) => {
        const lvl = p.days < 30 ? 'c' : p.days < 90 ? 'w' : '';
        const li = el('li', 'ei ' + lvl), t = el('div', 't'), f = el('i'); t.appendChild(f);
        li.appendChild(el('b', '', p.n)); li.appendChild(el('span', 'd', `${fa(p.days)} روز`));
        if (p.off) li.appendChild(el('span', 'off', '٪۳۰ تخفیف'));
        else { const b = el('button', '', lvl ? 'تخفیف ویژه' : 'ثبت'); b.type = 'button'; b.hidden = !lvl;
            b.addEventListener('click', () => { p.off = true; toast(`تخفیف ویژه برای «${p.n}» فعال شد (نمونه)`); exp(); }); li.appendChild(b); }
        li.appendChild(t); ul.appendChild(li);
        requestAnimationFrame(() => requestAnimationFrame(() => (f.style.width = Math.min(100, (p.days / p.life) * 100) + '%')));
    });
}

/* ---------- موجودی دسته‌ها ---------- */
function cats() {
    const ul = $('cat'); ul.replaceChildren();
    CATS.forEach(([n, p]) => {
        const li = el('li', 'ci' + (p < 25 ? ' low' : '')), t = el('div', 't'), f = el('i'); t.appendChild(f);
        const r = el('span'); r.appendChild(el('b', '', fa(p) + '٪'));
        if (p < 25) { const b = el('button', '', 'سفارش'); b.type = 'button'; b.addEventListener('click', () => toast(`درخواست خرید «${n}» ثبت شد (نمونه)`)); r.append(' ', b); }
        li.append(el('span', '', n), r, t); ul.appendChild(li);
        requestAnimationFrame(() => requestAnimationFrame(() => (f.style.width = p + '%')));
    });
}

shades(); camp(); exp(); cats();