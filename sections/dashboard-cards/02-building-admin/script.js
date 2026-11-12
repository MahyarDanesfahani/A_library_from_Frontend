const $ = (id) => document.getElementById(id);
const fa = (n) => Math.round(n).toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

// همه‌ی داده‌ها نمونه هستند؛ با داده‌ی واقعی (API بک‌اند) جایگزین کن
const CHARGE = 1200000;                    // شارژ ماهانه‌ی هر واحد (تومان)
const FLOORS = 5, PER = 4;
const NAMES = ['احمدی', 'رضایی', 'کاظمی', 'محمدی', 'صادقی', 'نوری', 'موسوی', 'فرهادی', 'شفیعی', 'عزیزی', 'نیک‌پور', 'قاسمی', 'حیدری', 'جعفری', 'کریمی', 'اکبری', 'رحیمی', 'هاشمی', 'طاهری', 'سلیمانی'];
const STATUS = ['paid', 'paid', 'unpaid', 'paid', 'vacant', 'paid', 'unpaid', 'paid', 'paid', 'unpaid', 'paid', 'vacant', 'paid', 'unpaid', 'paid', 'paid', 'vacant', 'paid', 'unpaid', 'paid'];
const LABEL = { paid: 'پرداخت‌شده', unpaid: 'پرداخت‌نشده', vacant: 'خالی' };

const units = [];
for (let f = FLOORS; f >= 1; f--) for (let u = 1; u <= PER; u++) {
    const i = units.length;
    units.push({ no: f * 100 + u, floor: f, name: NAMES[i], status: STATUS[i] });
}
let sel = null, filter = 'all';

/* ---------- نقشه‌ی واحدها ---------- */
const facade = $('facade');
for (let f = FLOORS; f >= 1; f--) {
    const row = el('div', 'floor', ''); row.appendChild(el('span', '', `طبقه ${fa(f)}`));
    units.filter((u) => u.floor === f).forEach((u) => {
        const b = el('button', 'unit', fa(u.no)); b.type = 'button';
        b.addEventListener('click', () => select(u));
        u.el = b; row.appendChild(b);
    });
    facade.appendChild(row);
}

function select(u) {
    sel = u;
    units.forEach((x) => x.el.classList.toggle('on', x === u));
    const box = $('sel');
    box.replaceChildren();
    const row = el('div', 'row');
    const info = el('div'); info.append(el('b', '', `واحد ${fa(u.no)}`), el('small', '', u.status === 'vacant' ? 'بدون ساکن' : `خانواده‌ی ${u.name} | شارژ: ${fa(CHARGE)} تومان`));
    const st = el('span', 'st ' + u.status, LABEL[u.status]);
    row.append(info, st);
    if (u.status !== 'vacant') {
        const b = el('button', u.status === 'paid' ? 'undo' : '', u.status === 'paid' ? 'لغو پرداخت' : 'ثبت پرداخت');
        b.type = 'button';
        b.addEventListener('click', () => pay(u));
        row.appendChild(b);
    }
    box.appendChild(row);
}

function pay(u) {
    // اینجا تغییر وضعیت را با fetch به بک‌اند بفرست
    u.status = u.status === 'paid' ? 'unpaid' : 'paid';
    toast(u.status === 'paid' ? `پرداخت واحد ${fa(u.no)} ثبت شد ✓` : `پرداخت واحد ${fa(u.no)} لغو شد`);
    update();
    select(u);
    u.el.classList.remove('flash'); void u.el.offsetWidth; u.el.classList.add('flash');
}

/* ---------- فیلتر وضعیت ---------- */
document.querySelectorAll('#flt button').forEach((b) =>
    b.addEventListener('click', () => {
        filter = b.dataset.f;
        document.querySelectorAll('#flt button').forEach((x) => x.setAttribute('aria-checked', x === b));
        update();
    })
);

