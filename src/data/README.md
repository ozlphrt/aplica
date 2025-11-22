# Data Directory

This directory is reserved for the SQLite database file that will be loaded at runtime.

## Database File

The database file (`colleges_vYYYY_MM.db`) will be:
- Downloaded from a CDN or hosted location
- Cached in IndexedDB for offline use
- Updated periodically (quarterly/annual)

## File Location

The actual `.db` file is not stored in this repository. It will be:
- Hosted separately (GitHub Releases, CDN, etc.)
- Loaded dynamically when the app initializes
- Cached locally for performance

See `src/lib/data-loader.js` for database loading logic.

