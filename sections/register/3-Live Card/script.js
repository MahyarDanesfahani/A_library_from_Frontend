const f = document.getElementById('f');
const inner = document.getElementById('inner');
const card3d = document.getElementById('card3d');
const stage = document.getElementById('stage');
const el = f.elements;
const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- آواتار و رنگ کارت ---------- */
const AVATARS = ['😎', '🦊', '🐼', '🚀', '🎧', '🌸', '🦄', '🐙'];
const THEMES = [['#7c5cff', '#ff4fa3'], ['#00c6ff', '#0072ff'], ['#11998e', '#38ef7d'], ['#f7971e', '#ff4b2b'], ['#2b2b45', '#6e6e9c']];

function radio(group, items, onPick, build) {
    items.forEach((it, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', i === 0);
        build(b, it);
        b.addEventListener('click', () => {
            [...group.children].forEach((x) => x.setAttribute('aria-checked', x === b));
            onPick(it);
        });
        group.appendChild(b);
    });
}
radio($('avs'), AVATARS, (a) => { $('av').textContent = a; $('av').classList.add('bump'); setTimeout(() => $('av').classList.remove('bump'), 250); }, (b, a) => (b.textContent = a));
radio($('sw'), THEMES, ([a, b]) => { document.documentElement.style.setProperty('--g1', a); document.documentElement.style.setProperty('--g2', b); },
    (b, [a, c]) => { b.className = 'sw'; b.style.setProperty('--a', a); b.style.setProperty('--b', c); b.setAttribute('aria-label', 'رنگ ' + a); });

/* ---------- نوشتن در فرم، کارت را زنده تغییر می‌دهد ---------- */
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 10000; return String(h).padStart(4, '0'); }
function maskEmail(v) {
    const i = v.indexOf('@');
    return i > 2 ? v.slice(0, 2) + '•••' + v.slice(i) : v;
}
function update() {
    $('cn').textContent = el.name.value.trim() || 'نام شما';
    $('ce').textContent = maskEmail(el.email.value.trim()) || 'email@example.com';
    $('cid').textContent = 'NX-' + hash(el.name.value + el.email.value);
}
el.name.addEventListener('input', update);
el.email.addEventListener('input', update);
$('cd').textContent = new Date().toLocaleDateString('fa-IR');
update();

/* ---------- رمز عبور: کارت برمی‌گردد و قدرت رمز را نشان می‌دهد ---------- */
el.password.addEventListener('focus', () => inner.classList.add('flip'));
el.password.addEventListener('blur', () => inner.classList.remove('flip'));
el.password.addEventListener('input', () => {
    const v = el.password.value;
    const s = [v.length >= 8, /\d/.test(v), /[a-z]/.test(v) && /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
    $('bfill').style.width = (v ? Math.max(1, s) * 25 : 0) + '%';
    $('bfill').style.background = ['#fff', '#ff6b6b', '#ffb347', '#a6f06a', '#5dffa6'][v ? Math.max(1, s) : 0];
    $('blabel').textContent = v ? ['', 'ضعیف', 'متوسط', 'خوب', 'عالی'][Math.max(1, s)] : 'هنوز چیزی ننوشته‌ای';
});

/* ---------- کج شدن کارت با موس و بازتاب نور ---------- */
if (!reduced) {
    stage.addEventListener('pointermove', (e) => {
        const r = card3d.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card3d.style.transform = `rotateY(${(x - 0.5) * 20}deg) rotateX(${(0.5 - y) * 16}deg)`;
        card3d.style.setProperty('--mx', x * 100 + '%');
        card3d.style.setProperty('--my', y * 100 + '%');
        document.querySelector('.gloss').style.setProperty('--mx', x * 100 + '%');
        document.querySelector('.gloss').style.setProperty('--my', y * 100 + '%');
    });
    stage.addEventListener('pointerleave', () => (card3d.style.transform = ''));
}

/* ---------- صدور کارت ---------- */
const msg = $('msg');
f.addEventListener('input', (e) => e.target.classList.remove('invalid'));
f.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.className = 'msg';
    const v = el.password.value;
    const fail = (field, t) => { field.classList.add('invalid'); field.focus(); msg.textContent = t; };
    if (el.name.value.trim().length < 2) return fail(el.name, 'نام را وارد کنید.');
    if (!el.email.value || !el.email.validity.valid) return fail(el.email, 'ایمیل معتبر نیست.');
    if (v.length < 8 || !/\d/.test(v)) return fail(el.password, 'رمز باید حداقل ۸ کاراکتر و شامل عدد باشد.');

    // اینجا اطلاعات را با fetch به بک‌اند خودت بفرست
    inner.classList.remove('flip');
    $('stamp').classList.add('on');
    msg.classList.add('ok');
    msg.textContent = 'کارت عضویتت صادر شد 🎉';
});