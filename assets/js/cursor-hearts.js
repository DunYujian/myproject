(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:20";
  canvas.hidden = true;
  document.body.append(canvas);

  const keys = ["heart", "cake", "star", "fish", "dog", "cat"];
  const imageBase = new URL("../images/cursor/", document.currentScript.src);
  const images = new Map();
  function sprite(key) {
    if (!images.has(key)) {
      const img = new Image();
      img.src = new URL(key + ".svg", imageBase);
      images.set(key, img);
    }
    return images.get(key);
  }
  let enabled = true;
  try { enabled = localStorage.getItem("zaiye-cursor-style") !== "off"; } catch {}
  const header = document.querySelector(".site-header__inner");
  const intro = document.querySelector(".landing .intro");
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "鼠标特效");
  if (header) {
    button.className = "icon-btn";
    button.style.cssText = "order:2;flex:none;min-width:28px";
    const theme = header.querySelector(".theme-toggle");
    if (theme) theme.after(button); else header.append(button);
  } else if (intro) {
    intro.after(button);
  }
  function syncButton() {
    button.hidden = reduce.matches;
    button.style.display = reduce.matches ? "none" : "";
    button.setAttribute("aria-pressed", String(enabled));
    button.title = enabled ? "关闭鼠标特效" : "开启鼠标特效";
    button.textContent = header ? (enabled ? "✦" : "✧") : (enabled ? "✦ 鼠标特效：开" : "✧ 鼠标特效：关");
  }
  syncButton();
  button.addEventListener("click", () => {
    enabled = !enabled;
    try { localStorage.setItem("zaiye-cursor-style", enabled ? "random" : "off"); } catch {}
    syncButton();
    stop();
  });

  const particles = [];
  let frame = 0, last = -Infinity, width, height;
  function resize() {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    particles.length = 0;
    canvas.hidden = true;
    last = -Infinity;
  }
  function draw(now) {
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const t = Math.max(0, (now - p.start) / 850);
      if (t >= 1) { particles.splice(i, 1); continue; }
      const size = p.size * (1 - .75 * t);
      ctx.save();
      ctx.translate(p.x + p.dx * t, p.y + p.dy * t);
      ctx.rotate(p.spin * t);
      ctx.scale(size, size);
      ctx.globalAlpha = .78 * (1 - t);
      ctx.shadowColor = "#ee7892";
      ctx.shadowBlur = 7;
      if (p.image.complete && p.image.naturalWidth) ctx.drawImage(p.image, -13, -13, 26, 26);
      ctx.restore();
    }
    if (particles.length) frame = requestAnimationFrame(draw);
    else stop();
  }
  window.addEventListener("pointermove", event => {
    const now = performance.now();
    if (!enabled || event.pointerType !== "mouse" || reduce.matches || document.hidden || now - last < 35) return;
    last = now;
    if (!frame) { resize(); canvas.hidden = false; }
    for (let i = 0; i < 2; i++) {
      if (particles.length >= 50) particles.shift();
      particles.push({
        start: now, x: event.clientX, y: event.clientY,
        dx: (Math.random() - .5) * 65, dy: -12 - Math.random() * 42,
        size: .45 + Math.random() * .75, spin: (Math.random() - .5) * 1.8,
        image: sprite(keys[Math.floor(Math.random() * keys.length)])
      });
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener("resize", () => { if (frame) resize(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  reduce.addEventListener("change", () => { syncButton(); if (reduce.matches) stop(); });
})();
