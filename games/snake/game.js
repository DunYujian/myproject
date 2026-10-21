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
  function onHidden() { if (document.hidden) pause("已自动暂停，回来后点击继续。 "); }
  function onBlur() { pause(); }
  document.addEventListener("visibilitychange", onHidden);
  window.addEventListener("blur", onBlur);
  var observer = new MutationObserver(draw);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  document.addEventListener("site:before-navigate", function () { clearInterval(timer); observer.disconnect(); document.removeEventListener("visibilitychange", onHidden); window.removeEventListener("blur", onBlur); }, { once: true });
  draw();

})();
