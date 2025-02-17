// scripts.js

// Function to show selected section and hide others
async function switchTeam(team) {
    // Hide all teams
    document.querySelectorAll(".team-content").forEach((content) => {
        content.classList.remove("active");
        content.style.display = "none";
    });

    // Update active button style
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
    });

    const activeButton = document.querySelector(
        `[onclick="switchTeam('${team}')"]`
    );
    if (activeButton) {
        activeButton.classList.add("active");
    }

    // Load and show the selected team content
    const selectedTeam = document.getElementById(`team-${team}`);
    if (selectedTeam) {
        try {
            // Only load content if it hasn't been loaded before
            if (!selectedTeam.hasAttribute("data-loaded")) {
                const content = await window.contentLoader.loadContent(
                    `SECTIONS/STUDENTS/team-${team}.html`
                );
                selectedTeam.innerHTML = content;
                selectedTeam.setAttribute("data-loaded", "true");
            }
            selectedTeam.classList.add("active");
            selectedTeam.style.display = "block";
        } catch (error) {
            console.error(`Error loading team ${team}:`, error);
            selectedTeam.innerHTML =
                '<div class="error-message">Failed to load team content</div>';
        }
    }
}
