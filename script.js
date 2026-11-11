
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".nav");

    if (!header) return;

    // ---------- THEME SETUP ----------

    const themeKey = "raj-portfolio-theme";

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem(themeKey) || "light";
    } catch (error) {
        savedTheme = "light";
    }

    function applyTheme(theme) {
        const selectedTheme = theme === "dark" ? "dark" : "light";

        document.documentElement.setAttribute(
            "data-theme",
            selectedTheme
        );

        if (themeButton) {
            themeButton.textContent =
                selectedTheme === "dark" ? "☀" : "☾";

            themeButton.setAttribute(
                "aria-label",
                selectedTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        }

        try {
            localStorage.setItem(themeKey, selectedTheme);
        } catch (error) {
            // Theme still works without local storage.
        }
    }

    // ---------- NAVIGATION ----------

    const navLinks = header.querySelector("nav");

    if (!navLinks) return;

    // Create theme button.
    const themeButton = document.createElement("button");

    themeButton.className = "theme-toggle";
    themeButton.type = "button";
    themeButton.setAttribute("aria-label", "Switch theme");

    header.appendChild(themeButton);

    themeButton.addEventListener("click", () => {
        const currentTheme =
            document.documentElement.getAttribute("data-theme");

        applyTheme(currentTheme === "dark" ? "light" : "dark");
    });

    applyTheme(savedTheme);

    // ---------- MOBILE MENU ----------

    const menuButton = document.createElement("button");

    menuButton.className = "menu-toggle";
    menuButton.type = "button";
    menuButton.textContent = "☰";
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.setAttribute("aria-expanded", "false");

    header.appendChild(menuButton);

    function closeMenu() {
        navLinks.classList.remove("open");

        menuButton.textContent = "☰";
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
    }

    function openMenu() {
        navLinks.classList.add("open");

        menuButton.textContent = "✕";
        menuButton.setAttribute("aria-expanded", "true");
        menuButton.setAttribute("aria-label", "Close navigation menu");
    }

    menuButton.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("open");

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu after clicking a navigation link.
    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Close menu when clicking outside.
    document.addEventListener("click", event => {
        if (!header.contains(event.target)) {
            closeMenu();
        }
    });

    // Close menu with Escape key.
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    // Close menu when switching to desktop layout.
    window.addEventListener("resize", () => {
        if (window.innerWidth > 680) {
            closeMenu();
        }
    });

    // ---------- ACTIVE NAVIGATION ----------

    const currentPage = window.location.pathname
        .split("/")
        .pop() || "index.html";

    navLinks.querySelectorAll("a").forEach(link => {
        const linkUrl = new URL(link.href, window.location.href);

        const linkPage = linkUrl.pathname
            .split("/")
            .pop() || "index.html";

        if (
            linkPage === currentPage &&
            !linkUrl.hash
        ) {
            link.classList.add("active");
        }
    });

    // ---------- SCROLL REVEAL ----------

    const revealElements = document.querySelectorAll(".rv");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.08
            }
        );

        revealElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add("visible");
        });
    }

    // ---------- FOOTER YEAR ----------

    document.querySelectorAll("[data-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    // ---------- EXTERNAL LINKS ----------

    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.setAttribute("rel", "noopener noreferrer");
    });
});
