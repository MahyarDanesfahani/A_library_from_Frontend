const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PERIODS = ['today', 'week', 'month'];

// همه‌ی عددها نمونه هستند؛ با داده‌ی واقعی (API) خودت جایگزین کن
const KPIS = [
    { k: 'sales', label: 'فروش', unit: 'میلیون تومان', dec: 1, ic: '💰', c: '#7c5cff' },
    { k: 'users', label: 'کاربران فعال', unit: 'نفر', dec: 0, ic: '👥', c: '#19c6e6' },
    { k: 'orders', label: 'سفارش‌ها', unit: 'سفارش', dec: 0, ic: '🧾', c: '#ffb347' },
    { k: 'conv', label: 'نرخ تبدیل', unit: '٪', dec: 1, ic: '🎯', c: '#ff5ca8' },
];
const DATA = {   // مقدار، درصد تغییر نسبت به بازه‌ی قبل
    today: { sales: [18.4, 12], users: [1240, 8], orders: [86, -3], conv: [3.4, 0.4], goal: 4, bars: [12, 18, 15, 22, 19, 9, 6] },
    week: { sales: [124, 18], users: [7820, 15], orders: [594, 6], conv: [3.1, -0.2], goal: 24, bars: [88, 102, 95, 120, 110, 64, 42] },
    month: { sales: [512, 24], users: [29400, 21], orders: [2310, 11], conv: [3.6, 0.5], goal: 72, bars: [420, 510, 480, 560, 530, 300, 210] },
};
const DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const DAYS_FULL = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

/* ---------- سری عددی ثابت برای نمودار کوچک (بر اساس seed) ---------- */
function series(seed, up) {
    let h = seed, v = 50;
    return Array.from({ length: 12 }, () => { h = (h * 1664525 + 1013904223) >>> 0; v += ((h >>> 24) / 255 - 0.5) * 18 + (up ? 3 : -3); return v; });
}
function path(a) {
    const mn = Math.min(...a), mx = Math.max(...a), W = 120, H = 34;
    return a.map((v, i) => `${i ? 'L' : 'M'}${((i / (a.length - 1)) * W).toFixed(1)} ${(H - ((v - mn) / (mx - mn || 1)) * H + 3).toFixed(1)}`).join('');
}
// عدد با انیمیشن به مقدار جدید می‌رسد
function tween(el, to, dec) {
    const from = +el.dataset.v || 0; el.dataset.v = to;
    if (reduced || from === to) { el.textContent = fa(to, dec); return; }
    const t0 = performance.now();
    cancelAnimationFrame(+el.dataset.raf || 0);
    (function step(t) {
        const p = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fa(from + (to - from) * e, dec);
        if (p < 1) el.dataset.raf = requestAnimationFrame(step);
    })(t0);
}
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const NS = 'http://www.w3.org/2000/svg';

/* ---------- ساخت کارت‌های KPI ---------- */
const refs = {};
KPIS.forEach((d) => {
    const card = el('article', 'card kpi'); card.style.setProperty('--c', d.c);
    const top = el('div', 'top'); const tr = el('span', 'tr'); top.append(el('span', 'ic', d.ic), tr);
    const vv = el('div', 'vv'); const val = el('b', 'val', '۰'); vv.append(val, el('span', 'un', d.unit));
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 120 40'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    const area = document.createElementNS(NS, 'path'); area.setAttribute('class', 'area');
    const line = document.createElementNS(NS, 'path'); line.setAttribute('class', 'line'); line.setAttribute('pathLength', '100');
    svg.append(area, line);
    card.append(top, el('p', 'lb', d.label), vv, svg);
    $('grid').insertBefore(card, $('grid').querySelector('.goal'));   // کارت‌های KPI قبل از کارت هدف
    refs[d.k] = { val, tr, line, area };
});

/* ---------- نمودار میله‌ای ---------- */
const bs = DAYS.map((d, i) => {
    const b = el('button'); b.type = 'button'; b.setAttribute('role', 'listitem');
    const bar = el('i'); b.append(bar, el('span', '', d));
    const show = () => ($('tip').textContent = `${DAYS_FULL[i]}: ${b.dataset.v}`);
    b.addEventListener('pointerenter', show); b.addEventListener('focus', show); b.addEventListener('click', show);
    $('bchart').appendChild(b);
    return { b, bar };
});

function render(p) {
    const pi = PERIODS.indexOf(p), D = DATA[p];
    KPIS.forEach((d, ki) => {
        const [v, delta] = D[d.k], r = refs[d.k];
        tween(r.val, v, d.dec);
        r.tr.className = 'tr ' + (delta >= 0 ? 'up' : 'down');
        r.tr.textContent = `${delta >= 0 ? '▲' : '▼'} ${fa(Math.abs(delta), d.k === 'conv' ? 1 : 0)}٪`;
        const s = path(series(7 + ki * 13 + pi * 5, delta >= 0));
        r.line.setAttribute('d', s); r.area.setAttribute('d', s + 'L120 40L0 40Z');
        r.line.classList.remove('draw'); r.area.classList.remove('on'); void r.line.getBoundingClientRect();
        r.line.classList.add('draw'); r.area.classList.add('on');
    });
    // حلقه‌ی هدف
    tween($('gp'), D.goal, 0);
    $('ring').style.strokeDashoffset = 276.46 * (1 - D.goal / 100);
    $('gn').textContent = D.goal >= 70 ? 'عالی! به هدف ماهانه نزدیک شده‌ای 🎉' : 'ادامه بده؛ هنوز تا هدف راه داری.';
    // میله‌ها
    const mx = Math.max(...D.bars);
    D.bars.forEach((v, i) => {
        bs[i].bar.style.setProperty('--h', (v / mx) * 100 + '%');
        bs[i].b.dataset.v = fa(v) + ' میلیون تومان';
        bs[i].b.setAttribute('aria-label', `${DAYS_FULL[i]}، ${fa(v)} میلیون تومان`);
        bs[i].b.classList.toggle('max', v === mx);
    });
    $('tip').textContent = '';
}

document.querySelectorAll('#per button').forEach((b) =>
    b.addEventListener('click', () => {
        document.querySelectorAll('#per button').forEach((x) => x.setAttribute('aria-checked', x === b));
        render(b.dataset.p);
    })
);

/* ---------- کارت زنده: کاربران آنلاین ---------- */
const live = Array.from({ length: 24 }, (_, i) => 140 + Math.sin(i / 3) * 12);
function drawLive() {
    const mn = Math.min(...live), mx = Math.max(...live);
    $('lline').setAttribute('points', live.map((v, i) => `${(i / (live.length - 1)) * 200},${46 - ((v - mn) / (mx - mn || 1)) * 40}`).join(' '));
    tween($('lv'), Math.round(live[live.length - 1]), 0);
}
setInterval(() => {
    if (document.hidden) return;
    live.push(Math.min(220, Math.max(90, live[live.length - 1] + (Math.random() - 0.5) * 14)));
    live.shift();
    drawLive();
}, 2500);

const stamp = () => ($('stamp').textContent = 'آخرین به‌روزرسانی: ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }));
stamp(); setInterval(stamp, 60000);
render('today');
drawLive();