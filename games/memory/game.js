(function () {
  "use strict";
  // Memory game: six pairs, with a cancellable mismatch delay on restart.
  var board = document.querySelector("#memory-board");
  if (!board) return;
  var memoryStatus = document.querySelector("#memory-status");
  var first = null;
  var locked = false;
  var moves = 0;
  var matched = 0;
  var mismatchTimer = 0;
  function closeCard(card) {
    card.classList.remove("is-open");
    card.innerHTML = '<span class="memory-card__back" aria-hidden="true">记</span>';
    card.setAttribute("aria-label", "第 " + card.dataset.position + " 张，未翻开");
  }
  function newMemory() {
    clearTimeout(mismatchTimer); mismatchTimer = 0;
    first = null; locked = false; moves = matched = 0;
    document.querySelector("#memory-moves").textContent = "0";
    document.querySelector("#memory-matched").textContent = "0 / 6";
    memoryStatus.textContent = "翻开两张牌，找出相同的汉字。";
    var symbols = ["鱼", "月", "舟", "叶", "雨", "山"];
    var cards = symbols.concat(symbols);
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var value = cards[i]; cards[i] = cards[j]; cards[j] = value;
    }
    board.replaceChildren();
    cards.forEach(function (symbol, index) {
      var card = document.createElement("button");
      card.type = "button"; card.className = "memory-card";
      card.dataset.symbol = symbol; card.dataset.position = String(index + 1);
      closeCard(card); board.appendChild(card);
    });
  }
  board.addEventListener("click", function (event) {
    var card = event.target.closest(".memory-card");
    if (!card || locked || card.disabled || card === first) return;
    card.classList.add("is-open"); card.textContent = card.dataset.symbol;
    card.setAttribute("aria-label", "第 " + card.dataset.position + " 张，" + card.dataset.symbol);
    if (!first) { first = card; return; }
    moves++; document.querySelector("#memory-moves").textContent = moves;
    var previous = first; first = null;
    if (previous.dataset.symbol === card.dataset.symbol) {
      [previous, card].forEach(function (item) { item.disabled = true; item.classList.add("is-matched"); item.setAttribute("aria-label", item.dataset.symbol + "，已配对"); });
      matched++; document.querySelector("#memory-matched").textContent = matched + " / 6";
      memoryStatus.textContent = matched === 6 ? "全部找到了！用了 " + moves + " 次，做得不错。" : "配对成功，继续找下一对。";
    } else {
      locked = true; memoryStatus.textContent = "这两张不一样，再记一下位置。";
      mismatchTimer = setTimeout(function () { closeCard(previous); closeCard(card); locked = false; memoryStatus.textContent = "继续找下一对。"; }, 700);
    }
  });
  document.querySelector("#memory-restart").addEventListener("click", newMemory);
  newMemory();
  document.addEventListener("site:before-navigate", function () { clearTimeout(mismatchTimer); }, { once: true });

})();
