(function () {
  "use strict";
  var script = document.currentScript;
  var base = new URL("../../", script.src);
  var calendar = document.querySelector("[data-calendar]");
  if (calendar) {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth();
    var label = calendar.querySelector("[data-calendar-label]");
    var body = calendar.querySelector("tbody");
    calendar.querySelector("[data-calendar-date]").textContent = today.toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "short" });
    function render() {
      label.textContent = year + "年 " + (month + 1) + "月";
      calendar.querySelector("table").setAttribute("aria-label", label.textContent + "日历");
      body.replaceChildren();
      var offset = (new Date(year, month, 1).getDay() + 6) % 7;
      var days = new Date(year, month + 1, 0).getDate();
      for (var row = 0; row < Math.ceil((offset + days) / 7); row++) {
        var tr = document.createElement("tr");
        for (var col = 0; col < 7; col++) {
          var day = row * 7 + col - offset + 1;
          var td = document.createElement("td");
          if (day > 0 && day <= days) {
            var span = document.createElement("span");
            span.textContent = day;
            td.appendChild(span);
            if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) td.setAttribute("aria-current", "date");
          }
          tr.appendChild(td);
        }
        body.appendChild(tr);
      }
    }
    calendar.addEventListener("click", function (event) {
      var button = event.target.closest("[data-calendar-step], [data-calendar-today]");
      if (!button) return;
      if (button.hasAttribute("data-calendar-today")) { year = today.getFullYear(); month = today.getMonth(); }
      else { var date = new Date(year, month + Number(button.dataset.calendarStep), 1); year = date.getFullYear(); month = date.getMonth(); }
      render();
    });
    render();
  }
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
