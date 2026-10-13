const body = document.body;
const power = document.getElementById('power');
const msg = document.getElementById('msg');
const tubes = [...document.querySelectorAll('.tube')];
const dots = [...document.querySelectorAll('.dot')];
const sign = document.querySelector('.sign');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* رنگ نئون (در مرورگر ذخیره می‌شود) */
function setColor(c) {
    document.documentElement.style.setProperty('--neon', c);
    dots.forEach((d) => d.setAttribute('aria-checked', String(d.dataset.c === c)));
    try { localStorage.setItem('neon', c); } catch (_) {}
}
dots.forEach((d) => d.addEventListener('click', () => setColor(d.dataset.c)));
let saved = null;
try { saved = localStorage.getItem('neon'); } catch (_) {}
setColor(saved || '#ff2bd6');

/* کلید برق: خاموش / روشن (با سوسوی روشن شدن) */
power.addEventListener('click', () => {
    const on = power.getAttribute('aria-checked') !== 'true';
    power.setAttribute('aria-checked', String(on));
    body.classList.toggle('off', !on);
    msg.textContent = on ? 'تابلو روشنه. کلید بالا رو بزن!' : 'تابلو خاموشه؛ موس رو روی دکمه‌ها ببر تا روشن بشن.';
    if (on && !reduced) [sign, ...tubes].forEach((el, i) => {
        el.classList.remove('flk');
        setTimeout(() => el.classList.add('flk'), i * 90);
    });
});

/* انتخاب بخش */
tubes.forEach((t) => t.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.tube.on')?.classList.remove('on');
    t.classList.add('on');
}));

/* سوسوی تصادفی یکی از لوله‌ها */
if (!reduced) {
    (function flicker() {
        if (!body.classList.contains('off')) {
            const el = tubes[Math.floor(Math.random() * tubes.length)];
            el.classList.remove('flk'); void el.offsetWidth; el.classList.add('flk');
        }
        setTimeout(flicker, 3000 + Math.random() * 4000);
    })();
}