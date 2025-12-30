// A Damn Fine Bridal Party - Main Application Logic

// Firebase Integration Flag
// Set this to true to enable Firebase backend, false to use localStorage only
const FIREBASE_ENABLED = true; // Re-enabled with quick fallback to JSON

// Firebase Manager (will be initialized if enabled)
let FirebaseManager = null;

// Global data store
const AppData = {
  guests: [],
  characters: [],
  decor: {},
  vendors: [],
  menu: {},
  schedule: {},
  story: {},
  clues: [],
  packets: [],
  settings: {},
  roles: {},
  pageNotes: {},
  // In-memory state for interactive features
  decorFavorites: new Set(),
  decorShoppingList: new Set(),
  menuFavorites: new Set(),
  menuFeatured: new Set(),
  rolePreferences: {}, // guestId -> characterId mapping
  currentPhase: 'intro', // Track current mystery phase
  phaseTimerState: null, // Track phase timer state
  cupcakeRevealIndex: 0, // Track cupcake reveal progress
  // Autosave settings
  autosaveEnabled: false,
  // Original defaults for reset
  defaults: {},
  // Firebase sync enabled
  firebaseSyncEnabled: FIREBASE_ENABLED,
  // History for undo
  historyStack: [],
  // Host email list
  hostEmails: ['kstehlar@solarainnovations.com', 'marlenamoomoo@gmail.com']
};

// Helper to check if current user is a Host
window.isHost = function() {
  if (!FIREBASE_ENABLED || !FirebaseManager || !FirebaseManager.currentUser) return false;
  return AppData.hostEmails.includes(FirebaseManager.currentUser.email.toLowerCase());
}

// Get display identity for the current user
function getUserIdentity() {
  if (isHost()) return `Host (${FirebaseManager.currentUser.email})`;
  return sessionStorage.getItem('resident_identity') || 'Guest Resident';
}

// Push current state to history stack
function pushToHistory() {
  try {
    // Limit stack size to 10
    if (AppData.historyStack.length >= 10) {
      AppData.historyStack.shift();
    }
    
    // Save relevant datasets
    const state = {
      guests: JSON.parse(JSON.stringify(AppData.guests || [])),
      decor: JSON.parse(JSON.stringify(AppData.decor || {})),
      menu: JSON.parse(JSON.stringify(AppData.menu || {})),
      schedule: JSON.parse(JSON.stringify(AppData.schedule || {})),
      story: JSON.parse(JSON.stringify(AppData.story || {})),
      clues: JSON.parse(JSON.stringify(AppData.clues || [])),
      packets: JSON.parse(JSON.stringify(AppData.packets || [])),
      settings: JSON.parse(JSON.stringify(AppData.settings || {})),
      pageNotes: JSON.parse(JSON.stringify(AppData.pageNotes || {})),
      timestamp: new Date().getTime()
    };
    
    AppData.historyStack.push(state);
    console.log('Action saved to history');
    
    // Update UI visibility if button exists
    const undoBtn = document.getElementById('undo-btn-container');
    if (undoBtn) undoBtn.style.display = 'block';
  } catch (e) {
    console.warn('Failed to save history state:', e);
  }
}

// Undo last action
async function handleUndo() {
  if (!AppData.historyStack || AppData.historyStack.length === 0) {
    alert('Nothing to undo!');
    return;
  }
  
  const prevState = AppData.historyStack.pop();
  
  // Restore data
  AppData.guests = prevState.guests;
  AppData.decor = prevState.decor;
  AppData.menu = prevState.menu;
  AppData.schedule = prevState.schedule;
  AppData.story = prevState.story;
  AppData.clues = prevState.clues;
  AppData.packets = prevState.packets;
  AppData.settings = prevState.settings;
  AppData.pageNotes = prevState.pageNotes;
  
  // Sync all restored data to Firebase/localStorage
  try {
    if (FIREBASE_ENABLED && FirebaseManager) {
      if (typeof window.notifySaveStart === 'function') window.notifySaveStart('all');
      
      const datasets = ['guests', 'decor', 'menu', 'schedule', 'story', 'clues', 'packets', 'settings', 'pageNotes'];
      await Promise.all(datasets.map(ds => FirebaseManager.saveData(ds, AppData[ds])));
    } else {
      saveToLocalStorage();
    }
    
    // Re-render
    if (typeof window.renderCurrentPage === 'function') {
      window.renderCurrentPage();
    }
    
    // Update UI visibility
    const undoBtn = document.getElementById('undo-btn-container');
    if (undoBtn && AppData.historyStack.length === 0) undoBtn.style.display = 'none';
    
    alert('Successfully undone last action!');
  } catch (error) {
    console.error('Undo sync failed:', error);
    alert('Undo partial success - UI updated but failed to sync to cloud.');
  }
}

// Initialize Firebase if enabled
async function initFirebase() {
  if (!FIREBASE_ENABLED) return null;
  
  try {
    const module = await import('./firebase-config.js');
    FirebaseManager = module.default;
    await FirebaseManager.init();
    console.log('Firebase initialized successfully');
    return FirebaseManager;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return null;
  }
}

