const $ = (id) => document.getElementById(id);
const fa = (n) => Math.round(n).toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let yearly = false;

// قیمت‌ها و امکانات نمونه‌اند
const TIERS = [
    { k: 'bronze', name: 'برنز', icon: '🥉', price: 0, tag: 'برای شروع و آزمایش',
        top: ['۳ پروژه', '۱ گیگابایت فضا', 'پشتیبانی ایمیلی'],
        all: ['۳ پروژه فعال', '۱ گیگابایت فضا', 'پشتیبانی ایمیلی', 'گزارش ماهانه', 'یک عضو تیم'] },
    { k: 'silver', name: 'نقره', icon: '🥈', price: 299000, tag: 'برای تیم‌های کوچک',
        top: ['۵۰ پروژه', '۵۰ گیگابایت فضا', 'چت زنده'],
        all: ['همه‌ی امکانات برنز', '۵۰ پروژه فعال', '۵۰ گیگابایت فضا', 'چت زنده', 'تا ۱۰ عضو تیم', 'نقش‌ها و دسترسی‌ها', 'پشتیبان‌گیری روزانه'] },
    { k: 'gold', name: 'طلا', icon: '🥇', price: 799000, tag: 'برای کسب‌وکارهای جدی', popular: true,
        top: ['پروژه‌ی نامحدود', '۵۰۰ گیگابایت فضا', 'پشتیبانی تلفنی ۲۴ ساعته'],
        all: ['همه‌ی امکانات نقره', 'پروژه‌ی نامحدود', '۵۰۰ گیگابایت فضا', 'پشتیبانی تلفنی ۲۴ ساعته', 'اعضای نامحدود', 'ورود یکپارچه (SSO)', 'مدیر حساب اختصاصی', 'گزارش ممیزی'] },
];

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const list = (items) => { const u = el('ul'); items.forEach((t) => u.appendChild(el('li', '', t))); return u; };

TIERS.forEach((t) => {
    const card = el('article', 'card3d'); card.dataset.k = t.k;
    const flip = el('div', 'flip');

    const front = el('div', 'face front');
    if (t.popular) front.appendChild(el('span', 'ribbon', 'محبوب'));
    const price = el('div', 'price');
    const amt = el('b'); amt.dataset.price = t.price;
    price.append(amt, el('span', '', 'تومان / ماه'));
    const pick = el('button', 'pick', t.price ? 'انتخاب' : 'شروع رایگان'); pick.type = 'button';
    const more = el('button', 'more', 'جزئیات'); more.type = 'button';
    const row = el('div', 'row'); row.append(pick, more);
    front.append(el('div', 'medal', t.icon), el('h2', '', t.name), el('p', 'tag', t.tag), price, list(t.top), row, el('div', 'shine'));

    const back = el('div', 'face back'); back.inert = true;
    const less = el('button', 'less', '→ بازگشت'); less.type = 'button';
    back.append(el('h3', '', `امکانات پلن ${t.name}`), list(t.all), less, el('div', 'shine'));

    flip.append(front, back); card.appendChild(flip); $('tiers').appendChild(card);

    const turn = (on) => { card.classList.toggle('flipped', on); front.inert = on; back.inert = !on; (on ? less : more).focus({ preventScroll: true }); };
    more.addEventListener('click', () => turn(true));
    less.addEventListener('click', () => turn(false));
    pick.addEventListener('click', () => {
        // اینجا کاربر را به ثبت‌نام یا پرداخت ببر
        $('msg').textContent = `پلن «${t.name}» (${yearly ? 'سالانه' : 'ماهانه'}) انتخاب شد ✓`;
    });

    // کج شدن سه‌بعدی و بازتاب نور فلزی
    if (!reduced) {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            card.style.transform = `${t.popular ? 'scale(1.05) ' : ''}rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 10}deg)`;
            card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
            card.querySelectorAll('.shine').forEach((s) => { s.style.setProperty('--mx', x * 100 + '%'); s.style.setProperty('--my', y * 100 + '%'); });
        });
        card.addEventListener('pointerleave', () => (card.style.transform = ''));
    }
});

function prices() {
    document.querySelectorAll('[data-price]').forEach((b) => {
        const p = +b.dataset.price;
        b.textContent = p ? fa(yearly ? (p * 10) / 12 : p) : 'رایگان';   // سالانه: ۲ ماه رایگان
    });
}
document.querySelectorAll('#bill button').forEach((b) =>
    b.addEventListener('click', () => {
        yearly = b.dataset.y === '1';
        document.querySelectorAll('#bill button').forEach((x) => x.setAttribute('aria-checked', x === b));
        prices();
    })
);
prices();