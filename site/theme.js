// Theme switch for the design tokens. No dependencies.
//
//   fr3Theme.set("alternative")  sets <html data-theme="alternative">
//   fr3Theme.set("classic")      switches back
//
// Colours and font names change with the attribute (site/css/tokens.css already has both themes).
// This file only adds the Google Fonts stylesheets a theme needs, the first time it is used.
// No page reload. Until the font files arrive, text shows in the fallback font for a moment.
// Font lists come from site/theme-fonts.js (generated from tokens/).
(function () {
  const sources = window.FR3_THEME_FONTS || {};

  function loadFonts(theme) {
    const hrefs = sources[theme] || [];
    const loaded = [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute("href"));
    return Promise.all(
      hrefs
        .filter((href) => !loaded.includes(href))
        .map((href) => new Promise((resolve) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          link.onload = resolve;
          link.onerror = resolve; // a failed font request should not block the theme switch
          document.head.appendChild(link);
        })),
    );
  }

  window.fr3Theme = {
    themes: Object.keys(sources),
    set(theme) {
      if (!sources[theme]) {
        throw new Error(`Unknown theme "${theme}". Known: ${Object.keys(sources).join(", ")}`);
      }
      document.documentElement.dataset.theme = theme;
      return loadFonts(theme);
    },
  };

  // Footer dropdown: <select data-theme-select> with one <option> per theme.
  function bindSwitch() {
    const select = document.querySelector("[data-theme-select]");
    if (!select) return;
    select.value = document.documentElement.dataset.theme || "classic";
    select.addEventListener("change", () => window.fr3Theme.set(select.value));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindSwitch);
  else bindSwitch();
})();
