const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// همه‌ی داده‌ها نمونه هستند؛ با داده‌ی واقعی (API بک‌اند) جایگزین کن
const PER = {
    today: { tickets: 312, rev: 187.2, visits: 9840, conv: 3.2, funnel: [9840, 6150, 2210, 740, 315] },
    week: { tickets: 2140, rev: 1284, visits: 61200, conv: 3.5, funnel: [61200, 40100, 15300, 5200, 2150] },
    month: { tickets: 8900, rev: 5340, visits: 238000, conv: 3.7, funnel: [238000, 160000, 60000, 21000, 8800] },
};
const STAGES = ['بازدید سایت', 'جستجوی رویداد', 'انتخاب صندلی', 'ورود به پرداخت', 'پرداخت موفق'];
const EVENTS = [
    { name: 'کنسرت شب‌های پاییزی', date: '۲۴ آبان', price: 850000, seed: 3, fill: 0.55 },
    { name: 'تئاتر «آخرین مسافر»', date: '۲۸ آبان', price: 450000, seed: 7, fill: 0.82 },
    { name: 'استندآپ کمدی', date: '۳ آذر', price: 350000, seed: 11, fill: 0.35 },
    { name: 'نمایش ویژه‌ی سینما', date: '۵ آذر', price: 250000, seed: 19, fill: 0.92 },
];
const ROWS = 8, COLS = 12, CAP = ROWS * COLS;
let period = 'today', cur = 0, extraT = 0, extraR = 0;

/* ---------- کارت‌های KPI ---------- */
const KPI = [['tickets', 'بلیت فروخته‌شده', 'بلیت', 0, '🎟'], ['rev', 'درآمد', 'میلیون تومان', 1, '💰'], ['visits', 'بازدید سایت', 'بازدید', 0, '👀'], ['conv', 'نرخ تبدیل', '٪', 1, '🎯']];
const kp = {};
KPI.forEach(([k, lb, un, dec, ic]) => {
    const c = el('article', 'card kpi'); c.dataset.ic = ic;
    const b = el('b', '', '۰'), plus = el('span', 'plus');
    const vv = el('div', 'vv'); vv.append(b, el('span', 'un', un));
    c.append(el('p', 'lb', lb), vv, plus); $('kpis').appendChild(c);
    kp[k] = { b, plus, dec };
});
function tween(e, to, dec) {
    const from = +e.dataset.v || 0; e.dataset.v = to;
    if (reduced || from === to) { e.textContent = fa(to, dec); return; }
    const t0 = performance.now(); cancelAnimationFrame(+e.dataset.raf || 0);
    (function s(t) { const p = Math.min(1, (t - t0) / 700), k = 1 - Math.pow(1 - p, 3); e.textContent = fa(from + (to - from) * k, dec); if (p < 1) e.dataset.raf = requestAnimationFrame(s); })(t0);
}
function stats() {
    const D = PER[period];
    tween(kp.tickets.b, D.tickets + extraT, 0); tween(kp.rev.b, D.rev + extraR, 1);
    tween(kp.visits.b, D.visits, 0); tween(kp.conv.b, D.conv, 1);
}
function funnel() {
    const F = PER[period].funnel, box = $('funnel'); box.replaceChildren();
    F.forEach((v, i) => {
        const row = el('div', 'fn'), bar = el('div', 'bar'), fill = el('i'), lab = el('span');
        lab.append(el('b', '', fa(v)), el('em', '', i ? fa((v / F[i - 1]) * 100, 1) + '٪ از مرحله‌ی قبل' : '۱۰۰٪'));
        bar.append(fill, lab); row.append(el('span', '', STAGES[i]), bar); box.appendChild(row);
        requestAnimationFrame(() => requestAnimationFrame(() => (fill.style.width = Math.max(6, (v / F[0]) * 100) + '%')));
    });
}

/* ---------- سالن و صندلی‌ها (با seed ثابت) ---------- */
EVENTS.forEach((ev) => {
    let h = ev.seed;
    ev.sold = Array.from({ length: CAP }, () => { h = (h * 1664525 + 1013904223) >>> 0; return (h >>> 8) / 16777216 < ev.fill; });
});
const count = (ev) => ev.sold.filter(Boolean).length;

