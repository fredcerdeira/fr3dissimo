// Results list with discipline filters. Data: data/results.json
// Each entry: date, race, optional location, type (triathlon | trail | road | cycling),
// distance, time, place, plus per type: swim/bike/run (triathlon), elevation (trail),
// pace (road), speed (cycling), or a free-text "details" that replaces them.
// Newest first: write dates as YYYY-MM-DD (or YYYY).
// A flag is drawn before the location, from its last part (e.g. "Seville, Spain");
// set "country" (pt, es, de, fr, ad) to override.
//
// Markup per race: <li> → <h3> race name (+ location) and a <dl> of label/value pairs.

(function () {
  const root = document.querySelector("[data-results]");
  if (!root) return;
  const SRC = root.dataset.src || "data/results.json";
  const list = root.querySelector("[data-res-list]");
  const detailHead = root.querySelector("[data-detail-head]");
  const buttons = [...root.querySelectorAll("[data-filter]")];
  const status = root.querySelector("[data-results-status]");
  const more = root.querySelector("[data-res-more]");
  const toggle = root.querySelector("[data-res-toggle]");
  const count = root.querySelector("[data-res-count]");
  const LIMIT = 8;

  const LABEL = { triathlon: "Triathlon", trail: "Trail Run", road: "Road Run", cycling: "Cycling" };
  const DETAIL_HEAD = { all: "Details", triathlon: "Swim · Bike · Run", trail: "D+", road: "Pace", cycling: "Avg speed" };
  // Small inline flags (30×20 viewBox), keyed by ISO code
  const FLAGS = {
    "pt": "<rect width=\"30\" height=\"20\" fill=\"#d80027\"/><rect width=\"12\" height=\"20\" fill=\"#006600\"/><circle cx=\"12\" cy=\"10\" r=\"4.4\" fill=\"#ffcc00\"/><path d=\"M10.3 7.4h3.4v3.6a1.7 1.7 0 0 1-3.4 0z\" fill=\"#d80027\"/><path d=\"M11.2 8.4h1.6v2.4a.8.8 0 0 1-1.6 0z\" fill=\"#fff\"/>",
    "es": "<rect width=\"30\" height=\"20\" fill=\"#aa151b\"/><rect y=\"5\" width=\"30\" height=\"10\" fill=\"#f1bf00\"/>",
    "de": "<rect width=\"30\" height=\"20\" fill=\"#ffce00\"/><rect width=\"30\" height=\"13.34\" fill=\"#dd0000\"/><rect width=\"30\" height=\"6.67\" fill=\"#000\"/>",
    "fr": "<rect width=\"30\" height=\"20\" fill=\"#ed2939\"/><rect width=\"20\" height=\"20\" fill=\"#fff\"/><rect width=\"10\" height=\"20\" fill=\"#002395\"/>",
    "ad": "<rect width=\"30\" height=\"20\" fill=\"#d50032\"/><rect width=\"20\" height=\"20\" fill=\"#fedd00\"/><rect width=\"10\" height=\"20\" fill=\"#10069f\"/><rect x=\"12.6\" y=\"6.6\" width=\"4.8\" height=\"6.4\" rx=\".8\" fill=\"#c7a34a\" stroke=\"#7a5a12\" stroke-width=\".6\"/>"
  };
  const COUNTRY = { portugal: "pt", spain: "es", germany: "de", france: "fr", andorra: "ad", "mont blanc": "fr" };
  const flagFor = (r) => {
    const code = r.country || COUNTRY[String(r.location || "").split(",").pop().trim().toLowerCase()];
    if (!FLAGS[code]) return null;
    const s = document.createElement("span");
    s.className = "flag";
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<svg viewBox="0 0 30 20" width="18" height="12">' + FLAGS[code] + "</svg>";
    return s;
  };
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (d) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
    return m ? `${Number(m[3])} ${MON[Number(m[2]) - 1]} ${m[1]}` : d || "";
  };
  const detail = (r) =>
    r.details ? r.details
    : r.type === "triathlon" ? [r.swim, r.bike, r.run].filter(Boolean).join(" · ")
    : r.type === "trail" ? r.elevation || ""
    : r.type === "road" ? r.pace || ""
    : r.type === "cycling" ? r.speed || "" : "";

  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  };
  const field = (cls, label, value) => {
    const wrap = el("div", cls);
    wrap.append(el("dt", null, label), el("dd", null, value));
    return wrap;
  };

  // "Gravel Race 2,084 m D+" → label, then the numbers on their own line
  const detField = (label, text) => {
    const f = field("f-det", label, "");
    const dd = f.querySelector("dd");
    const m = /^([^\d]+?)\s+(\d.*)$/.exec(text);
    if (m) dd.append(m[1], " ", el("span", "nl", m[2]));
    else dd.textContent = text;
    return f;
  };
  // "4th · M40-44" / "29th overall" → place + smaller qualifier line
  const placeField = (place) => {
    const f = field("f-place", "Place", "");
    const dd = f.querySelector("dd");
    const m = /^(.*?)\s*·\s*(.+)$/.exec(place) || /^(\S+)\s+(overall)$/i.exec(place);
    if (m) dd.append(m[1], " ", el("span", "ag", m[2]));
    else dd.textContent = place;
    return f;
  };

  // Collapsed: only the first LIMIT rows of the current filter are shown
  const setExpanded = (open) => {
    const items = [...list.children];
    items.forEach((li, i) => li.classList.toggle("is-hidden", !open && i >= LIMIT));
    if (!more) return;
    more.hidden = items.length <= LIMIT;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Show fewer" : `Show the full list (${items.length})`;
    count.textContent = open ? `${items.length} shown` : `${LIMIT} of ${items.length} shown`;
  };
  toggle?.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setExpanded(open);
    if (!open) root.scrollIntoView({ block: "start" });
  });

  let rows = [];
  function render(filter) {
    const shown = rows.filter((r) => filter === "all" || r.type === filter);
    const detailLabel = DETAIL_HEAD[filter];
    detailHead.textContent = detailLabel;
    list.replaceChildren(...shown.map((r, i) => {
      const li = el("li", "res-row");
      const rank = parseInt(r.place, 10);
      if (rank <= 3) li.classList.add("is-podium");
      else if (rank <= 10) li.classList.add("is-top10");
      li.style.animationDelay = Math.min(i, 10) * 40 + "ms";
      const h = el("h3", null, r.race || "");
      if (r.location) {
        const loc = el("span", "loc");
        const f = flagFor(r);
        if (f) loc.append(f);
        loc.append(r.location);
        h.append(loc);
      }
      const dl = el("dl");
      dl.append(
        field("f-date", "Date", fmtDate(r.date)),
        field("f-disc", "Discipline", LABEL[r.type] || r.type || ""),
        field("f-dist", "Distance", r.distance || ""),
        field("f-time", "Time", r.time || ""),
        detField(detailLabel, detail(r)),
        placeField(r.place || "")
      );
      li.append(h, dl);
      return li;
    }));
    setExpanded(false);
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    if (status) status.textContent = `${shown.length} result${shown.length === 1 ? "" : "s"}`;
  }

  // Deep links: #results-trail, #results-triathlon, … open Results with that filter on
  const hashFilter = () => {
    const m = /^#results-([a-z]+)$/.exec(location.hash);
    return m && buttons.some((b) => b.dataset.filter === m[1]) ? m[1] : null;
  };
  const openFromHash = () => {
    const f = hashFilter();
    if (!f || !rows.length) return;
    render(f);
    root.scrollIntoView();
  };
  addEventListener("hashchange", openFromHash);

  buttons.forEach((b) => b.addEventListener("click", () => {
    render(b.dataset.filter);
    // keep the address shareable without jumping the page
    history.replaceState(null, "", b.dataset.filter === "all" ? "#results" : "#results-" + b.dataset.filter);
  }));

  fetch(SRC, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((data) => {
      rows = data.slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));
      buttons.forEach((b) => {
        const f = b.dataset.filter;
        const n = f === "all" ? rows.length : rows.filter((r) => r.type === f).length;
        const c = b.querySelector("[data-n]");
        if (c) c.textContent = n;
      });
      render("all");
      openFromHash();
    })
    .catch((e) => {
      console.warn("results: could not load", SRC, e);
      list.replaceChildren(el("li", "res-row res-empty", "Results couldn't load. Refresh the page to try again."));
      if (status) status.textContent = "";
    });
})();
