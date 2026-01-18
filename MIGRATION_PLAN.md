# MIGRATION_PLAN.md

## A. Immutable Overview

### Project Summary
A multimedia diary web application that tracks and manages various types of media content including:
- Video games
- Films
- TV series
- Books
- Scientific papers

The application provides multiple views:
- **Room**: Visual dashboard with clickable zones representing different media categories
- **Overview**: Timeline view of all entries with filtering and sorting
- **Pending**: Watchlist of items to consume later with hype ratings
- **Stats**: Statistics and activity charts
- **Add Entry**: Form for adding new media entries

### Original Architecture
**Backend (Google Apps Script)**
- `code.gs` (25,694 bytes)
  - Main server functions (doGet, include)
  - Google Sheets CRUD operations
  - Entry management (add, update, delete, mark finished)
  - CSV export/import functionality
  - Backup and audit logging

- `metadata.gs` (24,874 bytes)
  - External API integrations
  - Google Books API for books
  - OMDb API for movies and TV series
  - RAWG API for video games
  - CrossRef API for scientific papers
  - Metadata fetching and cover image handling

- `utils.gs` (55,793 bytes)
  - Utility functions (date formatting, validation)
  - Input sanitization
  - Entry validation
  - CSV import/export helpers
  - User preferences management

**Frontend (Monolithic HTML + Embedded JS/CSS)**
- `index.html` (25,854 bytes)
  - Complete HTML structure
  - Five main views (room, overview, pending, stats, add)
  - Navigation and UI components
  - Embedded inline event handlers

- `styles.css` (55,793 bytes)
  - CSS custom properties (theme system)
  - Complete styling for all components
  - Responsive design patterns
  - Animations and transitions

- `js/main.js` (main application logic - partial read)
  - View switching and navigation
  - Data rendering (overview, pending, room)
  - Form handling
  - Event listeners

- `js/api.js` (mock API for local development)
  - Google Apps Script API abstraction layer

- `js/config.js` (global state management)
  - Application state variables
  - Filter and sort configurations

- `js/utils.js` (frontend utilities)
  - Helper functions (formatting, display generators)
  - Placeholder image generation
  - Metadata formatting

**Data Storage (Google Sheets)**
- Primary sheet: `MediaEntries` with columns:
  - ID, Title, Type, Author, StartDate, FinishDate, Rating, Notes
  - CoverURL, Metadata, CreatedAt, Status, Tags, HypeRating

- Support sheets:
  - `AuditLog` (user action tracking)
  - `Preferences` (user settings)
  - Backup sheets (timestamped backups)

### Target Architecture
**Static Web Project Structure**
```
md-refactored-static/
├── index.html                    # Main HTML structure
├── css/
│   └── styles.css               # Extracted and organized CSS
├── js/
│   ├── main.js                 # Application logic
│   ├── data.js                # CSV data handling layer
│   ├── api.js                 # Browser-compatible API abstraction
│   ├── config.js              # Global state management
│   └── utils.js              # Utility functions
├── data/
│   ├── entries.csv            # Primary data file
│   └── preferences.json      # User preferences (optional)
└── assets/
    └── images/              # Static assets (if any)
```

**Data Storage (CSV Files)**
- `entries.csv` - Primary data store mirroring Google Sheets structure
- No backend dependencies
- All data operations in browser

### Non-Goals (What Will NOT Change)
- **UI/UX Design**: All visual elements, colors, layouts, animations remain identical
- **User Experience**: All interactions, workflows, and user behaviors preserved
- **Data Structure**: Schema remains the same (14 columns)
- **Feature Set**: All features (room view, filters, statistics, etc.) are retained
- **Metadata Integration**: External API calls will be stubbed with clear documentation (browser CORS limitations)
- **Business Logic**: All validation rules, status calculations, and sorting logic preserved

---

## B. Stepwise Migration Plan

### Step 1 — Create Target Directory Structure and Copy Files
**Goal**: Establish the foundation of the static project and verify all source files are accessible.

**Inputs**:
- Cloned repository at `/home/z/md-refactored`

**Outputs**:
- New directory structure at `/home/z/md-refactored-static`
- All original files copied to new location
- Initial migration manifest

**Files Affected**:
- New: `/home/z/md-refactored-static/` (root directory)
- New: `/home/z/md-refactored-static/css/`
- New: `/home/z/md-refactored-static/js/`
- New: `/home/z/md-refactored-static/data/`
- New: `/home/z/md-refactored-static/assets/`

