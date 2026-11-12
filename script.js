document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const header = document.querySelector(".nav");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =====================================
     THEME SYSTEM
     ===================================== */
  const themeKey = "raj-portfolio-theme";
  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem(themeKey) || "dark";
  } catch (error) {
    savedTheme = "dark";
  }

  const themeButton =
    document.querySelector(".theme-toggle") ||
    document.createElement("button");

  if (!themeButton.classList.contains("theme-toggle")) {
    themeButton.className = "theme-toggle";
    themeButton.type = "button";
    if (header) header.appendChild(themeButton);
  }

  function applyTheme(theme, save = true) {
    const selected = theme === "light" ? "light" : "dark";
    root.setAttribute("data-theme", selected);
    themeButton.textContent = selected === "dark" ? "☀" : "☾";
    themeButton.setAttribute(
      "aria-label",
      selected === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
    if (save) {
      try {
        localStorage.setItem(themeKey, selected);
      } catch (error) {}
    }
  }

  applyTheme(savedTheme, false);

  themeButton.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* =====================================
     MOBILE NAVIGATION
     ===================================== */
  if (header) {
    const nav = header.querySelector("nav");

    if (nav) {
      const menuButton =
        header.querySelector(".menu-toggle") ||
        document.createElement("button");

      if (!menuButton.classList.contains("menu-toggle")) {
        menuButton.className = "menu-toggle";
        menuButton.type = "button";
        menuButton.textContent = "☰";
        menuButton.setAttribute("aria-label", "Open menu");
        menuButton.setAttribute("aria-expanded", "false");
        header.appendChild(menuButton);
      }

      function closeMenu() {
        nav.classList.remove("open");
        menuButton.textContent = "☰";
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");
      }

      menuButton.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        menuButton.textContent = isOpen ? "✕" : "☰";
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute(
          "aria-label",
          isOpen ? "Close menu" : "Open menu"
        );
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });

      document.addEventListener("click", (event) => {
        if (!header.contains(event.target)) closeMenu();
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });

      // Active page navigation
      const currentPage =
        window.location.pathname.split("/").pop() || "index.html";
      nav.querySelectorAll("a").forEach((link) => {
        const url = new URL(link.href);
        const linkPage = url.pathname.split("/").pop() || "index.html";
        if (linkPage === currentPage && !url.hash) {
          link.classList.add("active");
        }
      });
    }
  }

  /* =====================================
     SCROLL REVEAL
     ===================================== */
  const revealElements = document.querySelectorAll(".rv");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("in"));
  } else {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((element) => observer.observe(element));
  }
});
