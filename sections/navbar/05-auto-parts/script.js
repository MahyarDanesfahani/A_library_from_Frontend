const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
const ind = document.getElementById('ind');

/* ---------- نشانگر مورب لغزنده ---------- */
const links = [...menu.querySelectorAll(':scope > a, :scope > .dd > .dd-btn')];
function moveTo(el) {
    const l = el.parentElement.classList.contains('dd') ? el.parentElement : el;
    ind.style.left = l.offsetLeft + 'px';
    ind.style.width = l.offsetWidth + 'px';
}
const active = () => menu.querySelector('a.on');
links.forEach((el) => el.addEventListener('mouseenter', () => moveTo(el)));
menu.addEventListener('mouseleave', () => moveTo(active()));
addEventListener('resize', () => moveTo(active()));
moveTo(active());

/* ---------- منوهای کشویی ---------- */
function closeAll() {
    document.querySelectorAll('.dd').forEach((d) => {
        d.classList.remove('open');
        d.querySelector('.dd-btn').setAttribute('aria-expanded', 'false');
    });
}
document.querySelectorAll('.dd').forEach((d) => {
    const btn = d.querySelector('.dd-btn');
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = !d.classList.contains('open');
        closeAll();
        d.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
    });
    // کلیک روی فیلدهای داخل پنل، آن را نمی‌بندد
    d.querySelector('.panel').addEventListener('click', (e) => { if (!e.target.closest('a')) e.stopPropagation(); });
});
document.addEventListener('click', closeAll);
addEventListener('keydown', (e) => e.key === 'Escape' && closeAll());

burger.addEventListener('click', () => {
    const open = menu.classList.toggle('show');
    burger.setAttribute('aria-expanded', open);
    moveTo(active());
});

/* ---------- انتخاب خودرو (در مرورگر ذخیره می‌شود) ---------- */
const CARS = {
    'پژو': ['۲۰۶', '۴۰۵', 'پارس'], 'سمند': ['LX', 'EF7'], 'پراید': ['۱۱۱', '۱۳۱'],
    'تیبا': ['هاچ‌بک', 'سدان'], 'کیا': ['سراتو', 'اسپورتیج'], 'هیوندای': ['النترا', 'توسان'],
};
const brand = document.getElementById('brand');
const model = document.getElementById('model');
const vehBtn = document.getElementById('vehBtn');
const vehText = document.getElementById('vehText');

brand.innerHTML = '<option value="">انتخاب برند</option>' + Object.keys(CARS).map((b) => `<option>${b}</option>`).join('');
function fillModels(b, selected) {
    model.disabled = !b;
    model.innerHTML = '<option value="">انتخاب مدل</option>' + (CARS[b] || []).map((m) => `<option>${m}</option>`).join('');
    if (selected) model.value = selected;
}
brand.addEventListener('change', () => fillModels(brand.value));

function showVehicle(b, m) {
    vehText.textContent = b ? `${b} ${m}` : 'خودروی شما؟';
    vehBtn.classList.toggle('set', !!b);
}
document.getElementById('apply').addEventListener('click', () => {
    if (!brand.value || !model.value) return;
    showVehicle(brand.value, model.value);
    try { localStorage.setItem('vehicle', JSON.stringify([brand.value, model.value])); } catch (_) {}
    closeAll();
    // اینجا لیست قطعات را بر اساس خودرو فیلتر کن
});

try {
    const saved = JSON.parse(localStorage.getItem('vehicle') || 'null');
    if (saved) { brand.value = saved[0]; fillModels(saved[0], saved[1]); showVehicle(...saved); }
} catch (_) {}