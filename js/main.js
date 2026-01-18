// Sidenav Functions
function openSidenav() {
        document.getElementById("sidenav").classList.add("open");
        document.getElementById("overlay").classList.add("show");
}

function closeSidenav() {
        document.getElementById("sidenav").classList.remove("open");
        document.getElementById("overlay").classList.remove("show");
}

// Initialize the application
function initializeApp() {
        console.log("Initializing Multimedia Diary...");
        
        // Set theme
        document.documentElement.setAttribute("data-theme", currentTheme);
        updateThemeIcon();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load initial data
        loadEntries();
        
        // Setup form
        setupForm();
        
        // Hide loading screen
        setTimeout(() => {
                document.getElementById("loadingScreen").classList.add("hidden");
        }, 1000);
}

// Setup all event listeners
function setupEventListeners() {
        // Navigation
        document.querySelectorAll(".nav-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                        const view = e.currentTarget.getAttribute("data-view");
                        switchView(view);
                        closeSidenav(); // Close menu on selection
                });
        });
        
        // Room zones
        document.querySelectorAll(".room-zone").forEach((zone) => {
                zone.addEventListener("click", (e) => {
                        const type = e.currentTarget.getAttribute("data-type");
                        switchView("overview");
                        
                        // Small delay to ensure the view has switched
                        setTimeout(() => {
                                setTypeFilter(type);
                        }, 50);
                });
        });
        
        // Timeline filters -> Overview filters
        document.querySelectorAll(".filter-btn").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                        const filter = e.currentTarget.getAttribute("data-filter");
                        setStatusFilter(filter);
                });
        });
        
        document.querySelectorAll(".type-filter").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                        const type = e.currentTarget.getAttribute("data-type");
                        setTypeFilter(type);
                });
        });
        
        // Form submission
        document.getElementById("addEntryForm").addEventListener("submit", handleFormSubmission);
        
        // Show/hide rating based on finish date
        document.getElementById("finishDate").addEventListener("change", (e) => {
                const ratingSection = document.getElementById("ratingSection");
                // 'form-group' divs are flex containers in this design
                ratingSection.style.display = e.target.value ? "flex" : "none";
        });
        
        // Rating slider
        document.getElementById("rating").addEventListener("input", updateRatingDisplay);

        // Hamburger button - open sidenav
        const hamburgerBtn = document.getElementById("hamburgerBtn");
        if (hamburgerBtn) {
                hamburgerBtn.addEventListener("click", openSidenav);
        }

        // Theme toggle button
        const themeToggleBtn = document.getElementById("themeToggleBtn");
        if (themeToggleBtn) {
                themeToggleBtn.addEventListener("click", toggleTheme);
        }

        // Sidenav close button
        const sidenavClose = document.getElementById("sidenavClose");
        if (sidenavClose) {
                sidenavClose.addEventListener("click", closeSidenav);
        }

        // Overlay click - close sidenav
        const overlay = document.getElementById("overlay");
        if (overlay) {
                overlay.addEventListener("click", closeSidenav);
        }

        // Form tabs
        document.querySelectorAll(".form-tab").forEach((tab) => {
                tab.addEventListener("click", (e) => {
                        const formType = e.currentTarget.getAttribute("data-form");
                        switchFormTab(formType);
                });
        });

        // Reset form button
        const resetFormBtn = document.getElementById("resetFormBtn");
        if (resetFormBtn) {
                resetFormBtn.addEventListener("click", resetForm);
        }

        // Reset pending form button
        const resetPendingFormBtn = document.getElementById("resetPendingFormBtn");
        if (resetPendingFormBtn) {
                resetPendingFormBtn.addEventListener("click", resetPendingForm);
        }

        // Modal close button
        const modalCloseBtn = document.getElementById("modalCloseBtn");
        if (modalCloseBtn) {
                modalCloseBtn.addEventListener("click", closeModal);
        }

        // Modal edit form submission
        const modalEditForm = document.getElementById("modalEditForm");
        if (modalEditForm) {
                modalEditForm.addEventListener("submit", saveEntryChanges);
        }

        // Modal view mode buttons
        const modalCloseViewBtn = document.getElementById("modalCloseViewBtn");
        if (modalCloseViewBtn) {
                modalCloseViewBtn.addEventListener("click", closeModal);
        }

        const modalEditBtn = document.getElementById("modalEditBtn");
        if (modalEditBtn) {
                modalEditBtn.addEventListener("click", () => toggleEntryEdit(true));
        }

        const modalDeleteBtn = document.getElementById("modalDeleteBtn");
        if (modalDeleteBtn) {
                modalDeleteBtn.addEventListener("click", deleteCurrentEntry);
        }

        // Modal edit mode buttons
        const modalCancelEditBtn = document.getElementById("modalCancelEditBtn");
        if (modalCancelEditBtn) {
                modalCancelEditBtn.addEventListener("click", () => toggleEntryEdit(false));
        }

        // Modal close
        document.getElementById("entryModal").addEventListener("click", (e) => {
                if (e.target === e.currentTarget) {
                        closeModal();
                }
        });
        
        // Show author field only for books
        document.getElementById("type").addEventListener("change", (e) => {
                const isBook = e.target.value === "book";
                // Hide both author sections first
                document.getElementById("authorSection").style.display = "none";
                document.getElementById("authorSectionFullWidth").style.display = "none";
                
                // Show the appropriate author section
                if (isBook) {
                        document.getElementById("authorSectionFullWidth").style.display = "flex";
                }
        });
        
        // Make sure this gets called on page load too
        document.addEventListener("DOMContentLoaded", updateFormBasedOnDates);
        
        // Add listeners for date changes
        document.getElementById("startDate").addEventListener("change", updateFormBasedOnDates);
        document.getElementById("finishDate").addEventListener("change", updateFormBasedOnDates);
        
        // Add this after the existing date change listeners:
        document.getElementById("isFinished").addEventListener("change", updateFormBasedOnDates);
        
        // Keyboard shortcuts
        document.addEventListener("keydown", handleKeyboardShortcuts);
        
        // Search functionality - add after other event listeners
        setTimeout(() => {
                const pendingSearch = document.getElementById("pendingSearch");
                const overviewSearch = document.getElementById("overviewSearch");
                
                if (pendingSearch) {
                        pendingSearch.addEventListener(
                                "input",
                                debounce(() => {
                                        if (currentView === "pending") renderPending();
                                }, 300)
                        );
                }
                
                if (overviewSearch) {
                        overviewSearch.addEventListener(
                                "input",
                                debounce(() => {
                                        if (currentView === "overview") renderOverview();
                                }, 300)
                        );
                }
        }, 100);
}

// Enhanced form logic for different item types
function updateFormBasedOnDates() {
        const startDate = document.getElementById("startDate").value;
        const finishDate = document.getElementById("finishDate").value;
        const isFinished = document.getElementById("isFinished")?.checked || false;
        const ratingSection = document.getElementById("ratingSection");
        const finishedSection = document.getElementById("finishedSection");
        const ratingLabel = document.querySelector('label[for="rating"]');
        const ratingInput = document.getElementById("rating");
        
        if (!startDate && !finishDate) {
                // Type 1: No dates - show finished checkbox
                finishedSection.style.display = "flex";
                
                if (isFinished) {
                        // Show rating section when marked as finished
                        ratingSection.style.display = "flex";
                        ratingInput.disabled = false;
                        ratingLabel.innerHTML = `
                        <i class="fas fa-star"></i>
                        Rating (0 for no rating)
                        <small style="display: block; font-weight: normal; color: var(--text-secondary);">
                        Optional rating for this completed item.
                        </small>
                        `;
                        } else {
                        // Hide/disable rating section when not finished
                        ratingSection.style.display = "none";
                        ratingInput.disabled = true;
                        ratingInput.value = 0; // Reset to 0
                }
                } else if (!startDate && finishDate) {
                // Type 2: Only finish date
                finishedSection.style.display = "none";
                ratingSection.style.display = "flex";
                ratingInput.disabled = false;
                ratingLabel.innerHTML = `<i class="fas fa-star"></i> Rating (0 for no rating)`;
                } else if (startDate && !finishDate) {
                // Type 3: In progress - hide both
                finishedSection.style.display = "none";
                ratingSection.style.display = "none";
                ratingInput.disabled = true;
                } else {
                // Type 4: Both dates
                finishedSection.style.display = "none";
                ratingSection.style.display = "flex";
                ratingInput.disabled = false;
                ratingLabel.innerHTML = `<i class="fas fa-star"></i> Rating (0 for no rating)`;
        }
        
        // Update rating display
        updateRatingDisplay();
}

// Switch between different views
function switchView(viewName) {
        // Handle legacy timeline -> overview redirect
        if (viewName === "timeline") {
                viewName = "overview";
        }
        
        // Update navigation
        document.querySelectorAll(".nav-btn").forEach((btn) => {
                btn.classList.remove("active");
        });
        document.querySelectorAll(`[data-view="${viewName}"]`).forEach((btn) => {
                btn.classList.add("active");
        });
        
        // Update view sections
        document.querySelectorAll(".view-section").forEach((section) => {
                section.classList.remove("active");
        });
        
        const targetView = document.getElementById(viewName + "View");
        if (targetView) {
                targetView.classList.add("active");
        }
        
        currentView = viewName;
        
        // Load specific view data
        switch (viewName) {
                case "stats":
                loadStatistics();
                break;
                case "overview":
                // Reset overview filters UI to match current filter state
                document.querySelectorAll("#overviewView .filter-btn").forEach((btn) => btn.classList.remove("active"));
                document.querySelector(`#overviewView [data-filter="${overviewFilters.status}"]`)?.classList.add("active");
                document.querySelectorAll("#overviewView .type-filter").forEach((btn) => btn.classList.remove("active"));
                document.querySelector(`#overviewView .type-filter[data-type="${overviewFilters.type}"]`)?.classList.add("active");
                renderOverview();
                break;
                case "pending":
                // Reset pending filters UI to match current filter state
                document.querySelectorAll("#pendingView .type-filter").forEach((btn) => btn.classList.remove("active"));
                document.querySelector(`#pendingView .type-filter[data-type="${pendingFilters.type}"]`)?.classList.add("active");
                renderPending();
                break;
                case "room":
                updateRoomCounts();
                break;
                case "add":
                resetForm();
                break;
        }
        
        if (targetView) {
                targetView.classList.add("fade-in");
        }
}