// Load all data on page initialization
async function loadData() {
  console.log('🚀 Starting data load...');
  
  try {
    // ALWAYS load JSON files first for immediate display
    console.log('📁 Loading JSON files for immediate display...');
    const [guests, characters, decor, vendors, menu, schedule, story, clues, packets, settings, roles, pageNotes] = await Promise.all([
      fetch('./data/guests.json').then(r => r.json()),
      fetch('./data/characters.json').then(r => r.json()),
      fetch('./data/decor.json').then(r => r.json()),
      fetch('./data/vendors.json').then(r => r.json()),
      fetch('./data/menu.json').then(r => r.json()),
      fetch('./data/schedule.json').then(r => r.json()),
      fetch('./data/story.json').then(r => r.json()),
      fetch('./data/clues.json').then(r => r.json()),
      fetch('./data/packets.json').then(r => r.json()),
      fetch('./data/settings.json').then(r => r.json()),
      fetch('./data/roles.json').then(r => r.json()),
      fetch('./data/pageNotes.json').then(r => r.json()).catch(() => ({}))
    ]);
    
    // Apply JSON data immediately
    AppData.guests = guests;
    AppData.characters = characters;
    AppData.decor = decor;
    AppData.vendors = vendors;
    AppData.menu = menu;
    AppData.schedule = schedule;
    AppData.story = story;
    AppData.clues = clues;
    AppData.packets = packets;
    AppData.settings = settings;
    AppData.roles = roles;
    AppData.pageNotes = pageNotes;
    
    console.log('✅ JSON data loaded and applied immediately');
    
    // Store defaults for reset functionality
    if (!AppData.defaults.guests) {
      AppData.defaults = {
        guests: JSON.parse(JSON.stringify(guests)),
        characters: JSON.parse(JSON.stringify(characters)),
        decor: JSON.parse(JSON.stringify(decor)),
        vendors: JSON.parse(JSON.stringify(vendors)),
        menu: JSON.parse(JSON.stringify(menu)),
        schedule: JSON.parse(JSON.stringify(schedule)),
        story: JSON.parse(JSON.stringify(story)),
        clues: JSON.parse(JSON.stringify(clues)),
        packets: JSON.parse(JSON.stringify(packets)),
        settings: JSON.parse(JSON.stringify(settings)),
        roles: JSON.parse(JSON.stringify(roles)),
        pageNotes: JSON.parse(JSON.stringify(pageNotes))
      };
    }
    
    // THEN try Firebase in background (non-blocking)
    if (FIREBASE_ENABLED) {
      console.log('🔥 Initializing Firebase in background...');
      setTimeout(async () => {
        try {
          if (!FirebaseManager) {
            await initFirebase();
          }
          if (FirebaseManager && FirebaseManager.currentUser) {
            console.log('🔄 Firebase ready - future changes will sync');
          }
        } catch (error) {
          console.log('ℹ️ Firebase not available, continuing with JSON-only mode');
        }
      }, 100); // Start Firebase init after content is displayed
    }
      console.log('Loading data from Firestore...');
      
      // Check if data has been seeded before
      const meta = await FirebaseManager.readMeta();
      const isSeeded = meta && meta.seeded === true;
      
      const datasets = ['guests', 'characters', 'decor', 'vendors', 'menu', 'schedule', 'story', 'clues', 'packets', 'settings', 'roles', 'pageNotes'];
      
      if (isSeeded) {
        // Data has been seeded, load from Firestore
        console.log('Loading from previously seeded Firestore data...');
        const loaded = {};
        
        for (const dataset of datasets) {
          const data = await FirebaseManager.loadData(dataset);
          if (data !== null) {
            loaded[dataset] = data;
          }
        }
        
        // Apply loaded data (Firestore is source of truth)
        AppData.guests = loaded.guests || [];
        AppData.characters = loaded.characters || [];
        AppData.decor = loaded.decor || {};
        AppData.vendors = loaded.vendors || [];
        AppData.menu = loaded.menu || {};
        AppData.schedule = loaded.schedule || {};
        AppData.story = loaded.story || {};
        AppData.clues = loaded.clues || [];
        AppData.packets = loaded.packets || [];
        AppData.settings = loaded.settings || {};
        AppData.roles = loaded.roles || { assignments: {} };
        AppData.pageNotes = loaded.pageNotes || {};
        
        // Set up real-time listeners for all datasets
        for (const dataset of datasets) {
          FirebaseManager.listenToData(dataset, (data) => {
            AppData[dataset] = data;
            // Re-render the page if needed
            if (typeof window.renderCurrentPage === 'function') {
              window.renderCurrentPage();
            }
          });
        }
        
        console.log('Data loaded from Firestore');
        
        // CRITICAL: Ensure new Resident roles exist for larger guest lists
        if (!AppData.characters.find(c => c.id === 'resident-diner')) {
          console.log('Syncing missing Resident roles to Firestore...');
          const newChars = [
            {
              "id": "resident-diner",
              "name": "Diner Regular",
              "role": "Village Resident",
              "briefing": "You've eaten breakfast at the Double R Diner every day for twenty years. You know the exact taste of Norma's cherry pie, and you're the first to notice that Morgan's 'heritage' pie is a perfect copy—right down to the secret cinnamon-clove ratio.",
              "costume": "Plaid shirt, trucker hat, denim jacket, coffee mug in hand",
              "secret": "You saw Shelly (the waitress) handing a thick envelope of cash to Cassandra (the blogger) last week in a dark corner of the diner.",
              "personality": "Talkative, loyal to Norma, observant of small habits",
              "objective": "Confirm the recipe was stolen and find out why Shelly was paying the victim"
            },
            {
              "id": "resident-historian",
              "name": "Town Historian",
              "role": "Village Resident",
              "briefing": "You manage the Twin Peaks Historical Bureau. You've traced every family tree in the valley back to the 1800s. When Morgan claimed her recipe was a 'Blackwood Family Heritage,' you knew she was lying—the Blackwoods were loggers, not bakers.",
              "costume": "Tweed blazer, glasses on a chain, old ledger or book, very proper",
              "secret": "You know that Audrey (the socialite) has been desperately trying to buy up the land under Morgan's shop to expand her family's empire.",
              "personality": "Meticulous, a bit pedantic, obsessed with 'the record'",
              "objective": "Expose the false heritage claim and investigate Audrey's motives"
            },
            {
              "id": "resident-ranger",
              "name": "Forest Ranger",
              "role": "Village Resident",
              "briefing": "You patrol the woods around Ghostwood National Forest. You see things at night that most people ignore. On the morning of the tragedy, you saw a dark SUV speeding away from the pie shop at 4:00 AM.",
              "costume": "Green ranger hat, cargo pants, hiking boots, flashlight (prop)",
              "secret": "You found a discarded bottle of digitalis (heart medication) in the woods near the shop. You've heard Audrey's father uses that exact brand.",
              "personality": "Sturdy, quiet, suspicious of 'city folk'",
              "objective": "Identify the dark SUV and find out who dropped the medicine bottle"
            }
          ];
          
          // Remove old generic if it exists
          AppData.characters = AppData.characters.filter(c => c.id !== 'generic');
          
          // Add new ones
          AppData.characters.push(...newChars);
          await FirebaseManager.saveData('characters', AppData.characters);
          
          // Sync packets
          const newPackets = [
            {
              "character_id": "resident-diner",
              "intro_profile": {
                "name": "Diner Regular",
                "role": "Village Resident",
                "tagline": "The coffee is good, but the gossip is better",
                "overview": "You've been a fixture at the Double R for decades. You know every face in this town. You were there the morning Morgan bought that pie, but you also saw something else—something that doesn't fit the 'sweet waitress' image Shelly projects.",
                "costume_essentials": ["Plaid shirt", "Trucker hat", "Coffee mug"],
                "personality_notes": "A bit of a chatterbox. You love Norma and suspect anyone who tries to compete with her.",
                "secret_preview": "You saw a secret exchange of cash between Shelly and the victim..."
              },
              "envelopes": [
                {
                  "phase": "intro",
                  "title": "Envelope 1: Morning Observations",
                  "contents": "You were at the diner at dawn. Morgan was there too, buying a whole pie. But the real shock was seeing Shelly (the waitress) slipping a thick envelope of cash to Cassandra (the blogger). Why would a waitress be paying a researcher?",
                  "instructions": "Mention seeing Shelly pay Cassandra. Ask Shelly where she got that kind of money."
                },
                {
                  "phase": "mid",
                  "title": "Envelope 2: The Taste Test",
                  "contents": "You've tasted the 'Blackwood Heritage' pie. It's Norma's recipe. No doubt about it. You've also heard rumors that Cassandra was planning to write an expose on Shelly's 'extracurricular activities.'",
                  "instructions": "Confirm the recipe is stolen. Spread the word that Shelly might have had a reason to want Cassandra silent."
                },
                {
                  "phase": "pre-final",
                  "title": "Envelope 3: Pressure at the Counter",
                  "contents": "Shelly's been acting nervous. Every time the blogger's name comes up, she drops a spoon. You suspect the cash you saw was hush money—but was it enough?",
                  "instructions": "Confront Shelly about the hush money. Does she have a receipt or a reason?"
                },
                {
                  "phase": "final",
                  "title": "Envelope 4: Witness to the End",
                  "contents": "The truth is coming out. Morgan is the one who stole the recipe, but Shelly was the one who helped Cassandra prove it! The money wasn't hush money—it was payment for the evidence! Morgan killed Cassandra to stop the exchange.",
                  "instructions": "Clear Shelly's name! Explain that she was Cassandra's secret source. Prepare for the cupcake reveal."
                }
              ]
            },
            {
              "character_id": "resident-historian",
              "intro_profile": {
                "name": "Town Historian",
                "role": "Village Resident",
                "tagline": "The records never lie",
                "overview": "You are the guardian of Twin Peaks' past. You know who was born where and who owns what land. Morgan's claims of 'family heritage' offended your sense of historical accuracy immediately.",
                "costume_essentials": ["Tweed jacket", "Old ledger", "Reading glasses"],
                "personality_notes": "Meticulous and proper. You find 'marketing' to be a form of modern lying.",
                "secret_preview": "You found a birth record that changes everything about the victim..."
              },
              "envelopes": [
                {
                  "phase": "intro",
                  "title": "Envelope 1: The Blackwood Lie",
                  "contents": "You checked the archives. The Blackwoods were never bakers—they were timber magnates who went bust in the 20s. Morgan's 'grandmother's recipe' is a complete fabrication.",
                  "instructions": "Expose the false heritage claim. Ask Morgan why she's lying about her family history."
                },
                {
                  "phase": "mid",
                  "title": "Envelope 2: The Secret Relation",
                  "contents": "You found a sealed record in the attic. Cassandra Vale wasn't just a blogger—she was Norma Jennings' long-lost granddaughter, given up for adoption decades ago. She came here to reclaim her family's legacy.",
                  "instructions": "Reveal the TWIST: Cassandra was Norma's relative! This gives her a major motive to take down the recipe thief."
                },
                {
                  "phase": "pre-final",
                  "title": "Envelope 3: Land and Ambition",
                  "contents": "Audrey Horne has been making secret inquiries about the property value of Morgan's shop. She wanted that land, and Cassandra's investigation was the perfect wrecking ball to drive the price down.",
                  "instructions": "Suggest that Audrey might have been using Cassandra to bankrupt Morgan. Ask Audrey if she's happy the blogger is gone."
                },
                {
                  "phase": "final",
                  "title": "Envelope 4: The Final Chronicle",
                  "contents": "The history books are being written today. Morgan stole from a family she didn't belong to and killed the last true heir of that recipe. Justice is the only way to close this chapter.",
                  "instructions": "Announce that the recipe belongs to Norma's bloodline. Prepare for the cupcake reveal."
                }
              ]
            },
            {
              "character_id": "resident-ranger",
              "intro_profile": {
                "name": "Forest Ranger",
                "role": "Village Resident",
                "tagline": "Nature hears every scream",
                "overview": "You spend your time among the Douglas Firs. You're more comfortable with owls than people. But you saw something in the woods that morning—something that looks like poison.",
                "costume_essentials": ["Ranger hat", "Flashlight", "Hiking boots"],
                "personality_notes": "Quiet and watchful. You don't trust easy, especially when people bring 'city medicine' into your woods.",
                "secret_preview": "You found a medicine bottle that belongs to the socialite's family..."
              },
              "envelopes": [
                {
                  "phase": "intro",
                  "title": "Envelope 1: The Dark SUV",
                  "contents": "At 4:00 AM, a dark SUV—the kind the Hornes drive—was speeding away from the pie shop. The engine was roaring like someone was in a desperate hurry.",
                  "instructions": "Tell the detective about the dark SUV. Ask Audrey if she was out driving early this morning."
                },
                {
                  "phase": "mid",
                  "title": "Envelope 2: The Poison in the Pines",
                  "contents": "You found a discarded bottle of digitalis (heart medication) near the back door of the shop. It's a powerful heart stimulant that can be fatal in the wrong dose. The label is partially torn, but you see the Horne family name.",
                  "instructions": "Reveal the poison bottle! Confront Audrey about her family's medication. This is a huge red herring!"
                },
                {
                  "phase": "pre-final",
                  "title": "Envelope 3: Shadows in the Shop",
                  "contents": "You saw a figure in the window of the shop just before dawn. They were wearing pearls—very distinctive. You assumed it was Morgan, but Audrey Horne also loves her pearls.",
                  "instructions": "Describe the 'Figure in Pearls.' Point out that it could be Morgan OR Audrey. Sow doubt about who was really in the kitchen."
                },
                {
                  "phase": "final",
                  "title": "Envelope 4: Clear Skies",
                  "contents": "The wind changed. You realized Audrey's SUV was stolen that night—Morgan took it to frame her! The digitalis bottle was planted. Morgan is the only one who had the recipe and the access. The forest knows the truth.",
                  "instructions": "Reveal that the evidence against Audrey was planted! Point the finger firmly at Morgan for the final time."
                }
              ]
            }
          ];
          
          // Remove old generic packet if exists
          AppData.packets = AppData.packets.filter(p => p.character_id !== 'generic');
          
          // Add new ones
          AppData.packets.push(...newPackets);
          await FirebaseManager.saveData('packets', AppData.packets);
          
          // Also sync new clues
          const newClues = [
            {
              "id": "clue-017",
              "holder_id": "resident-ranger",
              "type": "implicates",
              "text": "Found a discarded bottle of digitalis heart medication in the woods. It has the Horne family name on it. Digitalis is deadly in high doses.",
              "reveal_phase": "mid",
              "target_id": "socialite",
              "proof_level": "strong",
              "trade_hint": "A dangerous discovery—someone's medicine is at the scene"
            },
            {
              "id": "clue-018",
              "holder_id": "resident-diner",
              "type": "implicates",
              "text": "Saw Shelly the waitress handing a thick envelope of cash to Cassandra. It looked like hush money.",
              "reveal_phase": "mid",
              "target_id": "waitress",
              "proof_level": "medium",
              "trade_hint": "Waitress secrets—why the payout?"
            },
            {
              "id": "clue-019",
              "holder_id": "resident-historian",
              "type": "twist",
              "text": "Birth records show Cassandra's real mother was Norma's daughter who left town years ago. Cassandra is Norma's granddaughter!",
              "reveal_phase": "mid",
              "target_id": null,
              "proof_level": "strong",
              "trade_hint": "The blogger had a blood connection to the recipe"
            },
            {
              "id": "clue-020",
              "holder_id": "detective",
              "type": "timeline",
              "text": "Audrey's SUV was reported stolen at 3:00 AM. Someone else was driving it the morning of the murder.",
              "reveal_phase": "pre-final",
              "target_id": "owner",
              "proof_level": "strong",
              "trade_hint": "The framing attempt begins to crumble"
            }
          ];
          
          // Add new clues if they don't exist
          newClues.forEach(nc => {
            if (!AppData.clues.find(c => c.id === nc.id)) {
              AppData.clues.push(nc);
            }
          });
          await FirebaseManager.saveData('clues', AppData.clues);
          
          // Sync story updates
          AppData.story.overview = "In a town where secrets hide behind warm smiles and cherry pie, someone has crossed a dangerous line. What began as recipe theft has ended in tragedy. When Cassandra, a food blogger investigating local culinary heritage, is found dead from a poisoned pie slice, guests must unravel the truth. Was it about money, pride, or protecting a legacy? And was Cassandra just a blogger, or did she have a deeper connection to this town?";
          AppData.story.theMurder = {
            "concept": "Legacy & Betrayal",
            "object": "Poisoned Cherry Pie Slice",
            "victim": "Cassandra Vale",
            "victimDescription": "A food blogger who was actually Norma's secret granddaughter, uncovering the theft of her family's most precious legacy.",
            "causeOfDeath": "Poisoned cherry pie slice (Digitalis)",
            "timeOfDeath": "Early morning, before the bridal shower began",
            "location": "Outside Morgan's new artisan pie shop"
          };
          AppData.story.theMurderer = {
            "character": "Morgan Blackwood (Venue Owner)",
            "motive": "Cassandra found proof that Morgan stole the recipe and threatened her $50K investor deal. Morgan stole Audrey's SUV and planted her father's medication to frame the socialite, and tried to frame the waitress by making her secret payments look like hush money.",
            "method": "Poisoned a slice of the stolen cherry pie recipe and gave it to Cassandra as a 'sample' to 'clear things up'",
            "coverUp": "Morgan is framing Audrey with a planted medicine bottle and framing Shelly by making their business arrangement look suspicious."
          };
          AppData.story.solution = "Morgan Blackwood stole Norma's cherished recipe to secure investor funding. When she discovered Cassandra—Norma's secret granddaughter—had proof of the theft, Morgan stole Audrey's SUV to travel to the shop undetected and poisoned Cassandra with digitalis. She planted the medicine bottle to frame Audrey and made Shelly's secret 'spy' payments look like hush money to shift the blame. The cupcakes reveal the layer of lies before confirming Morgan's guilt.";
          AppData.story.cupcakeReveal = [
            "The recipe was stolen...",
            "From Norma's kitchen.",
            "Cassandra knew the truth.",
            "She was Norma's blood.",
            "A stolen SUV in the dark.",
            "A bottle planted to frame.",
            "Audrey is innocent.",
            "Shelly's cash was a spy's pay.",
            "Morgan's lies are toxic.",
            "A poisoned sample of success.",
            "Morgan Blackwood is the killer.",
            "The legacy returns home.",
            "Secrets can't stay buried.",
            "Celebrate Marlena!"
          ];
          await FirebaseManager.saveData('story', AppData.story);
        }
        
        // CRITICAL: Ensure 'generic' role exists for larger guest lists
        if (!AppData.characters.find(c => c.id === 'generic')) {
          console.log('Syncing missing "Twin Peaks Resident" role to Firestore...');
          const genericChar = {
            "id": "generic",
            "name": "Twin Peaks Resident",
            "role": "Local Investigator",
            "briefing": "You are a local resident of Twin Peaks. You've known these people for years, and you're shocked by the tragedy. Since the Sheriff's station is overwhelmed, you've been deputized to help Special Agent Cooper and Deputy Andy solve this case.",
            "costume": "Plaid shirts, denim, warm PNW layers, or 1950s casual wear",
            "secret": "You don't have a personal secret yet, but you have sharp ears. You've heard rumors about recipe theft at the diner.",
            "personality": "Curious, helpful, protective of the town",
            "objective": "Interview the key suspects (Audrey, Shelly, Morgan) and help piece together the timeline"
          };
          AppData.characters.push(genericChar);
          await FirebaseManager.saveData('characters', AppData.characters);
          
          // Also sync the generic packet if missing
          if (!AppData.packets.find(p => p.character_id === 'generic')) {
            const genericPacket = {
              "character_id": "generic",
              "intro_profile": {
                "name": "Twin Peaks Resident",
                "role": "Local Investigator",
                "tagline": "Everyone in this town has a story",
                "overview": "You are a long-time resident of Twin Peaks. You've seen the town change, but you've never seen anything like this. Special Agent Cooper has asked for your help in talking to the suspects—you know them better than he does, after all.",
                "costume_essentials": ["Plaid shirt", "Work boots", "Thermos of coffee"],
                "personality_notes": "Friendly but persistent. You know how to get people talking over a cup of joe.",
                "secret_preview": "You've heard whispers at the diner about Norma's missing recipes..."
              },
              "envelopes": [
                {
                  "phase": "intro",
                  "title": "Envelope 1: Citizen Deputized",
                  "contents": "Agent Cooper has asked you to keep an eye on Morgan Blackwood. She seems overly concerned about the blogger's absence. Talk to the other residents and see if anyone saw Cassandra this morning.",
                  "instructions": "Interview Shelly at the diner. Ask if she saw anyone buying pies early this morning."
                },
                {
                  "phase": "mid",
                  "title": "Envelope 2: Gathering Local Rumors",
                  "contents": "The word on the street is that Norma's secret recipe was stolen. Morgan's new business is suspiciously successful. Connect with the Deputy to see if there's any official word on the theft.",
                  "instructions": "Compare notes with Deputy Andy. Ask him about witness statements or arguments."
                },
                {
                  "phase": "pre-final",
                  "title": "Envelope 3: Pressing the Suspects",
                  "contents": "The evidence is mounting. Forensic reports and missing phone records all point to the pie shop. It's time to ask Morgan directly about her 'heritage' recipe.",
                  "instructions": "Confront Morgan about where her recipe really came from. Watch her reaction carefully."
                },
                {
                  "phase": "final",
                  "title": "Envelope 4: The Truth Comes Out",
                  "contents": "The case is solved. You've helped the law enforcement team prove that Morgan is the thief and the murderer. The cupcakes will reveal the final proof for all to see.",
                  "instructions": "Gather with the other residents for the cupcake reveal. Justice is finally coming to Twin Peaks."
                }
              ]
            };
            AppData.packets.push(genericPacket);
            await FirebaseManager.saveData('packets', AppData.packets);
          }
        }
      } else {
        // First time - seed from JSON files
        console.log('First load detected - seeding Firestore from JSON files...');
        const [guests, characters, decor, vendors, menu, schedule, story, clues, packets, settings, roles, pageNotes] = await Promise.all([
          fetch('./data/guests.json').then(r => r.json()),
          fetch('./data/characters.json').then(r => r.json()),
          fetch('./data/decor.json').then(r => r.json()),
          fetch('./data/vendors.json').then(r => r.json()),
          fetch('./data/menu.json').then(r => r.json()),
          fetch('./data/schedule.json').then(r => r.json()),
          fetch('./data/story.json').then(r => r.json()),
          fetch('./data/clues.json').then(r => r.json()),
          fetch('./data/packets.json').then(r => r.json()),
          fetch('./data/settings.json').then(r => r.json()),
          fetch('./data/roles.json').then(r => r.json()),
          fetch('./data/pageNotes.json').then(r => r.json()).catch(() => ({}))
        ]);
        
        AppData.guests = guests;
        AppData.characters = characters;
        AppData.decor = decor;
        AppData.vendors = vendors;
        AppData.menu = menu;
        AppData.schedule = schedule;
        AppData.story = story;
        AppData.clues = clues;
        AppData.packets = packets;
        AppData.settings = settings;
        AppData.roles = roles;
        AppData.pageNotes = pageNotes;
        
        // Save to Firestore (one-time seeding)
        console.log('Saving initial data to Firestore...');
        await Promise.all([
          FirebaseManager.saveData('guests', guests),
          FirebaseManager.saveData('characters', characters),
          FirebaseManager.saveData('decor', decor),
          FirebaseManager.saveData('vendors', vendors),
          FirebaseManager.saveData('menu', menu),
          FirebaseManager.saveData('schedule', schedule),
          FirebaseManager.saveData('story', story),
          FirebaseManager.saveData('clues', clues),
          FirebaseManager.saveData('packets', packets),
          FirebaseManager.saveData('settings', settings),
          FirebaseManager.saveData('roles', roles),
          FirebaseManager.saveData('pageNotes', pageNotes)
        ]);
        
        // Mark as seeded
        await FirebaseManager.writeMeta({
          seeded: true,
          seededAt: new Date().toISOString(),
          seededBy: FirebaseManager.currentUser?.email || 'unknown'
        });
        
        console.log('Firestore seeded successfully - this will not happen again');
        
        // Set up real-time listeners
        for (const dataset of datasets) {
          FirebaseManager.listenToData(dataset, (data) => {
            AppData[dataset] = data;
            if (typeof window.renderCurrentPage === 'function') {
              window.renderCurrentPage();
            }
          });
        }
      }
    } else {
      // Firebase disabled - load from JSON files
      console.log('Firebase disabled - loading data from JSON files...');
      const [guests, characters, decor, vendors, menu, schedule, story, clues, packets, settings, roles, pageNotes] = await Promise.all([
        fetch('./data/guests.json').then(r => r.json()),
        fetch('./data/characters.json').then(r => r.json()),
        fetch('./data/decor.json').then(r => r.json()),
        fetch('./data/vendors.json').then(r => r.json()),
        fetch('./data/menu.json').then(r => r.json()),
        fetch('./data/schedule.json').then(r => r.json()),
        fetch('./data/story.json').then(r => r.json()),
        fetch('./data/clues.json').then(r => r.json()),
        fetch('./data/packets.json').then(r => r.json()),
        fetch('./data/settings.json').then(r => r.json()),
        fetch('./data/roles.json').then(r => r.json()),
        fetch('./data/pageNotes.json').then(r => r.json()).catch(() => ({}))
      ]);
      
      AppData.guests = guests;
      AppData.characters = characters;
      AppData.decor = decor;
      AppData.vendors = vendors;
      AppData.menu = menu;
      AppData.schedule = schedule;
      AppData.story = story;
      AppData.clues = clues;
      AppData.packets = packets;
      AppData.settings = settings;
      AppData.roles = roles;
      AppData.pageNotes = pageNotes;
    }
    
    // Store defaults for reset functionality
    if (!AppData.defaults.guests) {
      const [guests, characters, decor, vendors, menu, schedule, story, clues, packets, settings, roles, pageNotes] = await Promise.all([
        fetch('./data/guests.json').then(r => r.json()),
        fetch('./data/characters.json').then(r => r.json()),
        fetch('./data/decor.json').then(r => r.json()),
        fetch('./data/vendors.json').then(r => r.json()),
        fetch('./data/menu.json').then(r => r.json()),
        fetch('./data/schedule.json').then(r => r.json()),
        fetch('./data/story.json').then(r => r.json()),
        fetch('./data/clues.json').then(r => r.json()),
        fetch('./data/packets.json').then(r => r.json()),
        fetch('./data/settings.json').then(r => r.json()),
        fetch('./data/roles.json').then(r => r.json()),
        fetch('./data/pageNotes.json').then(r => r.json()).catch(() => ({}))
      ]);
      
      AppData.defaults = {
        guests: JSON.parse(JSON.stringify(guests)),
        characters: JSON.parse(JSON.stringify(characters)),
        decor: JSON.parse(JSON.stringify(decor)),
        vendors: JSON.parse(JSON.stringify(vendors)),
        menu: JSON.parse(JSON.stringify(menu)),
        schedule: JSON.parse(JSON.stringify(schedule)),
        story: JSON.parse(JSON.stringify(story)),
        clues: JSON.parse(JSON.stringify(clues)),
        packets: JSON.parse(JSON.stringify(packets)),
        settings: JSON.parse(JSON.stringify(settings)),
        roles: JSON.parse(JSON.stringify(roles)),
        pageNotes: JSON.parse(JSON.stringify(pageNotes))
      };
    }
    
    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    return false;
  }
}

// Initialize app
async function initApp() {
  const loaded = await loadData();
  
  if (!loaded) {
    document.body.innerHTML = `
      <div class="container">
        <div class="alert alert-danger">
          <strong>Error:</strong> Failed to load data. Please ensure all data files are present.
        </div>
      </div>
    `;
    return;
  }
  
  // Set active nav link
  setActiveNavLink();
  
  // Hide restricted nav links for non-hosts
  if (!isHost()) {
    const adminLink = document.querySelector('nav a[href="admin.html"]');
    if (adminLink) adminLink.parentElement.style.display = 'none';
  }
  
  // Initialize save status indicator
  if (FIREBASE_ENABLED) {
    initSaveStatusIndicator();
  }
  
  // Inject Undo Button
  injectUndoButton();
  
  // Render page-specific content
  const page = getPageName();
  if (window.renderPage && typeof window.renderPage === 'function') {
    window.renderPage(page);
  }
}

