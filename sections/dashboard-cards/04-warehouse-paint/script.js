const $ = (id) => document.getElementById(id);
const fa = (n) => Math.round(n).toLocaleString('fa-IR');
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const NS = 'http://www.w3.org/2000/svg';

// کالاها و موجودی‌ها نمونه هستند؛ با داده‌ی واقعی (API) جایگزین کن
const STEP = 5;
const ITEMS = [
    { name: 'رنگ پلاستیک سفید', color: '#f4f1ea', stock: 64, max: 80, min: 20, price: 1450000 },
    { name: 'رنگ اکریلیک آبی', color: '#2b7de9', stock: 38, max: 60, min: 15, price: 1680000 },
    { name: 'رنگ روغنی قرمز', color: '#d93636', stock: 14, max: 50, min: 15, price: 1820000 },
    { name: 'رزین اپوکسی شفاف', color: '#bfe9f2', stock: 9, max: 40, min: 12, price: 3250000 },
    { name: 'پرایمر ضدزنگ', color: '#8a5a3c', stock: 46, max: 60, min: 15, price: 1190000 },
    { name: 'رنگ استخری سبز', color: '#1fae7b', stock: 25, max: 45, min: 12, price: 2100000 },
];
const FLOW = { in: [40, 25, 60, 30, 45, 20, 0], out: [35, 42, 28, 50, 33, 38, 0] };   // گالن در ۷ روز اخیر
const DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

/* ---------- ساخت کارت قوطی‌ها ---------- */
ITEMS.forEach((it, i) => {
    const c = el('article', 'can');
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 80 100'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = `<defs><clipPath id="cp${i}"><rect x="10" y="24" width="60" height="68" rx="7"/></clipPath></defs>
    <ellipse cx="40" cy="24" rx="30" ry="7" fill="#c9c2b4"/>
    <rect x="10" y="24" width="60" height="68" rx="7" fill="#e9e3d6"/>
    <g clip-path="url(#cp${i})"><rect class="paint" x="10" y="24" width="60" height="68" fill="${it.color}" style="transform:scaleY(0)"/></g>
    <rect x="10" y="24" width="60" height="68" rx="7" fill="none" stroke="#a79f8f" stroke-width="2"/>
    <rect x="10" y="50" width="60" height="16" fill="rgba(255,255,255,.55)"/>
    <path d="M14 22 Q40 -6 66 22" fill="none" stroke="#8d8576" stroke-width="3"/>`;
    it.paint = svg.querySelector('.paint');
    const nm = el('b', '', it.name), qt = el('span', 'qt'), st = el('span', 'st');
    const step = el('div', 'step');
    const mk = (t, label, d) => { const b = el('button', '', t); b.type = 'button'; b.setAttribute('aria-label', label); b.addEventListener('click', () => move(it, d)); return b; };
    step.append(mk('−', `خروج ${STEP} گالن ${it.name}`, -STEP), mk('+', `ورود ${STEP} گالن ${it.name}`, STEP));
    const re = el('button', 'reorder', 'سفارش مجدد'); re.type = 'button'; re.hidden = true;
    re.addEventListener('click', () => { // اینجا درخواست خرید را به بک‌اند بفرست
        const q = Math.round(it.max / 2); toast(`سفارش خرید ${fa(q)} گالن «${it.name}» ثبت شد (نمونه)`); });
    c.append(svg, nm, qt, st, step, re);
    $('cans').appendChild(c);
    Object.assign(it, { c, qt, st, re });
});

/* ---------- نمودار گردش ---------- */
const bars = DAYS.map((d, i) => {
    const b = el('button'); b.type = 'button'; b.setAttribute('role', 'listitem');
    const pair = el('div', 'pair'), a = el('i', 'a'), o = el('i', 'b'); pair.append(a, o); b.append(pair, el('span', '', d));
    const show = () => ($('tip').textContent = `${['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'][i]}: ورودی ${fa(FLOW.in[i])} | خروجی ${fa(FLOW.out[i])} گالن`);
    ['pointerenter', 'focus', 'click'].forEach((ev) => b.addEventListener(ev, show));
    $('chart').appendChild(b);
    return { a, o, b };
});
function drawFlow() {
    const mx = Math.max(...FLOW.in, ...FLOW.out, 1);
    bars.forEach((b, i) => { b.a.style.setProperty('--h', (FLOW.in[i] / mx) * 100 + '%'); b.o.style.setProperty('--h', (FLOW.out[i] / mx) * 100 + '%'); });
}

/* ---------- ورود و خروج کالا ---------- */
const LOG = [];
function move(it, d) {
    const n = Math.max(0, Math.min(it.max, it.stock + d)), real = n - it.stock;
    if (!real) return toast(d > 0 ? 'ظرفیت این کالا پر است' : 'موجودی این کالا صفر است');
    it.stock = n;
    if (real > 0) FLOW.in[6] += real; else FLOW.out[6] += -real;
    LOG.unshift({ t: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }), in: real > 0, text: `${real > 0 ? 'ورود' : 'خروج'} ${fa(Math.abs(real))} گالن ${it.name}` });
    LOG.length = Math.min(LOG.length, 6);
    update(); drawFlow();       // اینجا تغییر را به بک‌اند بفرست
}

function update() {
    let tot = 0, cap = 0, val = 0, low = 0;
    ITEMS.forEach((it) => {
        const p = it.stock / it.max, lvl = it.stock <= it.min * 0.6 ? 'crit' : it.stock <= it.min ? 'low' : 'ok';
        it.paint.style.transform = `scaleY(${p})`;
        it.c.className = 'can' + (lvl === 'ok' ? '' : ' ' + lvl);
        it.qt.textContent = `${fa(it.stock)} از ${fa(it.max)} گالن`;
        it.st.textContent = lvl === 'ok' ? 'موجودی عادی' : lvl === 'low' ? 'رو به اتمام' : 'بحرانی';
        it.re.hidden = lvl === 'ok';
        tot += it.stock; cap += it.max; val += it.stock * it.price; if (lvl !== 'ok') low++;
    });
    const chips = $('chips'); chips.replaceChildren();
    [['اقلام', fa(ITEMS.length)], ['ارزش موجودی', fa(val / 1e6) + ' میلیون تومان']].forEach(([l, v]) => { const s = el('span', '', l + ': '); s.appendChild(el('b', '', v)); chips.appendChild(s); });
    if (low) chips.appendChild(el('span', 'alert', `⚠ ${fa(low)} کالا نیاز به سفارش دارد`));
    const pct = Math.round((tot / cap) * 100);
    $('cp').textContent = fa(pct);
    $('ring').style.strokeDashoffset = 276.46 * (1 - pct / 100);
    $('cnote').textContent = pct > 85 ? 'انبار تقریباً پر است؛ ورودی جدید را با احتیاط ثبت کن.' : pct < 35 ? 'موجودی انبار کم است.' : 'ظرفیت انبار در وضعیت مطلوب است.';
    const ul = $('log'); ul.replaceChildren();
    if (!LOG.length) ul.appendChild(el('li', 'empty', 'با دکمه‌های + و − روی هر قوطی، ورود و خروج ثبت کن.'));
    LOG.forEach((l) => { const li = el('li', l.in ? 'in' : 'out'); li.append(el('b', '', l.text), el('small', '', l.t)); ul.appendChild(li); });
}

let tt;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2600); }

update();
requestAnimationFrame(() => requestAnimationFrame(drawFlow));