// SCRIPTS/contentLoader.js
class ContentLoader {
    constructor() {
        console.log("ContentLoader initialized");
        this.cache = new Map();
        this.currentSection = null;
        this.isSubPage = !document.getElementById("main-content");
    }

    async loadContent(path) {
        console.log("Attempting to load:", path);
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
        console.log("Loading section:", sectionId);
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

            console.log("Section path:", path);
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

    // Get the appropriate path to components based on current page depth
    getComponentPath() {
        // Get the current URL path
        const path = window.location.pathname;
        console.log("Current pathname:", path);
        
        // Hardcoded path mapping for specific page patterns
        // Adjust these patterns based on your actual file structure
        
        // For pages in SECTIONS/HEROES/ like 9alarm.html
        if (path.includes('/SECTIONS/HEROES/') || path.includes('/HEROES/')) {
            console.log("Hero page detected, using hardcoded path");
            return "../../COMPONENTS/";
        }
        
        // For pages in other SECTIONS
        if (path.includes('/SECTIONS/')) {
            console.log("Section page detected, using hardcoded path");
            return "../../COMPONENTS/";
        }
        
        // For index or root-level pages
        if (path === '/' || path.endsWith('index.html') || path === '') {
            console.log("Index page detected, using root path");
            return "COMPONENTS/";
        }
        
        // Default fallback - try two levels up
        console.log("Using default fallback path");
        return "../../COMPONENTS/";
    }

    // Get path to index.html from current location
    getPathToRoot() {
        // Similar hardcoded approach to match getComponentPath
        const path = window.location.pathname;
        
        // For pages in SECTIONS/HEROES/ like 9alarm.html
        if (path.includes('/SECTIONS/HEROES/') || path.includes('/HEROES/')) {
            return "../../";
        }
        
        // For pages in other SECTIONS
        if (path.includes('/SECTIONS/')) {
            return "../../";
        }
        
        // For index or root-level pages
        if (path === '/' || path.endsWith('index.html') || path === '') {
            return "./";
        }
        
        // Default fallback
        return "../../";
    }

    // Better method to adjust header links using DOM manipulation
    adjustHeaderLinks(headerContent) {
        if (!this.isSubPage) {
            return headerContent;
        }
        
        // Create a temporary DOM element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = headerContent;
        
        // Find all links in the header
        const links = tempDiv.querySelectorAll('a');
        
        // Get the path to root
        const rootPath = this.getPathToRoot();
        console.log("Root path for links:", rootPath);
        
        // Update each link
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                // Make sure we're using the correct path to index.html
                const newHref = `${rootPath}index.html${href}`;
                console.log(`Changing link from ${href} to ${newHref}`);
                link.setAttribute('href', newHref);
            }
        });
        
        // Return the modified HTML
        return tempDiv.innerHTML;
    }

    async loadHeaderForSubPage() {
        console.log("Loading header for sub-page");
        try {
            const componentPath = this.getComponentPath();
            const headerPath = `${componentPath}header.html`;
            
            console.log("Header path:", headerPath);
            let headerContent = await this.loadContent(headerPath);
            
            // Adjust the links in the header for subpages
            headerContent = this.adjustHeaderLinks(headerContent);
            
            // Find the existing header element
            const headerElement = document.querySelector("header");
            if (headerElement) {
                headerElement.outerHTML = headerContent;
                console.log("Header updated successfully");
            } else {
                console.warn("No header element found to replace");
            }
        } catch (error) {
            console.error("Error loading header for sub-page:", error);
        }
    }

    async loadFooterForSubPage() {
        console.log("Loading footer for sub-page");
        try {
            const componentPath = this.getComponentPath();
            const footerPath = `${componentPath}footer.html`;
            
            console.log("Footer path:", footerPath);
            const footerContent = await this.loadContent(footerPath);
            
            // Find the existing footer element
            const footerElement = document.querySelector("footer");
            if (footerElement) {
                footerElement.outerHTML = footerContent;
                console.log("Footer updated successfully");
            } else {
                console.warn("No footer element found to replace");
            }
        } catch (error) {
            console.error("Error loading footer for sub-page:", error);
        }
    }

    async initialize() {
        console.log("Initializing ContentLoader...");
        
        if (this.isSubPage) {
            // We're on a sub-page like 9alarm.html
            console.log("Sub-page detected");
            await this.loadHeaderForSubPage();
            await this.loadFooterForSubPage();
        } else {
            // We're on the main page
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
                console.log("Initial hash:", hash);
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
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded");
    window.contentLoader = new ContentLoader();
    window.contentLoader.initialize();
});