# Production Files Documentation

> **Last Updated:** January 21, 2026  
> **Status:** Production Ready for GitHub Pages Deployment

## 🎯 Active Production HTML Files

These are the **8 core production files** that power the live portal:

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | Home dashboard with overview stats | ✅ Production |
| `login.html` | Authentication page (Host/Resident login) | ✅ Production |
| `guests.html` | Guest CRUD editor with character assignments | ✅ Production |
| `food.html` | Menu planning with inline CRUD editor | ✅ Production |
| `decor.html` | Mood board, shopping list, and vendors | ✅ Production |
| `mystery.html` | Story overview, character list, printables | ✅ Production |
| `schedule.html` | 2-hour run-of-show timeline editor | ✅ Production |
| `admin.html` | Global Data Manager panel | ✅ Production |

## 🔧 Support Files

### JavaScript Modules
- `assets/app.js` - Main application logic with CRUD helpers
- `assets/firebase-config.js` - Firebase initialization and Firestore operations
- `assets/firebase-manager.js` - Convenience wrapper for Firebase exports
- `assets/app-simple.js` - Simplified app logic (backup/alternative)
- `assets/modules/render.js` - Page rendering functions

### Stylesheets
- `assets/styles.css` - Twin Peaks themed styling

### Data Files (JSON)
All production data is stored in `/data/`:
- `guests.json` - Guest list with contact details
- `characters.json` - Mystery character roles
- `decor.json` - Mood boards and shopping lists
- `vendors.json` - Vendor contacts
- `menu.json` - Twin Peaks themed menu items
- `schedule.json` - Event timeline blocks
- `story.json` - "A Toast to Secrets" mystery plot
- `clues.json` - Mystery clues
- `packets.json` - Character packets
- `settings.json` - App settings
- `roles.json` - Role assignments
- `pageNotes.json` - User notes per page

## 🧪 Test/Debug Files (Not for Production)

These files are used for testing, debugging, or are backup versions. They should **NOT** be deployed or may be moved to a `/tests` directory:

### Debug Pages
- `debug.html` - General debugging page
- `debug-test.html` - Debug test page
- `render-debug.html` - Render function debugging
- `script-test.html` - Script testing page
- `simple-test.html` - Simple test page
- `minimal-test.html` - Minimal test page
- `test-save-fixes.html` - Save functionality testing
- `emergency-clean.html` - Emergency cleanup page

### Backup/Variant Versions
- `index-backup.html` - Backup of index page
- `index-clean.html` - Clean version of index
- `index-fixed.html` - Fixed version of index
- `index-stable.html` - Stable version of index
- `decor-fixed.html` - Fixed version of decor page
- `decor-wizard.html` - Decor wizard variant
- `mystery-fixed.html` - Fixed version of mystery page

### Alternative/Experimental Pages
- `host-controls.html` - Host controls (may be merged into admin)
- `menu-planner.html` - Menu planner (functionality in food.html)
- `role-assignment.html` - Role assignment (functionality in guests.html)

## 📋 File Status Summary

```
Total HTML files: 26
✅ Production files: 8
🧪 Test/Debug files: 18
```

## 🚀 Deployment Notes

### Production URLs
- **Base URL:** `https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/`
- **Entry Point:** `index.html` (redirects to `login.html` if not authenticated)

### Path Structure
All production files use **relative paths** for compatibility with GitHub Pages:
- Data: `./data/[filename].json`
- Assets: `./assets/[filename]`
- Pages: `./[page].html`

### Module Imports
All JavaScript modules use ES6 imports with `type="module"`:
```html
<script type="module" src="./assets/app.js"></script>
```

### Firebase Configuration
- Firebase is currently **ENABLED** (`FIREBASE_ENABLED = true` in `assets/app.js`)
- To disable Firebase and use local-only mode, set `const FIREBASE_ENABLED = false;`
- Firebase credentials are in `assets/firebase-config.js`
- Fallback to localStorage happens automatically if Firebase fails

## 🔐 Authentication Flow

1. User navigates to portal → redirects to `login.html`
2. **Host Login:** Email/password authentication via Firebase
3. **Resident Login:** Name/phone (stored in sessionStorage)
4. After login → redirects to `index.html` dashboard
5. Navigation bar shows appropriate menu items based on user role

## 📦 Data Persistence Strategy

1. **Primary:** Firebase Firestore (if enabled and authenticated)
2. **Fallback:** Browser localStorage (automatic fallback)
3. **Backup:** JSON file export/import via UI buttons
4. **Defaults:** Repository JSON files in `/data/` directory

## ✅ Production Readiness Checklist

- [x] All 8 production HTML files identified
- [x] Firebase configuration verified (`firebase-config.js`, `firebase-manager.js`)
- [x] `.nojekyll` file present for GitHub Pages
- [x] Relative paths used throughout
- [x] Module imports configured correctly
- [x] Data files populated with defaults
- [x] Authentication flow working
- [x] Console logging added for Firebase status
- [x] localStorage fallback implemented

## 🗑️ Cleanup Recommendations

Consider the following actions for a cleaner repository:

1. **Create `/tests` directory** and move all debug/test HTML files there
2. **Archive backup versions** after verifying production files are stable
3. **Review experimental pages** and merge useful features into production files
4. **Remove obsolete files** that are no longer needed

## 📝 Version Comments

All production HTML files should include a header comment:
```html
<!-- PRODUCTION VERSION - Last updated: January 21, 2026 -->
```

This helps identify which files are actively maintained.

## 🔄 Update History

- **2026-01-21:** Initial production files documentation created
- Firebase integration verified and documented
- .nojekyll file added for GitHub Pages compatibility
- Clear logging added for Firebase status

---

**For questions or updates, see:** [README.md](README.md)
