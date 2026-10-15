const log = document.getElementById('log');
const quick = document.getElementById('quick');
const f = document.getElementById('f');
const inp = document.getElementById('inp');
const st = document.getElementById('st');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function bubble(text, cls) {
    const d = document.createElement('div');
    d.className = 'b ' + cls;
    d.textContent = text;               // با textContent: ورودی کاربر هرگز HTML نمی‌شود
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
}

// دستیار با نشانگر «در حال نوشتن...» پیام می‌دهد
async function bot(text, cls = '') {
    st.textContent = 'در حال نوشتن...';
    const t = document.createElement('div');
    t.className = 'b bot typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
    await sleep(reduced ? 50 : 500 + text.length * 12);
    t.remove();
    st.textContent = 'آنلاین';
    bubble(text, 'bot ' + cls);
}

// یک سؤال متنی؛ تا زمانی که جواب معتبر نباشد دوباره می‌پرسد
async function ask({ type = 'text', ph, secret = false, check }) {
    inp.disabled = false;
    inp.type = secret ? 'password' : type;
    inp.placeholder = ph;
    f.querySelector('button').disabled = false;
    for (;;) {
        inp.focus();
        const v = await new Promise((res) =>
            f.addEventListener('submit', function h(e) { e.preventDefault(); f.removeEventListener('submit', h); res(inp.value.trim()); })
        );
        inp.value = '';
        if (!v) continue;
        bubble(secret ? '•'.repeat(v.length) : v, 'me');
        const err = check(v);
        if (!err) { lock(); return v; }
        await bot(err, 'err');
    }
}
function lock() {
    inp.disabled = true; inp.type = 'text'; inp.placeholder = 'منتظر پیام دستیار...';
    f.querySelector('button').disabled = true;
}

// دکمه‌های پاسخ سریع
function choose(options) {
    return new Promise((res) => {
        quick.replaceChildren();
        options.forEach((o) => {
            const b = document.createElement('button');
            b.textContent = o;
            b.addEventListener('click', () => { quick.replaceChildren(); bubble(o, 'me'); res(o); });
            quick.appendChild(b);
        });
    });
}

function confetti() {
    if (reduced) return;
    const E = ['🎉', '✨', '🎊', '⭐', '💫'];
    for (let i = 0; i < 28; i++) {
        const s = document.createElement('span');
        s.className = 'fall';
        s.textContent = E[i % E.length];
        s.style.left = Math.random() * 100 + 'vw';
        s.style.animationDuration = 2 + Math.random() * 2 + 's';
        s.style.animationDelay = Math.random() * 0.6 + 's';
        document.body.appendChild(s);
        s.addEventListener('animationend', () => s.remove());
    }
}

async function run() {
    log.replaceChildren();
    lock();
    await bot('سلام! 👋 من دستیار ثبت‌نام هستم. اسمت چیه؟');
    const name = await ask({ ph: 'نام و نام خانوادگی', check: (v) => (v.length < 2 ? 'این اسم خیلی کوتاهه، دوباره بگو 🙂' : '') });

    await bot(`خوشبختم ${name.split(' ')[0]}! ایمیلت رو بگو تا حسابت رو بسازم.`);
    const email = await ask({ type: 'email', ph: 'example@mail.com', check: (v) => (/^\S+@\S+\.\S+$/.test(v) ? '' : 'این ایمیل درست به نظر نمی‌رسه 🤔') });

    await bot('حالا یه رمز عبور انتخاب کن (حداقل ۸ کاراکتر و یک عدد). فقط خودت می‌بینیش 🔐');
    await ask({ secret: true, ph: 'رمز عبور', check: (v) => (v.length < 8 || !/\d/.test(v) ? 'رمز باید حداقل ۸ کاراکتر باشه و یه عدد هم داشته باشه 🔐' : '') });

    await bot('کدوم پلن رو دوست داری؟');
    const plan = await choose(['🆓 رایگان', '⭐ حرفه‌ای']);

    await bot(`عالیه! خلاصه‌ی اطلاعاتت:\nنام: ${name}\nایمیل: ${email}\nپلن: ${plan}`);
    await bot('همه‌چیز درسته؟');
    const ok = await choose(['✅ بله، حساب را بساز', '✏️ شروع دوباره']);

    if (ok.startsWith('✅')) {
        // اینجا اطلاعات را با fetch به بک‌اند خودت بفرست
        await bot('حسابت ساخته شد! 🎉 خوش اومدی.');
        confetti();
    } else {
        await bot('باشه، از اول شروع می‌کنیم.');
        return run();
    }
}
run();