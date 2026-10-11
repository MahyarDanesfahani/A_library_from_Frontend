const nav = document.getElementById('nav');
const bar = document.getElementById('progress');
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

// نوار مطالعه + کوچک شدن نوبار هنگام اسکرول
function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    nav.classList.toggle('small', scrollY > 20);
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// منوهای کشویی
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
});
document.addEventListener('click', closeAll);
addEventListener('keydown', (e) => e.key === 'Escape' && closeAll());

// منوی موبایل
burger.addEventListener('click', () => {
    const open = menu.classList.toggle('show');
    burger.setAttribute('aria-expanded', open);
});