const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const NS = 'http://www.w3.org/2000/svg';
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// ⚠ همه‌ی داده‌ها شبیه‌سازی و ساختگی هستند (شماره کارت‌ها هم فرضی و ماسک‌شده‌اند). تو سیستم واقعی از سرویس‌های امن بانک بیا
const TYPES = [['کارت‌به‌کارت', '💳'], ['پایا', '🏦'], ['ساتنا', '🏛'], ['پرداخت قبض', '🧾'], ['خرید اینترنتی', '🛒'], ['برداشت خودپرداز', '🏧']];
const CH = [['موبایل‌بانک', '#19d3c5', 38], ['اینترنت‌بانک', '#5b8cff', 22], ['POS', '#e6c36a', 20], ['خودپرداز', '#ff8a5c', 12], ['شعبه', '#b07bff', 8]];
const SV = [['سوییچ شبکه شتاب', 38], ['هسته‌ی بانکی', 55], ['درگاه پرداخت اینترنتی', 72], ['پیامک رمز یک‌بار مصرف', 120], ['شبکه‌ی خودپرداز', 64], ['سامانه‌ی پایا و ساتنا', 90]]
    .map(([n, base]) => ({ n, base, ms: base, state: 'ok', hist: Array(12).fill(base) }));
let tx = 184230, vol = 41.2e9, fails = 1660, tps = 220, avgMs = 58;
const counts = CH.map(([, , w]) => w * 100), hist = Array(30).fill(150);

let tt;
const toast = (m) => { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); };

/* ---------- KPI ---------- */
const KP = [['تراکنش امروز', 'تراکنش'], ['حجم مالی', 'میلیارد تومان'], ['نرخ موفقیت', '٪'], ['میانگین پاسخ', 'میلی‌ثانیه']];
const kp = KP.map(([lb, un]) => {
    const c = el('article', 'card kpi'), b = el('b'), v = el('span'); b.append(v, el('small', '', ' ' + un)); c.append(el('p', 'lb', lb), b); $('kpis').appendChild(c); return { c, v };
});
function kpis() {
    const sr = 100 - (fails / tx) * 100;
    kp[0].v.textContent = fa(tx); kp[1].v.textContent = fa(vol / 1e9, 1); kp[2].v.textContent = fa(sr, 2); kp[3].v.textContent = fa(avgMs);
    kp[2].c.classList.toggle('bad', sr < 97.5);
}

/* ---------- سلامت سرویس‌ها ---------- */
SV.forEach((s) => {
    const li = el('li', 'hi'), svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 70 20'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    s.poly = document.createElementNS(NS, 'polyline'); svg.appendChild(s.poly);
    s.ms$ = el('span', 'ms'); s.btn = el('button', '', 'بازیابی'); s.btn.type = 'button'; s.btn.hidden = true;
    s.btn.addEventListener('click', () => { s.state = 'ok'; toast(`سرویس «${s.n}» بازیابی شد`); health(); });
    const tail = el('div'); tail.append(s.btn, svg);
    li.append(el('i', 's'), el('span', '', s.n), s.ms$, tail); li.style.gridTemplateColumns = '.6rem 1fr auto auto';
    $('health').appendChild(li); s.li = li;
});
function health() {
    SV.forEach((s) => {
        s.li.className = 'hi' + (s.state === 'ok' ? '' : ' ' + s.state);
        s.ms$.textContent = s.state === 'down' ? 'قطع' : fa(s.ms) + ' ms';
        s.btn.hidden = s.state !== 'down';
        const mx = Math.max(...s.hist, 1);
        s.poly.setAttribute('points', s.hist.map((v, i) => `${(i / 11) * 70},${19 - (v / (mx * 1.1)) * 17}`).join(' '));
    });
}
$('incident').addEventListener('click', () => {
    const s = pick(SV.filter((x) => x.state !== 'down'));
    if (!s) return toast('همه‌ی سرویس‌ها قبلاً قطع شده‌اند');
    s.state = 'down';
    toast(`⚠ اختلال در «${s.n}»؛ نرخ خطا بالا رفت`);
    health();
});

/* ---------- نمودار TPS و گیج ---------- */
function drawTps() {
    $('tps').textContent = fa(Math.round(tps));
    $('gfg').style.strokeDashoffset = 100 * (1 - Math.min(1, tps / 450));
    $('gfg').style.stroke = tps > 380 ? 'var(--warn)' : 'var(--teal)';
    const h = $('hist'); h.replaceChildren(); const mx = Math.max(...hist);
    hist.forEach((v) => { const i = el('i'); i.style.height = (v / mx) * 100 + '%'; h.appendChild(i); });
}

/* ---------- حلقه‌ی کانال‌ها ---------- */
const C = 2 * Math.PI * 38, segs = [];
CH.forEach(([n, c]) => {
    const k = document.createElementNS(NS, 'circle'); k.setAttribute('cx', 50); k.setAttribute('cy', 50); k.setAttribute('r', 38); k.setAttribute('stroke', c); $('dsvg').appendChild(k); segs.push(k);
    const li = el('li'); const i = el('i'); i.style.setProperty('--c', c); const b = el('b'); li.append(i, el('span', '', n), b); $('dl').appendChild(li); segs[segs.length - 1].b = b;
});
function donut() {
    const tot = counts.reduce((a, b) => a + b, 0); let cum = 0, top = 0;
    counts.forEach((c, i) => {
        const len = (c / tot) * C;
        segs[i].setAttribute('stroke-dasharray', `${Math.max(0, len - 1.5)} ${C}`); segs[i].setAttribute('stroke-dashoffset', -cum); cum += len;
        segs[i].b.textContent = fa((c / tot) * 100) + '٪'; if (c > counts[top]) top = i;
    });
    $('dn').textContent = CH[top][0]; $('dp').textContent = fa((counts[top] / tot) * 100) + '٪';
}

