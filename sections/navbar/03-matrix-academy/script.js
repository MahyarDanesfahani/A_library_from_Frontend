// افکت ماتریکس پس‌زمینه
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');
function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resize(); window.addEventListener('resize', resize);
const chars = '01<>/{}[]#$_=+*01';
const drops = Array(Math.floor(window.innerWidth/18)).fill(0);
setInterval(()=>{
    ctx.fillStyle = document.body.classList.contains('light') ? 'rgba(244,246,251,.15)' : 'rgba(7,11,20,.12)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#22ffa2';
    ctx.font = '13px monospace';
    for(let i=0;i<drops.length;i++){
        const t = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(t, i*18, drops[i]*18);
        if(drops[i]*18 > canvas.height && Math.random() > .975) drops[i]=0;
        drops[i]++;
    }
}, 60);

// منوی موبایل
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');
burger.onclick = ()=>{ mobileMenu.classList.add('open'); overlay.classList.add('show'); };
overlay.onclick = ()=>{ mobileMenu.classList.remove('open'); overlay.classList.remove('show'); };

// تم روشن و تیره
document.getElementById('themeBtn').onclick = ()=>{
    document.body.classList.toggle('light');
};

// جست‌وجوی زنده دوره‌ها
const courses = [
    ['React پیشرفته','Frontend • ۴۲ ساعت'],
    ['Next.js 14','Frontend • ۳۰ ساعت'],
    ['Node.js و NestJS','Backend • ۵۰ ساعت'],
    ['Python و Django','Backend • ۴۵ ساعت'],
    ['Go میکروسرویس','Backend • ۲۸ ساعت'],
    ['یادگیری ماشین','AI • ۶۰ ساعت'],
    ['LLM و RAG','AI • ۲۰ ساعت'],
    ['Docker و Kubernetes','DevOps • ۳۵ ساعت'],
    ['تست نفوذ وب','Security • ۴۰ ساعت'],
    ['TypeScript تخصصی','Frontend • ۱۸ ساعت']
];
const input = document.getElementById('searchInput');
const drop = document.getElementById('searchDrop');
if(input){
    input.addEventListener('input', ()=>{
        const v = input.value.trim();
        if(!v){ drop.style.display='none'; return; }
        const f = courses.filter(c=>c[0].includes(v)).slice(0,5);
        drop.innerHTML = f.length
            ? f.map(c=>'<a href="#">⌁ '+c[0]+'<br><small>'+c[1]+'</small></a>').join('')
            : '<a>دوره‌ای پیدا نشد! «'+v+'» به‌زودی اضافه می‌شود 🚀</a>';
        drop.style.display='block';
    });
    document.addEventListener('click', e=>{ if(!e.target.closest('.search')) drop.style.display='none'; });
}
// میانبر Ctrl+K
document.addEventListener('keydown', e=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); if(input) input.focus(); }
});

// نوار پیشرفت اسکرول
const bar = document.getElementById('scrollbar');
window.addEventListener('scroll', ()=>{
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY/h*100)+'%';
});