# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Sponsors and brand partners, current and prospective.** They are deciding whether Fred is worth backing and need fast, credible proof: results, PRs, race history, reach, and an easy way to make contact.
- **Race organisers, coaches, and media.** They are checking who Fred is and what he has done, usually for a start list, an invitation, a feature, or a collaboration.
- **Fred himself.** The site is also a personal archive of his sporting life since 2013, so completeness and accuracy of the record matter to him in their own right.

Fellow athletes and social followers are welcome visitors, but they are not the audience the site is built around.

## Product Purpose

A one-page sports portfolio for Fred Cerdeira, an age-group triathlete based in Lisbon. It tells the story of his move from elite-level trail running (from 2014) to age-group triathlon (from 2019), and backs it with real results and training data.

Success means:
- Visitors come away convinced of his credibility: results, personal records, and his trail running history at elite level.
- Brands and organisers get in touch about partnerships.
- The trail-to-triathlon story reads clearly and in order.

## Positioning

A record you can check. It pairs a former elite ultra-trail and skyrunning athlete (Portuguese National Championships, UTMB, TDS, Andorra) now racing IRONMAN distances with training numbers pulled straight from Garmin Connect rather than self-reported.

## Operating Context

- Hosted on GitHub Pages at https://fredcerdeira.github.io/fr3dissimo/.
- The `.github/workflows/garmin-sync.yml` GitHub Action runs `scripts/garmin-sync.mjs` daily and writes `data/stats.json`. `site/stats-loader.js` renders it into `data-stat` hooks in the page.
- Race results live in `data/results.json`, rendered by `site/results.js` with discipline filters (triathlon, trail, road, cycling).
- Visitors mostly arrive from links on Instagram, Strava, and partner or race contexts. Contact goes by email, Instagram, or Strava.

## Capabilities and Constraints

- **Stack:** plain static HTML, CSS, and JS on GitHub Pages. No framework and no build step.
- **Training numbers come only from the Garmin sync.** Never hand-type, round up, or invent them. Gaps are real and are explained on the page (untracked swims, runs done by feel without a watch, indoor rides recorded in ROUVY or Zwift).
- **English only.** There is no Portuguese version.
- Sections: hero with year-to-date stats, About and timeline, Results (PRs and a filterable race list), Trail Run, Training, Partners, Gallery, Contact.
- Next A race is IRONMAN 70.3 Vilamoura-Algarve in 2027.

## Brand Commitments

- Name: Fred Cerdeira. The handle `fr3dissimo` is used for the repo and Instagram.
- First-person voice: plain, honest, lightly self-deprecating ("I could barely swim :)").

## Evidence on Hand

- Personal records: 10 km treadmill 31:46, half marathon 1:14:37, marathon 2:38:54, middle distance 4:24:00, IRONMAN 9:01:19.
- Race history in `data/results.json`.
- Trail highlights: UTMB 2018, Andorra Ultra Trail 2019, UTMB-TDS 2021.
- Real race and training photos in `img/` (Challenge Roth, IRONMAN Barcelona, TDS, cyclocross, gravel, trail).
- Partners: Precision Fuel & Hydration (ambassador since 2023), ROUVY (affiliate), Darefore (beta tester). Logos are in the page and in `img/partners/`.
- Not on hand: testimonials, press coverage, audience or reach figures, and sponsorship rates. Do not invent any of them.
- Imagery must be Fred's own real photos. No stock or AI-generated images.

## Product Principles

1. **Proof over claims.** Every number shown is either sourced from Garmin or a verifiable race result.
2. **Credibility first, for people deciding whether to back him.** A sponsor or organiser should grasp who he is and what he has done within the first screen or two.
3. **The story is the spine.** Running since 2013, trail running from 2014, triathlon from 2019, and what comes next, kept in that order.
4. **Honest gaps.** Untracked data is explained, not padded.
5. **The archive is complete.** Past races stay on the record even when they are not highlighted.
