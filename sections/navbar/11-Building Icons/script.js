const menu = document.getElementById('menu');
const S = (inner) => `<svg viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`;

// آیکون‌ها (کدهای ثابت خودمان هستند، نه ورودی کاربر)
const ICONS = {
    dash: S('<rect x="5" y="3" width="14" height="18" rx="1.5"/><g class="win"><rect x="8" y="6" width="2.6" height="2.6"/><rect x="13.4" y="6" width="2.6" height="2.6"/><rect x="8" y="11" width="2.6" height="2.6"/><rect x="13.4" y="11" width="2.6" height="2.6"/></g><path d="M10.5 21v-3.5h3V21"/>'),
    door: S('<rect x="5" y="3" width="14" height="18" rx="1"/><rect class="leaf" x="5" y="3" width="14" height="18" rx="1"/><circle cx="15.8" cy="12.5" r="1" fill="currentColor"/>'),
    bolt: S('<path class="bolt" d="M13 2 5 14h6l-1 8 8-12h-6z"/>'),
    wrench: S('<path class="wr" d="M14.7 6.3a4 4 0 0 0-5.4 5.1L3 17.7 6.3 21l6.3-6.3a4 4 0 0 0 5.1-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>'),
    bell: S('<g class="bl"><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 19.5a2 2 0 0 0 4 0"/></g>'),
    people: S('<g class="pp"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M16.2 14.2c2.8 0 4.8 2 4.8 4.8"/></g>'),
};

const MENUS = {
    admin: [['dash', 'داشبورد'], ['door', 'واحدها'], ['bolt', 'شارژ و قبوض', '۲'], ['wrench', 'تعمیرات', '۴'], ['people', 'ساکنین'], ['bell', 'اطلاعیه‌ها']],
    res: [['dash', 'خانه‌ی من'], ['bolt', 'پرداخت شارژ', '۱'], ['wrench', 'درخواست تعمیر'], ['bell', 'اطلاعیه‌ها', '۳'], ['people', 'همسایه‌ها']],
};
const HELLO = { admin: 'سلام مدیر عزیز 👋', res: 'سلام همسایه‌ی عزیز 🏠' };

function renderMenu(role) {
    menu.innerHTML = MENUS[role].map(([ic, label, badge], i) =>
        `<a href="#" class="it${i === 0 ? ' on' : ''}" style="--i:${i}">${ICONS[ic]}<span>${label}</span>${badge ? `<em>${badge}</em>` : ''}</a>`
    ).join('');
    document.getElementById('hello').textContent = HELLO[role];
}

menu.addEventListener('click', (e) => {
    const a = e.target.closest('.it');
    if (!a) return;
    e.preventDefault();
    menu.querySelector('.on')?.classList.remove('on');
    a.classList.add('on');
});

// کلید مدیر / ساکن
document.querySelectorAll('.seg button').forEach((b) =>
    b.addEventListener('click', () => {
        document.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-checked', x === b));
        renderMenu(b.dataset.r);
    })
);

// انتخاب واحد
const units = document.getElementById('units');
['واحد ۱۱', 'واحد ۱۲', 'واحد ۲۱', 'واحد ۲۲', 'واحد ۳۱'].forEach((u) => {
    const b = document.createElement('button');
    b.textContent = u;
    if (u === 'واحد ۱۲') b.className = 'on';
    b.addEventListener('click', () => {
        units.querySelector('.on')?.classList.remove('on');
        b.classList.add('on');
        document.getElementById('unitName').textContent = u;
    });
    units.appendChild(b);
});

const dd = document.querySelector('.dd');
const ddBtn = dd.querySelector('.dd-btn');
ddBtn.addEventListener('click', (e) => { e.stopPropagation(); const o = dd.classList.toggle('open'); ddBtn.setAttribute('aria-expanded', o); });
document.addEventListener('click', () => { dd.classList.remove('open'); ddBtn.setAttribute('aria-expanded', 'false'); });
addEventListener('keydown', (e) => e.key === 'Escape' && dd.classList.remove('open'));

renderMenu('admin');