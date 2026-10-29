const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- کنترل پخش موج ---------- */
$('play').addEventListener('click', () => {
    const active = $('play').classList.toggle('active');
    $('play').textContent = active ? 'Ⅱ توقف موج' : '▶ پخش موج زنده';
    $('status').textContent = active ? '● در حال پخش: صدای باران و شهر' : 'امشب: «شهر بعد از باران»';
});

/* ---------- تنظیم فرکانس رادیو ---------- */
$('tune').addEventListener('input', (e) => {
    $('freq').textContent = (88 + e.target.value * .2).toFixed(1) + ' FM';
});

/* ---------- بازگشت به بالا ---------- */
$('top').addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
