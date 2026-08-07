---
name: Rebuild/site-redesign — redesign review
about: Pull request to merge the mobile-first BuzzZA redesign (demo data) into the default branch
---

## Summary

This PR brings a redesigned, mobile-first, accessible and SEO-friendly home for BuzzZA. It modernizes the site's layout and prepares the project to integrate a real news API in the future. No existing content was deleted — changes are confined to the new branch and ready for review.

## What changed

- Replaced the single-page UI with a professional site structure (index.html) using semantic HTML.
- Added responsive, mobile-first styles (css/styles.css) with a dark/black, white and gold/orange palette.
- Added a small, dependency-free JS loader (js/main.js) to fetch and render articles, power search, and the breaking-news ticker.
- Included 20 demo/mock articles (data/articles.json). The file contains a clear demo-data disclaimer in its metadata.
- Added a simple SVG placeholder logo (assets/logo-buzzza.svg).
- README updated with testing instructions and guidance for wiring a real news API.

## Features implemented

- Professional header with accessible navigation and mobile hamburger menu.
- Breaking News ticker (clearly labelled as DEMO data; not live).
- Featured/top story section and multiple article cards with timestamps, categories, and source labels.
- Client-side search (title, excerpt, category) and results counter.
- Mobile-first responsive grid (1-3 columns depending on viewport).
- Accessible elements: skip link, ARIA labels, keyboard-focusable cards.
- SEO basics: page title, meta description, semantic article elements.

## Demo data disclaimer

All headlines, excerpts and ticker items are DEMO/MOCK data for layout and testing purposes only (see `data/articles.json`). Do not present these as live news until an authenticated news API or content feed is integrated.

## Files added

- index.html
- css/styles.css
- js/main.js
- data/articles.json
- assets/logo-buzzza.svg
- README.md (updated)

## Review checklist

- [ ] Verify site loads on mobile and desktop without console errors.
- [ ] Confirm search filters results and updates the featured story correctly.
- [ ] Check ticker displays demo headline list and does not claim "live" news.
- [ ] Test keyboard navigation (tab order), skip link, and ARIA attributes.
- [ ] Confirm no external fonts are loaded and assets are local (for privacy/performance).
- [ ] Inspect data/articles.json to ensure the demo disclaimer is present.
- [ ] Suggest any design tweaks (colors, spacing, or logo) or content changes.

Please do not merge this PR yet — review first. When you're ready I can help wire a production news API, add article detail pages, or improve image handling.
