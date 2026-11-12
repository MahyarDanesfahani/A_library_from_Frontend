const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// نظرها نمونه هستند؛ با نظر واقعی مشتری‌هایت جایگزینشان کن
const DATA = [
    { name: 'سارا احمدی', role: 'مدیر فروشگاه آنلاین', stars: 5, tag: '🛒 فروشگاه آنلاین', c: '#e0527a', text: 'فروشگاهمون رو تو دو هفته تحویل دادن و فروش ماه اول دو برابر شد.' },
    { name: 'امیر رضایی', role: 'مدیرعامل استارتاپ', stars: 5, tag: '🚀 اپلیکیشن وب', c: '#3b82f6', text: 'کدها تمیز و مستند بود. تیم خودمون بدون مشکل ادامه‌ش داد.' },
    { name: 'مریم کاظمی', role: 'صاحب کلینیک', stars: 4, tag: '🏥 نوبت‌دهی آنلاین', c: '#8b5cf6', text: 'بیمارها از رزرو آنلاین تعریف می‌کنن و شلوغی تلفن‌ها نصف شد.' },
    { name: 'علی محمدی', role: 'مدیر ساختمان', stars: 5, tag: '🏢 مدیریت ساختمان', c: '#f59e0b', text: 'پنل شارژ و قبض همه‌چیز رو شفاف کرد. دیگه اختلاف حساب نداریم.' },
    { name: 'نگار صادقی', role: 'مدیر بازاریابی', stars: 5, tag: '🎨 طراحی سایت', c: '#14b8a6', text: 'سایت جدید هم زیباست هم سریع. تبدیل بازدیدکننده به مشتری ۳۰٪ بالا رفت.' },
    { name: 'حسین نوری', role: 'صاحب رستوران', stars: 4, tag: '🍽 منوی دیجیتال', c: '#ef4444', text: 'منوی دیجیتال کار رستوران رو راحت‌تر کرد و مشتری‌ها استقبال کردن.' },
    { name: 'زهرا موسوی', role: 'فروشنده‌ی صنایع دستی', stars: 5, tag: '🧶 فروشگاه آنلاین', c: '#16a34a', text: 'حالا از سراسر کشور سفارش می‌گیرم و همه‌چیز خودکار انجام میشه.' },
];
const N = DATA.length, STEP = 360 / N;
let cur = 0, rot = 0, timer;
const btns = [];

DATA.forEach((d, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = d.name[0];
    b.style.setProperty('--c', d.c);
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-label', `${d.name}، ${d.role}`);
    b.addEventListener('click', () => { select(i); auto(); });
    $('avs').appendChild(b);
    btns.push(b);
});

function select(i, first) {
    cur = ((i % N) + N) % N;
    // کوتاه‌ترین مسیر چرخش تا آواتار انتخابی بالای مدار بیاد
    const target = -cur * STEP;
    rot += ((target - rot) % 360 + 540) % 360 - 180;
    if (first) rot = target;
    btns.forEach((b, k) => {
        b.style.setProperty('--p', k * STEP + rot + 'deg');
        b.classList.toggle('on', k === cur);
        b.setAttribute('aria-checked', k === cur);
        b.tabIndex = k === cur ? 0 : -1;
    });
    const d = DATA[cur];
    $('st').textContent = '★'.repeat(d.stars) + '☆'.repeat(5 - d.stars);
    $('q').textContent = d.text;
    $('nm').textContent = d.name; $('rl').textContent = d.role; $('tg').textContent = d.tag;
    const c = $('center');
    c.classList.remove('sw'); void c.offsetWidth; c.classList.add('sw');
}

// فلش‌ها بین آواتارها جابجا می‌شوند
$('avs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    select(cur + (e.key === 'ArrowLeft' ? 1 : -1));
    btns[cur].focus();
    auto();
});

// چرخش خودکار هر ۶ ثانیه (با رفتن موس یا فوکوس متوقف می‌شود)
function auto() {
    clearInterval(timer);
    if (reduced) return;
    timer = setInterval(() => !document.hidden && select(cur + 1), 6000);
}
const orbit = $('orbit');
['pointerenter', 'focusin'].forEach((ev) => orbit.addEventListener(ev, () => clearInterval(timer)));
['pointerleave', 'focusout'].forEach((ev) => orbit.addEventListener(ev, auto));

select(0, true);
auto();