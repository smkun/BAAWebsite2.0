// SCRIPTS/contentLoader.js
class ContentLoader {
    constructor() {
        console.log("ContentLoader initialized"); // Debug line
        this.cache = new Map();
        this.currentSection = null;
    }

    async loadContent(path) {
        console.log("Attempting to load:", path); // Debug line
        try {
            // Check cache first
            if (this.cache.has(path)) {
                console.log("Loading from cache:", path);
                return this.cache.get(path);
            }

            console.log("Fetching:", path);
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const content = await response.text();
            console.log("Content loaded successfully:", path);

            // Store in cache
            this.cache.set(path, content);
            return content;
        } catch (error) {
            console.error(`Error loading content from ${path}:`, error);
            return `<div class="error-message">Failed to load content: ${path}</div>`;
        }
    }

    async loadSection(sectionId) {
        console.log("Loading section:", sectionId); // Debug line
        if (this.currentSection === sectionId) return;

        const mainContent = document.getElementById("main-content");
        mainContent.innerHTML = '<div class="loading">Loading...</div>';

        try {
            let path;
            if (sectionId === "opd") {
                path = "SECTIONS/DATABASES/acaan.html";
            } else if (sectionId === "heros-opd") {
                path = "SECTIONS/DATABASES/rhsad.html";
            } else if (sectionId === "villain-opd") {
                path = "SECTIONS/DATABASES/tracks.html";
            } else {
                path = `SECTIONS/${sectionId.toUpperCase()}/${sectionId}.html`;
            }

            console.log("Section path:", path); // Debug line
            const content = await this.loadContent(path);
            mainContent.innerHTML = content;

            history.pushState(null, "", `#${sectionId}`);
            this.currentSection = sectionId;

            if (sectionId === "students") {
                window.switchTeam("alpha");
            }
        } catch (error) {
            console.error("Error loading section:", error);
            mainContent.innerHTML = `<div class="error-message">Section not found: ${sectionId}</div>`;
        }
    }

    async initialize() {
        console.log("Initializing ContentLoader..."); // Debug line
        try {
            const headerContainer = document.getElementById("header-container");
            const headerContent = await this.loadContent(
                "COMPONENTS/header.html"
            );
            headerContainer.innerHTML = headerContent;

            const footerContainer = document.getElementById("footer-container");
            const footerContent = await this.loadContent(
                "COMPONENTS/footer.html"
            );
            footerContainer.innerHTML = footerContent;

            const hash = window.location.hash.slice(1) || "home";
            console.log("Initial hash:", hash); // Debug line
            await this.loadSection(hash);

            window.addEventListener("hashchange", () => {
                const newHash = window.location.hash.slice(1);
                this.loadSection(newHash);
            });
        } catch (error) {
            console.error("Initialization error:", error);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded"); // Debug line
    window.contentLoader = new ContentLoader();
    window.contentLoader.initialize();
});
