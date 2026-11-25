---
name: Fred Cerdeira
description: One-page sports portfolio. Black, grayscale photography, condensed uppercase type and a single race orange.
colors:
  night-asphalt: "#0b0b0c"
  asphalt-raised: "#131315"
  asphalt-deep: "#1b1b1e"
  chalk: "#f2f1ec"
  dust-gray: "#a3a29c"
  race-sheet-paper: "#f2f1ec"
  bib-black: "#111112"
  pencil-gray: "#5d5c57"
  race-orange: "#ff6b2c"
  burnt-orange: "#b8400c"
  hairline-on-dark: "rgba(242,241,236,.14)"
  hairline-on-paper: "rgba(17,17,18,.15)"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(56px, 8vw, 128px)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "0em"
    fontVariation: "'wdth' 62"
  numeral:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "min(32cqi, 128px)"
    fontWeight: 900
    lineHeight: 1
    fontVariation: "'wdth' 62"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(24px, 2.4vw, 32px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.02em"
    fontVariation: "'wdth' 62"
  title:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  intro:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  data:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    letterSpacing: "0.14em"
rounded:
  none: "0"
  flag: "2px"
  pill: "999px"
spacing:
  gutter: "clamp(20px, 4vw, 56px)"
  section: "clamp(80px, 12vw, 160px)"
  block: "56px"
  stack: "24px"
  cluster: "12px"
components:
  button-primary:
    backgroundColor: "{colors.race-orange}"
    textColor: "{colors.bib-black}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "46px"
  button-ghost:
    backgroundColor: "rgba(11,11,12,.35)"
    textColor: "{colors.chalk}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "46px"
  button-ghost-on-paper:
    backgroundColor: "transparent"
    textColor: "{colors.bib-black}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "46px"
  button-ghost-on-paper-hover:
    backgroundColor: "{colors.bib-black}"
    textColor: "{colors.race-sheet-paper}"
  nav-cta:
    backgroundColor: "{colors.race-orange}"
    textColor: "{colors.bib-black}"
    rounded: "{rounded.pill}"
    padding: "0 18px"
    height: "38px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.bib-black}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.bib-black}"
    textColor: "{colors.race-sheet-paper}"
    rounded: "{rounded.pill}"
  partner-card:
    backgroundColor: "rgba(17,17,18,.05)"
    textColor: "{colors.bib-black}"
    rounded: "{rounded.none}"
    padding: "24px"
  partner-card-hover:
    backgroundColor: "{colors.bib-black}"
    textColor: "{colors.race-sheet-paper}"
---

# Design System: Fred Cerdeira

## Overview

**Creative North Star: "The Start Line"**

The site feels like the minute before the gun: dark, quiet and wound tight, with one colour that means *go*. Night Asphalt carries almost every screen; grayscale photographs of real races sit behind it like floodlit course; headings are set in extra-condensed, uppercase Archivo, stacked tight like a start-line banner. Race Orange is the bib number in the crowd: the call to action, the accent in the hero, the bar chart, the podium mark. Nothing else competes with it.

The record is the decoration. Numbers are the largest things on the page after the section titles, set in the same condensed face, and they come from Garmin rather than from a designer's sample data. Labels speak in small, spaced Space Mono, like timing-chip printouts. The one light surface, Race-Sheet Paper, is reserved for the results: the moment the page stops telling a story and shows the start list.

Density is low and the rhythm is long: generous section padding, wide gutters, and blocks separated by hairlines rather than boxes. Motion is a single grammar (fade-up on arrival, hero lines sliding in, numbers counting up) and it disappears entirely under reduced motion.

**Key Characteristics:**
- Dark by default; one light "results" band per page.
- One accent colour, used sparingly and always meaning action or achievement.
- Extra-condensed uppercase display type for headings and big numbers; humanist Barlow for reading; Space Mono for labels.
- Every photograph is grayscale; colour returns only on hover in the gallery.
- Flat surfaces separated by hairlines, never by shadows.

## Colors

A near-black base, a chalk-white ink, and one hot orange. Two paper tones exist only for the results band.

### Primary
- **Race Orange** (`race-orange`): the only accent. Primary buttons, the nav Contact pill, the "[Trail]" in the hero, the weekly hours chart, the Everest line, the timeline progress rule, focus outlines, text selection and the glowing top and bottom edge of the viewport.
- **Burnt Orange** (`burnt-orange`): Race Orange darkened for contrast on Race-Sheet Paper. Podium places, the lead highlight's rule and label, the section label and focus outlines inside the paper band.

### Neutral
- **Night Asphalt** (`night-asphalt`): the page background and the scrim colour behind hero and 404 photography.
- **Asphalt Raised** (`asphalt-raised`): the alternate dark section (Training), one step up so long dark runs still have rhythm.
- **Asphalt Deep** (`asphalt-deep`): image placeholders in the gallery and the scrollbar thumb.
- **Chalk** (`chalk`): all primary text on dark.
- **Dust Gray** (`dust-gray`): intros, captions and labels on dark.
- **Race-Sheet Paper** (`race-sheet-paper`): the results band background. Same value as Chalk, so the band reads as the ink turned into a surface.
- **Bib Black** (`bib-black`): text on paper and on Race Orange, the selected chip, the partner hover state.
- **Pencil Gray** (`pencil-gray`): secondary text and labels on paper.
- **Hairlines** (`hairline-on-dark`, `hairline-on-paper`): every divider, list rule and ghost-button border.

### Named Rules
**The One Orange Rule.** Race Orange is the only hue on the page. It marks action (buttons, links on hover) or achievement (podiums, the goal race, the chart). If something orange is neither, it shouldn't be orange.

**The Paper Swap Rule.** On Race-Sheet Paper, Race Orange becomes Burnt Orange and Dust Gray becomes Pencil Gray. Never put Race Orange text on paper; it fails contrast.

## Typography

**Display Font:** Archivo at its narrowest width (62) and heaviest weight (900), with Arial Narrow as fallback
**Body Font:** Barlow (400, 600, 700), with the system UI stack as fallback
**Label/Mono Font:** Space Mono (400)

**Character:** A condensed, shouting grotesque for headlines and numbers against a calm, slightly technical humanist sans for reading; the monospace is the timing printout that labels everything.

### Hierarchy
- **Display** (Archivo 900, `clamp(56px, 8vw, 128px)`, line-height 0.9, uppercase): section titles ("Since 2013.", "Off road.", "Every session."). The hero runs at `clamp(52px, 7.6vw, 124px)` and the footer sign-off at up to 200px.
- **Numeral** (Archivo 900, `min(32cqi, 128px)`, line-height 1): the big figures in training, trail and record tiles. Scales with its tile and is shrunk by script if a value would overflow.
- **Headline** (Archivo 900, `clamp(24px, 2.4vw, 32px)`, 0.02em, uppercase): sub-sections inside a section, such as Highlights and Personal Records.
- **Title** (Barlow 600, 26px, line-height 1.15): timeline entries. Race names in the results list use Barlow 600 at 16px (19px on narrow screens).
- **Intro** (Barlow 400, 20px, line-height 1.6, max about 34rem): the paragraph under each section title, in Dust Gray or Pencil Gray.
- **Body** (Barlow 400, 17px, line-height 1.6): default text.
- **Data** (Barlow 400, 15px, line-height 1.45, tabular figures): result rows, tile captions, highlight details. Finish times step up to 700.
- **Label** (Space Mono 400, 12px, 0.14em, uppercase): tile labels, stat labels, section labels, the results table head, captions over photos (11px).

### Named Rules
**The Condensed Voice Rule.** Archivo appears only uppercase, only at weight 900, only at width 62. It is for headings, the brand, the mobile menu and big numbers, never for sentences.

**The Tabular Rule.** Any number a visitor might compare (times, distances, hours) uses tabular figures so columns line up.

## Layout

A single centred column (max 1240px) with fluid side gutters (`clamp(20px, 4vw, 56px)`). Sections breathe with `clamp(80px, 12vw, 160px)` top and bottom padding; blocks within a section are separated by about 56px, and groups within a block by 12 to 24px.

Story sections use a two-column grid (text left, a 4:5 grayscale photo right, aligned to the bottom). Data sits in three- to five-column grids of borderless tiles: three for the timeline, trail build-up and training, four for trail stats, five for personal records, the hero stats bar and partners. The gallery is a four-column dense grid with 240px rows, mixing wide (2×2) and tall (1×2) frames.

The hero fills the viewport (`100svh`) with its photo bleeding behind a left-to-right and bottom-up scrim; the stats bar is pinned to its bottom edge. The slogan is the headline on the left; the right column opens with the name as a signature (Archivo 900 at `clamp(34px, 3.8vw, 45px)` under a 2px Race Orange rule cut to the name's width that draws in from the left as the name arrives, then a Label line), followed by the intro and the primary button.

Responsive behaviour: at 1023px the results table becomes stacked cards and partners go to two columns. At 960px the nav collapses to a menu button, story grids and tile grids go to one column, the hero stats become a two-column grid and the gallery two columns. Personal records step down to three columns at 1000px and two at 640px.

## Elevation & Depth

The system is flat. There are no box shadows on cards, buttons or panels. Depth comes from three things only: tonal steps between Night Asphalt, Asphalt Raised and Race-Sheet Paper; photographic scrims (gradients from Night Asphalt to transparent) that push text forward over images; and translucent, blurred bars (the scrolled nav, the hero stats bar, ghost buttons over photos).

### Shadow Vocabulary
- **Lede lift** (`text-shadow: 0 1px 12px rgba(0,0,0,.6)`): only on the hero intro, to keep it legible over the photograph.
- **Flag ring** (`box-shadow: 0 0 0 1px rgba(17,17,18,.12)`): a hairline around the tiny country flags in results so white flag fields don't vanish into paper.

### Named Rules
**The Hairline Rule.** Separate with a 1px hairline, not a box or a shadow. Lists, tiles, timeline entries and highlights are divided by rules on top or bottom; the only heavier rules are the 2px Bib Black (or Burnt Orange) tops on highlights and the 2px orange timeline progress.

## Shapes

Two shapes only: the full pill (999px) for every interactive control (buttons, chips, the menu button, the copy-email button) and the hard rectangle (0 radius) for everything else: photos, tiles, partner cards, the results band. The 2px radius on flags is the single exception. Photos are cropped, never rounded, and the only circle is the small podium dot before a top-three place.

## Components

### Buttons
Confident, compact race-kit pills.
- **Shape:** full pill (999px), 46px tall, 22px side padding, Barlow 600 at 15px, optional 18px line icon with an 8px gap.
- **Primary:** Race Orange fill with Bib Black text. Used once per context: "See results", "Email", "Back to the start".
- **Ghost:** 1px hairline border, Chalk text, a 35% Night Asphalt fill with a 6px backdrop blur so it holds up over photos.
- **Ghost on paper:** 1px Bib Black border and text; fills Bib Black with paper text on hover ("Show the full list").
- **Hover / Focus:** buttons lift 2px on hover (disabled under reduced motion); ghost borders brighten to Chalk. Focus is a 2px Race Orange outline offset 3px (Burnt Orange on paper).
- **Nav Contact:** the primary pill at 38px tall, 18px padding, 14px text.

### Chips
- **Style:** pill, 40px tall, transparent with a paper hairline border, Barlow 600 at 14px, a Space Mono count at 11px and 70% opacity.
- **State:** the selected filter fills Bib Black with paper text (`aria-pressed="true"`); hover darkens the border to Bib Black.

### Cards / Containers
- **Corner Style:** square (0).
- **Background:** none for data tiles; a 5% Bib Black tint for partner cards, which invert to Bib Black with paper text and white logos on hover or focus.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** none on tiles; hairline or 2px rules on top for highlights and build-up items.
- **Internal Padding:** tiles `clamp(24px, 3vw, 40px)` vertically and flush left; partner cards 24px.

### Navigation
- Fixed, 64px tall, transparent over the hero; after scrolling it becomes 78% Night Asphalt with a 12px blur and a bottom hairline.
- Brand in Archivo 900 uppercase at 24px; section links in Barlow at 14px, light gray turning Race Orange on hover; the Contact pill on the right.
- Under 960px the links move into a full-width drop panel opened by a round 44px menu button. The links there become Archivo 900 uppercase at 22px, separated by hairlines. Escape closes it.

### Stat Tile (signature)
The page's proof unit: a Space Mono label, a Numeral in Chalk (or Bib Black on paper) and a one-line Data caption in Dust Gray. Numbers count up from zero when they scroll into view; a secondary line in Race Orange may translate the figure into something human ("About 60 Everests from sea level").

### Results Row (signature)
An ordered list on Race-Sheet Paper laid out as a seven-column table: date, race and location with a flag, discipline, distance, time in bold, details, place. Top-three places are Burnt Orange, bold, with a podium dot; places four to ten are bold. Rows fade up 8px on arrival. Under 1023px each row becomes a two-column stack of labelled fields. The list shows ten rows, with a ghost-on-paper "Show the full list" button.

### Weekly Hours Chart (signature)
Twelve Race Orange bars, one per week, in a full-height row of buttons. Hovering, tapping or arrowing to a bar dims the others to 30% and swaps the caption to that week's split; leaving restores the typical-week line. Bars grow up from the baseline when the section enters the viewport.

## Do's and Don'ts

### Do:
- **Do** keep every photograph grayscale (`filter: grayscale(1)`), with contrast lifted slightly; let colour return only on gallery hover.
- **Do** put a Night Asphalt scrim between any photo and the text on top of it.
- **Do** use Race Orange for one primary action per view and for achievement marks; switch to Burnt Orange on paper.
- **Do** set headings and big numbers in uppercase Archivo 900 at width 62, and labels in uppercase Space Mono at 12px with 0.14em tracking.
- **Do** separate content with hairlines and space, and use tabular figures for anything numeric.
- **Do** give every motion a reduced-motion fallback that shows the final state immediately.

### Don't:
- **Don't** add a second accent colour, gradients on text, or coloured photo treatments.
- **Don't** round photos, tiles or cards; rounding belongs only to pill controls.
- **Don't** add drop shadows to cards or buttons.
- **Don't** set sentences in Archivo or use it in lowercase.
- **Don't** put Race Orange text on Race-Sheet Paper.
- **Don't** fill a tile with sample or rounded-up numbers; training figures come from the Garmin data file only.
