const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = document.getElementById('hero');
const layers = [...document.querySelectorAll('[data-d]')];
const mag = document.getElementById('mag');
let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

// موس (یا لمس) هدف حرکت را مشخص می‌کند؛ لایه‌ها نرم دنبالش می‌روند
function onMove(e) {
    tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
    if (!raf) raf = requestAnimationFrame(loop);
    // دکمه‌ی مغناطیسی: وقتی موس نزدیک است، کمی به سمتش کشیده می‌شود
    const r = mag.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    mag.classList.add('mv');
    mag.style.transform = d < 140 ? `translate(${dx * 0.28}px, ${dy * 0.35}px)` : '';
}
function loop() {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    layers.forEach((l) => {
        const d = +l.dataset.d;
        l.style.transform = `translate3d(${(-cx * d * 700).toFixed(1)}px, ${(-cy * d * 700).toFixed(1)}px, 0)`;
        if (l.hasAttribute('data-tilt')) l.style.transform +=  /* کارت‌های شیشه‌ای کمی هم کج می‌شوند */ ` rotateX(${(cy * 12).toFixed(1)}deg) rotateY(${(-cx * 16).toFixed(1)}deg)`;
    });
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.0008 ? requestAnimationFrame(loop) : 0;
}
if (!reduced) {
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', () => { tx = ty = 0; mag.style.transform = ''; if (!raf) raf = requestAnimationFrame(loop); });
}