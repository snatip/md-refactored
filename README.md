# My Multimedia Diary

A static web application for tracking and managing your multimedia consumption. Track video games, films, TV series, books, and scientific papers in one beautiful, visual interface.

## Features

- **Room View**: Visual dashboard with clickable zones representing different media categories
- **Overview**: Timeline view of all entries with filtering and sorting capabilities
- **Pending**: Watchlist of items to consume later with hype ratings
- **Stats**: Statistics and activity charts with visual data representation
- **Add Entry**: Form for adding new media entries with metadata support
- **Data Persistence**: All data stored locally in CSV format
- **User Preferences**: Theme settings and preferences saved in localStorage
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge, or equivalent)
- No backend, database, or server required
- No installation or build process needed

## Local Testing

### Quick Start

1. Clone or download this repository
2. Open `index.html` in your web browser

That's it! The application runs entirely in the browser with no external dependencies beyond CDN-hosted libraries.

### Using a Local Web Server (Optional)

For a better development experience, you can serve the files with a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (with npx)
npx serve

# Using PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Deployment

### Cloudflare Pages

Cloudflare Pages offers free, fast static hosting with automatic SSL.

1. Push your code to GitHub
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Go to **Pages** → **Create a project**
4. Click **Connect to Git** and select your repository
5. Configure build settings:
   - **Build command**: (leave empty)
   - **Build output directory**: `/` (root)
   - **Root directory**: `/` (root)
6. Click **Save and Deploy**

Your site will be live in seconds at `https://your-project.pages.dev`.

### Netlify

Netlify provides free static hosting with drag-and-drop deployment.

