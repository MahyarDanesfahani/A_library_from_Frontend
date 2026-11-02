const $ = (id) => document.getElementById(id);
const fa = (n) => Math.round(n).toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// پلن‌ها و قیمت‌ها نمونه‌اند؛ با پلن‌های واقعی خودت جایگزین کن
const PLANS = [
    { name: 'شروع', desc: 'برای کسی که تازه راه افتاده', price: 0, icon: '🚶', hue: 200,
        feats: ['تا ۳ پروژه', '۱ گیگابایت فضا', 'پشتیبانی ایمیلی', 'گزارش ماهانه'] },
    { name: 'رشد', desc: 'برای فریلنسرها و استارتاپ‌های کوچک', price: 190000, icon: '🏃', hue: 160,
        feats: ['۲۵ پروژه', '۲۰ گیگابایت فضا', 'چت زنده', 'دامنه‌ی اختصاصی', 'گزارش هفتگی'] },
    { name: 'حرفه‌ای', desc: 'برای تیم‌های در حال گسترش', price: 490000, icon: '🧗', hue: 40,
        feats: ['پروژه‌ی نامحدود', '۲۰۰ گیگابایت فضا', 'نقش‌ها و دسترسی‌ها', 'API کامل', 'پشتیبان‌گیری روزانه', 'اولویت در پشتیبانی'] },
    { name: 'سازمانی', desc: 'برای شرکت‌ها و سازمان‌ها', price: 1290000, icon: '🚀', hue: 285,
        feats: ['همه‌ی امکانات حرفه‌ای', '۲ ترابایت فضا', 'ورود یکپارچه (SSO)', 'مدیر حساب اختصاصی', 'گزارش ممیزی', 'پشتیبانی تلفنی ۲۴ ساعته'] },
];
let cur = 1, yearly = false;
const stairs = $('stairs'), hero = $('hero');
const steps = [];

PLANS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'step';
    b.dataset.n = fa(i + 1);
    b.style.setProperty('--h', 90 + i * 55 + 'px');
    b.style.setProperty('--hue', p.hue);
    b.setAttribute('role', 'radio');
    const n = document.createElement('b'); n.textContent = p.name;
    const s = document.createElement('span'); s.className = 'sp';
    b.append(n, s);
    b.addEventListener('click', () => select(i));
    stairs.appendChild(b);
    steps.push(b);
});

// قهرمان روی پله‌ی انتخاب‌شده می‌ایستد
function placeHero(animate) {
    const st = steps[cur];
    const x = st.offsetLeft + st.offsetWidth / 2 - hero.offsetWidth / 2;
    const y = stairs.clientHeight - st.offsetHeight - hero.offsetHeight;   // بالای پله
    hero.style.transition = animate && !reduced ? '' : 'none';
    hero.style.transform = `translate(${x}px, ${y}px)`;
    if (animate && !reduced) { hero.classList.remove('hop'); void hero.offsetWidth; hero.classList.add('hop'); }
}

function showPrices() {
    steps.forEach((b, i) => {
        const p = PLANS[i].price * (yearly ? 0.8 : 1);
        b.querySelector('.sp').textContent = PLANS[i].price ? fa(p) : 'رایگان';
    });
}

function detail() {
    const p = PLANS[cur];
    const price = p.price * (yearly ? 0.8 : 1);
    document.documentElement.style.setProperty('--hue', p.hue);
    $('dn').textContent = p.name;
    $('dd').textContent = p.desc;
    $('dprice').textContent = p.price ? fa(price) : 'رایگان';
    $('dunit').textContent = p.price ? 'تومان / ماه' : '';
    $('dyear').textContent = p.price && yearly ? `پرداخت سالانه: ${fa(price * 12)} تومان` : '';
    $('hi').textContent = p.icon;
    const ul = $('df');
    ul.replaceChildren();
    p.feats.forEach((f, i) => {
        const li = document.createElement('li');
        li.textContent = f;
        li.style.setProperty('--i', i);
        ul.appendChild(li);
    });
    $('cta').textContent = p.price ? `انتخاب پلن ${p.name}` : 'شروع رایگان';
}

function select(i, focus) {
    cur = i;
    steps.forEach((b, k) => { b.setAttribute('aria-checked', k === i); b.tabIndex = k === i ? 0 : -1; });
    if (focus) steps[i].focus();
    placeHero(true);
    detail();
}

// فلش‌ها: در صفحه‌ی راست‌به‌چپ، فلش چپ یعنی پله‌ی بعدی
stairs.addEventListener('keydown', (e) => {
    const rtl = getComputedStyle(stairs).direction === 'rtl';
    const next = (e.key === 'ArrowLeft') === rtl ? 1 : -1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        select(Math.min(PLANS.length - 1, Math.max(0, cur + next)), true);
    }
});

document.querySelectorAll('#bill button').forEach((b) =>
    b.addEventListener('click', () => {
        yearly = b.dataset.y === '1';
        document.querySelectorAll('#bill button').forEach((x) => x.setAttribute('aria-checked', x === b));
        showPrices(); detail();
    })
);
$('cta').addEventListener('click', () => {
    // اینجا کاربر را به ثبت‌نام یا پرداخت ببر
    $('msg').textContent = `پلن «${PLANS[cur].name}» (${yearly ? 'سالانه' : 'ماهانه'}) انتخاب شد ✓`;
});
addEventListener('resize', () => placeHero(false));

showPrices();
select(cur);
placeHero(false);
document.fonts?.ready.then(() => placeHero(false));