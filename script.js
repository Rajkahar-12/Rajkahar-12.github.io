/* ═══════════════════════════════════════════════════════════
   UI UX Pro Max — portfolio script
   Motion choreography · preloader · tilt · theme · reveal
   ═══════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ─────────────────────────────────────────────────────
     1. PRELOADER → HERO HANDOFF
     ───────────────────────────────────────────────────── */
  const preloader      = $("#preloader");
  const preloaderBar   = $("#preloaderBar");
  const preloaderCount = $("#preloaderCount");
  const hero           = $("#hero");

  document.body.classList.add("is-loading");

  function finishPreloader() {
    preloaderBar.style.width = "100%";
    preloaderCount.textContent = "100";
    setTimeout(() => {
      preloader.classList.add("is-done");
      document.body.classList.remove("is-loading");
      hero.classList.add("is-loaded"); // trigger hero entrance
      setTimeout(() => preloader.remove(), 700);
    }, 250);
  }

  function runPreloader() {
    if (prefersReducedMotion) return finishPreloader();

    let progress = 0;
    const tick = () => {
      // ease-out to 90%, then snap to 100 in finishPreloader
      progress += Math.max(0.5, (100 - progress) * 0.06);
      if (progress >= 90) {
        progress = 90;
        preloaderBar.style.width = progress + "%";
        preloaderCount.textContent = Math.round(progress);
        finishPreloader();
        return;
      }
      preloaderBar.style.width = progress + "%";
      preloaderCount.textContent = Math.round(progress);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  window.addEventListener("load", runPreloader);

  // Safety net: if load fires slowly, kick off after 3s anyway
  setTimeout(() => {
    if (!hero.classList.contains("is-loaded")) runPreloader();
  }, 3000);

  /* ─────────────────────────────────────────────────────
     2. THEME TOGGLE
     ───────────────────────────────────────────────────── */
  const themeToggle = $("#themeToggle");
  const root = document.documentElement;

  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ─────────────────────────────────────────────────────
     3. NAV SHADOW ON SCROLL
     ───────────────────────────────────────────────────── */
  const nav = $("#nav");
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ─────────────────────────────────────────────────────
     4. VARIABLE-FONT SCROLL REACTION ON HERO TITLE
        This is the signature motion moment.
     ───────────────────────────────────────────────────── */
  const heroTitle = $(".hero__title");

  if (heroTitle && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Only react while hero is still visible
        const maxScroll = window.innerHeight * 0.6;
        const progress = Math.min(window.scrollY / maxScroll, 1);
        const weight = 800 - progress * 500; // 800 → 300
        heroTitle.style.fontVariationSettings = `"wght" ${weight}`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────
     5. MAGNETIC BUTTONS
     ───────────────────────────────────────────────────── */
  if (!prefersReducedMotion) {
    $$(".magnetic").forEach((btn) => {
      const strength = 14;
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ─────────────────────────────────────────────────────
     6. TILT CARDS + SPOTLIGHT
     ───────────────────────────────────────────────────── */
  if (!prefersReducedMotion && window.anime) {
    $$(".tilt").forEach((card) => {
      const maxTilt = 4; // degrees — subtle, not gimmicky
      let rect = null;

      card.addEventListener("mouseenter", () => {
        rect = card.getBoundingClientRect();
      });

      card.addEventListener("mousemove", (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -maxTilt;
        const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * maxTilt;

        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");

        anime({
          targets: card,
          rotateX,
          rotateY,
          scale: 1.02,
          duration: 400,
          easing: "cubicBezier(0.22, 1, 0.36, 1)"
        });
      });

      card.addEventListener("mouseleave", () => {
        rect = null;
        anime({
          targets: card,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 600,
          easing: "cubicBezier(0.22, 1, 0.36, 1)"
        });
      });
    });
  }

  /* ─────────────────────────────────────────────────────
     7. SCROLL REVEAL FALLBACK
        (browsers without scroll-driven animations)
     ───────────────────────────────────────────────────── */
  const supportsScrollTimeline = CSS.supports("animation-timeline: view()");

  if (!supportsScrollTimeline && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition =
              "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1)";
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    $$(".reveal").forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(32px)";
      io.observe(el);
    });
  }
})();
