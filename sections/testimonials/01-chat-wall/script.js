const log = document.getElementById('log');
const st = document.getElementById('st');
const $ = (id) => document.getElementById(id);
const fa = (n) => Number(n).toLocaleString('fa-IR');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// نظرها نمونه هستند؛ با نظر واقعی مشتری‌هایت جایگزینشان کن
const CHAT = [
    { name: 'سارا احمدی', role: 'مدیر فروشگاه آنلاین', c: '#e0527a', stars: 5, time: '۱۰:۱۲', likes: 14,
        text: 'فروشگاهمون رو تو دو هفته تحویل دادن و فروش ماه اول دو برابر شد. واقعاً راضی‌ام! 🙌' },
    { reply: 'ممنون از اعتمادتون سارا جان 🙏' },
    { name: 'امیر رضایی', role: 'مدیرعامل استارتاپ', c: '#3b82f6', stars: 5, time: '۱۰:۱۵', likes: 9,
        text: 'کدها تمیز و مستند بود و تیم خودمون بدون هیچ مشکلی ادامه‌ش داد. پشتیبانی هم عالی.' },
    { name: 'مریم کاظمی', role: 'صاحب کلینیک', c: '#8b5cf6', stars: 4, time: '۱۰:۲۱', likes: 6,
        text: 'سامانه‌ی نوبت‌دهی کلینیک خیلی ساده و روان کار می‌کنه. بیمارها هم تعریف می‌کنن.' },
    { reply: 'خوشحالیم که کمک‌کننده بوده 😊' },
    { name: 'علی محمدی', role: 'مدیر ساختمان', c: '#f59e0b', stars: 5, time: '۱۰:۲۸', likes: 11,
        text: 'پنل شارژ و قبض ساختمان همه‌چیز رو شفاف کرد. دیگه کسی سر حساب‌وکتاب دعوا نمی‌کنه 😄' },
];

let run = 0;
const scroll = () => (log.scrollTop = log.scrollHeight);

function bubble(m) {
    const row = document.createElement('div');
    if (m.reply) {
        row.className = 'msg us';
        const b = document.createElement('div'); b.className = 'bub'; b.textContent = m.reply;
        const t = document.createElement('time'); t.textContent = '✓✓ ۱۰:۲۰';
        b.appendChild(t);
        row.appendChild(b);
        return row;
    }
    row.className = 'msg';
    row.style.setProperty('--c', m.c);
    const u = document.createElement('span'); u.className = 'u'; u.textContent = m.name[0];
    const b = document.createElement('div'); b.className = 'bub';
    const who = document.createElement('span'); who.className = 'who'; who.textContent = m.name;
    const role = document.createElement('span'); role.className = 'role'; role.textContent = '· ' + m.role;
    who.appendChild(role);
    const stars = document.createElement('div'); stars.className = 'stars'; stars.textContent = '★'.repeat(m.stars) + '☆'.repeat(5 - m.stars);
    const p = document.createElement('div'); p.textContent = m.text;
    const t = document.createElement('time'); t.textContent = m.time;
    b.append(who, stars, p, t);
    row.append(u, b);
    return row;
}

function addReaction(row, likes) {
    const r = document.createElement('button');
    r.type = 'button';
    r.className = 'react';
    r.setAttribute('aria-label', 'لایک');
    let n = likes, on = false;
    const draw = () => { r.textContent = `❤️ ${fa(n)}`; r.classList.toggle('on', on); };
    r.addEventListener('click', () => { on = !on; n += on ? 1 : -1; draw(); });
    draw();
    row.querySelector('.bub').appendChild(r);
}

async function play() {
    const my = ++run;
    log.replaceChildren();
    $('replay').hidden = true;
    for (const m of CHAT) {
        if (my !== run) return;
        if (!reduced && !m.reply) {
            st.textContent = m.name + ' در حال نوشتن...';
            const t = document.createElement('div'); t.className = 'msg'; t.innerHTML = '<div class="typing"><i></i><i></i><i></i></div>';
            log.appendChild(t); scroll();
            await sleep(900 + m.text.length * 8);
            t.remove();
        } else if (!reduced) await sleep(700);
        st.textContent = 'آنلاین';
        const row = bubble(m);
        log.appendChild(row); scroll();
        if (m.likes) { if (!reduced) await sleep(450); addReaction(row, m.likes); scroll(); }
        if (!reduced) await sleep(700);
    }
    // خلاصه‌ی رضایت
    const avg = CHAT.filter((m) => m.stars).reduce((s, m) => s + m.stars, 0) / CHAT.filter((m) => m.stars).length;
    const sum = bubble({ reply: `میانگین رضایت: ${fa(avg.toFixed(1))} از ۵ ⭐` });
    log.appendChild(sum); scroll();
    $('replay').hidden = false;
}

$('replay').addEventListener('click', play);
// شروع وقتی گفتگو دیده شد
new IntersectionObserver(([e], io) => { if (e.isIntersecting) { io.disconnect(); play(); } }, { threshold: 0.35 }).observe($('phone'));