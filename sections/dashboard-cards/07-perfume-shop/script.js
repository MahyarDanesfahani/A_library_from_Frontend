const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const NS = 'http://www.w3.org/2000/svg';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// عطرها، قیمت‌ها و آمار نمونه و ساختگی هستند؛ با داده‌ی واقعی فروشگاهت جایگزین کن
const FAM = [
    { n: 'گلی', ic: '🌸', c: '#ff7aa8', perfumes: [
            { n: 'رز دمشق', sales: 142, price: 2400000, stock: 18, notes: { top: ['برگاموت', 'گلابی'], heart: ['رز دمشقی', 'یاس'], base: ['مشک سفید', 'عنبر'] } },
            { n: 'باغ یاس', sales: 96, price: 1950000, stock: 7, notes: { top: ['نارنگی', 'لیمو'], heart: ['یاس', 'نرگس'], base: ['صندل', 'وانیل'] } },
            { n: 'شکوفه‌ی بهار', sales: 71, price: 1700000, stock: 22, notes: { top: ['سیب سبز'], heart: ['شکوفه‌ی گیلاس', 'پیونی'], base: ['مشک', 'چوب سدر'] } } ] },
    { n: 'چوبی', ic: '🪵', c: '#c68a4a', perfumes: [
            { n: 'جنگل شب', sales: 118, price: 2850000, stock: 12, notes: { top: ['فلفل سیاه', 'اسطوخودوس'], heart: ['سدر', 'وتیور'], base: ['پچولی', 'عود'] } },
            { n: 'سدر سپید', sales: 64, price: 2200000, stock: 9, notes: { top: ['صنوبر'], heart: ['سدر', 'گیاه‌ها'], base: ['خزه‌ی بلوط', 'مشک'] } } ] },
    { n: 'شرقی', ic: '🔥', c: '#e0483f', perfumes: [
            { n: 'عود زعفرانی', sales: 131, price: 3600000, stock: 5, notes: { top: ['زعفران', 'هل'], heart: ['عود', 'گل سرخ'], base: ['عنبر', 'مشک', 'وانیل'] } },
            { n: 'شب‌های اصفهان', sales: 88, price: 2950000, stock: 14, notes: { top: ['دارچین'], heart: ['گل محمدی', 'کهربا'], base: ['بخور', 'صندل'] } } ] },
    { n: 'مرکباتی', ic: '🍋', c: '#e6c229', perfumes: [
            { n: 'صبح نارنج', sales: 83, price: 1600000, stock: 31, notes: { top: ['نارنج', 'لیمو', 'گریپ‌فروت'], heart: ['چای سبز', 'نعنا'], base: ['مشک سفید'] } },
            { n: 'دریای لیمو', sales: 59, price: 1450000, stock: 26, notes: { top: ['لیمو آمالفی', 'بادرنجبویه'], heart: ['زنجبیل'], base: ['چوب سبک', 'عنبر'] } } ] },
];
const SAMPLES = [['نگار ا.', 'رز دمشق'], ['امیر ر.', 'عود زعفرانی'], ['مریم ک.', 'جنگل شب'], ['علی م.', 'صبح نارنج']].map(([who, p]) => ({ who, p, done: false }));
let fi = 0, pi = -1, rev = 38.4e6, orders = 27;

const total = () => FAM.reduce((s, f) => s + f.perfumes.reduce((a, p) => a + p.sales, 0), 0);
const famSales = (f) => f.perfumes.reduce((a, p) => a + p.sales, 0);

/* ---------- KPI ---------- */
const KP = [['sales', 'فروش امروز', 'میلیون تومان'], ['orders', 'سفارش‌ها', 'سفارش'], ['basket', 'میانگین سبد', 'میلیون تومان'], ['repeat', 'مشتری برگشتی', '٪']];
const kp = {};
KP.forEach(([k, lb, un]) => {
    const c = el('article', 'card kpi'); const b = el('b'); const small = el('small', '', ' ' + un); const plus = el('span', 'plus');
    b.append(el('span', 'val'), small); c.append(el('p', 'lb', lb), b, plus); $('kpis').appendChild(c); kp[k] = { val: b.firstChild, plus };
});
function kpis() {
    kp.sales.val.textContent = fa(rev / 1e6, 1); kp.orders.val.textContent = fa(orders);
    kp.basket.val.textContent = fa(rev / orders / 1e6, 2); kp.repeat.val.textContent = fa(41);
}

