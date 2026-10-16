const f = document.getElementById('f');
const el = f.elements;
const pre = document.getElementById('json');
const out = document.getElementById('out');
const st = document.getElementById('st');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stack = new Set();

/* ---------- پیش‌نمایش زنده‌ی JSON با رنگ‌بندی (همه با textContent) ---------- */
const t = (c, x) => { const s = document.createElement('span'); s.className = c; s.textContent = x; return s; };

function draw() {
    const pw = el.password.value;
    const arr = document.createElement('span');
    arr.append(t('p', '['));
    [...stack].forEach((k, i) => arr.append(i ? t('p', ', ') : '', t('s', `"${k}"`)));
    arr.append(t('p', ']'));

    const rows = [
        ['name', t('s', `"${el.name.value.trim()}"`)],
        ['email', t('s', `"${el.email.value.trim()}"`)],
        ['password', t('s', `"${'•'.repeat(Math.min(pw.length, 16))}"`)],
        ['stack', arr],
        ['newsletter', t('b', String(el.news.checked))],
    ];
    pre.replaceChildren(t('p', '{'), '\n');
    rows.forEach(([k, v], i) => pre.append('  ', t('k', `"${k}"`), t('p', ': '), v, t('p', i < rows.length - 1 ? ',' : ''), '\n'));
    pre.append(t('p', '}'));
}

/* ---------- قدرت رمز به شکل نوار متنی ---------- */
function score(v) {
    return [v.length >= 8, /\d/.test(v), /[a-z]/.test(v) && /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
}
function strength() {
    const v = el.password.value, s = v ? Math.max(1, score(v)) : 0;
    const box = document.getElementById('strength');
    box.className = 'strength' + (s ? ' l' + s : '');
    box.firstChild.textContent = `[${'#'.repeat(s * 2)}${'.'.repeat(8 - s * 2)}] `;
    box.lastElementChild.textContent = ['-', 'weak', 'ok', 'good', 'strong'][s];
}

f.addEventListener('input', () => { draw(); strength(); });
f.addEventListener('change', draw);
document.querySelectorAll('.tg').forEach((b) =>
    b.addEventListener('click', () => {
        const on = !stack.has(b.dataset.k);
        on ? stack.add(b.dataset.k) : stack.delete(b.dataset.k);
        b.setAttribute('aria-pressed', on);
        draw();
    })
);
f.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); f.requestSubmit(); }
});

/* ---------- اجرا: خروجی شبیه ترمینال ---------- */
function line(text, cls = '') {
    const d = document.createElement('div');
    d.className = cls;
    d.textContent = text;
    out.appendChild(d);
}

f.addEventListener('submit', async (e) => {
    e.preventDefault();
    out.replaceChildren();
    const v = el.password.value;
    const errs = [];
    if (el.name.value.trim().length < 2) errs.push('--name: حداقل ۲ کاراکتر');
    if (!el.email.value || !el.email.validity.valid) errs.push('--email: ایمیل معتبر نیست');
    if (v.length < 8 || !/\d/.test(v)) errs.push('--password: حداقل ۸ کاراکتر و یک عدد');
    if (errs.length) {
        line('$ register --new', 'dm');
        errs.forEach((x) => line('✖ error ' + x, 'er'));
        line('exit code 1', 'dm');
        st.textContent = 'خطا';
        return;
    }

    const btn = f.querySelector('.run');
    btn.disabled = true;
    st.textContent = 'در حال اجرا...';
    line('$ register --new', 'dm');
    for (const step of ['validating input', 'hashing password', 'creating account']) {
        await sleep(500);
        line('✔ ' + step, 'ok');
    }
    // اینجا اطلاعات را با fetch به بک‌اند خودت بفرست (رمز را فقط روی HTTPS)
    await sleep(400);
    line(`[########] 100%`, 'ok');
    line(`Welcome, ${el.name.value.trim()}! 🎉`, 'ok');
    line('exit code 0', 'dm');
    st.textContent = 'موفق ✓';
    btn.disabled = false;
});

draw();
strength();