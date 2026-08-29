# Perú Crafted Experiences — Funnel remediation deliverables

Reference for the commercial-funnel restructure (Blocks 1–6). Nothing here invents
prices, hotels, inclusions, reviews or accreditations — every gap is a `TODO(owner)`.

---

## 1. What shipped (Blocks 1–6)

| Block | Summary | Commit |
|---|---|---|
| 1 | Inverted the CTA: "When would you like to travel?" dates block is the primary CTA on home, journeys and the four itineraries; `payments.html` demoted to a client-only page (out of nav, `noindex`, discreet footer link). | `e08ca91` |
| 2 | Each journey is now a product: category + duration + price line (with 3× conditions), Places, "What's included / Not included", **downloadable PDF dossier**, accommodation stub (unpublished), Patricia advisor block. | `a41143e` |
| 3 | Enquiries carry the journey: `contact.html` reads `?journey/journeys/month/travellers`, shows a context banner, prefills fields, and the journey rides into the payload + WhatsApp. Minimal wishlist (localStorage) with header counter + `saved.html`. | `65689ff` |
| 4 | Three-pillar trust block before each closing CTA; financial-protection pillar is a **marked, empty** reserved slot (no badge); footer company-details slot + verified-reviews gap. | `6bd1967` |
| 6 | Removed the four ghost "template" journeys (incl. **Taste of Peru**); the catalogue is now only the four real itineraries. | `ea6fd22` |
| — | Photo swaps (real, location-accurate): ceviche, artisan market, Amazon panorama, Sacred Valley, Colca, Rainbow Mountain, plus Patricia's Lima/Arequipa/Nazca set. | `06a27ea`, `19e3b04` |

The PDF dossiers are regenerated with `scripts/build-dossiers.sh` (headless Chrome, no deps).

---

## 2. Block 6 — name collision (gastronomy product)

"Taste of Peru" collided with Journey Latin America's **"A Taste of Peru"** (12 days,
£4,470 pp) and with the Peru operator **taste-of-peru.com**. It has been removed.

If Perú Crafted wants a dedicated gastronomy journey, three checked alternatives
(searched against UK/Peru operators — no product collision found):

1. **Sazón — A Culinary Peru** — *sazón* = seasoning/soul of a dish; distinctive, on-brand
   with the accented "Perú". Only match is a US restaurant, not a tour product.
2. **The Peruvian Table** — classic and clear; no operator product uses it.
3. **Pachamanca to Pisco** — the earth-oven-to-distillery arc, coast-to-Andes; evocative
   and unused by operators. (Alt: **Mesa Peruana**, also free.)

Avoid: "Taste of Peru", "Flavours/Flavors of Peru" (used by Zicasso and others).

### Price-per-person-per-day (fill once "from" prices exist)

Reference: JLA "A Taste of Peru" = £4,470 / 12 days ≈ **£372 pp/day**.

| Itinerary | Days | From £ (TODO owner) | £/day |
|---|---|---|---|
| Grand Peru | 20 | — | — |
| Unforgettable Peru | 13 | — | — |
| Majestic Peru | 10 | — | — |
| Cusco Essentials | 3 | — | — |

> If our £/day lands well below £372, the problem isn't the price — it's that the page
> must justify the value (named hotels, concrete inclusions, a professional portrait).

---

## 3. Block 5 — modular architecture plan (NOT implemented; awaiting approval)

The competitor builds each itinerary from **components that already rank on their own**
("Places you'll visit" → destination pages; "Things to do" → experience pages), so a new
product inherits existing authority. Proposed in three phases.

### Phase A — Destination pages
Own content, linked from every itinerary that includes them. The itinerary "Places you'll
visit" chips (today → `experiences.html`) repoint here.

| Page | URL (flat, matches `journey-*.html`) | `<title>` | Meta description |
|---|---|---|---|
| Lima | `destination-lima.html` | Lima, Peru — The Coast & Its Kitchens · Perú Crafted | Peru's culinary capital: markets, ceviche, world-ranked tables and colonial Lima. |
| Cusco & Sacred Valley | `destination-cusco-sacred-valley.html` | Cusco & the Sacred Valley · Perú Crafted | The Inca heartland — Cusco, Pisac, Ollantaytambo, Maras & Moray, Machu Picchu. |
| Arequipa & Colca | `destination-arequipa-colca.html` | Arequipa & the Colca Canyon · Perú Crafted | The white city of sillar and the condors of the Colca Canyon. |
| Lake Titicaca | `destination-lake-titicaca.html` | Lake Titicaca — The Altiplano · Perú Crafted | The Uros floating islands, Taquile and the highest navigable water on earth. |
| The Amazon | `destination-amazon.html` | The Peruvian Amazon · Perú Crafted | Rivers, wildlife and rainforest lodges in Tambopata and the Madre de Dios. |

*(Optional later: a South Coast page — Paracas · Ica · Nazca.)*

Template per destination: hero, intro, "Why go", "Best experiences here" (links to Phase B),
"Journeys that include <destination>" (links to itineraries), closing dates CTA + trust block.

### Phase B — Experience pages (reusable)
Each itinerary links the ones it contains.

