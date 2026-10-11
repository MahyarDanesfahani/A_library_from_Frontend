// منوی موبایل
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');
hamburger.onclick = () => {
    mobileMenu.classList.add('open');
    overlay.classList.add('show');
};

// سبد خرید
const cartDrawer = document.getElementById('cartDrawer');
document.getElementById('cartBtn').onclick = () => {
    cartDrawer.classList.add('open');
    overlay.classList.add('show');
};
document.getElementById('closeCart').onclick = closeAll;
overlay.onclick = closeAll;
function closeAll(){
    cartDrawer.classList.remove('open');
    mobileMenu.classList.remove('open');
    overlay.classList.remove('show');
}

// حالت شب و روز
const themeBtn = document.getElementById('themeBtn');
themeBtn.onclick = () => {
    document.body.classList.toggle('dark');
    themeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
};

// جست‌وجوی زنده
const products = ['قابلمه گرانیتی','زودپز تفال','قهوه‌ساز مباشی','سرخ‌کن فیلیپس','سرویس چینی زرین','جاروبرقی بوش','مخلوط‌کن کنوود','سرویس چاقو','مایکروویو ال‌جی','یخچال اسنوا','مبل راحتی','لوستر مدرن'];
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');
searchInput.addEventListener('input', () => {
    const v = searchInput.value.trim();
    if(v.length < 1){ searchResult.style.display='none'; return; }
    const found = products.filter(p => p.includes(v)).slice(0,5);
    if(found.length === 0){
        searchResult.innerHTML = '<a>چیزی پیدا نشد! عبارت دیگری را امتحان کن 🥲</a>';
    } else {
        searchResult.innerHTML = found.map(f => '<a href="#">🔍 ' + f + '</a>').join('');
    }
    searchResult.style.display = 'block';
});
document.addEventListener('click', (e)=>{
    if(!e.target.closest('.search-box')) searchResult.style.display='none';
});

// نوار پیشرفت اسکرول + سایه نوبار
const progress = document.getElementById('progress');
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = (window.scrollY / h) * 100;
    progress.style.width = p + '%';
    navbar.style.boxShadow = window.scrollY > 10 ? '0 10px 30px rgba(0,0,0,.1)' : 'none';
});

// حذف آیتم سبد + شمارنده
let count = 2;
document.querySelectorAll('.cart-item button').forEach(btn=>{
    btn.onclick = () => {
        btn.closest('.cart-item').remove();
        count--;
        document.getElementById('cartCount').textContent = count < 0 ? 0 : count;
    };
});