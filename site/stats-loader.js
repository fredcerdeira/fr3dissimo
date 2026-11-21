// Fills the portfolio page with numbers from data/stats.json.
//
// Mark elements in your HTML with data-stat="<path>" and an optional
// data-format. Examples:
//   <span data-stat="ytd.total.km" data-format="km"></span>        → 4,312 km
//   <span data-stat="ytd.total.count" data-format="int"></span>    → 287
//   <span data-stat="typicalWeek.hours" data-format="hours"></span> → 9.5 h
//   <span data-stat="updatedAt" data-format="date"></span>          → 20 Nov 2026
// Lists:
//   <ul data-stat-recent></ul>     → last sessions
//   <div data-stat-weekly></div>   → 12-week bar chart (hours per week)
//
// Include with: <script src="site/stats-loader.js" defer data-src="data/stats.json"></script>

(function () {
  const script = document.currentScript;
  const SRC = (script && script.dataset.src) || "data/stats.json";
  const LOCALE = "en-GB";
  const SPORT = { swim: "Swim", bike: "Bike", run: "Run", multisport: "Race" };

  const nf = (d) => new Intl.NumberFormat(LOCALE, { maximumFractionDigits: d });
  const fmt = {
    int: (v) => nf(0).format(v),
    km: (v) => `${nf(v < 100 ? 1 : 0).format(v)} km`,
    hours: (v) => `${nf(1).format(v)} h`,
    m: (v) => `${nf(0).format(v)} m`,
    duration: (h) => {
      const t = Math.round(h * 60);
      return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
    },
    date: (v) => new Date(v).toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" }),
    raw: (v) => String(v),
  };
  const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

  function fill(stats) {
    document.querySelectorAll("[data-stat]").forEach((el) => {
      const v = get(stats, el.dataset.stat);
      if (v == null) return;
      el.textContent = (fmt[el.dataset.format] || fmt.raw)(v);
    });

    document.querySelectorAll("[data-stat-recent]").forEach((ul) => {
      ul.replaceChildren(
        ...stats.recent.map((s) => {
          const li = document.createElement("li");
          const dist = s.sport === "swim" ? `${nf(0).format(s.km * 1000)} m` : fmt.km(s.km);
          li.textContent = `${fmt.date(s.date)} · ${SPORT[s.sport] || s.sport} · ${dist} · ${fmt.duration(s.hours)}`;
          return li;
        })
      );
    });

    document.querySelectorAll("[data-stat-weekly]").forEach((box) => {
      const max = Math.max(1, ...stats.weekly.map((w) => w.hours));
      box.setAttribute("role", "img");
      box.setAttribute(
        "aria-label",
        "Training hours per week, last " + stats.weekly.length + " weeks: " +
          stats.weekly.map((w) => nf(1).format(w.hours)).join(", ")
      );
      box.style.cssText += ";display:flex;align-items:flex-end;gap:6px;height:120px";
      box.replaceChildren(
        ...stats.weekly.map((w) => {
          const bar = document.createElement("div");
          bar.style.cssText = `flex:1;height:${(w.hours / max) * 100}%;min-height:2px;background:currentColor`;
          bar.title = `Week of ${fmt.date(w.week)}: ${nf(1).format(w.hours)} h`;
          return bar;
        })
      );
    });
  }

  fetch(SRC, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((stats) => {
      fill(stats);
      document.dispatchEvent(new CustomEvent("stats:filled", { detail: stats }));
    })
    .catch((e) => console.warn("stats-loader: could not load", SRC, e));
})();
