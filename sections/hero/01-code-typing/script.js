const $ = (id) => document.getElementById(id);
const fa = (n) => Number(n).toLocaleString('fa-IR');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- کلمه‌ی چرخان با تایپ و پاک کردن ---------- */
const WORDS = ['سایت شرکتی', 'فروشگاه آنلاین', 'اپلیکیشن وب', 'ربات تلگرام', 'پنل مدیریت'];
async function rotate() {
    const out = $('rot');
    if (reduced) { out.textContent = WORDS[0]; return; }
    for (let i = 0; ; i = (i + 1) % WORDS.length) {
        for (const ch of WORDS[i]) { out.textContent += ch; await sleep(85); }
        await sleep(1500);
        while (out.textContent.length) { out.textContent = out.textContent.slice(0, -1); await sleep(40); }
        await sleep(250);
    }
}
rotate();

/* ---------- تایپ کد و ساخته شدن پیش‌نمایش ---------- */
const CODE = [   // هر خط: توکن‌هایی با کلاس رنگ
    [['const ', 'k'], ['project', 'v'], [' = {', 'p']],
    [['  type', 'n'], [': ', 'p'], ['"فروشگاه آنلاین"', 's'], [',', 'p']],
    [['  stack', 'n'], [': ', 'p'], ['["React", "Java"]', 's'], [',', 'p']],
    [['  design', 'n'], [': ', 'p'], ['"مدرن و ریسپانسیو"', 's'], [',', 'p']],
    [['  status', 'n'], [': ', 'p'], ['"در حال ساخت..."', 's']],
    [['};', 'p']],
    [['deploy', 'f'], ['(project);', 'p'], [' // 🚀', 'c']],
];
const blocks = [...document.querySelectorAll('#page .b')];
const code = $('code');
function setProgress(p) {
    $('pg').style.width = p * 100 + '%';
    const lit = Math.floor(p * blocks.length + 0.001);
    blocks.forEach((b, i) => b.classList.toggle('on', i < lit));
    const done = p >= 1;
    $('st').textContent = done ? '✓ آماده‌ی انتشار!' : 'در حال ساخت...';
    $('st').classList.toggle('done', done);
}
function addTok(text, cls) { const s = document.createElement('span'); s.className = cls; s.textContent = text; code.appendChild(s); return s; }

async function typeCode() {
    if (reduced) { CODE.forEach((l, i) => { l.forEach(([t, c]) => addTok(t, c)); if (i < CODE.length - 1) code.appendChild(document.createTextNode('\n')); }); setProgress(1); return; }
    for (;;) {
        code.replaceChildren(); setProgress(0);
        for (let li = 0; li < CODE.length; li++) {
            for (const [text, cls] of CODE[li]) {
                const s = addTok('', cls);
                for (const ch of text) { s.textContent += ch; await sleep(26); }
            }
            if (li < CODE.length - 1) code.appendChild(document.createTextNode('\n'));
            setProgress((li + 1) / CODE.length);
            await sleep(180);
        }
        await sleep(3200);
    }
}
typeCode();

/* ---------- شمارنده‌ها (عددها نمونه هستند؛ با آمار واقعی خودت جایگزین کن) ---------- */
function count() {
    document.querySelectorAll('#stats b').forEach((b) => {
        const n = +b.dataset.n, s = b.dataset.s || '';
        if (reduced) { b.textContent = fa(n) + s; return; }
        const t0 = performance.now();
        (function step(t) { const p = Math.min(1, (t - t0) / 1500); b.textContent = fa(Math.round(n * (1 - Math.pow(1 - p, 3)))) + s; if (p < 1) requestAnimationFrame(step); })(t0);
    });
}
new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); count(); } }, { threshold: 0.3 }).observe($('stats'));