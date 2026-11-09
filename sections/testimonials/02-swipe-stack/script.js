const $ = (id) => document.getElementById(id);
const fa = (n) => Number(n).toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// نظرها نمونه هستند؛ با نظر واقعی مشتری‌هایت جایگزینشان کن
const DATA = [
    { name: 'سارا احمدی', role: 'مدیر فروشگاه آنلاین', stars: 5, tag: '🛒 فروشگاه آنلاین', a: '#7c5cff', b: '#4b2fd1', text: 'فروشگاهمون رو تو دو هفته تحویل دادن و فروش ماه اول دو برابر شد. تیم فوق‌العاده‌ای هستن.' },
    { name: 'امیر رضایی', role: 'مدیرعامل استارتاپ', stars: 5, tag: '🚀 اپلیکیشن وب', a: '#ff4fa3', b: '#c21f7a', text: 'کدها تمیز و مستند بود و تیم خودمون بدون هیچ مشکلی ادامه‌ش داد. پشتیبانی بعد از تحویل هم عالی بود.' },
    { name: 'مریم کاظمی', role: 'صاحب کلینیک', stars: 4, tag: '🏥 سامانه‌ی نوبت‌دهی', a: '#14b8a6', b: '#0b7a70', text: 'سامانه‌ی نوبت‌دهی خیلی ساده و روان کار می‌کنه. بیمارها هم از رزرو آنلاین تعریف می‌کنن.' },
    { name: 'علی محمدی', role: 'مدیر ساختمان', stars: 5, tag: '🏢 مدیریت ساختمان', a: '#f59e0b', b: '#c2410c', text: 'پنل شارژ و قبض، همه‌چیز رو شفاف کرد. دیگه سر حساب‌وکتاب هیچ اختلافی پیش نمیاد.' },
    { name: 'نگار صادقی', role: 'مدیر بازاریابی', stars: 5, tag: '🎨 طراحی سایت', a: '#3b82f6', b: '#1d4ed8', text: 'سایت جدیدمون هم زیباست هم سریع. نرخ تبدیل بازدیدکننده به مشتری تقریباً ۳۰٪ بالا رفت.' },
    { name: 'حسین نوری', role: 'صاحب رستوران', stars: 4, tag: '🍽 منوی دیجیتال', a: '#ef4444', b: '#a51e1e', text: 'منوی دیجیتال و سفارش آنلاین، کار رستوران رو خیلی راحت‌تر کرد. مشتری‌ها استقبال کردن.' },
];

const stack = $('stack');
const N = DATA.length;
const els = [];
let order = [...Array(N).keys()];
let busy = false, timer;

DATA.forEach((d, i) => {
    const c = document.createElement('article');
    c.className = 'card';
    c.style.setProperty('--a', d.a); c.style.setProperty('--b', d.b);
    const top = document.createElement('div'); top.className = 'top';
    const av = document.createElement('span'); av.className = 'av'; av.textContent = d.name[0];
    const who = document.createElement('div');
    const nm = document.createElement('b'); nm.textContent = d.name;
    const rl = document.createElement('small'); rl.textContent = d.role;
    who.append(nm, rl); top.append(av, who);
    const stars = document.createElement('div'); stars.className = 'stars'; stars.textContent = '★'.repeat(d.stars) + '☆'.repeat(5 - d.stars);
    const q = document.createElement('p'); q.className = 'quote'; q.textContent = d.text;
    const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = d.tag;
    c.append(top, stars, q, tag);
    stack.appendChild(c); els.push(c);
    const dot = document.createElement('i'); $('dots').appendChild(dot);
});

function layout() {
    order.forEach((id, pos) => {
        const c = els[id];
        c.style.zIndex = N - pos;
        c.style.opacity = pos < 4 ? 1 : 0;
        c.style.transform = pos === 0 ? '' : `translateY(${pos * 14}px) scale(${1 - pos * 0.05})`;
        c.style.pointerEvents = pos === 0 ? 'auto' : 'none';
        c.setAttribute('aria-hidden', pos !== 0);
    });
    $('cnt').textContent = `${fa(order[0] + 1)} از ${fa(N)}`;
    [...$('dots').children].forEach((d, i) => d.classList.toggle('on', i === order[0]));
}

// کارت رو به بیرون پرتاب می‌کند و به انتهای پشته می‌فرستد
function fly(dir) {
    if (busy) return;
    busy = true;
    const c = els[order[0]];
    c.classList.remove('drag'); c.classList.add('fly');
    c.style.transform = `translate(${dir * innerWidth * 0.9}px, 30px) rotate(${dir * 25}deg)`;
    c.style.opacity = 0;
    setTimeout(() => {
        c.classList.remove('fly');
        c.style.transition = 'none';
        order.push(order.shift());
        layout();
        void c.offsetWidth;
        c.style.transition = '';
        busy = false;
    }, reduced ? 0 : 400);
}

// آخرین کارت را از بیرون برمی‌گرداند روی پشته
function back() {
    if (busy) return;
    busy = true;
    const id = order.pop(); order.unshift(id);
    const c = els[id];
    c.style.transition = 'none';
    c.style.transform = `translate(${-innerWidth * 0.9}px, 30px) rotate(-25deg)`;
    c.style.opacity = 1;
    void c.offsetWidth;
    c.style.transition = '';
    layout();
    setTimeout(() => (busy = false), reduced ? 0 : 450);
}

/* ---------- کشیدن با موس یا انگشت ---------- */
let sx = 0, dx = 0, dragging = false;
stack.addEventListener('pointerdown', (e) => {
    if (busy) return;
    const c = els[order[0]];
    if (!c.contains(e.target)) return;
    dragging = true; sx = e.clientX; dx = 0;
    c.classList.add('drag');
    stack.setPointerCapture(e.pointerId);
    clearInterval(timer);
});
stack.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - sx;
    els[order[0]].style.transform = `translate(${dx}px, ${Math.abs(dx) * 0.08}px) rotate(${dx * 0.05}deg)`;
});
function release() {
    if (!dragging) return;
    dragging = false;
    const c = els[order[0]];
    c.classList.remove('drag');
    if (Math.abs(dx) > 90) fly(Math.sign(dx));
    else c.style.transform = '';
    auto();
}
stack.addEventListener('pointerup', release);
stack.addEventListener('pointercancel', release);

$('skip').addEventListener('click', () => { fly(-1); auto(); });
$('undo').addEventListener('click', () => { back(); auto(); });
stack.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); fly(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); back(); }
});

// پخش خودکار هر ۵ ثانیه (با رفتن موس یا فوکوس متوقف می‌شود)
function auto() {
    clearInterval(timer);
    if (reduced) return;
    timer = setInterval(() => !document.hidden && fly(-1), 5000);
}
['pointerenter', 'focusin'].forEach((ev) => stack.addEventListener(ev, () => clearInterval(timer)));
['pointerleave', 'focusout'].forEach((ev) => stack.addEventListener(ev, auto));

layout();
auto();