**Validation Criteria**:
- [ ] All directories created successfully
- [ ] All original files copied (index.html, styles.css, all .gs files, js/*)
- [ ] File integrity verified (byte counts match)
- [ ] Migration manifest created and populated

---

### Step 2 — Extract CSS into Dedicated Stylesheet Directory
**Goal**: Move CSS from inline and current location to organized CSS directory.

**Inputs**:
- `index.html` (any inline styles)
- `styles.css` (current monolithic stylesheet)

**Outputs**:
- `/home/z/md-refactored-static/css/styles.css` (organized CSS)
- `index.html` updated to reference new CSS location

**Files Affected**:
- Modify: `index.html` (update CSS link tag)
- Move/Create: `css/styles.css` (reorganized with section comments)

**Validation Criteria**:
- [ ] CSS file moved to css/ directory
- [ ] index.html link tag updated: `<link rel="stylesheet" href="css/styles.css">`
- [ ] No inline styles remain in HTML
- [ ] CSS organized with clear section headers (/* === SECTION NAME === */)

---

### Step 3 — Extract Inline JavaScript from index.html
**Goal**: Remove any inline JavaScript event handlers from HTML and migrate to main.js.

**Inputs**:
- `index.html` (with inline handlers like `onclick="openSidenav()"`)

**Outputs**:
- Clean `index.html` with no inline JavaScript
- `js/main.js` with extracted event handlers properly attached

**Files Affected**:
- Modify: `index.html` (remove inline handlers, add data attributes if needed)
- Modify: `js/main.js` (add event listeners via addEventListener)

**Validation Criteria**:
- [ ] No `onclick`, `onchange`, `onsubmit` attributes remaining in HTML
- [ ] All inline JavaScript moved to js/main.js
- [ ] All functionality preserved (click handlers still work)
- [ ] HTML passes validation for inline JavaScript absence

---

### Step 4 — Create Browser-Compatible Data Layer (CSV Reader/Writer)
**Goal**: Implement a JavaScript module that reads and writes CSV files, replacing Google Sheets operations.

**Inputs**:
- Google Sheets schema from `code.gs` (14 columns)
- Data access patterns from existing `js/api.js` and `js/main.js`

**Outputs**:
- `js/data.js` (new file with CSV handling)
- CSV parsing and serialization functions
- Mock data for initial testing

**Files Affected**:
- Create: `js/data.js` (new data layer module)
- Create: `data/entries.csv` (sample data matching schema)

**Validation Criteria**:
- [ ] `js/data.js` implements:
  - `loadEntries()` - reads CSV and returns array of objects
  - `saveEntry(entryData)` - appends new entry to CSV
  - `updateEntry(entryId, updateData)` - modifies existing entry
  - `deleteEntry(entryId)` - removes entry from CSV
- [ ] CSV format matches original schema (14 columns)
- [ ] Sample data file created with 3-5 example entries
- [ ] All functions return promises for async compatibility

---

### Step 5 — Translate Utilities from .gs to Browser JS
**Goal**: Convert Google Apps Script utility functions to browser-compatible JavaScript in `js/utils.js`.

**Inputs**:
- `utils.gs` (all utility functions)
- `metadata.gs` (placeholder generation and related utilities)

**Outputs**:
- Enhanced `js/utils.js` with translated functions
- Documentation of any Apps Script-specific replacements

**Files Affected**:
- Modify: `js/utils.js` (extend with translated utilities)
- Delete: `utils.gs`, `metadata.gs` (after successful translation)

**Validation Criteria**:
- [ ] All pure functions translated:
  - `formatDateString()` - unchanged (works in browser)
  - `sanitizeInput()` - unchanged (works in browser)
  - `validateEntryData()` - unchanged (works in browser)
  - `validatePendingEntryData()` - unchanged (works in browser)
  - `generateUUID()` - replaced with browser equivalent (crypto.randomUUID())
- [ ] Apps Script-specific functions stubbed with comments:
  - `createBackup()` - stubbed (no Google Sheets access)
  - `cleanupBackups()` - stubbed (no Google Sheets access)
  - `getUserPreferences()` - reads from localStorage
  - `saveUserPreferences()` - writes to localStorage
  - `logUserAction()` - console.log only
- [ ] All function signatures preserved
- [ ] No Apps Script APIs referenced

---