| Page | URL | Included in |
|---|---|---|
| Lima cooking class & market | `experience-lima-cooking-class.html` | Grand, Unforgettable, Majestic |
| Chinchero market & weavers | `experience-chinchero-weavers.html` | Grand, Cusco Essentials |
| The train to Machu Picchu | `experience-train-machu-picchu.html` | all four |
| Pisco tasting (Ica) | `experience-pisco-tasting.html` | Grand, Unforgettable |
| Uros floating islands | `experience-uros-islands.html` | Grand, Unforgettable |

### Phase C — Cross-linking
- destination → itineraries that include it, and → its experiences
- experience → itineraries that include it, and → its destination
- itinerary → its destinations (Places chips) and → its experiences (What's included)
- A destinations/experiences index (extend `experiences.html` or add `destinations.html`).

### Effort (rough, dev only)
- Phase A: ~0.5 day scaffolding the template + wiring, then ~1–2 h/page once copy exists (5 pages).
- Phase B: ~1–1.5 h/page once copy exists (5 pages).
- Phase C: ~0.5 day of link wiring + an index.
- **Total ≈ 3–4 dev-days** *after* Patricia's copy is written.

### What needs Patricia's writing (no invention)
Every destination/experience description, and the concrete facts inside them (which providers,
which hotels, what each experience actually includes). Dev can scaffold the pages and SEO;
the words and the facts must be hers.

---

## 4. TODO(owner) — grouped (56 markers in code)

### A. Prices
- "From" price per person for **each of the four** itineraries (`journey-*.html`, product-meta).
  Until then the page shows "Tailored pricing". Do **not** invent/estimate (ASA/CAP risk).

### B. Inclusions / exclusions (per itinerary)
- Confirm concrete, verifiable **inclusions** (transfers, nights+category, meals, named guided
  experiences, train/flight operator+class, entries/permits, assistance, taxes) to replace the
  generic bullets. Adjust the **exclusions** to real operations.

### C. Accommodation (per itinerary — section currently UNPUBLISHED)
- Exact hotel name · city · nights, one line on why Patricia chose it, and a photo (own or
  hotel-supplied). No example hotels are shown until this exists.

### D. Patricia
- **Professional portrait** (the current image is a low-res selfie — the biggest credibility
  drag at this price point).

### E. Company / legal / financial protection
- Registered company name, company number, registered address (footer + `privacy.html` +
  `terms.html`).
- **Financial protection** for UK package sales (Package Travel Regulations 2018): the real
  scheme — trust account / bonding / insolvency insurance / ATOL/ABTA/TTA. **Never show a
  badge unless genuinely held.** Needs legal review.
- Data-retention period in `privacy.html`.

### F. Integrations / endpoints
- **Stripe** production Payment Link (`PAYMENTS.stripeLink`) — never a `test_` link.
- **FORM_ENDPOINT** (leads) — until then the form falls back to WhatsApp.
- **NEWSLETTER_ENDPOINT** — until then the newsletter block is hidden.
- **Verified reviews** account (Trustpilot / Feefo / Google) to fill the reviews gap.

### G. Brand details
- Confirm the brand **email** (placeholder `hello@perucraftedexperiences.com`; not the agency's).
- **Instagram** URL (icon/link hidden until set).
- Base **URL** when migrating off the GitHub Pages domain (canonical/OG on every page).

---

## 5. CTA hierarchy — before / after (closing CTA)

| Page | Before | After |
|---|---|---|
| Home | WhatsApp + "Start Your Enquiry" (2 equal buttons) | **Dates block** (primary) + WhatsApp (secondary) + trust block |
| Journeys | WhatsApp + "Start Your Enquiry" | **Dates block** + WhatsApp; ghost catalogue (4 extra "Enquire" buttons) removed |
| Each itinerary | overview "Enquire" (gold) + WhatsApp + "Start Your Enquiry" | **Dates block** (with `journey=`), overview demoted to secondary, WhatsApp + PDF + advisor WhatsApp |
| Contact | 2 (WhatsApp + form) | unchanged (destination of the funnel) |
| Payments | public conversion CTA | **client-only** (out of nav, noindex) |

Hierarchy now: **Primary** dates block · **Secondary** WhatsApp · **Tertiary** PDF download ·
**Clients-only** payment (discreet footer).

---

## 6. Sections currently hidden / empty (by design, marked)

| Section | State | Unblocks with |
|---|---|---|
| Accommodation (4 itineraries) | **Not rendered** (HTML-commented stub) | Hotels + photos (D…C above) |
| Financial-protection pillar | Rendered but **marked/empty** ("Details provided on enquiry") | Real protection scheme (E) |
| Footer company details | **Empty span, hidden** (`:empty`) | Registered name/number/address (E) |
| Verified reviews | **Gap** next to testimonials | Reviews account (F) |
| Price line | "Tailored pricing" | "From" prices (A) |
| Newsletter (footer) | **Hidden** | NEWSLETTER_ENDPOINT (F) |
| Instagram (footer) | **Hidden** | Instagram URL (G) |
| Pay button (payments) | **Disabled** + setup notice | Stripe link (F) |

---

## 7. Verification checklist

- `grep -rin "taste of peru" .` → no results ✓
- `payments.html` out of `NAV` and `noindex` ✓
- Four `journey-*.html` have category, duration, price block (3 conditions), what's
  included / not included, accommodation stub, Patricia block, dates CTA ✓
- Every itinerary CTA passes `journey=` to the form ✓
- Zero accreditation badges added ✓
- Zero invented hotels / inclusions / prices / reviews ✓
