const $ = (id) => document.getElementById(id);
const fa = (n) => Math.round(n).toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RATE = { free: 0, pro: 69000, biz: 119000 };   // قیمت هر نفر در ماه (نمونه)
const LIMIT = { free: 3, pro: 25, biz: 100 };
const NAMES = { free: 'رایگان', pro: 'حرفه‌ای', biz: 'سازمانی' };
let seats = 5, yearly = false;
const cards = [...document.querySelectorAll('.plan')];

// عدد قیمت با انیمیشن به مقدار جدید می‌رسد
function tween(el, to) {
    const from = +el.dataset.v || 0;
    el.dataset.v = to;
    if (reduced || from === to) { el.textContent = fa(to); return; }
    const t0 = performance.now();
    cancelAnimationFrame(+el.dataset.raf || 0);
    (function step(t) {
        const p = Math.min(1, (t - t0) / 380), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fa(from + (to - from) * e);
        if (p < 1) el.dataset.raf = requestAnimationFrame(step);
    })(t0);
}

const recommended = () => (seats <= LIMIT.free ? 'free' : seats <= LIMIT.pro ? 'pro' : 'biz');

function render() {
    const rec = recommended();
    cards.forEach((c) => {
        const p = c.dataset.p, ok = seats <= LIMIT[p];
        const rate = RATE[p] * (yearly ? 0.8 : 1);
        const total = ok ? rate * seats : 0;
        c.classList.toggle('rec', p === rec);
        c.classList.toggle('off', !ok);
        tween(c.querySelector('.amt'), total);
        c.querySelector('.per').textContent = !ok ? `حداکثر ${fa(LIMIT[p])} عضو` : p === 'free' ? 'برای همیشه رایگان' : `${fa(rate)} تومان برای هر نفر در ماه`;
        c.querySelector('.yr').textContent = ok && yearly && p !== 'free' ? `پرداخت سالانه: ${fa(total * 12)} تومان` : '';
        const b = c.querySelector('.pick');
        b.disabled = !ok;
        b.textContent = ok ? 'انتخاب پلن' : 'خارج از ظرفیت';
    });
}

const team = $('team');
team.addEventListener('input', () => {
    seats = +team.value;
    $('tv').textContent = fa(seats);
    team.style.setProperty('--p', ((seats - 1) / 99) * 100 + '%');
    render();
});

document.querySelectorAll('#bill button').forEach((b) =>
    b.addEventListener('click', () => {
        yearly = b.dataset.y === '1';
        document.querySelectorAll('#bill button').forEach((x) => x.setAttribute('aria-checked', x === b));
        render();
    })
);

cards.forEach((c) =>
    c.querySelector('.pick').addEventListener('click', () => {
        // اینجا کاربر را به صفحه‌ی پرداخت یا ثبت‌نام ببر
        $('msg').textContent = `پلن «${NAMES[c.dataset.p]}» برای ${fa(seats)} نفر (${yearly ? 'سالانه' : 'ماهانه'}) انتخاب شد ✓`;
    })
);

$('tv').textContent = fa(seats);
team.style.setProperty('--p', ((seats - 1) / 99) * 100 + '%');
render();