### Step 6 — Update API Layer to Use CSV Data Layer
**Goal**: Replace Google Apps Script API calls in `js/api.js` with CSV data layer calls.

**Inputs**:
- Current `js/api.js` (mock implementation)
- New `js/data.js` (CSV data layer from Step 4)
- Backend function signatures from `code.gs`

**Outputs**:
- Updated `js/api.js` with real CSV-based implementation
- Removed mock data, replaced with CSV operations

**Files Affected**:
- Modify: `js/api.js` (implement real data operations)

**Validation Criteria**:
- [ ] All backend functions have browser equivalents:
  - `getAllEntries()` - calls `loadEntries()` from data.js
  - `addMediaEntry(entryData)` - calls `saveEntry()` from data.js
  - `addPendingEntry(entryData)` - calls `saveEntry()` from data.js
  - `startPendingEntry(entryId)` - calls `updateEntry()` from data.js
  - `updateEntry(entryId, updateData)` - calls `updateEntry()` from data.js
  - `markEntryAsFinished(entryId)` - calls `updateEntry()` from data.js
- [ ] Return types match original (success/error objects with same structure)
- [ ] All functions return promises
- [ ] No google.script.run references

---

### Step 7 — Replace Metadata Fetching with Stubs
**Goal**: Create browser-compatible stubs for external API calls due to CORS limitations, with clear documentation.

**Inputs**:
- `metadata.gs` (all API integration functions)
- API documentation for each service (Google Books, OMDb, RAWG, CrossRef)

**Outputs**:
- `js/metadata.js` (new file with stubbed API functions)
- Documentation in code explaining CORS limitations
- Placeholder generation preserved

**Files Affected**:
- Create: `js/metadata.js` (new file)
- Delete: `metadata.gs` (after successful stub creation)
- Modify: `js/api.js` (import and use stubbed metadata functions)

**Validation Criteria**:
- [ ] `js/metadata.js` includes stubbed functions:
  - `fetchMetadata(title, type)` - returns default metadata
  - `fetchBookMetadata(title)` - returns default book metadata
  - `fetchMovieMetadata(title)` - returns default movie metadata
  - `fetchTVMetadata(title)` - returns default TV metadata
  - `fetchGameMetadata(title)` - returns default game metadata
  - `fetchPaperMetadata(title)` - returns default paper metadata
- [ ] All stub functions include comments:
  - Why stubbed (CORS limitations in static hosting)
  - How to enable (proxy server recommendations)
  - Return structure documentation
- [ ] Placeholder generation preserved (`generateQualityPlaceholder()`)
- [ ] `js/api.js` imports and uses `fetchMetadata()` from metadata.js

---

### Step 8 — Update User Preferences to Use localStorage
**Goal**: Replace Google Sheets-based preferences with browser localStorage.

**Inputs**:
- User preference functions from `utils.gs`
- Preference schema (theme, defaultView, notifications, etc.)

**Outputs**:
- Updated preference functions in `js/utils.js`
- localStorage-based storage layer

**Files Affected**:
- Modify: `js/utils.js` (implement localStorage preferences)

**Validation Criteria**:
- [ ] `getUserPreferences()` reads from localStorage
- [ ] `saveUserPreferences(preferences)` writes to localStorage
- [ ] Default preferences defined (theme: 'dark', defaultView: 'room', etc.)
- [ ] Preferences persist across page reloads
- [ ] Migration function to convert old format (if needed)

---

### Step 9 — Create Sample CSV Data File
**Goal**: Generate a comprehensive sample `entries.csv` file that demonstrates all media types and statuses.

**Inputs**:
- Schema from `code.gs` (14 columns)
- Data examples from application features
- Test cases for all edge cases

**Outputs**:
- `data/entries.csv` with representative data

**Files Affected**:
- Create: `data/entries.csv`

**Validation Criteria**:
- [ ] CSV header matches schema exactly:
  `id,title,type,author,startdate,finishdate,rating,notes,coverurl,metadata,createdat,status,tags,hyperating`
- [ ] At least 1 example of each media type (videogame, film, series, book, paper)
- [ ] At least 1 example of each status (pending, in-progress, in-progress-no-dates, completed, completed-no-dates)
- [ ] Entries with and without metadata
- [ ] Entries with and without tags
- [ ] Entries with hype ratings
- [ ] Entries with author fields (books)
- [ ] CSV parses correctly with `js/data.js` parser
- [ ] Total of 10-15 entries for comprehensive testing

