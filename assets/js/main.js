/* ==========================================================================
   main.js —— 全站交互（原生 JS，无依赖）
   1. 主题切换（跟随系统，记住选择，无闪屏）
   2. 滚动时页头描边
   3. 移动端菜单
   4. 当前页导航高亮
   5. 自动填充年份
   6. 代码块语言标注（可选）
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- 1. 主题切换 ------------------------------------------------ */
  // 说明：为避免首屏闪烁，<head> 里有一段内联脚本先设置 data-theme。
  // 这里只负责按钮点击与文字提示。
  var themeBtn = document.querySelector(".theme-toggle");
  var themes = ["light", "dark", "pink"];
  var themeNames = { light: "浅色", dark: "深色", pink: "胭脂粉" };

  function currentTheme() {
    var theme = root.getAttribute("data-theme");
    return themes.includes(theme) ? theme : "light";
  }

  function syncThemeLabel() {
    if (!themeBtn) return;
    var theme = currentTheme();
    var next = themes[(themes.indexOf(theme) + 1) % themes.length];
    var description = "当前" + themeNames[theme] + "主题，切换到" + themeNames[next];
    themeBtn.setAttribute("aria-label", description);
    themeBtn.setAttribute("title", description);
    themeBtn.removeAttribute("aria-pressed");
    var label = themeBtn.querySelector(".theme-toggle__label");
    if (label) label.textContent = themeNames[theme];
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute("content", { light: "#f5f7f6", dark: "#141c1b", pink: "#fcf3f4" }[theme]);
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = themes[(themes.indexOf(currentTheme()) + 1) % themes.length];
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* 隐私模式下写入可能失败，忽略 */
      }
      syncThemeLabel();
    });
    syncThemeLabel();
  }

  // 用户没手动选过时，跟随系统变化
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onSchemeChange = function (e) {
      var saved = null;
      try {
        saved = localStorage.getItem("theme");
      } catch (err) {}
      if (!themes.includes(saved)) {
        root.setAttribute("data-theme", e.matches ? "dark" : "light");
        syncThemeLabel();
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  }

  /* ---------- 2. 滚动时页头描边 ------------------------------------------ */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 3. 移动端菜单 ---------------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (navToggle && nav) {
    var closeNav = function () {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    // 点击链接后收起
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    // Esc 关闭
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    // 点击外部关闭
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });
  }

  /* ---------- 4. 当前页导航高亮 ------------------------------------------ */
  // 约定：<body data-page="home|posts|about|post">，导航链接用 data-nav。
  var page = document.body.getAttribute("data-page");
  if (page) {
    document.querySelectorAll(".nav a[data-nav]").forEach(function (link) {
      var target = link.getAttribute("data-nav");
      var active =
        target === page ||
        (page === "post" && target === "posts");
      if (active) link.setAttribute("aria-current", "page");
    });
  }

  /* ---------- 5. 年份 ---------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- 6. 代码块：把 data-lang 显示成角标 ------------------------- */
  document.querySelectorAll(".prose pre[data-lang]").forEach(function (pre) {
    pre.classList.add("has-lang");
    var badge = document.createElement("span");
    badge.className = "code-lang";
    badge.textContent = pre.getAttribute("data-lang");
    pre.appendChild(badge);
  });
})();
