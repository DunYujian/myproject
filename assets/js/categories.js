(function () {
  "use strict";

  var controls = document.querySelector("[data-category-controls]");
  if (!controls) return;
  var items = Array.from(document.querySelectorAll(".post-item[data-categories]"));
  var buttons = Array.from(controls.querySelectorAll("[data-category]"));
  var names = buttons.map(function (button) { return button.dataset.category; }).filter(Boolean);
  var selected = new Set();
  var counter = document.querySelector("[data-category-count]");
  var empty = document.querySelector("[data-category-empty]");

  function update(writeHistory) {
    var visible = 0;
    items.forEach(function (item) {
      var categories = item.dataset.categories.split(/\s+/);
      var matches = Array.from(selected).every(function (name) { return categories.includes(name); });
      item.hidden = !matches;
      if (matches) visible++;
    });
    buttons.forEach(function (button) {
      var name = button.dataset.category;
      button.setAttribute("aria-pressed", String(name ? selected.has(name) : selected.size === 0));
    });
    counter.textContent = selected.size ? "筛选出 " + visible + " 篇 / 共 " + items.length + " 篇" : "共 " + items.length + " 篇";
    empty.hidden = visible !== 0;
    document.title = (selected.size ? Array.from(selected).join(" · ") : "文章") + " · 再也的博客";

    if (writeHistory) {
      var url = new URL(location.href);
      url.searchParams.delete("category");
      names.forEach(function (name) { if (selected.has(name)) url.searchParams.append("category", name); });
      history.pushState(null, "", url.pathname + url.search + url.hash);
    }
  }

  function readURL() {
    selected = new Set(new URL(location.href).searchParams.getAll("category").filter(function (name) {
      return names.includes(name);
    }));
    update(false);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var name = button.dataset.category;
      if (!name) selected.clear();
      else if (selected.has(name)) selected.delete(name);
      else selected.add(name);
      update(true);
    });
  });
  document.querySelector("[data-category-reset]").addEventListener("click", function () {
    selected.clear();
    update(true);
    buttons[0].focus();
  });
  window.addEventListener("popstate", readURL);
  controls.hidden = false;
  readURL();
})();
