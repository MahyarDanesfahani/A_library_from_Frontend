const $ = (id) => document.getElementById(id);
const fa = (n) => Math.round(n).toLocaleString('fa-IR');
const PLANS = [['رایگان', 0], ['حرفه‌ای', 299000], ['سازمانی', 999000]];   // قیمت‌ها نمونه‌اند
const REC = 1;                                                              // ستون محبوب (حرفه‌ای)
const Y = true, N = false;
const DATA = [
    ['عمومی', [
        ['تعداد کاربر', ['۳ نفر', '۲۵ نفر', 'نامحدود']],
        ['تعداد پروژه', ['۵', '۵۰', 'نامحدود']],
        ['فضای ذخیره‌سازی', ['۱ گیگابایت', '۵۰ گیگابایت', '۵۰۰ گیگابایت']],
    ]],
    ['همکاری', [
        ['کامنت و منشن', [Y, Y, Y]],
        ['نقش‌ها و سطح دسترسی', [N, Y, Y]],
        ['ورود یکپارچه (SSO)', [N, N, Y]],
    ]],
    ['امنیت', [
        ['رمزنگاری انتقال داده', [Y, Y, Y]],
        ['پشتیبان‌گیری', ['هفتگی', 'روزانه', 'ساعتی']],
        ['گزارش ممیزی', [N, N, Y]],
    ]],
    ['پشتیبانی', [
        ['پشتیبانی ایمیلی', [Y, Y, Y]],
        ['چت زنده', [N, Y, Y]],
        ['مدیر حساب اختصاصی', [N, N, Y]],
    ]],
];
let yearly = false;
const tbl = $('tbl');

function cell(tag, content, col, cls = '') {
    const c = document.createElement(tag);
    if (col !== undefined) { c.dataset.c = col; if (col === REC) c.classList.add('rec-col'); }
    if (cls) c.className += ' ' + cls;
    if (content instanceof Node) c.appendChild(content); else if (content !== null) c.textContent = content;
    return c;
}

function build() {
    tbl.replaceChildren();
    // ردیف سرتیتر: نام، قیمت و دکمه‌ی هر پلن
    const head = tbl.createTHead().insertRow();
    head.appendChild(cell('th', '', undefined));
    PLANS.forEach(([name, price], i) => {
        const th = cell('th', null, i, i === REC ? 'rec' : '');
        const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = name;
        const pr = document.createElement('span'); pr.className = 'pr'; pr.id = 'pr' + i;
        const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'cta'; btn.textContent = price ? 'انتخاب پلن' : 'شروع رایگان';
        btn.addEventListener('click', () => {
            // اینجا کاربر را به ثبت‌نام یا پرداخت ببر
            $('msg').textContent = `پلن «${name}» (${yearly ? 'سالانه' : 'ماهانه'}) انتخاب شد ✓`;
        });
        th.append(nm, pr, btn);
        head.appendChild(th);
    });

    // بدنه: هر دسته یک ردیف عنوان و چند ردیف ویژگی دارد
    DATA.forEach(([cat, rows]) => {
        const body = tbl.createTBody();
        const hr = body.insertRow();
        hr.className = 'cat';
        const th = document.createElement('th');
        th.colSpan = 4;
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = cat; b.setAttribute('aria-expanded', 'true');
        th.appendChild(b); hr.appendChild(th);
        const els = rows.map(([label, vals]) => {
            const tr = body.insertRow();
            tr.className = 'row';
            if (vals.every((v) => v === vals[0])) tr.dataset.same = '1';     // همه‌ی پلن‌ها یکسان
            tr.appendChild(cell('th', label, undefined, 'lbl'));
            tr.firstChild.scope = 'row'; tr.firstChild.style.fontWeight = '500';
            vals.forEach((v, i) => {
                const td = cell('td', typeof v === 'boolean' ? (v ? '✓' : '—') : v, i, typeof v === 'boolean' ? (v ? 'y' : 'n') : '');
                tr.appendChild(td);
            });
            return tr;
        });
        b.addEventListener('click', () => {
            const closed = hr.classList.toggle('closed');
            b.setAttribute('aria-expanded', String(!closed));
            els.forEach((r) => r.classList.toggle('hide', closed));
        });
    });
    prices();
    diff();
}

function prices() {
    PLANS.forEach(([, price], i) => {
        const el = $('pr' + i);
        el.replaceChildren();
        const p = price * (yearly ? 0.8 : 1);
        el.append(price ? fa(p) : 'رایگان');
        if (price) { const s = document.createElement('small'); s.textContent = ' تومان / ماه'; el.appendChild(s); }
    });
}
function diff() { tbl.querySelectorAll('tr.row').forEach((r) => r.classList.toggle('dsame', $('diff').checked && r.dataset.same === '1')); }

$('diff').addEventListener('change', diff);
document.querySelectorAll('#bill button').forEach((b) =>
    b.addEventListener('click', () => {
        yearly = b.dataset.y === '1';
        document.querySelectorAll('#bill button').forEach((x) => x.setAttribute('aria-checked', x === b));
        prices();
    })
);

// برجسته شدن ستونی که موس روی آن است
tbl.addEventListener('pointerover', (e) => {
    const c = e.target.closest('[data-c]');
    tbl.querySelectorAll('.hl').forEach((x) => x.classList.remove('hl'));
    if (c) tbl.querySelectorAll(`[data-c="${c.dataset.c}"]`).forEach((x) => x.classList.add('hl'));
});
tbl.addEventListener('pointerleave', () => tbl.querySelectorAll('.hl').forEach((x) => x.classList.remove('hl')));

build();