// Inject floating undo button
function injectUndoButton() {
  if (document.getElementById('undo-btn-container')) return;
  
  const btnHtml = `
    <div id="undo-btn-container" style="position: fixed; bottom: 30px; right: 30px; z-index: 10000; display: none;">
      <button onclick="handleUndo()" class="btn" style="background: var(--gold); color: var(--dark-wood); box-shadow: 0 4px 15px rgba(0,0,0,0.3); border: 2px solid var(--dark-wood); font-weight: bold; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 12px 20px;">
        ↩️ Undo Last Action
      </button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', btnHtml);
}

// Get current page name from URL
function getPageName() {
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '') || 'index';
  return page;
}

// Set active navigation link
function setActiveNavLink() {
  const page = getPageName();
  const links = document.querySelectorAll('nav a');
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `${page}.html` || (page === 'index' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Helper function to calculate stats
function calculateStats() {
  // Helper to check if guest has a valid address
  const hasValidAddress = (guest) => {
    return guest.address && 
           guest.address.street && 
           guest.address.street !== 'TBD' &&
           guest.address.city &&
           guest.address.state;
  };
  
  // Helper to check if guest has RSVP status (not pending/invited)
  const hasRsvp = (guest) => {
    const rsvpLower = (guest.rsvp || 'pending').toLowerCase();
    return rsvpLower === 'confirmed' || rsvpLower === 'tentative' || rsvpLower === 'not attending';
  };
  
  const guestsWithAddress = AppData.guests.filter(hasValidAddress).length;
  const guestsWithRsvp = AppData.guests.filter(hasRsvp).length;
  
  return {
    totalGuests: AppData.guests.length,
    confirmedGuests: AppData.guests.filter(g => g.rsvp === 'confirmed').length,
    pendingGuests: AppData.guests.filter(g => g.rsvp === 'pending' || g.rsvp === 'invited').length,
    assignedCharacters: AppData.guests.filter(g => g.assignedCharacter).length,
    availableCharacters: AppData.characters.length,
    menuItems: AppData.menu && AppData.menu.menuItems ? AppData.menu.menuItems.length : 0,
    decorItems: AppData.decor.shoppingList ? 
      AppData.decor.shoppingList.reduce((sum, cat) => sum + cat.items.length, 0) : 0,
    guestsWithAddress: guestsWithAddress,
    guestsWithRsvp: guestsWithRsvp,
    percentWithAddress: AppData.guests.length > 0 ? Math.round((guestsWithAddress / AppData.guests.length) * 100) : 0,
    percentWithRsvp: AppData.guests.length > 0 ? Math.round((guestsWithRsvp / AppData.guests.length) * 100) : 0
  };
}

// Auto-assign characters to guests
function autoAssignCharacters() {
  const unassignedGuests = AppData.guests.filter(g => !g.assignedCharacter);
  const availableCharacters = [...AppData.characters];
  
  if (unassignedGuests.length > availableCharacters.length) {
    const excess = unassignedGuests.length - availableCharacters.length;
    alert(`Warning: ${excess} guest(s) cannot be assigned. There are more guests than available characters. Consider adding more character roles or having guests share roles.`);
  }
  
  unassignedGuests.forEach((guest, index) => {
    if (index < availableCharacters.length) {
      guest.assignedCharacter = availableCharacters[index].id;
    }
  });
  
  return true;
}

// Generate character packet for printing
function generateCharacterPacket(guestId) {
  const guest = AppData.guests.find(g => g.id === guestId);
  if (!guest || !guest.assignedCharacter) return null;
  
  const character = AppData.characters.find(c => c.id === guest.assignedCharacter);
  if (!character) return null;
  
  return {
    guest: guest,
    character: character
  };
}

// Copy formatted invite text
function generateInviteText(guestId) {
  const guest = AppData.guests.find(g => g.id === guestId);
  if (!guest) return '';
  
  const character = guest.assignedCharacter ? 
    AppData.characters.find(c => c.id === guest.assignedCharacter) : null;
  
  let invite = `Dear ${guest.name},\n\n`;
  invite += `🌲 You're Invited to "A Damn Fine Bridal Party" 🌲\n`;
  invite += `A Twin Peaks Mystery Celebration for Marlena\n\n`;
  invite += `"The owls are not what they seem..."\n\n`;
  
  if (character) {
    invite += `🎭 YOUR SECRET CHARACTER ASSIGNMENT:\n`;
    invite += `Character: ${character.name}\n`;
    invite += `Role: ${character.role}\n\n`;
    invite += `✨ COSTUME IDEAS:\n`;
    invite += `${character.costume || 'Think 1950s Pacific Northwest - plaid, vintage, mysterious elegance.'}\n\n`;
    invite += `📜 YOUR BRIEFING:\n`;
    invite += `${character.briefing}\n\n`;
    invite += `Come prepared to solve a mystery and stay in character! You'll receive more confidential info (like your secrets and objective) in a sealed envelope when you arrive.\n\n`;
  }
  
  invite += `Join us for:\n`;
  invite += `☕ Damn fine coffee and cherry pie\n`;
  invite += `🔍 An immersive murder mystery experience\n`;
  invite += `🎉 Celebration, secrets, and surprises\n`;
  invite += `🌲 Twin Peaks atmosphere and Pacific Northwest charm\n\n`;
  
  invite += `📅 Date: ${AppData.settings.eventDate || '[TO BE ANNOUNCED]'}\n`;
  invite += `⏰ Time: ${AppData.settings.eventTime || '[TO BE ANNOUNCED]'}\n`;
  invite += `📍 Location: ${AppData.settings.eventLocation || '[TO BE ANNOUNCED]'}\n`;
  invite += `🔗 RSVP: [LINK TO BE PROVIDED]\n\n`;
  
  if (guest.dietary && guest.dietary !== 'None') {
    invite += `We have your dietary needs noted: ${guest.dietary}\n\n`;
  }
  
  invite += `"Every day, once a day, give yourself a present."\n`;
  invite += `- Special Agent Dale Cooper\n\n`;
  
  invite += `See you in the woods! 🌲🦉\n`;
  
  return invite;
}

// Validate data integrity
function validateData() {
  const errors = [];
  
  // Check for duplicate guest IDs
  const guestIds = AppData.guests.map(g => g.id);
  const duplicateGuests = guestIds.filter((id, index) => guestIds.indexOf(id) !== index);
  if (duplicateGuests.length > 0) {
    errors.push(`Duplicate guest IDs found: ${duplicateGuests.join(', ')}`);
  }
  
  // Check for duplicate character IDs
  const charIds = AppData.characters.map(c => c.id);
  const duplicateChars = charIds.filter((id, index) => charIds.indexOf(id) !== index);
  if (duplicateChars.length > 0) {
    errors.push(`Duplicate character IDs found: ${duplicateChars.join(', ')}`);
  }
  
  // Check for invalid character assignments
  AppData.guests.forEach(guest => {
    if (guest.assignedCharacter && !AppData.characters.find(c => c.id === guest.assignedCharacter)) {
      errors.push(`Guest ${guest.name} assigned to non-existent character: ${guest.assignedCharacter}`);
    }
  });
  
  return errors;
}

// ============================================================================
// GUEST CRUD FUNCTIONS
// ============================================================================

