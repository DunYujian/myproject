(function (root) {
  "use strict";
  function initial() {
    return { version: 1, room: "hall", matches: false, lit: false, mural: false, box: false, office: false, log: false, drawer: false, stamped: false, ending: "" };
  }
  function restore(raw) {
    var state = initial();
    if (!raw || raw.version !== 1) return state;
    state.matches = raw.matches === true;
    state.lit = state.matches && raw.lit === true;
    state.mural = state.lit && raw.mural === true;
    state.box = state.lit && raw.box === true;
    state.office = state.box && raw.office === true;
    state.log = state.office && raw.log === true;
    state.drawer = state.log && raw.drawer === true;
    state.stamped = state.drawer && raw.stamped === true;
    state.room = raw.room === "office" && state.office ? "office" : raw.room === "pier" && state.drawer ? "pier" : "hall";
    state.ending = state.stamped && ["deliver", "leave"].includes(raw.ending) ? raw.ending : "";
    if (state.ending) state.room = "pier";
    return state;
  }
  function act(current, action, value) {
    var state = Object.assign({}, current);
    var message = "";
    function result(text) { return { state: state, message: text }; }
    if (action === "restart") return { state: initial(), message: "雨又落下了。你推开邮局的门，新的故事开始。" };
    if (action === "revisit" && state.ending) { state.ending = ""; return result("你又站在邮筒前。这一次，想把信送往哪里？"); }
    if (state.ending) return result("故事已经结束。可以回到最后的选择，或重新开始。");
    if (action === "hall") { state.room = "hall"; return result("你回到了候信厅，窗外的雨渐渐小了。"); }
    if (action === "office") {
      if (!state.box) return result("值班室的门锁着。也许木箱里有钥匙。");
      state.office = true; state.room = "office"; return result("黄铜钥匙轻轻一转，旧值班室的门开了。");
    }
    if (action === "pier") {
      if (!state.drawer) return result("渡口闸门需要铜牌。先在值班室找一找。");
      state.room = "pier"; return result("你将铜牌放入闸门。河风拂过来，东方已经泛白。");
    }
    if (action === "coat" && state.room === "hall") {
      state.matches = true; return result(state.lit ? "衣架旁只剩一把收好的旧伞。" : "旧雨衣的口袋里，有一盒干燥的火柴。已收下。");
    }
    if (action === "lamp" && state.room === "hall") {
      if (!state.matches) return result("油灯里还有油，但需要先找到火柴。");
      state.lit = true; return result("火光亮起来了，墙上的三组图案终于清晰。你提起灯，它会陪你走下去。");
    }
    if (action === "mural" && state.room === "hall") {
      if (!state.lit) return result("墙上似乎画着什么，光线太暗，看不清楚。");
      state.mural = true; return result("壁画从左到右画着：三盏灯、一只舟、四只铃。画框下刻着「数目便是归途的门牌」。");
    }
    if (action === "box" && state.room === "hall") return result(state.box ? "木箱已经打开，钥匙已收好。半张信上写着：「把归来的顺序还给它。」" : "木箱上有三位数字锁。密码线索应该就在这间屋子里。");
    if (action === "code" && state.room === "hall") {
      if (state.box) return result("木箱已经打开了。");
      if (!state.lit) return result("这里太暗，先点亮油灯。");
      if (String(value || "").normalize("NFKC").trim() !== "314") return result("锁芯没有转动。按壁画从左到右的顺序，再数一次。");
      state.box = true; return result("咔哒。木箱里有一把黄铜钥匙和半张信。值班室现在可以进入了。");
    }
    if (action === "log" && state.room === "office") {
      state.log = true; return result("航行日志写着：「日落以后，月先升起，舟再靠岸，鱼最后归河。」旁边的抽屉有四枚图案按键。");
    }
    if (action === "symbols" && state.room === "office") {
      if (state.drawer) return result("抽屉已经打开了。");
      if (!state.log) return result("先读一读桌上的航行日志，找出图案顺序。");
      if (value !== "月舟鱼") return result("抽屉仍然锁着。月升起、舟靠岸、鱼归河——试着还原这个先后顺序。");
      state.drawer = true; return result("抽屉滑开了：一枚邮戳、一封完整的信，还有通往渡口的铜牌。「收信人：明天的自己。」");
    }
    if (action === "stamp" && state.room === "office") {
      if (!state.drawer) return result("桌上只有一块印台。还需要找到邮戳和信。");
      state.stamped = true; return result("你在信封上盖下「再出发」的邮戳。信已封好，可以带去渡口了。");
    }
    if (action === "water" && state.room === "pier") return result("几尾鱼沿着水面游过。信纸上的另一行字显现：「能走到这里，就说明你愿意给自己一个新的明天。」");
    if (["deliver", "leave"].includes(action) && state.room === "pier") {
      if (!state.stamped) return result("信还没有盖邮戳。回值班室，替这封信留下出发的日期吧。");
      state.ending = action;
      return result(action === "deliver" ? "你把信投入邮筒。最后一滴雨落下，明天正在路上。" : "你把信和灯留在窗边。也许下一位旅人，正需要一点亮光。");
    }
    return result(message || "这条线索在另一个场景里，先去那里看看。");
  }
  function hint(state) {
    if (state.ending) return "故事已完成。可以回到最后的选择看看另一个结局，也可以重新开始。";
    if (!state.matches) return "先翻一翻候信厅的旧雨衣口袋。";
    if (!state.lit) return "有火柴了，试着点亮桌上的油灯。";
    if (!state.box && !state.mural) return "看看墙上的壁画，记下每组图案的数量。";
    if (!state.box) return "三盏灯、一只舟、四只铃，木箱密码是 314。";
    if (!state.log) return "用钥匙进入值班室，阅读航行日志。";
    if (!state.drawer) return "依次按「月、舟、鱼」，再确认，就能打开抽屉。";
    if (!state.stamped) return "在值班室点击印台，为信盖上邮戳。";
    return "前往渡口。寄出信，或把它留给下一位旅人，两种选择都有结局。";
  }
  var api = { initial: initial, restore: restore, act: act, hint: hint };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ZaiyeStory = api;
})(typeof window !== "undefined" ? window : globalThis);
