# Pre-Deployment Checklist

> **Last Updated:** January 21, 2026  
> **Purpose:** Ensure the portal is ready for production deployment to GitHub Pages

## Code Quality
- [x] No console.error() messages in production code
- [x] All test files identified and documented
- [x] Firebase config decision made (enabled with fallback)
- [ ] All hardcoded test data reviewed
- [x] Production HTML files marked with version comments
- [x] Clear console logging for Firebase status implemented

## Firebase Configuration
- [x] Firebase config verified in `assets/firebase-config.js`
- [x] Firebase Manager created/verified (`firebase-manager.js`)
- [x] `FIREBASE_ENABLED` flag documented and working
- [x] Fallback to localStorage implemented
- [x] Console logging shows clear Firebase status
- [ ] Firebase credentials tested (or documented as disabled)

## Data Integrity
- [ ] Backup all JSON files in `/data` directory
- [x] Verify default guests in `data/guests.json`
- [x] Verify all 6 characters in `data/characters.json`
- [x] Verify story content in `data/story.json`
- [x] All 12 data files present and valid JSON

## Security
- [x] Firebase credentials documented (public config, API key restricted in Firebase Console)
- [ ] No sensitive personal data in JSON files (review guest data)
- [x] Authentication working properly
- [x] Resident/Host access levels implemented

## Documentation
- [x] README.md updated with current status
- [x] PRODUCTION_FILES.md created
- [x] Test workflow documented (`tests/workflow-test.md`)
- [x] Known issues documented (in PRODUCTION_FILES.md)
- [x] Deployment checklist created (this file)

## GitHub Pages
- [x] Repository is public (assumed - GitHub Pages enabled)
- [ ] GitHub Pages enabled in repository settings
- [x] `.nojekyll` file present
- [ ] Custom domain configured (if applicable - not required)
- [x] All asset paths are relative (`./data/`, `./assets/`)

## File Organization
- [x] Production files identified (8 core HTML files)
- [x] Test/debug files documented (18 variant files)
- [x] `tests/` directory created
- [ ] Test files moved to `tests/` directory (optional cleanup)
- [ ] Backup files archived or removed (optional cleanup)

## Production Files Verification

### Core HTML Pages (8 files)
- [x] `index.html` - Home dashboard
- [x] `login.html` - Authentication page
- [x] `guests.html` - Guest CRUD editor
- [x] `food.html` - Menu planning
- [x] `decor.html` - Mood board & shopping
- [x] `mystery.html` - Story & characters
- [x] `schedule.html` - Timeline editor
- [x] `admin.html` - Global data manager

### JavaScript Modules
- [x] `assets/app.js` - Main application logic
- [x] `assets/firebase-config.js` - Firebase integration
- [x] `assets/firebase-manager.js` - Firebase wrapper
- [x] `assets/modules/render.js` - Rendering functions
- [x] `assets/styles.css` - Theme styles

### Data Files (12 files)
- [x] `data/guests.json`
- [x] `data/characters.json`
- [x] `data/decor.json`
- [x] `data/vendors.json`
- [x] `data/menu.json`
- [x] `data/schedule.json`
- [x] `data/story.json`
- [x] `data/clues.json`
- [x] `data/packets.json`
- [x] `data/settings.json`
- [x] `data/roles.json`
- [x] `data/pageNotes.json`

## Path Verification
- [x] All HTML files use relative paths: `./data/`, `./assets/`
- [x] Navigation links use relative paths: `./page.html`
- [x] Module imports use relative paths: `./assets/app.js`
- [x] CSS links use relative paths: `./assets/styles.css`

## Browser Compatibility
- [ ] Tested in Chrome/Edge
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Mobile responsive design verified
- [ ] ES6 module support confirmed (modern browsers)

## Post-Deployment Verification
After deploying to GitHub Pages, complete these tests:

- [ ] Live URL loads correctly: https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/
- [ ] All navigation links work
- [ ] Login functionality works (or properly bypasses in local-only mode)
- [ ] Data persistence verified (localStorage or Firestore)
- [ ] Mobile responsiveness confirmed
- [ ] No console errors on production site
- [ ] All 8 pages accessible and functional
- [ ] Export/Import functionality works
- [ ] CRUD operations work correctly

## Manual Testing
- [ ] Complete `tests/workflow-test.md` checklist
- [ ] Document any issues found
- [ ] Re-test after fixes