// Show add guest form in a modal/dialog
function showAddGuestForm() {
  const formHtml = `
    <div id="guest-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Add New Guest</h2>
        <form id="guest-form" onsubmit="handleSaveGuest(event, null)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="grid-column: 1 / -1;">
              <label><strong>Name *</strong></label>
              <input type="text" name="name" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Email</strong></label>
              <input type="email" name="email" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Phone</strong></label>
              <input type="tel" name="phone" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Address</strong></label>
              <input type="text" name="street" placeholder="Street" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-top: 5px;">
                <input type="text" name="city" placeholder="City" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" name="state" placeholder="State" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" name="zip" placeholder="ZIP" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              <input type="text" name="country" placeholder="Country" value="USA" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>RSVP Status</strong></label>
              <select name="rsvp" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="pending">Pending</option>
                <option value="invited">Invited</option>
                <option value="confirmed">Confirmed</option>
                <option value="tentative">Tentative</option>
                <option value="not attending">Not Attending</option>
              </select>
            </div>
            <div>
              <label><strong>Assigned Character</strong></label>
              <select name="assignedCharacter" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">None</option>
                ${AppData.characters.map(c => `<option value="${c.id}">${c.name} (${c.role})</option>`).join('')}
              </select>
            </div>
            <div>
              <label><strong>Dietary Restrictions</strong></label>
              <input type="text" name="dietary" placeholder="e.g., Vegetarian, Gluten-free" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Dietary Severity</strong></label>
              <select name="dietarySeverity" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">None</option>
                <option value="allergy">Allergy</option>
                <option value="intolerance">Intolerance</option>
                <option value="preference">Preference</option>
              </select>
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Accessibility Needs</strong></label>
              <input type="text" name="accessibility" placeholder="e.g., Wheelchair accessible seating" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Role Vibe / Personality</strong></label>
              <input type="text" name="roleVibe" placeholder="e.g., warm and friendly, mysterious and analytical" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Seating Preferences</strong></label>
              <input type="text" name="seatingPreferences" placeholder="e.g., Sit with Sarah, Avoid Alex" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Notes</strong></label>
              <textarea name="notes" rows="3" placeholder="Any additional notes" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeGuestEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Guest</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

// Edit existing guest
function editGuest(guestId) {
  const guest = AppData.guests.find(g => g.id === guestId);
  if (!guest) return;
  
  const formHtml = `
    <div id="guest-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Edit Guest: ${guest.name}</h2>
        <form id="guest-form" onsubmit="handleSaveGuest(event, ${guestId})">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="grid-column: 1 / -1;">
              <label><strong>Name *</strong></label>
              <input type="text" name="name" value="${guest.name || ''}" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Email</strong></label>
              <input type="email" name="email" value="${guest.email || ''}" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Phone</strong></label>
              <input type="tel" name="phone" value="${guest.phone || ''}" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Address</strong></label>
              <input type="text" name="street" placeholder="Street" value="${guest.address?.street || ''}" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
              <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 10px; margin-top: 5px;">
                <input type="text" name="city" placeholder="City" value="${guest.address?.city || ''}" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" name="state" placeholder="State" value="${guest.address?.state || ''}" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <input type="text" name="zip" placeholder="ZIP" value="${guest.address?.zip || ''}" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              <input type="text" name="country" placeholder="Country" value="${guest.address?.country || 'USA'}" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>RSVP Status</strong></label>
              <select name="rsvp" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="pending" ${guest.rsvp === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="invited" ${guest.rsvp === 'invited' ? 'selected' : ''}>Invited</option>
                <option value="confirmed" ${guest.rsvp === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="tentative" ${guest.rsvp === 'tentative' ? 'selected' : ''}>Tentative</option>
                <option value="not attending" ${guest.rsvp === 'not attending' ? 'selected' : ''}>Not Attending</option>
              </select>
            </div>
            <div>
              <label><strong>Assigned Character</strong></label>
              <select name="assignedCharacter" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">None</option>
                ${AppData.characters.map(c => `<option value="${c.id}" ${guest.assignedCharacter === c.id ? 'selected' : ''}>${c.name} (${c.role})</option>`).join('')}
              </select>
            </div>
            <div>
              <label><strong>Dietary Restrictions</strong></label>
              <input type="text" name="dietary" value="${guest.dietary || ''}" placeholder="e.g., Vegetarian, Gluten-free" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Dietary Severity</strong></label>
              <select name="dietarySeverity" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">None</option>
                <option value="allergy" ${guest.dietarySeverity === 'allergy' ? 'selected' : ''}>Allergy</option>
                <option value="intolerance" ${guest.dietarySeverity === 'intolerance' ? 'selected' : ''}>Intolerance</option>
                <option value="preference" ${guest.dietarySeverity === 'preference' ? 'selected' : ''}>Preference</option>
              </select>
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Accessibility Needs</strong></label>
              <input type="text" name="accessibility" value="${guest.accessibility || ''}" placeholder="e.g., Wheelchair accessible seating" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Role Vibe / Personality</strong></label>
              <input type="text" name="roleVibe" value="${guest.roleVibe || ''}" placeholder="e.g., warm and friendly, mysterious and analytical" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Seating Preferences</strong></label>
              <input type="text" name="seatingPreferences" value="${guest.seatingPreferences || ''}" placeholder="e.g., Sit with Sarah, Avoid Alex" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Notes</strong></label>
              <textarea name="notes" rows="3" placeholder="Any additional notes" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">${guest.notes || ''}</textarea>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeGuestEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

// Handle save guest (add or edit)
async function handleSaveGuest(event, guestId) {
  event.preventDefault();
  pushToHistory();
  const form = event.target;
  const formData = new FormData(form);
  
  const guestData = {
    name: formData.get('name'),
    email: formData.get('email') || null,
    phone: formData.get('phone') || null,
    address: {
      street: formData.get('street') || '',
      city: formData.get('city') || '',
      state: formData.get('state') || '',
      zip: formData.get('zip') || '',
      country: formData.get('country') || 'USA'
    },
    rsvp: formData.get('rsvp') || 'pending',
    dietary: formData.get('dietary') || 'None',
    dietarySeverity: formData.get('dietarySeverity') || null,
    accessibility: formData.get('accessibility') || 'None',
    roleVibe: formData.get('roleVibe') || null,
    seatingPreferences: formData.get('seatingPreferences') || null,
    notes: formData.get('notes') || null,
    assignedCharacter: formData.get('assignedCharacter') || null
  };
  
  if (guestId === null) {
    // Add new guest with safer ID generation
    const existingIds = AppData.guests.filter(g => g.id != null).map(g => g.id);
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    guestData.id = newId;
    AppData.guests.push(guestData);
  } else {
    // Update existing guest
    const index = AppData.guests.findIndex(g => g.id === guestId);
    if (index !== -1) {
      AppData.guests[index] = { ...AppData.guests[index], ...guestData };
    }
  }
  
  // Save to Firestore or localStorage with error handling
  try {
    if (FIREBASE_ENABLED && FirebaseManager) {
      // Show saving indicator
      if (typeof window.notifySaveStart === 'function') {
        window.notifySaveStart('guests');
      }
      await FirebaseManager.saveData('guests', AppData.guests);
    } else {
      saveToLocalStorage();
    }
    
    closeGuestEditor();
    
    // Re-render guests table
    if (window.Render && window.Render.guests) {
      window.Render.guests();
    }
    
    // Update stats if they exist
    const stats = calculateStats();
    if (document.getElementById('stat-total')) {
      document.getElementById('stat-total').textContent = stats.totalGuests;
      document.getElementById('stat-confirmed').textContent = stats.confirmedGuests;
      document.getElementById('stat-assigned').textContent = stats.assignedCharacters;
      document.getElementById('stat-pending').textContent = stats.pendingGuests;
    }
  } catch (error) {
    console.error('Error saving guest:', error);
    // Sanitize error message for user display
    const safeMsg = error && error.message ? String(error.message).substring(0, 100).replace(/[<>]/g, '') : 'Unknown error';
    alert('Failed to save guest: ' + safeMsg);
    // Don't close editor on error so user can retry
  }
}

// Delete guest with confirmation
async function deleteGuest(guestId) {
  const guest = AppData.guests.find(g => g.id === guestId);
  if (!guest) return;
  
  if (confirm(`Are you sure you want to delete ${guest.name}? This cannot be undone.`)) {
    pushToHistory();
    AppData.guests = AppData.guests.filter(g => g.id !== guestId);
    
    // Save to Firestore or localStorage
    if (FIREBASE_ENABLED && FirebaseManager) {
      // Show saving indicator
      if (typeof window.notifySaveStart === 'function') {
        window.notifySaveStart('guests');
      }
      await FirebaseManager.saveData('guests', AppData.guests);
    } else {
      saveToLocalStorage();
    }
    
    // Re-render
    if (window.Render && window.Render.guests) {
      window.Render.guests();
    }
    
    // Update stats
    const stats = calculateStats();
    if (document.getElementById('stat-total')) {
      document.getElementById('stat-total').textContent = stats.totalGuests;
      document.getElementById('stat-confirmed').textContent = stats.confirmedGuests;
      document.getElementById('stat-assigned').textContent = stats.assignedCharacters;
      document.getElementById('stat-pending').textContent = stats.pendingGuests;
    }
  }
}

// Close guest editor modal
function closeGuestEditor() {
  const modal = document.getElementById('guest-editor-modal');
  if (modal) {
    modal.remove();
  }
}

// Handle autosave toggle
function handleAutosaveToggle() {
  const enabled = toggleAutosave();
  const toggles = document.querySelectorAll('[id^="autosave-toggle"]');
  toggles.forEach(toggle => {
    toggle.checked = enabled;
  });
  
  const message = enabled ? 
    'Autosave enabled! Your changes will be saved to browser storage.' : 
    'Autosave disabled. Use Export to save your data.';
  alert(message);
}

// Handle import guests
async function handleImportGuests() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importDataset('guests', file);
      
      // Show preview
      if (confirm(`Import ${data.length} guests? This will replace your current guest list.`)) {
        applyImportedData('guests', data);
        
        // Re-render
        if (window.Render && window.Render.guests) {
          window.Render.guests();
        }
        
        // Update stats
        const stats = calculateStats();
        if (document.getElementById('stat-total')) {
          document.getElementById('stat-total').textContent = stats.totalGuests;
          document.getElementById('stat-confirmed').textContent = stats.confirmedGuests;
          document.getElementById('stat-assigned').textContent = stats.assignedCharacters;
          document.getElementById('stat-pending').textContent = stats.pendingGuests;
        }
        
        alert('Guests imported successfully!');
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  
  input.click();
}

// Handle reset guests
async function handleResetGuests() {
  if (confirm('Reset guests to repository defaults? This will discard all changes.')) {
    await resetToDefaults('guests');
    
    // Re-render
    if (window.Render && window.Render.guests) {
      window.Render.guests();
    }
    
    // Update stats
    const stats = calculateStats();
    if (document.getElementById('stat-total')) {
      document.getElementById('stat-total').textContent = stats.totalGuests;
      document.getElementById('stat-confirmed').textContent = stats.confirmedGuests;
      document.getElementById('stat-assigned').textContent = stats.assignedCharacters;
      document.getElementById('stat-pending').textContent = stats.pendingGuests;
    }
    
    alert('Guests reset to defaults!');
  }
}

// Decor functions
function toggleDecorFavorite(itemId) {
  if (AppData.decorFavorites.has(itemId)) {
    AppData.decorFavorites.delete(itemId);
  } else {
    AppData.decorFavorites.add(itemId);
  }
}

function toggleDecorShoppingList(itemId) {
  if (AppData.decorShoppingList.has(itemId)) {
    AppData.decorShoppingList.delete(itemId);
  } else {
    AppData.decorShoppingList.add(itemId);
  }
}

// Menu functions
function toggleMenuFavorite(itemId) {
  if (AppData.menuFavorites.has(itemId)) {
    AppData.menuFavorites.delete(itemId);
  } else {
    AppData.menuFavorites.add(itemId);
  }
}

function toggleMenuFeatured(itemId) {
  if (AppData.menuFeatured.has(itemId)) {
    AppData.menuFeatured.delete(itemId);
  } else {
    AppData.menuFeatured.add(itemId);
  }
}

// ============================================================================
// MENU ITEM CRUD FUNCTIONS
// ============================================================================

// Show add menu item form
function showAddMenuItemForm() {
  // Get existing categories for dropdown
  const categories = [...new Set(AppData.menu.menuItems.map(item => item.category))].sort();
  
  const formHtml = `
    <div id="menu-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Add New Menu Item</h2>
        <form id="menu-form" onsubmit="handleSaveMenuItem(event, null)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="grid-column: 1 / -1;">
              <label><strong>Name *</strong></label>
              <input type="text" name="name" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Category *</strong></label>
              <input type="text" name="category" list="category-list" required placeholder="e.g., Appetizer, Main, Dessert" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
              <datalist id="category-list">
                ${categories.map(cat => `<option value="${cat}">`).join('')}
                <option value="Appetizer">
                <option value="Main">
                <option value="Side">
                <option value="Dessert">
                <option value="Beverage">
              </datalist>
            </div>
            <div>
              <label><strong>Serves</strong></label>
              <input type="text" name="serves" placeholder="e.g., 35 or unlimited" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Description</strong></label>
              <textarea name="description" rows="3" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
            <div>
              <label><strong>Prep Time</strong></label>
              <input type="text" name="prepTime" placeholder="e.g., 30 minutes" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Allergens</strong></label>
              <input type="text" name="allergens" placeholder="Comma-separated, e.g., Gluten, Dairy" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Dietary Options</strong></label>
              <input type="text" name="dietaryOptions" placeholder="Comma-separated, e.g., Can be made vegan, Gluten-free available" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeMenuEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Menu Item</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

// Edit existing menu item
function editMenuItem(itemId) {
  const item = AppData.menu.menuItems.find(i => i.id === itemId);
  if (!item) return;
  
  // Get existing categories for dropdown
  const categories = [...new Set(AppData.menu.menuItems.map(item => item.category))].sort();
  
  const formHtml = `
    <div id="menu-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Edit Menu Item: ${item.name}</h2>
        <form id="menu-form" onsubmit="handleSaveMenuItem(event, '${itemId}')">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="grid-column: 1 / -1;">
              <label><strong>Name *</strong></label>
              <input type="text" name="name" value="${item.name || ''}" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Category *</strong></label>
              <input type="text" name="category" value="${item.category || ''}" list="category-list" required placeholder="e.g., Appetizer, Main, Dessert" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
              <datalist id="category-list">
                ${categories.map(cat => `<option value="${cat}">`).join('')}
                <option value="Appetizer">
                <option value="Main">
                <option value="Side">
                <option value="Dessert">
                <option value="Beverage">
              </datalist>
            </div>
            <div>
              <label><strong>Serves</strong></label>
              <input type="text" name="serves" value="${item.serves || ''}" placeholder="e.g., 35 or unlimited" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Description</strong></label>
              <textarea name="description" rows="3" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">${item.description || ''}</textarea>
            </div>
            <div>
              <label><strong>Prep Time</strong></label>
              <input type="text" name="prepTime" value="${item.prepTime || ''}" placeholder="e.g., 30 minutes" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Allergens</strong></label>
              <input type="text" name="allergens" value="${(item.allergens || []).join(', ')}" placeholder="Comma-separated, e.g., Gluten, Dairy" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Dietary Options</strong></label>
              <input type="text" name="dietaryOptions" value="${(item.dietaryOptions || []).join(', ')}" placeholder="Comma-separated, e.g., Can be made vegan, Gluten-free available" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeMenuEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

// Handle save menu item (add or edit)
async function handleSaveMenuItem(event, itemId) {
  event.preventDefault();
  pushToHistory();
  const form = event.target;
  const formData = new FormData(form);
  
  const itemData = {
    name: formData.get('name'),
    category: formData.get('category'),
    description: formData.get('description') || '',
    serves: formData.get('serves') || '',
    prepTime: formData.get('prepTime') || '',
    allergens: formData.get('allergens') ? formData.get('allergens').split(',').map(s => s.trim()).filter(s => s) : [],
    dietaryOptions: formData.get('dietaryOptions') ? formData.get('dietaryOptions').split(',').map(s => s.trim()).filter(s => s) : []
  };
  
  if (itemId === null) {
    // Add new menu item with more robust ID generation
    const newId = 'menu-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    itemData.id = newId;
    AppData.menu.menuItems.push(itemData);
  } else {
    // Update existing menu item
    const index = AppData.menu.menuItems.findIndex(i => i.id === itemId);
    if (index !== -1) {
      AppData.menu.menuItems[index] = { ...AppData.menu.menuItems[index], ...itemData };
    }
  }
  
  // Save to Firestore or localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart('menu');
    }
    await FirebaseManager.saveData('menu', AppData.menu);
  } else {
    saveToLocalStorage();
  }
  
  closeMenuEditor();
  
  // Re-render menu
  if (window.Render && window.Render.food) {
    window.Render.food();
  }
}

// Delete menu item with confirmation
async function deleteMenuItem(itemId) {
  const item = AppData.menu.menuItems.find(i => i.id === itemId);
  if (!item) return;
  
  if (confirm(`Are you sure you want to delete "${item.name}"? This cannot be undone.`)) {
    pushToHistory();
    AppData.menu.menuItems = AppData.menu.menuItems.filter(i => i.id !== itemId);
    
    // Also remove from favorites/featured sets
    AppData.menuFavorites.delete(itemId);
    AppData.menuFeatured.delete(itemId);
    
    // Save to Firestore or localStorage
    if (FIREBASE_ENABLED && FirebaseManager) {
      if (typeof window.notifySaveStart === 'function') {
        window.notifySaveStart('menu');
      }
      await FirebaseManager.saveData('menu', AppData.menu);
    } else {
      saveToLocalStorage();
    }
    
    // Re-render
    if (window.Render && window.Render.food) {
      window.Render.food();
    }
  }
}

// Close menu editor modal
function closeMenuEditor() {
  const modal = document.getElementById('menu-editor-modal');
  if (modal) {
    modal.remove();
  }
}

// ============================================================================
// PREP TIMELINE CRUD FUNCTIONS
// ============================================================================

// Show add/edit prep timeline phase form
function showPrepTimelineForm(index = null) {
  const phase = index !== null ? AppData.menu.prepTimeline[index] : { time: '', tasks: [] };
  
  const formHtml = `
    <div id="prep-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">${index !== null ? 'Edit' : 'Add'} Prep Phase</h2>
        <form id="prep-form" onsubmit="handleSavePrepPhase(event, ${index})">
          <div style="display: grid; gap: 15px;">
            <div>
              <label><strong>Time Phase *</strong> (e.g., Day Before, Morning of, 2 Hours Before)</label>
              <input type="text" name="time" value="${phase.time}" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Tasks *</strong> (One per line)</label>
              <textarea name="tasks" rows="6" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">${phase.tasks.join('\n')}</textarea>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closePrepEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Phase</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

// Handle save prep phase
async function handleSavePrepPhase(event, index) {
  event.preventDefault();
  pushToHistory();
  const form = event.target;
  const formData = new FormData(form);
  
  const phaseData = {
    time: formData.get('time'),
    tasks: formData.get('tasks').split('\n').map(t => t.trim()).filter(t => t)
  };
  
  if (index === null || index === "null") {
    if (!AppData.menu.prepTimeline) AppData.menu.prepTimeline = [];
    AppData.menu.prepTimeline.push(phaseData);
  } else {
    AppData.menu.prepTimeline[index] = phaseData;
  }
  
  // Save to Firestore or localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') window.notifySaveStart('menu');
    await FirebaseManager.saveData('menu', AppData.menu);
  } else {
    saveToLocalStorage();
  }
  
  closePrepEditor();
  if (window.Render && window.Render.food) window.Render.food();
}

// Show edit form for various list-based sections (Supplies, Vision, Tips, etc.)
function showListEditor(title, dataset, field, currentList) {
  const listText = Array.isArray(currentList) ? currentList.join('\n') : '';
  
  const formHtml = `
    <div id="list-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 100%;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Edit ${title}</h2>
        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Enter one item per line. These will appear as bullet points on the page.</p>
        <form onsubmit="handleSaveList(event, '${dataset}', '${field}')">
          <textarea name="listData" rows="10" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit; margin-bottom: 20px;">${listText}</textarea>
          <div style="text-align: right;">
            <button type="button" onclick="closeListEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

async function handleSaveList(event, dataset, field) {
  event.preventDefault();
  pushToHistory();
  const text = event.target.listData.value;
  const newList = text.split('\n').map(s => s.trim()).filter(s => s);
  
  // Update AppData
  if (dataset === 'schedule') {
    AppData.schedule[field] = newList;
  } else if (dataset === 'menu') {
    AppData.menu[field] = newList;
  } else if (dataset === 'story') {
    AppData.story[field] = newList;
  }
  
  // Save to Firebase
  if (FIREBASE_ENABLED && FirebaseManager) {
    await FirebaseManager.saveData(dataset, AppData[dataset]);
  } else {
    saveToLocalStorage();
  }
  
  closeListEditor();
  if (window.Render && window.Render[getPageName()]) {
    window.Render[getPageName()]();
  }
}

function closeListEditor() {
  const modal = document.getElementById('list-editor-modal');
  if (modal) modal.remove();
}

// Wrapper functions for specific list editors
window.showEditSuppliesForm = () => showListEditor('Supply List', 'schedule', 'supplies', AppData.schedule.supplies);
window.showEditMusicForm = () => {
  // Simple version: combining music categories for the quick editor
  const currentMusic = [...(AppData.schedule.musicSuggestions?.scene || []), "--- Mystery Phase ---", ...(AppData.schedule.musicSuggestions?.mystery || [])];
  showListEditor('Music Playlist', 'schedule', 'music_raw', currentMusic);
};
window.showEditMomentsForm = () => showListEditor('Moments to Capture', 'schedule', 'momentsToCapture', AppData.schedule.momentsToCapture);
window.showEditVisionForm = () => showListEditor('Food Vision', 'menu', 'foodPhilosophy', AppData.menu.foodPhilosophy);
window.showEditTipsForm = () => showListEditor('Anonymous Tips', 'story', 'anonymousTips', AppData.story.anonymousTips);
window.showEditBackupPlansForm = () => {
  const currentPlans = [
    `Stuck: ${AppData.schedule.backupPlans?.guestsStuck || ''}`,
    `Energy: ${AppData.schedule.backupPlans?.guestsNotParticipating || ''}`,
    `Clock: ${AppData.schedule.backupPlans?.runningLong || ''}`
  ];
  showListEditor('Backup Plans', 'schedule', 'backup_raw', currentPlans);
};

// Updated save list to handle specific fields like music
async function handleSaveList(event, dataset, field) {
  event.preventDefault();
  pushToHistory();
  const text = event.target.listData.value;
  const newList = text.split('\n').map(s => s.trim()).filter(s => s);
  
  if (field === 'music_raw') {
    // Split back into categories
    const midIndex = newList.findIndex(item => item.includes('---'));
    const scene = midIndex !== -1 ? newList.slice(0, midIndex) : newList;
    const mystery = midIndex !== -1 ? newList.slice(midIndex + 1) : [];
    AppData.schedule.musicSuggestions = { scene, mystery };
  } else if (field === 'backup_raw') {
    // Parse back into object
    AppData.schedule.backupPlans = {
      guestsStuck: newList.find(s => s.startsWith('Stuck:'))?.replace('Stuck:', '').trim() || '',
      guestsNotParticipating: newList.find(s => s.startsWith('Energy:'))?.replace('Energy:', '').trim() || '',
      runningLong: newList.find(s => s.startsWith('Clock:'))?.replace('Clock:', '').trim() || ''
    };
  } else if (dataset === 'schedule') {
    AppData.schedule[field] = newList;
  } else if (dataset === 'menu') {
    AppData.menu[field] = newList;
  } else if (dataset === 'story') {
    AppData.story[field] = newList;
  }
  
  // Save to Firebase
  if (FIREBASE_ENABLED && FirebaseManager) {
    await FirebaseManager.saveData(dataset, AppData[dataset]);
  } else {
    saveToLocalStorage();
  }
  
  closeListEditor();
  if (window.Render && window.Render[getPageName()]) {
    window.Render[getPageName()]();
  }
}

// Delete prep phase
async function deletePrepPhase(index) {
  if (confirm('Are you sure you want to delete this prep phase?')) {
    pushToHistory();
    AppData.menu.prepTimeline.splice(index, 1);
    
    if (FIREBASE_ENABLED && FirebaseManager) {
      if (typeof window.notifySaveStart === 'function') window.notifySaveStart('menu');
      await FirebaseManager.saveData('menu', AppData.menu);
    } else {
      saveToLocalStorage();
    }
    
    if (window.Render && window.Render.food) window.Render.food();
  }
}

function closePrepEditor() {
  const modal = document.getElementById('prep-editor-modal');
  if (modal) modal.remove();
}

// Handle import menu
async function handleImportMenu() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importDataset('menu', file);
      
      // Show preview
      if (confirm(`Import menu with ${data.menuItems ? data.menuItems.length : 0} items? This will replace your current menu.`)) {
        applyImportedData('menu', data);
        
        // Re-render
        if (window.Render && window.Render.food) {
          window.Render.food();
        }
        
        alert('Menu imported successfully!');
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  
  input.click();
}

// Handle reset menu
async function handleResetMenu() {
  if (confirm('Reset menu to repository defaults? This will discard all changes.')) {
    await resetToDefaults('menu');
    
    // Re-render
    if (window.Render && window.Render.food) {
      window.Render.food();
    }
    
    alert('Menu reset to defaults!');
  }
}

// ============================================================================
// ADMIN DATA MANAGER FUNCTIONS
// ============================================================================

// Generic export handler for admin panel
function handleExportDataset(datasetName) {
  switch(datasetName) {
    case 'guests':
      exportGuests();
      break;
    case 'characters':
      exportCharacters();
      break;
    case 'decor':
      exportDecor();
      break;
    case 'vendors':
      exportVendors();
      break;
    case 'menu':
      exportMenu();
      break;
    case 'schedule':
      exportSchedule();
      break;
    case 'story':
      exportStory();
      break;
    case 'clues':
      exportClues();
      break;
    case 'packets':
      exportPackets();
      break;
    default:
      alert(`Unknown dataset: ${datasetName}`);
  }
}

// Generic import handler for admin panel
async function handleImportDataset(datasetName) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importDataset(datasetName, file);
      
      // Determine count for confirmation
      let count = 0;
      if (Array.isArray(data)) {
        count = data.length;
      } else if (data.menuItems) {
        count = data.menuItems.length;
      } else if (data.timeline) {
        count = data.timeline.length;
      } else if (data.moodBoard) {
        count = data.moodBoard.length;
      }
      
      const message = count > 0 ? 
        `Import ${count} items from ${datasetName}.json? This will replace your current data.` :
        `Import ${datasetName}.json? This will replace your current data.`;
      
      if (confirm(message)) {
        applyImportedData(datasetName, data);
        
        // Re-render if current page matches
        const page = getPageName();
        if (window.Render && window.Render[page]) {
          window.Render[page]();
        }
        
        alert(`${datasetName} imported successfully!`);
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  
  input.click();
}

// Generic reset handler for admin panel
async function handleResetDataset(datasetName) {
  if (confirm(`Reset ${datasetName} to repository defaults? This will discard all changes.`)) {
    await resetToDefaults(datasetName);
    
    // Re-render if current page matches
    const page = getPageName();
    if (window.Render && window.Render[page]) {
      window.Render[page]();
    }
    
    alert(`${datasetName} reset to defaults!`);
  }
}

// ============================================================================
// DECOR CRUD FUNCTIONS
// ============================================================================

// Add mood board
function showAddMoodBoardForm() {
  const formHtml = `
    <div id="decor-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Add New Mood Board</h2>
        <form id="mood-form" onsubmit="handleSaveMoodBoard(event, null)">
          <div style="display: grid; gap: 15px;">
            <div>
              <label><strong>Name *</strong></label>
              <input type="text" name="name" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Description</strong></label>
              <textarea name="description" rows="3" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
            <div>
              <label><strong>Colors (comma-separated hex codes)</strong></label>
              <input type="text" name="colors" placeholder="e.g., #8B0000, #C79810, #2C1810" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Items (comma-separated)</strong></label>
              <textarea name="items" rows="3" placeholder="e.g., Burgundy velvet curtains, Gold candelabras" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeDecorEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Mood Board</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function editMoodBoard(moodId) {
  const mood = AppData.decor.moodBoard.find(m => m.id === moodId);
  if (!mood) return;
  
  const formHtml = `
    <div id="decor-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Edit Mood Board: ${mood.name}</h2>
        <form id="mood-form" onsubmit="handleSaveMoodBoard(event, '${moodId}')">
          <div style="display: grid; gap: 15px;">
            <div>
              <label><strong>Name *</strong></label>
              <input type="text" name="name" value="${mood.name}" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Description</strong></label>
              <textarea name="description" rows="3" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">${mood.description || ''}</textarea>
            </div>
            <div>
              <label><strong>Colors (comma-separated hex codes)</strong></label>
              <input type="text" name="colors" value="${mood.colors.join(', ')}" placeholder="e.g., #8B0000, #C79810, #2C1810" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Items (comma-separated)</strong></label>
              <textarea name="items" rows="3" placeholder="e.g., Burgundy velvet curtains, Gold candelabras" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">${mood.items.join(', ')}</textarea>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeDecorEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

async function handleSaveMoodBoard(event, moodId) {
  event.preventDefault();
  pushToHistory();
  const form = event.target;
  const formData = new FormData(form);
  
  const moodData = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    colors: formData.get('colors') ? formData.get('colors').split(',').map(s => s.trim()).filter(s => s) : [],
    items: formData.get('items') ? formData.get('items').split(',').map(s => s.trim()).filter(s => s) : []
  };
  
  if (moodId === null) {
    const newId = 'mood-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    moodData.id = newId;
    AppData.decor.moodBoard.push(moodData);
  } else {
    const index = AppData.decor.moodBoard.findIndex(m => m.id === moodId);
    if (index !== -1) {
      AppData.decor.moodBoard[index] = { ...AppData.decor.moodBoard[index], ...moodData };
    }
  }
  
  // Save to Firestore or localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart('decor');
    }
    await FirebaseManager.saveData('decor', AppData.decor);
  } else {
    saveToLocalStorage();
  }
  
  closeDecorEditor();
  
  if (window.Render && window.Render.decor) {
    window.Render.decor();
  }
}

async function deleteMoodBoard(moodId) {
  const mood = AppData.decor.moodBoard.find(m => m.id === moodId);
  if (!mood) return;
  
  if (confirm(`Delete "${mood.name}" mood board?`)) {
    pushToHistory();
    AppData.decor.moodBoard = AppData.decor.moodBoard.filter(m => m.id !== moodId);
    AppData.decorFavorites.delete(moodId);
    AppData.decorShoppingList.delete(moodId);
    
    // Save to Firestore or localStorage
    if (FIREBASE_ENABLED && FirebaseManager) {
      if (typeof window.notifySaveStart === 'function') {
        window.notifySaveStart('decor');
      }
      await FirebaseManager.saveData('decor', AppData.decor);
    } else {
      saveToLocalStorage();
    }
    
    if (window.Render && window.Render.decor) {
      window.Render.decor();
    }
  }
}

// Shopping list CRUD
function showAddShoppingCategoryForm() {
  const formHtml = `
    <div id="decor-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 100%;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Add Shopping Category</h2>
        <form id="category-form" onsubmit="handleSaveShoppingCategory(event)">
          <div>
            <label><strong>Category Name *</strong></label>
            <input type="text" name="category" required placeholder="e.g., Linens, Lighting, Centerpieces" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeDecorEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Add Category</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

async function handleSaveShoppingCategory(event) {
  event.preventDefault();
  pushToHistory();
  const form = event.target;
  const formData = new FormData(form);
  
  AppData.decor.shoppingList.push({
    category: formData.get('category'),
    items: []
  });
  
  // Save to Firestore or localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart('decor');
    }
    await FirebaseManager.saveData('decor', AppData.decor);
  } else {
    saveToLocalStorage();
  }
  
  closeDecorEditor();
  
  if (window.Render && window.Render.decor) {
    window.Render.decor();
  }
}

async function deleteShoppingCategory(catIndex) {
  const category = AppData.decor.shoppingList[catIndex];
  if (confirm(`Delete category "${category.category}" and all its items?`)) {
    pushToHistory();
    AppData.decor.shoppingList.splice(catIndex, 1);
    
    // Save to Firestore or localStorage
    if (FIREBASE_ENABLED && FirebaseManager) {
      if (typeof window.notifySaveStart === 'function') {
        window.notifySaveStart('decor');
      }
      await FirebaseManager.saveData('decor', AppData.decor);
    } else {
      saveToLocalStorage();
    }
    
    if (window.Render && window.Render.decor) {
      window.Render.decor();
    }
  }
}

function showAddShoppingItemForm(catIndex) {
  const category = AppData.decor.shoppingList[catIndex];
  const formHtml = `
    <div id="decor-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 100%;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Add Item to ${category.category}</h2>
        <form id="item-form" onsubmit="handleSaveShoppingItem(event, ${catIndex}, null)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="grid-column: 1 / -1;">
              <label><strong>Item *</strong></label>
              <input type="text" name="item" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Quantity *</strong></label>
              <input type="text" name="quantity" required placeholder="e.g., 4, bulk" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Estimated Cost *</strong></label>
              <input type="number" name="estimated" required min="0" step="0.01" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeDecorEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function editShoppingItem(catIndex, itemIndex) {
  const item = AppData.decor.shoppingList[catIndex].items[itemIndex];
  const category = AppData.decor.shoppingList[catIndex];
  
  const formHtml = `
    <div id="decor-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 100%;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Edit ${item.item}</h2>
        <form id="item-form" onsubmit="handleSaveShoppingItem(event, ${catIndex}, ${itemIndex})">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="grid-column: 1 / -1;">
              <label><strong>Item *</strong></label>
              <input type="text" name="item" value="${item.item}" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Quantity *</strong></label>
              <input type="text" name="quantity" value="${item.quantity}" required placeholder="e.g., 4, bulk" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Estimated Cost *</strong></label>
              <input type="number" name="estimated" value="${item.estimated}" required min="0" step="0.01" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeDecorEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

async function handleSaveShoppingItem(event, catIndex, itemIndex) {
  event.preventDefault();
  pushToHistory();
  const form = event.target;
  const formData = new FormData(form);
  
  const itemData = {
    item: formData.get('item'),
    quantity: formData.get('quantity'),
    estimated: parseFloat(formData.get('estimated')),
    purchased: itemIndex !== null ? AppData.decor.shoppingList[catIndex].items[itemIndex].purchased : false
  };
  
  if (itemIndex === null) {
    AppData.decor.shoppingList[catIndex].items.push(itemData);
  } else {
    AppData.decor.shoppingList[catIndex].items[itemIndex] = itemData;
  }
  
  // Save to Firestore or localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart('decor');
    }
    await FirebaseManager.saveData('decor', AppData.decor);
  } else {
    saveToLocalStorage();
  }
  
  closeDecorEditor();
  
  if (window.Render && window.Render.decor) {
    window.Render.decor();
  }
}

async function deleteShoppingItem(catIndex, itemIndex) {
  const item = AppData.decor.shoppingList[catIndex].items[itemIndex];
  if (confirm(`Delete "${item.item}"?`)) {
    pushToHistory();
    AppData.decor.shoppingList[catIndex].items.splice(itemIndex, 1);
    
    // Save to Firestore or localStorage
    if (FIREBASE_ENABLED && FirebaseManager) {
      if (typeof window.notifySaveStart === 'function') {
        window.notifySaveStart('decor');
      }
      await FirebaseManager.saveData('decor', AppData.decor);
    } else {
      saveToLocalStorage();
    }
    
    if (window.Render && window.Render.decor) {
      window.Render.decor();
    }
  }
}

async function togglePurchased(catIndex, itemIndex) {
  AppData.decor.shoppingList[catIndex].items[itemIndex].purchased = 
    !AppData.decor.shoppingList[catIndex].items[itemIndex].purchased;
  
  // Save to Firestore or localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart('decor');
    }
    await FirebaseManager.saveData('decor', AppData.decor);
  } else {
    saveToLocalStorage();
  }
  
  if (window.Render && window.Render.decor) {
    window.Render.decor();
  }
}

function closeDecorEditor() {
  const modal = document.getElementById('decor-editor-modal');
  if (modal) modal.remove();
}

async function handleImportDecor() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importDataset('decor', file);
      
      if (confirm(`Import decor data with ${data.moodBoard?.length || 0} mood boards and ${data.shoppingList?.length || 0} shopping categories?`)) {
        applyImportedData('decor', data);
        
        if (window.Render && window.Render.decor) {
          window.Render.decor();
        }
        
        alert('Decor imported successfully!');
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  
  input.click();
}

async function handleResetDecor() {
  if (confirm('Reset decor to repository defaults?')) {
    await resetToDefaults('decor');
    
    if (window.Render && window.Render.decor) {
      window.Render.decor();
    }
    
    alert('Decor reset to defaults!');
  }
}

// ============================================================================
// SCHEDULE CRUD FUNCTIONS
// ============================================================================

function showAddTimelineForm() {
  const formHtml = `
    <div id="schedule-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Add Timeline Item</h2>
        <form id="timeline-form" onsubmit="handleSaveTimelineItem(event, null)">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <label><strong>Time *</strong></label>
              <input type="text" name="time" required placeholder="e.g., 0:00 - 0:15" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Duration *</strong></label>
              <input type="text" name="duration" required placeholder="e.g., 15 minutes" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Title *</strong></label>
              <input type="text" name="title" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Description</strong></label>
              <textarea name="description" rows="3" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Activities (one per line)</strong></label>
              <textarea name="activities" rows="4" placeholder="Activity 1&#10;Activity 2&#10;Activity 3" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Music</strong></label>
              <input type="text" name="music" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Phase</strong></label>
              <select name="phase" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">None</option>
                <option value="intro">Intro</option>
                <option value="mid">Mid</option>
                <option value="pre-final">Pre-Final</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div>
              <label><strong>Envelope Instruction</strong></label>
              <input type="text" name="envelope_instruction" placeholder="Optional" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Notes</strong></label>
              <textarea name="notes" rows="2" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeScheduleEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Add Timeline Item</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

function editTimelineItem(index) {
  const item = AppData.schedule.timeline[index];
  
  const formHtml = `
    <div id="schedule-editor-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px;">
      <div style="background: white; padding: 30px; border-radius: 10px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: var(--deep-cherry-red);">Edit Timeline Item</h2>
        <form id="timeline-form" onsubmit="handleSaveTimelineItem(event, ${index})">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <label><strong>Time *</strong></label>
              <input type="text" name="time" value="${item.time}" required placeholder="e.g., 0:00 - 0:15" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Duration *</strong></label>
              <input type="text" name="duration" value="${item.duration}" required placeholder="e.g., 15 minutes" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Title *</strong></label>
              <input type="text" name="title" value="${item.title}" required style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Description</strong></label>
              <textarea name="description" rows="3" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">${item.description || ''}</textarea>
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Activities (one per line)</strong></label>
              <textarea name="activities" rows="4" placeholder="Activity 1&#10;Activity 2&#10;Activity 3" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">${(item.activities || []).join('\n')}</textarea>
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Music</strong></label>
              <input type="text" name="music" value="${item.music || ''}" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div>
              <label><strong>Phase</strong></label>
              <select name="phase" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">None</option>
                <option value="intro" ${item.phase === 'intro' ? 'selected' : ''}>Intro</option>
                <option value="mid" ${item.phase === 'mid' ? 'selected' : ''}>Mid</option>
                <option value="pre-final" ${item.phase === 'pre-final' ? 'selected' : ''}>Pre-Final</option>
                <option value="final" ${item.phase === 'final' ? 'selected' : ''}>Final</option>
              </select>
            </div>
            <div>
              <label><strong>Envelope Instruction</strong></label>
              <input type="text" name="envelope_instruction" value="${item.envelope_instruction || ''}" placeholder="Optional" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            <div style="grid-column: 1 / -1;">
              <label><strong>Notes</strong></label>
              <textarea name="notes" rows="2" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">${item.notes || ''}</textarea>
            </div>
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button type="button" onclick="closeScheduleEditor()" class="btn btn-secondary" style="margin-right: 10px;">Cancel</button>
            <button type="submit" class="btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', formHtml);
}

async function handleSaveTimelineItem(event, index) {
  event.preventDefault();
  pushToHistory();
  const form = event.target;
  const formData = new FormData(form);
  
  const itemData = {
    time: formData.get('time'),
    title: formData.get('title'),
    duration: formData.get('duration'),
    description: formData.get('description') || '',
    activities: formData.get('activities') ? formData.get('activities').split('\n').filter(s => s.trim()) : [],
    music: formData.get('music') || '',
    notes: formData.get('notes') || '',
    phase: formData.get('phase') || null,
    envelope_instruction: formData.get('envelope_instruction') || null
  };
  
  if (index === null) {
    AppData.schedule.timeline.push(itemData);
  } else {
    AppData.schedule.timeline[index] = itemData;
  }
  
  // Save to Firestore or localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart('schedule');
    }
    await FirebaseManager.saveData('schedule', AppData.schedule);
  } else {
    saveToLocalStorage();
  }
  
  closeScheduleEditor();
  
  if (window.Render && window.Render.schedule) {
    window.Render.schedule();
  }
}

async function deleteTimelineItem(index) {
  const item = AppData.schedule.timeline[index];
  if (confirm(`Delete timeline item "${item.title}"?`)) {
    pushToHistory();
    AppData.schedule.timeline.splice(index, 1);
    
    // Save to Firestore or localStorage
    if (FIREBASE_ENABLED && FirebaseManager) {
      if (typeof window.notifySaveStart === 'function') {
        window.notifySaveStart('schedule');
      }
      await FirebaseManager.saveData('schedule', AppData.schedule);
    } else {
      saveToLocalStorage();
    }
    
    if (window.Render && window.Render.schedule) {
      window.Render.schedule();
    }
  }
}

function closeScheduleEditor() {
  const modal = document.getElementById('schedule-editor-modal');
  if (modal) modal.remove();
}

async function handleImportSchedule() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importDataset('schedule', file);
      
      if (confirm(`Import schedule with ${data.timeline?.length || 0} timeline items?`)) {
        applyImportedData('schedule', data);
        
        if (window.Render && window.Render.schedule) {
          window.Render.schedule();
        }
        
        alert('Schedule imported successfully!');
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  
  input.click();
}

async function handleResetSchedule() {
  if (confirm('Reset schedule to repository defaults?')) {
    await resetToDefaults('schedule');
    
    if (window.Render && window.Render.schedule) {
      window.Render.schedule();
    }
    
    alert('Schedule reset to defaults!');
  }
}

// ============================================================================
// MYSTERY DATA IMPORT HANDLERS
// ============================================================================

async function handleImportStory() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importDataset('story', file);
      
      if (confirm(`Import story "${data.title}"?`)) {
        applyImportedData('story', data);
        
        if (window.Render && window.Render.mystery) {
          window.Render.mystery();
        }
        
        alert('Story imported successfully!');
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  
  input.click();
}

async function handleImportClues() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importDataset('clues', file);
      
      if (confirm(`Import ${data.length} clues?`)) {
        applyImportedData('clues', data);
        
        if (window.Render && window.Render.mystery) {
          window.Render.mystery();
        }
        
        alert('Clues imported successfully!');
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  
  input.click();
}

async function handleImportPackets() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const data = await importDataset('packets', file);
      
      if (confirm(`Import ${data.length} character packets?`)) {
        applyImportedData('packets', data);
        
        if (window.Render && window.Render.mystery) {
          window.Render.mystery();
        }
        
        alert('Packets imported successfully!');
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    }
  };
  
  input.click();
}

async function handleResetStory() {
  if (confirm('Reset story to repository defaults?')) {
    await resetToDefaults('story');
    
    if (window.Render && window.Render.mystery) {
      window.Render.mystery();
    }
    
    alert('Story reset to defaults!');
  }
}

async function handleResetClues() {
  if (confirm('Reset clues to repository defaults?')) {
    await resetToDefaults('clues');
    
    if (window.Render && window.Render.mystery) {
      window.Render.mystery();
    }
    
    alert('Clues reset to defaults!');
  }
}

async function handleResetPackets() {
  if (confirm('Reset packets to repository defaults?')) {
    await resetToDefaults('packets');
    
    if (window.Render && window.Render.mystery) {
      window.Render.mystery();
    }
    
    alert('Packets reset to defaults!');
  }
}

// Role preference functions
function setRolePreference(guestId, characterId) {
  if (!AppData.rolePreferences[guestId]) {
    AppData.rolePreferences[guestId] = [];
  }
  const index = AppData.rolePreferences[guestId].indexOf(characterId);
  if (index > -1) {
    AppData.rolePreferences[guestId].splice(index, 1);
  } else {
    AppData.rolePreferences[guestId].push(characterId);
  }
}

// Suggest character assignments based on preferences and availability
function suggestAssignments() {
  const unassignedGuests = AppData.guests.filter(g => !g.assignedCharacter);
  const assignedCharacters = new Set(AppData.guests.filter(g => g.assignedCharacter).map(g => g.assignedCharacter));
  const availableCharacters = AppData.characters.filter(c => !assignedCharacters.has(c.id));
  
  // Helper function to score character match based on roleVibe
  const scoreMatch = (guest, character) => {
    if (!guest.roleVibe) return 0;
    
    const guestVibe = guest.roleVibe.toLowerCase();
    const charPersonality = (character.personality || '').toLowerCase();
    const charBriefing = (character.briefing || '').toLowerCase();
    const charRole = (character.role || '').toLowerCase();
    
    let score = 0;
    
    // Check for keyword matches in personality, briefing, and role
    const vibeWords = guestVibe.split(/\s+/);
    vibeWords.forEach(word => {
      if (charPersonality.includes(word)) score += 3;
      if (charBriefing.includes(word)) score += 2;
      if (charRole.includes(word)) score += 2;
    });
    
    return score;
  };
  
  unassignedGuests.forEach(guest => {
    // Try to match with preferred roles first
    const preferences = AppData.rolePreferences[guest.id] || [];
    const preferredAvailable = preferences.find(charId => 
      !assignedCharacters.has(charId) && availableCharacters.some(c => c.id === charId)
    );
    
    if (preferredAvailable) {
      guest.assignedCharacter = preferredAvailable;
      assignedCharacters.add(preferredAvailable);
      availableCharacters.splice(availableCharacters.findIndex(c => c.id === preferredAvailable), 1);
    } else if (availableCharacters.length > 0) {
      // Use roleVibe to rank available characters
      const scoredCharacters = availableCharacters.map(char => ({
        character: char,
        score: scoreMatch(guest, char)
      }));
      
      // Sort by score (highest first), avoiding duplicates
      scoredCharacters.sort((a, b) => b.score - a.score);
      
      // Assign best match
      const bestMatch = scoredCharacters[0].character;
      guest.assignedCharacter = bestMatch.id;
      assignedCharacters.add(bestMatch.id);
      availableCharacters.splice(availableCharacters.findIndex(c => c.id === bestMatch.id), 1);
    }
  });
  
  return unassignedGuests.length - assignedCharacters.size;
}

// Export functions
function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportDecorJSON() {
  const decorWithState = {
    ...AppData.decor,
    favorites: Array.from(AppData.decorFavorites),
    customShoppingList: Array.from(AppData.decorShoppingList)
  };
  downloadJSON(decorWithState, 'decor.json');
  alert('Decor data exported! Check your downloads folder.');
}

function exportMenuJSON() {
  const menuWithState = {
    ...AppData.menu,
    favorites: Array.from(AppData.menuFavorites),
    featured: Array.from(AppData.menuFeatured)
  };
  downloadJSON(menuWithState, 'menu.json');
  alert('Menu data exported! Check your downloads folder.');
}

function exportGuestsJSON() {
  downloadJSON(AppData.guests, 'guests.json');
  alert('Guests data exported! Check your downloads folder.');
}

function exportCharactersJSON() {
  const charactersWithPrefs = {
    characters: AppData.characters,
    rolePreferences: AppData.rolePreferences
  };
  downloadJSON(charactersWithPrefs, 'characters.json');
  alert('Characters data exported! Check your downloads folder.');
}

// Export all data as ZIP using JSZip (loaded via CDN)
async function downloadAllDataAsZip() {
  if (typeof JSZip === 'undefined') {
    alert('ZIP library not loaded. Please try again.');
    return;
  }
  
  const zip = new JSZip();
  const dataFolder = zip.folder('data');
  
  // Add all JSON files with current state
  dataFolder.file('guests.json', JSON.stringify(AppData.guests, null, 2));
  dataFolder.file('characters.json', JSON.stringify({
    characters: AppData.characters,
    rolePreferences: AppData.rolePreferences
  }, null, 2));
  dataFolder.file('decor.json', JSON.stringify({
    ...AppData.decor,
    favorites: Array.from(AppData.decorFavorites),
    customShoppingList: Array.from(AppData.decorShoppingList)
  }, null, 2));
  dataFolder.file('menu.json', JSON.stringify({
    ...AppData.menu,
    favorites: Array.from(AppData.menuFavorites),
    featured: Array.from(AppData.menuFeatured)
  }, null, 2));
  dataFolder.file('schedule.json', JSON.stringify(AppData.schedule, null, 2));
  dataFolder.file('story.json', JSON.stringify(AppData.story, null, 2));
  dataFolder.file('clues.json', JSON.stringify(AppData.clues, null, 2));
  dataFolder.file('packets.json', JSON.stringify(AppData.packets, null, 2));
  
  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'bridal-party-plan-' + new Date().toISOString().split('T')[0] + '.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  alert('Complete plan exported as ZIP! Check your downloads folder.');
}

// Mystery phase management functions
function advancePhase() {
  const phases = ['intro', 'mid', 'pre-final', 'final'];
  const currentIndex = phases.indexOf(AppData.currentPhase);
  if (currentIndex < phases.length - 1) {
    AppData.currentPhase = phases[currentIndex + 1];
    return true;
  }
  return false;
}

function setPhase(phase) {
  const validPhases = ['intro', 'mid', 'pre-final', 'final'];
  if (validPhases.includes(phase)) {
    AppData.currentPhase = phase;
    return true;
  }
  return false;
}

function getCluesByPhase(phase) {
  return AppData.clues.filter(clue => clue.reveal_phase === phase);
}

function getPacketForCharacter(characterId) {
  return AppData.packets.find(p => p.character_id === characterId);
}

// Generate printable character packet HTML
function generatePrintablePacket(characterId) {
  const packet = getPacketForCharacter(characterId);
  if (!packet) return null;
  
  const character = AppData.characters.find(c => c.id === characterId);
  if (!character) return null;
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${packet.intro_profile.name} - Character Packet</title>
    <style>
        @page { margin: 1in; }
        body { font-family: 'Georgia', serif; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #8B0000; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #8B0000; margin: 0; font-size: 2.5em; }
        .header h2 { color: #C79810; margin: 5px 0; font-style: italic; }
        .profile { background: #f9f9f9; border: 2px solid #0B4F3F; padding: 20px; margin: 20px 0; page-break-inside: avoid; }
        .profile h3 { color: #0B4F3F; margin-top: 0; }
        .envelope { border: 3px solid #8B0000; padding: 20px; margin: 30px 0; page-break-inside: avoid; }
        .envelope h3 { color: #8B0000; margin-top: 0; border-bottom: 1px solid #C79810; padding-bottom: 10px; }
        .phase-badge { background: #C79810; color: white; padding: 5px 15px; border-radius: 5px; display: inline-block; font-weight: bold; }
        ul { margin: 10px 0; padding-left: 20px; }
        .instructions { background: #fff9e6; border-left: 4px solid #C79810; padding: 15px; margin: 15px 0; font-style: italic; }
        @media print {
            .envelope { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌲 A Damn Fine Bridal Party 🌲</h1>
        <h2>Character Packet</h2>
        <p style="font-style: italic;">"The owls are not what they seem..."</p>
    </div>
    
    <div class="profile">
        <h3>${packet.intro_profile.name}</h3>
        <p><strong>Role:</strong> ${packet.intro_profile.role}</p>
        <p><em>${packet.intro_profile.tagline}</em></p>
        <p>${packet.intro_profile.overview}</p>
        
        <h4>Costume Essentials:</h4>
        <ul>
            ${packet.intro_profile.costume_essentials.map(item => `<li>${item}</li>`).join('')}
        </ul>
        
        <p><strong>Personality Notes:</strong> ${packet.intro_profile.personality_notes}</p>
        <p><strong>Secret Preview:</strong> ${packet.intro_profile.secret_preview}</p>
    </div>
    
    ${packet.envelopes.map((env, index) => `
        <div class="envelope">
            <h3>
                <span class="phase-badge">${env.phase.toUpperCase()}</span>
                ${env.title}
            </h3>
            <p>${env.contents}</p>
            <div class="instructions">
                <strong>📋 Instructions:</strong> ${env.instructions}
            </div>
        </div>
    `).join('')}
    
    <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #8B0000;">
        <p style="font-style: italic; color: #666;">
            "Every day, once a day, give yourself a present." - Agent Cooper
        </p>
    </div>
</body>
</html>
  `;
  
  return html;
}

// Print character packet
function printCharacterPacket(characterId) {
  const html = generatePrintablePacket(characterId);
  if (!html) {
    alert('Character packet not found!');
    return;
  }
  
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

// Generate clue kit ZIP
async function downloadClueKitZip() {
  if (typeof JSZip === 'undefined') {
    alert('ZIP library not loaded. Please try again.');
    return;
  }
  
  const zip = new JSZip();
  const envelopesFolder = zip.folder('envelopes');
  
  // Generate envelope files for each character
  AppData.packets.forEach(packet => {
    const character = AppData.characters.find(c => c.id === packet.character_id);
    if (!character) return;
    
    packet.envelopes.forEach((env, index) => {
      const filename = `envelope-${packet.character_id}-${index + 1}-${env.phase}.txt`;
      const content = `
=== ${env.title} ===
Phase: ${env.phase.toUpperCase()}
Character: ${packet.intro_profile.name}

${env.contents}

--- Instructions ---
${env.instructions}
`;
      envelopesFolder.file(filename, content);
    });
  });
  
  // Add clues reference file
  const cluesContent = AppData.clues.map(clue => 
    `[${clue.id}] Phase: ${clue.reveal_phase} | Type: ${clue.type}
Holder: ${clue.holder_id}
${clue.text}
Trade Hint: ${clue.trade_hint}
---`
  ).join('\n\n');
  
  zip.file('clues-reference.txt', cluesContent);
  
  // Add director's guide
  const directorsGuide = `
=== DIRECTOR'S GUIDE ===
Mystery Phase Management for "A Damn Fine Bridal Party"

PHASES:
1. INTRO - Character introductions and initial clues
2. MID - Investigation deepens, more clues revealed
3. PRE-FINAL - Critical evidence emerges
4. FINAL - Truth revealed before solution

TIMING (from schedule.json):
- 0:50-1:00 - Character Introduction (INTRO phase, Envelope 1)
- 1:00-1:10 - Initial Investigation (INTRO continues)
- 1:10-1:25 - Mid Investigation (MID phase, Envelope 2)
- 1:25-1:35 - Final Investigation (PRE-FINAL phase, Envelope 3)
- 1:35-1:45 - Cupcake Reveal (FINAL phase, Envelope 4)

ENVELOPE DISTRIBUTION:
Print and seal all envelopes before the party. Label each envelope clearly with:
- Character name
- Envelope number (1-4)
- Phase (INTRO/MID/PRE-FINAL/FINAL)
- "DO NOT OPEN UNTIL INSTRUCTED"

PREPARATION CHECKLIST:
☐ Print all character packets
☐ Print and cut individual envelope contents
☐ Seal envelopes and label clearly
☐ Prepare clue reference sheet (this file)
☐ Review timing and phase transitions
☐ Test kitchen torch for cupcake reveal

TROUBLESHOOTING:
- If guests are stuck, drop hints from clues they haven't discovered yet
- If moving too fast, extend investigation phases
- If moving too slow, prompt envelope openings
- Keep the murderer (Josie Packard/owner) engaged but not obvious

Good luck, Director! 🌲
  `;
  
  zip.file('DIRECTORS-GUIDE.txt', directorsGuide);
  
  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mystery-clue-kit.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  alert('Clue Kit ZIP downloaded! Contains all envelopes and director\'s guide.');
}

// Generate character profile for invite
function generateCharacterProfile(characterId) {
  const packet = getPacketForCharacter(characterId);
  if (!packet) return '';
  
  return `
📜 YOUR CHARACTER: ${packet.intro_profile.name}
Role: ${packet.intro_profile.role}
${packet.intro_profile.tagline}

${packet.intro_profile.overview}

Costume: ${packet.intro_profile.costume_essentials.join(', ')}

Get ready to solve a mystery! 🔍
  `.trim();
}

// Calculate decision progress
function calculateDecisionProgress() {
  const totalMoodBoards = AppData.decor.moodBoard ? AppData.decor.moodBoard.length : 0;
  const totalMenuItems = AppData.menu.menuItems ? AppData.menu.menuItems.length : 0;
  const totalGuests = AppData.guests.length;
  const assignedGuests = AppData.guests.filter(g => g.assignedCharacter).length;
  
  // Calculate envelope readiness (% of guests with assigned roles who have packets)
  const guestsWithPackets = AppData.guests.filter(g => {
    if (!g.assignedCharacter) return false;
    const packet = AppData.packets.find(p => p.character_id === g.assignedCharacter);
    return packet && packet.envelopes && packet.envelopes.length === 4;
  }).length;
  
  const envelopeReadiness = assignedGuests > 0 ? 
    Math.round((guestsWithPackets / assignedGuests) * 100) : 0;
  
  return {
    decorFavorited: totalMoodBoards > 0 ? Math.round((AppData.decorFavorites.size / totalMoodBoards) * 100) : 0,
    menuFeatured: totalMenuItems > 0 ? Math.round((AppData.menuFeatured.size / totalMenuItems) * 100) : 0,
    rolesAssigned: totalGuests > 0 ? Math.round((assignedGuests / totalGuests) * 100) : 0,
    totalFavorites: AppData.decorFavorites.size + AppData.menuFavorites.size,
    totalFeatured: AppData.menuFeatured.size,
    totalAssigned: assignedGuests,
    envelopeReadiness: envelopeReadiness,
    guestsWithPackets: guestsWithPackets
  };
}

// ============================================================================
// PERSISTENCE & AUTOSAVE FUNCTIONS
// ============================================================================

// Toggle autosave
function toggleAutosave() {
  // With Firebase, autosave is always enabled for syncing
  // This function now controls Firebase sync
  AppData.autosaveEnabled = !AppData.autosaveEnabled;
  localStorage.setItem('autosaveEnabled', AppData.autosaveEnabled.toString());
  
  if (AppData.autosaveEnabled && FIREBASE_ENABLED && FirebaseManager) {
    saveToFirestore();
  }
  
  return AppData.autosaveEnabled;
}

// Save current state to Firestore (replaces localStorage)
async function saveToFirestore() {
  if (!FIREBASE_ENABLED || !FirebaseManager) {
    // Fallback to localStorage if Firebase is disabled
    saveToLocalStorage();
    return;
  }
  
  try {
    await Promise.all([
      FirebaseManager.saveData('guests', AppData.guests),
      FirebaseManager.saveData('characters', AppData.characters),
      FirebaseManager.saveData('decor', AppData.decor),
      FirebaseManager.saveData('vendors', AppData.vendors),
      FirebaseManager.saveData('menu', AppData.menu),
      FirebaseManager.saveData('schedule', AppData.schedule),
      FirebaseManager.saveData('story', AppData.story),
      FirebaseManager.saveData('clues', AppData.clues),
      FirebaseManager.saveData('packets', AppData.packets),
      FirebaseManager.saveData('pageNotes', AppData.pageNotes)
    ]);
    console.log('Data saved to Firestore');
  } catch (error) {
    console.error('Error saving to Firestore:', error);
  }
}

// Save page notes
async function savePageNotes(page, content) {
  if (!AppData.pageNotes) AppData.pageNotes = {};
  
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const identity = getUserIdentity();
  
  AppData.pageNotes[page] = {
    content: content,
    lastUpdatedBy: identity,
    lastUpdatedAt: timestamp
  };
  
  if (FIREBASE_ENABLED && FirebaseManager) {
    await FirebaseManager.saveData('pageNotes', AppData.pageNotes);
  } else {
    saveToLocalStorage();
  }
}

// Save current state to localStorage (fallback)
function saveToLocalStorage() {
  if (!AppData.autosaveEnabled && !FIREBASE_ENABLED) return;
  
  const dataToSave = {
    guests: AppData.guests,
    characters: AppData.characters,
    decor: AppData.decor,
    vendors: AppData.vendors,
    menu: AppData.menu,
    schedule: AppData.schedule,
    story: AppData.story,
    clues: AppData.clues,
    packets: AppData.packets,
    pageNotes: AppData.pageNotes
  };
  
  // If Firebase is enabled, use Firestore; otherwise use localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    // Save all datasets to Firestore
    Promise.all([
      FirebaseManager.saveData('guests', AppData.guests),
      FirebaseManager.saveData('characters', AppData.characters),
      FirebaseManager.saveData('decor', AppData.decor),
      FirebaseManager.saveData('vendors', AppData.vendors),
      FirebaseManager.saveData('menu', AppData.menu),
      FirebaseManager.saveData('schedule', AppData.schedule),
      FirebaseManager.saveData('story', AppData.story),
      FirebaseManager.saveData('clues', AppData.clues),
      FirebaseManager.saveData('packets', AppData.packets)
    ]).catch(err => console.error('Error saving to Firestore:', err));
  } else {
    // Fallback to localStorage
    localStorage.setItem('appData', JSON.stringify(dataToSave));
  }
}

// Reset to defaults from repo
async function resetToDefaults(datasetName) {
  // Require explicit confirmation
  const confirmMsg = datasetName === 'all' 
    ? 'Are you sure you want to reset ALL datasets to repository defaults? This will overwrite all current data.'
    : `Are you sure you want to reset "${datasetName}" to repository defaults? This will overwrite current data.`;
  
  if (!confirm(confirmMsg)) {
    console.log('Reset cancelled by user');
    return false;
  }
  
  pushToHistory();
  
  if (!datasetName || datasetName === 'all') {
    // Reset all datasets
    AppData.guests = JSON.parse(JSON.stringify(AppData.defaults.guests));
    AppData.characters = JSON.parse(JSON.stringify(AppData.defaults.characters));
    AppData.decor = JSON.parse(JSON.stringify(AppData.defaults.decor));
    AppData.vendors = JSON.parse(JSON.stringify(AppData.defaults.vendors));
    AppData.menu = JSON.parse(JSON.stringify(AppData.defaults.menu));
    AppData.schedule = JSON.parse(JSON.stringify(AppData.defaults.schedule));
    AppData.story = JSON.parse(JSON.stringify(AppData.defaults.story));
    AppData.clues = JSON.parse(JSON.stringify(AppData.defaults.clues));
    AppData.packets = JSON.parse(JSON.stringify(AppData.defaults.packets));
    AppData.settings = JSON.parse(JSON.stringify(AppData.defaults.settings));
    AppData.roles = JSON.parse(JSON.stringify(AppData.defaults.roles));
    AppData.pageNotes = JSON.parse(JSON.stringify(AppData.defaults.pageNotes));
    
    // Save all to Firestore
    if (FIREBASE_ENABLED && FirebaseManager) {
      console.log('Saving reset data to Firestore...');
      await Promise.all([
        FirebaseManager.saveData('guests', AppData.guests),
        FirebaseManager.saveData('characters', AppData.characters),
        FirebaseManager.saveData('decor', AppData.decor),
        FirebaseManager.saveData('vendors', AppData.vendors),
        FirebaseManager.saveData('menu', AppData.menu),
        FirebaseManager.saveData('schedule', AppData.schedule),
        FirebaseManager.saveData('story', AppData.story),
        FirebaseManager.saveData('clues', AppData.clues),
        FirebaseManager.saveData('packets', AppData.packets),
        FirebaseManager.saveData('settings', AppData.settings),
        FirebaseManager.saveData('roles', AppData.roles),
        FirebaseManager.saveData('pageNotes', AppData.pageNotes)
      ]);
    } else {
      saveToLocalStorage();
    }
  } else {
    // Reset specific dataset
    if (AppData.defaults[datasetName]) {
      AppData[datasetName] = JSON.parse(JSON.stringify(AppData.defaults[datasetName]));
      
      // Save to Firestore
      if (FIREBASE_ENABLED && FirebaseManager) {
        console.log(`Saving reset ${datasetName} to Firestore...`);
        await FirebaseManager.saveData(datasetName, AppData[datasetName]);
      } else {
        saveToLocalStorage();
      }
    }
  }
  
  console.log('Reset complete');
  return true;
}

// ============================================================================
// GENERIC CRUD HELPERS
// ============================================================================

// Add item to array dataset
async function addItem(datasetName, item) {
  if (Array.isArray(AppData[datasetName])) {
    AppData[datasetName].push(item);
  } else if (AppData[datasetName] && Array.isArray(AppData[datasetName][datasetName])) {
    // For nested arrays like menu.menuItems
    AppData[datasetName][datasetName].push(item);
  }
  // Save to Firestore if enabled, fallback to localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart(datasetName);
    }
    await FirebaseManager.saveData(datasetName, AppData[datasetName]);
  } else {
    saveToLocalStorage();
  }
}

// Update item in array dataset
async function updateItem(datasetName, id, updates) {
  let dataset = AppData[datasetName];
  
  // Handle nested structures
  if (!Array.isArray(dataset)) {
    // Try common nested patterns
    if (dataset && Array.isArray(dataset.menuItems)) {
      dataset = dataset.menuItems;
    } else if (dataset && Array.isArray(dataset.timeline)) {
      dataset = dataset.timeline;
    } else if (dataset && Array.isArray(dataset.moodBoard)) {
      dataset = dataset.moodBoard;
    } else if (dataset && Array.isArray(dataset.shoppingList)) {
      dataset = dataset.shoppingList;
    }
  }
  
  if (Array.isArray(dataset)) {
    const index = dataset.findIndex(item => item.id === id);
    if (index !== -1) {
      dataset[index] = { ...dataset[index], ...updates };
    }
  }
  
  // Save to Firestore if enabled, fallback to localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart(datasetName);
    }
    await FirebaseManager.saveData(datasetName, AppData[datasetName]);
  } else {
    saveToLocalStorage();
  }
}