/* ---------- چرخ رایحه (حلقه‌ی تقسیم‌شده) ---------- */
const C = 2 * Math.PI * 38, circles = [];
let cum = 0;
FAM.forEach((f, i) => {
    const len = (famSales(f) / total()) * C, c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 50); c.setAttribute('cy', 50); c.setAttribute('r', 38); c.setAttribute('stroke', f.c);
    c.setAttribute('stroke-dasharray', `${Math.max(0, len - 1.5)} ${C}`); c.setAttribute('stroke-dashoffset', -cum);
    c.addEventListener('click', () => pickFam(i)); c.addEventListener('pointerenter', () => preview(i)); c.addEventListener('pointerleave', () => preview(fi));
    $('wsvg').appendChild(c); circles.push(c); cum += len;
    const b = el('button'); b.type = 'button'; b.setAttribute('role', 'radio'); b.style.setProperty('--c', f.c);
    b.append(el('i'), `${f.ic} ${f.n}`); b.addEventListener('click', () => pickFam(i)); $('leg').appendChild(b); f.btn = b;
});
function preview(i) { $('wn').textContent = FAM[i].ic + ' ' + FAM[i].n; $('wp').textContent = fa((famSales(FAM[i]) / total()) * 100) + '٪'; }
function pickFam(i) {
    fi = i; pi = -1;
    circles.forEach((c, k) => { c.classList.toggle('on', k === i); c.classList.toggle('dim', k !== i); });
    FAM.forEach((f, k) => f.btn.setAttribute('aria-checked', k === i));
    preview(i); list(); pyramid();
}

/* ---------- فهرست عطرهای هر خانواده ---------- */
function list() {
    const f = FAM[fi], ul = $('plist'); ul.replaceChildren();
    $('pt').textContent = `پرفروش‌های خانواده‌ی ${f.n}`;
    const mx = Math.max(...f.perfumes.map((p) => p.sales));
    [...f.perfumes].sort((a, b) => b.sales - a.sales).forEach((p) => {
        const li = el('li'), b = el('button', 'pi'); b.type = 'button'; b.setAttribute('aria-pressed', f.perfumes[pi] === p);
        const s = el('small', '', `${fa(p.price / 1000)} هزار تومان | `); s.appendChild(el('span', p.stock < 8 ? 'low' : '', p.stock < 8 ? `فقط ${fa(p.stock)} عدد مانده` : `موجودی ${fa(p.stock)}`));
        const t = el('div', 't'), i = el('i'); t.appendChild(i);
        b.append(el('b', '', p.n), el('span', 'n', fa(p.sales) + ' فروش'), s, el('span'), t);
        b.addEventListener('click', () => { pi = f.perfumes.indexOf(p); list(); pyramid(); });
        li.appendChild(b); ul.appendChild(li);
        requestAnimationFrame(() => requestAnimationFrame(() => (i.style.width = (p.sales / mx) * 100 + '%')));
    });
}

/* ---------- هرم رایحه ---------- */
function pyramid() {
    const box = $('pyramid'); box.replaceChildren();
    const p = FAM[fi].perfumes[pi];
    $('pyt').textContent = p ? `هرم رایحه‌ی «${p.n}»` : 'هرم رایحه';
    if (!p) { box.appendChild(el('p', 'ph', 'یک عطر را از فهرست انتخاب کن تا نُت‌هایش را ببینی.')); return; }
    [['top', 'نُت سر (اولین حس)', p.notes.top, '0s'], ['heart', 'نُت قلب (بدنه‌ی اصلی)', p.notes.heart, '.12s'], ['base', 'نُت پایه (ماندگاری)', p.notes.base, '.24s']].forEach(([k, lb, notes, d]) => {
        const l = el('div', 'lay ' + k); l.style.setProperty('--d', d); l.appendChild(el('h3', '', lb));
        const ch = el('div', 'ch'); notes.forEach((n) => ch.appendChild(el('span', '', n))); l.appendChild(ch); box.appendChild(l);
    });
}

/* ---------- درخواست نمونه ---------- */
function samples() {
    const ul = $('slist'); ul.replaceChildren();
    $('spend').textContent = `(${fa(SAMPLES.filter((s) => !s.done).length)} در انتظار)`;
    SAMPLES.forEach((s) => {
        const li = el('li', 'si' + (s.done ? ' done' : '')); const d = el('div'); d.append(s.who, el('small', '', 'نمونه‌ی ۲ میلی‌لیتری «' + s.p + '»'));
        const b = el('button', '', s.done ? 'ارسال شد ✓' : 'ثبت ارسال'); b.type = 'button';
        b.addEventListener('click', () => { s.done = !s.done; samples(); });   // اینجا وضعیت را به بک‌اند بفرست
        li.append(d, b); ul.appendChild(li);
    });
}

/* ---------- فروش زنده (شبیه‌سازی) ---------- */
function liveSale() {
    if (document.hidden) return;
    const all = FAM.flatMap((f) => f.perfumes).filter((p) => p.stock > 0);
    if (!all.length) return;
    const p = all[Math.floor(Math.random() * all.length)];
    p.stock--; p.sales++; rev += p.price; orders++;
    kpis(); list();
    [['sales', '+' + fa(p.price / 1e6, 2)], ['orders', '+۱']].forEach(([k, t]) => { const x = kp[k].plus; x.textContent = t; x.classList.remove('pop'); void x.offsetWidth; x.classList.add('pop'); });
}
setInterval(liveSale, 4200);

kpis(); samples(); pickFam(0);