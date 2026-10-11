const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
const fa = (n) => n.toLocaleString('fa-IR');

/* ---------- منوهای کشویی و موبایل ---------- */
function closeAll() {
    document.querySelectorAll('.dd').forEach((d) => {
        d.classList.remove('open');
        d.querySelector('.dd-btn').setAttribute('aria-expanded', 'false');
    });
}
document.querySelectorAll('.dd').forEach((d) => {
    const btn = d.querySelector('.dd-btn');
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !d.classList.contains('open');
        closeAll();
        d.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
    });
});
document.addEventListener('click', closeAll);
addEventListener('keydown', (e) => e.key === 'Escape' && closeAll());
burger.addEventListener('click', () => {
    const open = menu.classList.toggle('show');
    burger.setAttribute('aria-expanded', open);
});

/* ---------- وضعیت باز/بسته (ساعت کاری ۱۱ تا ۲۳) ---------- */
const status = document.getElementById('status');
const statusText = document.getElementById('statusText');
function updateStatus() {
    const h = new Date().getHours();
    const open = h >= 11 && h < 23;
    status.classList.toggle('closed', !open);
    statusText.textContent = open ? 'باز است تا ۲۳:۰۰' : 'بسته است، ساعت ۱۱:۰۰ باز می‌شود';
}
updateStatus();
setInterval(updateStatus, 60000);

/* ---------- ارسال / حضوری ---------- */
const mode = document.getElementById('mode');
document.querySelectorAll('.seg button').forEach((b) =>
    b.addEventListener('click', () => {
        document.querySelectorAll('.seg button').forEach((x) => {
            x.classList.toggle('act', x === b);
            x.setAttribute('aria-checked', x === b);
        });
        mode.textContent = 'نحوه‌ی دریافت: ' + b.dataset.m;
        try { localStorage.setItem('mode', b.dataset.m); } catch (_) {}
    })
);
try {
    const m = localStorage.getItem('mode');
    if (m) [...document.querySelectorAll('.seg button')].find((b) => b.dataset.m === m)?.click();
} catch (_) {}

/* ---------- سبد خرید با انیمیشن ---------- */
const cart = document.getElementById('cart');
let count = 0, total = 0;
document.getElementById('add').addEventListener('click', () => {
    count++; total += 245000;
    document.getElementById('count').textContent = fa(count);
    document.getElementById('total').textContent = fa(total) + ' تومان';
    cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump');
});