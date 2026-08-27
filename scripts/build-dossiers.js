#!/usr/bin/env node
/* ============================================================================
   build-dossiers.js — Perú Crafted Experiences
   Generates a print-ready PDF itinerary ("dossier") for each journey page.

   Single-sourced: the day-by-day, places and inclusions are READ from the
   live journey-*.html files, so the PDFs never drift from the website.

   No npm dependencies. Uses the system Google Chrome / Chromium in headless
   "--print-to-pdf" mode. Set CHROME_BIN to override the browser path.

   Run via  scripts/build-dossiers.sh  (or  node scripts/build-dossiers.js).

   NOTE: prices and hotels are intentionally NOT in the PDF — they are
   TODO(owner) on the site. The dossier shows "Tailored pricing" with the same
   honest conditions as the pages. Nothing here is invented.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "assets", "dossiers");

const CONTACT = {
  brand: "Perú Crafted Experiences",
  tagline: "Bespoke cultural & gastronomic journeys to Peru, designed personally from the UK.",
  whatsapp: "+44 7341 565898",
  email: "hello@perucraftedexperiences.com", // TODO(owner): confirmar correo definitivo de la marca
};

const JOURNEYS = [
  { slug: "grand-peru",         file: "journey-grand-peru.html" },
  { slug: "unforgettable-peru", file: "journey-unforgettable-peru.html" },
  { slug: "majestic-peru",      file: "journey-majestic-peru.html" },
  { slug: "cusco-essentials",   file: "journey-cusco-essentials.html" },
];

/* ---------- tiny HTML helpers ---------- */
function decode(s) {
  return s.replace(/&amp;/g, "&").replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
          .replace(/&rsquo;/g, "\u2019").replace(/&nbsp;/g, " ").replace(/&#39;/g, "'")
          .replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function stripTags(s) { return decode(s.replace(/<[^>]+>/g, "")); }
function grab(re, html) { const m = re.exec(html); return m ? m[1] : ""; }
function grabLis(ulHtml) {
  return (ulHtml.match(/<li[^>]*>([\s\S]*?)<\/li>/g) || [])
    .map((li) => stripTags(li)).filter(Boolean);
}

/* ---------- extract structured content from a journey page ---------- */
function parseJourney(html) {
  const name = stripTags(grab(/<h1>([\s\S]*?)<\/h1>/, html));
  const route = stripTags(grab(/<h1>[\s\S]*?<\/h1>\s*<p>([\s\S]*?)<\/p>/, html));
  const category = stripTags(grab(/<span class="product-meta__cat">([\s\S]*?)<\/span>/, html)) || "Private Journey";
  const duration = stripTags(grab(/<span class="product-meta__dur">([\s\S]*?)<\/span>/, html));

  // places (chips)
  const placesBlock = grab(/<nav class="places"[^>]*>([\s\S]*?)<\/nav>/, html);
  const places = (placesBlock.match(/<a[^>]*>([\s\S]*?)<\/a>/g) || []).map(stripTags);

  // included = first <ul class="included"> (the exclusions use class "included included--out")
  const included = grabLis(grab(/<ul class="included">([\s\S]*?)<\/ul>/, html));
  const excluded = grabLis(grab(/<ul class="included included--out">([\s\S]*?)<\/ul>/, html));

  // day-by-day
  const itin = grab(/<ol class="itin">([\s\S]*?)<\/ol>/, html);
  const days = (itin.match(/<li[^>]*>([\s\S]*?)<\/li>/g) || []).map((li) => ({
    no: stripTags(grab(/<div class="itin__no">([\s\S]*?)<\/div>/, li)),
    place: stripTags(grab(/<h3 class="itin__place">([\s\S]*?)<\/h3>/, li)),
    desc: stripTags(grab(/<p class="itin__desc">([\s\S]*?)<\/p>/, li)),
  }));

  return { name, route, category, duration, places, included, excluded, days };
}

/* ---------- compose the print HTML ---------- */
function dossierHTML(j) {
  const daysRows = j.days.map((d) => `
      <tr>
        <td class="d-no">${esc(d.no)}</td>
        <td><div class="d-place">${esc(d.place)}</div><div class="d-desc">${esc(d.desc)}</div></td>
      </tr>`).join("");

  const incl = j.included.map((x) => `<li>${esc(x)}</li>`).join("");
  const excl = j.excluded.map((x) => `<li class="out">${esc(x)}</li>`).join("");
  const places = j.places.map(esc).join(" &nbsp;·&nbsp; ");

  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8">
<style>
  @page { size: A4; margin: 18mm 16mm 20mm; }
  * { box-sizing: border-box; }
  body { font-family: "Helvetica Neue", Arial, sans-serif; color: #2c2a26; font-size: 10.5pt; line-height: 1.5; margin: 0; }
  h1, h2, h3, .serif { font-family: Georgia, "Times New Roman", serif; }
  .gold { color: #b07d2b; }
  .rule { height: 2px; background: #d4a637; width: 46px; border: 0; margin: 6px 0 0; }
  header.doc { border-bottom: 1px solid #e2dccd; padding-bottom: 14px; margin-bottom: 18px; }
  .brand { font-family: Georgia, serif; font-size: 15pt; letter-spacing: .01em; }
  .brand small { display:block; font-family:"Helvetica Neue",Arial,sans-serif; font-size:7.5pt; letter-spacing:.24em; text-transform:uppercase; color:#8a7f6c; margin-top:2px; }
  .cat { font-size: 7.5pt; letter-spacing: .22em; text-transform: uppercase; color: #b8552f; font-weight: 700; }
  h1.title { font-size: 24pt; margin: 4px 0 2px; font-weight: 500; }
  .route { color: #6b5b4a; font-size: 10pt; }
  .meta { margin: 14px 0 6px; padding: 10px 14px; background: #f7f3ea; border: 1px solid #e2dccd; border-radius: 4px; }
  .meta .price { font-family: Georgia, serif; font-size: 13pt; color: #253f31; }
  .meta .cond { color: #6b5b4a; font-size: 8.5pt; margin-top: 4px; }
  h2.sec { font-size: 13pt; margin: 20px 0 8px; color: #253f31; }
  .places { font-size: 10pt; color: #2c2a26; }
  table { width: 100%; border-collapse: collapse; }
  td { vertical-align: top; padding: 7px 0; border-bottom: 1px solid #ece7db; }
  tr { page-break-inside: avoid; }
  .d-no { width: 78px; font-size: 7.5pt; letter-spacing: .12em; text-transform: uppercase; color: #b07d2b; font-weight: 700; padding-right: 10px; }
  .d-place { font-family: Georgia, serif; font-size: 11.5pt; }
  .d-desc { color: #5a5347; font-size: 9.5pt; margin-top: 2px; }
  .cols { display: flex; gap: 26px; }
  .cols > div { flex: 1; }
  ul.inc { list-style: none; padding: 0; margin: 0; }
  ul.inc li { position: relative; padding-left: 15px; margin-bottom: 5px; font-size: 9.5pt; color: #3a352d; }
  ul.inc li::before { content: ""; position: absolute; left: 0; top: 5px; width: 6px; height: 6px; transform: rotate(45deg); border: 1px solid #d4a637; background: rgba(212,166,55,.18); }
  ul.inc li.out::before { transform: none; border: 0; background: #b3a892; width: 8px; height: 1px; top: 8px; }
  footer.doc { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2dccd; font-size: 9pt; color: #5a5347; }
  footer.doc b { color: #253f31; }
</style></head>
<body>
  <header class="doc">
    <div class="brand">Perú <small>Crafted Experiences</small></div>
  </header>

  <div class="cat">${esc(j.category)}</div>
  <h1 class="title">${esc(j.name)}</h1>
  <div class="route">${esc(j.route)}</div>

  <div class="meta">
    <span class="price">${esc(j.duration)} · Tailored pricing</span>
    <div class="cond">Prices are per person, based on two travellers sharing a room. International flights are not included — we quote them separately according to your dates and preferences.</div>
  </div>

  ${places ? `<h2 class="sec">Places you'll visit</h2><div class="places">${places}</div>` : ""}

  <h2 class="sec">Your itinerary, day by day</h2>
  <table>${daysRows}</table>

  <div class="cols">
    <div>
      <h2 class="sec">What's included</h2>
      <ul class="inc">${incl}</ul>
    </div>
    <div>
      <h2 class="sec">Not included</h2>
      <ul class="inc">${excl}</ul>
    </div>
  </div>

  <footer class="doc">
    <b>${esc(CONTACT.brand)}</b> — ${esc(CONTACT.tagline)}<br>
    Speak with Patricia · WhatsApp ${esc(CONTACT.whatsapp)} · ${esc(CONTACT.email)}<br>
    Every journey is designed personally and reshaped, in full, around your budget, your style and your palate.
  </footer>
</body></html>`;
}

/* ---------- locate Chrome ---------- */
function findChrome() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const cands = {
    win32: [
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
      "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
      path.join(os.homedir(), "AppData/Local/Google/Chrome/Application/chrome.exe"),
    ],
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ],
    linux: [
      "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable",
      "/usr/bin/chromium-browser", "/usr/bin/chromium",
    ],
  }[process.platform] || [];
  for (const c of cands) { if (fs.existsSync(c)) return c; }
  return null;
}

/* ---------- main ---------- */
function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const chrome = findChrome();
  if (!chrome) {
    console.error("ERROR: could not find Google Chrome / Chromium. Set CHROME_BIN to the browser path and re-run.");
    process.exit(1);
  }
  console.log("Using browser:", chrome);

  for (const jr of JOURNEYS) {
    const srcPath = path.join(ROOT, jr.file);
    if (!fs.existsSync(srcPath)) { console.warn("skip (missing):", jr.file); continue; }
    const parsed = parseJourney(fs.readFileSync(srcPath, "utf8"));
    const tmp = path.join(OUT_DIR, ".tmp-" + jr.slug + ".html");
    const pdf = path.join(OUT_DIR, jr.slug + ".pdf");
    fs.writeFileSync(tmp, dossierHTML(parsed), "utf8");
    const fileUrl = "file:///" + tmp.replace(/\\/g, "/");
    try {
      execFileSync(chrome, [
        "--headless=new", "--disable-gpu", "--no-sandbox",
        "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=3000",
        "--print-to-pdf=" + pdf, fileUrl,
      ], { stdio: "ignore" });
      console.log("✓", jr.slug + ".pdf", "(" + parsed.days.length + " day rows)");
    } catch (e) {
      console.error("✗ failed:", jr.slug, e.message);
    } finally {
      try { fs.unlinkSync(tmp); } catch (e) {}
    }
  }
  console.log("Done → assets/dossiers/");
}

if (require.main === module) main();
module.exports = { parseJourney, dossierHTML };
