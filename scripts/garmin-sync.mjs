#!/usr/bin/env node
// Garmin Connect Personal API → data/stats.json
//
// Pulls your own activities with the Garmin Personal API and writes a small,
// public-safe summary for the portfolio site. Only aggregated numbers and
// basic info about recent sessions are written: no GPS, no coordinates,
// no start times, no heart-rate data.
//
// Usage:
//   GARMIN_API_KEY=... node scripts/garmin-sync.mjs
//   node scripts/garmin-sync.mjs --from-file sample/activities.json   (offline test)
//
// Requires Node 18+ (built-in fetch). No dependencies.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const BASE = process.env.GARMIN_BASE_URL || "https://personal.connectapi.garmin.com";
const TOKEN_PATH = "/personalapitoken-service/personal-api/personal-api-key/token";
const SEARCH_PATH = "/activitylist-service/activities/search/activities";
const OUT = process.env.STATS_OUT || "data/stats.json";
const PAGE = 99;           // the Personal API returns at most 99 per page
const WEEKS = 12;          // weekly chart window
const TYPICAL_WEEKS = 8;   // "typical week" = average of the last N full weeks
const RECENT = 5;          // recent sessions shown on the site
const TZ = process.env.STATS_TZ || "Europe/Lisbon";

// ---------- sport mapping ----------
// Garmin typeKeys, e.g. lap_swimming, open_water_swimming, road_biking,
// indoor_cycling, virtual_ride, running, treadmill_running, trail_running.
export function sportOf(typeKey = "") {
  const k = typeKey.toLowerCase();
  if (k.includes("swim")) return "swim";
  if (k.includes("cycl") || k.includes("bik") || k.includes("ride")) return "bike";
  if (k.includes("run")) return "run";
  if (k.includes("multi_sport") || k.includes("triathlon") || k.includes("duathlon")) return "multisport";
  if (k.includes("strength") || k.includes("training")) return "strength";
  return "other";
}

// ---------- API ----------
async function getToken(apiKey) {
  const res = await fetch(BASE + TOKEN_PATH, {
    method: "POST",
    headers: { Authorization: `ApiKey ${apiKey}`, Accept: "*/*" },
  });
  if (!res.ok) throw new Error(`Token request failed: HTTP ${res.status} ${await res.text()}`);
  const body = (await res.text()).trim();
  // Returned as text/plain; tolerate JSON just in case.
  if (body.startsWith("{")) {
    const j = JSON.parse(body);
    return j.access_token || j.accessToken || j.token;
  }
  return body;
}

async function apiGet(token, path, params, attempt = 0) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (res.status === 429 && attempt < 5) {
    const wait = Math.max(Number(res.headers.get("retry-after")) || 0, 2 ** attempt * 2);
    console.warn(`Rate limited, waiting ${wait}s…`);
    await new Promise((r) => setTimeout(r, wait * 1000));
    return apiGet(token, path, params, attempt + 1);
  }
  if (!res.ok) throw new Error(`GET ${path} failed: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchActivities(token, startDate, endDate, extra = {}) {
  const all = [];
  for (let start = 0; ; start += PAGE) {
    const page = await apiGet(token, SEARCH_PATH, { start, limit: PAGE, startDate, endDate, ...extra });
    const items = Array.isArray(page) ? page : page.activities || page.activityList || [];
    all.push(...items);
    if (items.length < PAGE) break;
  }
  return all;
}

// Every trail run ever, one year at a time (keeps each request small).
// activityType narrows the search; results are filtered again locally in case it is ignored.
const HISTORY_FROM = Number(process.env.TRAIL_HISTORY_FROM || 2010);
async function fetchTrailHistory(token, toYear) {
  const all = [];
  for (let y = HISTORY_FROM; y <= toYear; y++) {
    const items = await fetchActivities(token, `${y}-01-01`, `${y}-12-31`, { activityType: "trail_running" });
    all.push(...items.filter((a) => (a.activityType?.typeKey || "").toLowerCase().includes("trail")));
  }
  return all;
}

export function buildTrailAllTime(activities) {
  const t = { count: 0, km: 0, hours: 0, elevationM: 0, longestKm: 0, since: null };
  const seen = new Set();
  for (const a of activities) {
    if (!(a.activityType?.typeKey || "").toLowerCase().includes("trail")) continue;
    const id = a.activityId ?? `${a.startTimeLocal}-${a.distance}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const km = (Number(a.distance) || 0) / 1000;
    t.count += 1;
    t.km += km;
    t.hours += (Number(a.movingDuration) || Number(a.duration) || 0) / 3600;
    t.elevationM += Number(a.elevationGain) || 0;
    t.longestKm = Math.max(t.longestKm, km);
    const year = Number((a.startTimeLocal || a.startTimeGMT || "").slice(0, 4));
    if (year && (!t.since || year < t.since)) t.since = year;
  }
  return { count: t.count, km: Math.round(t.km * 10) / 10, hours: Math.round(t.hours * 10) / 10,
           elevationM: Math.round(t.elevationM), longestKm: Math.round(t.longestKm * 10) / 10, since: t.since };
}

