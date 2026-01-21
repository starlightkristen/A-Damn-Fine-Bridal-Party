# 🌲 A Damn Fine Bridal Party 🌲

> *"The owls are not what they seem..."*

A complete GitHub Pages portal for planning Marlena's Twin Peaks themed bridal party, featuring an interactive murder mystery experience called "A Toast to Secrets" with **full inline CRUD editors** for all data.

## 💛 A Note on Planning

I had fun planning this and got a little carried away building out the site! Feel free to change anything, simplify it, or adjust to what works for your group. No hard feelings on any adjustments - the goal is for everyone to have fun!

## 🎭 About This Portal

This fully interactive static site provides everything needed to plan and execute a memorable Twin Peaks themed bridal celebration, with **live editing capabilities**:

- **Murder Mystery Game**: Complete story, character packets, and clues - all editable
- **Decor Planning**: Mood boards, shopping lists, and vendor contacts with inline editors
- **Menu Planning**: Twin Peaks inspired dishes with dynamic categories and full CRUD
- **Schedule Management**: 2-hour run-of-show timeline (editable)
- **Guest Management**: Full CRUD editor with character assignments and personalized invitations
- **Data Administration**: Global Data Manager with import/export/reset for all datasets
- **Autosave**: Optional browser storage persistence with toggle control

## 🚀 Quick Links

