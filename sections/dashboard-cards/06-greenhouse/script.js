const $ = (id) => document.getElementById(id);
const fa = (n, d = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: d, maximumFractionDigits: d });
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
const NS = 'http://www.w3.org/2000/svg';
const rnd = (a) => (Math.random() - 0.5) * a;

// همه‌ی داده‌ها شبیه‌سازی و نمونه هستند؛ تو پروژه‌ی واقعی از سنسورها (MQTT یا API) بگیر
const ZONES = [
    { name: 'بخش الف', plant: '🍅', crop: 'گوجه‌فرنگی', v: { t: 27, h: 68, s: 55, l: 28 }, a: { irr: 0, fan: 0, shade: 0, lamp: 0 } },
    { name: 'بخش ب', plant: '🥒', crop: 'خیار', v: { t: 29, h: 74, s: 46, l: 31 }, a: { irr: 0, fan: 0, shade: 0, lamp: 0 } },
    { name: 'بخش ج', plant: '🌹', crop: 'رز هلندی', v: { t: 24, h: 64, s: 62, l: 24 }, a: { irr: 0, fan: 0, shade: 0, lamp: 0 } },
];
const G = [  // حداقل، حداکثر، بازه‌ی ایده‌آل
    { k: 't', lb: 'دما', un: '°C', dec: 1, min: 5, max: 45, lo: 20, hi: 29, wl: 15, wh: 34 },
    { k: 'h', lb: 'رطوبت هوا', un: '٪', dec: 0, min: 10, max: 100, lo: 60, hi: 80, wl: 45, wh: 90 },
    { k: 's', lb: 'رطوبت خاک', un: '٪', dec: 0, min: 0, max: 100, lo: 40, hi: 70, wl: 28, wh: 90 },
    { k: 'l', lb: 'نور', un: 'کیلولوکس', dec: 0, min: 0, max: 60, lo: 15, hi: 40, wl: 8, wh: 50 },
];
const ACT = [['irr', '💧', 'آبیاری قطره‌ای'], ['fan', '🌀', 'فن تهویه'], ['shade', '☂️', 'سایه‌بان'], ['lamp', '💡', 'نور مصنوعی']];
const BATCH = [['🍅', 'گوجه‌فرنگی (بخش الف)', 42, 75], ['🥒', 'خیار (بخش ب)', 28, 45], ['🌹', 'رز هلندی (بخش ج)', 58, 70]];
let cur = 0, tmax = 30;
const flags = new Set();

/* ---------- کارت‌های گیج ---------- */
const gref = {};
G.forEach((g) => {
    const c = el('article', 'card gauge');
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 112 64'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<path class="bg" pathLength="100" d="M12 56A44 44 0 0 1 100 56"/><path class="fg" pathLength="100" d="M12 56A44 44 0 0 1 100 56"/>';
    const v = el('div', 'v'), chip = el('span', 'chip');
    c.append(svg, v, el('div', 'lb', g.lb), el('div', 'id', `ایده‌آل: ${fa(g.lo)} تا ${fa(g.hi)}`), chip);
    $('gauges').appendChild(c); gref[g.k] = { c, fg: svg.querySelector('.fg'), v, chip };
});

/* ---------- بخش‌ها ---------- */
const zref = ZONES.map((z, i) => {
    const b = el('button', 'zone'); b.type = 'button'; b.setAttribute('role', 'radio');
    const st = el('div', 'st'); const icons = {};
    ACT.forEach(([k, ic, nm]) => { const s = el('i', k, ic); s.title = nm; icons[k] = s; st.appendChild(s); });
    const tmp = el('small'); b.append(el('span', 'pl', z.plant), el('b', '', z.name), tmp, st);
    b.addEventListener('click', () => { cur = i; render(); });
    $('zones').appendChild(b); return { b, icons, tmp };
});

/* ---------- دکمه‌های تجهیزات ---------- */
const aref = {};
ACT.forEach(([k, ic, nm]) => {
    const b = el('button', 'act'); b.type = 'button'; b.setAttribute('role', 'switch');
    const i = el('span', 'ai ' + k, ic), t = el('span'); t.append(nm, el('small'));
    b.append(i, t);
    b.addEventListener('click', () => { ZONES[cur].a[k] = ZONES[cur].a[k] ? 0 : 1; render(); });   // اینجا فرمان را به کنترلر تجهیزات بفرست
    $('acts').appendChild(b); aref[k] = b;
});
$('auto').addEventListener('change', render);
$('tmax').addEventListener('input', () => { tmax = +$('tmax').value; $('tv').textContent = fa(tmax); });

function status(g, v) { return v < g.wl || v > g.wh ? ['bad', 'خطرناک', 'var(--bad)'] : v < g.lo || v > g.hi ? ['warn', 'خارج از بازه', 'var(--warn)'] : ['ok', 'مطلوب', 'var(--g)']; }