// Load all entries from backend
async function loadEntries() {
        try {
                showToast("Loading entries...", "info");
                
                const entries = await api.getAllEntries();
                
                console.log("Data received from server:", entries);
                
                currentEntries = entries || [];
                console.log("Loaded entries:", currentEntries);
                
                updateUI();
                showToast("Entries loaded successfully", "success");
                } catch (error) {
                console.error("Error loading entries:", error);
                showToast("Error loading entries: " + error.message, "error");
                currentEntries = [];
        }
}

// Update all UI components
function updateUI() {
        updateRoomCounts();
        if (currentView === "overview") {
                renderOverview();
                } else if (currentView === "pending") {
                renderPending();
        }
        loadStatistics();
}

// Update room zone counters
function updateRoomCounts() {
        const typeCounts = {};
        
        // Count all non-pending entries (includes unknown-dates, in-progress, and completed)
        currentEntries
        .filter((entry) => entry.status !== "pending")
        .forEach((entry) => {
                typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
        });
        
        document.querySelectorAll(".zone-count").forEach((counter) => {
                const type = counter.getAttribute("data-type");
                const newCount = typeCounts[type] || 0;
                const oldCount = parseInt(counter.textContent) || 0;
                
                counter.textContent = newCount;
                
                // Add animation if count changes
                if (newCount !== oldCount) {
                        counter.classList.add("slide-up");
                        setTimeout(() => counter.classList.remove("slide-up"), 600);
                }
        });
}

// Render timeline with current filters
function renderTimeline() {
        const container = document.getElementById("timelineContainer");
        container.innerHTML = "";
        
        let filteredEntries = currentEntries.filter((entry) => {
                // Status filter
                if (currentFilters.status === "in-progress" && entry.status !== "in-progress" && entry.status !== "in-progress-no-dates") {
                        return false;
                }
                if (currentFilters.status === "completed" && entry.status !== "completed") {
                        return false;
                }
                
                // Type filter
                if (currentFilters.type !== "all" && entry.type !== currentFilters.type) {
                        return false;
                }
                
                return true;
        });
        
        // Sort by creation date (newest first)
        filteredEntries.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
        
        if (filteredEntries.length === 0) {
                container.innerHTML = `
                <div class="empty-state">
                <i class="fas fa-inbox" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No entries found</h3>
                <p>Add some media entries to get started!</p>
                </div>
                `;
                return;
        }
        
        filteredEntries.forEach((entry, index) => {
                const card = createMediaCard(entry);
                container.appendChild(card);
                
                // Stagger animation
                setTimeout(() => {
                        card.classList.add("slide-up");
                }, index * 50);
        });
}

// Pending view functions
function renderPending() {
        console.log(`=== RENDER PENDING DEBUG START ===`);
        
        const container = document.getElementById("pendingContainer");
        if (!container) {
                console.error("Pending container not found");
                return;
        }
        
        container.innerHTML = "";
        
        let pendingEntries = currentEntries.filter((entry) => entry.status === "pending");
        
        console.log(`Total entries: ${currentEntries.length}`);
        console.log(`Pending entries found: ${pendingEntries.length}`);
        console.log(`Current entries before filtering:`, currentEntries.map(e => ({id: e.id, status: e.status, hyperating: e.hyperating})));
        console.log(`Pending entries after filtering:`, pendingEntries.map(e => ({id: e.id, status: e.status, hyperating: e.hyperating})));
        
        // Apply search filter
        const searchInput = document.getElementById("pendingSearch");
        const searchTerm = searchInput?.value.toLowerCase() || "";
        if (searchTerm) {
                pendingEntries = pendingEntries.filter(
                        (entry) => entry.title.toLowerCase().includes(searchTerm) || (entry.tags && entry.tags.toLowerCase().includes(searchTerm)) || (entry.author && entry.author.toLowerCase().includes(searchTerm))
                );
        }
        
        // Apply type filter using pendingFilters
        if (pendingFilters.type !== "all") {
                pendingEntries = pendingEntries.filter((entry) => entry.type === pendingFilters.type);
        }
        
        // Apply sorting based on pendingSort
        pendingEntries.sort((a, b) => {
                switch (pendingSort) {
                        case "created-desc":
                        return new Date(b.createdat) - new Date(a.createdat);
                        case "created-asc":
                        return new Date(a.createdat) - new Date(b.createdat);
                        case "title-asc":
                        return a.title.localeCompare(b.title);
                        case "title-desc":
                        return b.title.localeCompare(a.title);
                        case "hyperating-desc":
                        const hypeA = parseInt(a.hyperating) || 0;
                        const hypeB = parseInt(b.hyperating) || 0;
                        return hypeB - hypeA;
                        case "hyperating-asc":
                        const hypeAscA = parseInt(a.hyperating) || 0;
                        const hypeAscB = parseInt(b.hyperating) || 0;
                        return hypeAscA - hypeAscB;
                        default:
                        return new Date(b.createdat) - new Date(a.createdat);
                }
        });
        
        // Rest remains the same...
        if (pendingEntries.length === 0) {
                container.innerHTML = `
                <div class="empty-state">
                <i class="fas fa-clock" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No pending items</h3>
                <p>Add content you want to consume later!</p>
                </div>
                `;
                return;
        }
        
        pendingEntries.forEach((entry, index) => {
                const card = createPendingCard(entry);
                container.appendChild(card);
                
                setTimeout(() => {
                        card.classList.add("slide-up");
                }, index * 50);
        });
}

