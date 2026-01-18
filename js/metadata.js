/**
 * metadata.js - Browser-stubbed metadata fetching
 * 
 * IMPORTANT: This file contains STUBBED versions of API calls.
 * 
 * WHY STUBBED:
 * Static hosting (like GitHub Pages, Cloudflare Pages, etc.) cannot make direct
 * API calls to external services due to CORS (Cross-Origin Resource Sharing) restrictions.
 * 
 * HOW TO ENABLE:
 * 1. Create a proxy server (Node.js, Python, etc.) that makes API calls
 * 2. Deploy the proxy to a hosting service that supports CORS
 * 3. Update the stub functions below to call your proxy instead
 * 4. Configure CORS headers on your proxy to allow your static site
 * 
 * RETURN STRUCTURE:
 * All functions return: { coverURL: string, additionalInfo: object, source: string, fetchedAt: string }
 */

/**
 * Main function to fetch metadata based on content type
 * @param {string} title - Title of the media
 * @param {string} type - Type of media (book, film, series, videogame, paper)
 * @returns {Object} Metadata object with cover URL and additional info
 */
function fetchMetadata(title, type) {
  console.log(`[STUB] fetchMetadata called for: ${title} (${type})`);
  console.log('[STUB] API calls disabled due to CORS restrictions in static hosting');

  let metadata = {
    coverURL: '',
    additionalInfo: {},
    fetchedAt: new Date().toISOString()
  };

  try {
    switch (type.toLowerCase()) {
      case 'book':
        metadata = fetchBookMetadata(title);
        break;
      case 'film':
      case 'movie':
        metadata = fetchMovieMetadata(title);
        break;
      case 'series':
      case 'tv':
        metadata = fetchTVMetadata(title);
        break;
      case 'videogame':
      case 'game':
        metadata = fetchGameMetadata(title);
        break;
      case 'paper':
      case 'scientific':
        metadata = fetchPaperMetadata(title);
        break;
      default:
        console.log(`[STUB] No metadata fetching available for type: ${type}`);
    }
  } catch (error) {
    console.error(`[STUB] Metadata fetch error for ${type}:`, error);
  }

  return metadata;
}

/**
 * Fetch book metadata from Google Books API (STUBBED)
 * 
 * TO ENABLE: Create a proxy server that calls:
 * GET https://www.googleapis.com/books/v1/volumes?q=intitle:{title}&maxResults=3
 * 
 * Proxy example (Node.js/Express):
 * app.get('/api/books', async (req, res) => {
 *   const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${req.query.title}`);
 *   res.json(await response.json());
 * });
 * 
 * @param {string} title - Book title
 * @returns {Object} Stubbed book metadata
 */
