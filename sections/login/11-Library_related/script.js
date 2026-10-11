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

document.getElementById('togglePass').onclick = () => {
    const p = document.getElementById('password');
    p.type = p.type === 'password' ? 'text' : 'password';
};

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();
    const err = document.getElementById('errorMsg');
    if(u.length < 3){ err.textContent = 'شماره عضویت یا ایمیل را کامل وارد کن.'; shake(); return; }
    if(p.length < 6){ err.textContent = 'رمز عبور باید حداقل ۶ کاراکتر باشد.'; shake(); return; }
    err.style.color = '#15803d';
    err.textContent = 'در حال باز کردن قفسه‌ی شخصی شما... 📚';
    setTimeout(()=>{ alert('به کتابخانه مهر خوش آمدی! 📖'); err.style.color='#b91c1c'; err.textContent=''; }, 900);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    if(name.length < 3){ alert('نامت را کامل بنویس.'); return; }
    if(!/^09\d{9}$/.test(phone)){ alert('شماره موبایل معتبر نیست. مثال: 09123456789'); return; }
    alert(name + ' عزیز! درخواست عضویتت ثبت شد. کد پیگیری: LIB-' + Math.floor(1000+Math.random()*9000));
    showLogin();
});

function shake(){
    const card = document.querySelector('.login-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'shake .35s';
}
const style = document.createElement('style');
style.textContent = '@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}';
document.head.appendChild(style);