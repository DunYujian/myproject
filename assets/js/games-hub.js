(function () {
  "use strict";
  // Keep bookmarks to the former tabbed page working.
  var routes = { snake: "games/snake/", memory: "games/memory/", story: "games/story/" };
  var destination = routes[location.hash.slice(1)];
  if (typeof destination === "string") location.replace(new URL(destination, location.href).href);
})();