/* ---------- جریان تراکنش‌ها ---------- */
function addTx() {
    const down = SV.filter((s) => s.state === 'down').length;
    const r = Math.random(), pf = 0.02 + down * 0.12, pp = 0.04;
    const st = r < pf ? 'fail' : r < pf + pp ? 'pend' : 'ok';
    const [type, ic] = pick(TYPES), amt = Math.round(Math.exp(Math.log(5e4) + Math.random() * Math.log(1000)) / 1000) * 1000;
    const li = el('li', 'ti'); const d = el('div'); d.append(type, el('small', '', `۶۰۳۷ ●●●● ●●●● ${fa(String(1000 + Math.floor(Math.random() * 9000)))}`));
    li.append(el('span', 'ic', ic), d, el('b', '', fa(amt / 1000) + ' هزار'), el('span', 'chip ' + st, st === 'ok' ? 'موفق' : st === 'pend' ? 'در انتظار' : 'ناموفق'));
    $('stream').prepend(li); while ($('stream').children.length > 6) $('stream').lastChild.remove();
    if (st === 'fail') fails++;
}

/* ---------- هشدارهای تقلب ---------- */
const REASONS = ['برداشت پیاپی از ۳ شهر مختلف در ۱۰ دقیقه', 'خرید اینترنتی با مبلغ غیرعادی', 'ورود از دستگاه و موقعیت جدید', 'چند تلاش ناموفق رمز و سپس تراکنش بزرگ', 'انتقال وجه فوری به حساب جدید'];
const frauds = [];
function newFraud() {
    if (frauds.length >= 4) return;
    frauds.unshift({ id: Date.now() + Math.random(), why: pick(REASONS), card: `۶۰۳۷ ●●●● ●●●● ${fa(String(1000 + Math.floor(Math.random() * 9000)))}`, amt: Math.round(2 + Math.random() * 48), risk: 68 + Math.floor(Math.random() * 30) });
    fraud();
}
function fraud() {
    const ul = $('fraud'); ul.replaceChildren(); $('frc').textContent = frauds.length ? `(${fa(frauds.length)} مورد باز)` : '';
    if (!frauds.length) ul.appendChild(el('li', 'empty', 'هشدار بازی وجود ندارد ✓'));
    frauds.forEach((f) => {
        const li = el('li', 'fi'); li.append(el('b', '', f.why), el('small', '', `${f.card} | ${fa(f.amt)} میلیون تومان`));
        const rk = el('div', 'rk'); rk.style.setProperty('--r', f.risk + '%'); rk.append(el('span', '', 'ریسک ' + fa(f.risk) + '٪'), el('i')); li.appendChild(rk);
        const bt = el('div', 'bt'), b1 = el('button', 'blk', 'مسدودسازی'), b2 = el('button', 'ok', 'تأیید تراکنش'); b1.type = b2.type = 'button';
        const done = (msg) => { frauds.splice(frauds.indexOf(f), 1); toast(msg); fraud(); };   // اینجا تصمیم را با fetch به سامانه‌ی ضدتقلب بفرست
        b1.addEventListener('click', () => done('کارت مسدود شد (نمونه)')); b2.addEventListener('click', () => done('تراکنش تأیید شد (نمونه)'));
        bt.append(b1, b2); li.appendChild(bt); ul.appendChild(li);
    });
}

/* ---------- حلقه‌ی زمان ---------- */
setInterval(() => {
    if (document.hidden) return;
    const down = SV.filter((s) => s.state === 'down').length;
    tps = Math.max(80, Math.min(440, tps + (Math.random() - 0.5) * 50 + (230 - tps) * 0.05));
    tx += Math.round(tps); vol += tps * 350000; hist.push(tps); hist.shift();
    counts.forEach((c, i) => (counts[i] += (CH[i][2] / 100) * tps * (0.8 + Math.random() * 0.4)));
    SV.forEach((s) => {
        if (s.state === 'ok' && Math.random() < 0.02) s.state = 'warn'; else if (s.state === 'warn' && Math.random() < 0.25) s.state = 'ok';
        s.ms = s.state === 'down' ? 0 : Math.round(s.base * (0.85 + Math.random() * 0.4) * (s.state === 'warn' ? 2.5 : 1));
        s.hist.push(s.ms); s.hist.shift();
    });
    const live = SV.filter((s) => s.state !== 'down'); avgMs = Math.round(live.reduce((a, s) => a + s.ms, 0) / live.length + down * 12);
    kpis(); drawTps(); health();
}, 1000);
setInterval(() => !document.hidden && addTx(), 1100);
setInterval(() => !document.hidden && donut(), 3000);
setInterval(() => !document.hidden && Math.random() < 0.7 && newFraud(), 12000);
const clk = () => ($('clk').textContent = new Date().toLocaleTimeString('fa-IR'));
clk(); setInterval(clk, 1000);

frauds.push({ id: 1, why: REASONS[0], card: '۶۰۳۷ ●●●● ●●●● ۴۸۲۱', amt: 14, risk: 92 }, { id: 2, why: REASONS[2], card: '۶۰۳۷ ●●●● ●●●● ۷۳۰۵', amt: 6, risk: 74 });
kpis(); drawTps(); health(); donut(); fraud(); for (let i = 0; i < 5; i++) addTx();