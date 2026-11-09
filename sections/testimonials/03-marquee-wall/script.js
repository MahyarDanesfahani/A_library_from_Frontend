const $ = (id) => document.getElementById(id);
const fa = (n) => Number(n).toLocaleString('fa-IR');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#e8590c', '#3b82f6', '#8b5cf6', '#14b8a6', '#e0527a', '#f59e0b', '#16a34a'];

// نظرها و آمار نمونه هستند؛ با داده‌ی واقعی خودت جایگزین کن
const TAGS = [['all', 'همه'], ['store', 'فروشگاهی'], ['corp', 'شرکتی'], ['app', 'اپلیکیشن']];
const DIST = [168, 32, 7, 2, 1];   // تعداد نظر ۵ تا ۱ ستاره
const REV = [
    ['سارا احمدی', 'مدیر فروشگاه آنلاین', 5, 'store', 'فروشگاهمون رو تو دو هفته تحویل دادن و فروش ماه اول دو برابر شد. تیم فوق‌العاده‌ای هستن.'],
    ['امیر رضایی', 'مدیرعامل استارتاپ', 5, 'app', 'کدها تمیز و مستند بود و تیم خودمون بدون هیچ مشکلی ادامه‌ش داد. پشتیبانی بعد از تحویل هم عالی بود.'],
    ['مریم کاظمی', 'صاحب کلینیک', 4, 'corp', 'سامانه‌ی نوبت‌دهی خیلی ساده و روان کار می‌کنه. بیمارها هم از رزرو آنلاین تعریف می‌کنن.'],
    ['علی محمدی', 'مدیر ساختمان', 5, 'app', 'پنل شارژ و قبض، همه‌چیز رو شفاف کرد. دیگه سر حساب‌وکتاب هیچ اختلافی پیش نمیاد.'],
    ['نگار صادقی', 'مدیر بازاریابی', 5, 'corp', 'سایت جدیدمون هم زیباست هم سریع. نرخ تبدیل بازدیدکننده به مشتری تقریباً ۳۰٪ بالا رفت.'],
    ['حسین نوری', 'صاحب رستوران', 4, 'store', 'منوی دیجیتال و سفارش آنلاین، کار رستوران رو خیلی راحت‌تر کرد. مشتری‌ها استقبال کردن.'],
    ['زهرا موسوی', 'فروشنده‌ی صنایع دستی', 5, 'store', 'از اول تا آخر راهنمایی‌م کردن. حالا از سراسر کشور سفارش می‌گیرم، ممنون!'],
    ['کامران فرهادی', 'مدیر فنی شرکت', 5, 'corp', 'ارتباطشون حرفه‌ای بود و همه‌ی مهلت‌ها رو رعایت کردن. حتماً دوباره همکاری می‌کنیم.'],
    ['پریسا شفیعی', 'موسس اپلیکیشن آموزشی', 4, 'app', 'اپلیکیشن ما روی موبایل خیلی روان اجرا میشه و کاربرها از سرعتش راضی‌ان.'],
    ['بهرام عزیزی', 'صاحب فروشگاه لوازم برقی', 5, 'store', 'پنل مدیریت موجودی انبار کار ما رو نصف کرد. دیگه موجودی اشتباه نداریم.'],
    ['الهام نیک‌پور', 'مدیر منابع انسانی', 5, 'corp', 'سامانه‌ی جذب نیرو رو سفارشی برامون ساختن و کارمون سریع‌تر و منظم‌تر شد.'],
    ['رضا قاسمی', 'مدیر شرکت مسافربری', 4, 'app', 'سیستم رزرو آنلاین بلیت، فروش تلفنی ما رو خیلی کم کرد و مسافرها راضی‌ترن.'],
];
let cur = 'all';

/* ---------- خلاصه‌ی امتیاز با نوار متحرک ---------- */
const total = DIST.reduce((a, b) => a + b, 0);
$('avg').textContent = fa((DIST.reduce((s, c, i) => s + c * (5 - i), 0) / total).toFixed(1));
$('tot').textContent = `از ${fa(total)} نظر`;
DIST.forEach((c, i) => {
    const li = document.createElement('li');
    const n = document.createElement('span'); n.textContent = fa(5 - i);
    const tr = document.createElement('span'); tr.className = 'tr';
    const f = document.createElement('i'); f.dataset.w = (c / total) * 100 + '%'; tr.appendChild(f);
    const k = document.createElement('span'); k.textContent = fa(c);
    li.append(n, tr, k);
    $('bars').appendChild(li);
});
new IntersectionObserver(([e], io) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    $('bars').querySelectorAll('i').forEach((f) => (f.style.width = f.dataset.w));
}, { threshold: 0.3 }).observe($('bars'));

/* ---------- کارت و پنجره‌ی نظر کامل ---------- */
function card(r, i) {
    const [name, role, stars, , text] = r;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tc';
    b.setAttribute('aria-label', `نظر ${name}، برای مشاهده‌ی کامل بزنید`);
    const s = document.createElement('div'); s.className = 'stars'; s.textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);
    const q = document.createElement('p'); q.className = 'q'; q.textContent = text;
    const w = document.createElement('div'); w.className = 'who';
    const av = document.createElement('span'); av.className = 'av'; av.textContent = name[0]; av.style.setProperty('--c', COLORS[i % COLORS.length]);
    const d = document.createElement('div');
    const nm = document.createElement('b'); nm.textContent = name;
    const rl = document.createElement('small'); rl.textContent = role;
    d.append(nm, rl); w.append(av, d);
    const ok = document.createElement('span'); ok.className = 'ok'; ok.textContent = '✔ مشتری تأیید‌شده';
    b.append(s, q, w, ok);
    b.addEventListener('click', () => {
        $('dav').textContent = name[0]; $('dav').style.setProperty('--c', COLORS[i % COLORS.length]);
        $('dn').textContent = name; $('dr').textContent = role; $('ds').textContent = s.textContent; $('dt').textContent = text;
        $('dlg').showModal();
    });
    return b;
}
$('x').addEventListener('click', () => $('dlg').close());
$('dlg').addEventListener('click', (e) => {          // کلیک بیرون از پنجره آن را می‌بندد
    const r = $('dlg').getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('dlg').close();
});

/* ---------- ردیف‌های بی‌پایان (هر ردیف مجموعه را چند بار تکرار می‌کند) ---------- */
function build() {
    const list = REV.filter((r) => cur === 'all' || r[3] === cur);
    const half = Math.ceil(list.length / 2);
    const rowsData = list.length > 2 ? [list.slice(0, half), list.slice(half)] : [list];
    $('rows').replaceChildren();
    rowsData.forEach((items, ri) => {
        const row = document.createElement('div'); row.className = 'row' + (ri ? ' rev' : '');
        const track = document.createElement('div'); track.className = 'track';
        let k = 2;
        while (items.length * 326 * k < 2600) k += 2;      // تا ردیف خالی دیده نشود
        for (let n = 0; n < k; n++) items.forEach((r, i) => {
            const c = card(r, REV.indexOf(r));
            if (n > 0) { c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1; }
            track.appendChild(c);
        });
        track.style.setProperty('--d', (items.length * 326 * k) / 2 / 55 + 's');
        row.appendChild(track);
        $('rows').appendChild(row);
    });
}

TAGS.forEach(([k, label], i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', i === 0);
    b.addEventListener('click', () => {
        cur = k;
        [...$('chips').children].forEach((x) => x.setAttribute('aria-checked', x === b));
        build();
    });
    $('chips').appendChild(b);
});
build();