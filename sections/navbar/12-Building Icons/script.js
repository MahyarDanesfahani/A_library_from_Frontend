const nav = document.getElementById('nav');
const pill = document.getElementById('pill');
const links = [...pill.querySelectorAll(':scope > a')];
const a = document.getElementById('a');
const b = document.getElementById('b');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- قطره‌ی چسبنده دنبال لینک می‌رود ---------- */
function move(el) {
    [a, b].forEach((bl) => {
        bl.style.left = el.offsetLeft + 'px';
        bl.style.width = el.offsetWidth + 'px';
    });
}
const active = () => pill.querySelector('a.on');

links.forEach((l) => {
    l.addEventListener('mouseenter', () => move(l));
    l.addEventListener('focus', () => move(l));
    l.addEventListener('click', (e) => {
        e.preventDefault();
        active().classList.remove('on');
        l.classList.add('on');
        move(l);
    });
});
pill.addEventListener('mouseleave', () => move(active()));
pill.addEventListener('scroll', () => move(active()));
addEventListener('resize', () => move(active()));
document.fonts?.ready.then(() => move(active()));
move(active());

/* ---------- لینک‌ها کمی به سمت موس کشیده می‌شوند ---------- */
if (!reduced) {
    pill.addEventListener('pointermove', (e) => {
        links.forEach((l) => {
            const r = l.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const k = Math.max(0, 1 - Math.hypot(dx, dy) / 110);
            l.style.transform = `translate(${(dx * 0.18 * k).toFixed(1)}px, ${(dy * 0.25 * k).toFixed(1)}px)`;
        });
    });
    pill.addEventListener('pointerleave', () => links.forEach((l) => (l.style.transform = '')));
}

/* ---------- با اسکرول به پایین قایم می‌شود، با اسکرول به بالا برمی‌گردد ---------- */
let last = scrollY;
addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('hide', y > last && y > 120);
    last = y;
}, { passive: true });