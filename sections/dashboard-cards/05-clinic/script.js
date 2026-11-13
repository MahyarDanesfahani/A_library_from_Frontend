const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

// همه‌ی نام‌ها و داده‌ها نمونه و ساختگی هستند؛ تو سیستم واقعی اطلاعات بیماران را فقط با رعایت حریم خصوصی و از سرور بگیر
const DOCS = [{ n: 'دکتر الهام فرهمند', s: 'داخلی', c: '#0e9aa7' }, { n: 'دکتر بهزاد کیانی', s: 'قلب و عروق', c: '#e0485a' }, { n: 'دکتر مینا صدری', s: 'کودکان', c: '#8b5cf6' }];
const APPTS = [
    ['۰۹:۰۰', 'سارا م.', 0, 'done'], ['۰۹:۲۰', 'رضا ک.', 1, 'done'], ['۰۹:۴۰', 'نگار ا.', 2, 'done'], ['۱۰:۰۰', 'علی ن.', 0, 'visit', 0],
    ['۱۰:۲۰', 'مریم ح.', 1, 'waiting', 14], ['۱۰:۴۰', 'امیر ص.', 2, 'waiting', 9], ['۱۱:۰۰', 'هانیه ر.', 0, 'waiting', 4], ['۱۱:۲۰', 'کامران ف.', 1, 'cancel'],
    ['۱۱:۴۰', 'پریسا ش.', 2, 'upcoming'], ['۱۲:۰۰', 'بهنام ع.', 0, 'upcoming'], ['۱۲:۲۰', 'الهام ق.', 1, 'upcoming'], ['۱۲:۴۰', 'حسین ج.', 2, 'upcoming'],
].map(([time, name, doc, status, wait = 0], i) => ({ id: i, time, name, doc, status, wait, room: status === 'visit' ? 0 : null, start: status === 'visit' ? Date.now() : 0 }));
const ROOMS = [{ s: 'busy', by: 3 }, { s: 'free' }, { s: 'free' }, { s: 'clean' }, { s: 'free' }, { s: 'free' }];
const LABEL = { done: 'انجام‌شده', visit: 'در ویزیت', waiting: 'در انتظار', upcoming: 'آینده', cancel: 'لغو' };
const DIST = [132, 36, 10, 4, 2];   // توزیع ستاره‌های ۵ تا ۱

const dateTxt = new Date().toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
$('date').textContent = dateTxt + ' | کلینیک تخصصی مهر';
const tick = () => ($('clock').textContent = new Date().toLocaleTimeString('fa-IR'));
tick(); setInterval(tick, 1000);

const say = (t) => ($('announce').textContent = t);
const free = () => ROOMS.findIndex((r) => r.s === 'free');

/* ---------- اقدام‌ها ---------- */
$('call').addEventListener('click', () => {
    const next = APPTS.find((a) => a.status === 'waiting');
    if (!next) return say('بیمار منتظری در صف نیست.');
    const r = free();
    if (r < 0) return say('همه‌ی اتاق‌ها مشغول هستند؛ کمی صبر کن.');
    // اینجا فراخوان را با fetch به سیستم نوبت‌دهی بفرست
    next.status = 'visit'; next.room = r; next.start = Date.now();
    ROOMS[r] = { s: 'busy', by: next.id };
    say(`${next.name} لطفاً به اتاق ${fa(r + 1)} مراجعه کنند.`);
    render();
});
$('arrive').addEventListener('click', () => {
    const a = APPTS.find((x) => x.status === 'upcoming');
    if (!a) return say('بیمار آینده‌ای باقی نمانده است.');
    a.status = 'waiting'; a.wait = 0;
    say(`${a.name} وارد کلینیک شد.`);
    render();
});
function finish(a) {
    a.status = 'done';
    const r = a.room; ROOMS[r] = { s: 'clean' };
    setTimeout(() => { ROOMS[r] = { s: 'free' }; render(); }, 6000);   // نظافت اتاق (نمونه: ۶ ثانیه)
    say(`ویزیت ${a.name} پایان یافت.`);
    render();
}

