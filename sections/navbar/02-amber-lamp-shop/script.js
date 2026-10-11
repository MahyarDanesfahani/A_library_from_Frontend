/* ═══════════ روشنا | اسکریپت نوبار ═══════════ */
document.addEventListener("DOMContentLoaded", () => {

    const navbar = document.getElementById("navbar");
    const hamburger = document.getElementById("hamburger");
    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("drawerOverlay");
    const drawerClose = document.getElementById("drawerClose");
    const searchBox = document.getElementById("searchBox");
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    const lightSwitch = document.getElementById("lightSwitch");
    const toast = document.getElementById("toast");

    /* ───── چسبندگی و سایه هنگام اسکرول ───── */
    const onScroll = () => navbar.classList.toggle("scrolled", scrollY > 10);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });

    /* ───── توست ───── */
    let toastTimer;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
    }

    /* ───── کشوی موبایل ───── */
    function openDrawer() {
        drawer.classList.add("open");
        overlay.classList.add("show");
        hamburger.classList.add("open");
        hamburger.setAttribute("aria-expanded", "true");
        document.body.classList.add("no-scroll");
    }
    function closeDrawer() {
        drawer.classList.remove("open");
        overlay.classList.remove("show");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("no-scroll");
    }
    hamburger.addEventListener("click", () =>
        drawer.classList.contains("open") ? closeDrawer() : openDrawer()
    );
    overlay.addEventListener("click", closeDrawer);
    drawerClose.addEventListener("click", closeDrawer);

    /* ───── آکاردئون محصولات در کشو ───── */
    document.querySelectorAll(".drawer-group .has-sub").forEach(btn => {
        btn.addEventListener("click", () =>
            btn.parentElement.classList.toggle("expanded")
        );
    });

    /* ───── لینک فعال ───── */
    const allLinks = document.querySelectorAll(".nav-link, .drawer-link:not(.has-sub)");
    allLinks.forEach(link => {
        link.addEventListener("click", e => {
            const href = link.getAttribute("href");
            if (href === "#") e.preventDefault();
            document.querySelectorAll(".nav-link, .drawer-link").forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            if (drawer.classList.contains("open")) closeDrawer();
        });
    });

    /* ───── جستجو ───── */
    searchBtn.addEventListener("click", () => {
        const isActive = searchBox.classList.toggle("active");
        if (isActive) searchInput.focus();
        else if (searchInput.value.trim()) {
            showToast(`🔍 جستجو برای: «${searchInput.value.trim()}»`);
            searchInput.value = "";
        }
    });
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && searchInput.value.trim()) {
            showToast(`🔍 جستجو برای: «${searchInput.value.trim()}»`);
            searchInput.value = "";
            searchBox.classList.remove("active");
        }
    });

    /* ───── کلید چراغ (روشن/خاموش کردن جلوه‌ها) ───── */
    lightSwitch.addEventListener("click", () => {
        const on = lightSwitch.classList.toggle("on");
        lightSwitch.setAttribute("aria-pressed", String(on));
        document.body.classList.toggle("lights-off", !on);
        showToast(on ? "💡 چراغ‌ها روشن شد!" : "🌙 چراغ‌ها خاموش شد… تاریکی باشکوه");
    });

    /* ───── سبد خرید و حساب ───── */
    document.getElementById("cartBtn").addEventListener("click", () =>
        showToast("🛒 سبد خرید: ۳ محصول در انتظار روشنایی!")
    );
    document.getElementById("userBtn").addEventListener("click", () =>
        showToast("👤 ورود / ثبت‌نام به‌زودی در این مسیر")
    );

    /* ───── بستن با Escape ───── */
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeDrawer();
            searchBox.classList.remove("active");
        }
    });
});