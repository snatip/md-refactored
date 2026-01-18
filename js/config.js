// Global variables
let currentEntries = [];
let overviewFilters = {
status: "all",
type: "all",
};

let overviewSort = "created-desc"; // Default sort: recently added

let pendingFilters = {
type: "all",
};
let pendingSort = "created-desc"; // Default sort: recently added
let currentView = "room";
let currentTheme = localStorage.getItem("theme") || "dark";
let currentEntryId = null;
let ratingEntryId = null;
