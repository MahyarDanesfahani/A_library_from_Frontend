const f = document.getElementById('f');
const msg = document.getElementById('msg');
const $ = (id) => document.getElementById(id);
const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
const norm = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const pad = (n) => String(n).padStart(2, '0');
const DEMO_OTP = '123456';

/* ---------- کد ملی: الگوریتم رسمی صحت‌سنجی ---------- */
function validNID(c) {
    if (!/^\d{10}$/.test(c) || /^(\d)\1{9}$/.test(c)) return false;
    let s = 0;
    for (let i = 0; i < 9; i++) s += +c[i] * (10 - i);
    const r = s % 11, k = +c[9];
    return r < 2 ? k === r : k === 11 - r;
}

function setStep(n) {
    [0, 1, 2].forEach((i) => ($('s' + i).hidden = i !== n));
    document.querySelectorAll('.side li').forEach((li, i) => {
        li.classList.toggle('cur', i === n);
        li.classList.toggle('ok', i < n);
    });
    msg.textContent = '';
}
const err = (field, text) => { field?.classList.add('invalid'); field?.focus(); msg.textContent = text; };
f.addEventListener('input', (e) => e.target.classList.remove('invalid'));

/* ---------- گام ۱: هویت ---------- */
$('send').addEventListener('click', () => {
    const nid = norm(f.elements.nid.value.trim());
    const phone = norm(f.elements.phone.value.trim());
    if (!validNID(nid)) return err(f.elements.nid, 'کد ملی معتبر نیست.');
    if (!/^09\d{9}$/.test(phone)) return err(f.elements.phone, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.');
    // اینجا درخواست ارسال پیامک را به بک‌اند بفرست
    $('shown').textContent = phone.slice(0, 4) + '•••' + phone.slice(-4);
    setStep(1);
    startTimer();
    otpBoxes[0].focus();
});

/* ---------- گام ۲: کد یک‌بارمصرف ---------- */
const otp = $('otp');
const otpBoxes = [...otp.querySelectorAll('input')];
let timer, left, tries = 0;

otpBoxes.forEach((b, i) => {
    b.addEventListener('input', () => {
        b.value = norm(b.value).replace(/\D/g, '').slice(-1);
        otp.classList.remove('bad');
        if (b.value && otpBoxes[i + 1]) otpBoxes[i + 1].focus();
    });
    b.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !b.value && otpBoxes[i - 1]) otpBoxes[i - 1].focus();
        if (e.key === 'Enter') { e.preventDefault(); $('verify').click(); }
    });
    b.addEventListener('paste', (e) => {
        e.preventDefault();
        const d = norm(e.clipboardData.getData('text')).replace(/\D/g, '').slice(0, 6);
        [...d].forEach((ch, k) => (otpBoxes[k].value = ch));
        otpBoxes[Math.min(d.length, 5)].focus();
    });
});

function startTimer() {
    clearInterval(timer);
    left = 90;
    $('resend').disabled = true;
    const tick = () => {
        $('tm').textContent = fa(`${pad(Math.floor(left / 60))}:${pad(left % 60)}`);
        if (left-- <= 0) { clearInterval(timer); $('resend').disabled = false; }
    };
    tick();
    timer = setInterval(tick, 1000);
}
$('resend').addEventListener('click', () => { otpBoxes.forEach((b) => (b.value = '')); otpBoxes[0].focus(); startTimer(); });

$('verify').addEventListener('click', () => {
    if (tries >= 3) return err(null, 'تعداد تلاش‌ها بیش از حد مجاز است. لطفاً بعداً دوباره امتحان کنید.');
    const code = otpBoxes.map((b) => b.value).join('');
    if (code.length < 6) return err(otpBoxes[code.length], 'کد ۶ رقمی را کامل وارد کنید.');
    if (code !== DEMO_OTP) { // اینجا کد را در بک‌اند بررسی کن
        tries++;
        otp.classList.remove('bad'); void otp.offsetWidth; otp.classList.add('bad');
        return err(null, `کد اشتباه است. ${fa(3 - tries)} تلاش باقی مانده.`);
    }
    clearInterval(timer);
    setStep(2);
    f.elements.password.focus();
});

/* ---------- گام ۳: رمز و نوع حساب ---------- */
f.elements.password.addEventListener('input', (e) => {
    const v = e.target.value;
    const s = [v.length >= 8, /\d/.test(v), /[a-z]/.test(v) && /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
    $('meter').dataset.s = v ? Math.max(1, s) : 0;
});
$('eye').addEventListener('click', (e) => {
    const p = f.elements.password;
    p.type = p.type === 'password' ? 'text' : 'password';
    e.currentTarget.textContent = p.type === 'password' ? '👁' : '🙈';
});

f.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!$('s2').hidden === false) return;
    const el = f.elements, v = el.password.value;
    if (!(v.length >= 8 && /\d/.test(v) && /[a-z]/.test(v) && /[A-Z]/.test(v))) return err(el.password, 'رمز باید ۸ کاراکتر، عدد و حروف بزرگ و کوچک داشته باشد.');
    if (el.pass2.value !== v) return err(el.pass2, 'تکرار رمز یکسان نیست.');
    if (!el.terms.checked) return err(null, 'پذیرش شرایط و قوانین الزامی است.');

    // اینجا اطلاعات را با fetch (فقط روی HTTPS) به بک‌اند بفرست
    f.hidden = true;
    $('track').textContent = 'NG-' + Math.floor(10000000 + Math.random() * 89999999);
    $('date').textContent = new Date().toLocaleDateString('fa-IR');
    $('atype').textContent = el.type.value;
    $('done').hidden = false;
    document.querySelectorAll('.side li').forEach((li) => { li.classList.remove('cur'); li.classList.add('ok'); });
});

/* ---------- زمان نشست (۱۰ دقیقه) ---------- */
let sess = 600;
const st = setInterval(() => {
    sess--;
    $('sess').textContent = fa(`${pad(Math.floor(sess / 60))}:${pad(sess % 60)}`);
    if (sess <= 0) { clearInterval(st); location.reload(); } // نشست منقضی شد؛ شروع از اول
}, 1000);