function createPendingCard(entry) {
        const card = document.createElement("div");
        card.className = "pending-card";
        card.setAttribute("data-entry-id", entry.id);
        card.setAttribute("data-type", entry.type);
        
        const coverImage = entry.coverurl || getPlaceholderImage(entry.type, entry.title);
        const tags = entry.tags ? entry.tags.split(",").map((tag) => tag.trim()) : [];
        
        card.innerHTML = `
        <div class="card-cover">
        <img src="${coverImage}" alt="${entry.title}" class="cover-image" 
        onerror="this.src='${getPlaceholderImage(entry.type, entry.title)}'">
        </div>
        <div class="card-content">
        <div class="pending-header-row">
        <h3 class="card-title">${entry.title}</h3>
        <button class="start-btn" onclick="startPendingItem(event, '${entry.id}')" title="Start This Item">
        <i class="fas fa-play"></i>
        </button>
        </div>
        <div class="card-meta">
        <span class="type-badge ${entry.type}">${capitalizeFirst(entry.type)}</span>
        </div>
        ${generateHypeRatingDisplay(entry.hyperating, true)}
        ${
                tags.length > 0
                ? `
                <div class="tags-container">
                ${tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
                </div>
                `
                : ""
        }
        ${entry.notes ? `<p class="card-notes">${entry.notes}</p>` : ""}
        </div>
        `;
        
        card.addEventListener("click", (e) => {
                if (!e.target.closest(".start-btn")) {
                        openEntryModal(entry);
                }
        });
        
        return card;
}

async function startPendingItem(event, entryId) {
        event.stopPropagation();
        
        try {
                const result = await api.startPendingEntry(entryId);
                
                if (result.success) {
                        // Update local data
                        const entry = currentEntries.find((e) => e.id === entryId);
                        if (entry) {
                                entry.startdate = new Date().toISOString();
                                entry.status = "in-progress";
                        }
                        
                        renderPending();
                        updateRoomCounts();
                        showToast("Item started! Added to your active collection.", "success");
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error starting pending item:", error);
                showToast("Error: " + error.message, "error");
        }
}

// Update renderTimeline to renderOverview
function renderOverview() {
        console.log(`=== RENDER OVERVIEW DEBUG START ===`);
        
        const container = document.getElementById("overviewContainer");
        if (!container) {
                console.error("Overview container not found");
                return;
        }
        
        container.innerHTML = "";
        
        // Only exclude explicitly pending items
        let filteredEntries = currentEntries.filter((entry) => entry.status !== "pending");
        
        console.log(`Total entries: ${currentEntries.length}`);
        console.log(`Filtered entries (non-pending): ${filteredEntries.length}`);
        console.log(`Current entries before filtering:`, currentEntries.map(e => ({id: e.id, status: e.status, rating: e.rating})));
        
        // Apply search filter
        const searchInput = document.getElementById("overviewSearch");
        const searchTerm = searchInput?.value.toLowerCase() || "";
        if (searchTerm) {
                filteredEntries = filteredEntries.filter(
                        (entry) => entry.title.toLowerCase().includes(searchTerm) || (entry.tags && entry.tags.toLowerCase().includes(searchTerm)) || (entry.author && entry.author.toLowerCase().includes(searchTerm))
                );
        }
        
        // Apply status filters using overviewFilters
        filteredEntries = filteredEntries.filter((entry) => {
                if (overviewFilters.status === "in-progress" && entry.status !== "in-progress" && entry.status !== "in-progress-no-dates") {
                        return false;
                }
                if (overviewFilters.status === "completed" && entry.status !== "completed" && entry.status !== "completed-no-dates") {
                        return false;
                }
                if (overviewFilters.type !== "all" && entry.type !== overviewFilters.type) {
                        return false;
                }
                return true;
        });
        
        // Apply sorting based on overviewSort
        filteredEntries.sort((a, b) => {
                switch (overviewSort) {
                        case "created-desc":
                        return new Date(b.createdat) - new Date(a.createdat);
                        case "created-asc":
                        return new Date(a.createdat) - new Date(b.createdat);
                        case "title-asc":
                        return a.title.localeCompare(b.title);
                        case "title-desc":
                        return b.title.localeCompare(a.title);
                        case "startdate-desc":
                        if (!a.startdate) return 1;
                        if (!b.startdate) return -1;
                        return new Date(b.startdate) - new Date(a.startdate);
                        case "startdate-asc":
                        if (!a.startdate) return 1;
                        if (!b.startdate) return -1;
                        return new Date(a.startdate) - new Date(b.startdate);
                        case "finishdate-desc":
                        if (!a.finishdate) return 1;
                        if (!b.finishdate) return -1;
                        return new Date(b.finishdate) - new Date(a.finishdate);
                        case "finishdate-asc":
                        if (!a.finishdate) return 1;
                        if (!b.finishdate) return -1;
                        return new Date(a.finishdate) - new Date(b.finishdate);
                        case "rating-desc":
                        const ratingA = typeof a.rating === 'number' ? a.rating : 0;
                        const ratingB = typeof b.rating === 'number' ? b.rating : 0;
                        return ratingB - ratingA;
                        case "rating-asc":
                        const ratingAscA = typeof a.rating === 'number' ? a.rating : 0;
                        const ratingAscB = typeof b.rating === 'number' ? b.rating : 0;
                        return ratingAscA - ratingAscB;
                        default:
                        return new Date(b.createdat) - new Date(a.createdat);
                }
        });
        
        if (filteredEntries.length === 0) {
                container.innerHTML = `
                <div class="empty-state">
                <i class="fas fa-inbox" style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>No entries found</h3>
                <p>Add some media entries to get started!</p>
                </div>
                `;
                return;
        }
        
        filteredEntries.forEach((entry, index) => {
                const card = createMediaCard(entry);
                container.appendChild(card);
                
                setTimeout(() => {
                        card.classList.add("slide-up");
                }, index * 50);
        });
}

// Create a media card element
function createMediaCard(entry) {
        const card = document.createElement("div");
        card.className = "media-card";
        card.setAttribute("data-entry-id", entry.id);
        card.setAttribute("data-status", entry.status);
        card.setAttribute("data-type", entry.type);
        
        const coverImage = entry.coverurl || getPlaceholderImage(entry.type, entry.title);
        const notesIcon = entry.notes ? `<i class="fas fa-sticky-note notes-indicator" title="Has Notes"></i>` : "";
        
        // Enhanced date display for different item types
        let dateDisplay = "";
        if (entry.status === "unknown-dates" || entry.status === "completed-no-dates" || entry.status === "in-progress-no-dates") {
                dateDisplay = '<i class="fas fa-question-circle"></i> Dates not recorded';
                } else if (entry.status === "completed" && !entry.startdate && entry.finishdate) {
                const finishDate = new Date(entry.finishdate).toLocaleDateString();
                dateDisplay = `<i class="fas fa-flag-checkered"></i> Finished: ${finishDate}`;
                } else if (entry.status === "in-progress") {
                const startDate = entry.startdate ? new Date(entry.startdate).toLocaleDateString() : "Unknown";
                dateDisplay = `<i class="fas fa-play"></i> Started: ${startDate}`;
                } else if (entry.status === "completed" && entry.startdate && entry.finishdate) {
                const startDate = new Date(entry.startdate).toLocaleDateString();
                const finishDate = new Date(entry.finishdate).toLocaleDateString();
                dateDisplay = `<i class="fas fa-calendar"></i> ${startDate} - ${finishDate}`;
        }
        
        // In createMediaCard function, update the rating display logic:
        let ratingDisplay = "";
        const isCompleted = entry.status === "completed" || entry.status === "completed-no-dates";
        
        if (isCompleted) {
                if (typeof entry.rating === "number" && entry.rating > 0) {
                        ratingDisplay = `<span class="rating">${entry.rating} <i class="fas fa-star"></i></span>`;
                        } else {
                        // For completed items without a valid rating, show "Not Rated"
                        ratingDisplay = `<span class="rating" style="color: var(--text-muted); font-size: 0.8rem;">Not Rated</span>`;
                }
                } else {
                // For in-progress items without a valid rating, show "Pending Rating"
                if (typeof entry.rating === "number" && entry.rating > 0) {
                        ratingDisplay = `<span class="rating">${entry.rating} <i class="fas fa-star"></i></span>`;
                        } else {
                        ratingDisplay = `<span class="rating" style="color: var(--accent-warning); font-size: 0.8rem;">Pending Rating</span>`;
                }
        }
        
        card.innerHTML = `
        <div class="card-cover">
        <img src="${coverImage}" alt="${entry.title}" class="cover-image" onerror="this.src='${getPlaceholderImage(entry.type, entry.title)}'">
        </div>
        <div class="card-content">
        <div class="card-header">
        <h3 class="card-title">${entry.title}</h3>
        ${
                entry.status === "in-progress" || entry.status === "in-progress-no-dates"
                ? `<button class="card-finish-btn" onclick="markAsFinished(event, '${entry.id}')" title="Mark as Finished"><i class="fas fa-check"></i></button>`
                : ""
        }
        </div>
        ${entry.author ? `<p class="card-author"><i class="fas fa-user-edit"></i> ${entry.author}</p>` : ""}
        <div class="card-dates">${dateDisplay}</div>
        <div class="card-meta">
        <span class="type-badge ${entry.type}">${capitalizeFirst(entry.type)}</span>
        <span>${notesIcon}${ratingDisplay}</span>
        </div>
        </div>
        `;
        
        card.addEventListener("click", () => openEntryModal(entry));
        return card;
}


// Filter functions
function setStatusFilter(status) {
        overviewFilters.status = status;
        
        // Update UI - only overview status buttons
        document.querySelectorAll("#overviewView .filter-btn").forEach((btn) => {
                btn.classList.remove("active");
        });
        document.querySelector(`#overviewView [data-filter="${status}"]`)?.classList.add("active");
        
        if (currentView === "overview") {
                renderOverview();
        }
}

function setTypeFilter(type) {
        if (currentView === "overview") {
                overviewFilters.type = type;
                
                // Only update overview type filters
                document.querySelectorAll("#overviewView .type-filter").forEach((btn) => {
                        btn.classList.remove("active");
                });
                
                const overviewButton = document.querySelector(`#overviewView .type-filter[data-type="${type}"]`);
                if (overviewButton) {
                        overviewButton.classList.add("active");
                }
                
                renderOverview();
                } else if (currentView === "pending") {
                pendingFilters.type = type;
                
                // Only update pending type filters
                document.querySelectorAll("#pendingView .type-filter").forEach((btn) => {
                        btn.classList.remove("active");
                });
                
                const pendingButton = document.querySelector(`#pendingView .type-filter[data-type="${type}"]`);
                if (pendingButton) {
                        pendingButton.classList.add("active");
                }
                
                renderPending();
        }
}

function filterByType(type) {
        setTypeFilter(type);
}

// Mark entry as finished - Updated for no-dates items
// Mark entry as finished - Unified for all in-progress items
async function markAsFinished(event, entryId) {
        event.stopPropagation();
        
        const entry = currentEntries.find((e) => e.id === entryId);
        if (!entry) return;
        
        // All in-progress items get marked as finished the same way
        showToast("Marking as finished...", "info", 1500);
        
        let newStatus;
        const updateData = {
                finishDate: new Date().toISOString(),
        };
        
        if (entry.status === "in-progress-no-dates") {
                newStatus = "completed-no-dates";
                } else if (entry.status === "in-progress") {
                newStatus = "completed";
                } else {
                return; // Already completed
        }
        
        updateData.status = newStatus;
        
        try {
                const result = await api.updateEntry(entryId, updateData);
                
                if (result.success) {
                        entry.finishdate = updateData.finishDate;
                        entry.status = updateData.status;
                        
                        renderOverview();
                        updateRoomCounts();
                        showToast("Item marked as finished! You can add a rating if you want.", "success");
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error marking as finished:", error);
                showToast("Error: " + error.message, "error");
        }
}

/**
        * Fallback to placeholder image for an entry
*/
async function fallbackToPlaceholder(entryId) {
        event.stopPropagation();
        
        console.log(`=== FRONTEND FALLBACK TO PLACEHOLDER DEBUG START ===`);
        console.log(`Entry ID: ${entryId}`);
        
        const entry = currentEntries.find((e) => e.id === entryId);
        if (!entry) return;
        
        // Store original state for verification
        const originalStatus = entry.status;
        const originalRating = entry.rating;
        
        console.log(`ORIGINAL FRONTEND STATE:`);
        console.log(`Status: '${originalStatus}'`);
        console.log(`Rating: '${originalRating}'`);
        console.log(`Full entry object:`, entry);
        
        showToast("Generating placeholder image...", "info", 1500);
        
        try {
                // Generate placeholder locally (static version - no backend API)
                const placeholderURL = generateQualityPlaceholder(entry.title, entry.type);
                
                console.log(`GENERATED PLACEHOLDER URL: ${placeholderURL}`);
                
                // Update entry with placeholder
                const updateData = { coverurl: placeholderURL };
                const result = await api.updateEntry(entryId, updateData);
                
                console.log(`ENTRY UPDATE RESULT:`, result);
                
                if (result.success) {
                        console.log(`SUCCESS - Checking for unauthorized changes...`);
                        
                        // Update the entry in the current entries array
                        entry.coverurl = placeholderURL;
                        
                        // SECURITY CHECK: Ensure status and rating haven't changed
                        if (entry.status !== originalStatus) {
                                console.error(`🚨 FRONTEND FALLBACK: Status changed from ${originalStatus} to ${entry.status} during placeholder update!`);
                                console.error(`This suggests backend is modifying status without permission!`);
                                // Revert the status change
                                entry.status = originalStatus;
                                console.error(`Status reverted to: ${entry.status}`);
                        }
                        
                        if (entry.rating !== originalRating) {
                                console.error(`🚨 FRONTEND FALLBACK: Rating changed from ${originalRating} to ${entry.rating} during placeholder update!`);
                                console.error(`This suggests backend is modifying rating without permission!`);
                                // Revert the rating change
                                entry.rating = originalRating;
                                console.error(`Rating reverted to: ${entry.rating}`);
                        }
                        
                        console.log(`FINAL FRONTEND STATE:`);
                        console.log(`Status: '${entry.status}'`);
                        console.log(`Rating: '${entry.rating}'`);
                        console.log(`Cover URL: '${entry.coverurl}'`);
                        
                        // Check which view will be rendered
                        const targetView = entry.status === 'pending' ? 'renderPending()' : 'renderOverview()';
                        console.log(`Will call: ${targetView}`);
                        
                        // Re-render the appropriate view based on entry status
                        if (entry.status === 'pending') {
                                console.log(`Calling renderPending()...`);
                                renderPending();
                                } else {
                                console.log(`Calling renderOverview()...`);
                                renderOverview();
                        }
                        updateRoomCounts();
                        showToast("Placeholder image applied successfully!", "success");
                        
                        console.log(`=== FRONTEND FALLBACK TO PLACEHOLDER DEBUG END ===`);
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error falling back to placeholder:", error);
                console.log(`=== FRONTEND FALLBACK TO PLACEHOLDER DEBUG END (ERROR) ===`);
                showToast("Error: " + error.message, "error");
        }
}

/**
        * Request new cover for an entry (especially for books)
*/
async function requestNewCover(entryId) {
        event.stopPropagation();
        
        console.log(`=== FRONTEND COVER UPDATE DEBUG START ===`);
        console.log(`Entry ID: ${entryId}`);
        
        const entry = currentEntries.find((e) => e.id === entryId);
        if (!entry) return;
        
        // Store original state for verification
        const originalStatus = entry.status;
        const originalRating = entry.rating;
        
        console.log(`ORIGINAL FRONTEND STATE:`);
        console.log(`Status: '${originalStatus}'`);
        console.log(`Rating: '${originalRating}'`);
        console.log(`Full entry object:`, entry);
        
        showToast("Generating alternative cover...", "info", 2000);
        
        try {
                // Generate placeholder locally (static version - no backend API)
                const placeholderURL = generateQualityPlaceholder(entry.title, entry.type);
                
                console.log(`GENERATED ALTERNATIVE COVER URL: ${placeholderURL}`);
                
                // Update entry with placeholder
                const updateData = { coverurl: placeholderURL };
                const result = await api.updateEntry(entryId, updateData);
                
                console.log(`ENTRY UPDATE RESULT:`, result);
                
                if (result.success) {
                        console.log(`SUCCESS - Checking for unauthorized changes...`);
                        
                        // CRITICAL FIX: Verify no unintended changes occurred
                        console.log(`Cover update result:`, result);
                        console.log(`Original status: ${originalStatus}, Original rating: ${originalRating}`);
                        
                        // Update only the cover URL, preserve all other data
                        entry.coverurl = placeholderURL;
                        
                        // SECURITY CHECK: Ensure status and rating haven't changed
                        if (entry.status !== originalStatus) {
                                console.error(`🚨 FRONTEND: Status changed from ${originalStatus} to ${entry.status} during cover update!`);
                                console.error(`This suggests backend is modifying status without permission!`);
                                // Revert the status change
                                entry.status = originalStatus;
                                console.error(`Status reverted to: ${entry.status}`);
                        }
                        
                        if (entry.rating !== originalRating) {
                                console.error(`🚨 FRONTEND: Rating changed from ${originalRating} to ${entry.rating} during cover update!`);
                                console.error(`This suggests backend is modifying rating without permission!`);
                                // Revert the rating change
                                entry.rating = originalRating;
                                console.error(`Rating reverted to: ${entry.rating}`);
                        }
                        
                        console.log(`FINAL FRONTEND STATE:`);
                        console.log(`Status: '${entry.status}'`);
                        console.log(`Rating: '${entry.rating}'`);
                        console.log(`Cover URL: '${entry.coverurl}'`);
                        
                        // Check which view will be rendered
                        const targetView = entry.status === 'pending' ? 'renderPending()' : 'renderOverview()';
                        console.log(`Will call: ${targetView}`);
                        
                        // Re-render the appropriate view based on entry status
                        if (entry.status === 'pending') {
                                console.log(`Calling renderPending()...`);
                                renderPending();
                                } else {
                                console.log(`Calling renderOverview()...`);
                                renderOverview();
                        }
                        updateRoomCounts();
                        showToast("New cover found and applied!", "success");
                        
                        console.log(`=== FRONTEND COVER UPDATE DEBUG END ===`);
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error requesting new cover:", error);
                console.log(`=== FRONTEND COVER UPDATE DEBUG END (ERROR) ===`);
                showToast("Error: " + error.message, "error");
        }
}

async function submitRating(isNotRated = false) {
        if (!ratingEntryId) return;
        
        const ratingValue = isNotRated
        ? 0 // Use 0 as the signal for "Not Rated"
        : parseInt(document.getElementById("modalRating").value);
        
        const entryData = {
                finishDate: new Date().toISOString(),
                rating: ratingValue,
                status: "completed",
        };
        
        const btn = document.getElementById("submitRatingBtn");
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        try {
                const result = await api.updateEntry(ratingEntryId, entryData);
                
                if (result.success) {
                        const entry = currentEntries.find((e) => e.id === ratingEntryId);
                        if (entry) {
                                entry.finishdate = entryData.finishDate;
                                entry.rating = isNotRated ? "N/A" : ratingValue;
                                entry.status = "completed";
                        }
                        
                        closeRatingModal();
                        renderOverview();
                        updateRoomCounts();
                        loadStatistics();
                        
                        // --- THIS IS THE FIX ---
                        // Use a different message depending on the action taken.
                        const message = isNotRated ? 'Entry marked as "Not Rated".' : "Rating saved successfully!";
                        showToast(message, "success");
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error updating rating:", error);
                showToast("Error: " + error.message, "error");
                } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
        }
}

// Form handling
function setupForm() {
        // Update rating display
        updateRatingDisplay();
}

function updateRatingDisplay() {
        const ratingInput = document.getElementById("rating");
        const ratingValue = parseInt(ratingInput.value);
        
        // --- THIS IS THE FIX ---
        // Display 'N/A' when slider is at 0
        const displayValue = ratingValue === 0 ? "N/A" : ratingValue;
        document.getElementById("ratingValue").textContent = displayValue;
        
        const starsContainer = document.getElementById("ratingStars");
        starsContainer.innerHTML = "";
        
        // When rating is 0, this loop correctly shows 10 empty stars
        for (let i = 1; i <= 10; i++) {
                const star = document.createElement("span");
                star.className = `star ${i <= ratingValue ? "" : "empty"}`;
                star.innerHTML = "★";
                starsContainer.appendChild(star);
        }
}

async function handleFormSubmission(e) {
        e.preventDefault();
        
        const finishDateValue = document.getElementById("finishDate").value;
        
        const formData = {
                title: document.getElementById("title").value.trim(),
                type: document.getElementById("type").value,
                author: document.getElementById("authorFullWidth").value.trim(),
                startDate: document.getElementById("startDate").value,
                finishDate: finishDateValue,
                notes: document.getElementById("notes").value.trim(),
                isFinished: document.getElementById("isFinished")?.checked || false,
                rating: finishDateValue || isFinished ? parseInt(document.getElementById("rating").value) : null,
        };
        
        // Basic validation
        if (!formData.title || !formData.type) {
                showFormFeedback("Please fill in all required fields (title and type)", "error");
                return;
        }
        
        // Date validation if both are provided
        if (formData.startDate && formData.finishDate) {
                const startDate = new Date(formData.startDate);
                const finishDate = new Date(formData.finishDate);
                if (finishDate < startDate) {
                        showFormFeedback("Finish date must be after start date", "error");
                        return;
                }
        }
        
        // Disable form
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitBtn.disabled = true;
        
        try {
                const result = await api.addMediaEntry(formData);
                
                if (result.success) {
                        showFormFeedback("toast_entry_added", "success"); // Pass the KEY
                        resetForm();
                        loadEntries(); // Reload entries
                        
                        // Switch to timeline view
                        setTimeout(() => {
                                switchView("timeline");
                        }, 1000);
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error adding entry:", error);
                showFormFeedback("Error: " + error.message, "error");
                } finally {
                // Re-enable form
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
        }
}

function resetForm() {
        document.getElementById("addEntryForm").reset();
        document.getElementById("startDate").value = "";
        document.getElementById("rating").value = 0; // Start at 0, not 5
        document.getElementById("ratingSection").style.display = "flex"; // Show by default
        updateRatingDisplay();
        updateFormBasedOnDates(); // Call this to set proper labels
        
        // Always hide author field after reset - it will only show when type is changed to "book"
        document.getElementById("authorSection").style.display = "none";
        document.getElementById("authorSectionFullWidth").style.display = "none";
        
        clearFormFeedback();
}

function showFormFeedback(message, type) {
        const feedback = document.getElementById("formFeedback");
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
        feedback.style.display = "block";
        
        if (type === "success") {
                setTimeout(clearFormFeedback, 3000);
        }
}

function clearFormFeedback() {
        const feedback = document.getElementById("formFeedback");
        feedback.style.display = "none";
        feedback.textContent = "";
        feedback.className = "form-feedback";
}

// Statistics
async function loadStatistics() {
        try {
                const stats = await api.getStatistics();
                
                updateStatisticsDisplay(stats);
                } catch (error) {
                console.error("Error loading statistics:", error);
                // Use local data as fallback
                const localStats = calculateLocalStatistics();
                updateStatisticsDisplay(localStats);
        }
}

function calculateLocalStatistics() {
        const stats = {
                total: currentEntries.length,
                inProgress: currentEntries.filter((e) => e.status === "in-progress").length,
                completed: currentEntries.filter((e) => e.status === "completed").length,
                byType: {},
                averageRating: 0,
                recentActivity: currentEntries.slice(0, 5),
        };
        
        // Calculate by type
        currentEntries.forEach((entry) => {
                stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
        });
        
        // Calculate average rating
        const ratingsSum = currentEntries.reduce((sum, entry) => sum + (entry.rating || 0), 0);
        stats.averageRating = currentEntries.length > 0 ? (ratingsSum / currentEntries.length).toFixed(1) : 0;
        
        return stats;
}

function updateStatisticsDisplay(stats) {
        // Update stat cards
        document.getElementById("totalEntries").textContent = stats.total || 0;
        document.getElementById("inProgressCount").textContent = stats.inProgress || 0;
        document.getElementById("completedCount").textContent = stats.completed || 0;
        document.getElementById("averageRating").textContent = stats.averageRating || 0;
        
        // Update type chart
        updateTypeChart(stats.byType || {});
        
        // Update recent activity
        updateRecentActivity(stats.recentActivity || []);
}

function updateTypeChart(typeData) {
        const canvas = document.getElementById("typeChart");
        const ctx = canvas.getContext("2d");
        
        // Clear existing chart
        if (window.typeChart instanceof Chart) {
                window.typeChart.destroy();
        }
        
        const types = Object.keys(typeData);
        const counts = Object.values(typeData);
        
        if (types.length === 0) {
                ctx.fillStyle = "#71717a";
                ctx.font = "16px Inter";
                ctx.textAlign = "center";
                ctx.fillText("No data available", canvas.width / 2, canvas.height / 2);
                return;
        }
        
        const colors = {
                videogame: "#3b82f6",
                film: "#ef4444",
                series: "#06b6d4",
                book: "#8b5cf6",
                paper: "#10b981",
        };
        
        const backgroundColors = types.map((type) => colors[type] || "#6b7280");
        
        window.typeChart = new Chart(ctx, {
                type: "doughnut",
                data: {
                        labels: types.map(capitalizeFirst),
                        datasets: [
                                {
                                        data: counts,
                                        backgroundColor: backgroundColors,
                                        borderColor: "#1a1a1a",
                                        borderWidth: 2,
                                },
                        ],
                },
                options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                                legend: {
                                        position: "bottom",
                                        labels: {
                                                color: currentTheme === "dark" ? "#ffffff" : "#1e293b",
                                                padding: 20,
                                                usePointStyle: true,
                                        },
                                },
                        },
                },
        });
}

function updateRecentActivity(activities) {
        const container = document.getElementById("recentActivity");
        container.innerHTML = "";
        
        if (activities.length === 0) {
                container.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No recent activity</p>';
                return;
        }
        
        activities.forEach((entry) => {
                const activityItem = document.createElement("div");
                activityItem.className = "activity-item";
                
                const icon = getTypeIcon(entry.type);
                const timeAgo = getTimeAgo(entry.createdat);
                
                activityItem.innerHTML = `
                <div class="activity-icon" style="color: ${getTypeColor(entry.type)}">
                <i class="${icon}"></i>
                </div>
                <div class="activity-content">
                <div class="activity-title">${entry.title}</div>
                <div class="activity-meta">
                ${capitalizeFirst(entry.type)} • Added ${timeAgo}
                </div>
                </div>
                `;
                
                activityItem.addEventListener("click", () => openEntryModal(entry));
                container.appendChild(activityItem);
        });
}

// Modal functions
function openEntryModal(entry) {
        console.log(`=== OPEN ENTRY MODAL DEBUG ===`);
        console.log(`Entry received:`, entry);
        console.log(`Entry object keys:`, Object.keys(entry));
        console.log(`Entry.hyperating:`, entry.hyperating);
        
        // Check all possible hype rating field names
        Object.keys(entry).forEach(key => {
                if (key.toLowerCase().includes('hype')) {
                        console.log(`Found hype-related field: ${key} = ${entry[key]}`);
                }
        });
        
        currentEntryId = entry.id;
        const modal = document.getElementById("entryModal");
        const modalBody = document.getElementById("modalBody");
        
        // Always reset to view mode when opening
        modal.querySelector(".modal-content").classList.remove("is-editing");
        
        // --- RENDER MODAL CONTENT ---
        // This function now builds the entire inner HTML for the modal body,
        // including both view-mode elements and hidden edit-mode inputs.
        
        const coverImage = entry.coverurl || getPlaceholderImage(entry.type, entry.title);
        const metadata = typeof entry.metadata === "string" ? JSON.parse(entry.metadata || "{}") : entry.metadata || {};
        
        const ratingValue = entry.rating || 5;
        
        // CRITICAL FIX: Use correct field name based on debugging output
        const hypeRatingValue = entry.hyperating || 7;
        
        console.log(`=== HYPE RATING DEBUG ===`);
        console.log(`entry.hyperating: ${entry.hyperating}`);
        console.log(`hypeRatingValue being used: ${hypeRatingValue}`);
        
        // Helper to format date for input fields
        const formatDateForInput = (dateString) => (dateString ? new Date(dateString).toISOString().split("T")[0] : "");
        
        modalBody.innerHTML = `
        <input type="hidden" id="editEntryId" value="${entry.id}">
        <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
        <div class="modal-cover view-mode">
        <div style="position: relative; display: inline-block;">
        <img src="${coverImage}" alt="${entry.title}" style="width: 200px; height: auto; border-radius: 8px; box-shadow: var(--shadow-lg);">
        <div class="modal-cover-options">
        <button type="button" class="cover-option-btn fallback" onclick="fallbackToPlaceholder('${entry.id}')" title="Use placeholder image">
        <i class="fas fa-image"></i>
        Use Placeholder
        </button>
        ${entry.type === 'book' ? `
                <button type="button" class="cover-option-btn refresh" onclick="requestNewCover('${entry.id}')" title="Get new cover from alternative sources">
                <i class="fas fa-refresh"></i>
                New Cover
                </button>
        ` : ''}
        </div>
        </div>
        </div>
        
        <div class="modal-info" style="flex: 1; min-width: 250px;">
        <!-- Title -->
        <h3 class="view-mode">${entry.title}</h3>
        <div class="form-group edit-mode">
        <label for="editTitle">Title *</label>
        <input type="text" id="editTitle" class="form-control" value="${entry.title}" required>
        </div>
        
        <!-- Type -->
        <div class="view-mode" style="margin-bottom: 1rem;"><span class="type-badge ${entry.type}">${capitalizeFirst(entry.type)}</span></div>
        <div class="form-group edit-mode">
        <label for="editType">Type *</label>
        <select id="editType" class="form-control" required>
        <option value="videogame" ${entry.type === "videogame" ? "selected" : ""}>🎮 Video Game</option>
        <option value="film" ${entry.type === "film" ? "selected" : ""}>🎬 Film</option>
        <option value="series" ${entry.type === "series" ? "selected" : ""}>📺 TV Series</option>
        <option value="book" ${entry.type === "book" ? "selected" : ""}>📚 Book</option>
        <option value="paper" ${entry.type === "paper" ? "selected" : ""}>📄 Scientific Paper</option>
        </select>
        </div>
        
        <!-- Author (conditional) -->
        ${
                entry.type === "book"
                ? `
                <div class="view-mode">
                ${entry.author ? `<p><strong>Author:</strong> ${entry.author}</p>` : ""}
                </div>
                <div class="form-group edit-mode">
                <label for="editAuthor">Author</label>
                <input type="text" id="editAuthor" value="${entry.author || ""}">
                </div>
                `
                : ""
        }
        
        <!-- Active/Completed Section -->
        <div class="edit-section-active" style="${entry.status === "pending" ? "display:none;" : ""}">
        <div class="modal-dates view-mode">
        ${(() => {
                // Enhanced modal content for different item types
                if (entry.status === "completed-no-dates") {
                        return `
                        <p><strong>Status:</strong> <span style="color: var(--accent-success);">Finished (dates not recorded)</span></p>
                        <p style="color: var(--text-secondary); font-size: 0.9em; margin-top: 0.5em; font-style: italic;">
                        This item was completed but start/finish dates weren't recorded.
                        </p>
                        `;
                        } else if (entry.status === "in-progress-no-dates") {
                        return `
                        <p><strong>Status:</strong> <span style="color: var(--accent-warning);">In Progress (dates not recorded)</span></p>
                        <p style="color: var(--text-secondary); font-size: 0.9em; margin-top: 0.5em; font-style: italic;">
                        This item is in progress but dates aren't being tracked.
                        </p>
                        `;
                        } else if (entry.status === "completed" && !entry.startdate && entry.finishdate) {
                        return `
                        <p><strong>Finished:</strong> ${formatDate(entry.finishdate)}</p>
                        <p style="color: var(--text-secondary); font-size: 0.9em; margin-top: 0.5em; font-style: italic;">
                        Start date was not recorded for this item.
                        </p>
                        `;
                        } else if (entry.status === "in-progress" && entry.startdate) {
                        return `
                        <p><strong>Started:</strong> ${formatDate(entry.startdate)}</p>
                        <p style="color: var(--text-secondary); font-size: 0.9em; margin-top: 0.5em; font-style: italic;">
                        Currently in progress.
                        </p>
                        `;
                        } else if (entry.status === "completed" && entry.startdate && entry.finishdate) {
                        return `
                        <p><strong>Started:</strong> ${formatDate(entry.startdate)}</p>
                        <p><strong>Finished:</strong> ${formatDate(entry.finishdate)}</p>
                        `;
                        } else {
                        // Fallback
                        return `
                        ${entry.startdate ? `<p><strong>Started:</strong> ${formatDate(entry.startdate)}</p>` : ""}
                        ${entry.finishdate ? `<p><strong>Finished:</strong> ${formatDate(entry.finishdate)}</p>` : ""}
                        `;
                }
        })()}
        </div>
        <div class="form-row edit-mode">
        <div class="form-group">
        <label for="editStartDate">Start Date</label>
        <input type="date" id="editStartDate" value="${formatDateForInput(entry.startdate)}">
        </div>
        <div class="form-group">
        <label for="editFinishDate">Finish Date</label>
        <input type="date" id="editFinishDate" value="${formatDateForInput(entry.finishdate)}">
        </div>
        </div>
        <div class="view-mode">
        ${(() => {
                // Show rating for all completed items (regardless of date recording)
                const isCompleted = entry.status === "completed" || entry.status === "completed-no-dates";
                if (!isCompleted) return "";
                
                if (typeof entry.rating === "number" && entry.rating > 0) {
                        return `<div class="modal-rating">
                        <p><strong>Rating:</strong> ${entry.rating}/10</p>
                        <div class="modal-rating-stars">
                        ${"★".repeat(entry.rating)}${"☆".repeat(10 - entry.rating)}
                        </div>
                        </div>`;
                        } else {
                        // For completed items without a valid rating, show "Not Rated"
                        return `<div class="modal-rating">
                        <p><strong>Rating:</strong> <span style="color: var(--text-muted);">Not Rated</span></p>
                        </div>`;
                }
        })()}
        </div>
        <div class="form-group edit-mode">
        <label for="editRating">Rating (0 for N/A)</label>
        <div class="rating-container">
        <input type="range" id="editRating" min="0" max="10" value="${entry.rating === "N/A" ? 0 : entry.rating || 5}">
        <span id="editRatingValue" class="rating-value">${entry.rating === "N/A" ? "N/A" : entry.rating || 5}</span>
        </div>
        </div>
        </div>
        
        <!-- Pending Section -->
        <div class="edit-section-pending" style="${entry.status !== "pending" ? "display:none;" : ""}">
        <div class="view-mode">
        ${entry.hyperating ? `
                <div style="margin: 10px 0; display: flex; align-items: center; gap: 8px;">
                <strong>Hype:</strong>
                <div style="
                display: flex;
                align-items: center;
                gap: 4px;
                position: relative;
                ">
                <!-- Fire emojis positioned properly -->
                <span style="
                position: relative;
                display: flex;
                align-items: center;
                gap: 2px;
                margin-right: 4px;
                ">
                <span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate;">🔥</span>
                ${entry.hyperating >= 8 ? '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.2s;">🔥</span>' : ''}
                ${entry.hyperating >= 10 ? '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.4s;">🔥</span>' : ''}
                </span>
                
                <!-- Orange rating box with contained shine effect -->
                <span style="
                background: linear-gradient(135deg, #ff6200, #ff9500, #ff6200);
                background-size: 200% 200%;
                color: white;
                padding: 4px 8px;
                border-radius: 6px;
                font-weight: 700;
                font-size: 12px;
                min-width: 40px;
                text-align: center;
                border: 2px solid rgba(255, 94, 0, 0.3);
                box-shadow: 0 0 15px rgba(255, 94, 0, 0.4);
                animation: hypeGlow 3s ease-in-out infinite alternate;
                position: relative;
                overflow: hidden;
                ">${entry.hyperating}/10
                <!-- Contained shine effect -->
                <span style="
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
                animation: hypeShine 4s ease-in-out infinite;
                "></span>
                </span>
                </div>
                </div>
        ` : ""}
        ${entry.tags ? `<p><strong>Tags:</strong> ${entry.tags}</p>` : ""}
        </div>
        <div class="form-group edit-mode">
        <label for="editTags">Tags</label>
        <input type="text" id="editTags" value="${entry.tags || ""}">
        </div>
        <div class="form-group edit-mode">
        <label for="editHypeRating">Hype Rating (1-10)</label>
        <!-- CRITICAL FIX: Use rating-container for consistency with other bars -->
        <div class="rating-container">
        <input type="range" id="editHypeRating" min="1" max="10" value="${hypeRatingValue}">
        
        <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        position: relative;
        ">
        <!-- Fire emojis positioned properly -->
        <span style="
        position: relative;
        display: flex;
        align-items: center;
        gap: 2px;
        margin-right: 4px;
        " id="editHypeRatingFire">
        <span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate;">🔥</span>
        ${hypeRatingValue >= 8 ? '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.2s;">🔥</span>' : ''}
        ${hypeRatingValue >= 10 ? '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.4s;">🔥</span>' : ''}
        </span>
        
        <!-- Orange rating box with contained shine effect -->
        <span style="
        background: linear-gradient(135deg, #ff6200, #ff9500, #ff6200);
        background-size: 200% 200%;
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 12px;
        min-width: 40px;
        text-align: center;
        border: 2px solid rgba(255, 94, 0, 0.3);
        box-shadow: 0 0 15px rgba(255, 94, 0, 0.4);
        animation: hypeGlow 3s ease-in-out infinite alternate;
        position: relative;
        overflow: hidden;
        " id="editHypeRatingValue">${hypeRatingValue}/10
        <!-- Contained shine effect -->
        <span style="
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
        animation: hypeShine 4s ease-in-out infinite;
        "></span>
        </span>
        </div>
        </div>
        </div>
        </div>
        
        <!-- Notes -->
        <div class="modal-notes">
        <!-- This header only appears in VIEW mode -->
        <div class="modal-section-header view-mode">
        <h4 style="margin:0; padding:0; border:0;">Notes</h4>
        <button type="button" id="editNotesBtn" class="btn-icon" onclick="toggleNotesEdit(true)" title="Edit Notes">
        <i class="fas fa-pencil-alt"></i>
        </button>
        </div>
        
        <!-- The main edit form's label, only visible in full EDIT mode -->
        <p class="edit-mode"><strong>Notes:</strong></p>
        
        <!-- Display text (visible in view mode) -->
        <p id="modalNotesText" class="view-mode" style="white-space: pre-wrap; color: var(--text-secondary);">${entry.notes || "<i>No notes.</i>"}</p>
        
        <!-- Quick-edit textarea (initially hidden) -->
        <textarea id="modalNotesTextarea" class="view-mode" style="display: none; width: 100%; min-height: 100px; resize: vertical;"></textarea>
        <div id="modalNotesActions" class="view-mode" style="display: none; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" class="btn-secondary" onclick="toggleNotesEdit(false)">Cancel</button>
        <button type="button" class="btn-primary" onclick="saveNotes()">Save Note</button>
        </div>
        
        <!-- Main edit form's textarea (visible in full EDIT mode) -->
        <div class="form-group edit-mode">
        <textarea id="editNotes" rows="4">${entry.notes || ""}</textarea>
        </div>
        </div>
        <!-- End of Notes section -->
        </div>
        </div>
        `;
        
        // Update modal title separately (since it's in the header)
        const modalTitleEl = document.getElementById("modalTitle");
        modalTitleEl.innerHTML = `${entry.title} ${entry.notes ? `<i class="fas fa-sticky-note notes-indicator" title="Has Notes"></i>` : ""}`;
        modal.classList.add("show");
        
        // Add event listeners for sliders inside the modal
        const editRating = document.getElementById("editRating");
        if (editRating) {
                editRating.addEventListener("input", (e) => {
                        const displayValue = e.target.value === "0" ? "N/A" : e.target.value;
                        document.getElementById("editRatingValue").textContent = displayValue;
                });
        }
        
        const editHypeRating = document.getElementById("editHypeRating");
        if (editHypeRating) {
                editHypeRating.addEventListener("input", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const value = e.target.value;
                        
                        // Update the rating value display
                        const ratingValueElement = document.getElementById("editHypeRatingValue");
                        if (ratingValueElement) {
                                ratingValueElement.innerHTML = value + '/10' + `
                                <!-- Contained shine effect -->
                                <span style="
                                position: absolute;
                                top: 0;
                                left: -100%;
                                width: 100%;
                                height: 100%;
                                background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
                                animation: hypeShine 4s ease-in-out infinite;
                                "></span>
                                `;
                        }
                        
                        // Update fire effect based on hype rating value
                        const fireElement = document.getElementById("editHypeRatingFire");
                        if (fireElement) {
                                fireElement.innerHTML = `
                                <span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate;">🔥</span>
                                ${value >= 8 ? '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.2s;">🔥</span>' : ''}
                                ${value >= 10 ? '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.4s;">🔥</span>' : ''}
                                `;
                        }
                });
                
                // Prevent form submission when interacting with slider
                editHypeRating.addEventListener("change", (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                });
        }
}

// Add this new function after the openEntryModal function
function updateEditModeStatus() {
        const startDate = document.getElementById("editStartDate").value;
        const finishDate = document.getElementById("editFinishDate").value;
        const rating = parseInt(document.getElementById("editRating").value);
        
        let newStatus;
        if (!startDate && !finishDate) {
                // No dates - use rating to determine status
                newStatus = rating > 0 ? "completed-no-dates" : "in-progress-no-dates";
                } else if (!startDate && finishDate) {
                newStatus = "completed";
                } else if (startDate && !finishDate) {
                newStatus = "in-progress";
                } else {
                newStatus = "completed";
        }
        
        return newStatus;
}

function closeModal() {
        document.getElementById("entryModal").classList.remove("show");
        // Ensure we exit edit mode when closing
        document.getElementById("entryModal").querySelector(".modal-content").classList.remove("is-editing");
        currentEntryId = null;
}

function toggleEntryEdit(isEditing) {
        const modalContent = document.getElementById("entryModal").querySelector(".modal-content");
        if (isEditing) {
                modalContent.classList.add("is-editing");
                } else {
                modalContent.classList.remove("is-editing");
        }
}

function toggleNotesEdit(isEditing) {
        const notesText = document.getElementById("modalNotesText");
        const notesTextarea = document.getElementById("modalNotesTextarea");
        const editBtn = document.getElementById("editNotesBtn");
        const notesActions = document.getElementById("modalNotesActions");
        
        if (isEditing) {
                // Get raw text from the current data to avoid showing the "No notes" placeholder
                const currentEntry = currentEntries.find((e) => e.id === currentEntryId);
                notesTextarea.value = currentEntry.notes || "";
                
                notesText.style.display = "none";
                editBtn.style.display = "none";
                notesTextarea.style.display = "block";
                notesActions.style.display = "flex";
                notesTextarea.focus();
                } else {
                notesText.style.display = "block";
                editBtn.style.display = "block";
                notesTextarea.style.display = "none";
                notesActions.style.display = "none";
        }
}

async function saveNotes() {
        if (!currentEntryId) return;
        
        const newNotes = document.getElementById("modalNotesTextarea").value.trim();
        const updateData = { notes: newNotes };
        
        const saveBtn = document.querySelector("#modalNotesActions .btn-primary");
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        try {
                const result = await api.updateEntry(currentEntryId, updateData);
                
                if (result.success) {
                        // Update local data store
                        const entry = currentEntries.find((e) => e.id === currentEntryId);
                        if (entry) {
                                entry.notes = newNotes;
                        }
                        
                        // Update all three places the notes are displayed/edited
                        document.getElementById("modalNotesText").innerHTML = newNotes || "<i>No notes.</i>";
                        document.getElementById("modalNotesTextarea").value = newNotes;
                        document.getElementById("editNotes").value = newNotes; // Sync with main edit form
                        
                        toggleNotesEdit(false);
                        showToast("Notes updated successfully!", "success");
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error saving notes:", error);
                showToast("Error: " + error.message, "error");
                } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
        }
}

async function saveEntryChanges(event) {
        console.log(`=== SAVE ENTRY CHANGES DEBUG START ===`);
        console.log(`Event type: ${event.type}`);
        console.log(`Event target:`, event.target);
        console.log(`Event submitter:`, event.submitter);
        
        // CRITICAL FIX: Add loading state to save button
        const submitButton = event.submitter;
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        // Check if this is a legitimate save attempt
        const submitter = event.submitter;
        if (submitter && (submitter.classList.contains('cover-option-btn') || 
                submitter.textContent.includes('Placeholder') || 
        submitter.textContent.includes('New Cover'))) {
        console.error(`🚨 ABORTING SAVE: Cover button triggered form submission!`);
        console.error(`This should not happen - buttons should have type="button"`);
        event.preventDefault();
        return;
        }
        
        event.preventDefault();
        
        const entryId = document.getElementById("editEntryId").value;
        const entry = currentEntries.find((e) => e.id === entryId);
        
        if (!entry) {
                showToast("Entry not found", "error");
                return;
        }
        
        console.log(`Original entry state:`, entry);
        console.log(`Original status: '${entry.status}'`);
        console.log(`Original rating: '${entry.rating}'`);
        
        // CRITICAL FIX: Preserve pending status unless explicitly changed
        let newStatus;
        if (entry.status === "pending") {
                // Keep pending entries as pending unless dates are set
                const startDate = document.getElementById("editStartDate").value;
                const finishDate = document.getElementById("editFinishDate").value;
                if (startDate || finishDate) {
                        // User has set dates - calculate appropriate status
                        newStatus = updateEditModeStatus();
                        console.log(`Pending entry with dates set - calculating new status: '${newStatus}'`);
                        } else {
                        // No dates set - keep as pending
                        newStatus = "pending";
                        console.log(`Pending entry with no dates - keeping status as 'pending'`);
                }
                } else {
                // Non-pending entry - use normal status calculation
                newStatus = updateEditModeStatus();
                console.log(`Non-pending entry - calculating new status: '${newStatus}'`);
        }
        
        const updateData = {
                title: document.getElementById("editTitle").value,
                type: document.getElementById("editType").value,
                startDate: document.getElementById("editStartDate").value || null,
                finishDate: document.getElementById("editFinishDate").value || null,
                notes: document.getElementById("editNotes").value,
                status: newStatus,
        };
        
        // CRITICAL FIX: Only include rating for non-pending entries
        if (entry.status !== "pending") {
                updateData.rating = document.getElementById("editRating").value === "0" ? "0" : parseInt(document.getElementById("editRating").value);
        }
        
        console.log(`Initial updateData:`, updateData);
        
        // Add author if it's a book
        const authorField = document.getElementById("editAuthor");
        if (authorField) {
                updateData.author = authorField.value;
        }
        
        // Handle status updates for no-dates items based on rating AND current status
        // CRITICAL FIX: Skip this logic for pending entries
        if (entry.status !== "pending" && !updateData.startDate && !updateData.finishDate) {
                console.log(`No dates detected on non-pending entry - applying rating-based status logic...`);
                // Keep the item as completed-no-dates if it already is, regardless of rating
                if (entry.status === "completed-no-dates") {
                        updateData.status = "completed-no-dates";
                        console.log(`→ Keeping existing completed-no-dates status`);
                        } else if (updateData.rating && updateData.rating !== 0) {
                        updateData.status = "completed-no-dates";
                        console.log(`→ Setting to completed-no-dates (has rating > 0)`);
                        } else {
                        updateData.status = "in-progress-no-dates";
                        console.log(`→ Setting to in-progress-no-dates (no rating or rating = 0)`);
                }
                } else if (entry.status === "pending") {
                console.log(`Pending entry detected - preserving pending status`);
                updateData.status = "pending";
        }
        
        // Add pending-specific fields if it was a pending item
        const tagsField = document.getElementById("editTags");
        const hypeRatingField = document.getElementById("editHypeRating");
        if (tagsField) updateData.tags = tagsField.value;
        
        // CRITICAL DEBUGGING: Log hype rating field details
        console.log(`=== DEBUGGING HYPE RATING ===`);
        console.log(`hypeRatingField element:`, hypeRatingField);
        console.log(`hypeRatingField exists: ${!!hypeRatingField}`);
        if (entry.status === "pending") {
                console.log(`hypeRatingField.value: '${hypeRatingField.value}'`);
                console.log(`hypeRatingField.type: '${hypeRatingField.type}'`);
                console.log(`parseInt(hypeRatingField.value): ${parseInt(hypeRatingField.value)}`);
        }
        
        if (entry.status === "pending") {
                const hypeRatingValue = parseInt(hypeRatingField.value);
                updateData.hyperating = hypeRatingValue; // CRITICAL FIX: Use correct field name
                console.log(`Setting hyperating to: ${hypeRatingValue}`);
                } else {
                console.log(`WARNING: hypeRatingField not found! hyperating will not be set.`);
        }
        
        console.log(`Final updateData being sent:`, updateData);
        console.log(`Original status: '${entry.status}' → Final status: '${updateData.status}'`);
        console.log(`Original rating: '${entry.rating}' → Final rating: '${updateData.rating}'`);
        console.log(`Original hyperating: '${entry.hyperating}' → Final hyperating: '${updateData.hyperating}'`);
        
        try {
                const result = await api.updateEntry(entryId, updateData);
                
                if (result.success) {
                        // CRITICAL FIX: Update local data properly for pending entries
                        if (entry.status === "pending") {
                                // For pending entries, preserve the pending status and update only the hype rating
                                const oldHyperating = entry.hyperating;
                                entry.hyperating = updateData.hyperating;
                                entry.status = "pending"; // Ensure status remains pending
                                
                                // CRITICAL FIX: Also update the entry in currentEntries array
                                const entryInCurrentEntries = currentEntries.find(e => e.id === entry.id);
                                if (entryInCurrentEntries) {
                                        entryInCurrentEntries.hyperating = updateData.hyperating;
                                        entryInCurrentEntries.status = "pending";
                                }
                                
                                console.log(`=== PENDING ENTRY UPDATE DEBUG ===`);
                                console.log(`Updated pending entry hyperating from ${oldHyperating} to: ${updateData.hyperating}`);
                                console.log(`Entry after update:`, entry);
                                console.log(`Entry.hyperating: ${entry.hyperating}`);
                                console.log(`Entry.status: ${entry.status}`);
                                
                                // Verify the entry is still in currentEntries array
                                console.log(`Entry found in currentEntries:`, !!entryInCurrentEntries);
                                if (entryInCurrentEntries) {
                                        console.log(`Entry in array hyperating: ${entryInCurrentEntries.hyperating}`);
                                }
                                } else {
                                // For non-pending entries, use normal update logic
                                Object.assign(entry, updateData);
                                entry.status = newStatus;
                                
                                // Also update in currentEntries array for consistency
                                const entryInCurrentEntries = currentEntries.find(e => e.id === entry.id);
                                if (entryInCurrentEntries) {
                                        Object.assign(entryInCurrentEntries, updateData);
                                        entryInCurrentEntries.status = newStatus;
                                }
                        }
                        
                        toggleEntryEdit(false);
                        closeModal();
                        
                        // Refresh the current view
                        console.log(`About to refresh views. currentView: ${currentView}`);
                        if (currentView === "overview") renderOverview();
                        if (currentView === "pending") {
                                console.log(`Calling renderPending()...`);
                                renderPending();
                        }
                        updateRoomCounts();
                        
                        showToast("Entry updated successfully", "success");
                        console.log(`=== SAVE ENTRY CHANGES DEBUG END ===`);
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error updating entry:", error);
                console.log(`=== SAVE ENTRY CHANGES DEBUG END (ERROR) ===`);
                showToast("Error: " + error.message, "error");
                } finally {
                // CRITICAL FIX: Always restore button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
        }
}

async function deleteCurrentEntry() {
        if (!currentEntryId) return;
        
        if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
                return;
        }
        
        try {
                const result = await api.deleteEntry(currentEntryId);
                
                if (result.success) {
                        currentEntries = currentEntries.filter((e) => e.id !== currentEntryId);
                        closeModal();
                        updateUI();
                        showToast("Entry deleted successfully", "success");
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error deleting entry:", error);
                showToast("Error: " + error.message, "error");
        }
}

// Theme functions
function toggleTheme() {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", currentTheme);
        localStorage.setItem("theme", currentTheme);
        updateThemeIcon();
}

function updateThemeIcon() {
        const themeBtn = document.querySelector(".theme-toggle i");
        themeBtn.className = currentTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// Toast notifications
function showToast(message, type = "info", duration = 3000) {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        const icons = {
                success: "fas fa-check-circle",
                error: "fas fa-exclamation-circle",
                warning: "fas fa-exclamation-triangle",
                info: "fas fa-info-circle",
        };
        
        toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
        </div>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add("show"), 100);
        
        // Hide and remove toast
        setTimeout(() => {
                toast.classList.remove("show");
                setTimeout(() => container.removeChild(toast), 300);
        }, duration);
}

// Keyboard shortcuts
function handleKeyboardShortcuts(e) {
        // Allow browser function keys to work normally
        if (e.key === 'F5' || e.key === 'F12' || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.key === 'R')) {
                return; // Don't prevent default behavior for refresh and dev tools
        }
        
        // Ctrl/Cmd + K: Add new entry
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                switchView("add");
                document.getElementById("title").focus();
        }
        
        // Ctrl/Cmd + Enter: Submit form (when in add entry view)
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                // Check if we're in the add entry view and the form is visible
                const addView = document.getElementById("add-view");
                const addForm = document.getElementById("addEntryForm");
                if (addView && addView.classList.contains("active") && addForm) {
                        e.preventDefault();
                        handleFormSubmission(e);
                }
        }
        
        // Escape: Close modal
        if (e.key === "Escape") {
                const entryModal = document.getElementById("entryModal");
                if (entryModal.classList.contains("show")) {
                        closeModal();
                }
        }
        
        // Number keys: Switch views
        if (e.key >= "1" && e.key <= "5" && !e.target.matches("input, textarea")) {
                const views = ["room", "timeline", "pending", "stats", "add"];
                switchView(views[parseInt(e.key) - 1]);
        }
}


// Form tab switching
function switchFormTab(formType) {
        document.querySelectorAll(".form-tab").forEach((tab) => tab.classList.remove("active"));
        document.querySelector(`[data-form="${formType}"]`).classList.add("active");
        
        if (formType === "direct") {
                document.getElementById("addEntryForm").style.display = "block";
                document.getElementById("addPendingForm").style.display = "none";
                } else {
                document.getElementById("addEntryForm").style.display = "none";
                document.getElementById("addPendingForm").style.display = "block";
        }
}

// Pending form handling
document.getElementById("addPendingForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = {
                title: document.getElementById("pendingTitle").value.trim(),
                type: document.getElementById("pendingType").value,
                tags: document.getElementById("pendingTags").value.trim(),
                hypeRating: parseInt(document.getElementById("pendingHype").value),
                notes: document.getElementById("pendingNotes").value.trim(),
        };
        
        // CRITICAL FIX: Add author field for books
        const authorField = document.getElementById("pendingAuthor");
        if (authorField && authorField.value.trim()) {
                formData.author = authorField.value.trim();
        }
        
        if (!formData.title || !formData.type) {
                showFormFeedback("Please fill in title and type", "error");
                return;
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        submitBtn.disabled = true;
        
        try {
                const result = await api.addPendingEntry(formData);
                
                if (result.success) {
                        showFormFeedback("Added to pending list!", "success");
                        resetPendingForm();
                        loadEntries();
                        
                        setTimeout(() => switchView("pending"), 1000);
                        } else {
                        throw new Error(result.error);
                }
                } catch (error) {
                console.error("Error adding pending entry:", error);
                showFormFeedback("Error: " + error.message, "error");
                } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
        }
});

