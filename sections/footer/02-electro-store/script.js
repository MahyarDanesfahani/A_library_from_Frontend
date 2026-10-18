const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- سال و دکمه‌ی بازگشت به بالا ---------- */
$('cp').textContent = `© ${new Date().toLocaleDateString('fa-IR', { year: 'numeric' })} برق‌یار | تمامی حقوق محفوظ است`;
$('up').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

/* ---------- کپی شماره تلفن ---------- */
$('copy').addEventListener('click', async () => {
    const b = $('copy');
    try { await navigator.clipboard.writeText($('phone').textContent); b.textContent = 'کپی شد ✓'; }
    catch (_) { b.textContent = 'کپی نشد'; }
    setTimeout(() => (b.textContent = 'کپی'), 1600);
});

/* ---------- وضعیت باز یا بسته (شنبه تا چهارشنبه ۹ تا ۱۸، پنجشنبه ۹ تا ۱۳) ---------- */
function hours() {
    const d = new Date(), day = d.getDay(), h = d.getHours();
    const open = ([6, 0, 1, 2, 3].includes(day) && h >= 9 && h < 18) || (day === 4 && h >= 9 && h < 13);
    $('st').classList.toggle('open', open);
    $('stt').textContent = open ? 'اکنون باز است' : 'اکنون بسته است (شنبه تا چهارشنبه ۹ تا ۱۸)';
}
hours(); setInterval(hours, 60000);

/* ---------- شارژ باتری با ایمیل ---------- */
const cells = [...$('batt').children];
$('cf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const em = $('em'), msg = $('msg');
    msg.className = 'msg';
    em.classList.remove('invalid');
    if (!/^\S+@\S+\.\S+$/.test(em.value.trim())) {
        em.classList.add('invalid');
        msg.textContent = 'ایمیل معتبر نیست.';
        return;
    }
    msg.textContent = '';
    $('chg').disabled = true;
    cells.forEach((c) => c.classList.remove('on'));
    // اینجا ایمیل را با fetch به بک‌اند خودت بفرست و کد تخفیف واقعی را از سرور بگیر
    for (const c of cells) { c.classList.add('on'); if (!reduced) await sleep(280); }
    const code = 'BARQ-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    msg.classList.add('ok');
    msg.replaceChildren('شارژ کامل شد! کد تخفیف: ');
    const b = document.createElement('b');
    b.textContent = code;
    msg.appendChild(b);
    $('chg').disabled = false;
});