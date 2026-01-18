/**
 * api.js - API abstraction layer for multimedia diary
 * Replaces google.script.run with CSV-based data layer operations
 * All functions return promises for compatibility
 */

// Import data layer functions
// Note: In browser, these are global functions from data.js

/**
 * API Abstraction Layer
 * Provides consistent interface for data operations
 * All functions return promises matching original google.script.run pattern
 */
const api = {
    /**
     * Get all entries from the data store
     * @returns {Promise<Array>} Array of entry objects
     */
    getAllEntries: function() {
        return loadEntries().then(entries => {
            return entries;
        }).catch(error => {
            console.error('Error in getAllEntries:', error);
            return [];
        });
    },

    /**
     * Add a new media entry
     * @param {Object} entryData - Entry data (title, type, dates, rating, etc.)
     * @returns {Promise<Object>} Result object with success status and entry ID
     */
    addMediaEntry: function(entryData) {
        // Validate entry data first
        const validation = validateEntryData(entryData);
        if (!validation.isValid) {
            return Promise.resolve({
                success: false,
                error: validation.errors.join(', ')
            });
        }

        // Ensure status is set for media entries
        if (!entryData.status) {
            entryData.status = 'in-progress';
            if (!entryData.startdate && !entryData.finishdate) {
                entryData.status = 'in-progress-no-dates';
            } else if (entryData.finishdate) {
                entryData.status = 'completed';
                if (!entryData.startdate) {
                    entryData.status = 'completed-no-dates';
                }
            }
        }

        return saveEntry(entryData).then(result => {
            return result;
        }).catch(error => {
            console.error('Error in addMediaEntry:', error);
            return {
                success: false,
                error: error.message || 'Failed to add entry'
            };
        });
    },

    /**
     * Add a new pending entry (watchlist item)
     * @param {Object} entryData - Entry data (title, type, hypeRating, etc.)
     * @returns {Promise<Object>} Result object with success status and entry ID
     */
    addPendingEntry: function(entryData) {
        // Validate pending entry data
        const validation = validatePendingEntryData(entryData);
        if (!validation.isValid) {
            return Promise.resolve({
                success: false,
                error: validation.errors.join(', ')
            });
        }

        // Set status to pending
        entryData.status = 'pending';

        return saveEntry(entryData).then(result => {
            return result;
        }).catch(error => {
            console.error('Error in addPendingEntry:', error);
            return {
                success: false,
                error: error.message || 'Failed to add pending entry'
            };
        });
    },

    /**
     * Start a pending entry (convert to active media entry)
     * @param {string} entryId - ID of the pending entry to start
     * @returns {Promise<Object>} Result object with success status
     */
    startPendingEntry: function(entryId) {
        return loadEntries().then(entries => {
            const entry = entries.find(e => e.id === entryId);

            if (!entry) {
                return {
                    success: false,
                    error: 'Entry not found'
                };
            }

            if (entry.status !== 'pending') {
                return {
                    success: false,
                    error: 'Entry is not in pending status'
                };
            }

            // Update entry to active status
            const updateData = {
                status: 'in-progress',
                startdate: new Date().toISOString().split('T')[0]
            };

            return updateEntry(entryId, updateData);
        }).catch(error => {
            console.error('Error in startPendingEntry:', error);
            return {
                success: false,
                error: error.message || 'Failed to start entry'
            };
        });
    },

    /**
     * Update an existing entry
     * @param {string} entryId - ID of the entry to update
     * @param {Object} updateData - Fields to update
     * @returns {Promise<Object>} Result object with success status
     */
    updateEntry: function(entryId, updateData) {
        return updateEntry(entryId, updateData).then(result => {
            return result;
        }).catch(error => {
            console.error('Error in updateEntry:', error);
            return {
                success: false,
                error: error.message || 'Failed to update entry'
            };
        });
    },

    /**
     * Mark an entry as finished
     * @param {string} entryId - ID of the entry to mark as finished
     * @returns {Promise<Object>} Result object with success status
     */
    markEntryAsFinished: function(entryId) {
        return loadEntries().then(entries => {
            const entry = entries.find(e => e.id === entryId);

            if (!entry) {
                return {
                    success: false,
                    error: 'Entry not found'
                };
            }

            if (entry.status === 'completed' || entry.status === 'completed-no-dates') {
                return {
                    success: false,
                    error: 'Entry is already marked as finished'
                };
            }

            // Update entry to completed status
            const updateData = {
                status: 'completed',
                finishdate: new Date().toISOString().split('T')[0]
            };

            // If there's no start date, use completed-no-dates status
            if (!entry.startdate) {
                updateData.status = 'completed-no-dates';
            }

            return updateEntry(entryId, updateData);
        }).catch(error => {
            console.error('Error in markEntryAsFinished:', error);
            return {
                success: false,
                error: error.message || 'Failed to mark entry as finished'
            };
        });
    },

    /**
     * Delete an entry
     * @param {string} entryId - ID of the entry to delete
     * @returns {Promise<Object>} Result object with success status
     */
    deleteEntry: function(entryId) {
        return deleteEntry(entryId).then(result => {
            return result;
        }).catch(error => {
            console.error('Error in deleteEntry:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete entry'
            };
        });
    },

    /**
     * Export entries to CSV
     * @returns {Promise<Object>} Result object with download triggered
     */
    exportToCSV: function() {
        return new Promise((resolve) => {
            try {
                downloadCSV();
                resolve({
                    success: true,
                    message: 'CSV download triggered'
                });
            } catch (error) {
                console.error('Error in exportToCSV:', error);
                resolve({
                    success: false,
                    error: error.message || 'Failed to export CSV'
                });
            }
        });
    },

    /**
     * Get statistics about entries
     * @returns {Promise<Object>} Statistics object with counts and averages
     */
    getStatistics: function() {
        return loadEntries().then(entries => {
            const stats = {
                total: entries.length,
                byType: {},
                byStatus: {},
                completed: 0,
                pending: 0,
                inProgress: 0,
                averageRating: 0
            };

            entries.forEach(entry => {
                // Count by type
                stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;

                // Count by status
                stats.byStatus[entry.status] = (stats.byStatus[entry.status] || 0) + 1;

                // Count status categories
                if (entry.status === 'pending') {
                    stats.pending++;
                } else if (entry.status === 'completed' || entry.status === 'completed-no-dates') {
                    stats.completed++;
                } else if (entry.status.startsWith('in-progress')) {
                    stats.inProgress++;
                }
            });

            // Calculate average rating (only for completed entries)
            const completedEntries = entries.filter(e =>
                e.status === 'completed' || e.status === 'completed-no-dates'
            );
            if (completedEntries.length > 0) {
                const ratingSum = completedEntries.reduce((sum, e) => sum + (e.rating || 0), 0);
                stats.averageRating = (ratingSum / completedEntries.length).toFixed(1);
            }

            return stats;
        }).catch(error => {
            console.error('Error in getStatistics:', error);
            return {
                total: 0,
                byType: {},
                byStatus: {},
                completed: 0,
                pending: 0,
                inProgress: 0,
                averageRating: 0
            };
        });
    }
};