function resetPendingForm() {
        document.getElementById("addPendingForm").reset();
        document.getElementById("pendingHype").value = 5;
        document.getElementById("pendingHypeValue").textContent = "5/10";
        
        // CRITICAL FIX: Hide author field when resetting form
        const authorSection = document.getElementById("pendingAuthorSection");
        if (authorSection) {
                authorSection.style.display = "none";
        }
}

// Update pending hype rating display
document.getElementById("pendingHype").addEventListener("input", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const value = e.target.value;
        
        // Update the rating value display
        const ratingValueElement = document.getElementById("pendingHypeValue");
        if (ratingValueElement) {
                ratingValueElement.innerHTML = value + '/10' + `
                <!-- Contained shine effect -->
                <span style="
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%);
                animation: hypeShine 4s ease-in-out infinite;
                "></span>
                `;
        }
        
        // Update fire effect based on hype rating value
        const fireElement = document.getElementById("pendingHypeFire");
        if (fireElement) {
                // Show 1 fire for values 1-7, 2 fires for 8-9, 3 fires for 10
                let fireHTML = '';
                if (value >= 1) {
                        fireHTML += '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate;">🔥</span>';
                }
                if (value >= 8) {
                        fireHTML += '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.2s;">🔥</span>';
                }
                if (value >= 10) {
                        fireHTML += '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.4s;">🔥</span>';
                }
                
                fireElement.querySelector('span').innerHTML = fireHTML;
        }
});

