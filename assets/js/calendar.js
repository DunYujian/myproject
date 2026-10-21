(function () {
  "use strict";
  var engine = window.ZaiyeCalendar, calendar = document.querySelector("[data-calendar]"), clock = document.querySelector("[data-clock]");
  var today = new Date(), selected = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  var year = selected.getFullYear(), month = selected.getMonth(), timer;
  var clockFormat = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
  var dateFormat = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  function node(name) { return calendar.querySelector("[data-calendar-" + name + "]"); }
  function describe(date, info) { return dateFormat.format(date) + (info.lunar ? "，农历" + info.lunar.month + info.lunar.dayText : "") + (info.events.length ? "，" + info.events.join("、") : ""); }
  function select(date, focus) { selected = date; year = date.getFullYear(); month = date.getMonth(); render(); if (focus) calendar.querySelector('[data-calendar-day="' + engine.key(date) + '"]').focus({ preventScroll: true }); }
  function render() {
    if (!calendar || !engine) return;
    node("label").textContent = year + "年 " + (month + 1) + "月";
    calendar.querySelector("table").setAttribute("aria-label", year + "年" + (month + 1) + "月，公历与农历");
    var body = calendar.querySelector("tbody"), offset = (new Date(year, month, 1).getDay() + 6) % 7, days = new Date(year, month + 1, 0).getDate();
    body.replaceChildren(); node("events").replaceChildren();
    for (var row = 0; row < Math.ceil((offset + days) / 7); row++) {
      var tr = document.createElement("tr");
      for (var col = 0; col < 7; col++) {
        var day = row * 7 + col - offset + 1, td = document.createElement("td");
        if (day > 0 && day <= days) {
          var date = new Date(year, month, day, 12), info = engine.info(date), button = document.createElement("button");
          button.type = "button"; button.className = "calendar-day"; button.dataset.calendarDay = info.key;
          button.setAttribute("aria-label", describe(date, info));
          button.setAttribute("aria-pressed", String(info.key === engine.key(selected)));
          button.tabIndex = info.key === engine.key(selected) ? 0 : -1;
          if (info.key === engine.key(today)) button.setAttribute("aria-current", "date");
          if (col > 4) button.classList.add("is-weekend");
          var number = document.createElement("span"), sub = document.createElement("small");
          number.className = "calendar-day-number"; number.textContent = day;
          sub.textContent = info.events[0] || (info.lunar ? info.lunar.day === 1 ? info.lunar.month : info.lunar.dayText : "");
          if (info.events.length) button.classList.add("has-festival");
          button.append(number, sub); td.appendChild(button);
          if (info.events.length) {
            var li = document.createElement("li"), eventButton = document.createElement("button");
            eventButton.type = "button"; eventButton.dataset.calendarDay = info.key;
            eventButton.textContent = (month + 1) + "/" + day + " · " + info.events.join("、"); li.appendChild(eventButton); node("events").appendChild(li);
          }
        }
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
    var detail = engine.info(selected);
    node("date").textContent = dateFormat.format(selected);
    node("lunar").textContent = detail.lunar ? "农历 " + detail.lunar.month + detail.lunar.dayText + " · " + detail.lunar.yearText : "当前浏览器暂不支持农历显示";
    node("festival").textContent = detail.events.length ? detail.events.join(" · ") : "平常日子，也值得好好过。";
    node("events-empty").hidden = node("events").children.length > 0;
  }
  if (calendar && engine) {
    calendar.addEventListener("click", function (event) {
      var button = event.target.closest("button"); if (!button) return;
      if (button.dataset.calendarDay) { var parts = button.dataset.calendarDay.split("-").map(Number); select(new Date(parts[0], parts[1] - 1, parts[2], 12), false); }
      else if (button.hasAttribute("data-calendar-today")) select(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12), false);
      else if (button.hasAttribute("data-calendar-step")) { var next = new Date(year, month + Number(button.dataset.calendarStep), 1, 12); next.setDate(Math.min(selected.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate())); select(next, false); }
    });
    calendar.addEventListener("keydown", function (event) {
      if (!event.target.matches(".calendar-day")) return;
      var steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (steps[event.key]) { event.preventDefault(); select(new Date(year, month, selected.getDate() + steps[event.key], 12), true); }
    });
    render();
  }
  if (clock) {
    var zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    clock.querySelector("[data-clock-zone]").textContent = zone === "Asia/Shanghai" ? "北京时间 · 24小时制" : "当地时间 · " + zone;
  }
  function tick() {
    var now = new Date();
    if (clock) { var time = clock.querySelector("time"); time.textContent = clockFormat.format(now); time.dateTime = now.toISOString(); clock.querySelector("[data-clock-date]").textContent = dateFormat.format(now); }
    if (engine && engine.key(now) !== engine.key(today)) {
      var followedToday = engine.key(selected) === engine.key(today); today = now;
      if (followedToday) select(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12), false); else render();
    }
    if (!document.hidden) timer = setTimeout(tick, 1000 - Date.now() % 1000);
  }
  document.addEventListener("visibilitychange", function () { clearTimeout(timer); tick(); });
  tick();
})();
