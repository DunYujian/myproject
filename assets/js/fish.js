(function () {
  "use strict";

  var header = document.querySelector(".site-header__inner");
  if (!header) return;
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  if (!context) return;
  canvas.className = "swimming-fish";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  var button = document.createElement("button");
  button.type = "button";
  button.className = "icon-btn fish-toggle";
  button.innerHTML = '<svg viewBox="0 0 32 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12c6-9 14-9 20 0-6 9-14 9-20 0Zm20 0 6-6v12Z"/><circle cx="9" cy="11" r=".8"/><path class="fish-toggle__pause" d="m4 22 23-20"/></svg>';
  header.appendChild(button);

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var preference = "on";
  try { preference = localStorage.getItem("fish-motion") || "on"; } catch (error) {}
  var fish = [];
  var width = 0;
  var height = 0;
  var contentLeft = 0;
  var contentRight = 0;
  var dark = false;
  var color = "";
  var frame = 0;
  var previousTime = 0;
  var elapsed = 0;
  var resizeTimer;

  function enabled() {
    return preference !== "off" && !reducedMotion.matches;
  }

  function readTheme() {
    dark = document.documentElement.getAttribute("data-theme") === "dark";
    color = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    var content = document.querySelector(".wrap");
    var bounds = content ? content.getBoundingClientRect() : { left: width * .2, right: width * .8 };
    contentLeft = bounds.left;
    contentRight = bounds.right;
    var count = width >= 1100 ? 5 : width >= 600 ? 3 : 2;
    fish = Array.from({ length: count }, function (_, index) {
      var gutter = Math.max(45, contentLeft);
      var left = index % 2 === 0;
      return {
        x: width >= 1100 ? (left ? gutter * (.25 + Math.random() * .4) : width - gutter * (.25 + Math.random() * .4)) : Math.random() * width,
        y: height * (.16 + index / count * .7),
        direction: left ? 1 : -1,
        speed: 7 + Math.random() * 8,
        scale: width < 600 ? .5 + Math.random() * .2 : .75 + Math.random() * .35,
        phase: Math.random() * Math.PI * 2
      };
    });
    readTheme();
    previousTime = 0;
  }

  function drawFish(item) {
    var y = item.y + Math.sin(elapsed * .16 + item.phase) * Math.min(36, height * .04);
    var insideReadingArea = item.x > contentLeft - 35 && item.x < contentRight + 35;
    context.save();
    // The fish are most visible in the margins, faint behind reading text.
    context.globalAlpha = width < 600 ? .1 : insideReadingArea ? .055 : dark ? .29 : .37;
    context.strokeStyle = color;
    context.lineWidth = 1.25;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.translate(item.x, y);
    context.rotate(Math.sin(elapsed * .16 + item.phase) * .1);
    context.scale(item.direction * item.scale, item.scale);
    var tail = Math.sin(elapsed * 2.2 + item.phase) * 3;
    context.beginPath();
    context.moveTo(22, 0);
    context.bezierCurveTo(10, -14, -8, -14, -20, 0);
    context.bezierCurveTo(-8, 14, 10, 14, 22, 0);
    context.moveTo(-20, 0);
    context.lineTo(-34, -10 + tail);
    context.quadraticCurveTo(-30, tail, -34, 10 + tail);
    context.closePath();
    context.moveTo(-5, -10);
    context.quadraticCurveTo(-7, -20, 9, -9);
    context.moveTo(-5, 10);
    context.quadraticCurveTo(-2, 17, 7, 10);
    context.moveTo(7, -7);
    context.quadraticCurveTo(2, 0, 7, 7);
    context.stroke();
    context.beginPath();
    context.arc(13, -2, 1.1, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  function animate(now) {
    frame = 0;
    if (!enabled() || document.hidden) return;
    if (!previousTime) previousTime = now;
    var delta = (now - previousTime) / 1000;
    if (delta >= 1 / 30) {
      delta = Math.min(delta, .1);
      previousTime = now;
      elapsed += delta;
      context.clearRect(0, 0, width, height);
      fish.forEach(function (item) {
        item.x += item.direction * item.speed * delta;
        if (item.x > width + 60) item.x = -60;
        if (item.x < -60) item.x = width + 60;
        drawFish(item);
      });
    }
    frame = requestAnimationFrame(animate);
  }

  function refresh() {
    var active = enabled();
    canvas.hidden = !active;
    button.disabled = reducedMotion.matches;
    button.setAttribute("aria-pressed", String(active));
    var label = reducedMotion.matches ? "系统已开启减少动态效果" : active ? "暂停游鱼动画" : "开启游鱼动画";
    button.setAttribute("aria-label", label);
    button.title = label;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
    if (active && !document.hidden) frame = requestAnimationFrame(animate);
    else context.clearRect(0, 0, width, height);
  }

  button.addEventListener("click", function () {
    preference = enabled() ? "off" : "on";
    try { localStorage.setItem("fish-motion", preference); } catch (error) {}
    refresh();
  });
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { resize(); refresh(); }, 150);
  });
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("storage", function (event) {
    if (event.key === "fish-motion") { preference = event.newValue || "on"; refresh(); }
  });
  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", refresh);
  else if (reducedMotion.addListener) reducedMotion.addListener(refresh);
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  resize();
  refresh();
})();
