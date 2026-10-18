const f = document.getElementById('f');
const el = f.elements;
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fa = (n) => n.toLocaleString('fa-IR');
let dest = '';

/* ---------- ستاره‌ها ---------- */
for (let i = 0; i < 70; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = -Math.random() * 3 + 's';
    $('stars').appendChild(s);
}

/* ---------- مقصد ---------- */
document.querySelectorAll('#dest button').forEach((b) =>
    b.addEventListener('click', () => {
        dest = b.dataset.d;
        document.querySelectorAll('#dest button').forEach((x) => x.setAttribute('aria-checked', x === b));
        update();
    })
);

/* ---------- هر مرحله‌ی درست، سوخت موشک را بیشتر می‌کند ---------- */
function state() {
    const v = el.password.value;
    return [
        el.name.value.trim().length >= 2,
        !!el.email.value && el.email.validity.valid,
        v.length >= 8 && /\d/.test(v),
        !!el.pass2.value && el.pass2.value === v,
        !!dest,
    ];
}
function update() {
    const s = state();
    const n = s.filter(Boolean).length;
    document.querySelectorAll('#mis li').forEach((li, i) => li.classList.toggle('ok', s[i]));
    $('rocket').style.setProperty('--f', n / 5);
    $('rocket').classList.toggle('ready', n === 5);
    $('gfill').style.width = (n / 5) * 100 + '%';
    $('glabel').textContent = `سوخت: ${fa(n * 20)}٪`;
    $('go').disabled = n < 5;
}
f.addEventListener('input', update);

/* ---------- شمارش معکوس و پرتاب ---------- */
f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (state().includes(false)) return;
    $('go').disabled = true;
    const cd = $('cd');
    for (const n of ['۳', '۲', '۱']) {
        cd.textContent = n;
        cd.classList.remove('tick'); void cd.offsetWidth; cd.classList.add('tick');
        await sleep(900);
    }
    cd.textContent = '🚀';
    document.body.classList.add('launch');
    // اینجا اطلاعات را با fetch به بک‌اند خودت بفرست
    await sleep(2600);
    cd.textContent = '';
    f.hidden = true;
    $('dmsg').textContent = `${el.name.value.trim()}، به مقصد ${dest} خوش آمدی!`;
    $('done').hidden = false;
});

$('again').addEventListener('click', () => {
    document.body.classList.remove('launch');
    f.reset(); dest = '';
    document.querySelectorAll('#dest button').forEach((x) => x.setAttribute('aria-checked', 'false'));
    $('done').hidden = true;
    f.hidden = false;
    update();
});
update();