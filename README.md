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
| `scripts/build-tokens.mjs` | Builds `tokens.css` and `theme-fonts.js` from `tokens/` |
| `site/theme.js` | Theme switch: sets the theme and loads its fonts |
| `site/theme-fonts.js` | Generated: Google Fonts stylesheets per theme |
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

Colours, fonts, spacing and photo treatment live in `tokens/`. Figma is the design source: the JSON files mirror the Figma file "Fred's Playground", page "fr3dissimo Tokens".

### Two axes

- **Theme** picks the brand values: `fc1` (the original look) or `fc2` (the alternative). Theme holds the accent, neutrals, photo tint and font families.
- **Surface** picks how those values sit on a background: `Asphalt` (dark, the page default) or `Paper` (light, inside `.paper`, used by the Results and Partners band).

A page is one theme plus one surface. The four looks are the four combinations, and the specimen on the Figma page shows all four.

| Look | Canvas | Use |
|---|---|---|
| fc1 · Asphalt | `#0b0b0c` | The current site's dark surface |
| fc1 · Paper | `#f2f1ec` | The current Results and Partners band |
| fc2 · Asphalt | `#0b1020` | Placeholder |
| fc2 · Paper | `#eef3fb` | Placeholder |

### Collections

| Collection | Modes | Variables | Purpose |
|---|---|---|---|
| Theme Primitives | fc1, fc2 | 17 | Raw brand values for each theme, including `photo/tint` and the font families |
| Surface | Asphalt, Paper | 8 | Semantic roles that point at Theme Primitives (`color/bg/canvas`, `color/text/muted`, and so on) |
| Shared Scale | Value | 6 | Spacing and radius, the same in every theme |

Surface roles are aliases, so switching a theme changes every role without touching any frame.

### Files

- `theme-primitives.tokens.json`: the values for each theme, and `$fonts`, the Google Fonts stylesheet for each theme.
- `surface.tokens.json`: the roles for each surface, plus `$legacy`, the names `styles.css` still uses.
- `shared.tokens.json`: spacing and radius.

Run the build after any change:

```sh
node scripts/build-tokens.mjs          # writes site/css/tokens.css and site/theme-fonts.js
node scripts/build-tokens.mjs --check  # fails if either generated file is out of date
```

Do not edit the generated files by hand.

### What follows the theme

- Colours and font names, through the CSS variables in `tokens.css`.
- The top and bottom edge glow, the hero scrim and the stats strip (they mix the accent or background colour).
- The photo tint: `photo/tint` is transparent in fc1 and navy at 85% in fc2. It is laid over the grey photos with blend mode Color. On gallery hover it fades out, so photos still turn to full colour.

### Switching the theme

Use the **Vibe** dropdown at the bottom right of the footer. It calls `fr3Theme.set("fc2")` (or `"fc1"`) from `site/theme.js`, which sets `data-theme` on `<html>` and loads the theme's Google Fonts the first time. The first switch to fc2 can flash fallback text while the fonts load. The choice is not saved, so a reload returns to fc1.

### Syncing from Figma

When a value changes in Figma, update the matching value in the JSON file (same variable names and modes), then run the build and commit the result.

### Status and open items

- The repo side is committed on `feat/design-tokens-themes`. Nothing is merged to `main` yet.
- fc2's palette and fonts are placeholders.
- Figma text styles are not created yet. fc2 will need its own set once the values are final.
- The specimen labels in Figma use Inter, because text fonts cannot be bound to the font-family variables.

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
