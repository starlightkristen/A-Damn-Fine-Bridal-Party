# Manual Testing Checklist for GitHub Pages Deployment

## Test Environment
- **Live URL:** https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/
- **Test Date:** [To be filled]
- **Tester:** [To be filled]

## Pre-Test Setup
- [ ] Clear browser cache and localStorage
- [ ] Open browser DevTools console
- [ ] Use incognito/private window for clean state

## Test 1: Host Login Flow
- [ ] Navigate to live URL
- [ ] Should redirect to `/login.html`
- [ ] Enter host credentials (email/password)
- [ ] Click "Host Sign In"
- [ ] **Expected:** Redirect to `index.html` dashboard
- [ ] **Verify:** Console shows "Firebase initialized" or "Running in local-only mode"
- [ ] **Verify:** Navigation bar shows all menu items including "Admin"

## Test 2: Guest CRUD Operations
- [ ] Navigate to `guests.html`
- [ ] Click "➕ Add Guest" button
- [ ] Fill in guest form:
  - Name: "Test Guest"
  - Email: "test@example.com"
  - RSVP: "Confirmed"
- [ ] Click "Save Guest"
- [ ] **Expected:** Guest appears in table
- [ ] **Verify:** Console shows "Data saved to [Firestore/localStorage]"

## Test 3: Data Persistence
- [ ] Note current guest count
- [ ] Click "Sign Out" in navigation
- [ ] **Expected:** Redirect to login page
- [ ] Log back in with same host credentials
- [ ] Navigate to `guests.html`
- [ ] **Expected:** Test guest still appears in table
- [ ] **Verify:** Data persisted correctly

## Test 4: Export Functionality
- [ ] On `guests.html`, click "📥 Export" button
- [ ] **Expected:** Download `guests.json` file
- [ ] Open file and verify Test Guest is present
- [ ] **Verify:** JSON is valid and complete

## Test 5: Resident Login Flow (Optional)
- [ ] Sign out if logged in
- [ ] On login page, scroll to "Enter Village" section
- [ ] Enter name: "Test Resident"
- [ ] Enter phone: "555-1234"
- [ ] Click "Enter Village"
- [ ] **Expected:** Redirect to dashboard
- [ ] **Verify:** Admin menu item is hidden
- [ ] **Verify:** Can view but limited edit capabilities

## Test 6: Mobile Responsiveness
- [ ] Open DevTools responsive mode
- [ ] Test on mobile (375px width)
- [ ] **Verify:** Navigation is mobile-friendly
- [ ] **Verify:** Forms are usable on small screens
- [ ] **Verify:** Tables are responsive/scrollable

## Test 7: Page Navigation
- [ ] From dashboard, click each navigation link:
  - [ ] Guests
  - [ ] Food & Menu
  - [ ] Decor
  - [ ] Mystery
  - [ ] Schedule
  - [ ] Admin (if host)
- [ ] **Verify:** All pages load without errors
- [ ] **Verify:** No 404 errors in console

## Test 8: Data Loading
- [ ] On each page, verify data loads correctly:
  - [ ] `guests.html` - Guest list displays
  - [ ] `food.html` - Menu items display
  - [ ] `decor.html` - Mood boards and shopping list display
  - [ ] `mystery.html` - Story and characters display
  - [ ] `schedule.html` - Timeline displays
- [ ] **Verify:** No console errors during data load

## Test 9: Edit Operations
- [ ] On `guests.html`, click "✏️ Edit" on any guest
- [ ] Change a field (e.g., update RSVP status)
- [ ] Click "Save Changes"
- [ ] **Expected:** Changes reflected immediately
- [ ] **Verify:** No errors in console

## Test 10: Delete Operations
- [ ] On `guests.html`, click "🗑️" on the test guest
- [ ] Confirm deletion
- [ ] **Expected:** Guest removed from table
- [ ] **Verify:** No errors in console

## Results Summary
- [ ] All tests passed ✅
- [ ] Some tests failed ⚠️ (document below)
- [ ] Critical issues found 🚨 (document below)

### Issues Found:
[Document any failures here]

### Recommendations:
[Document suggested fixes here]

---

## Notes on Firebase Status

**If Firebase is Enabled (FIREBASE_ENABLED = true):**
- Console should show: "✅ Firebase initialized successfully"
- Data saves to Firestore
- Real-time sync between devices/tabs
- Requires authentication

**If Firebase is Disabled (FIREBASE_ENABLED = false):**
- Console should show: "🔧 Running in local-only mode (Firebase disabled)"
- Data saves to localStorage
- No sync between devices/tabs
- No authentication required (bypasses login)

**Fallback Behavior:**
- If Firebase fails to initialize (network issues, credentials invalid), app automatically falls back to localStorage
- Console will show: "⚠️ Falling back to local-only mode with localStorage"

## Testing After Deployment Changes

When testing after making changes:
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Clear localStorage** (DevTools > Application > Local Storage > Clear)
3. **Hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check console** for any errors or warnings

## Known Limitations

- **localStorage** has a ~5-10MB size limit
- **Firestore free tier** has usage limits (50k reads/day, 20k writes/day)
- **GitHub Pages** serves static files only (no server-side processing)
- **CORS** may affect loading local JSON files in some browsers

## Success Criteria

✅ **Deployment is successful if:**
- All 8 production pages load without errors
- Login flow works (or properly bypasses in local-only mode)
- Data persists across page reloads
- CRUD operations work correctly
- Mobile responsiveness is acceptable
- No critical console errors

⚠️ **Needs attention if:**
- Firebase fails to initialize (but fallback to localStorage works)
- Some non-critical features don't work
- Performance is slower than expected

🚨 **Critical failure if:**
- Pages don't load (404 errors)
- Data doesn't save at all
- Login completely broken
- Console shows JavaScript errors preventing app from running
