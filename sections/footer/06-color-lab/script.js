const ft = document.getElementById('ft');
const $ = (id) => document.getElementById(id);
const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
const norm = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[٫،,]/g, '.');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = [['گل‌سرخ', '#FF4D6D'], ['زرد خردلی', '#FFB703'], ['سبز زمردی', '#06D6A0'], ['آبی اقیانوسی', '#118AB2'], ['بنفش شاهانه', '#8338EC'], ['صورتی شکوفه', '#F15BB5']];

/* ---------- قطره‌های رنگ ---------- */
for (let i = 0; i < 16; i++) {
    const d = document.createElement('i');
    d.className = 'dr';
    d.style.left = 3 + (i / 16) * 94 + Math.random() * 3 + '%';
    d.style.setProperty('--k', COLORS[i % COLORS.length][1]);
    d.style.setProperty('--h', 18 + Math.random() * 34 + 'px');
    d.style.setProperty('--d', 3 + Math.random() * 4 + 's');
    d.style.animationDelay = -Math.random() * 4 + 's';
    $('drips').appendChild(d);
}

/* ---------- حباب‌های رزین ---------- */
for (let i = 0; i < 22; i++) {
    const b = document.createElement('i');
    const s = 4 + Math.random() * 9;
    b.className = 'bub';
    b.style.cssText = `left:${Math.random() * 100}%;width:${s}px;height:${s}px;--d:${3 + Math.random() * 4}s;animation-delay:${-Math.random() * 6}s`;
    $('resin').appendChild(b);
}

/* ---------- انتخاب رنگ: تم کل فوتر عوض می‌شود ---------- */
COLORS.forEach(([name, hex], i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', i === 0);
    b.setAttribute('aria-label', name);
    b.style.setProperty('--k', hex);
    b.addEventListener('click', () => {
        [...$('sw').children].forEach((x) => x.setAttribute('aria-checked', x === b));
        ft.style.setProperty('--c', hex);
        $('cname').textContent = name;
        $('hx').textContent = hex;
    });
    $('sw').appendChild(b);
});
$('hex').addEventListener('click', async () => {
    const small = $('hex').querySelector('small');
    try { await navigator.clipboard.writeText($('hx').textContent); small.textContent = 'کپی شد ✓'; }
    catch (_) { small.textContent = 'کپی نشد'; }
    setTimeout(() => (small.textContent = 'کپی کد رنگ'), 1600);
});

/* ---------- محاسبه‌گر مقدار رنگ ---------- */
const COVERAGE = 10; // مترمربع در هر لیتر (مقدار نمونه؛ طبق محصول خودت تنظیم کن)
function calc() {
    const area = parseFloat(norm($('area').value));
    if (!area || area <= 0) { $('res').textContent = 'مساحت را وارد کن'; return; }
    const liters = Math.ceil((area * +$('coats').value / COVERAGE) * 10) / 10;
    $('res').textContent = `حدود ${fa(liters)} لیتر ≈ ${fa(Math.ceil(liters / 4))} گالن ۴ لیتری`;
}
$('area').addEventListener('input', calc);
$('coats').addEventListener('change', calc);
$('calc').addEventListener('submit', (e) => e.preventDefault());

$('cp').textContent = `© ${new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} رنگین‌رزین | تمامی حقوق محفوظ است`;
$('up').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));