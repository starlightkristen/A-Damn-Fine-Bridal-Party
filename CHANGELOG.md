# Changelog

All notable changes to the "A Damn Fine Bridal Party" portal are documented here.

## [January 2026] - Latest Updates

### Added
- **23 Character Roles**: Expanded from 6 to 23 characters (6 core + 17 supporting)
  - Core characters: Audrey Horne, Dale Cooper, Shelly Johnson, The Log Lady, Morgan Kincaid, Norma Jennings
  - Supporting cast includes Andy Brennan, Lucy Moran, Big Ed Hurley, Donna Hayward, James Hurley, Bobby Briggs, Nadine Hurley, Dr. Jacoby, Mayor Dwayne Milford, Leland Palmer, Ben Horne, Catherine Martell, Pete Martell, Sheriff Truman, Josie Packard, Hank Jennings, and Leo Johnson
- **Cache-Busting System**: Added version parameters (`?v=YYYYMMDD`) to all JavaScript imports
  - Forces browsers to fetch latest JavaScript updates
  - Prevents stale cached content from causing issues
  - Updated across all 11 HTML pages

### Changed
- Updated all HTML files with cache-busting version parameters (v=20260103)
- Improved documentation with deployment and update procedures
- Organized legacy documentation into `docs/archive/` folder

### Technical
- JavaScript cache management ensures users see latest character data
- Version parameter system allows controlled cache invalidation
- All script imports now use versioned URLs for reliable updates

## [Previous Updates]

### Firebase Integration
- Real-time cloud sync between multiple users
- Offline persistence with automatic sync when reconnected
- Authentication system with login page
- Save retry logic with exponential backoff
- Visual save status indicators and overlays

### CRUD Editors
- Full inline editing for Guests, Menu, Decor, and Schedule
- Modal forms with validation
- Dynamic category management
- Import/Export functionality for all datasets
- Reset to defaults option with confirmation

### Data Management
- Global Data Manager in admin panel
- Autosave toggle for browser storage
- 12 separate datasets with independent management
- Vendor contacts separated from decor data
- Page-specific notes system

### Mystery Game Features
- Complete "A Toast to Secrets" murder mystery plot
- Character packet generator with printable envelopes
- Investigation phase controls
- Cupcake reveal ceremony sequence
- Host controls with live timer and hint system

---

For detailed historical information, see `docs/archive/` folder.
