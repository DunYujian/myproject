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

  const heart = new Path2D();
  heart.moveTo(0, 7);
  heart.bezierCurveTo(-14, -2, -7, -12, 0, -5);
  heart.bezierCurveTo(7, -12, 14, -2, 0, 7);
  heart.closePath();
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
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill(heart);
      ctx.restore();
    }
    if (particles.length) frame = requestAnimationFrame(draw);
    else stop();
  }
  window.addEventListener("pointermove", event => {
    const now = performance.now();
    if (event.pointerType !== "mouse" || reduce.matches || document.hidden || now - last < 35) return;
    last = now;
    if (!frame) { resize(); canvas.hidden = false; }
    for (let i = 0; i < 2; i++) {
      if (particles.length >= 50) particles.shift();
      particles.push({
        start: now, x: event.clientX, y: event.clientY,
        dx: (Math.random() - .5) * 65, dy: -12 - Math.random() * 42,
        size: .45 + Math.random() * .75, spin: (Math.random() - .5) * 1.8,
        color: i ? "#f25779" : "#dc3158"
      });
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener("resize", () => { if (frame) resize(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  reduce.addEventListener("change", () => { if (reduce.matches) stop(); });
})();
