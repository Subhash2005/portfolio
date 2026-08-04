# Search visibility — what's done, and what only you can do

The site side is finished. Everything below the line needs your Google account and a few
hours of one-time setup; that half is what actually decides ranking.

---

## Done on the site

| Area | State |
|---|---|
| Title, description, keywords, canonical | Every page, unique |
| Structured data | Person, WebSite, ProfilePage, Service, ItemList of all 16 products; TechArticle + BreadcrumbList on each MVP doc |
| Social preview | Real 1200×630 card (`og.jpg`) + Open Graph and Twitter tags on all 16 pages |
| Sitemap / robots | All 16 URLs, `lastmod`, AI crawlers explicitly allowed |
| Internal linking | Homepage links to all 15 MVP documents; each doc links back |
| Icons / PWA | SVG favicon, apple-touch-icon, `site.webmanifest`, installable |
| Third-party requests | **Zero** — fonts self-hosted, icon font removed, mail SDK loads on demand |
| First load | 8 requests, ~190 KB, one render-blocking file, no video until you scroll to the work section |
| Caching | `vercel.json` — 1-year immutable for assets, revalidate for HTML |
| Security headers | HSTS, nosniff, frame options, referrer policy, permissions policy |
| Devices | Verified 320 / 390 / 500 / 768 / 900 / 1440 px, no horizontal overflow; safe-area insets for notched phones |

---

## What you need to do (in priority order)

### 1. Google Search Console — do this first
1. Go to <https://search.google.com/search-console>, add the property
   `https://subhashportfolio-phi.vercel.app/` (the verification meta tag is already in the page).
2. Submit `https://subhashportfolio-phi.vercel.app/sitemap.xml`.
3. Use **URL Inspection → Request indexing** on the homepage. Repeat for 3–4 MVP pages.
4. Check **Enhancements** after a week — structured data errors show up there.

Also add the site to [Bing Webmaster Tools](https://www.bing.com/webmasters) — it feeds ChatGPT search.

### 2. Get a real domain
`subhashportfolio-phi.vercel.app` will always be outranked by a domain you own.
Buy `subhashs.dev` / `subhash.dev` / `subhashs.in` (₹800–1500/yr), add it in Vercel →
Settings → Domains, then **update these**:
- every `https://subhashportfolio-phi.vercel.app/` in `index.html`, the 15 MVP pages,
  `sitemap.xml`, `robots.txt` and `site.webmanifest`
- Search Console property (add the new one, keep both during the move)

A custom domain plus consistent naming is the single biggest ranking lever you control.

### 3. Make the name resolvable
Google ranks a *person entity*, not just a page. Make every profile point to the site
and use the identical name spelling — "Subhash S":
- LinkedIn → Contact info → Website
- GitHub → Profile → Website, and pin your best repos
- LeetCode, Instagram bio
- Every hackathon/college/event page that lists you
- Your résumé PDF (already linked from the site)

The `rel="me"` links in the page point back at these, which is what ties the identity together.

### 4. Backlinks that are realistic for you
- Publish 2–3 write-ups on **dev.to / Hashnode / Medium** about a specific build
  (e.g. "Reading handwritten prescriptions with Gemini Vision") and link to the MVP doc page.
- Add the site to your college's student-project page.
- Answer questions on Stack Overflow / Reddit in your stack with the site in your profile.
- Submit finished products to **Peerlist**, **Product Hunt**, **Devfolio**.

Ten relevant links beat a hundred directory links.

### 5. Verify after deploying
- <https://search.google.com/test/rich-results> — paste the homepage URL, confirm
  Person + ItemList are detected
- <https://pagespeed.web.dev> — run mobile and desktop
- <https://www.opengraph.xyz> — confirm the social card renders

---

## Honest expectation

**"subhash"** alone is not winnable — it is one of the most common names in India and a
Sanskrit word; you'd be competing with politicians, actors and millions of namesakes.
Do not measure success on it.

**Realistic and winnable within 1–3 months of doing the above:**
`subhash portfolio` · `subhash s developer` · `subhash sairam institute` ·
`subhash full stack developer chennai` · `aura attend`, `equibridge`, `thinklearn ai`
and your other product names · `subhash ai agent developer`

Those are the queries a recruiter or client actually types. Track them in Search Console
under Performance → Queries.
