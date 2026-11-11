/* ==========================================
   RAJ KAHAR — PORTFOLIO JAVASCRIPT
   Theme, navigation and animations
   ========================================== */

document.documentElement.classList.add("js");

/* ---------- THEME SYSTEM ---------- */

const THEME_KEY = "raj-portfolio-theme";

function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", selectedTheme);

    const button = document.querySelector(".theme-toggle");

    if (button) {
        button.textContent =
            selectedTheme === "dark" ? "☀ Light mode" : "☾ Dark mode";

        button.setAttribute(
            "aria-label",
            selectedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        );
    }

    try {
        localStorage.setItem(THEME_KEY, selectedTheme);
    } catch (error) {
        console.warn("Theme preference could not be saved.");
    }
}

let savedTheme = "light";

try {
    savedTheme = localStorage.getItem(THEME_KEY) || "light";
} catch (error) {
    console.warn("Saved theme could not be loaded.");
}

applyTheme(savedTheme);

/* ---------- CREATE THEME BUTTON ---------- */

const navigation = document.querySelector(".nav");

if (navigation && !document.querySelector(".theme-toggle")) {
    const themeButton = document.createElement("button");

    themeButton.type = "button";
    themeButton.className = "theme-toggle";
    themeButton.textContent = "☾ Dark mode";

    themeButton.style.cssText = `
        padding: 9px 13px;
        border: 1px solid var(--border);
        border-radius: 30px;
        background: var(--surface);
        color: var(--text);
        font-family: var(--mono);
        font-size: 11px;
        cursor: pointer;
        white-space: nowrap;
        transition: background .25s ease, color .25s ease;
    `;

    navigation.appendChild(themeButton);

    applyTheme(
        document.documentElement.getAttribute("data-theme") || "light"
    );
}

document.addEventListener("click", function (event) {
    const button = event.target.closest(".theme-toggle");

    if (!button) return;

    const currentTheme =
        document.documentElement.getAttribute("data-theme");

    applyTheme(currentTheme === "dark" ? "light" : "dark");
});

/* ---------- SCROLL REVEAL ---------- */

const revealElements = document.querySelectorAll(".rv");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
        function (entries, observer) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -35px 0px"
        }
    );

    revealElements.forEach(function (element) {
        revealObserver.observe(element);
    });
} else {
    revealElements.forEach(function (element) {
        element.classList.add("in");
    });
}

/* ---------- ACTIVE NAVIGATION ---------- */

const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav a").forEach(function (link) {
    const href = link.getAttribute("href");

    if (!href) return;

    const linkPage = href.split("#")[0] || "index.html";

    if (
        linkPage === currentPage &&
        !href.startsWith("#")
    ) {
        link.setAttribute("aria-current", "page");
    }
});

/* ---------- FOOTER YEAR ---------- */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

/* ---------- CLOSE EXTERNAL LINK SAFETY ---------- */

document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    link.setAttribute("rel", "noopener noreferrer");
});
