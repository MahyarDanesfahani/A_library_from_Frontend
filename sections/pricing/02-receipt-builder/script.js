const $ = (id) => document.getElementById(id);
const fa = (n) => Math.round(n).toLocaleString('fa-IR');
const ADDONS = { report: ['گزارش‌های پیشرفته', 120000], api: ['دسترسی API', 180000], brand: ['برند سفارشی', 90000], sso: ['ورود یکپارچه SSO', 250000] };
const STORE = { 10: 0, 50: 90000, 200: 290000 };
const SUP = { email: ['پشتیبانی ایمیلی', 0], chat: ['پشتیبانی چت زنده', 150000], phone: ['پشتیبانی تلفنی ۲۴ ساعته', 450000] };
const USER_PRICE = 49000;                       // همه‌ی قیمت‌ها نمونه‌اند
const s = { users: 3, store: '10', sup: 'email', adds: new Set(), yearly: false };
let seen = new Set();

$('meta').textContent = `شماره ${fa(100000 + Math.random() * 899999).replace(/٬/g, '')} | ${new Date().toLocaleDateString('fa-IR')}`;

function bars() {                                 // بارکد تزئینی از روی انتخاب‌ها
    let h = 7;
    for (const c of JSON.stringify([s.users, s.store, s.sup, [...s.adds], s.yearly])) h = (h * 33 + c.charCodeAt(0)) >>> 0;
    const box = $('bars');
    box.replaceChildren();
    for (let i = 0; i < 34; i++) {
        h = (h * 1664525 + 1013904223) >>> 0;
        const b = document.createElement('i');
        b.style.width = 1 + ((h >>> 28) % 4) + 'px';
        box.appendChild(b);
    }
}

function render() {
    const lines = [[`users`, `${fa(s.users)} کاربر`, `${fa(USER_PRICE)} × ${fa(s.users)}`, USER_PRICE * s.users]];
    if (STORE[s.store]) lines.push(['store', `فضای ${fa(s.store)} گیگابایت`, '', STORE[s.store]]);
    if (SUP[s.sup][1]) lines.push(['sup' + s.sup, SUP[s.sup][0], '', SUP[s.sup][1]]);
    s.adds.forEach((k) => lines.push(['add' + k, ADDONS[k][0], '', ADDONS[k][1]]));

    const ul = $('lines');
    ul.replaceChildren();
    const now = new Set();
    let sub = 0;
    lines.forEach(([key, name, detail, amt]) => {
        sub += amt;
        now.add(key);
        const li = document.createElement('li');
        if (!seen.has(key)) li.className = 'new';
        const l = document.createElement('span');
        l.textContent = name;
        if (detail) { const d = document.createElement('small'); d.textContent = detail; l.appendChild(d); }
        const r = document.createElement('b');
        r.textContent = fa(amt);
        li.append(l, r);
        ul.appendChild(li);
    });
    seen = now;

    const disc = s.yearly ? sub * 12 * 0.2 : 0;
    const total = s.yearly ? sub * 12 - disc : sub;
    $('sub').textContent = fa(sub) + ' تومان';
    $('dRow').hidden = !s.yearly;
    $('dis').textContent = '− ' + fa(disc);
    $('tl').textContent = s.yearly ? 'قابل پرداخت (۱۲ ماه)' : 'قابل پرداخت (ماهانه)';
    $('tot').textContent = fa(total) + ' تومان';
    $('eq').textContent = s.yearly ? `معادل ماهی ${fa(total / 12)} تومان` : '';
    bars();
    // با هر تغییر، رسید دوباره پرداخت‌نشده می‌شود
    $('paper').classList.remove('paid');
    $('pay').disabled = false;
    $('pay').textContent = 'پرداخت';
}

function seg(id, fn) {
    document.querySelectorAll(`#${id} button`).forEach((b) =>
        b.addEventListener('click', () => {
            document.querySelectorAll(`#${id} button`).forEach((x) => x.setAttribute('aria-checked', x === b));
            fn(b.dataset);
            render();
        })
    );
}
seg('bill', (d) => (s.yearly = d.y === '1'));
seg('store', (d) => (s.store = d.v));
seg('sup', (d) => (s.sup = d.v));
document.querySelectorAll('#adds input').forEach((c) =>
    c.addEventListener('change', () => { c.checked ? s.adds.add(c.dataset.k) : s.adds.delete(c.dataset.k); render(); })
);
$('minus').addEventListener('click', () => { s.users = Math.max(1, s.users - 1); $('uc').textContent = fa(s.users); render(); });
$('plus').addEventListener('click', () => { s.users = Math.min(200, s.users + 1); $('uc').textContent = fa(s.users); render(); });

$('pay').addEventListener('click', () => {
    // اینجا کاربر را به درگاه پرداخت واقعی هدایت کن
    $('paper').classList.add('paid');
    $('pay').disabled = true;
    $('pay').textContent = 'پرداخت شد ✓';
});
$('uc').textContent = fa(s.users);
render();