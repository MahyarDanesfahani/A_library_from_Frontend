const ft = document.getElementById('ft');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const $ = (id) => document.getElementById(id);
const fa = (s) => String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
let color = '#39ff7a';

/* ---------- باران ماتریکس (فقط وقتی فوتر دیده می‌شود) ---------- */
const cv = $('rain'), ctx = cv.getContext('2d');
const CH = '01{}[]<>/\\$#=+*;:'.split('');
let W, H, drops = [], run = false, last = 0;
function size() {
    const r = ft.getBoundingClientRect();
    W = cv.width = r.width; H = cv.height = r.height;
    drops = Array.from({ length: Math.floor(W / 14) }, () => Math.random() * -40);
}
function draw(t) {
    if (!run) return;
    if (t - last > 55) {
        last = t;
        ctx.fillStyle = 'rgba(4,7,4,.12)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = color;
        ctx.font = '14px monospace';
        drops.forEach((y, i) => {
            ctx.fillText(CH[(Math.random() * CH.length) | 0], i * 14, y * 14);
            drops[i] = y * 14 > H && Math.random() > 0.975 ? 0 : y + 1;
        });
    }
    requestAnimationFrame(draw);
}
size();
addEventListener('resize', size);
let booted = false;
new IntersectionObserver(([e]) => {
    run = e.isIntersecting && !reduced;
    if (run) requestAnimationFrame(draw);
    if (e.isIntersecting && !booted) { booted = true; boot(); }
}, { threshold: 0.15 }).observe(ft);

/* ---------- متن راه‌اندازی که تایپ می‌شود ---------- */
async function boot() {
    const text = '> initializing community... done';
    for (const ch of text) { $('boot').textContent += ch; if (!reduced) await sleep(35); }
}

/* ---------- گلیچ دوره‌ای روی برند ---------- */
if (!reduced) setInterval(() => { $('gl').classList.add('g'); setTimeout(() => $('gl').classList.remove('g'), 450); }, 5000);

/* ---------- زمان آنلاین، ساعت و سال ---------- */
const t0 = Date.now();
function tick() {
    const s = Math.floor((Date.now() - t0) / 1000);
    $('up').textContent = fa(`${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`);
    $('clk').textContent = new Date().toLocaleTimeString('fa-IR');
}
tick(); setInterval(tick, 1000);
$('copy').textContent = `© ${new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} هک‌ویب | ساخته‌شده با ☕ و کد`;
$('totop').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

/* ---------- ترمینال تعاملی (فقط دستورهای ثابت، بدون eval) ---------- */
const log = $('log'), inp = $('ti');
const hist = []; let hi = 0;
function print(text, cls = '') {
    const d = document.createElement('div');
    d.className = cls;
    d.textContent = text;           // ورودی کاربر هرگز HTML نمی‌شود
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
}
const THEMES = ['#39ff7a', '#ffb000', '#19f9ff', '#ff2bd6'];
const CMDS = {
    help: () => print('help  whoami  ls  date  theme  newsletter <email>  clear  sudo'),
    whoami: () => print('guest@hackvibe: یه کنجکاو خوب 😎'),
    ls: () => print('courses/  blog/  tools/  jobs/  secrets.txt'),
    date: () => print(new Date().toLocaleString('fa-IR')),
    theme: () => {
        color = THEMES[(THEMES.indexOf(color) + 1) % THEMES.length];
        ft.style.setProperty('--g', color);
        print('theme → ' + color, 'ok');
    },
    newsletter: (a) => {
        if (!/^\S+@\S+\.\S+$/.test(a[0] || '')) return print('usage: newsletter you@mail.com', 'er');
        // اینجا ایمیل را با fetch به بک‌اند خودت بفرست
        print('✔ subscribed: ' + a[0], 'ok');
    },
    clear: () => log.replaceChildren(),
    sudo: () => print('خطا: تو root نیستی 😄 این حادثه گزارش شد.', 'er'),
    cat: (a) => print(a[0] === 'secrets.txt' ? 'راز: کد خوب، کد تمیزه.' : 'cat: فایل پیدا نشد', a[0] === 'secrets.txt' ? 'ok' : 'er'),
};
$('tf').addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = inp.value.trim();
    inp.value = '';
    if (!raw) return;
    hist.push(raw); hi = hist.length;
    print('$ ' + raw, 'cmd');
    const [c, ...a] = raw.split(/\s+/);
    const fn = Object.hasOwn(CMDS, c.toLowerCase()) ? CMDS[c.toLowerCase()] : null;
    fn ? fn(a) : print(`command not found: ${c}`, 'er');
});
inp.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hi > 0) { e.preventDefault(); inp.value = hist[--hi]; }
    if (e.key === 'ArrowDown') { e.preventDefault(); inp.value = hi < hist.length - 1 ? hist[++hi] : ((hi = hist.length), ''); }
});
$('term').addEventListener('click', () => inp.focus());
print("به ترمینال خوش اومدی. بنویس: help");