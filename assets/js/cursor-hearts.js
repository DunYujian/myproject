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
  const names = ["爱心", "蛋糕", "星星", "小鱼", "小狗头", "小猫头", "随机混合", "关闭"];
  const options = [...keys, "random", "off"];
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
  let style = "heart";
  try { const saved = localStorage.getItem("zaiye-cursor-style"); if (options.includes(saved)) style = saved; } catch {}
  const controls = document.createElement("label");
  controls.style.cssText = "position:fixed;right:.75rem;bottom:.75rem;z-index:30;padding:.3rem .5rem;border:1px solid var(--line,#c8d9ce);border-radius:.5rem;background:var(--surface,white);color:var(--text,var(--ink,#21392e));font:13px system-ui";
  controls.append("鼠标特效 ");
  const select = document.createElement("select");
  select.style.cssText = "width:auto;display:inline-block;font:inherit;padding:.25rem;color:inherit;background:inherit";
  options.forEach((value, index) => select.add(new Option(names[index], value)));
  select.value = style;
  controls.append(select);
  document.body.append(controls);
  select.addEventListener("change", () => {
    style = select.value;
    try { localStorage.setItem("zaiye-cursor-style", style); } catch {}
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
    if (style === "off" || event.pointerType !== "mouse" || reduce.matches || document.hidden || now - last < 35) return;
    last = now;
    if (!frame) { resize(); canvas.hidden = false; }
    for (let i = 0; i < 2; i++) {
      if (particles.length >= 50) particles.shift();
      particles.push({
        start: now, x: event.clientX, y: event.clientY,
        dx: (Math.random() - .5) * 65, dy: -12 - Math.random() * 42,
        size: .45 + Math.random() * .75, spin: (Math.random() - .5) * 1.8,
        image: sprite(style === "random" ? keys[Math.floor(Math.random() * keys.length)] : style)
      });
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }, { passive: true });
  window.addEventListener("resize", () => { if (frame) resize(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  reduce.addEventListener("change", () => { if (reduce.matches) stop(); });
})();
