const S = (x) => `<svg viewBox="0 0 24 24" aria-hidden="true">${x}</svg>`;
// آیکون‌ها کدهای ثابت خودمان هستند، نه ورودی کاربر
const APPS = [
    ['یخچال', S('<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 10h12M9 5.5v2M9 13v3"/><rect class="d2" x="6" y="10" width="12" height="12" rx="2"/>')],
    ['لباسشویی', S('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M7 5.5h3"/><circle cx="12" cy="13" r="5"/><g class="drum"><path d="M9.5 13a2.5 2.5 0 0 1 5 0"/></g>')],
    ['جاروبرقی', S('<g class="vac"><circle cx="8" cy="17" r="4"/><circle cx="8" cy="17" r="1.2"/><path d="M8 13V6a3 3 0 0 1 6 0v1M14 7l6 7h-4"/></g>')],
    ['مایکروفر', S('<rect x="3" y="6" width="18" height="12" rx="2"/><rect class="glow" x="5.5" y="8.5" width="9" height="7" rx="1"/><circle cx="18" cy="9.5" r="1"/><path d="M17 13h2M17 15.5h2"/>')],
    ['تلویزیون', S('<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path class="scan" d="M5.5 8h13"/>')],
    ['کولر', S('<rect x="2.5" y="5" width="19" height="8" rx="2"/><path d="M6 10h12"/><path class="air" d="M7 16c0 2 2 2 2 4M12 16c0 2 2 2 2 4M17 16c0 2 2 2 2 4"/>')],
];

const apps = document.getElementById('apps');
const deco = document.getElementById('deco');
APPS.forEach(([label, svg]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'app';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = svg;
    b.append(label);
    b.addEventListener('click', () => b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'));
    apps.appendChild(b);
    deco.insertAdjacentHTML('beforeend', svg);
});

// تبدیل ارقام فارسی و عربی به انگلیسی
const norm = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

const f = document.getElementById('f');
const msg = document.getElementById('msg');
f.addEventListener('input', (e) => e.target.classList.remove('invalid'));

f.addEventListener('submit', (e) => {
    e.preventDefault();
    msg.className = 'msg';
    const el = f.elements;
    const fail = (field, text) => {
        if (field) { field.classList.add('invalid'); field.focus(); }
        msg.textContent = text;
        f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
    };
    const phone = norm(el.phone.value.trim());
    const v = el.password.value;
    if (el.name.value.trim().length < 2) return fail(el.name, 'نام را وارد کنید.');
    if (!/^09\d{9}$/.test(phone)) return fail(el.phone, 'شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.');
    if (v.length < 8 || !/\d/.test(v)) return fail(el.password, 'رمز باید حداقل ۸ کاراکتر و شامل عدد باشد.');
    if (!el.terms.checked) return fail(null, 'پذیرش قوانین الزامی است.');

    // اینجا اطلاعات را با fetch به بک‌اند خودت بفرست
    const n = document.querySelectorAll('.app[aria-pressed="true"]').length;
    document.getElementById('code').textContent = 'KHANE-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    document.getElementById('cnote').textContent = n ? `پیشنهاد ویژه‌ی ${n.toLocaleString('fa-IR')} دسته از لوازم موردعلاقه‌ات را برایت می‌فرستیم.` : 'برای اولین خرید استفاده کن.';
    document.getElementById('coupon').hidden = false;
    msg.classList.add('ok');
    msg.textContent = 'ثبت‌نام انجام شد 🎉';
});