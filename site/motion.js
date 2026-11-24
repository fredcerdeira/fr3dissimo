// Scroll motion for the portfolio. No dependencies.
//  - nav turns solid after the hero starts scrolling
//  - hero title slides in line by line
//  - [data-reveal] fades up when it enters the viewport (stagger with --d)
//  - [data-parallax="f"] moves at a different speed while scrolling
//  - [data-scrub] draws its accent rule as it crosses the middle of the screen
//  - [data-count] numbers count up and weekly bars grow once the stats load
// Everything is skipped for prefers-reduced-motion.

(function () {
  document.documentElement.dataset.motion = "on";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- mobile menu ----
  const navEl = document.querySelector(".nav");
  const menuBtn = document.querySelector(".menu-btn");
  if (navEl && menuBtn) {
    const setOpen = (open) => {
      navEl.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", () => setOpen(!navEl.classList.contains("open")));
    $$("#site-nav a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navEl.classList.contains("open")) { setOpen(false); menuBtn.focus(); }
    });
    matchMedia("(min-width: 961px)").addEventListener("change", (e) => e.matches && setOpen(false));
  }
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ---- hero title ----
  const hero = document.querySelector(".hero");
  requestAnimationFrame(() => requestAnimationFrame(() => hero && hero.classList.add("ready")));

  // ---- reveal on enter ----
  const reveals = $$("[data-reveal]");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      // threshold 0: an element taller than the viewport can never reach a ratio above ~0.1
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    reveals.forEach((el) => io.observe(el));
  }

  // ---- scroll-driven bits ----
  const nav = document.querySelector(".nav");
  const parallax = $$("[data-parallax]");
  const scrub = $$("[data-scrub]");

  let ticking = false;
  function frame() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    nav && nav.classList.toggle("scrolled", y > 40);


    if (reduce) return;

    // measure everything first, then write, so the browser lays out once per frame
    const moves = parallax.map((img) => {
      const box = img.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) return null;
      const f = parseFloat(img.dataset.parallax) || 0;
      const d = box.top + box.height / 2 - vh / 2;
      // never move further than the image's extra height, so no empty strip shows
      let y = -d * f;
      if (img.closest(".story-photo")) {
        const spare = Math.max(0, img.offsetHeight - box.height);
        y = clamp(y, -spare, 0);
      }
      return [img, y];
    });
    const draws = scrub.map((el) => [el, clamp((vh * 0.85 - el.getBoundingClientRect().top) / (vh * 0.35), 0, 1)]);

    moves.forEach((m) => m && (m[0].style.transform = `translate3d(0, ${m[1].toFixed(1)}px, 0)`));
    // scrub: each item's accent rule draws across as it crosses 50–85% of the viewport
    draws.forEach(([el, t]) => el.style.setProperty("--t", t.toFixed(3)));
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  frame();

  // ---- keep tile numbers inside their tile, whatever font is showing ----
  // Measures each number's final text; if it is wider than the tile, scales the font down.
  const fitNums = () => $$(".tile .num").forEach((n) => {
    n.style.fontSize = "";
    const text = n.dataset.final || n.textContent;
    const m = document.createElement("span");
    m.textContent = text;
    m.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap";
    n.append(m);
    const need = m.getBoundingClientRect().width, room = n.clientWidth;
    m.remove();
    if (room && need > room) n.style.fontSize = (parseFloat(getComputedStyle(n).fontSize) * room / need) * 0.98 + "px";
  });
  let fitTimer;
  addEventListener("resize", () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitNums, 120); });
  if (document.fonts) document.fonts.ready.then(fitNums);

  // ---- count-up + bars, after stats-loader fills the page ----
  document.addEventListener("stats:filled", () => {
    $$(".tile .num").forEach((n) => (n.dataset.final = n.textContent.trim()));
    fitNums();
    const nf = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });
    const counters = $$("[data-count]").map((el) => ({ el, to: parseFloat(el.textContent.replace(/[^\d.]/g, "")) })).filter((c) => !isNaN(c.to));
    const bars = $$("[data-stat-weekly] > *");
    if (reduce || !("IntersectionObserver" in window)) return;

    counters.forEach((c) => (c.el.textContent = "0"));
    bars.forEach((b) => { b.style.transformOrigin = "bottom"; b.style.transform = "scaleY(0)"; b.style.transition = "transform .9s cubic-bezier(.2,.7,.2,1), opacity .2s"; });

    const run = (c) => {
      const start = performance.now(), dur = 1400;
      const step = (now) => {
        const t = clamp((now - start) / dur, 0, 1), e = 1 - Math.pow(1 - t, 3);
        c.el.textContent = nf.format(c.to * e);
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const c = counters.find((x) => x.el === e.target);
      if (c) run(c);
      else $$(":scope > *", e.target).forEach((b, i) => setTimeout(() => (b.style.transform = "none"), i * 50));
    }), { threshold: 0.4 });
    counters.forEach((c) => io.observe(c.el));
    $$("[data-stat-weekly]").forEach((w) => io.observe(w));
  });
})();
