(function () {
  "use strict";
  var root = document.querySelector("#story-panel");
  if (!root || !window.ZaiyeStory) return;
  var engine = window.ZaiyeStory;
  var state = engine.initial();
  var key = "zaiye-rain-post-v1";
  var restored = false;
  var sequence = [];
  var message = root.querySelector("#story-message");
  var saveNote = root.querySelector("#story-save-note");
  try {
    var raw = JSON.parse(localStorage.getItem(key));
    state = engine.restore(raw);
    restored = raw && raw.version === 1;
  } catch (error) {}
  var rooms = {
    hall: { name: "候信厅", text: "雨水沿着屋檐落下。你在一间很久没有人值守的邮局里醒来，桌上有盏未点燃的油灯。门上的纸条写着：「天亮以前，替自己寄一封信。」" },
    office: { name: "旧值班室", text: "纸张和旧木头的气味扑面而来。桌上的航行日志摊着，抽屉却紧紧锁住。窗下的印台，似乎还等着最后一封信。" },
    pier: { name: "渡口", text: "雨停了。木桥尽头有一只邮筒，河面漂着几尾线条般轻盈的鱼。你手里这封信，收信人是「明天的自己」。" }
  };
  function art(room) {
    var lamp = '<path d="M300 190h40m-31 0 4-40h14l4 40m-18-40-6-13h26l-6 13m-10-13v-15h6v15"/>';
    var shape = room === "hall" ? '<path d="M40 234h560M70 234V54h500v180M88 70h98v88H88zm49 0v88m-49-44h98M429 234V76h102v158M500 150h2M242 234v-44h150v44M92 234v-48h71v48m-35-48v-20m-16 29h33"/>' + lamp + (state.lit ? '<path class="story-flame" d="M320 122q-12-13 0-28 12 15 0 28Z"/>' : '') : room === "office" ? '<path d="M40 234h560M68 234V55h504v179M90 75h110v100H90zm55 0v100M238 234v-62h215v62m-200-62v-35h98v35m-84-23h69m-69 10h50M366 184h72v35h-72zm15 17h42M468 234v-56h64v56"/><circle cx="492" cy="162" r="13"/><path d="M485 174v13h14v-13M154 95q-21 7-8 24-26-6-17-23"/>' : '<path d="M25 198q70-15 140 0t140 0 140 0 170 0M25 226q70-15 140 0t140 0 140 0 170 0M75 172h475M95 172v-36m85 36v-36m85 36v-36m85 36v-36M85 144h288M459 172v-64h70v64m-70-64q35-38 70 0m-53 16h35M185 78q20-25 40 0m10 0q20-25 40 0M102 213q20-18 38 0-18 18-38 0Zm38 0 12-9v18Z"/><path d="M312 87a35 35 0 0 1 70 0m-35-49v-12m-42 29-11-8m100 8 11-8"/>';
    return '<svg viewBox="0 0 640 260" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + shape + '</svg>';
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify(state)); saveNote.textContent = "进度已自动保存在本机。"; }
    catch (error) { saveNote.textContent = "本次可以正常游玩，但浏览器未允许保存进度。"; }
  }
  function inventory() {
    var items = [];
    if (state.matches && !state.lit) items.push("火柴");
    if (state.lit) items.push("点亮的油灯");
    if (state.box && !state.office) items.push("黄铜钥匙");
    if (state.box && !state.drawer) items.push("半张信");
    if (state.drawer) items.push(state.stamped ? "封好的信" : "完整的信", "邮戳", "渡口铜牌");
    var list = root.querySelector("#story-inventory"); list.replaceChildren();
    (items.length ? items : ["暂时没有物品"]).forEach(function (name) { var item = document.createElement("li"); item.textContent = name; list.appendChild(item); });
  }
  function render() {
    var focused = document.activeElement && document.activeElement.dataset.storyAction;
    var ended = Boolean(state.ending);
    root.querySelector("#story-playing").hidden = ended;
    root.querySelector("#story-ending").hidden = !ended;
    var chapter = state.drawer ? 3 : state.box ? 2 : 1;
    root.querySelectorAll("[data-story-chapter]").forEach(function (item) {
      var number = Number(item.dataset.storyChapter);
      item.classList.toggle("is-current", !ended && number === chapter);
      item.classList.toggle("is-done", ended || number < chapter);
    });
    root.querySelectorAll("[data-story-room]").forEach(function (button) {
      var room = button.dataset.storyRoom;
      button.disabled = room === "office" ? !state.box : room === "pier" ? !state.drawer : false;
      button.setAttribute("aria-pressed", String(room === state.room));
    });
    root.querySelector("#story-room-title").textContent = rooms[state.room].name;
    root.querySelector("#story-scene").innerHTML = art(state.room);
    root.querySelector("#story-description").textContent = rooms[state.room].text;
    var actions = state.room === "hall" ? [["coat", "翻看旧雨衣"], ["lamp", state.lit ? "看看油灯" : "点亮油灯"], ["mural", "查看墙上壁画"], ["box", "查看木箱"]] : state.room === "office" ? [["log", "阅读航行日志"], ["stamp", "使用桌上印台"]] : [["water", "看看河面"], ["deliver", "把信投入邮筒"], ["leave", "把信和灯留给旅人"]];
    var buttons = root.querySelector("#story-actions"); buttons.replaceChildren();
    actions.forEach(function (entry) { var button = document.createElement("button"); button.type = "button"; button.className = "game-button"; button.dataset.storyAction = entry[0]; button.textContent = entry[1]; buttons.appendChild(button); });
    root.querySelector("#story-code-form").hidden = state.room !== "hall" || state.box;
    root.querySelector("#story-code").disabled = !state.lit;
    root.querySelector("#story-code-submit").disabled = !state.lit;
    root.querySelector("#story-symbol-form").hidden = state.room !== "office" || !state.log || state.drawer;
    var clues = [];
    if (state.mural) clues.push("壁画：灯 × 3，舟 × 1，铃 × 4。从左到右读数量。");
    if (state.log) clues.push("日志：月先升起，舟再靠岸，鱼最后归河。");
    if (state.drawer) clues.push("信封：收信人是「明天的自己」，出发前需要盖邮戳。");
    root.querySelector("#story-clues").textContent = clues.length ? clues.join("\n") : "找到的线索会记在这里。";
    inventory();
    if (ended) {
      root.querySelector("#story-ending-title").textContent = state.ending === "deliver" ? "结局一 · 寄给明天" : "结局二 · 留一盏灯";
      root.querySelector("#story-ending-text").textContent = state.ending === "deliver" ? "邮筒里传来很轻的一声响。你突然明白，信不必来自别人，也可以来自愿意重新出发的自己。天已亮，过桥去吧。" : "你把灯和信放在邮局窗台。河上的船载走了雨声，门外响起了脚步。你没有等来一封回信，却替另一个人保留了一条归路。";
    }
    if (focused) { var target = root.querySelector('[data-story-action="' + focused + '"]'); if (target) target.focus({ preventScroll: true }); }
  }
  function updateSequence() {
    root.querySelector("#story-sequence").textContent = sequence.length ? sequence.join(" → ") : "尚未选择";
    root.querySelector("#story-symbol-submit").disabled = sequence.length !== 3;
  }
  function act(action, value) {
    var result = engine.act(state, action, value);
    if (action === "restart") root.querySelector("#story-code").value = "";
    state = result.state; message.textContent = result.message;
    sequence = []; updateSequence(); save(); render();
    if (state.ending) root.querySelector("#story-ending-title").focus({ preventScroll: true });
  }
  root.addEventListener("click", function (event) {
    var button = event.target.closest("button"); if (!button) return;
    if (button.dataset.storyAction) act(button.dataset.storyAction);
    else if (button.dataset.storyRoom) act(button.dataset.storyRoom);
    else if (button.dataset.storySymbol) { if (sequence.length < 3) sequence.push(button.dataset.storySymbol); updateSequence(); }
    else if (button.id === "story-symbol-clear") { sequence = []; updateSequence(); }
    else if (button.id === "story-hint") message.textContent = engine.hint(state);
  });
  root.querySelector("#story-code-form").addEventListener("submit", function (event) { event.preventDefault(); act("code", root.querySelector("#story-code").value); });
  root.querySelector("#story-symbol-form").addEventListener("submit", function (event) { event.preventDefault(); act("symbols", sequence.join("")); });
  saveNote.textContent = restored ? "已恢复本机存档；每次探索后自动保存。" : "进度自动保存在本机，无需注册。";
  message.textContent = restored ? "欢迎回来，继续这封尚未寄出的信吧。" : "先在候信厅四处看看。每个可点击的物件，都可能藏着线索。";
  render(); updateSequence();
})();
