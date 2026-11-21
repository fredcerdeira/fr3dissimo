// Results list with discipline filters. Data: data/results.json
// Each entry: date, race, optional location, type (triathlon | trail | road | cycling),
// distance, time, place, plus per type: swim/bike/run (triathlon), elevation (trail),
// pace (road), speed (cycling), or a free-text "details" that replaces them.
// Newest first: write dates as YYYY-MM-DD (or YYYY).
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

  const LABEL = { triathlon: "Triathlon", trail: "Trail run", road: "Road run", cycling: "Cycling" };
  const DETAIL_HEAD = { all: "Details", triathlon: "Swim · Bike · Run", trail: "D+", road: "Pace", cycling: "Avg speed" };
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

  let rows = [];
  function render(filter) {
    const shown = rows.filter((r) => filter === "all" || r.type === filter);
    const detailLabel = DETAIL_HEAD[filter];
    detailHead.textContent = detailLabel;
    list.replaceChildren(...shown.map((r, i) => {
      const li = el("li", "res-row");
      li.style.animationDelay = i * 40 + "ms";
      const h = el("h3", null, r.race || "");
      if (r.location) h.append(el("span", "loc", r.location));
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
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    if (status) status.textContent = `${shown.length} result${shown.length === 1 ? "" : "s"}`;
  }

  buttons.forEach((b) => b.addEventListener("click", () => render(b.dataset.filter)));

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
    })
    .catch((e) => console.warn("results: could not load", SRC, e));
})();
