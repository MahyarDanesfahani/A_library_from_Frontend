const svg = document.getElementById('lampSvg');
const line = document.getElementById('cordLine');
const bead = document.getElementById('bead');
const hit = document.getElementById('hit');
const hint = document.getElementById('hint');
const flies = document.getElementById('flies');

const REST_Y = 190;      // محل استراحت انتهای نخ
const MAX_PULL = 80;     // بیشینه‌ی کشیدن (واحد SVG)
const TRIGGER = 38;      // از این مقدار به بعد چراغ تغییر می‌کند

let pull = 0, vel = 0, startY = 0, startPull = 0, moved = 0;
let dragging = false, raf = null, isOn = false;

/* ---------- کرم‌های شب‌تاب ---------- */
for (let i = 0; i < 16; i++) {
    const f = document.createElement('span');
    f.className = 'fly';
    f.style.left = Math.random() * 100 + '%';
    f.style.top = 25 + Math.random() * 65 + '%';
    f.style.setProperty('--x', (Math.random() * 60 - 30) + 'px');
    f.style.setProperty('--y', (Math.random() * 60 - 30) + 'px');
    f.style.setProperty('--d', (3 + Math.random() * 4) + 's');
    f.style.setProperty('--delay', (-Math.random() * 5) + 's');
    flies.appendChild(f);
}

/* ---------- رسم نخ ---------- */
function render() {
    line.setAttribute('y2', REST_Y + pull);
    bead.setAttribute('cy', REST_Y + 8 + pull);
    hit.setAttribute('cy', REST_Y + 8 + pull);
}

/* برگشت فنری نخ بعد از رها کردن */
function spring() {
    cancelAnimationFrame(raf);
    const step = () => {
        vel += -0.2 * pull - 0.13 * vel;
        pull += vel;
        render();
        if (Math.abs(pull) < 0.1 && Math.abs(vel) < 0.1) {
            pull = 0; vel = 0; render();
            return;
        }
        raf = requestAnimationFrame(step);
    };
    step();
}

/* ---------- روشن / خاموش ---------- */
function setOn(value) {
    isOn = value;
    document.body.classList.toggle('on', isOn);
    hit.setAttribute('aria-pressed', String(isOn));
    hint.textContent = isOn ? '' : 'نخ چراغ را بکشید پایین';
    if (isOn) document.querySelector('#card input')?.focus({ preventScroll: true });
}

function toggle() {
    setOn(!isOn);
    pull = Math.max(pull, 30); // یک تکان کوچک برای حس واقعی‌تر
    spring();
}

/* ---------- کشیدن با موس / لمس ---------- */
hit.addEventListener('pointerdown', (e) => {
    dragging = true;
    moved = 0;
    startY = e.clientY;
    startPull = pull;
    cancelAnimationFrame(raf);
    hit.setPointerCapture(e.pointerId);
});

hit.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const scale = svg.getScreenCTM().a || 1; // تبدیل پیکسل به واحد SVG
    const dy = (e.clientY - startY) / scale;
    moved = Math.max(moved, Math.abs(dy));
    pull = Math.min(MAX_PULL, Math.max(-4, startPull + dy));
    render();
});

function release() {
    if (!dragging) return;
    dragging = false;
    if (pull >= TRIGGER || moved < 4) { // کشیدن کافی یا یک کلیک ساده
        setOn(!isOn);
        if (moved < 4) pull = 30;
    }
    vel = 0;
    spring();
}
hit.addEventListener('pointerup', release);
hit.addEventListener('pointercancel', release);

/* دسترس‌پذیری: Enter یا Space */
hit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
    }
});

/* ---------- فرم ---------- */
const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const submitBtn = form.querySelector('.submit');

form.querySelector('.eye').addEventListener('click', (e) => {
    const input = form.elements.password;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    e.currentTarget.textContent = show ? '🙈' : '👁';
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const { email, password } = form.elements;
    msg.className = 'msg';
    email.classList.remove('invalid');
    password.classList.remove('invalid');

    if (!email.validity.valid) {
        email.classList.add('invalid');
        return (msg.textContent = 'ایمیل معتبر نیست.');
    }
    if (password.value.length < 6) {
        password.classList.add('invalid');
        return (msg.textContent = 'رمز عبور حداقل ۶ کاراکتر باشد.');
    }

    msg.textContent = '';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    // به‌جای setTimeout، درخواست واقعی به بک‌اند خودت رو بزن (fetch به /api/login)
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        msg.classList.add('ok');
        msg.textContent = 'ورود موفق ✓';
    }, 1500);
});

render();