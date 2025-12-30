// A Damn Fine Bridal Party - Simplified Main Application Logic

// Firebase Integration Flag - DISABLED for now to get basic functionality working
const FIREBASE_ENABLED = false;

// Firebase Manager (will be null when disabled)
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
  rolePreferences: {},
  currentPhase: 'intro',
  phaseTimerState: null,
  cupcakeRevealIndex: 0,
  autosaveEnabled: false,
  defaults: {},
  firebaseSyncEnabled: FIREBASE_ENABLED,
  historyStack: [],
  hostEmails: ['kstehlar@solarainnovations.com', 'marlenamoomoo@gmail.com']
};

// Helper to check if current user is a Host
window.isHost = function() {
  // For now, always return true for testing
  return true;
}

// Get display identity for the current user
function getUserIdentity() {
  return 'Test User';
}

function ensureEditableSections() {
  const scheduleDefaults = AppData.defaults.schedule || {};
  const menuDefaults = AppData.defaults.menu || {};
  const storyDefaults = AppData.defaults.story || {};

  AppData.schedule = AppData.schedule || {};
  AppData.menu = AppData.menu || {};
  AppData.story = AppData.story || {};

  AppData.schedule.supplies = (Array.isArray(AppData.schedule.supplies) && AppData.schedule.supplies.length)
    ? AppData.schedule.supplies
    : (scheduleDefaults.supplies || []);
  AppData.schedule.musicSuggestions = AppData.schedule.musicSuggestions || scheduleDefaults.musicSuggestions || { scene: [], mystery: [] };
  AppData.schedule.backupPlans = AppData.schedule.backupPlans || scheduleDefaults.backupPlans || {};
  AppData.schedule.momentsToCapture = (Array.isArray(AppData.schedule.momentsToCapture) && AppData.schedule.momentsToCapture.length)
    ? AppData.schedule.momentsToCapture
    : (scheduleDefaults.momentsToCapture || []);

  AppData.menu.foodPhilosophy = Array.isArray(AppData.menu.foodPhilosophy)
    ? AppData.menu.foodPhilosophy
    : (menuDefaults.foodPhilosophy || []);

  AppData.story.anonymousTips = Array.isArray(AppData.story.anonymousTips)
    ? AppData.story.anonymousTips
    : (storyDefaults.anonymousTips || []);
  AppData.story.redHerrings = Array.isArray(AppData.story.redHerrings)
    ? AppData.story.redHerrings
    : (storyDefaults.redHerrings || []);
  AppData.story.twists = Array.isArray(AppData.story.twists)
    ? AppData.story.twists
    : (storyDefaults.twists || []);
  AppData.story.cupcakeReveal = Array.isArray(AppData.story.cupcakeReveal)
    ? AppData.story.cupcakeReveal
    : (storyDefaults.cupcakeReveal || []);
}

// Simplified data loading - only from JSON files
async function loadData() {
  try {
    console.log('Loading data from JSON files...');
    
    const responses = await Promise.all([
      fetch('./data/guests.json'),
      fetch('./data/characters.json'),
      fetch('./data/decor.json'),
      fetch('./data/vendors.json'),
      fetch('./data/menu.json'),
      fetch('./data/schedule.json'),
      fetch('./data/story.json'),
      fetch('./data/clues.json'),
      fetch('./data/packets.json'),
      fetch('./data/settings.json'),
      fetch('./data/roles.json'),
      fetch('./data/pageNotes.json').catch(() => null)
    ]);
    
    // Check if any fetch failed
    for (let i = 0; i < responses.length - 1; i++) {
      if (!responses[i].ok) {
        throw new Error(`Failed to load data file ${i}: ${responses[i].statusText}`);
      }
    }
    
    const [guests, characters, decor, vendors, menu, schedule, story, clues, packets, settings, roles, pageNotes] = await Promise.all([
      responses[0].json(),
      responses[1].json(), 
      responses[2].json(),
      responses[3].json(),
      responses[4].json(),
      responses[5].json(),
      responses[6].json(),
      responses[7].json(),
      responses[8].json(),
      responses[9].json(),
      responses[10].json(),
      responses[11] ? responses[11].json() : {}
    ]);
    
    // Store the data
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
    
    // Store defaults for reset functionality
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
    
    // Ensure editable sections exist
    ensureEditableSections();
    
    console.log('Data loaded successfully');
    console.log('Guests:', AppData.guests.length);
    console.log('Characters:', AppData.characters.length);
    console.log('Schedule title:', AppData.schedule.eventTitle);
    
    return true;
  } catch (error) {
    console.error('Error loading data:', error);
    return false;
  }
}

// Initialize app
async function initApp() {
  console.log('Initializing app...');
  
  const loaded = await loadData();
  
  if (!loaded) {
    document.body.innerHTML = `
      <div class="container">
        <div class="alert alert-danger">
          <strong>Error:</strong> Failed to load data. Please check the console for details.
        </div>
      </div>
    `;
    return;
  }
  
  // Set active nav link
  setActiveNavLink();
  
  // Render page-specific content
  const page = getPageName();
  console.log('Current page:', page);
  
  if (window.Render && window.Render[page]) {
    console.log('Rendering page:', page);
    window.Render[page]();
  } else {
    console.log('No render function found for page:', page);
  }
  
  console.log('App initialized successfully');
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

// Calculate stats for dashboard
function calculateStats() {
  return {
    totalGuests: AppData.guests.length,
    confirmedGuests: AppData.guests.filter(g => g.rsvp === 'confirmed').length,
    totalCharacters: AppData.characters.length,
    assignedCharacters: AppData.guests.filter(g => g.assignedCharacter).length,
    totalClues: AppData.clues.length,
    totalPackets: AppData.packets.length,
    menuItems: AppData.menu && AppData.menu.menuItems ? AppData.menu.menuItems.length : 0
  };
}

// ============================================================================
// Global Exports - Make functions available to HTML scripts
// ============================================================================
window.initApp = initApp;
window.loadData = loadData;
window.AppData = AppData;
window.FIREBASE_ENABLED = FIREBASE_ENABLED;
window.FirebaseManager = FirebaseManager;
window.getPageName = getPageName;
window.calculateStats = calculateStats;
window.getUserIdentity = getUserIdentity;