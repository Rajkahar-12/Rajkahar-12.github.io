
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const header = document.querySelector(".nav");
    const themeKey = "raj-portfolio-theme";

    // =====================================
    // THEME
    // =====================================

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem(themeKey) || "light";
    } catch (error) {
        savedTheme = "light";
    }

    const themeButton = document.createElement("button");

    themeButton.className = "theme-toggle";
    themeButton.type = "button";

    function applyTheme(theme, save = true) {
        const selectedTheme = theme === "dark" ? "dark" : "light";

        root.setAttribute("data-theme", selectedTheme);

        themeButton.textContent =
            selectedTheme === "dark" ? "☀" : "☾";

        themeButton.setAttribute(
            "aria-label",
            selectedTheme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        if (save) {
            try {
                localStorage.setItem(themeKey, selectedTheme);
            } catch (error) {
                // Theme still works without storage.
            }
        }
    }

    applyTheme(savedTheme, false);

    themeButton.addEventListener("click", () => {
        const currentTheme = root.getAttribute("data-theme");

        applyTheme(currentTheme === "dark" ? "light" : "dark");
    });

    if (header) {
        header.appendChild(themeButton);
    }

    // =====================================
    // MOBILE NAVIGATION
    // =====================================

    if (header) {
        const navLinks = header.querySelector("nav");

        if (navLinks) {
            const menuButton = document.createElement("button");

            menuButton.className = "menu-toggle";
            menuButton.type = "button";
            menuButton.textContent = "☰";

            menuButton.setAttribute("aria-label", "Open menu");
            menuButton.setAttribute("aria-expanded", "false");

            header.appendChild(menuButton);

            function closeMenu() {
                navLinks.classList.remove("open");
                menuButton.textContent = "☰";
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.setAttribute("aria-label", "Open menu");
            }

            function toggleMenu() {
                const isOpen = navLinks.classList.toggle("open");

                menuButton.textContent = isOpen ? "✕" : "☰";

                menuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

                menuButton.setAttribute(
                    "aria-label",
                    isOpen ? "Close menu" : "Open menu"
                );
            }

            menuButton.addEventListener("click", toggleMenu);

            navLinks.querySelectorAll("a").forEach(link => {
                link.addEventListener("click", closeMenu);
            });

            document.addEventListener("click", event => {
                if (!header.contains(event.target)) {
                    closeMenu();
                }
            });

            document.addEventListener("keydown", event => {
                if (event.key === "Escape") {
                    closeMenu();
                }
            });

            window.addEventListener("resize", () => {
                if (window.innerWidth > 760) {
                    closeMenu();
                }
            }, { passive: true });

            // =====================================
            // ACTIVE NAVIGATION
            // =====================================

            const currentPage =
                window.location.pathname.split("/").pop() || "index.html";

            navLinks.querySelectorAll("a").forEach(link => {
                const linkUrl = new URL(link.href, window.location.href);

                const linkPage =
                    linkUrl.pathname.split("/").pop() || "index.html";

                if (linkPage === currentPage && !linkUrl.hash) {
                    link.classList.add("active");
                }
            });
        }
    }

    // =====================================
    // FOOTER YEAR
    // =====================================

    document.querySelectorAll("[data-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    // =====================================
    // EXTERNAL LINK SECURITY
    // =====================================

    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.setAttribute("rel", "noopener noreferrer");
    });

    // =====================================
    // SMOOTH INTERNAL NAVIGATION
    // =====================================

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth",
                block: "start"
            });

            history.replaceState(null, "", targetId);
        });
    });
});
