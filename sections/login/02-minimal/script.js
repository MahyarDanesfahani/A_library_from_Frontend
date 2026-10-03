const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const pass = document.getElementById('password');
const eye = document.getElementById('togglePass');

// تم: ذخیره در مرورگر، یا پیروی از تنظیم سیستم
function applyTheme(theme) {
    root.dataset.theme = theme;
    toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}
let saved = null;
try { saved = localStorage.getItem('theme'); } catch (_) {}
applyTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (_) {}
});

// نمایش/مخفی کردن رمز
eye.addEventListener('click', () => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    eye.textContent = show ? '🙈' : '👁';
});

// اعتبارسنجی
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { email } = form.elements;
    email.classList.remove('invalid');
    pass.classList.remove('invalid');
    msg.style.color = '';

    if (!email.validity.valid) {
        email.classList.add('invalid');
        return (msg.textContent = 'ایمیل معتبر نیست.');
    }
    if (pass.value.length < 6) {
        pass.classList.add('invalid');
        return (msg.textContent = 'رمز عبور حداقل ۶ کاراکتر باشد.');
    }
    msg.textContent = 'در حال ورود...';
    msg.style.color = 'var(--muted)';
    // اینجا درخواست به بک‌اند خودت رو بزن (fetch به /api/login)
});