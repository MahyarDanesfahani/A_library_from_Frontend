const f = document.getElementById('f');
const el = f.elements;
const $ = (id) => document.getElementById(id);
const norm = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const CITIES = { تهران: 'THR', مشهد: 'MHD', شیراز: 'SYZ', اصفهان: 'IFN', تبریز: 'TBZ', اهواز: 'AWZ', رشت: 'RAS', کرمان: 'KER' };

[el.from, el.to].forEach((s) => Object.keys(CITIES).forEach((c) => s.add(new Option(c, c))));
el.from.value = 'تهران';
el.to.value = 'مشهد';

/* ---------- بارکد از روی اطلاعات ساخته می‌شود ---------- */
function barcode(seed) {
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const box = $('bars');
    box.replaceChildren();
    for (let i = 0; i < 30; i++) {
        h = (h * 1664525 + 1013904223) >>> 0;
        const b = document.createElement('i');
        b.style.width = 1 + ((h >>> 28) % 4) + 'px';
        box.appendChild(b);
    }
}
function updateStub() {
    $('codes').textContent = `${CITIES[el.from.value]} → ${CITIES[el.to.value]}`;
    $('pn').textContent = el.name.value.trim() || 'نام مسافر';
    barcode([el.name.value, el.nid.value, el.phone.value, el.from.value, el.to.value].join('|'));
}
f.addEventListener('input', (e) => { e.target.classList.remove('invalid'); updateStub(); });

/* ---------- نوع سفر و وسیله‌ی متحرک ---------- */
document.querySelectorAll('#modes button').forEach((b) =>
    b.addEventListener('click', () => {
        document.querySelectorAll('#modes button').forEach((x) => x.setAttribute('aria-checked', x === b));
        $('veh').textContent = b.dataset.e;
        $('veh').classList.toggle('plane', b.dataset.e === '✈️');
    })
);

/* ---------- جابجایی مبدأ و مقصد ---------- */
let turns = 0;
$('swap').addEventListener('click', () => {
    [el.from.value, el.to.value] = [el.to.value, el.from.value];
    $('swap').style.transform = `rotate(${++turns * 180}deg)`;
    document.querySelector('.road').classList.toggle('rev', turns % 2 === 1);
    updateStub();
});

/* ---------- کد ملی ---------- */
function validNID(c) {
    if (!/^\d{10}$/.test(c) || /^(\d)\1{9}$/.test(c)) return false;
    let s = 0;
    for (let i = 0; i < 9; i++) s += +c[i] * (10 - i);
    const r = s % 11;
    return r < 2 ? +c[9] === r : +c[9] === 11 - r;
}

f.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = $('msg');
    msg.className = 'msg';
    const fail = (field, t) => {
        field?.classList.add('invalid'); field?.focus(); msg.textContent = t;
        f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
    };
    const v = el.password.value;
    if (el.name.value.trim().length < 2) return fail(el.name, 'نام مسافر را وارد کنید.');
    if (!validNID(norm(el.nid.value.trim()))) return fail(el.nid, 'کد ملی معتبر نیست.');
    if (!/^09\d{9}$/.test(norm(el.phone.value.trim()))) return fail(el.phone, 'شماره موبایل معتبر نیست.');
    if (v.length < 8 || !/\d/.test(v)) return fail(el.password, 'رمز باید حداقل ۸ کاراکتر و شامل عدد باشد.');
    if (el.from.value === el.to.value) return fail(el.to, 'مبدأ و مقصد نباید یکی باشند.');
    if (!el.terms.checked) return fail(null, 'پذیرش قوانین الزامی است.');

    // اینجا اطلاعات را با fetch به بک‌اند خودت بفرست
    $('seat').textContent = Math.ceil(Math.random() * 24) + 'ABCD'[Math.floor(Math.random() * 4)];
    f.classList.add('issued');
    msg.classList.add('ok');
    msg.textContent = 'کارت مسافر شما صادر شد. سفر خوبی داشته باشید! 🎉';
});
updateStub();