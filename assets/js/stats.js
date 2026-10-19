(function () {
  "use strict";

  // Local previews do not send statistics requests.
  if (!/^https?:$/.test(location.protocol) || /^(localhost|127\.[\d.]+|\[::1\])$/.test(location.hostname)) return;

  var script = document.createElement("script");
  script.src = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
  script.async = true;
  script.referrerPolicy = "no-referrer-when-downgrade";
  document.head.appendChild(script);
})();
