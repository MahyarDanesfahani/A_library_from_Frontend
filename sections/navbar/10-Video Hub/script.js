const nav = document.getElementById('nav');
const q = document.getElementById('q');
const sug = document.getElementById('sug');
const mic = document.getElementById('mic');
const TRENDS = ['آموزش جاوااسکریپت', 'ترفندهای CSS', 'موزیک آرام برای مطالعه', 'کلیپ خنده‌دار', 'مستند طبیعت', 'طراحی رابط کاربری', 'آموزش React', 'پادکست برنامه‌نویسی'];
let act = -1;

/* ---------- پیشنهاد جستجو (بدون innerHTML برای امنیت) ---------- */
function render() {
    const v = q.value.trim();
    const list = TRENDS.filter((t) => !v || t.includes(v)).slice(0, 6);
    sug.replaceChildren();
    act = -1;
    list.forEach((t) => {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        const i = v ? t.indexOf(v) : -1;
        if (i >= 0) {
            const b = document.createElement('b');
            b.textContent = v;
            li.append('🔍 ' + t.slice(0, i), b, t.slice(i + v.length));
        } else li.textContent = '🔍 ' + t;
        li.dataset.t = t;
        li.addEventListener('mousedown', (e) => { e.preventDefault(); pick(t); });
        sug.appendChild(li);
    });
    const show = list.length > 0 && document.activeElement === q;
    sug.classList.toggle('show', show);
    q.setAttribute('aria-expanded', show);
}
function pick(t) { q.value = t; sug.classList.remove('show'); /* اینجا جستجوی واقعی را اجرا کن */ }

q.addEventListener('focus', render);
q.addEventListener('input', render);
q.addEventListener('blur', () => sug.classList.remove('show'));
q.addEventListener('keydown', (e) => {
    const items = [...sug.children];
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        act = (act + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach((li, i) => li.classList.toggle('act', i === act));
    } else if (e.key === 'Enter' && act >= 0) { e.preventDefault(); pick(items[act].dataset.t); }
});
document.getElementById('search').addEventListener('submit', (e) => e.preventDefault());

// کلید / برای رفتن روی جستجو
addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); }
});

/* ---------- جستجوی صوتی (اگر مرورگر پشتیبانی کند) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SR) mic.hidden = true;
else {
    const rec = new SR();
    rec.lang = 'fa-IR';
    rec.onresult = (e) => { q.value = e.results[0][0].transcript; render(); };
    rec.onend = () => mic.classList.remove('rec');
    mic.addEventListener('click', () => { mic.classList.add('rec'); try { rec.start(); } catch (_) {} });
}

/* ---------- منوهای کشویی ---------- */
function closeAll() {
    document.querySelectorAll('.dd').forEach((d) => {
        d.classList.remove('open');
        d.querySelector('.dd-btn').setAttribute('aria-expanded', 'false');
    });
}
document.querySelectorAll('.dd').forEach((d) => {
    const btn = d.querySelector('.dd-btn');
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !d.classList.contains('open');
        closeAll();
        d.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
    });
    d.querySelector('.panel').addEventListener('click', (e) => e.stopPropagation());
});
document.addEventListener('click', closeAll);
addEventListener('keydown', (e) => e.key === 'Escape' && closeAll());

document.getElementById('readAll').addEventListener('click', () => {
    document.querySelectorAll('.notes .un').forEach((n) => n.classList.remove('un'));
    document.getElementById('bell').hidden = true;
});

/* ---------- حال‌وهوا: رنگ نوبار با انتخاب تغییر می‌کند ---------- */
document.querySelectorAll('.moods button').forEach((b) =>
    b.addEventListener('click', () => {
        document.querySelectorAll('.moods button').forEach((x) => x.setAttribute('aria-checked', x === b));
        nav.style.setProperty('--ac', b.dataset.ac);
        const h = document.getElementById('mood');
        h.textContent = b.dataset.t;
        h.style.setProperty('--accent', b.dataset.ac);
    })
);