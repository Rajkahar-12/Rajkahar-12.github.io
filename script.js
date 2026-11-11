
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // THEME
    // =====================================

    const header = document.querySelector(".nav");
    const themeKey = "raj-portfolio-theme";
    const themeButton = document.createElement("button");

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem(themeKey) || "light";
    } catch (error) {
        // Continue with default theme.
    }

    function applyTheme(theme) {
        const selectedTheme = theme === "dark" ? "dark" : "light";

        document.documentElement.setAttribute("data-theme", selectedTheme);

        themeButton.textContent = selectedTheme === "dark" ? "☀" : "☾";

        themeButton.setAttribute(
            "aria-label",
            selectedTheme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        try {
            localStorage.setItem(themeKey, selectedTheme);
        } catch (error) {
            // Theme still works without storage.
        }
    }

    if (header) {
        themeButton.className = "theme-toggle";
        themeButton.type = "button";

        header.appendChild(themeButton);
        applyTheme(savedTheme);

        themeButton.addEventListener("click", () => {
            const currentTheme =
                document.documentElement.getAttribute("data-theme");

            applyTheme(currentTheme === "dark" ? "light" : "dark");
        });

        // =====================================
        // MOBILE MENU
        // =====================================

        const navLinks = header.querySelector("nav");

        if (navLinks) {
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
                if (navLinks.classList.contains("open")) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

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
                if (window.innerWidth > 680) {
                    closeMenu();
                }
            });

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
    // SCROLL PROGRESS
    // =====================================

    const progressBar = document.createElement("div");

    progressBar.className = "scroll-progress";
    progressBar.setAttribute("aria-hidden", "true");

    document.body.appendChild(progressBar);

    let updatePending = false;

    function updateProgress() {
        const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = totalHeight > 0
            ? window.scrollY / totalHeight
            : 0;

        progressBar.style.transform =
            `scaleX(${Math.min(Math.max(progress, 0), 1)})`;

        updatePending = false;
    }

    window.addEventListener("scroll", () => {
        if (!updatePending) {
            updatePending = true;
            requestAnimationFrame(updateProgress);
        }
    }, { passive: true });

    window.addEventListener("resize", updateProgress, { passive: true });

    updateProgress();

    // =====================================
    // FOOTER YEAR
    // =====================================

    document.querySelectorAll("[data-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    // =====================================
    // EXTERNAL LINKS
    // =====================================

    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.setAttribute("rel", "noopener noreferrer");
    });

});