function render() {
    const z = ZONES[cur], auto = $('auto').checked;
    G.forEach((g) => {
        const v = z.v[g.k], r = gref[g.k], s = status(g, v);
        r.fg.style.strokeDashoffset = 100 * (1 - Math.min(1, Math.max(0, (v - g.min) / (g.max - g.min))));
        r.c.style.setProperty('--c', s[2]);
        r.v.textContent = fa(v, g.dec); const u = el('small', '', ' ' + g.un); r.v.appendChild(u);
        r.chip.textContent = s[1];
    });
    ZONES.forEach((zz, i) => {
        const r = zref[i];
        r.b.setAttribute('aria-checked', i === cur);
        r.b.classList.toggle('shade', !!zz.a.shade); r.b.classList.toggle('lamp', !!zz.a.lamp);
        r.tmp.textContent = `${zz.crop} | ${fa(zz.v.t, 1)}°`;
        ACT.forEach(([k]) => r.icons[k].classList.toggle('on', !!zz.a[k]));
    });
    $('zname').textContent = '| ' + z.name;
    ACT.forEach(([k]) => {
        aref[k].setAttribute('aria-checked', !!z.a[k]); aref[k].disabled = auto;
        aref[k].querySelector('small').textContent = z.a[k] ? 'روشن' : 'خاموش';
    });
    $('hint').textContent = auto ? 'در حالت خودکار، سیستم تجهیزات را بر اساس سنسورها کنترل می‌کند. برای دستی شدن، حالت خودکار را خاموش کن.' : 'حالت دستی فعال است؛ مراقب دما و رطوبت باش.';
}

/* ---------- شبیه‌سازی سنسورها و کنترل خودکار ---------- */
const alerts = [];
function notify(msg, kind) {
    alerts.unshift([msg, kind, new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })]); alerts.length = Math.min(alerts.length, 5);
    const ul = $('alerts'); ul.replaceChildren();
    alerts.forEach(([m, k, t]) => { const li = el('li', k, m); li.appendChild(el('small', '', t)); ul.appendChild(li); });
}
function check(zi) {
    const z = ZONES[zi];
    G.forEach((g) => {
        const key = zi + g.k, bad = status(g, z.v[g.k])[0] === 'bad';
        if (bad && !flags.has(key)) { flags.add(key); notify(`${z.name}: ${g.lb} در محدوده‌ی خطرناک است (${fa(z.v[g.k], g.dec)} ${g.un})`, 'bad'); }
        if (!bad && flags.has(key)) { flags.delete(key); notify(`${z.name}: ${g.lb} به حالت عادی برگشت`, 'ok'); }
    });
}
function step() {
    if (document.hidden) return;
    const auto = $('auto').checked;
    ZONES.forEach((z, i) => {
        const { v, a } = z;
        if (auto) {   // قانون‌های کنترل خودکار
            a.fan = v.t > tmax || v.h > 85 ? 1 : v.t < tmax - 3 && v.h < 80 ? 0 : a.fan;
            a.irr = v.s < 40 ? 1 : v.s > 66 ? 0 : a.irr;
            a.shade = v.l > 38 ? 1 : v.l < 28 ? 0 : a.shade;
            a.lamp = v.l < 10 ? 1 : 0;
        }
        v.t += (31 - v.t) * 0.03 + (a.shade ? -0.15 : 0.1) - (a.fan ? 0.5 : 0) + (a.lamp ? 0.1 : 0) + rnd(0.3);
        v.h += (62 - v.h) * 0.02 + (a.irr ? 0.7 : 0) - (a.fan ? 0.5 : 0) + rnd(0.6);
        v.s += (a.irr ? 1.6 : -0.22) + rnd(0.2);
        v.l += ((a.shade ? 18 : 33) + (a.lamp ? 6 : 0) - v.l) * 0.12 + rnd(0.8);
        v.t = Math.min(44, Math.max(6, v.t)); v.h = Math.min(99, Math.max(15, v.h)); v.s = Math.min(98, Math.max(5, v.s)); v.l = Math.min(58, Math.max(1, v.l));
        check(i);
    });
    render();
    $('stamp').textContent = 'آخرین دریافت از سنسورها: ' + new Date().toLocaleTimeString('fa-IR');
}
setInterval(step, 2000);

/* ---------- چرخه‌ی رشد ---------- */
BATCH.forEach(([e, n, day, total]) => {
    const li = el('li', 'bi'); const t = el('div', 't'), f = el('i'); f.dataset.w = (day / total) * 100 + '%'; t.appendChild(f);
    li.append(el('span', 'e', e), el('b', '', n), el('small', '', `${fa(total - day)} روز تا برداشت`), t, el('small', '', `روز ${fa(day)} از ${fa(total)}`));
    $('batch').appendChild(li);
});
requestAnimationFrame(() => requestAnimationFrame(() => $('batch').querySelectorAll('i').forEach((f) => (f.style.width = f.dataset.w))));

notify('سامانه‌ی پایش فعال شد؛ همه‌ی بخش‌ها در حال نظارت هستند.', 'ok');
render(); step();