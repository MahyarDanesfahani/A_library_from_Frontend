const cv = document.getElementById('bg');
const ctx = cv.getContext('2d');
const card = document.getElementById('card');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let W, H, pts = [];
const mouse = { x: -999, y: -999 };

function resize() {
    const dpr = devicePixelRatio || 1;
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.floor((W * H) / 14000));
    pts = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: reduced ? 0 : (Math.random() - .5) * .5,
        vy: reduced ? 0 : (Math.random() - .5) * .5,
    }));
}
addEventListener('resize', resize);
resize();

/* ---------- شبکه‌ی ستاره‌ها ---------- */
function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        ctx.fillStyle = 'rgba(190, 200, 255, .85)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();

        for (let j = i + 1; j < pts.length; j++) {
            const q = pts[j];
            const d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < 120) {
                ctx.strokeStyle = `rgba(124, 108, 255, ${(1 - d / 120) * .5})`;
                ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
        }
        // خطوط روشن‌تر بین ستاره‌ها و موس
        const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (dm < 170) {
            ctx.strokeStyle = `rgba(53, 212, 255, ${(1 - dm / 170) * .8})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
    }
    requestAnimationFrame(draw);
}
draw();

/* ---------- کج شدن کارت و بازتاب نور ---------- */
addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (reduced) return;
    const nx = e.clientX / W - .5, ny = e.clientY / H - .5;
    card.style.transform = `perspective(900px) rotateY(${nx * 10}deg) rotateX(${-ny * 10}deg)`;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', e.clientX - r.left + 'px');
    card.style.setProperty('--my', e.clientY - r.top + 'px');
});
addEventListener('pointerleave', () => {
    mouse.x = mouse.y = -999;
    card.style.transform = '';
});

/* ---------- فرم ---------- */
const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const btn = form.querySelector('button');

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
    btn.disabled = true;
    btn.classList.add('loading');

    // به‌جای setTimeout، درخواست واقعی به بک‌اند خودت رو بزن (fetch به /api/login)
    setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('loading');
        msg.classList.add('ok');
        msg.textContent = 'ورود موفق ✓';
    }, 1500);
});