// Delete item from array dataset
async function deleteItem(datasetName, id) {
  let dataset = AppData[datasetName];
  
  // Handle nested structures
  if (!Array.isArray(dataset)) {
    if (dataset && Array.isArray(dataset.menuItems)) {
      dataset.menuItems = dataset.menuItems.filter(item => item.id !== id);
    } else if (dataset && Array.isArray(dataset.timeline)) {
      dataset.timeline = dataset.timeline.filter(item => item.id !== id);
    } else if (dataset && Array.isArray(dataset.moodBoard)) {
      dataset.moodBoard = dataset.moodBoard.filter(item => item.id !== id);
    } else if (dataset && Array.isArray(dataset.shoppingList)) {
      dataset.shoppingList = dataset.shoppingList.filter(item => item.id !== id);
    }
  } else {
    AppData[datasetName] = dataset.filter(item => item.id !== id);
  }
  
  // Save to Firestore if enabled, fallback to localStorage
  if (FIREBASE_ENABLED && FirebaseManager) {
    if (typeof window.notifySaveStart === 'function') {
      window.notifySaveStart(datasetName);
    }
    await FirebaseManager.saveData(datasetName, AppData[datasetName]);
  } else {
    saveToLocalStorage();
  }
}

// ============================================================================
// IMPORT/EXPORT UTILITIES
// ============================================================================

