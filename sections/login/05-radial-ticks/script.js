const N = 64;                 // تعداد خط‌چین‌ها
const TAIL = 110;             // طول دنباله‌ی نور چرخان (درجه)
const SPEED = 110;            // سرعت چرخش (درجه بر ثانیه)
const STEP = 360 / N;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = document.getElementById('stage');
const ring = document.getElementById('ring');
const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const btn = document.getElementById('loginBtn');

/* ---------- ساخت حلقه ---------- */
const ticks = [];
for (let i = 0; i < N; i++) {
    const el = document.createElement('div');
    el.className = 'tick';
    el.style.setProperty('--a', i * STEP + 'deg');
    ring.appendChild(el);
    ticks.push(el);
}
const hov = new Array(N).fill(0);

/* ---------- چسباندن صحنه به اندازه‌ی صفحه ---------- */
function fit() {
    const s = Math.min(1, (Math.min(innerWidth, innerHeight) - 16) / 560);
    stage.style.setProperty('--s', s);
}
addEventListener('resize', fit);
fit();

/* ---------- موقعیت موس نسبت به مرکز (۰ درجه = بالا، ساعتگرد) ---------- */
let ptr = null;
document.addEventListener('pointermove', (e) => {
    const r = ring.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    ptr = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
});
document.addEventListener('pointerleave', () => (ptr = null));

/* ---------- حالت‌ها: sweep | progress | flash ---------- */
let mode = 'sweep';
let head = -40;
let progress = 0, progressStart = 0, progressDur = 1600, onProgressDone = null;

function frame(t) {
    const dt = Math.min(50, t - (frame.last || t)) / 1000;
    frame.last = t;

    if (mode === 'sweep' && !reduced) head = (head + dt * SPEED) % 360;

    if (mode === 'progress') {
        progress = Math.min(1, (t - progressStart) / progressDur);
        if (progress >= 1) { const cb = onProgressDone; onProgressDone = null; cb && cb(); }
    }

    for (let i = 0; i < N; i++) {
        const a = i * STEP;
        let k = 0;

        if (mode === 'sweep') {
            const diff = ((head - a) % 360 + 360) % 360;
            if (diff < TAIL) k = Math.pow(1 - diff / TAIL, 1.6);
        } else if (mode === 'progress') {
            k = i / N <= progress ? 1 : 0;
        } else if (mode === 'flash') {
            k = 1;
        }

        // درخشش نزدیک به موس
        let target = 0;
        if (ptr !== null && mode === 'sweep' && !reduced) {
            const d = Math.abs(((a - ptr + 540) % 360) - 180);
            target = Math.max(0, 1 - d / 22);
        }
        hov[i] += (target - hov[i]) * 0.18;

        ticks[i].style.setProperty('--k', Math.max(k, hov[i] * 0.9).toFixed(3));
        ticks[i].style.setProperty('--sy', (1 + 0.45 * hov[i] + 0.15 * k).toFixed(3));
    }
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function flash(isError, ms, then) {
    mode = 'flash';
    stage.classList.toggle('error', isError);
    setTimeout(() => {
        mode = 'sweep';
        stage.classList.remove('error');
        then && then();
    }, ms);
}

/* ---------- موج روی دکمه ---------- */
btn.addEventListener('pointerdown', (e) => {
    const r = btn.getBoundingClientRect();
    const sc = r.width / btn.offsetWidth || 1;
    const rip = document.createElement('span');
    rip.className = 'ripple';
    rip.style.left = (e.clientX - r.left) / sc + 'px';
    rip.style.top = (e.clientY - r.top) / sc + 'px';
    btn.appendChild(rip);
    rip.addEventListener('animationend', () => rip.remove());
});

/* ---------- نمایش رمز ---------- */
document.getElementById('eye').addEventListener('click', (e) => {
    const input = form.elements.password;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    e.currentTarget.classList.toggle('shown', show);
});

/* ---------- ارسال فرم ---------- */
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (mode !== 'sweep') return;

    const { email, password } = form.elements;
    msg.className = 'msg';
    email.classList.remove('invalid');
    password.classList.remove('invalid');

    const fail = (field, text) => {
        field.classList.add('invalid');
        msg.textContent = text;
        flash(true, 600);
    };
    if (!email.validity.valid) return fail(email, 'ایمیل معتبر نیست.');
    if (password.value.length < 6) return fail(password, 'رمز عبور حداقل ۶ کاراکتر باشد.');

    msg.textContent = '';
    btn.disabled = true;

    // حلقه مثل نوار پیشرفت پر می‌شود. به‌جای این زمان‌بندی، درخواست واقعی
    // به بک‌اند (fetch به /api/login) بزن و بعد از پاسخ progress را کامل کن.
    mode = 'progress';
    progress = 0;
    progressStart = performance.now();
    onProgressDone = () => {
        msg.classList.add('ok');
        msg.textContent = 'ورود موفق ✓';
        btn.disabled = false;
        flash(false, 900);
    };
});