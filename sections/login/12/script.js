/* ================================================
 DARK//SHELL — Secure Access Script
 ================================================ */
document.addEventListener("DOMContentLoaded", () => {

    /* ---------- MATRIX RAIN ---------- */
    const canvas = document.getElementById("matrix");
    const ctx = canvas.getContext("2d");
    let cols, drops;
    const CHARS = "0123456789ABCDEF<>/\\{}[]#$%&*+=";

    function resize() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        cols = Math.floor(canvas.width / 16);
        drops = Array(cols).fill(1);
    }
    resize();
    addEventListener("resize", resize);

    setInterval(() => {
        if (!ctx) return;
        ctx.fillStyle = "rgba(5,7,10,.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "13px 'JetBrains Mono', monospace";
        for (let i = 0; i < cols; i++) {
            const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
            const x = i * 16, y = drops[i] * 16;
            ctx.fillStyle = Math.random() >.975? "#daffef": "#00ff9c";
            ctx.fillText(ch, x, y);
            if (y > canvas.height && Math.random() >.976) drops[i] = 0;
            drops[i]++;
        }
    }, 55);

    /* ---------- BOOT LOG ---------- */
    const boot = document.getElementById("boot");
    const lines = [
        { t: "> initializing dark-shell kernel v3.1.4...", c: "" },
        { t: "> loading shadow modules............ [OK]", c: "ok" },
        { t: "> mounting /dev/ghost.............. [OK]", c: "ok" },
        { t: "> intrusion detection: ACTIVE", c: "warn" },
        { t: "> previous session user#7402....... [WIPED]", c: "err" },
        { t: "> awaiting credentials...", c: "" }
    ];
    let li = 0;
    (function typeLine() {
        if (li >= lines.length) return;
        const span = document.createElement("div");
        if (lines[li].c) span.className = lines[li].c;
        boot.appendChild(span);
        const text = lines[li].t;
        let ci = 0;
        const iv = setInterval(() => {
            span.textContent = text.slice(0, ++ci);
            if (ci >= text.length) { clearInterval(iv); li++; setTimeout(typeLine, 260); }
        }, 14);
    })();

    /* ---------- TABS ---------- */
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
            loginForm.classList.toggle("active",!isSignup);
            signupForm.classList.toggle("active", isSignup);
        });
    });

    /* ---------- TOAST + FLASHES ---------- */
    const toast = document.getElementById("toast");
    const denyFlash = document.getElementById("deny-flash");
    const allowFlash = document.getElementById("allow-flash");
    let toastTimer;

    function showToast(msg, error = false) {
        toast.textContent = msg;
        toast.classList.toggle("error", error);
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
    }
    function flashDenied() {
        denyFlash.classList.remove("go"); void denyFlash.offsetWidth;
        denyFlash.classList.add("go");
    }
    function flashAllowed() {
        allowFlash.classList.remove("go"); void allowFlash.offsetWidth;
        allowFlash.classList.add("go");
    }

    /* ---------- SHOW / HIDE PASSWORD ---------- */
    document.querySelectorAll(".toggle-pass").forEach(t => {
        t.addEventListener("click", () => {
            const input = t.parentElement.querySelector("input");
            const show = input.type === "password";
            input.type = show? "text": "password";
            t.textContent = show? "◌": "◉";
        });
    });

    /* ---------- CAPTCHA (TRANS-GATE) ---------- */
    const codeEl = document.getElementById("crypt-code");
    const codeIn = document.getElementById("crypt-in");
    let gateCode = genCode();

    function genCode() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789#%&$@";
        return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    }
    codeEl.addEventListener("click", () => {
        gateCode = genCode();
        codeEl.textContent = gateCode;
        showToast("درگاه بازتولید شد ↻");
    });

    /* ---------- PASSWORD STRENGTH ---------- */
    const suPass = document.getElementById("su-pass");
    const bar = document.querySelector(".strength-bar");
    const sText = document.getElementById("strength-text");

    suPass.addEventListener("input", () => {
        const v = suPass.value;
        let score = 0;
        if (v.length >= 6) score++;
        if (/[A-Z]/.test(v)) score++;
        if (/\d/.test(v)) score++;
        if (/[^A-Za-z0-9]/.test(v)) score++;
        const pct = [0, 25, 50, 78, 100][score];
        const labels = ["—", "WEAK", "MEDIUM", "STRONG", "GHOST-PROOF"];
        const colors = ["#1d3a2b", "#ff3355", "#ffb020", "#00ff9c", "#00ff9c"];
        bar.style.width = pct + "%";
        bar.style.background = colors[score];
        sText.textContent = labels[score];
        sText.style.color = colors[score];
    });

    /* ---------- LOGIN SUBMIT ---------- */
    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const user = document.getElementById("login-user");
        const pass = document.getElementById("login-pass");

        if (!user.value.trim()) return reject("شناسه خالی است. سیستم نمی‌تواند تو را بشناسد.");
        if (pass.value.length < 6) return reject("رمز بیش از حد کوتاه است — دیوار آتش فعال شد.");
        if (codeIn.value.trim().toUpperCase()!== gateCode) {
            codeIn.value = "";
            gateCode = genCode();
            codeEl.textContent = gateCode;
            return reject("ACCESS DENIED — کد درگاه نادرست است.");
        }
        allowFlash.classList.add("go");
        setTimeout(() => allowFlash.classList.remove("go"), 900);
        showToast("احراز هویت شد. خوش آمدی به تاریکی، رشته‌باز.");
        // TODO: اتصال به API بک‌اند
    });

    function reject(msg) {
        flashDenied();
        showToast(msg, true);
    }

    /* ---------- SIGNUP SUBMIT ---------- */
    signupForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("su-name");
        const email = document.getElementById("su-email");
        if (!name.value.trim()) return reject("نام کاربری اجباری است.");
        if (!email.value.includes("@")) return reject("ایمیل معتبر نیست.");
        if (suPass.value.length < 6) return reject("رمز باید حداقل ۶ کاراکتر باشد.");
        flashAllowed();
        showToast("شناسنامه‌ی سایه ثبت شد. ردپایت پاک می‌ماند… شاید.");
        // TODO: اتصال به API بک‌اند
    });

    /* ---------- FORGOT PASSWORD ---------- */
    document.getElementById("forgot").addEventListener("click", e => {
        e.preventDefault();
        reject("بازیابی رمز مسدود است. هیچ‌کس از اینجا برنمی‌گردد… فعلاً.");
    });

    /* ---------- CLOCK + FAKE IP ---------- */
    const clock = document.getElementById("clock");
    const ipEl = document.getElementById("ip");
    const ipParts = [randIp(1, 240), randIp(0, 255), randIp(0, 255), randIp(2, 254)];
    function randIp(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
    ipEl.textContent = "IP: " + ipParts.join(".") + " [MASKED]";

    setInterval(() => {
        const d = new Date();
        clock.textContent = d.toTimeString().slice(0, 8);
    }, 1000);

    /* ---------- SOCIAL / EXTRA ---------- */
    document.querySelectorAll(".remember input").forEach(c => {
        c.addEventListener("change", () => {
            if (c.checked) showToast("جلسه پایدار فعال شد — ولی هیچ چیزی برای همیشه پایدار نیست.");
        });
    });
});