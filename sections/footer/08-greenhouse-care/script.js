const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- علف‌ها ---------- */
for (let i = 0; i < 70; i++) {
    const b = document.createElement('i');
    b.className = 'blade';
    b.style.left = (i / 70) * 100 + Math.random() * 1.2 + '%';
    b.style.height = 14 + Math.random() * 20 + 'px';
    b.style.setProperty('--d', 2 + Math.random() * 3 + 's');
    b.style.animationDelay = -Math.random() * 3 + 's';
    $('grass').appendChild(b);
}

/* ---------- رشد گیاه: هر بار آب دادن یک مرحله ---------- */
const STAGES = ['دانه‌ای در خاک 🌱', 'جوانه زد!', 'برگ درآورد 🍃', 'قد کشید 🌿', 'شکوفه داد 🌸'];
let stage = 0;
function setStage(n) {
    stage = n;
    $('plant').setAttribute('class', 's' + n);
    $('stage').textContent = STAGES[n];
    [...$('pg').children].forEach((d, i) => d.classList.toggle('on', i < n));
    $('wbtn').textContent = n === 4 ? '🌱 دوباره بکار' : '💧 آب بده';
}

// چند قطره‌ی آب از دکمه به سمت گیاه می‌افتد
function drops() {
    if (reduced) return;
    const r = $('wbtn').getBoundingClientRect();
    const p = $('plant').getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
        const d = document.createElement('i');
        d.className = 'drop';
        d.style.left = p.left + p.width / 2 + (Math.random() - 0.5) * 50 + 'px';
        d.style.top = p.top - 30 - Math.random() * 20 + 'px';
        d.style.setProperty('--dy', 60 + Math.random() * 20 + 'px');
        d.style.animationDelay = i * 0.07 + 's';
        document.body.appendChild(d);
        d.addEventListener('animationend', () => d.remove());
    }
}
$('wbtn').addEventListener('click', () => {
    if (stage === 4) return setStage(0);
    drops();
    setStage(stage + 1);
});

/* ---------- نکته‌ی امروز ---------- */
const TIPS = [
    'گیاه آپارتمانی را وقتی آب بده که دو انگشت اول خاک خشک شده باشد؛ آبیاری زیاد از کم‌آبی بدتر است.',
    'برگ‌های گرد و خاکی نمی‌توانند خوب نور بگیرند. هر دو هفته یک بار با پارچه‌ی نمدار پاکشان کن.',
    'کاکتوس‌ها نور زیاد و آب کم می‌خواهند. در زمستان تقریباً آبیاری را قطع کن.',
    'گلدان باید سوراخ زهکشی داشته باشد؛ ماندن آب ته گلدان ریشه را می‌پوساند.',
    'گیاه را کم‌کم به نور شدید عادت بده تا برگ‌هایش نسوزد.',
];
let ti = Math.floor(Math.random() * TIPS.length);
const showTip = () => ($('tip').textContent = TIPS[ti]);
$('next').addEventListener('click', () => { ti = (ti + 1) % TIPS.length; showTip(); });
showTip();

/* ---------- کاشتن دانه با ایمیل: گیاه کامل می‌شود ---------- */
$('seed').addEventListener('submit', async (e) => {
    e.preventDefault();
    const em = $('em'), msg = $('msg');
    msg.className = 'msg';
    em.classList.remove('invalid');
    if (!/^\S+@\S+\.\S+$/.test(em.value.trim())) { em.classList.add('invalid'); msg.textContent = 'ایمیل معتبر نیست.'; return; }
    msg.textContent = '';
    // اینجا ایمیل را با fetch به بک‌اند خودت بفرست
    setStage(0);
    for (let n = 1; n <= 4; n++) { await sleep(reduced ? 0 : 450); setStage(n); }
    msg.classList.add('ok');
    msg.textContent = 'دانه‌ات کاشته شد 🌸 نکته‌های نگهداری هر هفته برایت می‌آید.';
});

$('cp').textContent = `© ${new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} سبزینه | تمامی حقوق محفوظ است`;
$('up').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
setStage(0);