// ---------- dates ----------
const ymd = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d); // YYYY-MM-DD
function localDate(a) {
  // startTimeLocal looks like "2026-11-18 07:02:11"
  if (a.startTimeLocal) return a.startTimeLocal.slice(0, 10);
  if (a.startTimeGMT) return ymd(new Date(a.startTimeGMT.replace(" ", "T") + "Z"));
  return null;
}
function mondayOf(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  const dow = (d.getUTCDay() + 6) % 7; // 0 = Monday
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// ---------- aggregation ----------
const round = (n, p = 1) => Math.round(n * 10 ** p) / 10 ** p;
const emptyTotals = () => ({ count: 0, km: 0, hours: 0 });

export function buildStats(activities, now = new Date()) {
  const today = ymd(now);
  const year = today.slice(0, 4);
  const thisMonday = mondayOf(today);

  const norm = activities
    .map((a) => ({
      date: localDate(a),
      sport: sportOf(a.activityType?.typeKey),
      trail: (a.activityType?.typeKey || "").toLowerCase().includes("trail"),
      name: a.activityName || "",
      km: (Number(a.distance) || 0) / 1000,
      hours: (Number(a.movingDuration) || Number(a.duration) || 0) / 3600,
      elevation: Number(a.elevationGain) || 0,
    }))
    .filter((a) => a.date);

  // Year to date
  const ytd = { swim: emptyTotals(), bike: emptyTotals(), run: emptyTotals(), total: emptyTotals() };
  let elevationYtd = 0;
  const trail = { count: 0, km: 0, hours: 0, elevation: 0, longestKm: 0 };
  for (const a of norm) {
    if (!a.date.startsWith(year)) continue;
    for (const key of [a.sport, "total"]) {
      if (!ytd[key]) continue;
      ytd[key].count += 1;
      ytd[key].km += a.km;
      ytd[key].hours += a.hours;
    }
    elevationYtd += a.elevation;
    if (a.trail) {
      trail.count += 1; trail.km += a.km; trail.hours += a.hours; trail.elevation += a.elevation;
      trail.longestKm = Math.max(trail.longestKm, a.km);
    }
  }

  // Weekly series: last WEEKS weeks, current (partial) week last
  const weeks = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const monday = addDays(thisMonday, -7 * i);
    weeks.push({ week: monday, swim: 0, bike: 0, run: 0, other: 0, hours: 0 });
  }
  const byMonday = Object.fromEntries(weeks.map((w) => [w.week, w]));
  for (const a of norm) {
    const w = byMonday[mondayOf(a.date)];
    if (!w) continue;
    const bucket = ["swim", "bike", "run"].includes(a.sport) ? a.sport : "other";
    w[bucket] += a.hours;
    w.hours += a.hours;
  }

  // Typical week: average of the last TYPICAL_WEEKS *complete* weeks
  const complete = weeks.slice(0, -1).slice(-TYPICAL_WEEKS);
  const typical = { hours: 0, swimKm: 0, bikeKm: 0, runKm: 0 };
  const firstTypical = complete[0]?.week;
  for (const a of norm) {
    if (!firstTypical || a.date < firstTypical || a.date >= thisMonday) continue;
    typical.hours += a.hours;
    if (a.sport === "swim") typical.swimKm += a.km;
    if (a.sport === "bike") typical.bikeKm += a.km;
    if (a.sport === "run") typical.runKm += a.km;
  }
  const n = complete.length || 1;

  // Recent sessions (no names by default: they often contain place names)
  const recent = [...norm]
    .sort((x, y) => (x.date < y.date ? 1 : -1))
    .filter((a) => ["swim", "bike", "run", "multisport"].includes(a.sport))
    .filter((a) => a.hours >= 10 / 60) // skip warm-ups, transitions and other short bits
    .slice(0, RECENT)
    .map((a) => ({ date: a.date, sport: a.sport, km: round(a.km, a.sport === "swim" ? 2 : 1), hours: round(a.hours, 2) }));

  const fix = (t) => ({ count: t.count, km: round(t.km), hours: round(t.hours) });
  return {
    updatedAt: now.toISOString(),
    year: Number(year),
    ytd: { swim: fix(ytd.swim), bike: fix(ytd.bike), run: fix(ytd.run), total: fix(ytd.total), elevationM: Math.round(elevationYtd),
      trail: { ...fix(trail), elevationM: Math.round(trail.elevation), longestKm: round(trail.longestKm) } },
    typicalWeek: {
      weeks: complete.length,
      hours: round(typical.hours / n),
      swimKm: round(typical.swimKm / n),
      bikeKm: round(typical.bikeKm / n),
      runKm: round(typical.runKm / n),
    },
    weekly: weeks.map((w) => ({ week: w.week, swim: round(w.swim, 2), bike: round(w.bike, 2), run: round(w.run, 2), other: round(w.other, 2), hours: round(w.hours, 2) })),
    recent,
  };
}

// ---------- main ----------
async function main() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--from-file");
  const now = new Date();
  let activities;
  let trailHistory;

  if (fileIdx !== -1) {
    activities = JSON.parse(await readFile(args[fileIdx + 1], "utf8"));
    trailHistory = activities;
  } else {
    const apiKey = process.env.GARMIN_API_KEY;
    if (!apiKey) throw new Error("Set GARMIN_API_KEY (your Garmin Personal API key).");
    const today = ymd(now);
    const jan1 = today.slice(0, 4) + "-01-01";
    const weeksBack = addDays(mondayOf(today), -7 * (WEEKS - 1));
    const startDate = weeksBack < jan1 ? weeksBack : jan1;
    const token = await getToken(apiKey);
    activities = await fetchActivities(token, startDate, today);
    console.log(`Fetched ${activities.length} activities since ${startDate}.`);
    trailHistory = await fetchTrailHistory(token, Number(today.slice(0, 4)));
    console.log(`Fetched ${trailHistory.length} trail runs since ${HISTORY_FROM}.`);
  }

  const stats = buildStats(activities, now);
  stats.trailAllTime = buildTrailAllTime(trailHistory);
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(stats, null, 2) + "\n");
  console.log(`Wrote ${OUT}: ${stats.ytd.total.count} sessions, ${stats.ytd.total.hours} h this year.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
