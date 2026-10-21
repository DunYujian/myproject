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

  function measureContent() {
    var content = document.querySelector(".site-layout > main") || document.querySelector("main .wrap");
    var bounds = content ? content.getBoundingClientRect() : { left: width * .2, right: width * .8 };
    contentLeft = bounds.left; contentRight = bounds.right;
  }
  function makeFish(index, count) {
    var left = index % 2 === 0;
    var size = .68 + Math.random() * .28;
    return { x: width * (left ? .035 + Math.random() * .075 : .89 + Math.random() * .075),
      y: height * (.16 + index / count * .68), direction: left ? 1 : -1,
      heading: left ? .08 : Math.PI - .08, speed: 5 + Math.random() * 5,
      size: size, scale: width < 600 ? size * .68 : size,
      phase: Math.random() * Math.PI * 2, beat: Math.random() * Math.PI * 2 };
  }
  function resize() {
    var oldWidth = width, oldHeight = height;
    width = window.innerWidth; height = window.innerHeight;
    var pixelRatio = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.5 : 2);
    canvas.width = Math.round(width * pixelRatio); canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    measureContent();
    var count = width >= 1100 ? 5 : width >= 600 ? 3 : 2;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) count = Math.min(count, 3);
    fish = Array.from({ length: count }, function (_, index) {
      var item = fish[index];
      if (!item || !oldWidth || !oldHeight) return makeFish(index, count);
      item.x *= width / oldWidth; item.y *= height / oldHeight;
      item.scale = width < 600 ? item.size * .68 : item.size;
      return item;
    });
    readTheme(); previousTime = 0;
  }
  function smooth(value) { value = Math.max(0, Math.min(1, value)); return value * value * (3 - 2 * value); }
  function moveFish(item, delta) {
    // Ease into turns instead of teleporting to the opposite edge.
    if (item.x > width - 25) item.direction = -1;
    else if (item.x < 25) item.direction = 1;
    var drift = Math.sin(elapsed * .17 + item.phase) * .15;
    if (item.y < 100) drift = .25;
    if (item.y > height - 55) drift = -.25;
    var target = item.direction === 1 ? drift : Math.PI - drift;
    var difference = Math.atan2(Math.sin(target - item.heading), Math.cos(target - item.heading));
    item.heading += difference * (1 - Math.exp(-delta * 1.15));
    var pace = item.speed * (.85 + .15 * Math.sin(elapsed * .24 + item.phase));
    item.x += Math.cos(item.heading) * pace * delta;
    item.y += Math.sin(item.heading) * pace * delta;
    item.beat += delta * (1.7 + pace * .06);
  }
  function drawFish(item) {
    var bob = Math.sin(elapsed * .25 + item.phase) * Math.min(10, height * .015);
    var outside = Math.max(contentLeft - item.x, item.x - contentRight);
    var margin = smooth(outside / 70);
    var opacity = width < 600 ? .065 : .028 + margin * (dark ? .22 : .25);
    context.save();
    context.globalAlpha = opacity;
    context.strokeStyle = color; context.lineWidth = 1.15; context.lineCap = "round"; context.lineJoin = "round";
    context.translate(item.x, item.y + bob);
    // Narrow the body during a turn, keeping the silhouette upright.
    context.rotate(Math.sin(item.heading) * .16);
    context.scale(Math.cos(item.heading) * item.scale, item.scale);
    var tail = Math.sin(item.beat) * 4.5, bend = Math.sin(item.beat - .65) * 1.1;
    context.beginPath();
    context.moveTo(22, 0);
    context.bezierCurveTo(10, -12, -8, -12 + bend, -20, bend);
    context.bezierCurveTo(-8, 12 + bend, 10, 12, 22, 0);
    context.moveTo(-20, bend);
    context.quadraticCurveTo(-27, -5 + tail * .6, -35, -11 + tail);
    context.quadraticCurveTo(-31, tail, -35, 11 + tail);
    context.quadraticCurveTo(-27, 5 + tail * .6, -20, bend);
    context.moveTo(-6, -9);
    context.quadraticCurveTo(-4, -17 + bend, 9, -8);
    context.moveTo(-5, 9);
    context.quadraticCurveTo(1, 15 - bend, 8, 8);
    context.moveTo(7, -7);
    context.quadraticCurveTo(2, 0, 7, 7);
    context.moveTo(0, 2);
    context.quadraticCurveTo(-4, 7 + bend, 3, 6);
    context.stroke();
    context.beginPath(); context.arc(13, -2, .9, 0, Math.PI * 2); context.stroke();
    context.restore();
  }
  function animate(now) {
    frame = 0;
    if (!enabled() || document.hidden) return;
    if (!previousTime) previousTime = now;
    var delta = (now - previousTime) / 1000;
    if (delta >= 1 / (width < 600 ? 24 : 30)) {
      delta = Math.min(delta, .08); previousTime = now; elapsed += delta;
      context.clearRect(0, 0, width, height);
      fish.forEach(function (item) { moveFish(item, delta); drawFish(item); });
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
  document.addEventListener("site:after-navigate", measureContent);
  window.addEventListener("storage", function (event) {
    if (event.key === "fish-motion") { preference = event.newValue || "on"; refresh(); }
  });
  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", refresh);
  else if (reducedMotion.addListener) reducedMotion.addListener(refresh);
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  resize();
  refresh();
})();
