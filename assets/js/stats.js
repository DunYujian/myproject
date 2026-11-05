(function () {
  "use strict";

  var uv = document.getElementById("busuanzi_value_site_uv");
  var pv = document.getElementById("busuanzi_value_site_pv");
  var status = document.querySelector("[data-stats-status]");
  if (!status && uv && pv) {
    status = document.createElement("p");
    status.className = "sidebar-caption";
    status.setAttribute("role", "status");
    var panel = uv.closest(".sidebar-widget");
    if (panel) {
      var caption = panel.querySelector(".sidebar-caption");
      if (caption) caption.replaceWith(status); else panel.append(status);
    }
  }
  // Set to the deployed HTTPS Worker origin to switch providers.
  var endpoint = "";
  var provider = endpoint ? "本站统计" : "不蒜子";
  var cacheKey = endpoint ? "zaiye-owned-site-stats-v1" : "zaiye-site-stats-v1";
  var pending;
  var visitor;
  var timer;
  var observer;
  function valid(value) { return typeof value === "string" && /^\d+$/.test(value); }
  function unavailable() {
    if (!status) return;
    var saved;
    try { saved = JSON.parse(localStorage.getItem(cacheKey)); } catch (error) {}
    if (saved && valid(saved.uv) && valid(saved.pv) && Number.isFinite(saved.at)) {
      uv.textContent = saved.uv;
      pv.textContent = saved.pv;
      status.textContent = "统计服务暂不可用 · 上次记录：" + new Date(saved.at).toLocaleString("zh-CN");
    } else {
      status.textContent = "统计服务暂不可用，当前未取得数据。";
    }
  }
  function watch() {
    if (!status || !uv || !pv) return;
    clearTimeout(timer);
    if (observer) observer.disconnect();
    uv.textContent = pv.textContent = "—";
    status.textContent = "正在获取访问统计…";
    var changed = new Set();
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (record) { changed.add(uv.contains(record.target) ? uv : pv); });
      if (changed.size < 2 || !valid(uv.textContent) || !valid(pv.textContent)) return;
      clearTimeout(timer);
      status.textContent = "数据来自" + provider;
      try { localStorage.setItem(cacheKey, JSON.stringify({ uv: uv.textContent, pv: pv.textContent, at: Date.now() })); } catch (error) {}
    });
    observer.observe(uv, { childList: true, subtree: true, characterData: true });
    observer.observe(pv, { childList: true, subtree: true, characterData: true });
    timer = setTimeout(fallback, 8000);
  }
  function fallback() {
    clearTimeout(timer);
    if (observer) observer.disconnect();
    unavailable();
    // Resume observing so a late response can still replace the cached figures.
    if (observer) {
      observer.observe(uv, { childList: true, subtree: true, characterData: true });
      observer.observe(pv, { childList: true, subtree: true, characterData: true });
    }
  }

  function refresh() {
    // Local previews do not send statistics requests.
    if (!/^https?:$/.test(location.protocol) || /^(localhost|127\.[\d.]+|\[::1\])$/.test(location.hostname)) return;
    watch();
    if (endpoint) {
      if (pending) pending.abort();
      var request = pending = new AbortController();
      try {
        if (!visitor) {
          visitor = localStorage.getItem("zaiye-visitor-v1") || crypto.randomUUID();
          localStorage.setItem("zaiye-visitor-v1", visitor);
        }
      } catch (error) { visitor = visitor || crypto.randomUUID(); }
      fetch(new URL("/view", endpoint), {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "omit", signal: request.signal,
        body: JSON.stringify({ visitor: visitor, event: crypto.randomUUID(), path: location.pathname })
      }).then(function (response) {
        if (!response.ok) throw new Error("Statistics unavailable");
        return response.json();
      }).then(function (data) {
        if (pending !== request || request.signal.aborted) return;
        if (![data.uv, data.pv, data.pagePv].every(function (value) { return Number.isSafeInteger(value) && value >= 0; })) throw new Error("Invalid statistics");
        if (uv && pv) { uv.textContent = data.uv; pv.textContent = data.pv; }
        var article = document.getElementById("busuanzi_value_page_pv");
        var wrapper = document.getElementById("busuanzi_container_page_pv");
        if (article && wrapper) { article.textContent = data.pagePv; wrapper.style.display = ""; }
      }).catch(function () { if (pending === request && !request.signal.aborted) fallback(); });
      return;
    }
    var previous = document.querySelector("script[data-site-stats]");
    if (previous) previous.remove();
    var script = document.createElement("script");
    script.dataset.siteStats = "";
    script.src = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    script.async = true;
    script.onerror = fallback;
    script.referrerPolicy = "no-referrer-when-downgrade";
    document.head.appendChild(script);
  }
  window.ZaiyeStats = refresh;
  refresh();
})();