---

### Step 10 — Update HTML Script Tags and Asset References
**Goal**: Update all script and link tags in `index.html` to reference new file locations.

**Inputs**:
- Current `index.html` script/link tags
- New directory structure from Step 1

**Outputs**:
- Updated `index.html` with correct asset paths

**Files Affected**:
- Modify: `index.html`

**Validation Criteria**:
- [ ] CSS link: `<link rel="stylesheet" href="css/styles.css">`
- [ ] Script tags in correct order:
  1. `<script src="js/config.js"></script>`
  2. `<script src="js/utils.js"></script>`
  3. `<script src="js/data.js"></script>`
  4. `<script src="js/metadata.js"></script>`
  5. `<script src="js/api.js"></script>`
  6. `<script src="js/main.js"></script>`
- [ ] No absolute paths (all relative)
- [ ] CDNs preserved (FontAwesome, GSAP)
- [ ] All resources load without 404 errors

---

### Step 11 — Clean Up Original .gs Files
**Goal**: Remove all Google Apps Script files after successful translation and migration.

**Inputs**:
- All .gs files (code.gs, metadata.gs, utils.gs)
- Verification that all functionality has been migrated

**Outputs**:
- Clean project directory without .gs files

**Files Affected**:
- Delete: `code.gs`, `metadata.gs`, `utils.gs`
- Create: `ARCHIVE/` (optional backup of .gs files)

**Validation Criteria**:
- [ ] All .gs files moved to ARCHIVE/ or deleted
- [ ] No .gs files remain in root
- [ ] ARCHIVE/ directory contains original files if backup chosen
- [ ] Application still functions without .gs files

---

### Step 12 — Create README.md with Deployment Instructions
**Goal**: Document how to deploy and run the static project on Cloudflare Pages and local static hosting.

**Inputs**:
- Completed static project
- Deployment best practices

**Outputs**:
- `README.md` with comprehensive documentation

**Files Affected**:
- Create: `README.md`

**Validation Criteria**:
- [ ] Project description and features
- [ ] Prerequisites (modern web browser)
- [ ] Local testing instructions (open index.html in browser)
- [ ] Cloudflare Pages deployment instructions
- [ ] Raspberry Pi / local static hosting instructions
- [ ] File structure explanation
- [ ] How to edit data (direct CSV editing or via UI)
- [ ] Browser compatibility notes
- [ ] Known limitations (CORS, no backend)

---

### Step 13 — Final Integration Testing and Bug Fixes
**Goal**: Comprehensive testing of all features and fixing any discovered issues.

**Inputs**:
- Complete static project
- Test scenarios covering all features

**Outputs**:
- Bug fixes applied
- Test report

**Files Affected**:
- Potentially: Any file requiring fixes

**Validation Criteria**:
- [ ] All views render correctly (room, overview, pending, stats, add)
- [ ] Navigation between views works
- [ ] Add entry form works for all media types
- [ ] Pending entries can be started
- [ ] Entries can be updated
- [ ] Entries can be marked as finished
- [ ] Filters work (type, status, search)
- [ ] Sort options work
- [ ] Statistics calculate correctly
- [ ] Room counts update properly
- [ ] Theme toggle works
- [ ] Responsive design works on mobile
- [ ] Data persists across page reloads (CSV saved, localStorage preferences)
- [ ] No console errors
- [ ] All animations and transitions work

---

## C. Progress Log

- [x] Step 1 — Create Target Directory Structure and Copy Files (completed 2025-01-18)
- [x] Step 2 — Extract CSS into Dedicated Stylesheet Directory (completed 2025-01-18)
- [x] Step 3 — Extract Inline JavaScript from index.html (completed 2025-01-18)
- [x] Step 4 — Create Browser-Compatible Data Layer (CSV Reader/Writer) (completed 2025-01-18)
- [ ] Step 5 — Translate Utilities from .gs to Browser JS
- [ ] Step 6 — Update API Layer to Use CSV Data Layer
- [ ] Step 7 — Replace Metadata Fetching with Stubs
- [ ] Step 8 — Update User Preferences to Use localStorage
- [ ] Step 9 — Create Sample CSV Data File
- [ ] Step 10 — Update HTML Script Tags and Asset References
- [ ] Step 11 — Clean Up Original .gs Files
- [ ] Step 12 — Create README.md with Deployment Instructions
- [ ] Step 13 — Final Integration Testing and Bug Fixes