// For backward compatibility, expose API functions globally
// This mimics the google.script.run pattern used in the original code
if (typeof window !== 'undefined') {
    window.api = api;

    // Optional: Mock google.script.run for legacy code
    // Comment this out if you've updated all code to use window.api directly
    window.google = {
        script: {
            run: {
                withSuccessHandler: function(successCallback) {
                    this._successHandler = successCallback;
                    return this;
                },
                withFailureHandler: function(failureCallback) {
                    this._failureHandler = failureCallback;
                    return this;
                },
                getAllEntries: function() {
                    api.getAllEntries().then(
                        this._successHandler,
                        this._failureHandler
                    );
                },
                addMediaEntry: function(entryData) {
                    api.addMediaEntry(entryData).then(
                        this._successHandler,
                        this._failureHandler
                    );
                },
                addPendingEntry: function(entryData) {
                    api.addPendingEntry(entryData).then(
                        this._successHandler,
                        this._failureHandler
                    );
                },
                startPendingEntry: function(entryId) {
                    api.startPendingEntry(entryId).then(
                        this._successHandler,
                        this._failureHandler
                    );
                },
                updateEntry: function(entryId, updateData) {
                    api.updateEntry(entryId, updateData).then(
                        this._successHandler,
                        this._failureHandler
                    );
                },
                markEntryAsFinished: function(entryId) {
                    api.markEntryAsFinished(entryId).then(
                        this._successHandler,
                        this._failureHandler
                    );
                },
                deleteEntry: function(entryId) {
                    api.deleteEntry(entryId).then(
                        this._successHandler,
                        this._failureHandler
                    );
                },
                exportToCSV: function() {
                    api.exportToCSV().then(
                        this._successHandler,
                        this._failureHandler
                    );
                },
                getStatistics: function() {
                    api.getStatistics().then(
                        this._successHandler,
                        this._failureHandler
                    );
                }
            }
        }
    };
}

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
}
