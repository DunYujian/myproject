(function () {
  "use strict";
  var script = document.currentScript;
  var base = new URL("../../", script.src);
  var facts = document.querySelector("[data-site-facts]");
  if (!facts) return;
  var controller = new AbortController();
  var timeout = setTimeout(function () { controller.abort(); }, 8000);
  // Read the published article list so new articles update these details too.
  fetch(new URL("posts/index.html", base), { signal: controller.signal }).then(function (response) {
    if (!response.ok) throw new Error("Article list unavailable");
    return response.text();
  }).then(function (html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var articles = doc.querySelectorAll(".post-list .post-item");
    facts.querySelector("[data-site-posts]").textContent = articles.length + " 篇";
    facts.querySelector("[data-site-categories]").textContent = doc.querySelectorAll("[data-category]:not([data-category=''])").length + " 类";
    var dates = Array.from(articles).map(function (item) { var time = item.querySelector("time[datetime]"); return time ? time.getAttribute("datetime") : ""; }).filter(Boolean).sort();
    facts.querySelector("[data-site-latest]").textContent = dates.length ? dates[dates.length - 1] : "暂无文章";
  }).catch(function () {
    facts.querySelector("[data-site-posts]").textContent = "查看归档 →";
    facts.querySelector("[data-site-categories]").textContent = "查看分类 →";
    facts.querySelector("[data-site-latest]").textContent = "暂不可用";
  }).finally(function () { clearTimeout(timeout); });
})();
