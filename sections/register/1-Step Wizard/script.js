const f = document.getElementById('f');
const card = document.getElementById('card');
const panes = [...document.querySelectorAll('.pane')];
const steps = [...document.querySelectorAll('.s')];
const fill = document.getElementById('fill');
const back = document.getElementById('back');
const next = document.getElementById('next');
const msg = document.getElementById('msg');
const meter = document.getElementById('meter');
let cur = 0;

function show(n, dir = 1) {
    cur = n;
    panes.forEach((p, i) => {
        p.hidden = i !== n;
        if (i === n) { p.style.animationName = 'none'; void p.offsetWidth; p.style.animationName = dir > 0 ? 'inR' : 'inL'; }
    });
    steps.forEach((s, i) => { s.classList.toggle('on', i === n); s.classList.toggle('ok', i < n); });
    fill.style.width = (n / (steps.length - 1)) * 100 + '%';
    back.hidden = n === 0;
    next.textContent = n === steps.length - 1 ? 'ساخت حساب ✓' : 'بعدی ←';
    msg.textContent = '';
}

/* ---------- قدرت رمز عبور ---------- */
const RULES = {
    len: (v) => v.length >= 8,
    num: (v) => /\d/.test(v),
    case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v),
    sym: (v) => /[^A-Za-z0-9]/.test(v),
};
f.elements.password.addEventListener('input', (e) => {
    const v = e.target.value;
    let s = 0;
    for (const [k, fn] of Object.entries(RULES)) {
        const ok = fn(v);
        if (ok) s++;
        document.querySelector(`[data-r="${k}"]`).classList.toggle('ok', ok);
    }
    meter.dataset.s = v ? Math.max(1, s) : 0;
    document.getElementById('mlabel').textContent = v ? ['ضعیف', 'ضعیف', 'متوسط', 'خوب', 'عالی'][s] : '';
});
document.getElementById('eye').addEventListener('click', (e) => {
    const p = f.elements.password;
    p.type = p.type === 'password' ? 'text' : 'password';
    e.currentTarget.textContent = p.type === 'password' ? '👁' : '🙈';
});

/* ---------- اعتبارسنجی هر مرحله ---------- */
function validate(n) {
    const el = f.elements;
    if (n === 0) {
        if (el.name.value.trim().length < 2) return [el.name, 'نام را وارد کنید.'];
        if (!el.email.value || !el.email.validity.valid) return [el.email, 'ایمیل معتبر نیست.'];
    }
    if (n === 1) {
        const v = el.password.value;
        if (!(RULES.len(v) && RULES.num(v) && RULES.case(v))) return [el.password, 'رمز باید ۸ کاراکتر، عدد و حروف بزرگ و کوچک داشته باشد.'];
        if (el.pass2.value !== v) return [el.pass2, 'تکرار رمز یکسان نیست.'];
    }
    if (n === 2) {
        if (!f.querySelector('.chip input:checked')) return [null, 'حداقل یک علاقه‌مندی انتخاب کنید.'];
        if (!el.terms.checked) return [null, 'پذیرش قوانین الزامی است.'];
    }
    return null;
}
f.addEventListener('input', (e) => e.target.classList.remove('invalid'));

f.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = validate(cur);
    if (err) {
        err[0]?.classList.add('invalid');
        err[0]?.focus();
        msg.textContent = err[1];
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        return;
    }
    if (cur < panes.length - 1) show(cur + 1, 1);
    else finish();
});
back.addEventListener('click', () => show(cur - 1, -1));

function finish() {
    // اینجا اطلاعات را با fetch به بک‌اند خودت بفرست
    f.hidden = true;
    document.getElementById('steps').hidden = true;
    document.getElementById('done').hidden = false;
    document.getElementById('hello').textContent = `خوش آمدی ${f.elements.name.value.trim().split(' ')[0]}!`;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const E = ['🎉', '✨', '🎊', '⭐', '💫'];
    for (let i = 0; i < 30; i++) {
        const s = document.createElement('span');
        s.className = 'fall';
        s.textContent = E[i % E.length];
        s.style.left = Math.random() * 100 + 'vw';
        s.style.animationDuration = 2 + Math.random() * 2 + 's';
        s.style.animationDelay = Math.random() * 0.6 + 's';
        document.body.appendChild(s);
        s.addEventListener('animationend', () => s.remove());
    }
}
show(0);