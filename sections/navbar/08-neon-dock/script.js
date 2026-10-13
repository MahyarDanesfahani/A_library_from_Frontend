const dock = document.getElementById('dock');
const items = [...dock.querySelectorAll('.it')];
const title = document.getElementById('title');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RANGE = 110, BOOST = 0.75;

// بزرگ شدن آیکون‌ها بر اساس فاصله از موس
function magnify(x) {
    items.forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(x - (r.left + r.width / 2));
        const s = 1 + BOOST * Math.max(0, 1 - d / RANGE);
        el.style.transform = `scale(${s.toFixed(3)})`;
    });
}
function reset() { items.forEach((el) => (el.style.transform = '')); }

if (!reduced) {
    dock.addEventListener('pointermove', (e) => magnify(e.clientX));
    dock.addEventListener('pointerleave', reset);
}

// انتخاب بخش
items.forEach((el) =>
    el.addEventListener('click', (e) => {
        e.preventDefault();
        dock.querySelector('.on')?.classList.remove('on');
        el.classList.add('on');
        title.textContent = el.dataset.label;
        document.body.style.setProperty('--g', getComputedStyle(el).getPropertyValue('--n'));
    })
);