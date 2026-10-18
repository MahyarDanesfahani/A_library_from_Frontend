const f = document.getElementById('f');
const faces = [...f.querySelectorAll('.face')];
const dots = [...document.querySelectorAll('#dots i')];
const el = f.elements;
const norm = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
let cur = 0;

// چرخش مکعب به وجه n؛ وجه‌های پنهان inert می‌شوند تا با Tab به آن‌ها نرویم
function go(n) {
    cur = n;
    f.style.setProperty('--n', n);
    faces.forEach((fc, i) => (fc.inert = i !== n));
    dots.forEach((d, i) => d.classList.toggle('on', i === Math.min(n, 2)));
    setTimeout(() => faces[n].querySelector('input, select, button')?.focus({ preventScroll: true }), 700);
}

function validate(n) {
    if (n === 0) {
        if (el.name.value.trim().length < 2) return [el.name, 'نام را وارد کنید.'];
        if (!el.email.value || !el.email.validity.valid) return [el.email, 'ایمیل معتبر نیست.'];
    }
    if (n === 1) {
        if (!/^09\d{9}$/.test(norm(el.phone.value.trim()))) return [el.phone, 'شماره موبایل معتبر نیست.'];
        if (!el.city.value) return [el.city, 'شهر را انتخاب کنید.'];
    }
    if (n === 2) {
        const v = el.password.value;
        if (v.length < 8 || !/\d/.test(v)) return [el.password, 'رمز باید حداقل ۸ کاراکتر و شامل عدد باشد.'];
        if (el.pass2.value !== v) return [el.pass2, 'تکرار رمز یکسان نیست.'];
        if (!el.terms.checked) return [null, 'پذیرش قوانین الزامی است.'];
    }
    return null;
}
function tryNext(n) {
    const msg = faces[cur].querySelector('.msg');
    const err = validate(cur);
    msg.textContent = err ? err[1] : '';
    if (err) { err[0]?.classList.add('invalid'); err[0]?.focus(); return false; }
    return true;
}

f.addEventListener('input', (e) => e.target.classList.remove('invalid'));
f.querySelectorAll('[data-go]').forEach((b) =>
    b.addEventListener('click', () => {
        const to = +b.dataset.go;
        if (to > cur && !tryNext()) return;
        go(to);
    })
);
f.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && cur < 2 && e.target.tagName !== 'BUTTON') { e.preventDefault(); faces[cur].querySelector('.nx').click(); }
});

el.password.addEventListener('input', () => {
    const v = el.password.value;
    const s = [v.length >= 8, /\d/.test(v), /[a-z]/.test(v) && /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
    document.getElementById('meter').dataset.s = v ? Math.max(1, s) : 0;
});

f.addEventListener('submit', (e) => {
    e.preventDefault();
    if (cur !== 2 || !tryNext()) return;
    // اینجا اطلاعات را با fetch به بک‌اند خودت بفرست
    document.getElementById('hello').textContent = `خوش آمدی ${el.name.value.trim().split(' ')[0]}!`;
    document.getElementById('sum').textContent = `ایمیل: ${el.email.value}\nشهر: ${el.city.value}`;
    go(3);
});
document.getElementById('again').addEventListener('click', () => { f.reset(); document.getElementById('meter').dataset.s = 0; go(0); });
go(0);