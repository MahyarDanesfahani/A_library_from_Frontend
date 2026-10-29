const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- پیشنهاد گل روز ---------- */
const flowers = ['رز هلویی برای یک شروع نرم', 'لاله‌ی زرد برای خبر خوب', 'اسطوخودوس برای نفس عمیق', 'آفتابگردان برای روشن ماندن'];
$('surprise').addEventListener('click', () => {
    $('flower').textContent = '✿ ' + flowers[Math.floor(Math.random() * flowers.length)];
});

/* ---------- عضویت در نامه‌ی باغ ---------- */
$('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.currentTarget.querySelector('input');
    const msg = $('msg');
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { msg.textContent = 'ایمیل معتبر نیست.'; return; }
    msg.textContent = 'نامه‌ات در مسیر باغ است ✿';
    e.currentTarget.reset();
});

/* ---------- بازگشت به بالا ---------- */
$('top').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
