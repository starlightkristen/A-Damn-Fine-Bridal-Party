# 🌲 A Damn Fine Bridal Party 🌲

> *"The owls are not what they seem..."*

A complete GitHub Pages portal for planning Marlena's Twin Peaks themed bridal party, featuring an interactive murder mystery experience called "A Toast to Secrets."

## 🎭 About This Portal

This static site provides everything needed to plan and execute a memorable Twin Peaks themed bridal celebration, including:

- **Murder Mystery Game**: Complete story, character packets, and clues
- **Decor Planning**: Mood boards, shopping lists, and vendor contacts
- **Menu Planning**: Twin Peaks inspired dishes with prep timelines
- **Schedule Management**: 2-hour run-of-show timeline
- **Guest Management**: Character assignments and personalized invitations
- **Data Administration**: JSON-based data management and validation

## 🚀 Quick Links

- **Live Portal**: [https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/](https://starlightkristen.github.io/A-Damn-Fine-Bridal-Party/)
- **Submit Guests**: [Use GitHub Issue Form](https://github.com/starlightkristen/A-Damn-Fine-Bridal-Party/issues/new?template=guest-list.yml)
- **View Issues**: [GitHub Issues](https://github.com/starlightkristen/A-Damn-Fine-Bridal-Party/issues)

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
├── food.html              # Menu, allergy map, prep timeline
├── mystery.html           # Story overview, character list, printables
├── schedule.html          # 2-hour run-of-show timeline
├── guests.html            # Character assignments, invite copier
├── admin.html             # Data links and validation utility
├── assets/
│   ├── styles.css         # Twin Peaks themed styling
│   ├── app.js             # Main application logic
│   ├── modules/
│   │   └── render.js      # Page rendering functions
│   └── images/
│       └── .keep          # Placeholder for images
├── data/
│   ├── guests.json        # Guest list with 2 seed guests
│   ├── characters.json    # Mystery character roles
│   ├── decor.json         # Decor mood boards and shopping
│   ├── menu.json          # Twin Peaks themed menu items
│   ├── schedule.json      # Event timeline blocks
│   └── story.json         # "A Toast to Secrets" mystery
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

## 📝 How to Update Data

All data is stored in JSON files in the `/data` directory. To update:

### Option 1: GitHub Web Editor
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

### Data Files

- **guests.json**: Add/edit guests with name, email, dietary restrictions, and character assignments
- **characters.json**: Add more mystery characters or edit existing ones
- **decor.json**: Update mood boards, shopping lists, and vendor information
- **menu.json**: Add menu items, update prep timeline, or manage allergen information
- **schedule.json**: Adjust the event timeline and activities
- **story.json**: Modify the mystery plot, clues, or solution

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

- **6 Character Roles**: Socialite, Detective, Waitress, Mystic, Business Owner, Deputy
- **Twin Peaks Setting**: The Great Northern Hotel atmosphere
- **Interactive Investigation**: 35-minute free-form mystery solving
- **Dramatic Reveal**: Kitchen torch cupcake burning ceremony
- **Printable Packets**: Individual character briefings for each guest

### Character Roles

1. **Audrey Horne** (Socialite) - Sophisticated and mysterious
2. **Dale Cooper** (Detective) - Quirky FBI agent and coffee lover
3. **Shelly Johnson** (Waitress) - Warm and observant diner waitress
4. **The Log Lady** (Mystic) - Eccentric prophet with warnings
5. **Josie Packard** (Business Owner) - Elegant and ambitious (the murderer!)
6. **Andy Brennan** (Deputy) - Kind-hearted but clumsy deputy

## ⚙️ Technical Notes

### Static Site Architecture
- **No Backend Required**: Pure client-side HTML/CSS/JavaScript
- **Data Fetching**: Uses `fetch()` API to load JSON files
- **In-Memory Processing**: Character assignments and other interactive features don't persist unless JSON files are manually updated
- **Print Functionality**: Character packets generated client-side using browser print dialog

### Browser Compatibility
- Modern browsers with ES6+ support required
- `fetch()` API support needed for data loading
- Works on mobile, tablet, and desktop

### Limitations
- **No Real-Time Persistence**: Changes made in the UI (like character assignments) are temporary
- **Manual Data Updates**: JSON files must be edited directly for permanent changes
- **No User Authentication**: This is a public planning portal
- **GitHub Issues for Submissions**: Guest data collected via GitHub Issues, not automatically integrated

## 🎉 Event Day Checklist

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

Feel free to customize this portal for your event:

- Edit theme colors in `assets/styles.css` (CSS variables at top)
- Add more characters to `data/characters.json`
- Customize the mystery story in `data/story.json`
- Add menu items to `data/menu.json`
- Update the timeline in `data/schedule.json`

## 📄 License

This project is created for personal use in planning Marlena's bridal party. Twin Peaks and related characters are property of their respective copyright holders. This is a fan project for private celebration use.

## 🙏 Credits

Created with love for Marlena's celebration, inspired by David Lynch's Twin Peaks.

---

*"Every day, once a day, give yourself a present. Don't plan it. Don't wait for it. Just let it happen."* - Dale Cooper

Enjoy planning this damn fine bridal party! 🍒☕🌲
