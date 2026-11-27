# fr3dissimo

My sports portfolio: trail running since 2014, age-group triathlon since 2019, and training numbers pulled straight from Garmin rather than typed in by me.

Live at [fredcerdeira.com](https://fredcerdeira.com).

## Run it locally

Plain HTML, CSS and JavaScript. No dependencies. The one build step is the design tokens, see below.

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
| `tokens/*.tokens.json` | Design tokens: colours, fonts, spacing and the two themes (source of truth) |
| `site/css/tokens.css` | Generated from `tokens/`. Do not edit by hand |
| `scripts/build-tokens.mjs` | Builds `tokens.css` from `tokens/` |
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

## Design tokens

Colours, fonts and spacing live in `tokens/`, in three files:

- `theme-primitives.tokens.json`: the raw values for each theme (`Classic`, `Alternative`).
- `surface.tokens.json`: the roles for each surface (`Asphalt` on the page, `Paper` inside `.paper`), plus the legacy names `styles.css` still uses.
- `shared.tokens.json`: spacing and radius, the same in every theme.

Figma is the design source. The JSON files mirror the Figma file "Fred's Playground", page "fr3dissimo Tokens". After you change a value in Figma, update the matching JSON, then regenerate and check the CSS:

```sh
node scripts/build-tokens.mjs          # writes site/css/tokens.css and site/theme-fonts.js
node scripts/build-tokens.mjs --check  # fails if either generated file is out of date
```

To preview the second theme, use the Theme switch in the footer. It calls `fr3Theme.set("alternative")` (or `"classic"`) from `site/theme.js`, which sets `data-theme` on `<html>` and loads the theme's Google Fonts the first time. The choice is not saved, so a reload returns to Classic. The font lists live in `$fonts` in `tokens/theme-primitives.tokens.json`.

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
