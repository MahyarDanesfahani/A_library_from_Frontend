const world = document.getElementById('world');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = document.getElementById('hero');
let tx = -18, ty = 8, x = -18, y = 8, lastMove = 0;

// موس زاویه‌ی هدف را تعیین می‌کند
hero.addEventListener('pointermove', (e) => {
    tx = -18 + (e.clientX / innerWidth - 0.5) * 50;
    ty = 8 - (e.clientY / innerHeight - 0.5) * 24;
    lastMove = performance.now();
});

function frame(t) {
    // وقتی موس حرکت نمی‌کند (یا دستگاه لمسی است) صحنه خودش نرم می‌چرخد
    if (t - lastMove > 2500) { tx = -18 + Math.sin(t / 2200) * 16; ty = 8 + Math.cos(t / 3000) * 5; }
    x += (tx - x) * 0.07; y += (ty - y) * 0.07;
    world.style.transform = `rotateX(${y.toFixed(2)}deg) rotateY(${x.toFixed(2)}deg)`;
    requestAnimationFrame(frame);
}
if (!reduced) requestAnimationFrame(frame);