**Option 1: Drag and Drop**
1. Create a Netlify account at [netlify.com](https://www.netlify.com)
2. Drag the entire repository folder into the Netlify dashboard
3. Your site will be live immediately

**Option 2: Git Integration**
1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `/` (root)
3. Deploy

### GitHub Pages

Free static hosting directly from your GitHub repository.

1. Go to your repository's **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** branch and `/` (root) folder
4. Click **Save**
5. Your site will be available at `https://yourusername.github.io/your-repo/`

### Raspberry Pi / Local Static Hosting

Host the application on your local network using a web server.

#### Using nginx on Raspberry Pi

```bash
# Install nginx
sudo apt update
sudo apt install nginx

# Copy files to web directory
sudo cp -r /path/to/your/project/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Access at http://raspberry-pi-ip
```

#### Using Apache on Raspberry Pi

```bash
# Install Apache
sudo apt update
sudo apt install apache2

# Copy files to web directory
sudo cp -r /path/to/your/project/* /var/www/html/

# Access at http://raspberry-pi-ip
```

#### Using Lighttpd (Lightweight)

```bash
# Install lighttpd
sudo apt update
sudo apt install lighttpd

# Copy files to web directory
sudo cp -r /path/to/your/project/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/

# Access at http://raspberry-pi-ip
```

## File Structure

```
md-refactored/
├── index.html                 # Main HTML file (entry point)
├── README.md                  # This file
├── MIGRATION_PLAN.md          # Migration documentation
├── css/
│   └── styles.css            # All application styles
├── js/
│   ├── config.js             # Global state management
│   ├── utils.js             # Utility functions and helpers
│   ├── data.js              # CSV data layer (read/write)
│   ├── metadata.js          # Metadata stubs (CORS workaround)
│   ├── api.js               # API abstraction layer
│   └── main.js              # Application logic and UI
├── data/
│   └── entries.csv          # Primary data file (your entries)
└── ARCHIVE/
    ├── code.gs              # Original backend (archived)
    ├── metadata.gs          # Original metadata (archived)
    └── utils.gs             # Original utilities (archived)
```

## Data Management

### Data Storage

All your data is stored in a CSV file (`data/entries.csv`) with the following structure:

```csv
id,title,type,author,startdate,finishdate,rating,notes,coverurl,metadata,createdat,status,tags,hyperating
```

- **id**: Unique identifier for each entry
- **title**: Entry title
- **type**: Media type (videogame, film, series, book, paper)
- **author**: Author/creator (optional)
- **startdate**: When you started consuming the media
- **finishdate**: When you finished (if applicable)
- **rating**: Your rating (1-5 stars or 1-10)
- **notes**: Personal notes and thoughts
- **coverurl**: URL to cover image
- **metadata**: JSON metadata (optional)
- **createdat**: When the entry was added
- **status**: Entry status (pending, in-progress, completed, etc.)
- **tags**: Comma-separated tags
- **hyperating**: Hype rating for pending items

### Editing Data

#### Via Application UI (Recommended)

All data modifications should be done through the application interface:
- **Add entries**: Use the "Add" view to create new entries
- **Edit entries**: Click on any entry in the Overview or Pending views to edit
- **Delete entries**: Use the delete button in the edit modal
- **Mark as finished**: Use the appropriate action buttons

#### Direct CSV Editing

You can edit the CSV file directly in any spreadsheet application:
1. Open `data/entries.csv` in Excel, Google Sheets, LibreOffice Calc, etc.
2. Edit or add entries following the CSV format
3. Save the file (ensure it's saved as CSV)
4. Refresh the application to see changes

**⚠️ Warning**: Be careful when editing the CSV directly:
- Maintain the exact column order
- Use valid dates (YYYY-MM-DD format)
- Escape special characters properly (commas, quotes)
- Backup your file before editing

### Backup Your Data

Since all data is stored locally, regular backups are recommended:

```bash
# Create a backup
cp data/entries.csv data/entries-backup-$(date +%Y%m%d).csv

# Restore from backup
cp data/entries-backup-YYYYMMDD.csv data/entries.csv
```

## Browser Compatibility

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ Opera (latest 2 versions)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements:**
- JavaScript enabled
- LocalStorage enabled
- Modern CSS support (Flexbox, Grid, CSS Variables)

## Known Limitations

### CORS (Cross-Origin Resource Sharing)

The application was originally designed to fetch metadata from external APIs (Google Books, OMDb, RAWG, CrossRef). Due to browser security restrictions, these API calls will fail from a static website without a backend proxy.

**Workaround:**
- Manual metadata entry via the Add Entry form
- Use a CORS proxy service (not recommended for production)
- Host a simple backend proxy if needed (see `ARCHIVE/metadata.gs` for reference)

### Data Storage

- All data is stored in a single CSV file
- No automatic cloud backup
- No real-time collaboration or syncing
- Data is stored locally on the device accessing the site

### User Preferences

- Preferences (theme, etc.) are stored in localStorage
- Preferences are device-specific and won't sync across devices
- Clearing browser data will reset preferences (not your entries)

### No Server-Side Features

- No user authentication
- No multi-user support
- No automatic backups
- No API endpoints

## Privacy

This application:
- Runs entirely in your browser
- Does not send any data to external servers (except CDN libraries)
- Does not use analytics or tracking
- Does not require internet connection after initial load
- Your data never leaves your device

## Development

### Project History

This project was migrated from a Google Apps Script + Google Sheets architecture to a static web application. The original backend code has been preserved in the `ARCHIVE/` directory for reference.

See `MIGRATION_PLAN.md` for detailed migration documentation.

### Customization

You can customize:
- **Colors and styles**: Edit `css/styles.css`
- **UI structure**: Modify `index.html`
- **Application logic**: Edit `js/main.js`
- **Data schema**: Modify `js/data.js` and update CSV format accordingly

## Support

For issues or questions:
1. Check this README and `MIGRATION_PLAN.md`
2. Review browser console for errors (F12 → Console)
3. Verify CSV file format if data issues occur
4. Ensure JavaScript and LocalStorage are enabled

## License

This is a personal project. Feel free to use and modify for your own needs.

---

**Version**: Static (post-migration)
**Last Updated**: 2026-01-18
**Migration Status**: Completed (see MIGRATION_PLAN.md for details)