/* ---------- رندر ---------- */
function render() {
    const total = APPTS.filter((a) => a.status !== 'cancel').length, done = APPTS.filter((a) => a.status === 'done').length;
    const wait = APPTS.filter((a) => a.status === 'waiting'), visit = APPTS.filter((a) => a.status === 'visit');
    const avg = wait.length ? wait.reduce((s, a) => s + a.wait, 0) / wait.length : 0;

    const k = $('kpis'); k.replaceChildren();
    [['✅', 'ویزیت‌شده امروز', `${fa(done)}`, ` از ${fa(total)}`], ['⏳', 'در انتظار', fa(wait.length), ' نفر'], ['🕒', 'میانگین انتظار', fa(avg), ' دقیقه'], ['⭐', 'رضایت بیماران', fa(4.7, 1), ' از ۵']].forEach(([ic, lb, v, sm]) => {
        const c = el('article', 'card kpi'); const b = el('b', '', v); b.appendChild(el('small', '', sm));
        c.append(el('span', 'ic', ic), el('span', 'lb', lb), b); k.appendChild(c);
    });

    const q = $('queue'); q.replaceChildren();
    if (!visit.length && !wait.length) q.appendChild(el('li', 'qe', 'صف خالی است.'));
    visit.forEach((a) => {
        const li = el('li', 'qi v'); const info = el('div'); info.append(el('b', '', a.name), el('small', '', `${DOCS[a.doc].n} | اتاق ${fa(a.room + 1)}`));
        const w = el('span', 'w', 'در ویزیت'); const b = el('button', '', 'پایان ویزیت'); b.type = 'button'; b.addEventListener('click', () => finish(a));
        const r = el('div'); r.append(w, b);
        li.append(el('span', 'n', '●'), info, r); q.appendChild(li);
    });
    wait.forEach((a, i) => {
        const li = el('li', 'qi'); const info = el('div'); info.append(el('b', '', a.name), el('small', '', `${DOCS[a.doc].n} | نوبت ${a.time}`));
        li.append(el('span', 'n', fa(i + 1)), info, el('span', 'w' + (a.wait >= 15 ? ' long' : ''), `${fa(a.wait)} دقیقه`)); q.appendChild(li);
    });

    const rg = $('rooms'); rg.replaceChildren();
    ROOMS.forEach((r, i) => { const d = el('div', 'room ' + r.s, `اتاق ${fa(i + 1)}`); d.appendChild(el('small', '', r.s === 'free' ? 'آزاد' : r.s === 'busy' ? 'در حال ویزیت' : 'در حال نظافت')); rg.appendChild(d); });

    const tl = $('tl'); tl.replaceChildren();
    APPTS.forEach((a) => {
        const s = el('div', 'slot ' + a.status, a.time); s.appendChild(el('small', '', a.name));
        s.tabIndex = 0; s.setAttribute('aria-label', `${a.time}، ${a.name}، ${DOCS[a.doc].n}، ${LABEL[a.status]}`);
        const show = () => ($('tip').textContent = `${a.time} | ${a.name} | ${DOCS[a.doc].n} | ${LABEL[a.status]}`);
        s.addEventListener('pointerenter', show); s.addEventListener('focus', show); tl.appendChild(s);
    });

    const dl = $('docs'); dl.replaceChildren();
    DOCS.forEach((d, i) => {
        const busy = APPTS.some((a) => a.doc === i && a.status === 'visit'), cnt = APPTS.filter((a) => a.doc === i && a.status !== 'cancel').length;
        const li = el('li', 'doc'); li.style.setProperty('--c', d.c);
        const info = el('div'); info.append(el('b', '', d.n), el('small', '', `${d.s} | ${fa(cnt)} بیمار امروز`));
        li.append(el('span', 'av', d.n.replace('دکتر ', '')[0]), info, el('span', 'ds ' + (busy ? 'busy' : 'free'), busy ? 'در ویزیت' : 'آزاد')); dl.appendChild(li);
    });
}

/* ---------- زمان انتظار: برای نمایش هر ۱۰ ثانیه = ۱ دقیقه ---------- */
setInterval(() => { if (document.hidden) return; APPTS.forEach((a) => a.status === 'waiting' && a.wait++); render(); }, 10000);

/* ---------- رضایت بیماران ---------- */
const tot = DIST.reduce((a, b) => a + b, 0);
DIST.forEach((c, i) => {
    const li = el('li'); const t = el('span', 't'); const f = el('i'); f.dataset.w = (c / tot) * 100 + '%'; t.appendChild(f);
    li.append(el('span', '', fa(5 - i)), t, el('span', '', fa(c))); $('sbars').appendChild(li);
});
requestAnimationFrame(() => requestAnimationFrame(() => $('sbars').querySelectorAll('i').forEach((f) => (f.style.width = f.dataset.w))));

render();