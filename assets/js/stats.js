(function () {
  "use strict";

  function refresh() {
    // Local previews do not send statistics requests.
    if (!/^https?:$/.test(location.protocol) || /^(localhost|127\.[\d.]+|\[::1\])$/.test(location.hostname)) return;
    var previous = document.querySelector("script[data-site-stats]");
    if (previous) previous.remove();
    var script = document.createElement("script");
    script.dataset.siteStats = "";
    script.src = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
    script.async = true;
    script.referrerPolicy = "no-referrer-when-downgrade";
    document.head.appendChild(script);
  }
  window.ZaiyeStats = refresh;
  refresh();
})();
