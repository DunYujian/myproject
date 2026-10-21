(function () {
  "use strict";

  var container = document.querySelector("[data-comments]");
  if (!container) return;

  var root = document.documentElement;
  var origin = "https://utteranc.es";

  function theme() {
    return root.getAttribute("data-theme") === "dark" ? "github-dark" : "github-light";
  }

  function syncTheme() {
    var frame = container.querySelector(".utterances-frame");
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "set-theme", theme: theme() }, origin);
    }
  }

  // Apply the latest theme when the lazy-loaded iframe becomes ready.
  container.addEventListener("load", syncTheme, true);
  var observer = new MutationObserver(syncTheme);
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });
  document.addEventListener("site:before-navigate", function () { observer.disconnect(); }, { once: true });

  var script = document.createElement("script");
  script.src = origin + "/client.js";
  script.setAttribute("repo", "DunYujian/myproject");
  script.setAttribute("issue-term", "pathname");
  script.setAttribute("theme", theme());
  script.crossOrigin = "anonymous";
  script.async = true;
  container.appendChild(script);
})();
