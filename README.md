# Perú Crafted Experiences — website

Multi-page site in plain **HTML, CSS and JavaScript** (no build step). Open
`index.html` locally, or publish to **GitHub Pages** (auto-deploy on every push).

## Pages
`index.html` (Home) · `story.html` · `experiences.html` · `journeys.html` ·
`contact.html` · `privacy.html` · `terms.html`

## Run locally
Just open `index.html` in a browser. (Everything — images, styles, scripts — is
included, so it works offline.)

## Publish to GitHub Pages (auto-deploy)
1. Create an **empty** repo on GitHub (e.g. `visualgroup-pe/perucraft`) — no
   README/licence.
2. From this folder:
   ```bash
   git init
   git add -A
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/visualgroup-pe/perucraft.git
   git push -u origin main
   ```
   *(If you started from the provided `perucraft-site.bundle`, clone it instead
   of `git init` and just set the remote + push.)*
3. On GitHub: **Settings → Pages → Source: “GitHub Actions”**.
4. Every push now publishes automatically. The live URL appears under
   **Settings → Pages** (e.g. `https://visualgroup-pe.github.io/perucraft/`).

## Edit
- **Text & images**: edit the `.html` files (photos live in `assets/img/`).
- **Colours, type, styles**: `styles.css` (brand tokens are at the top).
- **Contact details** (WhatsApp, email, greeting): the `CONTACT` object at the
  top of `main.js`.

## Custom domain (optional)
Add your domain under **Settings → Pages → Custom domain**, then create a
`CNAME` file (GitHub can do this for you) — SSL is automatic.
