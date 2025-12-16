# Firebase Integration Setup Guide

## Overview

Your "A Damn Fine Bridal Party" site now has Firebase backend integration for real-time collaboration between you and Marlena! 

**What This Means:**
- ✅ Login with email/password
- ✅ All edits auto-save to cloud
- ✅ Real-time sync - you see Marlena's changes instantly (and vice versa)
- ✅ Works offline - changes sync when reconnected
- ✅ No export/import workflow needed

## Current Setup

**Firebase Project:** `bridal-party-planner`
- **Project ID:** `bridal-party-planner`
- **Region:** Default (us-central1)
- **Services Enabled:**
  - Firebase Authentication (Email/Password)
  - Cloud Firestore Database
  - Offline Persistence

## Required Steps to Complete Setup

### 1. Add Marlena as a User

1. Go to Firebase Console: https://console.firebase.google.com/project/bridal-party-planner/authentication/users
2. Click the "Add user" button
3. Enter Marlena's email address
4. Create a strong password (suggest using a password generator)
5. Click "Add user"
6. **Send Marlena her credentials securely** (via text or encrypted message - not email)

### 2. Configure Firestore Security Rules

**IMPORTANT:** Without these rules, your database will be open to the world!

1. Go to Firestore Rules: https://console.firebase.google.com/project/bridal-party-planner/firestore/rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write only for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"** button (top-right)
4. Wait for confirmation message

### 3. Test the Integration

**Test #1: Your Login**
1. Visit your site URL (the GitHub Pages URL)
2. You should be redirected to `login.html`
3. Log in with your email and password
4. You should be redirected to the home page
5. Check top-right corner - your email should be displayed with a "Sign Out" button

**Test #2: Data Sync**
1. Open the Guests page
2. Add a new guest or edit an existing one
3. Open Firebase Console → Firestore Data: https://console.firebase.google.com/project/bridal-party-planner/firestore/data
4. You should see a `datasets` collection with `guests` document
5. The data should match what you just edited

**Test #3: Real-Time Sync (Two Browsers)**
1. Open your site in Chrome (logged in as you)
2. Open your site in Firefox/Safari (logged in as Marlena - or simulate with your account)
3. In Chrome: Add a guest
4. In Firefox: The new guest should appear within 1-2 seconds!

### 4. Share Credentials with Marlena

Send Marlena:
1. **Site URL:** Your GitHub Pages URL (https://yourusername.github.io/A-Damn-Fine-Bridal-Party/)
2. **Email:** The email address you added for her
3. **Password:** The password you created (send securely!)
4. **Instructions:**
   - "Go to [site URL]"
   - "Log in with your email and password"
   - "Start editing! Changes save automatically."

## How to Use

### For You (Admin/Host)

**Daily Usage:**
1. Visit site → Log in
2. Edit any data on any page
3. Changes save automatically
4. See Marlena's edits appear in real-time
5. Click "Sign Out" when done (optional - session persists)

**Managing Data:**
- **Export:** Still available on all pages - downloads current state as JSON
- **Import:** Upload JSON files to bulk update data
- **Reset:** Restores repository defaults (original JSON files)

### For Marlena (Collaborator)

**What She Needs to Know:**
1. "Log in at [site URL] with your email/password"
2. "Edit guests, menu, decor, schedule just like a document"
3. "Your changes save automatically - no save button needed!"
4. "You'll see my changes appear live while you're working"

**What She DOESN'T Need:**
- No GitHub account required
- No technical knowledge required
- No understanding of "export/import" workflow
- No need to commit or push anything

## Data Structure in Firestore

Your data is stored in Firestore with this structure:

```
datasets (collection)
├── guests (document)
│   ├── data: [array of guest objects]
│   ├── updatedAt: "2024-01-15T10:30:00Z"
│   └── updatedBy: "your@email.com"
├── characters (document)
├── decor (document)
├── vendors (document)
├── menu (document)
├── schedule (document)
├── story (document)
├── clues (document)
└── packets (document)
```

Each document contains:
- `data`: The actual dataset (guests array, menu object, etc.)
- `updatedAt`: Timestamp of last update (ISO 8601 format)
- `updatedBy`: Email of user who made the change

## Troubleshooting

### "Access denied" or "Permission denied" errors
**Problem:** Firestore rules not set correctly
**Solution:** Go to Firestore Rules and verify the rules match the template above. Click "Publish" after changing.

### "Not logged in" - keeps redirecting to login page
**Problem:** Firebase Authentication not working
**Solution:** 
1. Check Firebase Console → Authentication → Make sure Email/Password is enabled
2. Verify your user exists in the Users tab
3. Try clearing browser cache and cookies

### Changes not syncing between users
**Problem:** Real-time listeners not connected
**Solution:**
1. Open browser console (F12) and check for errors
2. Verify you're both logged in
3. Check internet connection
4. Try refreshing the page

### "Firebase not initialized" errors
**Problem:** Firebase config issue
**Solution:**
1. Check `assets/firebase-config.js` exists
2. Verify the config object has all required fields (apiKey, authDomain, projectId, etc.)
3. Make sure `FIREBASE_ENABLED = true` in `assets/app.js`

### Offline editing not working
**Problem:** Offline persistence not enabled
**Solution:** This should be automatic. If not working:
1. Check browser console for persistence errors
2. Try using a different browser (some browsers block IndexedDB)
3. Private/Incognito mode may disable persistence

## Disabling Firebase (If Needed)

If you want to go back to the old localStorage-only system:

1. Open `assets/app.js`
2. Change line 4 from:
   ```javascript
   const FIREBASE_ENABLED = true;
   ```
   to:
   ```javascript
   const FIREBASE_ENABLED = false;
   ```
3. Commit and push the change
4. Site will work exactly like before (no login required, localStorage only)

## Firebase Free Tier Limits

Your usage is well within Firebase's generous free tier:

**Firestore:**
- ✅ Reads: 50,000/day (you'll use ~100/day)
- ✅ Writes: 20,000/day (you'll use ~50/day)
- ✅ Storage: 1 GB (you'll use ~1 MB)

**Authentication:**
- ✅ Users: Unlimited (you have 2)
- ✅ Logins: Unlimited

**Realtime:**
- ✅ Simultaneous connections: 100 (you need 2)

**You will NOT be charged** unless you massively exceed these limits (extremely unlikely with 2 users).

## Security Notes

- Firebase config in client code is **safe to expose** (it's public by design)
- Security is enforced by Firestore Rules, not by hiding the config
- Your Firestore Rules only allow authenticated users to read/write
- API keys are restricted to your domain in Firebase Console
- HTTPS is enforced automatically

## Support

If you have issues:
1. Check browser console (F12) for error messages
2. Check Firebase Console for database/auth status
3. Refer to this guide's Troubleshooting section
4. Check Firebase documentation: https://firebase.google.com/docs

## Summary

✅ **What's Done:**
- Firebase project created and configured
- Authentication system with login page
- Firestore database with 9 collections
- Real-time sync between users
- Offline support
- Auto-save on every edit

⏳ **What You Need to Do:**
1. Add Marlena as user in Firebase Console
2. Set Firestore security rules
3. Test the login and sync
4. Send Marlena her credentials

🎉 **Result:**
- You and Marlena can collaborate in real-time
- No technical workflow needed
- Changes sync instantly
- Works like Google Docs!
