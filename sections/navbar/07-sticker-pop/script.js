const fa = (n) => n.toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// چسبیدن استیکر + پرتاب ایموجی از مرکزش
function pop(el) {
    el.classList.remove('stuck'); void el.offsetWidth; el.classList.add('stuck');
    if (reduced) return;
    const r = el.getBoundingClientRect();
    ['✨', '⭐', '💥', '🎈', '🌟', '💫'].forEach((t, i) => {
        const p = document.createElement('span');
        const a = (i / 6) * Math.PI * 2;
        p.className = 'pf';
        p.textContent = t;
        p.style.left = r.left + r.width / 2 + 'px';
        p.style.top = r.top + r.height / 2 + 'px';
        p.style.setProperty('--dx', Math.cos(a) * 60 + 'px');
        p.style.setProperty('--dy', Math.sin(a) * 60 + 'px');
        document.body.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
    });
}

document.querySelectorAll('.stickers .st').forEach((s) =>
    s.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.stickers .on')?.classList.remove('on');
        s.classList.add('on');
        pop(s);
    })
);

const cart = document.getElementById('cart');
let n = 0;
document.getElementById('add').addEventListener('click', () => {
    document.getElementById('n').textContent = fa(++n);
    pop(cart);
});