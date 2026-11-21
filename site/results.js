// Results table with discipline filters. Data: data/results.json
// Each entry: date, race, type (triathlon | trail | road | cycling), distance, time, place,
// plus per type: swim/bike/run (triathlon), elevation (trail), pace (road), speed (cycling).
// Newest first: dates sort as text, so write them as YYYY-MM-DD (or YYYY).

(function () {
  const root = document.querySelector("[data-results]");
  if (!root) return;
  const SRC = root.dataset.src || "data/results.json";
  const tbody = root.querySelector("tbody");
  const detailHead = root.querySelector("[data-detail-head]");
  const buttons = [...root.querySelectorAll("[data-filter]")];
  const status = root.querySelector("[data-results-status]");

  const LABEL = { triathlon: "Triathlon", trail: "Trail run", road: "Road run", cycling: "Cycling" };
  const DETAIL_HEAD = { all: "Details", triathlon: "Swim · Bike · Run", trail: "D+", road: "Pace", cycling: "Avg speed" };
  const detail = (r) =>
    r.type === "triathlon" ? [r.swim, r.bike, r.run].filter(Boolean).join(" · ")
    : r.type === "trail" ? r.elevation || ""
    : r.type === "road" ? r.pace || ""
    : r.type === "cycling" ? r.speed || "" : "";

  const cell = (text, tag = "td", bold = false) => {
    const el = document.createElement(tag);
    if (bold) { const b = document.createElement("b"); b.textContent = text; el.appendChild(b); }
    else el.textContent = text;
    return el;
  };

  let rows = [];
  function render(filter) {
    const list = rows.filter((r) => filter === "all" || r.type === filter);
    detailHead.textContent = DETAIL_HEAD[filter];
    tbody.replaceChildren(...list.map((r, i) => {
      const tr = document.createElement("tr");
      tr.style.animationDelay = i * 40 + "ms";
      tr.append(cell(r.date || ""), cell(r.race || "", "td", true), cell(LABEL[r.type] || r.type),
        cell(r.distance || ""), cell(r.time || "", "td", true), cell(detail(r)), cell(r.place || ""));
      return tr;
    }));
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    if (status) status.textContent = `${list.length} result${list.length === 1 ? "" : "s"}`;
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
