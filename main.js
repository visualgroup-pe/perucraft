/* ==================================================================
   Perú Crafted Experiences — shared behaviour
   ================================================================== */
(function () {
  "use strict";

  /* ---------- brand data ---------- */
  var WA_DIGITS = "447341565898";
  var WA_MSG = encodeURIComponent(
    "Hello Patricia, I came across Perú Crafted Experiences and I'd love to talk about a bespoke journey."
  );
  var CONTACT = {
    waNumber: "+44 7341 565898",
    waHref: "https://wa.me/" + WA_DIGITS + "?text=" + WA_MSG,
    // TODO(owner): confirmar el correo definitivo de la marca (placeholder por ahora; NO usar el correo de la agencia).
    email: "hello@perucraftedexperiences.com",
    // TODO(owner): pegar la URL real de Instagram. Con el valor vacío, el icono y el enlace se ocultan en el footer.
    instagram: "",
    greeting:
      "Hello, I'm Patricia. I'd be delighted to help you plan your journey — do say hello whenever suits you.",
    portrait:
      "assets/img/1523761415282-2106778cfb5a.jpeg",
  };

  /* ---------- payments ----------
     Card payments are handled by Stripe's own secure, hosted checkout.
     No card details ever touch this website.
     1. In your Stripe Dashboard, create a Payment Link
        (Products → Payment Links). For bespoke amounts, set the price to
        "Customer chooses what to pay".
     2. Paste that link below (it looks like https://buy.stripe.com/...).
     3. In the Payment Link's settings, set the confirmation/redirect page
        to  payment-success.html  so clients land on the thank-you page. */
  var PAYMENTS = {
    // TODO(owner): pegar aquí el Stripe Payment Link de PRODUCCIÓN (https://buy.stripe.com/...).
    // Con el valor vacío, fillPay() desactiva el botón y muestra el aviso de configuración. NO usar enlaces test_.
    stripeLink: "",
  };

  // TODO(owner): endpoint para recibir los leads del formulario por email
  // (Formspree / Netlify Forms / Basin). Con el valor vacío se usa WhatsApp como fallback.
  var FORM_ENDPOINT = "";

  // TODO(owner): endpoint del newsletter (Mailchimp / Buttondown / Formspree).
  // Con el valor vacío, el bloque del newsletter NO se muestra (nada de altas falsas).
  var NEWSLETTER_ENDPOINT = "";

  var NAV = [
    { label: "Home", href: "index.html" },
    { label: "The Story", href: "story.html" },
    { label: "Experiences", href: "experiences.html", children: [
      { label: "Culture", href: "experiences.html#culture" },
      { label: "Gastronomy", href: "experiences.html#gastronomy" },
      { label: "Crafted Travel", href: "experiences.html#crafted" },
      { label: "Day Experiences from Lima", href: "experiences.html#day-experiences" },
    ] },
    { label: "Journeys", href: "journeys.html", children: [
      { label: "The Crafted Collection", href: "journeys.html#collection" },
      { label: "Grand Peru · 20 Days", href: "journey-grand-peru.html" },
      { label: "Unforgettable Peru · 13 Days", href: "journey-unforgettable-peru.html" },
      { label: "Majestic Peru · 10 Days", href: "journey-majestic-peru.html" },
      { label: "Cusco Essentials · 3 Days", href: "journey-cusco-essentials.html" },
    ] },
    { label: "Contact", href: "contact.html" },
    // NOTE: Payments intentionally NOT in the primary nav. It is a service page
    // for clients who already have an agreed itinerary — reachable only by direct
    // URL, the booking-confirmation email, and a discreet "Already a client" link
    // in the footer bottom bar (see buildFooter). Keep it out of NAV.
  ];

  /* ---------- chakana svg ---------- */
  var _cid = 0;
  var CHAK_RECTS = [
    [42, 42, 36, 36], [42, 22, 36, 20], [51, 4, 18, 18],
    [42, 78, 36, 20], [51, 98, 18, 18], [22, 42, 20, 36],
    [4, 51, 18, 18], [78, 42, 20, 36], [98, 51, 18, 18],
  ];
  function chakana(grad) {
    _cid++;
    var mid = "cm" + _cid, gid = "cg" + _cid;
    var rects = CHAK_RECTS.map(function (r) {
      return "<rect x='" + r[0] + "' y='" + r[1] + "' width='" + r[2] +
        "' height='" + r[3] + "' rx='1.5' fill='white'/>";
    }).join("");
    var defs = grad
      ? "<defs><linearGradient id='" + gid + "' x1='0' y1='0' x2='1' y2='1'>" +
        "<stop offset='0%' stop-color='#d4a656'/><stop offset='100%' stop-color='#c46a4a'/>" +
        "</linearGradient></defs>"
      : "";
    var fill = grad ? "url(#" + gid + ")" : "currentColor";
    return "<svg viewBox='0 0 120 120' aria-hidden='true'>" + defs +
      "<mask id='" + mid + "'><rect width='120' height='120' fill='black'/>" +
      rects + "<circle cx='60' cy='60' r='12.5' fill='black'/></mask>" +
      "<rect width='120' height='120' fill='" + fill + "' mask='url(#" + mid + ")'/></svg>";
  }
  // stroked chakana outline (for line illustrations / preloader)
  var CHAK_OUTLINE =
    "M51 4 H69 V22 H78 V42 H98 V51 H116 V69 H98 V78 H78 V98 H69 V116 H51 V98 H42 V78 H22 V69 H4 V51 H22 V42 H42 V22 H51 Z";

  /* ---------- small icons ---------- */
  var IC = {
    arrow: "<svg class='arrow' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><path d='M5 12h14M13 6l6 6-6 6'/></svg>",
    caret: "<svg class='nav__caret' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><path d='M6 9l6 6 6-6'/></svg>",
    menu: "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><path d='M3 6h18M3 12h18M3 18h18'/></svg>",
    close: "<svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><path d='M6 6l12 12M18 6L6 18'/></svg>",
    wa: "<svg width='20' height='20' viewBox='0 0 32 32' fill='currentColor'><path d='M16.04 4c-6.63 0-12 5.37-12 12 0 2.11.55 4.17 1.6 5.99L4 28l6.18-1.62A11.9 11.9 0 0 0 16.04 28c6.63 0 12-5.37 12-12s-5.37-12-12-12Zm0 21.82c-1.84 0-3.65-.5-5.22-1.43l-.37-.22-3.67.96.98-3.58-.24-.37a9.8 9.8 0 0 1-1.5-5.2c0-5.42 4.41-9.82 9.83-9.82 2.63 0 5.09 1.02 6.95 2.88a9.75 9.75 0 0 1 2.88 6.95c0 5.42-4.41 9.83-9.82 9.83Zm5.39-7.35c-.29-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.29-.77.96-.94 1.16-.17.2-.35.22-.64.07-.29-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.29-.02-.45.13-.6.13-.13.29-.35.44-.52.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.29-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.48.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.56-.35Z'/></svg>",
    insta: "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5'><rect x='2' y='2' width='20' height='20' rx='5.5'/><circle cx='12' cy='12' r='4.2'/><circle cx='17.4' cy='6.6' r='1.1' fill='currentColor' stroke='none'/></svg>",
  };

  /* ---------- current page ---------- */
  var path = location.pathname.split("/").pop() || "index.html";
  if (path === "") path = "index.html";

  /* ---------- reduced motion ---------- */
  var REDUCE = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* ---------- brand lockup ---------- */
  function brandHTML(cls) {
    return (
      '<a class="brand ' + (cls || "") + '" href="index.html" aria-label="Perú Crafted Experiences — home">' +
      '<span class="chakana chakana--grad">' + chakana(true) + "</span>" +
      '<span class="word">Perú</span>' +
      '<span class="sub">Crafted Experiences</span>' +
      "</a>"
    );
  }

  /* ---------- header ---------- */
  function subAnchor(c) {
    var ext = c.external ? ' target="_blank" rel="noopener"' : "";
    return '<a href="' + c.href + '"' + ext + ">" + c.label + "</a>";
  }

  function buildHeader() {
    var navLinks = NAV.map(function (n) {
      var active = n.href === path ? " active" : "";
      if (n.children && n.children.length) {
        return '<div class="nav__item has-sub">' +
          '<a class="' + active.trim() + '" href="' + n.href + '" aria-haspopup="true">' + n.label + IC.caret + "</a>" +
          '<div class="subnav"><div class="subnav__inner">' +
            n.children.map(subAnchor).join("") +
          "</div></div>" +
        "</div>";
      }
      return '<a class="' + active.trim() + '" href="' + n.href + '">' + n.label + "</a>";
    }).join("");

    var mobileLinks = NAV.map(function (n) {
      if (n.children && n.children.length) {
        return '<div class="m-group">' +
          '<div class="m-row">' +
            '<a href="' + n.href + '">' + n.label + "</a>" +
            '<button class="m-toggle" type="button" aria-label="Show ' + n.label + ' options" aria-expanded="false">' + IC.caret + "</button>" +
          "</div>" +
          '<div class="m-sub"><div class="m-sub__list">' +
            n.children.map(subAnchor).join("") +
          "</div></div>" +
        "</div>";
      }
      return '<div class="m-group"><div class="m-row"><a href="' + n.href + '">' + n.label + "</a></div></div>";
    }).join("");

    var header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML =
      '<div class="header-inner">' +
      brandHTML("on-hero") +
      '<nav class="nav on-hero" aria-label="Primary">' + navLinks + "</nav>" +
      '<div class="header-cta"><a class="btn btn--sm btn--ivory js-enquire" href="' + CONTACT.waHref + '" target="_blank" rel="noopener">Enquire Now</a></div>' +
      '<a class="header-wa on-hero js-wa" href="' + CONTACT.waHref + '" target="_blank" rel="noopener" aria-label="Enquire on WhatsApp">' + IC.wa + "</a>" +
      '<button class="menu-btn on-hero" aria-label="Open menu" aria-expanded="false">' + IC.menu + "</button>" +
      "</div>" +
      '<div class="mobile-menu">' +
      mobileLinks +
      '<a class="btn" href="' + CONTACT.waHref + '" target="_blank" rel="noopener">Enquire Now</a>' +
      "</div>";
    document.body.insertBefore(header, document.body.firstChild);

    var menuBtn = header.querySelector(".menu-btn");
    var menu = header.querySelector(".mobile-menu");
    var savedScroll = 0;
    function openMenu() {
      savedScroll = window.scrollY || window.pageYOffset || 0;
      menu.classList.add("open");
      header.classList.add("menu-open");
      menuBtn.setAttribute("aria-expanded", "true");
      menuBtn.setAttribute("aria-label", "Close menu");
      menuBtn.innerHTML = IC.close;
      // reliable scroll lock (iOS Safari): fix the body and remember the position
      document.body.style.position = "fixed";
      document.body.style.top = -savedScroll + "px";
      document.body.style.width = "100%";
      var first = menu.querySelector("a, button");
      if (first) first.focus();
    }
    function closeMenu() {
      var wasOpen = menu.classList.contains("open");
      menu.classList.remove("open");
      header.classList.remove("menu-open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open menu");
      menuBtn.innerHTML = IC.menu;
      if (wasOpen) {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, savedScroll);
        if (menuBtn.offsetParent !== null) menuBtn.focus();
      }
    }
    menuBtn.addEventListener("click", function () {
      if (menu.classList.contains("open")) closeMenu(); else openMenu();
    });
    // focus trap: keep Tab within the open menu
    menu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = menu.querySelectorAll("a, button");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // expandable submenus (mobile)
    header.querySelectorAll(".m-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var group = btn.parentNode.parentNode;
        var sub = group.querySelector(".m-sub");
        var open = sub.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });

    // close the full-screen menu when crossing into desktop, or on Escape
    var mq = window.matchMedia("(min-width: 1024px)");
    var onMQ = function (e) { if (e.matches) closeMenu(); };
    if (mq.addEventListener) mq.addEventListener("change", onMQ); else mq.addListener(onMQ);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) closeMenu();
    });

    // desktop dropdowns: keep aria-expanded in sync with hover/focus
    header.querySelectorAll(".nav__item.has-sub").forEach(function (item) {
      var link = item.querySelector("a");
      link.setAttribute("aria-expanded", "false");
      function setExp(v) { if (!item.classList.contains("sub-open")) link.setAttribute("aria-expanded", v ? "true" : "false"); }
      item.addEventListener("mouseenter", function () { setExp(true); });
      item.addEventListener("mouseleave", function () { setExp(false); });
      item.addEventListener("focusin", function () { setExp(true); });
      item.addEventListener("focusout", function () { setExp(false); });
    });

    // touch devices without hover (e.g. iPad Pro landscape): first tap opens the
    // submenu, second tap follows the link; tap outside closes it.
    if (window.matchMedia && window.matchMedia("(hover: none)").matches) {
      header.querySelectorAll(".nav__item.has-sub").forEach(function (item) {
        var link = item.querySelector("a");
        link.addEventListener("click", function (e) {
          if (!item.classList.contains("sub-open")) {
            e.preventDefault();
            header.querySelectorAll(".nav__item.sub-open").forEach(function (o) {
              if (o !== item) { o.classList.remove("sub-open"); o.querySelector("a").setAttribute("aria-expanded", "false"); }
            });
            item.classList.add("sub-open");
            link.setAttribute("aria-expanded", "true");
          }
        });
      });
      document.addEventListener("click", function (e) {
        if (!e.target.closest || !e.target.closest(".nav__item")) {
          header.querySelectorAll(".nav__item.sub-open").forEach(function (o) {
            o.classList.remove("sub-open"); o.querySelector("a").setAttribute("aria-expanded", "false");
          });
        }
      });
    }

    function onScroll() {
      if (window.scrollY > 40) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- footer ---------- */
  function buildFooter() {
    var f = document.querySelector("footer.footer");
    if (!f) { f = document.createElement("footer"); f.className = "footer"; document.body.appendChild(f); }
    var ig = CONTACT.instagram;
    var hasNews = !!NEWSLETTER_ENDPOINT;
    f.innerHTML =
      '<div class="greca on-dark" style="opacity:.4"></div>' +
      '<div class="container footer__grid' + (hasNews ? '' : ' footer__grid--no-news') + '">' +
        '<div class="stack gap-6" style="align-items:flex-start">' +
          brandHTML("") +
          '<p style="max-width:20rem;color:rgba(241,236,225,.7);font-size:.95rem">Bespoke cultural and gastronomic journeys across Peru — designed personally, by hand, from the UK.</p>' +
          (ig ? '<a class="footer__social" href="' + ig + '" target="_blank" rel="noopener" aria-label="Instagram">' + IC.insta + "</a>" : "") +
        "</div>" +
        '<div><h4>Explore</h4><ul>' +
          '<li><a href="story.html">The Story</a></li>' +
          '<li><a href="experiences.html">Experiences</a></li>' +
          '<li><a href="journeys.html">Journeys</a></li>' +
          '<li><a href="story.html">Meet Patricia</a></li>' +
          '<li><a href="contact.html">Contact</a></li></ul></div>' +
        '<div><h4>Connect</h4><ul>' +
          '<li><a href="' + CONTACT.waHref + '" target="_blank" rel="noopener">WhatsApp</a></li>' +
          (ig ? '<li><a href="' + ig + '" target="_blank" rel="noopener">Instagram</a></li>' : "") +
          (hasNews ? '<li><a href="contact.html">Newsletter</a></li>' : "") +
          "</ul></div>" +
        (hasNews ?
          '<div><h4>Newsletter</h4>' +
            '<p style="color:rgba(241,236,225,.7);font-size:.9rem;margin-top:1rem">Occasional letters from Peru — stories, tables and quiet corners worth the journey.</p>' +
            '<form class="footer__news js-news" style="margin-top:1rem"><input type="email" name="email" required placeholder="Your email" aria-label="Email"><button type="submit">Join</button></form>' +
            '<p style="font-size:.72rem;color:rgba(241,236,225,.5);margin-top:.5rem">We only use your email for the newsletter — see our <a href="privacy.html" style="color:var(--gold-soft);text-decoration:underline">privacy policy</a>.</p>' +
          "</div>"
        : "") +
      "</div>" +
      '<div class="container"><div class="footer__bottom">' +
        "<p>© " + new Date().getFullYear() + " Perú Crafted Experiences. All rights reserved.</p>" +
        '<ul class="footer__legal"><li><a href="privacy.html">Privacy Policy</a></li><li><a href="terms.html">Terms &amp; Conditions</a></li><li><a href="payments.html">Already a client? Make a payment</a></li></ul>' +
      "</div></div>";

    var newsForm = f.querySelector(".js-news");
    if (newsForm) {
      newsForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = newsForm.querySelector("button");
        var lbl = btn ? btn.textContent : "";
        if (btn) { btn.disabled = true; btn.textContent = "…"; }
        fetch(NEWSLETTER_ENDPOINT, { method: "POST", headers: { "Accept": "application/json" }, body: new FormData(newsForm) })
          .then(function (r) {
            if (!r.ok) throw 0;
            newsForm.innerHTML = '<p style="color:var(--ivory-50);font-size:.9rem;padding:.6rem 0">Thank you — you’re on the list.</p>';
          })
          .catch(function () {
            if (btn) { btn.disabled = false; btn.textContent = lbl; }
            var err = newsForm.querySelector(".js-news-err");
            if (!err) { err = document.createElement("p"); err.className = "js-news-err"; err.style.cssText = "color:var(--gold-soft);font-size:.78rem;margin-top:.5rem"; newsForm.appendChild(err); }
            err.innerHTML = 'Sorry — that didn’t go through. Email <a href="mailto:' + CONTACT.email + '" style="color:var(--gold-soft);text-decoration:underline">' + CONTACT.email + '</a>.';
          });
      });
    }
  }

  /* ---------- concierge ---------- */
  function buildConcierge() {
    if (sessionStorage.getItem("pce_concierge_off")) return; // dismissed this session
    var c = document.createElement("div");
    c.className = "concierge";
    c.innerHTML =
      '<div class="concierge__card" role="dialog" aria-label="Message Patricia">' +
        '<div class="concierge__head">' +
          '<span class="concierge__avatar"><img src="' + CONTACT.portrait + '" alt="Patricia" width="44" height="44"><span class="concierge__dot"></span></span>' +
          '<span class="concierge__name"><span class="n">Patricia</span><span class="s">Usually replies within a few hours</span></span>' +
          '<button class="concierge__close" aria-label="Close">' + IC.close + "</button>" +
        "</div>" +
        '<div class="concierge__body">' +
          '<p class="concierge__msg">' + CONTACT.greeting + "</p>" +
          '<a class="concierge__wa" href="' + CONTACT.waHref + '" target="_blank" rel="noopener">' + IC.wa + " Chat on WhatsApp</a>" +
          '<p class="concierge__num">' + CONTACT.waNumber + "</p>" +
        "</div>" +
      "</div>" +
      '<div class="concierge__triggerwrap">' +
        '<button class="concierge__teaser" type="button">Hello — need a hand?</button>' +
        '<button class="concierge__trigger pulse-ring" aria-label="Message Patricia" aria-expanded="false">' +
          '<span class="concierge__avatar"><img src="' + CONTACT.portrait + '" alt="" width="44" height="44"></span>' +
          '<span class="t"><span class="n">Patricia</span><span class="o">Online</span></span>' +
        "</button>" +
        '<button class="concierge__dismiss" type="button" aria-label="Hide chat"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      "</div>";
    document.body.appendChild(c);

    var trigger = c.querySelector(".concierge__trigger");
    var closeBtn = c.querySelector(".concierge__close");
    var teaser = c.querySelector(".concierge__teaser");
    function setOpen(open) {
      c.classList.toggle("open", open);
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      trigger.classList.toggle("pulse-ring", !open);
      if (open) teaser.classList.remove("show");
    }
    trigger.addEventListener("click", function () { setOpen(!c.classList.contains("open")); });
    closeBtn.addEventListener("click", function () { setOpen(false); });
    teaser.addEventListener("click", function () { setOpen(true); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
    setTimeout(function () { if (!c.classList.contains("open")) teaser.classList.add("show"); }, 2600);

    var dismiss = c.querySelector(".concierge__dismiss");
    dismiss.addEventListener("click", function () {
      if (c.parentNode) c.parentNode.removeChild(c);
      try { sessionStorage.setItem("pce_concierge_off", "1"); } catch (e) {}
    });

    // fade the widget away once the footer is on screen (stops it covering the CTA / legal)
    var footer = document.querySelector("footer.footer");
    if (footer && "IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { c.classList.toggle("at-footer", en.isIntersecting); });
      }, { threshold: 0.05 }).observe(footer);
    }
  }

  /* ---------- scroll progress ---------- */
  function buildProgress() {
    var bar = document.createElement("div");
    bar.className = "progress";
    document.body.appendChild(bar);
    function upd() {
      var h = document.documentElement;
      var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
    }
    upd();
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
  }

  /* ---------- fill js-chakana placeholders ---------- */
  function fillChakanas() {
    document.querySelectorAll(".js-chakana").forEach(function (el) {
      if (el.dataset.done) return;
      el.innerHTML = chakana(el.hasAttribute("data-grad"));
      el.dataset.done = "1";
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (REDUCE || !("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("in"); });
      return;
    }
    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { fired = true; en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    els.forEach(function (e) { io.observe(e); });
    // safety net: if the observer never fired in 3s (broken/blocked), reveal all
    setTimeout(function () {
      if (!fired) els.forEach(function (e) { e.classList.add("in"); });
    }, 3000);
  }

  /* ---------- parallax ---------- */
  function initParallax() {
    if (REDUCE) return;
    var items = [].slice.call(document.querySelectorAll("[data-parallax]"));
    if (!items.length) return;
    var metrics = [];
    // measure once (and on resize) with the parallax transform cleared, so we
    // cache each element's natural document-centre — no getBoundingClientRect per frame.
    function measure() {
      var sy = window.pageYOffset;
      metrics = items.map(function (el) {
        var prev = el.style.transform;
        el.style.transform = "none";
        var r = el.getBoundingClientRect();
        el.style.transform = prev;
        return { el: el, mid: r.top + sy + r.height / 2, speed: parseFloat(el.getAttribute("data-parallax")) || 0.15 };
      });
    }
    var ticking = false;
    function update() {
      var vh = window.innerHeight, sy = window.pageYOffset;
      metrics.forEach(function (m) {
        var offset = (m.mid - sy - vh / 2) * -m.speed;
        m.el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    measure();
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", function () { measure(); update(); });
    update();
  }

  /* ---------- marquee (duplicate track) ---------- */
  function initMarquee() {
    document.querySelectorAll(".marquee__track").forEach(function (track) {
      if (!track.dataset.dup) {
        track.innerHTML += track.innerHTML;
        track.dataset.dup = "1";
      }
      // pause the endless animation whenever the marquee is off-screen
      var mq = track.closest ? track.closest(".marquee") : null;
      if (mq && "IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (en) { track.style.animationPlayState = en.isIntersecting ? "running" : "paused"; });
        }, { threshold: 0 }).observe(mq);
      }
    });
  }

  /* ---------- carousels ---------- */
  function initCarousels() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll(".carousel").forEach(function (car) {
      var track = car.querySelector(".carousel__track");
      var slides = [].slice.call(car.querySelectorAll(".carousel__slide"));
      if (!track || slides.length < 2) return;

      var dotsWrap = car.querySelector(".carousel__dots");
      var countEl = car.querySelector(".carousel__count");
      var delay = reduce ? 0 : (parseInt(car.getAttribute("data-autoplay"), 10) || 0);
      var i = 0, timer = null;

      if (dotsWrap) {
        dotsWrap.innerHTML = slides.map(function (_, k) {
          return '<button type="button" aria-label="Slide ' + (k + 1) + '"></button>';
        }).join("");
      }
      var dots = dotsWrap ? [].slice.call(dotsWrap.querySelectorAll("button")) : [];

      // eager-load the first two slides and preload the next as we advance (no grey gaps)
      function eager(el) { var im = el && el.querySelector("img[loading='lazy']"); if (im) im.removeAttribute("loading"); }
      eager(slides[0]); eager(slides[1]);
      function preload(n) { eager(slides[(n + slides.length) % slides.length]); }

      function render() {
        track.style.transform = "translateX(" + (-i * 100) + "%)";
        dots.forEach(function (d, k) { d.classList.toggle("active", k === i); });
        if (countEl) countEl.textContent = (i + 1) + " / " + slides.length;
      }
      function go(n) { i = (n + slides.length) % slides.length; preload(i + 1); render(); }
      function restart() { if (!delay) return; clearInterval(timer); timer = setInterval(function () { go(i + 1); }, delay); }
      function stop() { clearInterval(timer); }

      var prev = car.querySelector(".carousel__nav--prev");
      var next = car.querySelector(".carousel__nav--next");
      if (prev) prev.addEventListener("click", function () { go(i - 1); restart(); });
      if (next) next.addEventListener("click", function () { go(i + 1); restart(); });
      dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); restart(); }); });

      // touch swipe (horizontal only — a vertical scroll must not change slide)
      var x0 = null, y0 = null;
      car.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; stop(); }, { passive: true });
      car.addEventListener("touchend", function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? i + 1 : i - 1);
        x0 = null; y0 = null; restart();
      });

      // pause on hover — only where hover truly exists (iOS may never fire mouseleave)
      if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
        car.addEventListener("mouseenter", stop);
        car.addEventListener("mouseleave", restart);
      }

      // pause when off-screen
      if (delay && "IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (ents) {
          ents.forEach(function (en) { if (en.isIntersecting) restart(); else stop(); });
        }, { threshold: 0.25 });
        io.observe(car);
      } else {
        restart();
      }

      render();
    });
  }

  /* ---------- testimonials ---------- */
  function initQuotes() {
    var wrap = document.querySelector(".quotes");
    if (!wrap) return;
    var quotes = [].slice.call(wrap.querySelectorAll(".quote"));
    var dotsWrap = wrap.querySelector(".dots");
    if (!dotsWrap || !quotes.length) return;
    var i = 0, timer;
    dotsWrap.innerHTML = quotes.map(function (_, k) {
      return '<button aria-label="Testimonial ' + (k + 1) + '"></button>';
    }).join("");
    var dots = [].slice.call(dotsWrap.querySelectorAll("button"));
    function show(n) {
      i = (n + quotes.length) % quotes.length;
      quotes.forEach(function (q, k) { q.classList.toggle("active", k === i); });
      dots.forEach(function (d, k) { d.classList.toggle("active", k === i); });
    }
    dots.forEach(function (d, k) { d.addEventListener("click", function () { show(k); restart(); }); });
    function restart() { clearInterval(timer); timer = setInterval(function () { show(i + 1); }, 7000); }
    show(0); restart();
    wrap.addEventListener("mouseenter", function () { clearInterval(timer); });
    wrap.addEventListener("mouseleave", restart);
  }

  /* ---------- enquiry form → WhatsApp ---------- */
  function initEnquiryForm() {
    var form = document.querySelector(".js-enquiry-form");
    if (!form) return;

    function waUrl(d) {
      var lines = [
        "Hello Patricia, I'd love to plan a bespoke Peru journey.",
        "",
        "Name: " + (d.get("name") || ""),
        "Email: " + (d.get("email") || ""),
        "When: " + (d.get("when") || "flexible"),
        "Travellers: " + (d.get("party") || ""),
        "Style: " + (d.get("style") || ""),
        "",
        (d.get("message") || ""),
      ];
      return "https://wa.me/" + WA_DIGITS + "?text=" + encodeURIComponent(lines.join("\n"));
    }
    function feedback(html) {
      var box = form.querySelector(".js-form-msg");
      if (!box) {
        box = document.createElement("div");
        box.className = "js-form-msg";
        box.style.marginTop = "1rem";
        form.appendChild(box);
      }
      box.innerHTML = html;
    }
    var LINK = 'style="color:var(--terracotta);text-decoration:underline"';

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form); // includes the required consent checkbox
      var wa = waUrl(d);

      // No endpoint configured yet → keep the WhatsApp behaviour as a fallback.
      if (!FORM_ENDPOINT) {
        window.open(wa, "_blank", "noopener");
        feedback('<p style="font-size:.85rem;color:var(--charcoal-soft)">Opening WhatsApp… if nothing happens, <a ' + LINK + ' href="' + wa + '" target="_blank" rel="noopener">tap here to send your enquiry</a>.</p>');
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      var label = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.innerHTML = "Sending…"; }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: d,
      }).then(function (r) {
        if (!r.ok) throw new Error("bad status");
        form.reset();
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
        feedback('<p style="font-size:.9rem;color:var(--forest);font-weight:500">Thank you — your enquiry is on its way. I&rsquo;ll be in touch personally.</p><p style="font-size:.82rem;color:var(--charcoal-soft);margin-top:.4rem">Prefer to chat now? <a ' + LINK + ' href="' + wa + '" target="_blank" rel="noopener">Message me on WhatsApp</a>.</p>');
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
        feedback('<p style="font-size:.85rem;color:var(--terracotta-deep)">Something went wrong sending your enquiry. Please <a ' + LINK + ' href="' + wa + '" target="_blank" rel="noopener">message me on WhatsApp</a> or email <a ' + LINK + ' href="mailto:' + CONTACT.email + '">' + CONTACT.email + '</a>.</p>');
      });
    });
  }

  /* ---------- dates CTA ("When would you like to travel?") ----------
     Primary conversion unit. Renders a lightweight two-field form (month of
     departure + number of travellers) into any <div class="js-dates-cta">.
     It does NOT submit anything — it forwards the visitor to contact.html with
     ?journey=…&month=…&travellers=… so the enquiry arrives already qualified
     (contact.html reads those params). No-JS visitors keep the plain fallback
     link that lives inside the placeholder. */
  var MONTHS = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];
  function buildDatesCTA() {
    var nodes = [].slice.call(document.querySelectorAll(".js-dates-cta"));
    if (!nodes.length) return;

    // next 18 months of departure options (from next month), plus "Not sure yet"
    var now = new Date();
    var monthOpts = '<option value="" selected>Month of departure</option>';
    for (var k = 1; k <= 18; k++) {
      var d = new Date(now.getFullYear(), now.getMonth() + k, 1);
      var val = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
      monthOpts += '<option value="' + val + '">' + MONTHS[d.getMonth()] + " " + d.getFullYear() + "</option>";
    }
    monthOpts += '<option value="unsure">Not sure yet</option>';

    var partyVals = ["1", "2", "3", "4", "5", "6", "7+"];
    var partyOpts = '<option value="" selected>Travellers</option>' +
      partyVals.map(function (v) { return '<option value="' + v + '">' + v + (v === "1" ? " traveller" : " travellers") + "</option>"; }).join("");

    nodes.forEach(function (node) {
      var journey = node.getAttribute("data-journey") || "";
      node.innerHTML =
        '<form class="datescta__form" novalidate>' +
          '<label class="datescta__field"><span class="u-sr-only">Month of departure</span>' +
            '<select name="month" aria-label="Month of departure">' + monthOpts + "</select></label>" +
          '<label class="datescta__field"><span class="u-sr-only">Number of travellers</span>' +
            '<select name="travellers" aria-label="Number of travellers">' + partyOpts + "</select></label>" +
          '<button class="btn btn--gold datescta__go" type="submit">Let&rsquo;s talk ' + IC.arrow + "</button>" +
        "</form>" +
        '<p class="datescta__note">No commitment. Patricia replies personally &mdash; usually the same day.</p>';

      var form = node.querySelector("form");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var qs = [];
        if (journey) qs.push("journey=" + encodeURIComponent(journey));
        var m = form.month.value, t = form.travellers.value;
        if (m) qs.push("month=" + encodeURIComponent(m));
        if (t) qs.push("travellers=" + encodeURIComponent(t));
        location.href = "contact.html" + (qs.length ? "?" + qs.join("&") : "");
      });
    });
  }

  /* ---------- preloader ---------- */
  function buildPreloader() {
    var seen = sessionStorage.getItem("pce_seen");
    var pre = document.createElement("div");
    pre.className = "preloader";
    pre.innerHTML =
      "<svg viewBox='0 0 120 120'>" +
      "<defs><linearGradient id='pcgrad' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0%' stop-color='#d4a656'/><stop offset='100%' stop-color='#c46a4a'/></linearGradient></defs>" +
      "<path class='stroke' d='" + CHAK_OUTLINE + "'/>" +
      "<circle class='hole' cx='60' cy='60' r='12.5'/></svg>";
    document.body.appendChild(pre);
    function hide() {
      pre.classList.add("done");
      setTimeout(function () { if (pre.parentNode) pre.remove(); }, 800);
    }
    // Repeat visits (same session) and reduced-motion: no intro, remove at once.
    if (seen || REDUCE) { pre.remove(); return; }
    sessionStorage.setItem("pce_seen", "1");
    var fired = false;
    var run = function () { if (!fired) { fired = true; setTimeout(hide, 1200); } };
    window.addEventListener("load", run);
    setTimeout(run, 3500); // safety net: reveal the site no matter what
  }

  /* ---------- page transitions ---------- */
  function buildTransitions() {
    var overlay = document.createElement("div");
    overlay.className = "page-trans";
    overlay.innerHTML = '<span class="chakana" style="color:var(--gold-soft)">' + chakana(false) + "</span>";
    document.body.appendChild(overlay);

    // enter animation
    var main = document.querySelector("main");
    if (main) main.classList.add("page-enter");

    function reset() { overlay.classList.remove("active"); }
    // Back button restores the page from bfcache with the DOM intact — clear any stuck overlay.
    window.addEventListener("pageshow", function (e) { if (e.persisted) reset(); });
    window.addEventListener("popstate", reset);

    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!href || a.target === "_blank" || a.hasAttribute("download")) return;
      if (/^(https?:|mailto:|tel:)/.test(href)) return;
      if (href.charAt(0) === "#") return;
      if (!/\.html(\?|#|$)/.test(href)) return; // only internal .html pages
      if (href.split("#")[0] === path) return;  // same page → no transition/overlay
      e.preventDefault();
      overlay.classList.add("active");
      var done = false;
      var go = function () { if (!done) { done = true; location.href = href; } };
      setTimeout(go, 620);
      setTimeout(reset, 4000); // safety: never leave the screen blocked
    });
  }

  /* ---------- init ---------- */
  function fillEnquire() {
    document.querySelectorAll(".js-enquire").forEach(function (a) {
      a.setAttribute("href", CONTACT.waHref);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
    document.querySelectorAll(".js-email").forEach(function (a) {
      a.setAttribute("href", "mailto:" + CONTACT.email + "?subject=Bespoke%20Peru%20Journey%20Enquiry");
    });
    document.querySelectorAll(".js-emailtext").forEach(function (el) { el.textContent = CONTACT.email; });
    document.querySelectorAll(".js-wa").forEach(function (a) {
      a.setAttribute("href", CONTACT.waHref);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
    document.querySelectorAll(".js-wanum").forEach(function (el) { el.textContent = CONTACT.waNumber; });
  }

  function fillPay() {
    var link = (typeof PAYMENTS !== "undefined" && PAYMENTS.stripeLink) ? PAYMENTS.stripeLink : "";
    document.querySelectorAll(".js-pay").forEach(function (a) {
      if (link) {
        a.setAttribute("href", link);
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
        a.removeAttribute("aria-disabled");
      } else {
        a.setAttribute("href", "#");
        a.setAttribute("aria-disabled", "true");
        a.addEventListener("click", function (e) { e.preventDefault(); });
      }
    });
    if (!link) {
      document.querySelectorAll(".js-pay-setup").forEach(function (el) { el.hidden = false; });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillEnquire();
    fillPay();
    buildPreloader();
    buildHeader();
    buildFooter();
    buildConcierge();
    buildProgress();
    fillChakanas();
    initReveals();
    initParallax();
    initMarquee();
    initCarousels();
    initQuotes();
    initEnquiryForm();
    buildDatesCTA();
    buildTransitions();
  });
})();
