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