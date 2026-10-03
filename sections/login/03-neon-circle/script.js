const flipper = document.getElementById('flipper');

// فلیپ بین ورود و ثبت‌نام
document.querySelectorAll('[data-flip]').forEach((link) =>
    link.addEventListener('click', (e) => {
        e.preventDefault();
        flipper.classList.toggle('flipped');
    })
);

// نمایش / مخفی کردن رمز
document.querySelectorAll('.eye').forEach((btn) =>
    btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? '🙈' : '👁';
    })
);

// اعتبارسنجی + حالت loading
function handleForm(form, doneText) {
    const msg = form.querySelector('.msg');
    const btn = form.querySelector('.btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        msg.className = 'msg';
        form.querySelectorAll('input').forEach((i) => i.classList.remove('invalid'));

        const { name, email, password } = form.elements;
        const fail = (field, text) => {
            field.classList.add('invalid');
            msg.textContent = text;
        };

        if (name && name.value.trim().length < 2) return fail(name, 'نام را وارد کنید.');
        if (!email.validity.valid) return fail(email, 'ایمیل معتبر نیست.');
        if (password.value.length < 6) return fail(password, 'رمز عبور حداقل ۶ کاراکتر باشد.');

        msg.textContent = '';
        btn.disabled = true;
        btn.classList.add('loading');

        // اینجا به‌جای setTimeout، درخواست واقعی به بک‌اند خودت رو بزن (fetch)
        setTimeout(() => {
            btn.disabled = false;
            btn.classList.remove('loading');
            msg.classList.add('ok');
            msg.textContent = doneText;
        }, 1500);
    });
}

handleForm(document.getElementById('loginForm'), 'ورود موفق ✓');
handleForm(document.getElementById('signupForm'), 'حساب ساخته شد ✓');