// Prevent form submission when interacting with pending hype slider
document.getElementById("pendingHype").addEventListener("change", (e) => {
        e.preventDefault();
        e.stopPropagation();
});

// CRITICAL FIX: Show/hide author field based on media type
document.getElementById("pendingType").addEventListener("change", (e) => {
        const selectedType = e.target.value;
        const authorSection = document.getElementById("pendingAuthorSection");
        
        if (selectedType === "book") {
                // Show author field for books
                authorSection.style.display = "flex";
                console.log("Showing author field for book type");
                } else {
                // Hide author field for other types
                authorSection.style.display = "none";
                // Clear author field when hiding
                const authorField = document.getElementById("pendingAuthor");
                if (authorField) {
                        authorField.value = "";
                }
                console.log("Hiding author field for non-book type:", selectedType);
        }
});

// Search functionality
document.getElementById("pendingSearch").addEventListener(
        "input",
        debounce(() => {
                if (currentView === "pending") renderPending();
        }, 300)
);

document.getElementById("overviewSearch").addEventListener(
        "input",
        debounce(() => {
                if (currentView === "overview") renderOverview();
        }, 300)
);

// Overview sort dropdown event listener
document.getElementById("overviewSort").addEventListener(
        "change",
        () => {
                overviewSort = document.getElementById("overviewSort").value;
                if (currentView === "overview") renderOverview();
        }
);

// Pending sort dropdown event listener
document.getElementById("pendingSort").addEventListener(
        "change",
        () => {
                pendingSort = document.getElementById("pendingSort").value;
                if (currentView === "pending") renderPending();
        }
);

// Debounce utility
function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
                const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
        };
}

// Update global exports
window.switchFormTab = switchFormTab;
window.startPendingItem = startPendingItem;

// Export functions for global access
window.initializeApp = initializeApp;
window.switchView = switchView;
window.markAsFinished = markAsFinished;
window.resetForm = resetForm;
window.toggleTheme = toggleTheme;
window.closeModal = closeModal;
window.deleteCurrentEntry = deleteCurrentEntry;
window.openSidenav = openSidenav;
window.closeSidenav = closeSidenav;
window.toggleEntryEdit = toggleEntryEdit;
window.saveEntryChanges = saveEntryChanges;
window.toggleNotesEdit = toggleNotesEdit; // Add this line
window.saveNotes = saveNotes; // Add this line

// Initialize app when page loads
document.addEventListener("DOMContentLoaded", function () {
        initializeApp();
});