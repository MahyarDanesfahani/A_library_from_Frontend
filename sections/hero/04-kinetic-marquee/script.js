const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const rowsBox = document.getElementById('rows');

/* ---------- تیتر: کلمه‌ها یکی‌یکی وارد می‌شوند (متن اصلی دست‌نخورده می‌ماند) ---------- */
function splitWords(node, state) {
    [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((p) => {
                if (!p.trim()) { frag.appendChild(document.createTextNode(p)); return; }
                const s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', state.i++); s.textContent = p; frag.appendChild(s);
            });
            n.replaceWith(frag);
        } else if (n.nodeType === 1) { n.classList.add('w'); n.style.setProperty('--i', state.i++); }
    });
}
splitWords(document.getElementById('h1'), { i: 0 });

/* ---------- ردیف‌های متحرک ---------- */
const ROWS = [
    { dir: 1, speed: 60, items: ['طراحی سایت', '✦', 'اپلیکیشن وب', '✦', 'فروشگاه آنلاین', '✦'] },
    { dir: -1, speed: 85, items: ['UI/UX', '✦', 'React', '✦', 'Java', '✦', 'API', '✦'], fill: true },
    { dir: 1, speed: 50, items: ['ربات تلگرام', '✦', 'پنل مدیریت', '✦', 'پشتیبانی', '✦'] },
];
const rows = ROWS.map((r) => {
    const row = document.createElement('div'); row.className = 'row';
    const track = document.createElement('div'); track.className = 'track';
    const mkSet = () => {
        const s = document.createElement('div'); s.className = 'set';
        r.items.forEach((t) => { const e = document.createElement(t === '✦' ? 'i' : 'span'); e.textContent = t; if (r.fill && t !== '✦') e.className = 'fill'; s.appendChild(e); });
        return s;
    };
    track.appendChild(mkSet()); row.appendChild(track); rowsBox.appendChild(row);
    return { ...r, track, mkSet, x: 0, w: 0 };
});
function measure() {
    rows.forEach((r) => {
        while (r.track.children.length > 1) r.track.lastChild.remove();
        r.w = r.track.firstChild.offsetWidth || 1;
        const need = Math.ceil((innerWidth * 2) / r.w) + 1;   // تا ردیف هیچ‌وقت خالی نماند
        for (let i = 1; i < need; i++) r.track.appendChild(r.mkSet());
    });
}
measure();
addEventListener('resize', measure);
document.fonts?.ready.then(measure);

/* ---------- سرعت: اسکرول، چرخ موس و حرکت موس سرعت را موقتاً زیاد می‌کنند ---------- */
let boost = 0, lastX = null, lastT = 0;
function kick(v) { boost = Math.max(-6, Math.min(6, boost + v)); }
addEventListener('wheel', (e) => kick(e.deltaY * 0.012), { passive: true });
addEventListener('pointermove', (e) => {
    const now = performance.now();
    if (lastX !== null && now - lastT < 80) kick(Math.min(1.2, Math.abs(e.clientX - lastX) / 60));
    lastX = e.clientX; lastT = now;
});
let ty = 0;
addEventListener('touchmove', (e) => { const y = e.touches[0].clientY; kick(Math.abs(y - ty) * 0.04); ty = y; }, { passive: true });
addEventListener('touchstart', (e) => (ty = e.touches[0].clientY), { passive: true });

let last = performance.now();
function frame(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!document.hidden) {
        boost *= Math.pow(0.04, dt);   // کم‌کم به سرعت عادی برمی‌گردد
        rows.forEach((r) => {
            r.x = (r.x + r.dir * r.speed * (1 + Math.abs(boost)) * dt * (boost < 0 ? -1 : 1) + r.w) % r.w;
            r.track.style.transform = `translate3d(${-r.x - r.w}px, 0, 0)`;
        });
        document.getElementById('spd').style.width = Math.min(100, Math.abs(boost) * 17) + '%';
    }
    requestAnimationFrame(frame);
}
if (!reduced) requestAnimationFrame(frame);