- **Live Portal**: [https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/](https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/)
- **Submit Guests**: [Use GitHub Issue Form](https://github.com/starlightkristen/A-Damn-Fine-Bridal-Party/issues/new?template=guest-list.yml)
- **View Issues**: [GitHub Issues](https://github.com/starlightkristen/A-Damn-Fine-Bridal-Party/issues)

## 📋 Deployment Status

**Production Ready** ✅  
*Last verified: January 21, 2026*

- ✅ Firebase integration configured with automatic fallback to localStorage
- ✅ All 8 production HTML files identified and documented
- ✅ GitHub Pages compatibility verified (`.nojekyll` present, relative paths)
- ✅ Comprehensive testing and deployment documentation created
- 📚 See [PRODUCTION_FILES.md](PRODUCTION_FILES.md) for complete file inventory
- 📋 See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for deployment guide
- 🧪 See [tests/workflow-test.md](tests/workflow-test.md) for testing checklist

## ✨ New Interactive Features

### Live Editing
- **Add/Edit/Delete** functionality for guests and menu items directly in the browser
- **Modal forms** with full validation for data entry
- **Dynamic rendering** - categories and options derived from actual data
- **Empty state handling** - friendly prompts when datasets are empty

### Data Management
- **Import/Export**: Download and upload JSON files for all datasets
- **Autosave Toggle**: Enable browser storage to persist changes automatically
- **Reset to Defaults**: Restore repository defaults with confirmation
- **Global Data Manager**: Centralized admin panel for all 9 datasets

### Datasets with CRUD Support
1. ✅ **Guests** - Full inline editor with all fields (name, email, phone, address, RSVP, dietary, accessibility, roleVibe, seating)
2. ✅ **Menu** - Full inline editor with dynamic categories (add/edit/delete menu items)
3. ✅ **Decor** - Full inline editor for mood boards and shopping list (add/edit/delete categories and items)
4. ✅ **Schedule** - Full inline editor for timeline (add/edit/delete timeline items with all fields)
5. ✅ **Story** - Import/export/reset via mystery page and admin panel
6. ✅ **Clues** - Import/export/reset via mystery page and admin panel
7. ✅ **Packets** - Import/export/reset via mystery page and admin panel
8. ✅ **Vendors** - Import/export/reset via admin panel (separate from decor)
9. ✅ **Characters** - Import/export/reset via admin panel

## 🎨 Theme Colors

The portal uses the official Twin Peaks color palette:

- **Deep Cherry Red**: `#8B0000` - The iconic red curtains and cherry pie
- **Gold**: `#C79810` - Elegant accents and highlights
- **Forest Emerald Green**: `#0B4F3F` - Pacific Northwest forests

## 📂 Portal Structure

```
A-Damn-Fine-Bridal-Party/
├── index.html              # Home dashboard with overview stats
├── decor.html             # Mood board, shopping list, vendors
├── food.html              # Menu with inline CRUD editor
├── mystery.html           # Story overview, character list, printables
├── schedule.html          # 2-hour run-of-show timeline
├── guests.html            # Guest CRUD editor with character assignments
├── admin.html             # Global Data Manager panel
├── assets/
│   ├── styles.css         # Twin Peaks themed styling
│   ├── app.js             # Main application logic with CRUD helpers
│   ├── modules/
│   │   └── render.js      # Page rendering functions
│   └── images/
│       └── .keep          # Placeholder for images
├── data/
│   ├── guests.json        # Guest list with 2 seed guests
│   ├── characters.json    # Mystery character roles
│   ├── decor.json         # Decor mood boards and shopping
│   ├── vendors.json       # Vendor contacts (NEW)
│   ├── menu.json          # Twin Peaks themed menu items
│   ├── schedule.json      # Event timeline blocks
│   ├── story.json         # "A Toast to Secrets" mystery
│   ├── clues.json         # Mystery clues
│   └── packets.json       # Character packets
└── .github/
    └── ISSUE_TEMPLATE/
        └── guest-list.yml # Guest submission form
```

## 🌐 Enabling GitHub Pages

To make this portal live on GitHub Pages:

1. Go to your repository **Settings**
2. Navigate to **Pages** in the left sidebar
3. Under "Build and deployment":
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for deployment
6. Visit: `https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/`

The `.nojekyll` file ensures GitHub Pages serves the site correctly without Jekyll processing.

## 📝 Using the Interactive Editors

### Guest Editor (guests.html)

**Adding a Guest:**
1. Click **"➕ Add Guest"** button
2. Fill in the modal form with guest details:
   - Name (required)
   - Email, phone, address
   - RSVP status, dietary restrictions, accessibility needs
   - Role vibe/personality for character matching
   - Assigned character (dropdown)
3. Click **"Save Guest"**

**Editing a Guest:**
1. Click **"✏️ Edit"** button next to any guest
2. Update fields in the modal form
3. Click **"Save Changes"**

**Deleting a Guest:**
1. Click **"🗑️"** button next to any guest
2. Confirm deletion

**Other Actions:**
- **✉️ Copy Invite** - Copies personalized invitation text
- **🖨️ Print Packet** - Opens printable character packet
- **📂 Import** - Upload guests.json file
- **📥 Export** - Download current guest list as JSON
- **🔄 Reset** - Restore default guest list

### Menu Editor (food.html)

**Adding a Menu Item:**
1. Click **"➕ Add Menu Item"** button
2. Fill in the form:
   - Name and category (can type new category or select existing)
   - Description, serves, prep time
   - Allergens and dietary options (comma-separated)
3. Click **"Save Menu Item"**

**Editing a Menu Item:**
1. Click **"✏️"** button on any menu item
2. Update fields
3. Click **"Save Changes"**

**Dynamic Categories:**
- Categories are automatically derived from your menu items
- Type a new category name to create one
- Existing categories appear as suggestions

**Interactive Features:**
- **☆ Star** - Mark favorites
- **🏆 Feature** - Designate featured items with gold border
- **Import/Export/Reset** - Same as guest editor

### Decor Editor (decor.html)

**Mood Boards:**
1. Click **"➕ Add Mood Board"** to create a new theme
2. Fill in name, description, colors (comma-separated hex codes), and items (comma-separated)
3. Edit with **"✏️"** or delete with **"🗑️"**
4. Use **"🤍 Favorite"** and **"+ Add to Shopping List"** interactive toggles

**Shopping List:**
1. Click **"➕ Add Category"** to create a new shopping category (e.g., Linens, Lighting)
2. Within each category, click **"➕"** to add items
3. Edit item details: item name, quantity, estimated cost
4. Toggle **"✓ Purchased"** status with checkbox button
5. Delete items or entire categories with **"🗑️"**

**Import/Export/Reset:**
- Same functionality as other editors
- Preserves favorites and shopping list selections

### Schedule Editor (schedule.html)

**Adding Timeline Items:**
1. Click **"➕ Add Timeline Item"** button
2. Fill in the comprehensive form:
   - Time (e.g., "0:00 - 0:15") and duration
   - Title and description
   - Activities (one per line)
   - Music notes
   - Phase (dropdown: intro, mid, pre-final, final)
   - Envelope instruction (for mystery phase items)
   - Host notes
3. Click **"Add Timeline Item"**

**Editing/Deleting:**
- **"✏️ Edit"** - Modify any timeline item
- **"🗑️"** - Delete with confirmation

**Features:**
- Supports multi-phase timeline blocks
- Activities rendered as bullet list
- Phase badges color-coded
- Import/Export/Reset functionality

### Mystery Data Management (mystery.html + admin.html)

**Story, Clues, and Packets:**
- Managed primarily through **Import/Export** workflow
- Edit JSON files externally and import with validation
- Access via mystery.html quick actions or admin panel Global Data Manager

**Export Buttons:**
- **📥 Export Story** - Download story.json
- **📥 Export Clues** - Download clues.json  
- **📥 Export Packets** - Download packets.json

**Import Process:**
1. Click **"📂 Import"** button
2. Select JSON file
3. Preview shows item count
4. Confirm to apply changes
5. Schema validation prevents invalid data

**Reset:**
- Restore repository defaults for any dataset
- Confirmation dialog prevents accidental resets

### Global Data Manager (admin.html)

The admin panel provides centralized management for all datasets:

**For Each Dataset:**
- **📥 Export** - Download JSON file
- **📂 Import** - Upload JSON file with validation
- **🔄 Reset** - Restore repository defaults
- **📄 View** - Open raw JSON file

**Autosave Toggle:**
- Enable to save all changes to browser localStorage
- Disable for temporary session (export to save)
- Clear indicator shows current state

## 📝 How to Update Data

All data is stored in JSON files in the `/data` directory. You have multiple options:

### Option 1: Use the Interactive Editors (Recommended)
1. Navigate to the appropriate page (guests.html, food.html, admin.html)
2. Use Add/Edit/Delete buttons to modify data
3. Enable autosave or use Export buttons to save changes
4. Commit exported JSON files to your repository

### Option 2: GitHub Web Editor
1. Navigate to the data file you want to edit (e.g., `data/guests.json`)
2. Click the pencil icon to edit
3. Make your changes
4. Commit changes with a descriptive message
5. Refresh the portal to see updates

### Option 2: Local Development
1. Clone the repository
2. Edit JSON files in the `/data` directory
3. Commit and push changes
4. GitHub Pages will automatically update

## 🔒 Data Persistence Options

### Autosave (Browser Storage)
- **Enable**: Toggle in guest editor, menu editor, or admin panel
- **Storage**: Uses browser localStorage
- **Pros**: Changes persist across page reloads
- **Cons**: Limited to one browser/device; can be cleared
- **Use for**: Active planning sessions

### Export/Import (File-Based)
- **Export**: Downloads JSON file of current data
- **Import**: Uploads JSON file with validation
- **Pros**: Shareable, portable, version-controllable
- **Cons**: Manual save/load process
- **Use for**: Backing up, sharing, committing to repo

### Repository Defaults
- **Reset Button**: Restores original data from repo
- **Confirmation**: Always asks before resetting
- **Use for**: Starting fresh or fixing mistakes

### Data Files

- **guests.json**: Guest list with all contact and preference details
- **characters.json**: Mystery character roles and personalities
- **decor.json**: Mood boards and shopping lists (vendors moved to separate file)
- **vendors.json**: Vendor contacts and notes (NEW separate dataset)
- **menu.json**: Menu items with dynamic categories
- **schedule.json**: Event timeline and activities
- **story.json**: Mystery plot and solution
- **clues.json**: Mystery clues with reveal phases
- **packets.json**: Character packets with envelopes

## 👥 Submitting Guests

Use the GitHub Issue form to submit guest information:

1. Click **"Issues"** tab in the repository
2. Click **"New Issue"**
3. Select **"Guest List Submission"** template
4. Fill in guest details (Name | Email | Dietary Restrictions)
5. Submit the issue with label `guest-list`

This creates a tracked record of guest submissions that can be reviewed and added to the data files.

## 🎭 Mystery Details

**"A Toast to Secrets"** is a 2-hour murder mystery experience featuring:

- **Dynamic Character Roles**: Number of characters determined by your data
- **Twin Peaks Setting**: The Great Northern Hotel atmosphere
- **Interactive Investigation**: 35-minute free-form mystery solving
- **Dramatic Reveal**: Kitchen torch cupcake burning ceremony
- **Printable Packets**: Individual character briefings for each guest

### Default Character Roles

The repository includes 23 characters (6 core + 17 supporting roles):

1. **Audrey Horne** (Socialite) - Sophisticated and mysterious
2. **Dale Cooper** (Detective) - Quirky FBI agent and coffee lover
3. **Shelly Johnson** (Waitress) - Warm and observant diner waitress
4. **The Log Lady** (Mystic) - Eccentric prophet with warnings
5. **Josie Packard** (Business Owner) - Elegant and ambitious (the murderer!)
6. **Andy Brennan** (Deputy) - Kind-hearted but clumsy deputy

You can add more characters by editing `characters.json`!

## 🔄 Cache-Busting for Updates

When you update JavaScript files (`app.js`, `render.js`), browsers may serve cached old versions to users. To force browsers to load fresh code:

1. Update the version parameter in all HTML files
2. Change `?v=20260121` to `?v=YYYYMMDD` (today's date)
3. Commit and push changes

**Example:**
```html
<script src="./assets/app.js?v=20260121"></script>
```

This forces browsers to treat it as a new file and download the latest version.

## ⚙️ Technical Notes

### Static Site Architecture
- **No Backend Required**: Pure client-side HTML/CSS/JavaScript
- **Data Fetching**: Uses `fetch()` API to load JSON files
- **CRUD Operations**: Full create/read/update/delete in-browser
- **LocalStorage Support**: Optional browser storage for persistence
- **Import/Export**: JSON file upload/download with validation
- **Print Functionality**: Character packets generated client-side using browser print dialog

### Browser Compatibility
- Modern browsers with ES6+ support required
- `fetch()` API, `localStorage`, and `FileReader` API support needed
- Works on mobile, tablet, and desktop

### Data Persistence Models
1. **Temporary (Default)**: Changes exist only in current session
2. **Browser Storage (Autosave)**: Persists to localStorage when enabled
3. **Firebase/Firestore (Optional)**: Cloud sync with authentication (currently enabled with fallback)
4. **File Export**: Manual download to JSON files for backup/sharing
5. **Repository Commit**: Commit exported JSON files to GitHub for permanent storage

### Firebase Configuration
The portal includes optional Firebase/Firestore integration for cloud-based data persistence:

- **Status**: Currently **ENABLED** with automatic fallback to localStorage
- **Configuration**: See `assets/firebase-config.js` and `assets/firebase-manager.js`
- **Features**: Real-time sync, authentication, cross-device persistence
- **Fallback**: Automatically uses localStorage if Firebase fails to initialize
- **Console Logging**: Clear status messages show Firebase state:
  - ✅ "Firebase initialized successfully" - Firebase working
  - ⚠️ "Falling back to local-only mode" - Firebase failed, using localStorage
  - 🔧 "Running in local-only mode (Firebase disabled)" - Firebase disabled in config

**To disable Firebase and run in local-only mode:**
1. Open `assets/app.js`
2. Change `const FIREBASE_ENABLED = true;` to `const FIREBASE_ENABLED = false;`
3. Portal will use localStorage only (no authentication required)

### Limitations
- **Client-Side Only**: No backend processing (Firebase optional)
- **Single-User**: No collaborative editing (without Firebase)
- **Browser Storage Limits**: LocalStorage has size limits (~5-10MB)
- **Manual Sync**: Changes must be exported and committed to share with others

## 🎉 Event Day Checklist

- [ ] Export all final data from portal (use Export buttons)
- [ ] Print all character packets and seal in envelopes
- [ ] Place character cards under seats before guests arrive
- [ ] Set up coffee station ("Damn Fine Coffee")
- [ ] Prepare cherry pie and other Twin Peaks themed foods
- [ ] Test kitchen torch for cupcake reveal
- [ ] Queue up Twin Peaks soundtrack playlist
- [ ] Prepare props (magnifying glasses, fake evidence, etc.)
- [ ] Have backup clues ready in case guests get stuck
- [ ] Designate someone to take photos throughout
- [ ] Keep mystery solution notes handy but hidden

## 🎨 Customization

The portal is fully customizable:

### Visual Customization
- Edit theme colors in `assets/styles.css` (CSS variables at top)
- Modify layouts and styling as needed
- Add custom images to `assets/images/`

### Content Customization (via Editors)
- **Add Characters**: Use admin panel to import custom characters.json
- **Modify Story**: Edit story.json with your mystery plot
- **Custom Menu**: Add/edit menu items with the inline editor
- **Timeline Adjustments**: Edit schedule.json for your event timing
- **Add Guests**: Use the guest editor to build your list

### Developer Customization
- Extend CRUD editors in `assets/modules/render.js`
- Add new datasets following existing patterns
- Customize validation rules in `assets/app.js`

## 📄 License

This project is created for personal use in planning Marlena's bridal party. Twin Peaks and related characters are property of their respective copyright holders. This is a fan project for private celebration use.

## 🙏 Credits

Created with love for Marlena's celebration, inspired by David Lynch's Twin Peaks.

---

*"Every day, once a day, give yourself a present. Don't plan it. Don't wait for it. Just let it happen."* - Dale Cooper

Enjoy planning this damn fine bridal party! 🍒☕🌲
