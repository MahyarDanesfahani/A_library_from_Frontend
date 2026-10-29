const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- اتصال خبرنامه‌ی ایستگاه ---------- */
$('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.currentTarget.querySelector('input');
    if (!/^\S+@\S+\.\S+$/.test(email.value.trim())) { $('msg').textContent = 'ایمیل معتبر نیست.'; return; }
    $('msg').textContent = 'اتصال برقرار شد؛ پیام بعدی از مدار می‌آید ✦';
    e.currentTarget.reset();
});

/* ---------- بازگشت به بالا ---------- */
$('top').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
