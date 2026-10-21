(function () {
  "use strict";
  var section = document.querySelector("[data-comments-section]");
  if (!section) return;
  var container = section.querySelector("[data-comments]"), root = document.documentElement;
  var card = section.querySelector("[data-comments-card]"), status = section.querySelector("[data-comments-status]");
  var button = section.querySelector("[data-comments-load]"), skeleton = section.querySelector("[data-comments-skeleton]");
  var network = section.querySelector("[data-comments-network]"), github = section.querySelector("[data-comments-github]");
  var origin = "https://utteranc.es", state = "idle", disposed = false, timer, script, visibility;
  // Match Utterances' existing pathname mapping; do not create a new thread key.
  var term = location.pathname.length < 2 ? "index" : location.pathname.substr(1).replace(/\.\w+$/, "");
  github.href = "https://github.com/DunYujian/myproject/issues?q=" + encodeURIComponent('is:issue in:title "' + term + '"');
  function theme() { return root.dataset.theme === "dark" ? "github-dark" : "github-light"; }
  function frame() { return container.querySelector(".utterances-frame"); }
  function syncTheme() {
    var target = frame();
    if (target && target.contentWindow) target.contentWindow.postMessage({ type: "set-theme", theme: theme() }, origin);
  }
  function update(next, text) {
    if (disposed) return;
    state = next; card.dataset.state = next; status.textContent = text;
    skeleton.hidden = next !== "loading";
    button.disabled = next === "loading";
    button.textContent = next === "loading" ? "正在加载…" : next === "ready" ? container.hidden ? "展开评论" : "收起评论" : next === "error" || next === "slow" ? "重试加载" : "加载评论";
    button.setAttribute("aria-expanded", String(!container.hidden));
    network.hidden = next !== "slow" && next !== "error";
    network.textContent = frame() ? "重试会清除未提交的文字；也可继续等待或前往 GitHub。" : "连接较慢时，可以直接前往 GitHub 参与讨论。";
    container.setAttribute("aria-busy", String(next === "loading"));
  }
  function ready() {
    if (disposed || state === "ready") return;
    clearTimeout(timer); container.hidden = false;
    update("ready", "评论区已打开，登录 GitHub 即可参与交流。");
    syncTheme();
  }
  function watchFrame() {
    var target = frame();
    if (!target || target.dataset.commentsObserved) return;
    target.dataset.commentsObserved = "true";
    target.title = "文章评论：" + document.title;
    target.addEventListener("load", syncTheme, { once: true });
    syncTheme();
  }
  function message(event) {
    var target = frame();
    if (disposed || event.origin !== origin || !target || event.source !== target.contentWindow) return;
    if (event.data && event.data.type === "resize" && Number.isFinite(event.data.height) && event.data.height > 0) {
      var wrapper = container.querySelector(".utterances");
      if (wrapper) wrapper.style.height = event.data.height + "px";
      ready();
    }
  }
  function load() {
    if (disposed || state === "loading") return;
    if (state === "ready") {
      container.hidden = !container.hidden;
      update("ready", container.hidden ? "评论已收起，点击可继续交流。" : "评论区已打开，登录 GitHub 即可参与交流。");
      if (!container.hidden) syncTheme();
      return;
    }
    if (visibility) visibility.disconnect();
    clearTimeout(timer);
    // Keep a pending official script parented offscreen if a retry retires it.
    // Removing its parent before it executes can break the provider's setup.
    if (script) { script.onload = null; script.onerror = null; }
    var retired = document.createElement("div");
    while (container.firstChild) retired.appendChild(container.firstChild);
    container.hidden = false;
    update("loading", "正在连接评论服务，请稍候…");
    if (navigator.onLine === false) { container.hidden = true; update("error", "网络似乎已断开，联网后点击重试。"); return; }
    script = document.createElement("script"); script.src = origin + "/client.js";
    script.setAttribute("repo", "DunYujian/myproject");
    script.setAttribute("issue-term", "pathname"); script.setAttribute("theme", theme());
    script.crossOrigin = "anonymous"; script.async = true;
    script.onerror = function () { if (!disposed && state !== "ready") { clearTimeout(timer); container.hidden = true; update("error", "评论服务暂时无法连接，可以重试或到 GitHub 查看讨论。"); } };
    script.onload = watchFrame;
    container.appendChild(script);
    timer = setTimeout(function () {
      if (!disposed && state !== "ready") { container.hidden = !frame(); update("slow", "评论加载时间较长，可以继续等待，也可以重试。"); }
    }, 12000);
  }
  var mutations = new MutationObserver(watchFrame);
  mutations.observe(container, { childList: true, subtree: true });
  var themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  window.addEventListener("message", message);
  button.addEventListener("click", load);
  update("idle", "滚动到这里时自动加载，也可以点击下方按钮。");
  if ("IntersectionObserver" in window) {
    visibility = new IntersectionObserver(function (entries) { if (entries.some(function (entry) { return entry.isIntersecting; }) && state === "idle") load(); }, { rootMargin: "220px 0px" });
    visibility.observe(section);
  }
  if (location.hash === "#comments-title" || location.hash === "#comments-thread") load();
  document.addEventListener("site:before-navigate", function () {
    disposed = true; clearTimeout(timer);
    if (visibility) visibility.disconnect();
    mutations.disconnect(); themeObserver.disconnect();
    window.removeEventListener("message", message);
    if (script) { script.onload = null; script.onerror = null; }
  }, { once: true });
})();
