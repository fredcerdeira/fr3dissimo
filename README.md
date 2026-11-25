# fr3dissimo

My sports portfolio: trail running since 2014, age-group triathlon since 2019, and training numbers pulled straight from Garmin rather than typed in by me.

Live at [fredcerdeira.com](https://fredcerdeira.com).

## Run it locally

Plain HTML, CSS and JavaScript. No build step, no dependencies.

```sh
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765. Use a server rather than opening the file directly, because the page fetches its data with `fetch()`.

## Where things live

| Path | What it is |
|---|---|
| `index.html` | All the page content |
| `404.html` | The "Wrong turn." page |
| `site/css/styles.css` | All the styling |
| `site/*.js` | Motion, the results list and the stats loader |
| `data/results.json` | Race results, edited by hand |
| `data/stats.json` | Training numbers, written by the Garmin sync only |
| `img/` | Photos and icons |
| `PRODUCT.md`, `DESIGN.md` | Who the site is for, and the design system it follows |

## Adding a race

Add an entry to `data/results.json`. Order doesn't matter, because the list is sorted by date.

```json
{
  "date": "2026-04-26",
  "race": "Middle Distance National Championship",
  "location": "Moura, Portugal",
  "type": "triathlon",
  "distance": "70.3",
  "time": "4:45:38",
  "details": "1.9/90/21 km",
  "place": "2nd · M45-49"
}
```

`type` is one of `triathlon`, `trail`, `road` or `cycling` and drives the filters. The flag comes from the last part of `location`; set `"country": "pt"` to override it.

## Garmin data

`.github/workflows/garmin-sync.yml` runs every day at 05:17 UTC (or from the Actions tab). It calls `scripts/garmin-sync.mjs`, which uses the Garmin Personal API to write `data/stats.json` and commits it if anything changed. Only totals and basic session info are written: no GPS, start times or heart rate.

It needs one repository secret, `GARMIN_API_KEY`. To test without the API:

```sh
STATS_OUT=/tmp/stats.json node scripts/garmin-sync.mjs --from-file sample/activities.json
```

Without `STATS_OUT` it overwrites the real `data/stats.json` with sample numbers.

Don't edit `data/stats.json` by hand. Every training number on the site should be checkable against Garmin.

## Deploy

`.github/workflows/deploy.yml` publishes to GitHub Pages on every push to `main` and after every Garmin sync. It copies the site into `_site` and stamps the CSS and JS links with the commit ID, so visitors never get a stale cached version.

---

Design and Code by Fred Cerdeira.
