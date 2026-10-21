(function () {
  "use strict";

  var script = document.currentScript;
  var base = new URL("../../music/", script.src);
  var player = document.querySelector("[data-music-player]");
  if (!player) return;

  var audio = player.querySelector("audio");
  var select = player.querySelector("[data-music-select]");
  var status = player.querySelector("[data-music-status]");
  var controls = player.querySelector("[data-music-controls]");
  var previous = player.querySelector("[data-music-previous]");
  var next = player.querySelector("[data-music-next]");
  var tracks = [];
  var current = 0;
  var loaded = false;

  async function readJSON(url) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    try {
      var response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("Playlist unavailable");
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  function normalize(entries) {
    if (!Array.isArray(entries)) return [];
    return entries.filter(function (entry) {
      var file = entry && (entry.file || entry.name);
      return typeof file === "string" && /\.mp3$/i.test(file) && !/[\/\\]/.test(file)
        && (!entry.type || entry.type === "file");
    }).map(function (entry) {
      var file = entry.file || entry.name;
      return { file: file, title: entry.title || file.replace(/\.mp3$/i, "") };
    });
  }

  function play() {
    var result = audio.play();
    if (result) result.catch(function () {
      status.textContent = "播放未开始，请点击播放按钮重试。";
    });
  }

  function choose(index, shouldPlay) {
    if (!tracks.length) return;
    current = (index + tracks.length) % tracks.length;
    select.value = String(current);
    audio.src = new URL(encodeURIComponent(tracks[current].file), base).href;
    status.textContent = tracks[current].title;
    if (shouldPlay) play();
  }

  async function load() {
    if (loaded) return;
    loaded = true;
    status.textContent = "正在读取歌单…";
    var localCatalog = false;
    // Display the local catalog immediately; only use GitHub as a fallback.
    try {
      var catalog = await readJSON(new URL("playlist.json", base).href);
      tracks = normalize(catalog.tracks);
      localCatalog = tracks.length > 0;
    } catch (error) { tracks = []; }
    if (!tracks.length) {
      try {
        tracks = normalize(await readJSON("https://api.github.com/repos/DunYujian/myproject/contents/music?ref=main"));
      } catch (error) {
        status.textContent = "歌单暂时无法加载，收起后展开可重试。";
        loaded = false;
        return;
      }
    }

    if (!tracks.length) {
      status.textContent = "暂时没有可播放的音乐。";
      return;
    }
    tracks.forEach(function (track, index) {
      var option = document.createElement("option");
      option.value = String(index);
      option.textContent = track.title;
      select.appendChild(option);
    });
    controls.hidden = false;
    previous.disabled = next.disabled = tracks.length < 2;
    choose(0, false);
    // Discover new uploads in the background without delaying local playback.
    if (localCatalog) {
      readJSON("https://api.github.com/repos/DunYujian/myproject/contents/music?ref=main").then(function (entries) {
        normalize(entries).forEach(function (track) {
          if (tracks.some(function (existing) { return existing.file === track.file; })) return;
          var option = document.createElement("option");
          option.value = String(tracks.length);
          option.textContent = track.title;
          tracks.push(track);
          select.appendChild(option);
        });
        previous.disabled = next.disabled = tracks.length < 2;
      }).catch(function () { /* The local playlist remains playable. */ });
    }
  }

  player.addEventListener("toggle", function () {
    if (player.open) load();
  });
  select.addEventListener("change", function () { choose(Number(select.value), true); });
  previous.addEventListener("click", function () { choose(current - 1, true); });
  next.addEventListener("click", function () { choose(current + 1, true); });
  audio.addEventListener("ended", function () {
    if (tracks.length > 1) choose(current + 1, true);
  });
  audio.addEventListener("error", function () {
    status.textContent = "这首音乐暂时无法播放，请切换其他曲目。";
  });
  if (player.open) load();
})();