function fetchBookMetadata(title) {
  console.log('[STUB] fetchBookMetadata called - returns placeholder only');

  return {
    coverURL: generateQualityPlaceholder(title, 'book'),
    additionalInfo: {
      authors: [],
      publishedDate: '',
      description: 'Metadata fetching is disabled in static hosting due to CORS restrictions',
      categories: [],
      pageCount: 0,
      language: '',
      publisher: '',
      isbn: ''
    },
    source: 'Manual Entry (Stubbed)',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Fetch movie metadata from OMDb API (STUBBED)
 * 
 * TO ENABLE: Create a proxy server that calls:
 * GET http://www.omdbapi.com/?t={title}&type=movie&apikey={key}
 * 
 * Requires free API key from: http://www.omdbapi.com/apikey.aspx
 * 
 * @param {string} title - Movie title
 * @returns {Object} Stubbed movie metadata
 */
function fetchMovieMetadata(title) {
  console.log('[STUB] fetchMovieMetadata called - returns placeholder only');

  return {
    coverURL: generateQualityPlaceholder(title, 'film'),
    additionalInfo: {
      director: '',
      actors: '',
      plot: 'Metadata fetching is disabled in static hosting due to CORS restrictions',
      genre: '',
      year: '',
      runtime: '',
      imdbRating: '',
      imdbID: '',
      rated: ''
    },
    source: 'Manual Entry (Stubbed)',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Fetch TV series metadata from OMDb API (STUBBED)
 * 
 * TO ENABLE: Create a proxy server that calls:
 * GET http://www.omdbapi.com/?t={title}&type=series&apikey={key}
 * 
 * Requires free API key from: http://www.omdbapi.com/apikey.aspx
 * 
 * @param {string} title - TV series title
 * @returns {Object} Stubbed TV metadata
 */
function fetchTVMetadata(title) {
  console.log('[STUB] fetchTVMetadata called - returns placeholder only');

  return {
    coverURL: generateQualityPlaceholder(title, 'series'),
    additionalInfo: {
      creator: '',
      actors: '',
      plot: 'Metadata fetching is disabled in static hosting due to CORS restrictions',
      genre: '',
      year: '',
      totalSeasons: '',
      imdbRating: '',
      imdbID: '',
      rated: ''
    },
    source: 'Manual Entry (Stubbed)',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Fetch video game metadata from RAWG API (STUBBED)
 * 
 * TO ENABLE: Create a proxy server that calls:
 * GET https://api.rawg.io/api/games?key={key}&search={title}&page_size=1
 * 
 * Requires API key from: https://rawg.io/ap
 * 
 * @param {string} title - Game title
 * @returns {Object} Stubbed game metadata
 */
function fetchGameMetadata(title) {
  console.log('[STUB] fetchGameMetadata called - returns placeholder only');

  return {
    coverURL: generateQualityPlaceholder(title, 'videogame'),
    additionalInfo: {
      released: '',
      genres: [],
      platforms: [],
      rating: 0,
      metacritic: 0,
      developers: [],
      publishers: []
    },
    source: 'Manual Entry (Stubbed)',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Fetch scientific paper metadata from CrossRef API (STUBBED)
 * 
 * NOTE: CrossRef API may work without a proxy as it supports CORS,
 * but is stubbed here for consistency and reliability.
 * 
 * TO ENABLE: Try calling directly:
 * GET https://api.crossref.org/works?query.title={title}&rows=1
 * 
 * @param {string} title - Paper title
 * @returns {Object} Stubbed paper metadata
 */
function fetchPaperMetadata(title) {
  console.log('[STUB] fetchPaperMetadata called - returns placeholder only');

  return {
    coverURL: '', // Scientific papers typically don't have cover images
    additionalInfo: {
      authors: [],
      journal: '',
      publishedDate: '',
      doi: '',
      abstract: 'Metadata fetching is disabled in static hosting due to CORS restrictions',
      subject: [],
      type: '',
      url: ''
    },
    source: 'Manual Entry (Stubbed)',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Get default metadata structure when API calls fail
 * @returns {Object} Default metadata object
 */
function getDefaultMetadata() {
  return {
    coverURL: '',
    additionalInfo: {},
    source: 'Manual Entry',
    fetchedAt: new Date().toISOString()
  };
}

/**
 * Generate a high-quality placeholder image
 * This function is preserved from the original metadata.gs
 * @param {string} title - Title to display on placeholder
 * @param {string} type - Media type (determines color)
 * @returns {string} Placeholder image URL
 */
function generateQualityPlaceholder(title, type) {
  const colors = {
    videogame: "3b82f6",
    film: "ef4444",
    series: "06b6d4",
    book: "8b5cf6",
    paper: "10b981",
  };

  const color = colors[type.toLowerCase()] || '6b7280';

  // Use a better placeholder service that generates book-like covers
  const encodedTitle = encodeURIComponent(title.substring(0, 30).toUpperCase());

  // Try multiple placeholder services in order of preference
  const placeholderServices = [
    `https://placehold.co/300x450/${color}/ffffff?text=${encodedTitle}`,
    `https://picsum.photos/seed/${encodeURIComponent(title)}/300/450.jpg`,
    `https://source.unsplash.com/300x450/?${type},cover&sig=${encodeURIComponent(title)}`
  ];

  // Return first placeholder service URL
  return placeholderServices[0];
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  window.metadata = {
    fetchMetadata,
    fetchBookMetadata,
    fetchMovieMetadata,
    fetchTVMetadata,
    fetchGameMetadata,
    fetchPaperMetadata,
    getDefaultMetadata,
    generateQualityPlaceholder
  };
}

// Export for module systems (if used)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchMetadata,
    fetchBookMetadata,
    fetchMovieMetadata,
    fetchTVMetadata,
    fetchGameMetadata,
    fetchPaperMetadata,
    getDefaultMetadata,
    generateQualityPlaceholder
  };
}
