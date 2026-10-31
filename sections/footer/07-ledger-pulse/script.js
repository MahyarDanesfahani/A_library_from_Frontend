const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fa = (n, dec = 0) => Number(n).toLocaleString('fa-IR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const norm = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٬،,\s]/g, '').replace(/٫/g, '.');

/* ---------- شمارنده‌های آماری و نمودار (وقتی فوتر دیده شد) ---------- */
const ft = $('ft');
function countUp() {
    document.querySelectorAll('#stats b').forEach((el) => {
        const target = +el.dataset.n, dec = +(el.dataset.d || 0), suf = el.dataset.s || '';
        if (reduced) { el.textContent = fa(target, dec) + suf; return; }
        const t0 = performance.now();
        (function step(t) {
            const p = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - p, 3);
            el.textContent = fa(target * e, dec) + suf;
            if (p < 1) requestAnimationFrame(step);
        })(t0);
    });
}
const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    ft.classList.add('seen');
    countUp();
    io.disconnect();
}, { threshold: 0.2 });
io.observe(ft);

/* ---------- ماشین‌حساب مالیات ---------- */
let mode = 'add';
function vat() {
    const a = parseFloat(norm($('amt').value));
    const r = parseFloat(norm($('rate').value));
    if (!(a >= 0) || !(r >= 0) || isNaN(a) || isNaN(r)) { ['base', 'tax', 'total'].forEach((k) => ($(k).textContent = '-')); return; }
    let base, tax, total;
    if (mode === 'add') { base = a; tax = a * r / 100; total = base + tax; }
    else { total = a; base = a / (1 + r / 100); tax = total - base; }
    $('base').textContent = fa(Math.round(base));
    $('tax').textContent = fa(Math.round(tax));
    $('total').textContent = fa(Math.round(total));
}
$('amt').addEventListener('input', () => {
    const n = norm($('amt').value);
    if (/^\d+$/.test(n)) $('amt').value = fa(+n);   // جداکننده‌ی هزارگان
    vat();
});
$('rate').addEventListener('input', vat);
document.querySelectorAll('#mode button').forEach((b) =>
    b.addEventListener('click', () => {
        mode = b.dataset.m;
        document.querySelectorAll('#mode button').forEach((x) => x.setAttribute('aria-checked', x === b));
        vat();
    })
);
$('vat').addEventListener('submit', (e) => e.preventDefault());

/* ---------- تقویم مالی ---------- */
$('news').addEventListener('submit', (e) => {
    e.preventDefault();
    const em = $('em'), msg = $('msg');
    msg.className = '';
    em.classList.remove('invalid');
    if (!/^\S+@\S+\.\S+$/.test(em.value.trim())) { em.classList.add('invalid'); msg.textContent = 'ایمیل معتبر نیست.'; return; }
    // اینجا ایمیل را با fetch به بک‌اند خودت بفرست
    msg.className = 'ok';
    msg.textContent = 'ثبت شد ✓ تقویم مهلت‌های مالی برایت ارسال می‌شود.';
});

$('cp').textContent = `© ${new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} حساب‌یار | تمامی حقوق محفوظ است`;
$('up').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));