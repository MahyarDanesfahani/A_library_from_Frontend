const f = document.getElementById('f');
const card = document.getElementById('card');
const track = document.getElementById('track');
const handle = document.getElementById('handle');
const fill = document.getElementById('fill');
const label = document.getElementById('label');
const msg = document.getElementById('msg');

let x = 0, startX = 0, drag = false, done = false;
const maxX = () => track.clientWidth - handle.offsetWidth - 12;

function set(v) {
    x = Math.max(0, Math.min(maxX(), v));
    handle.style.transform = `translateX(${x}px)`;
    fill.style.width = x + handle.offsetWidth / 2 + 'px';
    label.style.opacity = 1 - x / maxX();
}
function animate(fn) {
    handle.classList.add('snap'); fill.classList.add('snap');
    fn();
    setTimeout(() => { handle.classList.remove('snap'); fill.classList.remove('snap'); }, 400);
}

function attempt() {
    const { email, password } = f.elements;
    msg.className = 'msg';
    email.classList.remove('invalid');
    password.classList.remove('invalid');

    let err = null;
    if (!email.validity.valid) { email.classList.add('invalid'); err = 'ایمیل معتبر نیست.'; }
    else if (password.value.length < 6) { password.classList.add('invalid'); err = 'رمز عبور حداقل ۶ کاراکتر باشد.'; }

    if (err) {
        msg.textContent = err;
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
        return animate(() => set(0));
    }
    done = true;
    animate(() => set(maxX()));
    track.classList.add('done');
    label.style.opacity = 1; label.textContent = 'در حال ورود...';
    // به‌جای setTimeout، درخواست واقعی به بک‌اند خودت رو بزن (fetch به /api/login)
    setTimeout(() => { label.textContent = 'خوش آمدید ✓'; msg.classList.add('ok'); msg.textContent = 'ورود موفق'; }, 1200);
}

handle.addEventListener('pointerdown', (e) => {
    if (done) return;
    drag = true; startX = e.clientX - x;
    handle.setPointerCapture(e.pointerId);
});
handle.addEventListener('pointermove', (e) => { if (drag) set(e.clientX - startX); });
function release() {
    if (!drag) return;
    drag = false;
    x >= maxX() * 0.92 ? attempt() : animate(() => set(0));
}
handle.addEventListener('pointerup', release);
handle.addEventListener('pointercancel', release);

// کیبورد: Enter یا Space کل مسیر را می‌رود
handle.addEventListener('keydown', (e) => {
    if (done) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(maxX()); attempt(); }
});
addEventListener('resize', () => !done && set(0));
f.addEventListener('submit', (e) => e.preventDefault());
set(0);