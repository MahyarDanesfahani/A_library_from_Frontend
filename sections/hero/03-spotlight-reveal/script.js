const hero = document.getElementById('hero');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover)').matches;

let w = innerWidth, h = innerHeight;
let x = w / 2, y = h / 2, tx = x, ty = y, r = 200, tr = 200, lastMove = 0;
addEventListener('resize', () => { w = innerWidth; h = innerHeight; });

// موس (یا انگشت) هدف نور افکن را مشخص می‌کند
hero.addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; lastMove = performance.now(); });
// کلیک: نور افکن لحظه‌ای بزرگ می‌شود
hero.addEventListener('pointerdown', (e) => {
    tx = e.clientX; ty = e.clientY; lastMove = performance.now(); tr = 380;
    setTimeout(() => (tr = 200), 450);
});

function frame(t) {
    // وقتی موس حرکت نمی‌کند (یا دستگاه لمسی است) نور افکن خودش در صفحه می‌گردد
    if (!reduced && (!canHover || t - lastMove > 2500)) {
        tx = w * (0.5 + 0.36 * Math.sin(t / 1900));
        ty = h * (0.5 + 0.3 * Math.sin(t / 1350 + 1));
    }
    const k = reduced ? 1 : 0.1;
    x += (tx - x) * k; y += (ty - y) * k; r += (tr - r) * 0.12;
    hero.style.setProperty('--x', x.toFixed(1) + 'px');
    hero.style.setProperty('--y', y.toFixed(1) + 'px');
    hero.style.setProperty('--r', r.toFixed(1) + 'px');
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);