document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const header = document.querySelector(".nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- THEME ---------- */
  const themeKey = "raj-portfolio-theme";
  let savedTheme;
  try { savedTheme = localStorage.getItem(themeKey) || "dark"; }
  catch { savedTheme = "dark"; }

  const themeButton = document.querySelector(".theme-toggle");

  function applyTheme(theme, save = true) {
    const selected = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", selected);
    if (themeButton) {
      themeButton.textContent = selected === "dark" ? "☀" : "☾";
      themeButton.setAttribute(
        "aria-label",
        selected === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    }
    if (save) { try { localStorage.setItem(themeKey, selected); } catch {} }
  }

  applyTheme(savedTheme, false);

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  /* ---------- MOBILE MENU ---------- */
  if (header) {
    const nav = header.querySelector("nav");
    const menuButton = header.querySelector(".menu-toggle");

    if (nav && menuButton) {
      const closeMenu = () => {
        nav.classList.remove("open");
        menuButton.textContent = "☰";
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
      };

      menuButton.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        menuButton.textContent = isOpen ? "✕" : "☰";
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });

      document.addEventListener("click", (e) => {
        if (!header.contains(e.target)) closeMenu();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
      });
    }
  }

  /* ---------- REVEAL ON SCROLL ---------- */
  const reveals = document.querySelectorAll(".rv");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach((el) => observer.observe(el));
  }
});
