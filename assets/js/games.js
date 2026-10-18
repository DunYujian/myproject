(function () {
  "use strict";
  var canvas = document.querySelector("#snake-board");
  if (!canvas || !window.ZaiyeSnake) return;
  var context = canvas.getContext("2d");
  var game = new window.ZaiyeSnake(20);
  var start = document.querySelector("#snake-start");
  var score = document.querySelector("#snake-score");
  var bestLabel = document.querySelector("#snake-best");
  var status = document.querySelector("#snake-status");
  var overlay = document.querySelector("#snake-overlay");
  var speed = document.querySelector("#snake-speed");
  var timer = 0;
  var best = 0;
  try { best = Math.max(0, Number(localStorage.getItem("snake-best")) || 0); } catch (error) {}
  bestLabel.textContent = best;

  function draw() {
    if (!context) return;
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.height = 400 * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    var style = getComputedStyle(document.documentElement);
    var accent = style.getPropertyValue("--accent").trim();
    var background = style.getPropertyValue("--surface").trim();
    context.fillStyle = background;
    context.fillRect(0, 0, 400, 400);
    context.strokeStyle = style.getPropertyValue("--line").trim();
    context.globalAlpha = .5;
    context.lineWidth = .5;
    for (var n = 1; n < 20; n++) {
      context.beginPath(); context.moveTo(n * 20, 0); context.lineTo(n * 20, 400); context.stroke();
      context.beginPath(); context.moveTo(0, n * 20); context.lineTo(400, n * 20); context.stroke();
    }
    context.globalAlpha = 1;
    game.snake.forEach(function (cell, index) {
      context.fillStyle = index === 0 ? accent : style.getPropertyValue("--accent-soft").trim();
      context.fillRect(cell.x * 20 + 1, cell.y * 20 + 1, 18, 18);
      if (index) { context.strokeStyle = accent; context.strokeRect(cell.x * 20 + 1, cell.y * 20 + 1, 18, 18); }
    });
    if (game.food) {
      context.fillStyle = document.documentElement.dataset.theme === "dark" ? "#dfb178" : "#a86732";
      context.beginPath(); context.arc(game.food.x * 20 + 10, game.food.y * 20 + 10, 6, 0, Math.PI * 2); context.fill();
    }
  }
  function pause(message) {
    if (!timer) return;
    clearInterval(timer); timer = 0;
    start.textContent = "继续游戏";
    status.textContent = message || "已暂停，点击继续游戏。";
  }
  function tick() {
    var oldScore = game.score;
    game.step();
    draw();
    if (oldScore !== game.score) {
      score.textContent = game.score;
      status.textContent = "吃到了！当前 " + game.score + " 分。";
      if (game.score > best) {
        best = game.score; bestLabel.textContent = best;
        try { localStorage.setItem("snake-best", String(best)); } catch (error) {}
      }
    }
    if (game.over) {
      clearInterval(timer); timer = 0;
      overlay.hidden = false;
      overlay.querySelector("strong").textContent = game.won ? "全部吃满！" : "本局结束";
      status.textContent = "本局 " + game.score + " 分，" + (game.won ? "你赢了！" : "再试一次吧。");
      start.textContent = "再玩一次";
    }
  }
  function run() {
    if (timer) return;
    if (game.over) reset();
    timer = setInterval(tick, Number(speed.value));
    start.textContent = "暂停游戏";
    status.textContent = "游戏中，使用方向键、WASD 或下方按钮转向。";
    canvas.focus({ preventScroll: true });
  }
  function reset() {
    clearInterval(timer); timer = 0;
    game.reset(); score.textContent = "0"; overlay.hidden = true;
    start.textContent = "开始游戏";
    status.textContent = "准备好了，点击开始游戏。";
    draw();
  }
  start.addEventListener("click", function () { if (timer) pause(); else run(); });
  document.querySelector("#snake-restart").addEventListener("click", function () { reset(); run(); });
  speed.addEventListener("change", function () { if (timer) { clearInterval(timer); timer = setInterval(tick, Number(speed.value)); } });
  var keys = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", w: "up", s: "down", a: "left", d: "right" };
  canvas.addEventListener("keydown", function (event) {
    var direction = keys[event.key] || keys[event.key.toLowerCase()];
    if (direction) { event.preventDefault(); game.turn(direction); }
    else if (event.code === "Space") { event.preventDefault(); if (timer) pause(); else run(); }
  });
  document.querySelectorAll("[data-direction]").forEach(function (button) {
    button.addEventListener("click", function () { game.turn(button.dataset.direction); canvas.focus({ preventScroll: true }); });
  });
  var touchStart;
  canvas.addEventListener("touchstart", function (event) {
    touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }, { passive: true });
  canvas.addEventListener("touchend", function (event) {
    if (!touchStart) return;
    var dx = event.changedTouches[0].clientX - touchStart.x;
    var dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 15) game.turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    touchStart = null;
  }, { passive: true });
  document.addEventListener("visibilitychange", function () { if (document.hidden) pause("已自动暂停，回来后点击继续。 "); });
  window.addEventListener("blur", function () { pause(); });
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  draw();

  // Memory game: six pairs, with a cancellable mismatch delay on restart.
  var board = document.querySelector("#memory-board");
  var memoryStatus = document.querySelector("#memory-status");
  var first = null;
  var locked = false;
  var moves = 0;
  var matched = 0;
  var mismatchTimer = 0;
  function closeCard(card) {
    card.classList.remove("is-open");
    card.innerHTML = '<span class="memory-card__back" aria-hidden="true">记</span>';
    card.setAttribute("aria-label", "第 " + card.dataset.position + " 张，未翻开");
  }
  function newMemory() {
    clearTimeout(mismatchTimer); mismatchTimer = 0;
    first = null; locked = false; moves = matched = 0;
    document.querySelector("#memory-moves").textContent = "0";
    document.querySelector("#memory-matched").textContent = "0 / 6";
    memoryStatus.textContent = "翻开两张牌，找出相同的汉字。";
    var symbols = ["鱼", "月", "舟", "叶", "雨", "山"];
    var cards = symbols.concat(symbols);
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var value = cards[i]; cards[i] = cards[j]; cards[j] = value;
    }
    board.replaceChildren();
    cards.forEach(function (symbol, index) {
      var card = document.createElement("button");
      card.type = "button"; card.className = "memory-card";
      card.dataset.symbol = symbol; card.dataset.position = String(index + 1);
      closeCard(card); board.appendChild(card);
    });
  }
  board.addEventListener("click", function (event) {
    var card = event.target.closest(".memory-card");
    if (!card || locked || card.disabled || card === first) return;
    card.classList.add("is-open"); card.textContent = card.dataset.symbol;
    card.setAttribute("aria-label", "第 " + card.dataset.position + " 张，" + card.dataset.symbol);
    if (!first) { first = card; return; }
    moves++; document.querySelector("#memory-moves").textContent = moves;
    var previous = first; first = null;
    if (previous.dataset.symbol === card.dataset.symbol) {
      [previous, card].forEach(function (item) { item.disabled = true; item.classList.add("is-matched"); item.setAttribute("aria-label", item.dataset.symbol + "，已配对"); });
      matched++; document.querySelector("#memory-matched").textContent = matched + " / 6";
      memoryStatus.textContent = matched === 6 ? "全部找到了！用了 " + moves + " 次，做得不错。" : "配对成功，继续找下一对。";
    } else {
      locked = true; memoryStatus.textContent = "这两张不一样，再记一下位置。";
      mismatchTimer = setTimeout(function () { closeCard(previous); closeCard(card); locked = false; memoryStatus.textContent = "继续找下一对。"; }, 700);
    }
  });
  document.querySelector("#memory-restart").addEventListener("click", newMemory);
  newMemory();

  var tabs = Array.from(document.querySelectorAll("[data-game-tab]"));
  function switchGame(name, changeURL) {
    name = name === "memory" ? "memory" : "snake";
    if (name !== "snake") pause();
    tabs.forEach(function (tab) {
      var selected = tab.dataset.gameTab === name;
      tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll("[data-game-panel]").forEach(function (panel) { panel.hidden = panel.dataset.gamePanel !== name; });
    if (changeURL) history.replaceState(null, "", "#" + name);
    if (name === "snake") draw();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { switchGame(tab.dataset.gameTab, true); });
    tab.addEventListener("keydown", function (event) {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      var next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      switchGame(tabs[next].dataset.gameTab, true); tabs[next].focus();
    });
  });
  window.addEventListener("hashchange", function () { switchGame(location.hash.slice(1), false); });
  switchGame(location.hash.slice(1), false);
})();