/* ---------- آمار، حلقه و فهرست بدهکاران ---------- */
function update() {
    units.forEach((u) => {
        u.el.className = 'unit ' + u.status + (u === sel ? ' on' : '') + (filter !== 'all' && u.status !== filter ? ' dim' : '');
        u.el.setAttribute('aria-label', `واحد ${fa(u.no)}، ${LABEL[u.status]}`);
    });
    const occ = units.filter((u) => u.status !== 'vacant'), paid = units.filter((u) => u.status === 'paid'), unpaid = units.filter((u) => u.status === 'unpaid');
    const pct = occ.length ? Math.round((paid.length / occ.length) * 100) : 0;

    const chips = $('stats'); chips.replaceChildren();
    [['کل واحدها', units.length], ['دارای ساکن', occ.length], ['خالی', units.length - occ.length]].forEach(([l, v]) => {
        const s = el('span', '', l + ': '); s.appendChild(el('b', '', fa(v))); chips.appendChild(s);
    });

    $('pct').textContent = fa(pct);
    $('ring').style.strokeDashoffset = 276.46 * (1 - pct / 100);
    $('ring').style.stroke = pct >= 70 ? 'var(--paid)' : pct >= 40 ? 'var(--amber)' : 'var(--unpaid)';
    $('amt').textContent = `وصول‌شده: ${fa(paid.length * CHARGE)} از ${fa(occ.length * CHARGE)} تومان`;

    const list = $('ulist'); list.replaceChildren();
    $('ucount').textContent = unpaid.length ? `(${fa(unpaid.length)} واحد)` : '';
    if (!unpaid.length) list.appendChild(el('li', 'empty', 'همه‌ی شارژها پرداخت شده 🎉'));
    unpaid.slice(0, 4).forEach((u) => {
        const li = el('li'); const d = el('div'); d.append(el('b', '', `واحد ${fa(u.no)}`), el('small', '', 'خانواده‌ی ' + u.name));
        const amt = el('b', '', fa(CHARGE)); const b = el('button', '', 'یادآوری'); b.type = 'button';
        b.addEventListener('click', () => toast(`پیامک یادآوری برای واحد ${fa(u.no)} ارسال شد (نمونه)`));
        li.append(d, amt, b); list.appendChild(li);
    });
    if (unpaid.length > 4) list.appendChild(el('li', '', `و ${fa(unpaid.length - 4)} واحد دیگر...`));
}

/* ---------- درخواست‌های تعمیر ---------- */
const REQ = { open: 5, prog: 3, done: 12 };
function reqs() {
    const t = REQ.open + REQ.prog + REQ.done;
    $('stk').querySelector('.o').style.width = (REQ.open / t) * 100 + '%';
    $('stk').querySelector('.p').style.width = (REQ.prog / t) * 100 + '%';
    $('stk').querySelector('.d').style.width = (REQ.done / t) * 100 + '%';
    const leg = $('leg'); leg.replaceChildren();
    [['باز', REQ.open, 'var(--unpaid)'], ['در حال انجام', REQ.prog, 'var(--amber)'], ['انجام‌شده', REQ.done, 'var(--paid)']].forEach(([l, v, c]) => {
        const li = el('li', '', l); li.style.setProperty('--c', c); li.appendChild(el('b', '', fa(v))); leg.appendChild(li);
    });
}
$('addReq').addEventListener('click', () => { REQ.open++; reqs(); toast('درخواست تعمیر جدید ثبت شد (نمونه)'); });

/* ---------- اطلاعیه‌ها (متن با textContent نمایش داده می‌شود) ---------- */
const NOTES = [['جلسه‌ی مجمع ساختمان، پنجشنبه ساعت ۱۸ در لابی', '۱ روز پیش'], ['قطع آب ساختمان فردا از ۹ تا ۱۲ برای تعمیر لوله‌کشی', '۲ روز پیش']];
function notes() {
    const l = $('nlist'); l.replaceChildren();
    NOTES.slice(0, 4).forEach(([t, d]) => { const li = el('li', '', t); li.appendChild(el('small', '', d)); l.appendChild(li); });
}
$('nform').addEventListener('submit', (e) => {
    e.preventDefault();
    const v = $('ntext').value.trim();
    if (!v) return;
    NOTES.unshift([v, 'همین الان']);
    $('ntext').value = '';
    notes();
});

/* ---------- پیام کوتاه ---------- */
let tt;
function toast(msg) {
    const t = $('toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2400);
}

update(); reqs(); notes();