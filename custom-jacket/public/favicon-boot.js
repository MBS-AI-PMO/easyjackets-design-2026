// The admin's favicon (Site Identity & Logos), remembered from the last visit by src/utils/favicon.js, replaces
// the built-in one before anything else loads. A file of its own (it was inline in index.html) so the page's
// Content-Security-Policy can allow this site's own scripts only (security-headers.conf).
(function () {
  try {
    var c = JSON.parse(localStorage.getItem('ej-builder-favicons') || 'null');
    if (!c || (!c.light && !c.dark)) return;
    document.querySelectorAll("link[rel*='icon']").forEach(function (l) { l.remove(); });
    var add = function (href, media) {
      var l = document.createElement('link'); l.rel = 'icon'; l.href = href;
      if (media) l.media = media;
      document.head.appendChild(l);
    };
    add(c.light || c.dark);
    if (c.light) add(c.light, '(prefers-color-scheme: light)');
    if (c.dark) add(c.dark, '(prefers-color-scheme: dark)');
  } catch (e) { /* no storage: the built-in icon stays until the admin's loads */ }
})();
