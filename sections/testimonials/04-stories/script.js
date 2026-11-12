const $ = (id) => document.getElementById(id);
const fa = (n) => Number(n).toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DUR = 6500;   // مدت نمایش هر استوری (میلی‌ثانیه)

// نظرها نمونه هستند؛ با نظر واقعی مشتری‌هایت جایگزینشان کن
const DATA = [
    { name: 'سارا احمدی', role: 'مدیر فروشگاه آنلاین', stars: 5, tag: '🛒 فروشگاه آنلاین', emo: '🛍', a: '#7c5cff', b: '#3b1fa8', text: 'فروشگاهمون رو تو دو هفته تحویل دادن و فروش ماه اول دو برابر شد.' },
    { name: 'امیر رضایی', role: 'مدیرعامل استارتاپ', stars: 5, tag: '🚀 اپلیکیشن وب', emo: '🚀', a: '#ff4fa3', b: '#a3135e', text: 'کدها تمیز و مستند بود. تیم خودمون بدون هیچ مشکلی ادامه‌ش داد.' },
    { name: 'مریم کاظمی', role: 'صاحب کلینیک', stars: 4, tag: '🏥 نوبت‌دهی آنلاین', emo: '🩺', a: '#14b8a6', b: '#0a6b63', text: 'بیمارها از رزرو آنلاین نوبت تعریف می‌کنن و شلوغی تلفن‌ها نصف شد.' },
    { name: 'علی محمدی', role: 'مدیر ساختمان', stars: 5, tag: '🏢 مدیریت ساختمان', emo: '🏢', a: '#f59e0b', b: '#b34b0c', text: 'پنل شارژ و قبض همه‌چیز رو شفاف کرد. دیگه اختلاف حساب نداریم.' },
    { name: 'نگار صادقی', role: 'مدیر بازاریابی', stars: 5, tag: '🎨 طراحی سایت', emo: '✨', a: '#3b82f6', b: '#1c3fae', text: 'سایت جدید هم زیباست هم سریع. تبدیل بازدیدکننده به مشتری ۳۰٪ بالا رفت.' },
    { name: 'حسین نوری', role: 'صاحب رستوران', stars: 4, tag: '🍽 منوی دیجیتال', emo: '🍕', a: '#ef4444', b: '#8f1717', text: 'منوی دیجیتال کار رستوران رو راحت‌تر کرد و مشتری‌ها استقبال کردن.' },
];
const N = DATA.length;
let idx = 0, t = 0, paused = reduced, hold = false, last = performance.now();

// نوار پیشرفت: به تعداد استوری‌ها
const segs = DATA.map(() => {
    const s = document.createElement('span'); s.className = 'seg';
    s.appendChild(document.createElement('i'));
    $('prog').appendChild(s);
    return s;
});

function show(i) {
    idx = ((i % N) + N) % N;
    t = 0;
    const d = DATA[idx];
    const st = $('story');
    st.style.setProperty('--a', d.a); st.style.setProperty('--b', d.b);
    $('av').textContent = d.name[0]; $('nm').textContent = d.name; $('rl').textContent = d.role;
    $('st').textContent = '★'.repeat(d.stars) + '☆'.repeat(5 - d.stars);
    $('tg').textContent = d.tag; $('emo').textContent = d.emo;
    $('cnt').textContent = `${fa(idx + 1)} از ${fa(N)}`;
    const q = $('q');
    q.replaceChildren();
    d.text.split(' ').forEach((w, k) => {          // کلمه‌ها یکی‌یکی ظاهر می‌شوند
        const s = document.createElement('span');
        s.className = 'w'; s.style.setProperty('--i', k); s.textContent = w;
        q.appendChild(s);
    });
}

function frame(now) {
    const dt = Math.min(100, now - last);
    last = now;
    if (!paused && !hold && !document.hidden) { t += dt; if (t >= DUR) show(idx + 1); }
    segs.forEach((s, i) => (s.firstChild.style.transform = `scaleX(${i < idx ? 1 : i === idx ? t / DUR : 0})`));
    requestAnimationFrame(frame);
}

function setPaused(p) {
    paused = p;
    $('pp').textContent = p ? '▶' : '⏸';
    $('pp').setAttribute('aria-label', p ? 'پخش' : 'توقف');
}
$('pp').addEventListener('click', () => setPaused(!paused));

/* ---------- لمس: کنار چپ بعدی، کنار راست قبلی، نگه‌داشتن = توقف موقت ---------- */
const st = $('story');
let pd = 0, px = 0;
st.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; pd = performance.now(); px = e.clientX; hold = true; });
const end = () => { hold = false; pd = 0; };
st.addEventListener('pointercancel', end);
st.addEventListener('pointerleave', end);
st.addEventListener('pointerup', (e) => {
    if (!pd) return;
    const quick = performance.now() - pd < 260 && Math.abs(e.clientX - px) < 10;
    end();
    if (!quick) return;
    const r = st.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    if (x < 0.4) show(idx + 1); else if (x > 0.6) show(idx - 1);
});
st.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx + 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx - 1); }
    if (e.key === ' ') { e.preventDefault(); setPaused(!paused); }
});

setPaused(paused);
show(0);
requestAnimationFrame(frame);