const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { email, password } = form.elements;
    if (!email.validity.valid) return (msg.textContent = 'ایمیل معتبر نیست.');
    if (password.value.length < 6) return (msg.textContent = 'رمز عبور حداقل ۶ کاراکتر باشد.');
    msg.textContent = 'در حال ورود...';
    // اینجا درخواست به بک‌اند خودت رو بزن (fetch به /api/login)
});