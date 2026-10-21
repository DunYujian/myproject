(function () {
  "use strict";
  if (!window.fetch || !window.DOMParser || !history.pushState) return;
  var root = new URL("../../", document.currentScript.src), active = new URL(location.href);
  var request = 0, controller, busy = false, committing = false, queued, scrollTimer;
  var shared = /\/assets\/css\/(reading|fish|widgets|music)\.css$/;
  function absolute(container, base) {
    container.querySelectorAll("a[href],link[href],img[src],script[src],iframe[src],source[src],form[action]").forEach(function (node) {
      var attribute = node.hasAttribute("href") ? "href" : node.hasAttribute("src") ? "src" : "action";
      node.setAttribute(attribute, new URL(node.getAttribute(attribute), base).href);
    });
  }
  absolute(document, location.href);
  function pageStyles(doc, url) {
    return Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(function (node) { return new URL(node.getAttribute("href"), url).href; }).filter(function (href) { return !shared.test(new URL(href).pathname); });
  }
  function loadStyle(href) {
    if (Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(function (link) { return link.href === href; })) return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var link = document.createElement("link"); link.rel = "stylesheet"; link.href = href;
      var timer = setTimeout(function () { link.remove(); reject(new Error("Stylesheet timeout")); }, 10000);
      link.onload = function () { clearTimeout(timer); resolve(); }; link.onerror = function () { clearTimeout(timer); reject(new Error("Stylesheet unavailable")); }; document.head.appendChild(link);
    });
  }
  function script(href) {
    return new Promise(function (resolve, reject) {
      var node = document.createElement("script"); node.src = href; node.dataset.pageModule = "";
      var timer = setTimeout(function () { node.remove(); reject(new Error("Script timeout")); }, 10000);
      node.onload = function () { clearTimeout(timer); resolve(); }; node.onerror = function () { clearTimeout(timer); reject(new Error("Script unavailable")); }; document.body.appendChild(node);
    });
  }
  function rememberScroll() {
    history.replaceState(Object.assign({}, history.state, { zaiyeScroll: [scrollX, scrollY] }), "");
  }
  function scrollToTarget(url, position) {
    var target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ left: position ? position[0] : 0, top: position ? position[1] : 0, behavior: "instant" });
  }
  async function navigate(url, pop, position) {
    if (committing) { queued = { url: url, pop: pop, position: position }; return; }
    var legacy = { "#snake": "snake", "#memory": "memory", "#story": "story" };
    if (url.pathname === root.pathname + "games.html" && legacy[url.hash]) url = new URL("games/" + legacy[url.hash] + "/", root);
    if (controller) controller.abort();
    controller = new AbortController(); var id = ++request, currentController = controller;
    busy = true; clearTimeout(scrollTimer);
    document.documentElement.classList.add("is-navigating");
    document.querySelector("main").setAttribute("aria-busy", "true");
    var timeout = setTimeout(function () { currentController.abort(); }, 12000);
    try {
      var response = await fetch(url.href, { signal: currentController.signal, headers: { "X-Requested-With": "ZaiyeNavigation" } });
      if (!response.ok || !(response.headers.get("content-type") || "").includes("text/html")) throw new Error("Page unavailable");
      var html = await response.text(), doc = new DOMParser().parseFromString(html, "text/html");
      var main = doc.querySelector(".site-layout > main"), nav = doc.querySelector("#nav");
      if (!main || !doc.querySelector("[data-music-player]")) throw new Error("Unsupported page");
      var destination = new URL(response.url); destination.hash = url.hash;
      var styles = pageStyles(doc, destination.href);
      await Promise.all(styles.map(loadStyle));
      if (id !== request) return;
      committing = true;
      document.dispatchEvent(new CustomEvent("site:before-navigate"));
      // Keep sidebars, the audio element and their listeners in the document.
      absolute(main, destination.href);
      document.querySelector("main").replaceWith(main);
      document.body.dataset.page = doc.body.dataset.page || "";
      document.title = doc.title;
      ["description", "og:title", "og:description", "og:url"].forEach(function (name) {
        var selector = name.startsWith("og:") ? 'meta[property="' + name + '"]' : 'meta[name="' + name + '"]';
        var source = doc.querySelector(selector), target = document.querySelector(selector);
        if (source && target) target.content = source.content;
      });
      var canonical = doc.querySelector('link[rel="canonical"]'), currentCanonical = document.querySelector('link[rel="canonical"]');
      if (canonical && currentCanonical) currentCanonical.href = canonical.href;
      if (nav) { absolute(nav, destination.href); document.querySelector("#nav").innerHTML = nav.innerHTML; }
      document.querySelectorAll(".nav a[data-nav]").forEach(function (link) {
        var page = document.body.dataset.page;
        if (link.dataset.nav === page || (page === "post" && link.dataset.nav === "posts")) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
      });
      document.querySelector("#nav").classList.remove("is-open");
      var toggle = document.querySelector(".nav-toggle"); if (toggle) toggle.setAttribute("aria-expanded", "false");
      document.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) { if (!shared.test(new URL(link.href).pathname) && !styles.includes(link.href)) link.remove(); });
      document.querySelectorAll("script[data-page-module]").forEach(function (node) { node.remove(); });
      if (pop) history.replaceState(Object.assign({}, history.state, { zaiyeScroll: position || [0, 0] }), "", destination.href);
      else history.pushState({ zaiyeScroll: [0, 0] }, "", destination.href);
      active = destination;
      var modules = Array.from(doc.querySelectorAll("script[src]")).map(function (node) { return new URL(node.getAttribute("src"), destination.href); }).filter(function (src) {
        return src.origin === root.origin && (/\/assets\/js\/(categories|comments)\.js$/.test(src.pathname) || /\/games\/(snake|memory|story)\/(engine|game)\.js$/.test(src.pathname));
      });
      for (var module of modules) { if (id !== request) return; await script(module.href); }
      main.querySelectorAll(".prose pre[data-lang]").forEach(function (pre) { pre.classList.add("has-lang"); var badge = document.createElement("span"); badge.className = "code-lang"; badge.textContent = pre.dataset.lang; pre.appendChild(badge); });
      if (window.ZaiyeStats) window.ZaiyeStats();
      main.tabIndex = -1; main.focus({ preventScroll: true }); scrollToTarget(destination, position);
      document.dispatchEvent(new CustomEvent("site:after-navigate"));
    } catch (error) {
      // Preserve normal navigation if a page cannot be fetched or initialized.
      if (id === request) { if (pop) location.replace(url.href); else location.assign(url.href); }
    } finally {
      clearTimeout(timeout);
      if (id === request) {
        busy = false; committing = false; document.documentElement.classList.remove("is-navigating"); document.querySelector("main").removeAttribute("aria-busy");
        if (queued) { var next = queued; queued = null; navigate(next.url, next.pop, next.position); }
      }
    }
  }
  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    var url = new URL(link.href);
    if (url.origin !== root.origin || !url.pathname.startsWith(root.pathname) || !/(\.html|\/)$/i.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash && !/^#(snake|memory|story)$/.test(url.hash)) return;
    event.preventDefault(); if (!busy) rememberScroll(); navigate(url, false);
  });
  window.addEventListener("popstate", function (event) {
    var url = new URL(location.href);
    if (url.pathname === active.pathname) { active = url; requestAnimationFrame(function () { scrollToTarget(url, event.state && event.state.zaiyeScroll); }); return; }
    navigate(url, true, event.state && event.state.zaiyeScroll);
  });
  window.addEventListener("scroll", function () { if (!busy) { clearTimeout(scrollTimer); scrollTimer = setTimeout(rememberScroll, 120); } }, { passive: true });
  history.scrollRestoration = "manual"; rememberScroll();
})();
