const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const NS = 'http://www.w3.org/2000/svg';
const svg = (n, a = {}, p) => { const e = document.createElementNS(NS, n); Object.entries(a).forEach(([k, v]) => e.setAttribute(k, v)); (p || $('map')).appendChild(e); return e; };

// نقشه، پیک‌ها و سفارش‌ها شبیه‌سازی و نمونه هستند؛ تو سیستم واقعی موقعیت پیک‌ها را از GPS و API بگیر
const CELL = 50, COLS = 12, ROWS = 7, DEPOT = { x: 6 * CELL, y: 3 * CELL };
const ZONES = ['شمال‌غرب', 'شمال‌شرق', 'جنوب‌غرب', 'جنوب‌شرق'];
const zone = (x, y) => ZONES[(y > DEPOT.y ? 2 : 0) + (x > DEPOT.x ? 1 : 0)];
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

/* ---------- ساخت نقشه ---------- */
let seed = 5; const rs = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++)
    svg('rect', { class: rs() < 0.14 ? 'park' : 'blk', x: i * CELL + 7, y: j * CELL + 7, width: CELL - 14, height: CELL - 14, rx: 7 });
const dep = svg('g', { class: 'depot', transform: `translate(${DEPOT.x} ${DEPOT.y})` });
svg('circle', { r: 17 }, dep); const dt = svg('text', { y: 6, 'font-size': 18 }, dep); dt.textContent = '🏪';
const pinLayer = svg('g'), crLayer = svg('g');

/* ---------- پیک‌ها و سفارش‌ها ---------- */
const COLORS = ['#2457d6', '#e0483f', '#1fa56a', '#8b5cf6'];
const NAMES = ['علی', 'رضا', 'مریم', 'سینا'];
const couriers = NAMES.map((name, i) => {
    const g = svg('g', { class: 'cr', tabindex: 0, role: 'button', 'aria-label': `پیک ${name}` }, crLayer);
    const c = svg('circle', { r: 15 }, g); c.style.stroke = COLORS[i]; const t = svg('text', {}, g); t.textContent = '🛵';
    const o = { name, g, x: DEPOT.x + (i - 1.5) * 12, y: DEPOT.y + 28, speed: 70 + i * 6, path: [], order: null, state: 'idle' };
    g.addEventListener('click', () => select(o)); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(o); } });
    return o;
});
const orders = []; let nid = 1020, doneN = 42, avgMin = 24, sel = null;

function newOrder() {
    if (orders.filter((o) => o.status !== 'done').length >= 7) return;
    const gx = rnd(1, COLS - 1), gy = rnd(1, ROWS - 1);
    if (gx * CELL === DEPOT.x && gy * CELL === DEPOT.y) return;
    const o = { id: ++nid, x: gx * CELL, y: gy * CELL, status: 'wait', born: performance.now(), courier: null };
    const pin = svg('g', { class: 'pin', transform: `translate(${o.x} ${o.y - 4})` }, pinLayer); const t = svg('text', { 'font-size': 20, 'text-anchor': 'middle' }, pin); t.textContent = '📍';
    o.pin = pin; orders.push(o); ui();
}
$('newOrder').addEventListener('click', newOrder);

function assign() {
    orders.filter((o) => o.status === 'wait').forEach((o) => {
        const c = couriers.find((x) => x.state === 'idle'); if (!c) return;
        o.status = 'way'; o.courier = c; c.order = o; c.state = 'go';
        c.path = [{ x: c.x, y: DEPOT.y + 0 }, { x: o.x, y: DEPOT.y }, { x: o.x, y: o.y }];   // مسیر خیابانی: افقی و سپس عمودی
    });
}

