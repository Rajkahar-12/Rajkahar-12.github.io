
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".nav");

    // ---------- THEME SETUP ----------

    const themeKey = "raj-portfolio-theme";
    const themeButton = document.createElement("button");

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem(themeKey) || "light";
    } catch (error) {
        savedTheme = "light";
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
            // Theme still works without local storage.
        }
    }

    if (header) {
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
                navLinks.classList.contains("open")
                    ? closeMenu()
                    : openMenu();
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

            // ---------- ACTIVE NAVIGATION ----------

            const currentPage = window.location.pathname
                .split("/")
                .pop() || "index.html";

            navLinks.querySelectorAll("a").forEach(link => {
                const linkUrl = new URL(link.href, window.location.href);
                const linkPage = linkUrl.pathname.split("/").pop() || "index.html";

                if (linkPage === currentPage && !linkUrl.hash) {
                    link.classList.add("active");
                }
            });
        }
    }

    // ---------- AUTOMATIC SCROLL REVEAL ----------

    const revealSelectors = [
        "main > section",
        ".hero-content",
        ".page-hero",
        ".project-card",
        ".about-card",
        ".tool-card",
        ".info-card"
    ];

    const revealElements = document.querySelectorAll(
        revealSelectors.join(",")
    );

    revealElements.forEach(element => {
        element.classList.add("rv");
    });

    if (
        "IntersectionObserver" in window &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
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
                threshold: 0.08,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach((element, index) => {
            if (
                element.classList.contains("project-card") ||
                element.classList.contains("about-card") ||
                element.classList.contains("tool-card")
            ) {
                element.style.transitionDelay = `${(index % 4) * 80}ms`;
            }

            observer.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add("visible");
        });
    }

    // ---------- SCROLL PROGRESS BAR ----------

    const progressBar = document.createElement("div");

    progressBar.className = "scroll-progress";
    progressBar.setAttribute("aria-hidden", "true");

    document.body.appendChild(progressBar);

    let scrollUpdatePending = false;

    function updateScrollProgress() {
        const scrollableHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = scrollableHeight > 0
            ? (window.scrollY / scrollableHeight) * 100
            : 0;

        progressBar.style.width = `${Math.min(progress, 100)}%`;

        scrollUpdatePending = false;
    }

    window.addEventListener("scroll", () => {
        if (!scrollUpdatePending) {
            scrollUpdatePending = true;
            window.requestAnimationFrame(updateScrollProgress);
        }
    }, { passive: true });

    window.addEventListener("resize", updateScrollProgress);

    updateScrollProgress();

    // ---------- FOOTER YEAR ----------

    document.querySelectorAll("[data-year]").forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    // ---------- EXTERNAL LINKS ----------

    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.setAttribute("rel", "noopener noreferrer");
    });
});
