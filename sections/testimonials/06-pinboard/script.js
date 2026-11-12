const $ = (id) => document.getElementById(id);
const board = $('board');

// نظرها نمونه هستند؛ با نظر واقعی مشتری‌هایت جایگزینشان کن
const DATA = [
    { type: 'sticky', bg: '#fff3a3', name: 'سارا احمدی', role: 'مدیر فروشگاه آنلاین', stars: 5, res: '📈 فروش ×۲', text: 'فروشگاهمون رو تو دو هفته تحویل دادن و فروش ماه اول دو برابر شد.' },
    { type: 'polaroid', bg: '#ffd1dc', emo: '🚀', name: 'امیر رضایی', role: 'مدیرعامل استارتاپ', stars: 5, res: '⚡ تحویل زودتر از موعد', text: 'کدها تمیز و مستند بود، تیم خودمون راحت ادامه‌ش داد.' },
    { type: 'card', name: 'مریم کاظمی', role: 'صاحب کلینیک', stars: 4, res: '📞 تماس‌ها ۵۰٪ کمتر', text: 'بیمارها از رزرو آنلاین نوبت تعریف می‌کنن.' },
    { type: 'sticky', bg: '#c8f5dd', name: 'علی محمدی', role: 'مدیر ساختمان', stars: 5, res: '🧾 شفافیت کامل', text: 'پنل شارژ و قبض، اختلاف حساب رو از بین برد.' },
    { type: 'polaroid', bg: '#cfe4ff', emo: '🎨', name: 'نگار صادقی', role: 'مدیر بازاریابی', stars: 5, res: '🎯 تبدیل ۳۰٪ بیشتر', text: 'سایت جدید هم زیباست هم سریع.' },
    { type: 'card', name: 'حسین نوری', role: 'صاحب رستوران', stars: 4, res: '🍽 سفارش آنلاین ×۳', text: 'منوی دیجیتال کار رستوران رو راحت‌تر کرد.' },
    { type: 'sticky', bg: '#ffd9a8', name: 'زهرا موسوی', role: 'فروشنده‌ی صنایع دستی', stars: 5, res: '🌍 سفارش از سراسر کشور', text: 'همه‌چیز خودکار انجام میشه و من فقط بسته‌بندی می‌کنم!' },
];

const notes = DATA.map((d, i) => {
    const n = document.createElement('article');
    n.className = 'note ' + d.type;
    if (d.bg) n.style.setProperty('--bg', d.bg);
    n.tabIndex = 0;
    n.setAttribute('aria-label', `نظر ${d.name}؛ با فلش‌ها جابجا کن`);
    if (d.type === 'polaroid') { const ph = document.createElement('div'); ph.className = 'ph'; ph.textContent = d.emo; n.appendChild(ph); }
    const st = document.createElement('div'); st.className = 'stars'; st.textContent = '★'.repeat(d.stars) + '☆'.repeat(5 - d.stars);
    const q = document.createElement('p'); q.className = 'q'; q.textContent = d.text;
    const w = document.createElement('div'); w.className = 'who'; w.textContent = d.name;
    const sm = document.createElement('small'); sm.textContent = d.role; w.appendChild(sm);
    const res = document.createElement('span'); res.className = 'res'; res.textContent = d.res;
    n.append(st, q, w, res);
    board.appendChild(n);
    return { el: n, fx: 0, fy: 0 };
});

let z = 10;
// موقعیت هر برگه به صورت کسری از فضای آزاد تخته ذخیره می‌شود تا با تغییر اندازه‌ی صفحه جابجا نشود
function apply(o) {
    const W = board.clientWidth, H = board.clientHeight;
    o.el.style.left = o.fx * (W - o.el.offsetWidth) + 'px';
    o.el.style.top = o.fy * (H - o.el.offsetHeight) + 'px';
}
function layout(jitter) {
    const cols = board.clientWidth < 700 ? 2 : 3, rows = Math.ceil(notes.length / cols);
    const order = jitter ? [...notes.keys()].sort(() => Math.random() - 0.5) : [...notes.keys()];
    order.forEach((idx, k) => {
        const o = notes[idx], c = k % cols, r = Math.floor(k / cols);
        const j = () => (jitter ? (Math.random() - 0.5) * 0.16 : 0);
        o.fx = Math.min(1, Math.max(0, (cols > 1 ? c / (cols - 1) : 0.5) + j()));
        o.fy = Math.min(1, Math.max(0, (rows > 1 ? r / (rows - 1) : 0.5) + j()));
        o.el.style.setProperty('--r', jitter ? (Math.random() * 12 - 6).toFixed(1) + 'deg' : '0deg');
        o.el.style.zIndex = ++z;
        apply(o);
    });
}
function animated(fn) {
    board.classList.add('anim');
    fn();
    setTimeout(() => board.classList.remove('anim'), 700);
}
$('shuffle').addEventListener('click', () => animated(() => layout(true)));
$('tidy').addEventListener('click', () => animated(() => layout(false)));
addEventListener('resize', () => notes.forEach(apply));

/* ---------- کشیدن با موس و انگشت ---------- */
notes.forEach((o) => {
    const n = o.el;
    let ox = 0, oy = 0, sl = 0, st = 0, on = false;
    n.addEventListener('pointerdown', (e) => {
        on = true; ox = e.clientX; oy = e.clientY; sl = n.offsetLeft; st = n.offsetTop;
        n.classList.add('drag'); n.style.zIndex = ++z; n.setPointerCapture(e.pointerId);
    });
    n.addEventListener('pointermove', (e) => {
        if (!on) return;
        const W = board.clientWidth - n.offsetWidth, H = board.clientHeight - n.offsetHeight;
        n.style.left = Math.min(W, Math.max(0, sl + e.clientX - ox)) + 'px';
        n.style.top = Math.min(H, Math.max(0, st + e.clientY - oy)) + 'px';
    });
    const up = () => {
        if (!on) return;
        on = false; n.classList.remove('drag');
        const W = board.clientWidth - n.offsetWidth, H = board.clientHeight - n.offsetHeight;
        o.fx = W > 0 ? n.offsetLeft / W : 0; o.fy = H > 0 ? n.offsetTop / H : 0;
    };
    n.addEventListener('pointerup', up);
    n.addEventListener('pointercancel', up);
    // جابجایی با کیبورد (Shift = قدم بزرگ‌تر)
    n.addEventListener('keydown', (e) => {
        const s = e.shiftKey ? 40 : 12;
        const d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
        if (!d) return;
        e.preventDefault();
        const W = board.clientWidth - n.offsetWidth, H = board.clientHeight - n.offsetHeight;
        n.style.left = Math.min(W, Math.max(0, n.offsetLeft + d[0])) + 'px';
        n.style.top = Math.min(H, Math.max(0, n.offsetTop + d[1])) + 'px';
        o.fx = W > 0 ? n.offsetLeft / W : 0; o.fy = H > 0 ? n.offsetTop / H : 0;
        n.style.zIndex = ++z;
    });
});

layout(true);
document.fonts?.ready.then(() => notes.forEach(apply));