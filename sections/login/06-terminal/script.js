const out = document.getElementById('out');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function line(text = '', cls = '') {
    const d = document.createElement('div');
    d.className = 'ln ' + cls;
    d.textContent = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
    return d;
}

async function type(text, cls = '', speed = 16) {
    const d = line('', cls);
    for (const ch of text) {
        d.textContent += ch;
        if (!reduced) await sleep(speed);
    }
    return d;
}

// یک خط ورودی؛ با Enter مقدار را برمی‌گرداند
function ask(label, secret = false) {
    return new Promise((resolve) => {
        const d = line('', 'ask');
        const l = document.createElement('span');
        const input = document.createElement('input');
        l.textContent = label;
        input.type = secret ? 'password' : 'text';
        input.autocomplete = secret ? 'current-password' : 'username';
        input.spellcheck = false;
        input.setAttribute('aria-label', label);
        d.append(l, input);
        input.focus();
        input.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter') return;
            input.disabled = true;
            resolve(input.value.trim());
        });
    });
}

// کلیک روی ترمینال، آخرین ورودی فعال را فوکوس می‌کند
document.getElementById('crt').addEventListener('click', () => {
    const inputs = out.querySelectorAll('input:not(:disabled)');
    inputs[inputs.length - 1]?.focus();
});

async function run() {
    out.innerHTML = '';
    await type('SECURE-LOGIN v1.0 (tty1)');
    await type('Establishing encrypted channel... OK', 'ok');
    await type('Enter your credentials to continue.', 'dim');
    line();

    let email;
    for (;;) {
        email = await ask('login:');
        if (/^\S+@\S+\.\S+$/.test(email)) break;
        await type('ERR: invalid email address', 'err');
    }

    let pass;
    for (;;) {
        pass = await ask('password:', true);
        if (pass.length >= 6) break;
        await type('ERR: password must be at least 6 characters', 'err');
    }

    // نوار پیشرفت متنی؛ اینجا درخواست واقعی به بک‌اند (fetch به /api/login) را بزن
    const bar = line();
    for (let i = 0; i <= 24; i++) {
        bar.textContent = `authenticating [${'#'.repeat(i)}${'.'.repeat(24 - i)}]`;
        if (!reduced) await sleep(55);
    }

    await type(`ACCESS GRANTED. Welcome, ${email.split('@')[0]}`, 'ok big');
    await type('[ press any key to run again ]', 'dim');
    await sleep(300);
    document.addEventListener('keydown', run, { once: true });
}

run();