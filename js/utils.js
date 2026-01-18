// ============================================================================
// TRANSLATED UTILITIES FROM utils.gs - Browser-compatible versions
// ============================================================================

/**
 * Format date to consistent string format (YYYY-MM-DD)
 * Translated from utils.gs - works in browser
 */
function formatDateString(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

/**
 * Validate email format
 * Translated from utils.gs - works in browser
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize user input to prevent injection attacks
 * Translated from utils.gs - works in browser
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim() // Remove leading/trailing whitespace
    .substring(0, 1000); // Limit length
}

/**
 * Validate media entry data (updated for pending entries)
 * Translated from utils.gs - works in browser
 */
function validateEntryData(entryData) {
  const errors = [];
  
  // Required fields
  if (!entryData.title || entryData.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!entryData.type || entryData.type.trim() === '') {
    errors.push('Type is required');
  }
  
  // Validate item types based on date combinations
  if (entryData.status === 'unknown-dates' && (entryData.startDate || entryData.finishDate)) {
    errors.push('Unknown-dates items should not have start or finish dates');
  }

  if (entryData.status === 'completed' && !entryData.startDate && !entryData.finishDate) {
    errors.push('Completed items need at least a finish date or both dates');
  }
  
  // Valid types
  const validTypes = ['videogame', 'film', 'series', 'book', 'paper'];
  if (entryData.type && !validTypes.includes(entryData.type.toLowerCase())) {
    errors.push('Invalid content type');
  }
  
  // Valid statuses - updated list
  const validStatuses = ['pending', 'in-progress', 'in-progress-no-dates', 'completed', 'completed-no-dates'];
  if (entryData.status && !validStatuses.includes(entryData.status)) {
    errors.push('Invalid status');
  }

  // Validate status logic
  if (entryData.status === 'completed-no-dates' && (!entryData.rating || entryData.rating === '0' || entryData.rating === 0)) {
    errors.push('Items marked as completed without dates must have a rating');
  }

  if (entryData.status === 'in-progress-no-dates' && entryData.rating && entryData.rating !== '0' && entryData.rating !== 0) {
    errors.push('Items in progress without dates should not have a rating');
  }
  
  // Date validation
  if (entryData.startDate) {
    const startDate = new Date(entryData.startDate);
    if (isNaN(startDate)) {
      errors.push('Invalid start date');
    }
    
    if (entryData.finishDate) {
      const finishDate = new Date(entryData.finishDate);
      if (isNaN(finishDate)) {
        errors.push('Invalid finish date');
      } else if (finishDate < startDate) {
        errors.push('Finish date cannot be before start date');
      }
    }
  }
  
  // Rating validation
  if (entryData.rating !== undefined && entryData.rating !== null && entryData.rating !== '') {
    const rating = parseInt(entryData.rating);
    if (isNaN(rating) || rating < 1 || rating > 10) {
      errors.push('Rating must be between 1 and 10');
    }
  }
  
  // Hype rating validation (for pending items)
  if (entryData.hypeRating !== undefined && entryData.hypeRating !== null && entryData.hypeRating !== '') {
    const hypeRating = parseInt(entryData.hypeRating);
    if (isNaN(hypeRating) || hypeRating < 1 || hypeRating > 10) {
      errors.push('Hype rating must be between 1 and 10');
    }
  }
  
  // Tags validation
  if (entryData.tags && typeof entryData.tags === 'string') {
    const tags = entryData.tags.split(',').map(tag => tag.trim());
    if (tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }
    
    const invalidTags = tags.filter(tag => tag.length > 50);
    if (invalidTags.length > 0) {
      errors.push('Tags must be 50 characters or less');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate pending entry data
 * Translated from utils.gs - works in browser
 */
function validatePendingEntryData(entryData) {
  const errors = [];
  
  // Required fields for pending entries
  if (!entryData.title || entryData.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!entryData.type || entryData.type.trim() === '') {
    errors.push('Type is required');
  }
  
  // Valid types
  const validTypes = ['videogame', 'film', 'series', 'book', 'paper'];
  if (entryData.type && !validTypes.includes(entryData.type.toLowerCase())) {
    errors.push('Invalid content type');
  }
  
  // Hype rating validation
  if (entryData.hypeRating !== undefined && entryData.hypeRating !== null && entryData.hypeRating !== '') {
    const hypeRating = parseInt(entryData.hypeRating);
    if (isNaN(hypeRating) || hypeRating < 1 || hypeRating > 10) {
      errors.push('Hype rating must be between 1 and 10');
    }
  }
  
  // Tags validation
  if (entryData.tags && typeof entryData.tags === 'string') {
    const tags = entryData.tags.split(',').map(tag => tag.trim());
    if (tags.length > 20) {
      errors.push('Maximum 20 tags allowed');
    }
    
    const invalidTags = tags.filter(tag => tag.length > 50);
    if (invalidTags.length > 0) {
      errors.push('Tags must be 50 characters or less');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Generate random UUID for entry IDs
 * Replaced with browser equivalent: crypto.randomUUID()
 * Original in utils.gs used Utilities.getUuid() (Google Apps Script)
 */
function generateUUID() {
  // Use modern browser API if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Clean sensitive data for logging
 * Translated from utils.gs - works in browser
 */
function cleanSensitiveData(data) {
  const cleaned = { ...data };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'email'];
  sensitiveFields.forEach(field => {
    if (cleaned[field]) {
      cleaned[field] = '[REDACTED]';
    }
  });
  
  // Truncate long strings
  Object.keys(cleaned).forEach(key => {
    if (typeof cleaned[key] === 'string' && cleaned[key].length > 200) {
      cleaned[key] = cleaned[key].substring(0, 200) + '... [TRUNCATED]';
    }
  });
  
  return cleaned;
}

/**
 * Validate and sanitize URL
 * Translated from utils.gs - works in browser
 */
function validateURL(url) {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required and must be a string' };
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }
    
    // Block potentially dangerous domains
    const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
    if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return { isValid: false, error: 'Domain not allowed' };
    }
    
    return { isValid: true, cleanUrl: urlObj.toString() };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Parse a single CSV line handling quotes and commas
 * Translated from utils.gs - works in browser
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add final field
  values.push(current.trim());
  
  return values;
}

// ============================================================================
// STUBBED APPS SCRIPT FUNCTIONS - No Google Sheets access in browser
// ============================================================================

/**
 * Create backup of current data
 * STUBBED: No Google Sheets access in static hosting
 * Original in utils.gs created backup sheets in Google Sheets
 * For static version, users should manually backup the CSV file
 */
function createBackup() {
  console.log('Backup functionality stubbed - static hosting has no Google Sheets access');
  console.log('To backup data, manually copy the entries.csv file');
  return {
    success: true,
    message: 'Backup functionality not available in static version. Please manually backup your CSV file.'
  };
}

/**
 * Clean up old backup sheets
 * STUBBED: No Google Sheets access in static hosting
 * Original in utils.gs deleted old backup sheets from Google Sheets
 */
function cleanupBackups() {
  console.log('Backup cleanup functionality stubbed - static hosting has no Google Sheets access');
  return {
    success: true,
    deleted: 0,
    message: 'Backup cleanup not available in static version.'
  };
}

/**
 * Export data to CSV format
 * STUBBED: No Google Apps Script blob support in browser
 * Original in utils.gs used Utilities.newBlob() to create downloadable file
 * For browser version, use data layer to download CSV
 */
function exportToCSV() {
  console.log('Export functionality stubbed - use data layer export instead');
  return {
    success: false,
    error: 'Export not available through this function. Use CSV download from data layer.'
  };
}

/**
 * Import data from CSV
 * PARTIAL TRANSLATION: CSV parsing works in browser
 * Original in utils.gs imported directly to Google Sheets
 * For browser version, use data layer to import CSV
 */
function importFromCSV(csvData) {
  console.log('Import functionality should use data layer instead');
  return {
    success: false,
    error: 'Import not available through this function. Use CSV upload from data layer.'
  };
}

/**
 * Log user action for audit trail
 * STUBBED: No Google Sheets access in static hosting
 * Original in utils.gs wrote to AuditLog sheet in Google Sheets
 * For static version, logging goes to console only
 */
function logUserAction(action, details = {}) {
  try {
    const cleanedDetails = cleanSensitiveData(details);
    console.log(`[AUDIT LOG] ${action}:`, cleanedDetails);
  } catch (error) {
    console.error('Error logging user action:', error);
  }
}

// ============================================================================
// LOCAL STORAGE PREFERENCES - Replaced Google Sheets-based preferences
// ============================================================================

const PREFERENCES_KEY = 'multimedia_diary_preferences';

/**
 * Get user preferences from localStorage
 * TRANSLATED: Now reads from localStorage instead of Google Sheets
 * Original in utils.gs read from UserPreferences sheet
 */
function getUserPreferences() {
  try {
    const storedPrefs = localStorage.getItem(PREFERENCES_KEY);
    
    if (storedPrefs) {
      return JSON.parse(storedPrefs);
    }
    
    // Return default preferences if not found
    return {
      theme: 'dark',
      defaultView: 'room',
      notifications: true,
      autoSave: true,
      showPendingInRoom: false,
      defaultHypeRating: 7,
      maxTagsPerEntry: 10
    };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {
      theme: 'dark',
      defaultView: 'room',
      notifications: true,
      autoSave: true,
      showPendingInRoom: false,
      defaultHypeRating: 7,
      maxTagsPerEntry: 10
    };
  }
}

/**
 * Save user preferences to localStorage
 * TRANSLATED: Now writes to localStorage instead of Google Sheets
 * Original in utils.gs wrote to UserPreferences sheet
 */
function saveUserPreferences(preferences) {
  try {
    const prefsJson = JSON.stringify(preferences);
    localStorage.setItem(PREFERENCES_KEY, prefsJson);
    
    logUserAction('preferences_saved');
    
    return {
      success: true,
      message: 'Preferences saved successfully'
    };
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// PLACEHOLDER GENERATION - Alias for compatibility
// ============================================================================

/**
 * Generate a high-quality placeholder image
 * ALIAS: Points to existing getPlaceholderImage function
 * Original in metadata.gs had this function name
 */
function generateQualityPlaceholder(title, type) {
  return getPlaceholderImage(type, title);
}

// Get placeholder image for content type - Enhanced version with better initial generation
function getPlaceholderImage(type, title) {
        const colors = {
                videogame: "3b82f6",
                film: "ef4444",
                series: "06b6d4",
                book: "8b5cf6",
                paper: "10b981",
        };
        
        const color = colors[type] || "6b7280";
        
        const encodedTitle = encodeURIComponent(title.substring(0, 30).toUpperCase());
        
        return "https://placehold.co/300x450/" + color + "/ffffff?text=" + encodedTitle;
}

// =========================================================================
// HELPER FUNCTIONS - Centralized utilities for consistent UI generation
// =========================================================================

/**
        * Generate intelligent initials from a title for placeholder images
        * Handles edge cases, cleans input, and creates meaningful initials
        * @param {string} title - The title to generate initials from
        * @returns {string} - 2-character initials (or "??" for invalid input)
*/
function generateInitials(title) {
        if (!title || typeof title !== 'string') {
                return "??";
        }
        
        // Clean the title - remove extra whitespace and special characters
        // Preserves Unicode characters (accents, etc.) for international titles
        const cleanTitle = title.trim().replace(/[^\w\s\u00C0-\u017F]/g, '');
        
        if (cleanTitle.length === 0) {
                return "??";
        }
        
        // Split into words for intelligent initial generation
        const words = cleanTitle.split(/\s+/).filter(word => word.length > 0);
        
        if (words.length === 0) {
                return "??";
        }
        
        // Single word: use first 2 characters
        if (words.length === 1) {
                const word = words[0];
                if (word.length >= 2) {
                        return word.substring(0, 2).toUpperCase();
                        } else {
                        return word.toUpperCase().padEnd(2, '?');
                }
        }
        
        // Multiple words: use first character of first two words
        // Example: "Lord of the Rings" → "LR"
        const firstInitial = words[0].charAt(0).toUpperCase();
        const secondInitial = words[1].charAt(0).toUpperCase();
        
        return firstInitial + secondInitial;
}

/**
        * Centralized Hype Rating Display Generator
        * Creates consistent hype rating displays across the application
        * @param {string|number} hypeRating - The hype rating value (1-10)
        * @param {boolean} useSimpleFormat - Whether to use simple format (cards) or enhanced format (modal)
        * @returns {string} - HTML string for the hype rating display
*/
function generateHypeRatingDisplay(hypeRating, useSimpleFormat = false) {
        if (!hypeRating || hypeRating === '' || hypeRating === 'N/A') {
                return '';
        }
        
        const rating = parseInt(hypeRating) || 0;
        
        if (useSimpleFormat) {
                // Simple format for cards - basic fire icon and rating
                return `
                <div class="hype-rating">
                <i class="fas fa-fire"></i>
                <span>${rating}/10</span>
                </div>
                `;
                } else {
                // Enhanced format for modal with animated fire emojis and styling
                return generateEnhancedHypeRating(rating);
        }
}

/**
        * Generate enhanced hype rating with animated fire emojis
        * Used for modal displays where richer visual presentation is desired
        * @param {number} rating - The numeric rating value
        * @returns {string} - HTML string with enhanced styling and animations
*/
function generateEnhancedHypeRating(rating) {
        const fireEmojis = generateFireEmojis(rating);
        const fireContainerStyle = `
        display: flex;
        align-items: center;
        gap: 2px;
        margin-right: 4px;
        `;
        
        const ratingStyle = `
        background: linear-gradient(135deg, #ff6200, #ff9500, #ff6200);
        background-size: 200% 200%;
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-weight: 700;
        width: 50px;
        min-width: 50px;
        text-align: center;
        border: 2px solid rgba(255, 94, 0, 0.3);
        box-shadow: 0 0 15px rgba(255, 94, 0, 0.4);
        animation: hypeGlow 3s ease-in-out infinite alternate;
        position: relative;
        overflow: hidden;
        `;
        
        return `
        <div style="margin: 10px 0; display: flex; align-items: center; gap: 8px;">
        <strong>Hype:</strong>
        <div style="display: flex; align-items: center; gap: 4px; position: relative;">
        <div style="${fireContainerStyle}">
        ${fireEmojis}
        </div>
        <span style="${ratingStyle}">${rating}/10
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
        `;
}

/**
        * Generate fire emojis based on rating level
        * Creates animated fire emojis that scale with the hype rating
        * @param {number} rating - The hype rating value
        * @returns {string} - HTML string with appropriate number of animated fire emojis
*/
function generateFireEmojis(rating) {
        let emojis = '';
        const baseEmoji = '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate;">🔥</span>';
        
        // Scale fire emojis based on rating level
        if (rating >= 10) {
                // Maximum hype: 3 fire emojis with staggered animations
                emojis = baseEmoji + 
                '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.2s;">🔥</span>' +
                '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.4s;">🔥</span>';
                } else if (rating >= 8) {
                // High hype: 2 fire emojis
                emojis = baseEmoji + 
                '<span style="font-size: 14px; animation: fireFlicker 1.5s ease-in-out infinite alternate 0.2s;">🔥</span>';
                } else {
                // Standard hype: 1 fire emoji
                emojis = baseEmoji;
        }
        
        return emojis;
}

/**
        * Centralized Rating Display Generator
        * Creates consistent star rating displays for completed items
        * Handles special cases like "Pending Rating" for in-progress items
        * @param {string|number} rating - The rating value (1-10, N/A, or empty)
        * @param {string} status - The item status (affects display logic)
        * @returns {string} - HTML string for the rating display
*/
function generateRatingDisplay(rating, status) {
        if (!rating || rating === '' || rating === 'N/A' || rating === 0) {
                // For in-progress items without a valid rating, show "Pending Rating"
                if (status === 'in-progress' || status === 'in-progress-no-dates') {
                        return '<span class="rating" style="color: var(--accent-warning); font-size: 0.8rem;">Pending Rating</span>';
                }
                return '';
        }
        
        const ratingValue = parseInt(rating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
                return '';
        }
        
        // Generate star rating with filled and empty stars
        let stars = '';
        for (let i = 1; i <= 10; i++) {
                if (i <= ratingValue) {
                        stars += '<i class="fas fa-star"></i>'; // Filled star
                        } else {
                        stars += '<i class="far fa-star"></i>'; // Empty star
                }
                
                // Add space every 5 stars for better readability
                if (i === 5) {
                        stars += ' ';
                }
        }
        
        return `<span class="rating">${stars} ${ratingValue}/10</span>`;
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

// Utility functions
function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "short",
                day: "numeric",
        });
}

function getTimeAgo(dateString) {
        if (!dateString) return "";
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
}

function getTypeIcon(type) {
        const icons = {
                videogame: "fas fa-gamepad",
                film: "fas fa-film",
                series: "fas fa-tv",
                book: "fas fa-book",
                paper: "fas fa-scroll",
        };
        return icons[type] || "fas fa-circle";
}

function getTypeColor(type) {
        const colors = {
                videogame: "#3b82f6",
                film: "#ef4444",
                series: "#06b6d4",
                book: "#8b5cf6",
                paper: "#10b981",
        };
        return colors[type] || "#6b7280";
}

function formatMetadata(metadata) {
        if (!metadata || Object.keys(metadata).length === 0) {
                return "<p>No additional information available.</p>";
        }
        
        let html = '<div class="metadata-grid">';
        
        Object.entries(metadata).forEach(([key, value]) => {
                if (value && value !== "N/A" && value !== "") {
                        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                        let displayValue = value;
                        
                        // Handle arrays
                        if (Array.isArray(value)) {
                                displayValue = value.join(", ");
                        }
                        
                        // Handle URLs
                        if (typeof value === "string" && value.startsWith("http")) {
                                displayValue = `<a href="${value}" target="_blank" rel="noopener">View</a>`;
                        }
                        
                        html += `<p><strong>${label}:</strong> ${displayValue}</p>`;
                }
        });
        
        html += "</div>";
        return html;
}