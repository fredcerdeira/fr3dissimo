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

  // Footer switch: <button data-theme-option="classic|alternative">. Shows the current theme with aria-pressed.
  function bindSwitch() {
    const buttons = [...document.querySelectorAll("[data-theme-option]")];
    if (!buttons.length) return;
    const sync = () => {
      const current = document.documentElement.dataset.theme || "classic";
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeOption === current)));
    };
    buttons.forEach((b) => b.addEventListener("click", () => { window.fr3Theme.set(b.dataset.themeOption); sync(); }));
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindSwitch);
  else bindSwitch();
})();
