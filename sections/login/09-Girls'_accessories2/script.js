// 🎀 گالری بانو — اسکریپت صفحه ورود
document.addEventListener("DOMContentLoaded", () => {

    /* ---------- تب ورود / ثبت‌نام ---------- */
    const tabs = document.querySelector(".tabs");
    const tabBtns = document.querySelectorAll(".tab");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const isSignup = btn.dataset.tab === "signup";
            tabs.classList.toggle("signup", isSignup);
            loginForm.classList.toggle("active", !isSignup);
            signupForm.classList.toggle("active", isSignup);
        });
    });

    /* ---------- نمایش/مخفی کردن رمز ---------- */
    document.querySelectorAll(".toggle-pass").forEach(t => {
        t.addEventListener("click", () => {
            const input = t.parentElement.querySelector("input");
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            t.textContent = show ? "🙈" : "👁️";
        });
    });

    /* ---------- سنجش قدرت رمز (ثبت‌نام) ---------- */
    const suPass = document.getElementById("su-pass");
    const bar = document.querySelector(".strength-bar");
    suPass.addEventListener("input", () => {
        const v = suPass.value;
        let score = 0;
        if (v.length >= 6) score++;
        if (/[A-Z]/.test(v)) score++;
        if (/\d/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;
        const pct = [0, 30, 55, 80, 100][score];
        bar.style.width = pct + "%";
        bar.style.background = score <= 1 ? "#ff8f8f"
            : score === 2 ? "#ffb84d"
                : "linear-gradient(90deg,#ff9ecb,#b57edc)";
    });

    /* ---------- اعتبارسنجی و توست ---------- */
    const toast = document.getElementById("toast");
    let toastTimer;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
    }

    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const email = document.getElementById("login-email");
        const pass = document.getElementById("login-pass");
        if (!email.value.trim()) return showToast("ایمیل یا شماره رو یادت نره عزیزم 💌");
        if (pass.value.length < 6) return showToast("رمز عبور باید حداقل ۶ کاراکتر باشه 🔒");
        showToast("خوش برگشتی! در حال ورود به گالری… 💖");
        // اینجا بعداً به API وصل می‌شود
    });

    signupForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("su-name");
        const email = document.getElementById("su-email");
        if (!name.value.trim()) return showToast("اسمت رو برام بنویس 🌸");
        if (!email.value.includes("@")) return showToast("ایمیل معتبر وارد کن 💌");
        if (suPass.value.length < 6) return showToast("رمز عبور باید حداقل ۶ کاراکتر باشه 🔒");
        showToast("حسابت ساخته شد! خوش اومدی به بانو 🎀");
        // اینجا بعداً به API وصل می‌شود
    });

    /* ---------- ذخیره رمز (فقط فرانت) ---------- */
    const remember = loginForm.querySelector("input[type=checkbox]");
    const savedEmail = localStorage.getItem("bano_email");
    if (savedEmail) document.getElementById("login-email").value = savedEmail;
    loginForm.addEventListener("submit", () => {
        if (remember.checked) localStorage.setItem("bano_email", document.getElementById("login-email").value);
        else localStorage.removeItem("bano_email");
    });

    /* ---------- دکمه‌های اجتماعی ---------- */
    document.querySelectorAll(".social").forEach(s => {
        s.addEventListener("click", () => showToast("ورود با شبکه اجتماعی به‌زودی فعال می‌شود ✨"));
    });
});