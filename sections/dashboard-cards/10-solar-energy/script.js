const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// مدل ساده‌ی نمونه (نه داده‌ی واقعی): همه‌ی ثابت‌ها را با نیروگاه خودت جایگزین کن
const PEAK = 6.2, CAP = 10, MAXB = 3, PRICE = 3000, CO2 = 0.55;   // کیلووات، کیلووات‌ساعت، کیلووات، تومان بر کیلووات‌ساعت، کیلوگرم بر کیلووات‌ساعت
const g = (h, m, s) => Math.exp(-(((h - m) / s) ** 2) / 2);
const S = (h) => (h > 6 && h < 18 ? PEAK * Math.pow(Math.sin(Math.PI * (h - 6) / 12), 1.3) * (1 - 0.07 * Math.sin(h * 3)) : 0);
const L = (h) => 0.45 + 1.1 * g(h, 7.5, 1.2) + 0.9 * g(h, 13.5, 1.5) + 2.2 * g(h, 20, 1.8);

// شبیه‌سازی از ساعت صفر تا h با گام ربع ساعت
function flows(s, l, soc) {
    const sur = s - l; let ch = 0, dis = 0, imp = 0, exp = 0;
    if (sur >= 0) { ch = Math.min(sur, MAXB, ((100 - soc) / 100) * CAP / 0.25); exp = sur - ch; }
    else { dis = Math.min(-sur, MAXB, Math.max(0, ((soc - 10) / 100) * CAP / 0.25)); imp = -sur - dis; }
    return { ch, dis, imp, exp };
}
function sim(h) {
    let soc = 40, prod = 0, cons = 0, imp = 0;
    for (let t = 0; t < h - 1e-9; t += 0.25) {
        const s = S(t), l = L(t), f = flows(s, l, soc);
        soc += ((f.ch - f.dis) * 0.25 / CAP) * 100; prod += s * 0.25; cons += l * 0.25; imp += f.imp * 0.25;
    }
    const s = S(h), l = L(h);
    return { soc, prod, cons, imp, s, l, ...flows(s, l, soc) };
}

/* ---------- کارت‌های KPI ---------- */
const KP = [['⚡', 'تولید تا این لحظه', 'کیلووات‌ساعت', 1], ['🏠', 'مصرف خانه', 'کیلووات‌ساعت', 1], ['💰', 'صرفه‌جویی', 'هزار تومان', 0], ['🌿', 'کاهش CO₂ (تقریبی)', 'کیلوگرم', 1]];
const kp = KP.map(([ic, lb, un, d]) => {
    const c = el('article', 'card kpi'), b = el('b'), v = el('span'); b.append(v, el('small', '', ' ' + un)); c.append(el('span', 'ic', ic), el('span', 'lb', lb), b); $('kpis').appendChild(c); return { v, d };
});

/* ---------- نمودار ۲۴ ساعته ---------- */
const csvg = $('csvg'), NS = 'http://www.w3.org/2000/svg', W = 600, H = 190, MAXY = 7.5;
const mk = (n, a) => { const e = document.createElementNS(NS, n); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); csvg.appendChild(e); return e; };
[0, 1, 2, 3].forEach((i) => mk('line', { class: 'grid', x1: 0, x2: W, y1: (i / 3) * (H - 4) + 2, y2: (i / 3) * (H - 4) + 2 }));
const pts = (f) => Array.from({ length: 97 }, (_, i) => `${(i / 96) * W},${H - 2 - (f(i / 4) / MAXY) * (H - 6)}`);
mk('polygon', { class: 'sa', points: `0,${H} ${pts(S).join(' ')} ${W},${H}` });
mk('polyline', { class: 'sl', points: pts(S).join(' ') });
mk('polyline', { class: 'll', points: pts(L).join(' ') });
const now = mk('line', { class: 'now', x1: 0, x2: 0, y1: 0, y2: H });

/* ---------- نمودار جریان ---------- */
const spoke = (id, kw, toHub) => {
    const p = $(id);
    p.classList.toggle('off', kw < 0.05); p.classList.toggle('rev', !toHub);
    p.style.strokeWidth = 4 + Math.min(kw, 6) * 1.1;
};
const hhmm = (h) => {
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return `${String(mm === 60 ? hh + 1 : hh).padStart(2, '0')}:${String(mm === 60 ? 0 : mm).padStart(2, '0')}`.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
};
const kw = (v) => fa(v, 1) + ' kW';

function render() {
    const h = +$('hour').value, r = sim(h);
    $('hv').textContent = hhmm(h);
    now.setAttribute('x1', (h / 24) * W); now.setAttribute('x2', (h / 24) * W);
    const vals = [r.prod, r.cons, (r.cons - r.imp) * PRICE / 1000, r.prod * CO2];
    kp.forEach((k, i) => (k.v.textContent = fa(vals[i], k.d)));

    spoke('p-s', r.s, true);                       // پنل ← مرکز
    spoke('p-h', r.l, false);                      // مرکز ← خانه
    spoke('p-b', Math.max(r.ch, r.dis), r.dis > r.ch);   // باتری: دشارژ = به مرکز، شارژ = از مرکز
    spoke('p-g', Math.max(r.imp, r.exp), r.imp > r.exp); // شبکه: خرید = به مرکز، فروش = از مرکز
    $('v-s').textContent = kw(r.s); $('v-h').textContent = kw(r.l);
    $('v-b').textContent = r.ch > 0.05 ? '+' + kw(r.ch) : r.dis > 0.05 ? '−' + kw(r.dis) : '۰ kW';
    $('v-g').textContent = r.imp > 0.05 ? 'خرید ' + kw(r.imp) : r.exp > 0.05 ? 'فروش ' + kw(r.exp) : '۰ kW';

    $('soc').textContent = fa(Math.round(r.soc));
    $('ring').style.strokeDashoffset = 276.46 * (1 - r.soc / 100);
    $('ring').style.stroke = r.soc < 20 ? 'var(--red)' : r.soc < 40 ? 'var(--sun)' : 'var(--grn)';
    $('bstate').textContent = r.ch > 0.05 ? `در حال شارژ با ${kw(r.ch)} (از مازاد خورشید)` : r.dis > 0.05 ? `در حال تأمین مصرف خانه با ${kw(r.dis)}` : 'آماده و بدون جریان';
}

/* ---------- پخش خودکار روز ---------- */
let timer = null;
const play = $('play');
play.addEventListener('click', () => {
    if (timer) { clearInterval(timer); timer = null; play.textContent = '▶'; return; }
    play.textContent = '⏸';
    timer = setInterval(() => { let h = +$('hour').value + 0.1; if (h > 24) h = 0; $('hour').value = h; render(); }, 120);
});
$('hour').addEventListener('input', render);
render();