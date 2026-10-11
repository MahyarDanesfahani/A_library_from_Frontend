// تب ورود و ثبت‌نام
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function showLogin(){
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
}
function showRegister(){
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
}
tabLogin.onclick = showLogin;
tabRegister.onclick = showRegister;
document.getElementById('goRegister').onclick = (e)=>{e.preventDefault(); showRegister();};
document.getElementById('goLogin').onclick = (e)=>{e.preventDefault(); showLogin();};

// نمایش رمز
document.getElementById('togglePass').onclick = ()=>{
    const p = document.getElementById('password');
    p.type = p.type === 'password' ? 'text' : 'password';
};

// اعتبارسنجی ورود
loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const err = document.getElementById('errorMsg');
    if(u.length < 3){ err.textContent = 'عزیزم ایمیل یا موبایلت رو کامل وارد کن!'; return; }
    if(p.length < 6){ err.textContent = 'رمزت باید حداقل ۶ کاراکتر باشه!'; return; }
    err.style.color = '#16a34a';
    err.textContent = 'آفرین! داری وارد دنیای صورتی می‌شی... 💗';
    confettiBurst();
    setTimeout(()=>{ alert('خوش اومدی به توت‌فرنگی! 🎀'); err.style.color='#e11d48'; }, 900);
});

registerForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    if(name.length < 2){ alert('اسمت رو قشنگ وارد کن!'); return; }
    confettiBurst();
    alert(name + ' جون! ثبت‌نامت انجام شد، کد تخفیف WELCOME15 مال توئه 💖');
    showLogin();
});

// افکت برق قلبی با کلیک
document.addEventListener('click', (e)=>{
    const s = document.createElement('span');
    s.className = 'sparkle';
    s.textContent = ['💖','✨','🎀','💗'][Math.floor(Math.random()*4)];
    s.style.left = e.clientX+'px';
    s.style.top = e.clientY+'px';
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 1000);
});

function confettiBurst(){
    for(let i=0;i<24;i++){
        setTimeout(()=>{
            const s = document.createElement('span');
            s.className='sparkle';
            s.textContent = ['💖','🌸','✨','🎀','💍'][Math.floor(Math.random()*5)];
            s.style.left = (window.innerWidth/2 + (Math.random()*300-150))+'px';
            s.style.top = (window.innerHeight/2)+'px';
            s.style.fontSize = (16+Math.random()*20)+'px';
            document.body.appendChild(s);
            setTimeout(()=>s.remove(),1000);
        }, i*40);
    }
}