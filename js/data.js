/**
 * data.js - CSV-based data layer for the multimedia diary
 * Replaces Google Sheets operations with local file I/O
 */

// Constants
const CSV_FILE_PATH = 'data/entries.csv';
const CSV_HEADERS = ['id', 'title', 'type', 'author', 'startdate', 'finishdate', 'rating', 'notes', 'coverurl', 'metadata', 'createdat', 'status', 'tags', 'hyperating'];

/**
 * Load all entries from CSV file
 * @returns {Promise<Array>} Array of entry objects
 */
async function loadEntries() {
    try {
        const response = await fetch(CSV_FILE_PATH);
        if (!response.ok) {
            throw new Error(`Failed to load CSV file: ${response.status}`);
        }

        const csvText = await response.text();
        const lines = csvText.trim().split('\n');

        if (lines.length <= 1) {
            return []; // Only headers or empty file
        }

        const headers = parseCSVLine(lines[0]);
        const entries = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const entry = {};

            headers.forEach((header, index) => {
                let value = values[index];

                // Parse date fields
                if ((header.includes('date') || header === 'createdat') && value) {
                    value = new Date(value).toISOString();
                }

                // Parse rating and hyperating fields
                if (header === 'rating' || header === 'hyperating') {
                    if (value === 'N/A') {
                        value = 'N/A';
                    } else if (value && value !== '') {
                        value = parseInt(value) || null;
                    } else {
                        value = null;
                    }
                }

                // Parse metadata JSON
                if (header === 'metadata' && value) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {
                        value = {};
                    }
                }

                entry[header] = value;
            });

            entries.push(entry);
        }

        // Sort by creation date (newest first)
        entries.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));

        return entries;
    } catch (error) {
        console.error('Error loading entries:', error);
        return [];
    }
}

/**
 * Save a new entry to the CSV file
 * @param {Object} entryData - Entry data to save
 * @returns {Promise<Object>} Result object with success status and entry ID
 */
async function saveEntry(entryData) {
    try {
        // Generate UUID for new entry
        const id = crypto.randomUUID ? crypto.randomUUID() : generateFallbackUUID();

        // Create entry object with defaults
        const entry = {
            id: id,
            createdat: new Date().toISOString(),
            title: entryData.title || '',
            type: entryData.type || '',
            author: entryData.author || '',
            startdate: entryData.startdate || '',
            finishdate: entryData.finishdate || '',
            rating: entryData.rating || '',
            notes: entryData.notes || '',
            coverurl: entryData.coverurl || '',
            metadata: entryData.metadata ? JSON.stringify(entryData.metadata) : '',
            status: entryData.status || 'pending',
            tags: entryData.tags || '',
            hyperating: entryData.hyperating || ''
        };

        // Build CSV line
        const csvLine = CSV_HEADERS.map(header => {
            const value = entry[header] || '';
            return escapeCSVValue(value);
        }).join(',');

        // Append to CSV file
        // Note: In a real browser environment, we can't directly write to files
        // This implementation will need to be modified for actual file I/O
        // For now, we'll store in localStorage as a fallback
        const storedEntries = JSON.parse(localStorage.getItem('entries') || '[]');
        storedEntries.push(entry);
        localStorage.setItem('entries', JSON.stringify(storedEntries));

        // Trigger download for manual save
        await downloadCSV();

        return {
            success: true,
            id: id,
            message: 'Entry saved successfully',
            entry: entry
        };
    } catch (error) {
        console.error('Error saving entry:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update an existing entry in the CSV file
 * @param {string} entryId - ID of the entry to update
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Result object with success status
 */
async function updateEntry(entryId, updateData) {
    try {
        const entries = await loadEntries();

        // Find and update the entry
        let found = false;
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].id === entryId) {
                // Update specified fields
                Object.keys(updateData).forEach(field => {
                    entries[i][field] = updateData[field];
                });
                found = true;
                break;
            }
        }

        if (!found) {
            throw new Error('Entry not found');
        }

        // Save updated entries
        await saveAllEntries(entries);

        return {
            success: true,
            message: 'Entry updated successfully'
        };
    } catch (error) {
        console.error('Error updating entry:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Delete an entry from the CSV file
 * @param {string} entryId - ID of the entry to delete
 * @returns {Promise<Object>} Result object with success status
 */
async function deleteEntry(entryId) {
    try {
        const entries = await loadEntries();

        // Filter out the entry to delete
        const filteredEntries = entries.filter(entry => entry.id !== entryId);

        if (filteredEntries.length === entries.length) {
            throw new Error('Entry not found');
        }

        // Save updated entries
        await saveAllEntries(filteredEntries);

        return {
            success: true,
            message: 'Entry deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting entry:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Save all entries to CSV (helper function)
 * @param {Array} entries - Array of entry objects
 * @returns {Promise<void>}
 */
async function saveAllEntries(entries) {
    try {
        // Build CSV content
        const csvLines = [CSV_HEADERS.join(',')];

        entries.forEach(entry => {
            const values = CSV_HEADERS.map(header => {
                let value = entry[header];

                // Handle metadata - stringify if it's an object
                if (header === 'metadata' && typeof value === 'object') {
                    value = JSON.stringify(value);
                }

                return escapeCSVValue(value || '');
            });

            csvLines.push(values.join(','));
        });

        const csvContent = csvLines.join('\n');

        // Store in localStorage
        localStorage.setItem('entries', JSON.stringify(entries));

        // Trigger download for manual save
        await downloadCSV(csvContent);
    } catch (error) {
        console.error('Error saving all entries:', error);
        throw error;
    }
}

/**
 * Parse a CSV line, handling quoted values
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of values
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Comma outside quotes - new field
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add the last field
    result.push(current.trim());

    return result;
}

/**
 * Escape a CSV value if necessary
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCSVValue(value) {
    if (typeof value !== 'string') {
        value = String(value);
    }

    // If the value contains comma, quote, or newline, wrap it in quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        // Escape existing quotes
        value = value.replace(/"/g, '""');
        return `"${value}"`;
    }

    return value;
}

/**
 * Generate a fallback UUID for browsers without crypto.randomUUID()
 * @returns {string} UUID string
 */
function generateFallbackUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Download CSV file (for manual save in static environment)
 * @param {string} csvContent - CSV content to download
 * @returns {Promise<void>}
 */
async function downloadCSV(csvContent) {
    // If csvContent is not provided, generate it from localStorage
    if (!csvContent) {
        const entries = JSON.parse(localStorage.getItem('entries') || '[]');
        const csvLines = [CSV_HEADERS.join(',')];

        entries.forEach(entry => {
            const values = CSV_HEADERS.map(header => {
                let value = entry[header];

                if (header === 'metadata' && typeof value === 'object') {
                    value = JSON.stringify(value);
                }

                return escapeCSVValue(value || '');
            });

            csvLines.push(values.join(','));
        });

        csvContent = csvLines.join('\n');
    }

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'entries.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadEntries,
        saveEntry,
        updateEntry,
        deleteEntry
    };
}
