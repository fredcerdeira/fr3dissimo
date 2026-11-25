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
    date: (v) => new Date(v).toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" }).replace("Sept", "Sep"),
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

    // Hover or focus a bar: the caption swaps to that week's split; arrow keys move between weeks
    document.querySelectorAll("[data-stat-weekly]").forEach((box) => {
      const max = Math.max(1, ...stats.weekly.map((w) => w.hours));
      const tile = box.closest(".tile");
      const typical = tile && tile.querySelector("[data-weekly-typical]");
      const detail = tile && tile.querySelector("[data-weekly-detail]");
      const h = (v) => `${nf(1).format(v || 0)}\u00a0h`;
      const describe = (w) =>
        `Week of ${fmt.date(w.week).replace(/ \d{4}$/, "")} · ${h(w.hours)} · ` +
        `swim\u00a0${h(w.swim)} · bike\u00a0${h(w.bike)} · run\u00a0${h(w.run)}` + (w.other ? ` · other\u00a0${h(w.other)}` : "");
      box.setAttribute("role", "group");
      box.setAttribute("aria-label", `Training hours per week, last ${stats.weekly.length} weeks`);
      const bars = stats.weekly.map((w, i) => {
        const bar = document.createElement("button");
        bar.type = "button";
        bar.style.setProperty("--h", `${(w.hours / max) * 100}%`);
        bar.setAttribute("aria-label", describe(w));
        bar.tabIndex = i === stats.weekly.length - 1 ? 0 : -1;
        return bar;
      });
      const show = (i) => {
        bars.forEach((b, j) => b.classList.toggle("on", j === i));
        box.classList.add("is-active");
        if (typical && detail) { detail.textContent = describe(stats.weekly[i]); typical.hidden = true; detail.hidden = false; }
      };
      const reset = () => {
        if (box.contains(document.activeElement) || box.matches(":hover")) return;
        box.classList.remove("is-active");
        bars.forEach((b) => b.classList.remove("on"));
        if (typical && detail) { typical.hidden = false; detail.hidden = true; }
      };
      bars.forEach((b, i) => {
        b.addEventListener("pointerenter", () => show(i));
        b.addEventListener("focus", () => show(i));
        b.addEventListener("click", () => show(i));
        b.addEventListener("keydown", (e) => {
          const j = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? bars.length - 1 : null;
          if (j == null || !bars[j]) return;
          e.preventDefault();
          b.tabIndex = -1; bars[j].tabIndex = 0; bars[j].focus();
        });
      });
      box.addEventListener("pointerleave", () => setTimeout(reset));
      box.addEventListener("focusout", () => setTimeout(reset));
      box.replaceChildren(...bars);
    });

    // Total ascent as Everests climbed from sea level (8,849 m)
    document.querySelectorAll("[data-stat-everest]").forEach((el) => {
      const m = get(stats, el.dataset.statEverest);
      const n = Math.round(m / 8849);
      if (n >= 2) el.textContent = `About ${nf(0).format(n)} Everests from sea level`;
    });
  }

  document.querySelectorAll("[data-countdown]").forEach((el) => {
    const [y, m, d] = el.dataset.countdown.split("-").map(Number);
    const now = new Date();
    const days = Math.round((new Date(y, m - 1, d) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 864e5);
    if (days > 1) el.textContent = `Goal race · ${days}\u00a0days`;
    else if (days === 1) el.textContent = "Goal race · tomorrow";
    else if (days === 0) el.textContent = "Race day";
  });

  fetch(SRC, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((stats) => {
      fill(stats);
      document.dispatchEvent(new CustomEvent("stats:filled", { detail: stats }));
    })
    .catch((e) => {
      console.warn("stats-loader: could not load", SRC, e);
      document.querySelectorAll("[data-stat-recent]").forEach((ul) => {
        const li = document.createElement("li");
        li.textContent = "Latest sessions couldn't load. Refresh the page to try again.";
        ul.replaceChildren(li);
      });
    });
})();
