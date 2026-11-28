const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WORDS = ['سایت', 'فروشگاه', 'اپلیکیشن', 'ربات'];

let W = 0, H = 0, dpr = 1, parts = [], wi = 0, gap = 4, mouse = { x: -999, y: -999 }, running = false, visible = true;
let grad;

/* ---------- نقطه‌های هر کلمه: متن روی یک بوم مخفی کشیده و نمونه‌برداری می‌شود ---------- */
function wordPoints(word) {
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d');
    let fs = H * 0.9;
    const font = (s) => `900 ${s}px Vazirmatn, Tahoma, sans-serif`;
    o.font = font(fs);
    while (o.measureText(word).width > W * 0.88 && fs > 20) { fs -= 4; o.font = font(fs); }
    o.textAlign = 'center'; o.textBaseline = 'middle'; o.fillStyle = '#fff';
    o.fillText(word, W / 2, H / 2 + fs * 0.04);
    const d = o.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += gap) for (let x = 0; x < W; x += gap) if (d[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
    return pts;
}

function setTargets(word) {
    const pts = wordPoints(word);
    // ذره‌های اضافه به‌صورت گردوغبار دور کلمه می‌چرخند
    parts.forEach((p, i) => {
        if (i < pts.length) { p.tx = pts[i][0]; p.ty = pts[i][1]; p.dust = false; }
        else { p.tx = Math.random() * W; p.ty = Math.random() * H; p.dust = true; }
    });
}

function build() {
    dpr = Math.min(2, devicePixelRatio || 1);
    const r = cv.getBoundingClientRect();
    W = Math.round(r.width); H = Math.round(r.height);
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = W < 600 ? 5 : 4;
    grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, '#6c8bff'); grad.addColorStop(0.5, '#19d3c5'); grad.addColorStop(1, '#ff5ca8');
    // تعداد ذره‌ها برابر بیشترین تعداد نقطه‌ی کلمه‌هاست
    const n = Math.min(3200, Math.max(...WORDS.map((w) => wordPoints(w).length)) + 80);
    parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, tx: 0, ty: 0, dust: false }));
    setTargets(WORDS[wi]);
    if (reduced) drawStatic();
}

function drawStatic() {   // برای «کاهش حرکت»: فقط کلمه‌ی ثابت، بدون ذره‌ی متحرک
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = grad;
    parts.forEach((p) => { if (!p.dust) ctx.fillRect(p.tx, p.ty, gap - 1.2, gap - 1.2); });
}

function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = grad;
    const R = 80, R2 = R * R;
    for (const p of parts) {
        // فنر به سمت هدف + دور شدن از موس
        p.vx += (p.tx - p.x) * 0.07; p.vy += (p.ty - p.y) * 0.07;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R2 && d2 > 0.1) { const d = Math.sqrt(d2), f = (1 - d / R) * 7; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
        p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx; p.y += p.vy;
        if (p.dust) { ctx.globalAlpha = 0.35; ctx.fillRect(p.x, p.y, 1.6, 1.6); ctx.globalAlpha = 1; }
        else ctx.fillRect(p.x, p.y, gap - 1.2, gap - 1.2);
    }
    requestAnimationFrame(frame);
}
function start() { if (reduced || running || !visible || document.hidden) return; running = true; requestAnimationFrame(frame); }
function stop() { running = false; }

/* ---------- موس و لمس ---------- */
cv.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
cv.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });

new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(cv);
document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); }, 200); });

/* ---------- عوض شدن کلمه‌ها هر ۴ ثانیه ---------- */
setInterval(() => { if (reduced || document.hidden || !visible) return; wi = (wi + 1) % WORDS.length; setTargets(WORDS[wi]); }, 4000);

(document.fonts?.ready || Promise.resolve()).then(() => { build(); start(); });