/* ---------- حرکت (هر فریم) ---------- */
let last = performance.now();
function frame(now) {
    const dt = Math.min(0.06, (now - last) / 1000); last = now;
    couriers.forEach((c) => {
        if (c.path.length) {
            const tgt = c.path[0], dx = tgt.x - c.x, dy = tgt.y - c.y, d = Math.hypot(dx, dy), step = c.speed * dt;
            if (d <= step) { c.x = tgt.x; c.y = tgt.y; c.path.shift(); } else { c.x += (dx / d) * step; c.y += (dy / d) * step; }
            if (!c.path.length) arrived(c);
        }
        c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})`);
    });
    requestAnimationFrame(frame);
}
function arrived(c) {
    if (c.state === 'go') {   // سفارش تحویل شد؛ برگشت به فروشگاه
        const o = c.order; o.status = 'done'; o.pin.classList.add('gone'); setTimeout(() => o.pin.remove(), 700);
        doneN++; avgMin = (avgMin * (doneN - 1) + ((performance.now() - o.born) / 1000) * 2) / doneN;   // هر ثانیه‌ی نمایشی ≈ ۲ دقیقه
        const px = DEPOT.x + (couriers.indexOf(c) - 1.5) * 12;
        c.state = 'back'; c.path = [{ x: o.x, y: DEPOT.y }, { x: px, y: DEPOT.y }, { x: px, y: DEPOT.y + 28 }];   // برگشت هم فقط از خیابان‌ها
        c.order = null; ui();
    } else if (c.state === 'back') { c.state = 'idle'; ui(); }
}

/* ---------- رابط ---------- */
const KP = [['📦', 'سفارش فعال', 'سفارش'], ['✅', 'تحویل‌شده امروز', 'سفارش'], ['⏱', 'میانگین تحویل', 'دقیقه'], ['🛵', 'پیک آزاد', 'از ۴']];
const kp = KP.map(([ic, lb, un]) => { const c = el('article', 'card kpi'), b = el('b'), v = el('span'); b.append(v, el('small', '', ' ' + un)); c.append(el('span', 'ic', ic), el('span', 'lb', lb), b); $('kpis').appendChild(c); return v; });
const COL = [['wait', 'در انتظار پیک', '#f0a30a'], ['way', 'در راه', '#2457d6'], ['done', 'تحویل‌شده', '#1fa56a']];
const cols = {};
COL.forEach(([k, lb, c]) => { const d = el('div', 'col'), h = el('h3', '', lb), n = el('span'); n.style.setProperty('--c', c); h.appendChild(n); const ul = el('ul'); d.append(h, ul); $('cols').appendChild(d); cols[k] = { ul, n }; });

function ui() {
    const act = orders.filter((o) => o.status !== 'done');
    kp[0].textContent = fa(act.length); kp[1].textContent = fa(doneN); kp[2].textContent = fa(avgMin); kp[3].textContent = fa(couriers.filter((c) => c.state === 'idle').length);
    COL.forEach(([k]) => {
        const list = orders.filter((o) => o.status === k).slice(k === 'done' ? -3 : 0).reverse().slice(0, 4);
        cols[k].n.textContent = fa(k === 'done' ? doneN : orders.filter((o) => o.status === k).length);
        cols[k].ul.replaceChildren();
        if (!list.length) cols[k].ul.appendChild(el('li', 'none', k === 'done' ? 'هنوز تحویلی در این نشست نیست' : 'خالی'));
        list.forEach((o) => { const li = el('li', '', `#${fa(String(o.id))}`); li.appendChild(el('small', '', zone(o.x, o.y) + (o.courier ? ' | ' + o.courier.name : ''))); cols[k].ul.appendChild(li); });
    });
    panel();
}
function select(c) { sel = c; couriers.forEach((x) => x.g.classList.toggle('on', x === c)); panel(); }
function panel() {
    const box = $('sel'); box.replaceChildren();
    if (!sel) { box.appendChild(el('span', '', 'یک پیک را روی نقشه انتخاب کن تا وضعیتش را ببینی.')); return; }
    const c = sel, st = c.state === 'idle' ? 'آزاد در فروشگاه' : c.state === 'back' ? 'در حال بازگشت به فروشگاه' : `در مسیر تحویل سفارش #${fa(String(c.order.id))}`;
    box.appendChild(el('b', '', `پیک ${c.name}`)); box.appendChild(el('small', '', st));
    if (c.state === 'go') { const rem = c.path.reduce((s, p, i, a) => s + Math.hypot(p.x - (i ? a[i - 1].x : c.x), p.y - (i ? a[i - 1].y : c.y)), 0); box.appendChild(el('small', '', `مقصد: ${zone(c.order.x, c.order.y)} | زمان باقی‌مانده تقریبی: ${fa(Math.max(1, Math.round(rem / CELL * 1.5)))} دقیقه`)); }
}
setInterval(() => { if (document.hidden) return; assign(); panel(); }, 600);
setInterval(() => { if (!document.hidden && Math.random() < 0.8) newOrder(); }, 5500);

newOrder(); newOrder(); ui(); select(couriers[0]);
requestAnimationFrame(frame);