// Generic export function
function exportDataset(datasetName, data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${datasetName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Generic import function with validation
async function importDataset(datasetName, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Basic validation
        if (data === null || data === undefined) {
          reject(new Error('Invalid JSON: file is empty'));
          return;
        }
        
        // Schema validation based on dataset
        const isValid = validateImportSchema(datasetName, data);
        if (!isValid) {
          reject(new Error(`Invalid schema for ${datasetName}`));
          return;
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Validate import schema
function validateImportSchema(datasetName, data) {
  switch (datasetName) {
    case 'guests':
      return Array.isArray(data) && data.every(item => 
        item != null && 'id' in item && 'name' in item
      );
    
    case 'characters':
      return Array.isArray(data) && data.every(item => 
        item != null && 'id' in item && 'name' in item && 'role' in item
      );
    
    case 'vendors':
      return Array.isArray(data) && data.every(item => 
        item != null && 'name' in item && 'type' in item
      );
    
    case 'menu':
      return data != null && 'menuItems' in data && Array.isArray(data.menuItems);
    
    case 'decor':
      return data != null && 'moodBoard' in data && 'shoppingList' in data;
    
    case 'schedule':
      return data != null && 'timeline' in data && Array.isArray(data.timeline);
    
    case 'story':
      return data != null && 'title' in data && 'theMurder' in data && 
             'theMurderer' in data;
    
    case 'clues':
      return Array.isArray(data) && data.every(item => 
        item != null && 'id' in item && 'type' in item && 'text' in item
      );
    
    case 'packets':
      return Array.isArray(data) && data.every(item => 
        item != null && 'character_id' in item && 'intro_profile' in item && 
        'envelopes' in item
      );
    
    default:
      return true; // Allow unknown datasets
  }
}

// Apply imported data
function applyImportedData(datasetName, data) {
  pushToHistory();
  AppData[datasetName] = data;
  saveToLocalStorage();
}

// Export specific datasets
function exportGuests() {
  exportDataset('guests', AppData.guests);
}

function exportCharacters() {
  exportDataset('characters', AppData.characters);
}

function exportVendors() {
  exportDataset('vendors', AppData.vendors);
}

function exportDecor() {
  exportDataset('decor', AppData.decor);
}

function exportMenu() {
  exportDataset('menu', AppData.menu);
}

function exportSchedule() {
  exportDataset('schedule', AppData.schedule);
}

function exportStory() {
  exportDataset('story', AppData.story);
}

function exportClues() {
  exportDataset('clues', AppData.clues);
}

function exportPackets() {
  exportDataset('packets', AppData.packets);
}

// ============================================================================
// SAVE STATUS INDICATOR SYSTEM
// ============================================================================

// Global save status state
const SaveStatus = {
  currentState: 'idle', // idle, saving, saved, error
  lastSyncTime: null,
  dataSource: FIREBASE_ENABLED ? 'Firestore' : 'Local',
  error: null
};

// Initialize save status indicator in the UI
function initSaveStatusIndicator() {
  // Only add if Firebase is enabled and not on login page
  if (!FIREBASE_ENABLED || window.location.pathname.includes('login.html')) {
    return;
  }
  
  // Check if indicator already exists
  if (document.getElementById('save-status-indicator')) {
    return;
  }
  
  // Create save status indicator
  const indicator = document.createElement('div');
  indicator.id = 'save-status-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 10000;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  `;
  
  indicator.innerHTML = `
    <span id="save-status-icon">💾</span>
    <span id="save-status-text">Saved</span>
    <span id="save-status-time" style="color: #666; font-size: 12px;"></span>
  `;
  
  document.body.appendChild(indicator);
  
  // Update initial state
  updateSaveStatusDisplay();
}

// Update save status display
function updateSaveStatusDisplay() {
  const indicator = document.getElementById('save-status-indicator');
  if (!indicator) return;
  
  const icon = document.getElementById('save-status-icon');
  const text = document.getElementById('save-status-text');
  const time = document.getElementById('save-status-time');
  
  if (!icon || !text || !time) return;
  
  switch (SaveStatus.currentState) {
    case 'saving':
      icon.textContent = '⏳';
      text.textContent = 'Saving...';
      text.style.color = '#C79810'; // Gold
      time.textContent = '';
      indicator.style.borderColor = '#C79810';
      break;
      
    case 'saved':
      icon.textContent = '✓';
      text.textContent = 'Saved';
      text.style.color = '#0B4F3F'; // Forest green
      indicator.style.borderColor = '#0B4F3F';
      if (SaveStatus.lastSyncTime) {
        const now = new Date();
        const diff = Math.floor((now - SaveStatus.lastSyncTime) / 1000);
        if (diff < 60) {
          time.textContent = 'just now';
        } else if (diff < 3600) {
          time.textContent = `${Math.floor(diff / 60)}m ago`;
        } else {
          time.textContent = SaveStatus.lastSyncTime.toLocaleTimeString();
        }
      }
      break;
      
    case 'error':
      icon.textContent = '⚠️';
      text.textContent = 'Save failed';
      text.style.color = '#8B0000'; // Deep red
      indicator.style.borderColor = '#8B0000';
      time.textContent = SaveStatus.error || 'Unknown error';
      break;
      
    case 'idle':
    default:
      icon.textContent = '💾';
      text.textContent = SaveStatus.dataSource;
      text.style.color = '#666';
      indicator.style.borderColor = '#ddd';
      time.textContent = '';
  }
}

// Notify save start
window.notifySaveStart = function(datasetName) {
  SaveStatus.currentState = 'saving';
  updateSaveStatusDisplay();
};

// Notify save success
window.notifySaveSuccess = function(datasetName) {
  SaveStatus.currentState = 'saved';
  SaveStatus.lastSyncTime = new Date();
  SaveStatus.error = null;
  updateSaveStatusDisplay();
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    if (SaveStatus.currentState === 'saved') {
      SaveStatus.currentState = 'idle';
      updateSaveStatusDisplay();
    }
  }, 3000);
};

// Notify save error
window.notifySaveError = function(datasetName, error) {
  SaveStatus.currentState = 'error';
  // Sanitize error message to prevent XSS
  const errorMsg = (error && error.message) ? String(error.message).substring(0, 100) : 'Network error';
  SaveStatus.error = errorMsg.replace(/[<>]/g, ''); // Remove potential HTML tags
  updateSaveStatusDisplay();
  
  // Show error toast with sanitized message
  showErrorToast(`Failed to save ${datasetName}: ${SaveStatus.error}`);
  
  // Auto-revert to idle after 10 seconds
  setTimeout(() => {
    if (SaveStatus.currentState === 'error') {
      SaveStatus.currentState = 'idle';
      updateSaveStatusDisplay();
    }
  }, 10000);
};

// Show error toast
function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #8B0000;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10001;
    font-size: 14px;
    max-width: 500px;
    animation: slideUp 0.3s ease;
  `;
  
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Force sync from Firestore
async function forceSyncFromFirestore() {
  if (!FIREBASE_ENABLED || !FirebaseManager) {
    alert('Firebase is not enabled');
    return;
  }
  
  if (!confirm('Reload all data from Firestore? Any unsaved local changes will be lost.')) {
    return;
  }
  
  try {
    SaveStatus.currentState = 'saving';
    updateSaveStatusDisplay();
    
    const datasets = ['guests', 'characters', 'decor', 'vendors', 'menu', 'schedule', 'story', 'clues', 'packets'];
    
    for (const dataset of datasets) {
      const data = await FirebaseManager.loadData(dataset);
      if (data !== null) {
        AppData[dataset] = data;
      }
    }
    
    SaveStatus.currentState = 'saved';
    SaveStatus.lastSyncTime = new Date();
    updateSaveStatusDisplay();
    
    // Re-render current page
    if (typeof window.renderCurrentPage === 'function') {
      window.renderCurrentPage();
    }
    
    alert('Data reloaded from Firestore successfully!');
  } catch (error) {
    console.error('Error syncing from Firestore:', error);
    SaveStatus.currentState = 'error';
    SaveStatus.error = error.message;
    updateSaveStatusDisplay();
    alert('Failed to sync from Firestore: ' + error.message);
  }
}

// Get sync status info
async function getSyncStatusInfo() {
  if (!FIREBASE_ENABLED || !FirebaseManager) {
    return {
      dataSource: 'Local',
      seeded: false,
      lastSync: null
    };
  }
  
  try {
    const meta = await FirebaseManager.readMeta();
    return {
      dataSource: 'Firestore',
      seeded: meta?.seeded || false,
      seededAt: meta?.seededAt || null,
      seededBy: meta?.seededBy || null,
      lastSync: SaveStatus.lastSyncTime
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      dataSource: 'Firestore (Error)',
      seeded: false,
      lastSync: null,
      error: error.message
    };
  }
}

// ============================================================================
// Decor Wizard - Curated Options and Controller
// ============================================================================

const DECOR_CURATED_OPTIONS = {
  theme: {
    label: "Theme",
    multi: false,
    options: [
      "Twin Peaks / Pacific Northwest",
      "Elegant Vintage",
      "Forest Lodge",
      "Cherry Blossom",
      "Mystery & Intrigue",
      "Cozy Cabin"
    ]
  },
  "color-palette": {
    label: "Color Palette",
    multi: true,
    options: [
      "Deep burgundy & cream",
      "Forest green & gold",
      "Black, white & cherry red",
      "Emerald & copper",
      "Plaid & rustic wood tones",
      "Soft pink & sage green"
    ]
  },
  textures: {
    label: "Textures",
    multi: true,
    options: [
      "Velvet drapes",
      "Lace tablecloths",
      "Burlap & twine",
      "Wood slice chargers",
      "Pine branches & evergreen",
      "Silk ribbons"
    ]
  },
  lighting: {
    label: "Lighting",
    multi: true,
    options: [
      "String lights (warm white)",
      "Candlelight (pillar candles)",
      "Vintage lanterns",
      "Edison bulbs",
      "Fairy lights in jars",
      "Dimmed overhead with accent spots"
    ]
  },
  centerpieces: {
    label: "Centerpieces",
    multi: true,
    options: [
      "Fresh roses in vintage vases",
      "Evergreen & pinecone arrangements",
      "Cherry pie slice displays",
      "Log sections with candles",
      "Coffee cup planters with flowers",
      "Vintage books stacked with florals"
    ]
  },
  signage: {
    label: "Signage",
    multi: true,
    options: [
      "Welcome to Twin Peaks chalkboard",
      "Double R Diner menu board",
      "Character name placecards",
      "Mystery clue directions",
      "Photo booth instructions",
      "Owl & log motif signs"
    ]
  },
  "photo-backdrop": {
    label: "Photo Backdrop",
    multi: false,
    options: [
      "Forest scene with trees",
      "Vintage diner aesthetic",
      "Velvet curtain with fairy lights",
      "Log Lady's log prop wall",
      "Cherry pie display table",
      "Twin Peaks welcome sign"
    ]
  },
  "table-settings": {
    label: "Table Settings",
    multi: true,
    options: [
      "Vintage china & mismatched cups",
      "Black napkins with red ribbons",
      "Wood chargers with linen napkins",
      "Coffee cup favors at each place",
      "Mini pie slice placecards",
      "Plaid or gingham accents"
    ]
  }
};

// Save decor wizard section
async function saveDecorSection(sectionId, data) {
  try {
    if (!AppData.decor.sections) {
      AppData.decor.sections = [];
    }
    
    const sectionIndex = AppData.decor.sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex >= 0) {
      // Update existing section
      AppData.decor.sections[sectionIndex] = {
        ...AppData.decor.sections[sectionIndex],
        ...data
      };
    } else {
      // Add new section
      AppData.decor.sections.push({
        id: sectionId,
        name: data.name || sectionId,
        selectedOptions: data.selectedOptions || [],
        customIdea: data.customIdea || "",
        notes: data.notes || "",
        status: data.status || "draft"
      });
    }
    
    // Save to Firestore if enabled and not in rehearsal mode
    if (FIREBASE_ENABLED && FirebaseManager && !AppData.settings.rehearsalMode) {
      window.notifySaveStart?.();
      await FirebaseManager.saveData('decor', AppData.decor);
      window.notifySaveSuccess?.();
    }
    
    // Auto-generate shopping list
    updateDecorShoppingList();
    
    return true;
  } catch (error) {
    console.error('Error saving decor section:', error);
    window.notifySaveError?.(error.message);
    return false;
  }
}

// Auto-generate shopping list from decor selections
function updateDecorShoppingList() {
  if (!AppData.decor.sections) return;
  
  const autoItems = [];
  
  AppData.decor.sections.forEach(section => {
    if (section.status === 'final' && section.selectedOptions && section.selectedOptions.length > 0) {
      section.selectedOptions.forEach(option => {
        // Map selections to shopping items
        const item = {
          section: section.name,
          item: option,
          quantity: 1,
          notes: '',
          purchased: false,
          auto: true
        };
        autoItems.push(item);
      });
    }
    
    // Add custom ideas as items too
    if (section.status === 'final' && section.customIdea && section.customIdea.trim()) {
      autoItems.push({
        section: section.name,
        item: section.customIdea,
        quantity: 1,
        notes: 'Custom idea',
        purchased: false,
        auto: true
      });
    }
  });
  
  // Merge with existing shopping list, keeping manual items
  if (!AppData.decor.shoppingList) {
    AppData.decor.shoppingList = [];
  }
  
  // Remove old auto-generated items
  AppData.decor.shoppingList = AppData.decor.shoppingList.filter(item => !item.auto);
  
  // Add new auto items
  AppData.decor.shoppingList.push(...autoItems);
}

// Get decor section data
function getDecorSection(sectionId) {
  if (!AppData.decor.sections) return null;
  return AppData.decor.sections.find(s => s.id === sectionId);
}

// Toggle decor section status (draft/final)
async function toggleDecorSectionStatus(sectionId) {
  const section = getDecorSection(sectionId);
  if (!section) return false;
  
  section.status = section.status === 'draft' ? 'final' : 'draft';
  
  // Save to Firestore if enabled and not in rehearsal mode
  if (FIREBASE_ENABLED && FirebaseManager && !AppData.settings.rehearsalMode) {
    window.notifySaveStart?.();
    await FirebaseManager.saveData('decor', AppData.decor);
    window.notifySaveSuccess?.();
  }
  
  // Update shopping list
  updateDecorShoppingList();
  
  return true;
}

// ============================================================================
// Menu Planner - Controller Functions
// ============================================================================

// Toggle menu item shortlist status
async function toggleMenuShortlist(itemId) {
  const item = AppData.menu.menuItems?.find(i => i.id === itemId);
  if (!item) return false;
  
  item.shortlist = !item.shortlist;
  
  // Save to Firestore if enabled and not in rehearsal mode
  if (FIREBASE_ENABLED && FirebaseManager && !AppData.settings.rehearsalMode) {
    window.notifySaveStart?.();
    await FirebaseManager.saveData('menu', AppData.menu);
    window.notifySaveSuccess?.();
  }
  
  return true;
}

// Toggle menu item final status
async function toggleMenuFinal(itemId) {
  const item = AppData.menu.menuItems?.find(i => i.id === itemId);
  if (!item) return false;
  
  item.final = !item.final;
  
  // Save to Firestore if enabled and not in rehearsal mode
  if (FIREBASE_ENABLED && FirebaseManager && !AppData.settings.rehearsalMode) {
    window.notifySaveStart?.();
    await FirebaseManager.saveData('menu', AppData.menu);
    window.notifySaveSuccess?.();
  }
  
  return true;
}

// Calculate dietary coverage
function calculateDietaryCoverage() {
  if (!AppData.menu.menuItems) return {};
  
  const finalItems = AppData.menu.menuItems.filter(i => i.final);
  const coverage = {
    V: 0,   // Vegetarian
    VG: 0,  // Vegan
    GF: 0,  // Gluten-free
    DF: 0   // Dairy-free
  };
  
  finalItems.forEach(item => {
    if (item.tags) {
      if (item.tags.includes('V')) coverage.V++;
      if (item.tags.includes('VG')) coverage.VG++;
      if (item.tags.includes('GF')) coverage.GF++;
      if (item.tags.includes('DF')) coverage.DF++;
    }
  });
  
  return {
    totalFinal: finalItems.length,
    ...coverage
  };
}

// Calculate category totals
function calculateCategoryTotals() {
  if (!AppData.menu.menuItems) return {};
  
  const categories = {};
  
  AppData.menu.menuItems.forEach(item => {
    const cat = item.category || 'Other';
    if (!categories[cat]) {
      categories[cat] = { total: 0, shortlist: 0, final: 0 };
    }
    categories[cat].total++;
    if (item.shortlist) categories[cat].shortlist++;
    if (item.final) categories[cat].final++;
  });
  
  return categories;
}

// ============================================================================
// Role Assignment Functions
// ============================================================================

// Assign role to guest
async function assignRoleToGuest(guestId, characterId) {
  const guest = AppData.guests.find(g => g.id === guestId);
  if (!guest) return false;
  
  guest.assignedCharacter = characterId;
  
  // Also update roles.assignments for tracking
  if (!AppData.roles.assignments) {
    AppData.roles.assignments = {};
  }
  AppData.roles.assignments[guestId] = characterId;
  
  // Save to Firestore if enabled and not in rehearsal mode
  if (FIREBASE_ENABLED && FirebaseManager && !AppData.settings.rehearsalMode) {
    window.notifySaveStart?.();
    await Promise.all([
      FirebaseManager.saveData('guests', AppData.guests),
      FirebaseManager.saveData('roles', AppData.roles)
    ]);
    window.notifySaveSuccess?.();
  }
  
  return true;
}

// Swap roles between two guests
async function swapGuestRoles(guestId1, guestId2) {
  const guest1 = AppData.guests.find(g => g.id === guestId1);
  const guest2 = AppData.guests.find(g => g.id === guestId2);
  
  if (!guest1 || !guest2) return false;
  
  const temp = guest1.assignedCharacter;
  guest1.assignedCharacter = guest2.assignedCharacter;
  guest2.assignedCharacter = temp;
  
  // Update roles.assignments
  if (!AppData.roles.assignments) {
    AppData.roles.assignments = {};
  }
  AppData.roles.assignments[guestId1] = guest1.assignedCharacter;
  AppData.roles.assignments[guestId2] = guest2.assignedCharacter;
  
  // Save to Firestore if enabled and not in rehearsal mode
  if (FIREBASE_ENABLED && FirebaseManager && !AppData.settings.rehearsalMode) {
    window.notifySaveStart?.();
    await Promise.all([
      FirebaseManager.saveData('guests', AppData.guests),
      FirebaseManager.saveData('roles', AppData.roles)
    ]);
    window.notifySaveSuccess?.();
  }
  
  return true;
}

// ============================================================================
// Host Controls Functions
// ============================================================================

// Update settings
async function updateSettings(newSettings) {
  AppData.settings = {
    ...AppData.settings,
    ...newSettings
  };
  
  // Save to Firestore if enabled and not in rehearsal mode
  if (FIREBASE_ENABLED && FirebaseManager && !AppData.settings.rehearsalMode) {
    window.notifySaveStart?.();
    await FirebaseManager.saveData('settings', AppData.settings);
    window.notifySaveSuccess?.();
  }
  
  return true;
}

// Advance cupcake reveal
function advanceCupcakeReveal() {
  if (!AppData.cupcakeRevealIndex) {
    AppData.cupcakeRevealIndex = 0;
  }
  
  const cupcakeOrder = AppData.settings.cupcakeOrder || AppData.story.cupcakeReveal || [];
  
  if (AppData.cupcakeRevealIndex < cupcakeOrder.length) {
    AppData.cupcakeRevealIndex++;
    return cupcakeOrder[AppData.cupcakeRevealIndex - 1];
  }
  
  return null;
}

// Reset cupcake reveal
function resetCupcakeReveal() {
  AppData.cupcakeRevealIndex = 0;
}

// Get flavor-adjusted text
function getFlavorText(baseText, flavor) {
  // Adjust text based on Twin Peaks flavor setting
  const flavorLevel = flavor || AppData.settings.twinPeaksFlavor || 'standard';
  
  if (flavorLevel === 'light') {
    // Tone down mysterious language
    return baseText.replace(/mystic|prophecy|otherworldly/gi, 'interesting');
  } else if (flavorLevel === 'extra') {
    // Add more Twin Peaks flavor
    const extras = [
      ' The owls are watching.',
      ' The log has spoken.',
      ' Fire walk with me.',
      ' Through the darkness of future past.'
    ];
    return baseText + extras[Math.floor(Math.random() * extras.length)];
  }
  
  return baseText; // standard
}

// ============================================================================
// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AppData,
    loadData,
    initApp,
    calculateStats,
    autoAssignCharacters,
    generateCharacterPacket,
    generateInviteText,
    validateData,
    formatDate,
    toggleDecorFavorite,
    toggleDecorShoppingList,
    toggleMenuFavorite,
    toggleMenuFeatured,
    setRolePreference,
    suggestAssignments,
    downloadJSON,
    exportDecorJSON,
    exportMenuJSON,
    exportGuestsJSON,
    exportCharactersJSON,
    downloadAllDataAsZip,
    calculateDecisionProgress,
    // New persistence functions
    toggleAutosave,
    saveToLocalStorage,
    resetToDefaults,
    // New CRUD helpers
    addItem,
    updateItem,
    deleteItem,
    // New import/export functions
    exportDataset,
    importDataset,
    validateImportSchema,
    applyImportedData,
    exportGuests,
    exportCharacters,
    exportVendors,
    exportDecor,
    exportMenu,
    exportSchedule,
    exportStory,
    exportClues,
    exportPackets,
    // Guest CRUD functions
    showAddGuestForm,
    editGuest,
    handleSaveGuest,
    deleteGuest,
    closeGuestEditor,
    handleAutosaveToggle,
    handleImportGuests,
    handleResetGuests,
    // Menu CRUD functions
    showAddMenuItemForm,
    editMenuItem,
    handleSaveMenuItem,
    deleteMenuItem,
    closeMenuEditor,
    handleImportMenu,
    handleResetMenu,
    // Decor CRUD functions
    showAddMoodBoardForm,
    editMoodBoard,
    handleSaveMoodBoard,
    deleteMoodBoard,
    showAddShoppingCategoryForm,
    handleSaveShoppingCategory,
    deleteShoppingCategory,
    showAddShoppingItemForm,
    editShoppingItem,
    handleSaveShoppingItem,
    deleteShoppingItem,
    togglePurchased,
    closeDecorEditor,
    handleImportDecor,
    handleResetDecor,
    // Schedule CRUD functions
    showAddTimelineForm,
    editTimelineItem,
    handleSaveTimelineItem,
    deleteTimelineItem,
    closeScheduleEditor,
    handleImportSchedule,
    handleResetSchedule,
    // Mystery data import/reset handlers
    handleImportStory,
    handleImportClues,
    handleImportPackets,
    handleResetStory,
    handleResetClues,
    handleResetPackets,
    // Admin Data Manager functions
    handleExportDataset,
    handleImportDataset,
    handleResetDataset,
    // Save status and sync functions
    initSaveStatusIndicator,
    updateSaveStatusDisplay,
    forceSyncFromFirestore,
    getSyncStatusInfo
  };
}
