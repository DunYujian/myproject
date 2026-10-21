(function () {
  "use strict";
  var base = new URL("../../music/", document.currentScript.src);
  var player = document.querySelector("[data-music-player]");
  if (!player) return;
  function el(name) { return player.querySelector("[data-music-" + name + "]"); }
  var audio = el("audio"), status = el("status"), controls = el("controls");
  var playButton = el("play"), previous = el("previous"), next = el("next");
  var seek = el("seek"), volume = el("volume"), mute = el("mute"), list = el("list");
  var tracks = [], current = -1, loading = false, loaded = false, pendingTime = 0, interacted = false;
  var saveKey = "zaiye-music-v2", saved = {}, lastSave = 0;
  var modes = ["list", "one", "shuffle"], names = { list: "列表循环", one: "单曲循环", shuffle: "随机播放" };
  try { saved = JSON.parse(localStorage.getItem(saveKey)) || {}; } catch (error) {}
  if (typeof saved !== "object" || Array.isArray(saved)) saved = {};
  var mode = modes.includes(saved.mode) ? saved.mode : "list";
  audio.volume = Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : 0.7;
  audio.muted = saved.muted === true;
  var lastVolume = audio.volume || 0.7;

  function save() {
    try { localStorage.setItem(saveKey, JSON.stringify({ file: tracks[current] && tracks[current].file, time: audio.currentTime || pendingTime || 0, volume: audio.volume, muted: audio.muted, mode: mode })); } catch (error) {}
  }
  function format(time) {
    if (!Number.isFinite(time) || time < 0) return "--:--";
    return Math.floor(time / 60) + ":" + String(Math.floor(time % 60)).padStart(2, "0");
  }
  function normalize(entries) {
    if (!Array.isArray(entries)) return [];
    var seen = new Set();
    return entries.filter(function (entry) {
      var file = entry && (entry.file || entry.name);
      if (typeof file !== "string" || !/\.mp3$/i.test(file) || /[\/\\]/.test(file) || (entry.type && entry.type !== "file") || seen.has(file)) return false;
      seen.add(file); return true;
    }).map(function (entry) {
      var file = entry.file || entry.name;
      var title = entry.title || file.replace(/\.mp3$/i, "");
      var artist = entry.artist || "";
      // Existing uploads use Artist-Title; explicit artist metadata is preferred.
      if (!artist && /^.+?\s*[-—]\s*.+$/.test(title)) {
        var parts = title.split(/\s*[-—]\s*/); artist = parts.shift(); title = parts.join(" - ");
      }
      return { file: file, title: title, artist: artist || "本站音乐" };
    });
  }
  async function readJSON(url) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 6000);
    try {
      var response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("Playlist unavailable");
      return await response.json();
    } finally { clearTimeout(timeout); }
  }
  function renderList() {
    list.replaceChildren();
    tracks.forEach(function (track, index) {
      var li = document.createElement("li"), button = document.createElement("button");
      button.type = "button"; button.dataset.track = index;
      button.setAttribute("aria-current", String(index === current));
      var number = document.createElement("span"), title = document.createElement("span");
      number.textContent = String(index + 1).padStart(2, "0"); title.textContent = track.title;
      button.append(number, title); li.appendChild(button); list.appendChild(li);
    });
    el("count").textContent = tracks.length + " 首";
    previous.disabled = next.disabled = tracks.length < 2;
  }
  function syncPlay() {
    var playing = !audio.paused && !audio.ended;
    player.classList.toggle("is-playing", playing);
    playButton.setAttribute("aria-label", playing ? "暂停" : "播放");
    playButton.title = playing ? "暂停" : "播放";
  }
  function progress() {
    var valid = Number.isFinite(audio.duration) && audio.duration > 0;
    seek.disabled = !valid;
    seek.max = valid ? audio.duration : 100;
    seek.value = valid ? audio.currentTime : 0;
    seek.setAttribute("aria-valuetext", format(audio.currentTime) + "，共 " + format(audio.duration));
    el("elapsed").textContent = format(audio.currentTime);
    el("duration").textContent = format(audio.duration);
  }
  function syncVolume() {
    var value = audio.muted ? 0 : audio.volume;
    volume.value = value;
    el("volume-label").textContent = Math.round(value * 100) + "%";
    mute.setAttribute("aria-pressed", String(value === 0));
    mute.setAttribute("aria-label", value === 0 ? "取消静音" : "静音");
    mute.title = value === 0 ? "取消静音" : "静音";
  }
  async function play() {
    if (current < 0) return;
    status.textContent = "正在加载音乐…";
    if (audio.error) audio.load();
    try { await audio.play(); }
    catch (error) {
      if (error.name === "AbortError") return;
      status.textContent = error.name === "NotAllowedError" ? "请再点击一次播放按钮。" : "暂时无法播放，可重试或切换下一首。";
      syncPlay();
    }
  }
  function choose(index, shouldPlay, resumeTime) {
    if (!tracks.length) return;
    audio.pause();
    current = (index + tracks.length) % tracks.length;
    pendingTime = Number.isFinite(resumeTime) && resumeTime > 0 ? resumeTime : 0;
    audio.src = new URL(encodeURIComponent(tracks[current].file), base).href;
    el("title").textContent = tracks[current].title;
    el("artist").textContent = tracks[current].artist;
    status.textContent = pendingTime ? "已记住进度，点击播放继续。" : "准备好了，点击播放。";
    renderList(); progress(); syncPlay();
    if (shouldPlay) play();
  }
  function randomNext() {
    if (tracks.length < 2) return current;
    return (current + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length;
  }
  function step(direction) { choose(mode === "shuffle" ? randomNext() : current + direction, true); }
  async function load() {
    if (loading || loaded) return;
    loading = true; el("retry").hidden = true;
    status.textContent = "正在读取歌单…";
    var local = false;
    try {
      try { var catalog = await readJSON(new URL("playlist.json", base)); tracks = normalize(catalog.tracks); local = tracks.length > 0; } catch (error) { tracks = []; }
      if (!tracks.length) tracks = normalize(await readJSON("https://api.github.com/repos/DunYujian/myproject/contents/music?ref=main"));
      if (!tracks.length) { status.textContent = "暂时没有音乐，稍后再来听听。"; el("count").textContent = "0 首"; el("retry").hidden = false; return; }
      loaded = true; controls.hidden = false;
      var restored = tracks.findIndex(function (track) { return track.file === saved.file; });
      choose(restored >= 0 ? restored : 0, false, restored >= 0 ? saved.time : 0);
      if (local) {
        readJSON("https://api.github.com/repos/DunYujian/myproject/contents/music?ref=main").then(function (entries) {
          normalize(entries).forEach(function (track) { if (!tracks.some(function (existing) { return existing.file === track.file; })) tracks.push(track); });
          if (!interacted && current === 0 && saved.file && tracks[0].file !== saved.file && audio.paused && audio.currentTime === 0) {
            var restored = tracks.findIndex(function (track) { return track.file === saved.file; });
            if (restored >= 0) choose(restored, false, saved.time);
          }
          renderList();
        }).catch(function () { /* Keep the immediately available local playlist. */ });
      }
    } catch (error) { status.textContent = "歌单暂时无法加载，请重试。"; el("retry").hidden = false; el("count").textContent = "未加载"; }
    finally { loading = false; }
  }
  player.addEventListener("toggle", function () { if (player.open) load(); });
  el("retry").addEventListener("click", load);
  playButton.addEventListener("click", function () { interacted = true; if (audio.paused) play(); else audio.pause(); });
  previous.addEventListener("click", function () { interacted = true; step(-1); });
  next.addEventListener("click", function () { interacted = true; step(1); });
  list.addEventListener("click", function (event) {
    var button = event.target.closest("[data-track]");
    if (button) { interacted = true; choose(Number(button.dataset.track), true); }
  });
  el("list-toggle").addEventListener("click", function () {
    list.hidden = !list.hidden;
    this.setAttribute("aria-expanded", String(!list.hidden)); this.textContent = list.hidden ? "歌单 ↓" : "收起 ↑";
  });
  el("mode").addEventListener("click", function () { mode = modes[(modes.indexOf(mode) + 1) % modes.length]; this.textContent = names[mode]; this.setAttribute("aria-label", "当前" + names[mode] + "，点击切换模式"); save(); });
  seek.addEventListener("input", function () { if (!seek.disabled) { audio.currentTime = Number(seek.value); pendingTime = 0; progress(); } });
  seek.addEventListener("change", save);
  volume.addEventListener("input", function () { audio.volume = Number(volume.value); audio.muted = false; if (audio.volume > 0) lastVolume = audio.volume; syncVolume(); });
  volume.addEventListener("change", save);
  mute.addEventListener("click", function () { if (audio.muted || audio.volume === 0) { audio.muted = false; if (!audio.volume) audio.volume = lastVolume; } else audio.muted = true; syncVolume(); save(); });
  audio.addEventListener("loadedmetadata", function () {
    if (pendingTime && Number.isFinite(audio.duration)) { audio.currentTime = Math.min(pendingTime, Math.max(0, audio.duration - 0.1)); pendingTime = 0; }
    progress();
  });
  audio.addEventListener("durationchange", progress);
  audio.addEventListener("timeupdate", function () { progress(); if (Date.now() - lastSave > 4000) { save(); lastSave = Date.now(); } });
  audio.addEventListener("playing", function () { status.textContent = "正在播放"; syncPlay(); });
  audio.addEventListener("pause", function () { syncPlay(); if (!audio.ended && current >= 0 && !audio.error) status.textContent = "已暂停，随时继续。"; save(); });
  audio.addEventListener("waiting", function () { if (!audio.paused) status.textContent = "缓冲中，请稍候…"; });
  audio.addEventListener("error", function () { status.textContent = "这首音乐暂时无法播放，点击播放重试或切换歌曲。"; syncPlay(); });
  audio.addEventListener("ended", function () { choose(mode === "one" ? current : mode === "shuffle" ? randomNext() : current + 1, true); });
  audio.addEventListener("volumechange", syncVolume);
  window.addEventListener("pagehide", save);
  document.addEventListener("visibilitychange", function () { if (document.hidden) save(); });
  el("mode").textContent = names[mode];
  el("mode").setAttribute("aria-label", "当前" + names[mode] + "，点击切换模式");
  syncVolume(); syncPlay(); progress();
  if (player.open) load();
})();