## Deployment Steps

### Step 1: Repository Settings
1. Go to repository **Settings** on GitHub
2. Navigate to **Pages** section
3. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or current branch)
   - **Folder:** `/ (root)`
4. Click **Save**

### Step 2: Wait for Deployment
- GitHub Pages typically takes 1-2 minutes to build
- Check the **Actions** tab for deployment status
- Look for "pages build and deployment" workflow

### Step 3: Verify Deployment
- Visit: https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/
- Check browser console for errors
- Test login flow
- Verify data loads correctly

### Step 4: Post-Deployment Testing
- Follow the manual testing checklist in `tests/workflow-test.md`
- Document results
- Fix any issues and redeploy if needed

## Troubleshooting Common Issues

### Issue: Pages show 404 errors
**Solution:** 
- Verify `.nojekyll` file exists in root
- Check that all paths are relative (no leading `/`)
- Confirm GitHub Pages is enabled in settings

### Issue: Firebase fails to initialize
**Solution:**
- Check Firebase credentials in `firebase-config.js`
- Verify Firebase project settings in Firebase Console
- Confirm API key is valid and not restricted
- App will automatically fall back to localStorage

### Issue: Data doesn't persist
**Solution:**
- If Firebase enabled: Check authentication and Firestore rules
- If localStorage: Verify browser isn't blocking localStorage
- Check console for save errors

### Issue: Login page redirects infinitely
**Solution:**
- If Firebase enabled: Check authentication state
- If Firebase disabled: Update `FIREBASE_ENABLED = false` in `app.js`
- Clear browser cache and localStorage

### Issue: JavaScript modules not loading
**Solution:**
- Verify `type="module"` attribute on script tags
- Check browser console for CORS errors
- Ensure all import paths are correct and relative

## Optional Cleanup Tasks

These tasks improve repository organization but are not required for deployment:

- [ ] Move test/debug HTML files to `tests/` directory:
  - `debug.html`, `debug-test.html`
  - `render-debug.html`, `script-test.html`
  - `simple-test.html`, `minimal-test.html`
  - `test-save-fixes.html`, `emergency-clean.html`

- [ ] Archive backup HTML files:
  - `index-backup.html`, `index-clean.html`
  - `index-fixed.html`, `index-stable.html`
  - `decor-fixed.html`, `mystery-fixed.html`

- [ ] Review experimental pages:
  - `decor-wizard.html` - Consider merging useful features into `decor.html`
  - `host-controls.html` - Consider merging into `admin.html`
  - `menu-planner.html` - Functionality already in `food.html`
  - `role-assignment.html` - Functionality already in `guests.html`

## Notes on Firebase Configuration

### Current Status: Firebase ENABLED
- `FIREBASE_ENABLED = true` in `assets/app.js`
- Firebase credentials configured in `assets/firebase-config.js`
- Automatic fallback to localStorage if Firebase fails
- Authentication required for host access

### To Disable Firebase:
1. Open `assets/app.js`
2. Change `const FIREBASE_ENABLED = true;` to `const FIREBASE_ENABLED = false;`
3. Console will show: "🔧 Running in local-only mode (Firebase disabled)"
4. App will use localStorage only
5. Authentication bypass activated (direct to dashboard)

### Firebase Fallback Behavior:
- If Firebase fails to initialize → automatic fallback to localStorage
- If network unavailable → localStorage used
- If authentication fails → redirect to login page
- Console shows clear status messages for debugging

## Success Criteria

✅ **Ready for Deployment:**
- All production files identified and documented
- Firebase status clear (enabled with fallback)
- `.nojekyll` file present
- All paths relative
- Documentation complete
- No critical console errors locally

✅ **Deployment Successful:**
- Live URL accessible
- All pages load without 404 errors
- Login flow works (or bypasses correctly)
- Data loads and displays
- CRUD operations functional
- Mobile responsive

## Contact & Support

- **Repository:** https://github.com/starlightkristen/A-Damn-Fine-Bridal-Party
- **Issues:** https://github.com/starlightkristen/A-Damn-Fine-Bridal-Party/issues
- **Live Portal:** https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/

---

**Next Steps:**
1. Complete remaining checklist items
2. Deploy to GitHub Pages
3. Run post-deployment verification
4. Complete workflow testing
5. Document any issues found
