(() => {
  "use strict";
  const card = document.querySelector(".daily-quote");
  if (!card) return;
  // Public-domain originals; the accompanying translations are by this site.
  const quotes = [
    ["学而时习之，不亦说乎？", "Is it not a joy to learn and put what you learn into practice from time to time?", "孔子 ·《论语·学而》", "https://zh.wikisource.org/wiki/論語", "en"],
    ["千里之行，始于足下。", "A journey of a thousand li begins beneath your feet.", "老子 ·《道德经》第六十四章", "https://zh.wikisource.org/wiki/道德經_(王弼本)#六十四章", "en"],
    ["生于忧患，而死于安乐也。", "Adversity gives life; ease and comfort can lead to ruin.", "孟子 ·《孟子·告子下》", "https://zh.wikisource.org/wiki/孟子/告子下", "en"],
    ["山重水复疑无路，柳暗花明又一村。", "Hills and streams seem to leave no way through; then beyond dark willows and bright blossoms, another village appears.", "陆游 ·《游山西村》", "https://zh.wikisource.org/wiki/遊山西村", "en"],
    ["不识庐山真面目，只缘身在此山中。", "I cannot see the true face of Mount Lu, for I am standing within the mountain itself.", "苏轼 ·《题西林壁》", "https://zh.wikisource.org/wiki/題西林壁", "en"],
    ["生存还是毁灭，这是个问题。", "To be or not to be—that is the question:", "莎士比亚 ·《哈姆雷特》第三幕第一场", "https://www.folger.edu/explore/shakespeares-works/hamlet/read/3/1/", "zh"],
    ["大多数人过着默默绝望的生活。", "The mass of men lead lives of quiet desperation.", "梭罗 ·《瓦尔登湖》〈经济篇〉", "https://www.gutenberg.org/files/205/205-h/205-h.htm", "zh"],
  ];
  const dayMs = 86400000;
  const offset = 8 * 3600000;
  const start = Date.UTC(2026, 10, 5) / dayMs;

  // One seeded shuffle per round; prevent a duplicate at round boundaries.
  function order(round) {
    const result = quotes.slice();
    let seed = (round ^ 0x9e3779b9) >>> 0;
    for (let i = result.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const j = Math.floor(seed / 4294967296 * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  let timer;
  function render() {
    const now = Date.now() + offset;
    const day = Math.floor(now / dayMs) - start;
    const round = Math.floor(day / quotes.length);
    const deck = order(round);
    if (deck[0] === order(round - 1).at(-1)) [deck[0], deck[1]] = [deck[1], deck[0]];
    const [zh, en, source, url, translated] = deck[day - round * quotes.length];
    card.querySelector("[data-quote-zh]").textContent = zh;
    card.querySelector("[data-quote-en]").textContent = en;
    const link = card.querySelector("[data-quote-source]");
    link.textContent = source;
    link.href = url;
    card.querySelector("[data-quote-translation]").textContent = translated === "en" ? "中文原文 · 英文为本站译文" : "英文原文 · 中文为本站译文";
    card.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(render, dayMs - now % dayMs + 50);
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) render();
  });
  render();
})();
