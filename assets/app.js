// A Damn Fine Bridal Party - Main Application Logic

// Global data store
const AppData = {
  guests: [],
  characters: [],
  decor: {},
  menu: {},
  schedule: {},
  story: {}
};

// Load all data on page initialization
async function loadData() {
  try {
    const [guests, characters, decor, menu, schedule, story] = await Promise.all([
      fetch('./data/guests.json').then(r => r.json()),
      fetch('./data/characters.json').then(r => r.json()),
      fetch('./data/decor.json').then(r => r.json()),
      fetch('./data/menu.json').then(r => r.json()),
      fetch('./data/schedule.json').then(r => r.json()),
      fetch('./data/story.json').then(r => r.json())
    ]);
    
    AppData.guests = guests;
    AppData.characters = characters;
    AppData.decor = decor;
    AppData.menu = menu;
    AppData.schedule = schedule;
    AppData.story = story;
    
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
  
  // Render page-specific content
  const page = getPageName();
  if (window.renderPage && typeof window.renderPage === 'function') {
    window.renderPage(page);
  }
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
  return {
    totalGuests: AppData.guests.length,
    confirmedGuests: AppData.guests.filter(g => g.rsvp === 'confirmed').length,
    pendingGuests: AppData.guests.filter(g => g.rsvp === 'pending').length,
    assignedCharacters: AppData.guests.filter(g => g.assignedCharacter).length,
    availableCharacters: AppData.characters.length,
    menuItems: AppData.menu.menuItems ? AppData.menu.menuItems.length : 0,
    decorItems: AppData.decor.shoppingList ? 
      AppData.decor.shoppingList.reduce((sum, cat) => sum + cat.items.length, 0) : 0
  };
}

// Auto-assign characters to guests
function autoAssignCharacters() {
  const unassignedGuests = AppData.guests.filter(g => !g.assignedCharacter);
  const availableCharacters = [...AppData.characters];
  
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
  invite += `You're invited to "A Damn Fine Bridal Party" for Marlena!\n\n`;
  invite += `Join us for coffee, pie, mystery & celebration.\n\n`;
  
  if (character) {
    invite += `Your character: ${character.name} - ${character.role}\n`;
    invite += `Come prepared to solve a mystery!\n\n`;
  }
  
  invite += `"The owls are not what they seem..."\n\n`;
  invite += `RSVP by [DATE]\n`;
  invite += `Location: [TO BE ANNOUNCED]\n`;
  
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
    formatDate
  };
}