const evList = $('events');
EVENTS.forEach((ev, i) => {
    const li = el('li'), b = el('button', 'ev'); b.type = 'button';
    b.append(el('b', '', ev.name), el('span', 'pr', fa(ev.price / 1000) + ' هزار تومان'), el('small', '', ev.date), el('span'));
    const pg = el('div', 'pg'); pg.appendChild(el('i')); b.appendChild(pg);
    b.addEventListener('click', () => select(i));
    li.appendChild(b); evList.appendChild(li); ev.btn = b;
});
function progress() {
    EVENTS.forEach((ev) => {
        const p = count(ev) / CAP, f = ev.btn.querySelector('.pg i');
        f.style.width = p * 100 + '%'; f.className = p >= 1 ? 'full' : p > 0.85 ? 'hot' : '';
        ev.btn.children[3].textContent = p >= 1 ? 'تکمیل ظرفیت' : p > 0.85 ? 'رو به اتمام 🔥' : fa(p * 100) + '٪ فروخته شده';
    });
    const ev = EVENTS[cur], c = count(ev);
    $('pc').textContent = `${fa(c)} از ${fa(CAP)} صندلی`;
    $('srsum').textContent = `${ev.name}: ${fa(c)} صندلی فروخته شده و ${fa(CAP - c)} خالی است.`;
}
function select(i) {
    cur = i;
    EVENTS.forEach((e, k) => e.btn.setAttribute('aria-pressed', k === i));
    const ev = EVENTS[i]; $('evname').textContent = ev.name + ' | ' + ev.date;
    const hall = $('hall'); hall.replaceChildren(); ev.els = [];
    for (let r = 0; r < ROWS; r++) {
        const row = el('div', 'row'); row.appendChild(el('span', '', fa(r + 1)));
        for (let c = 0; c < COLS; c++) { const s = el('div', 'seat' + (ev.sold[r * COLS + c] ? ' sold' : '')); ev.els.push(s); row.appendChild(s); }
        hall.appendChild(row);
    }
    progress();
}

/* ---------- فروش زنده ---------- */
const feed = $('feed');
function liveSale() {
    if (document.hidden) return;
    const open = EVENTS.map((e, i) => i).filter((i) => count(EVENTS[i]) < CAP);
    if (!open.length) return;
    const i = Math.random() < 0.5 && open.includes(cur) ? cur : open[Math.floor(Math.random() * open.length)];
    const ev = EVENTS[i], n = 1 + Math.floor(Math.random() * 3);
    let done = 0;
    for (let k = 0; k < n; k++) {
        const free = ev.sold.map((s, idx) => (s ? -1 : idx)).filter((x) => x >= 0);
        if (!free.length) break;
        const idx = free[Math.floor(Math.random() * free.length)];
        ev.sold[idx] = true; done++;
        if (i === cur && ev.els) { ev.els[idx].classList.add('sold', 'flash'); setTimeout(() => ev.els[idx].classList.remove('flash'), 950); }
    }
    extraT += done; extraR += (ev.price * done) / 1e6;
    stats(); progress();
    [kp.tickets, kp.rev].forEach((k, j) => { k.plus.textContent = j ? '+' + fa((ev.price * done) / 1e6, 2) : '+' + fa(done); k.plus.classList.remove('pop'); void k.plus.offsetWidth; k.plus.classList.add('pop'); });
    const li = el('li', '', `سفارش جدید: ${fa(done)} بلیت «${ev.name}» | ${fa((ev.price * done) / 1000)} هزار تومان`);
    li.appendChild(el('small', '', new Date().toLocaleTimeString('fa-IR')));
    feed.prepend(li); while (feed.children.length > 6) feed.lastChild.remove();
}
setInterval(liveSale, 2400);

document.querySelectorAll('#per button').forEach((b) =>
    b.addEventListener('click', () => {
        period = b.dataset.p;
        document.querySelectorAll('#per button').forEach((x) => x.setAttribute('aria-checked', x === b));
        stats(); funnel();
    })
);
select(0); stats(); funnel();