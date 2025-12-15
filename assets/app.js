// A Damn Fine Bridal Party - Main Application Logic

// Global data store
const AppData = {
  guests: [],
  characters: [],
  decor: {},
  menu: {},
  schedule: {},
  story: {},
  // In-memory state for interactive features
  decorFavorites: new Set(),
  decorShoppingList: new Set(),
  menuFavorites: new Set(),
  menuFeatured: new Set(),
  rolePreferences: {} // guestId -> characterId mapping
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
    menuItems: AppData.menu.menuItems ? AppData.menu.menuItems.length : 0,
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
    invite += `${character.name} - ${character.role}\n`;
    invite += `Come prepared to solve a mystery and stay in character!\n\n`;
  }
  
  invite += `Join us for:\n`;
  invite += `☕ Damn fine coffee and cherry pie\n`;
  invite += `🔍 An immersive murder mystery experience\n`;
  invite += `🎉 Celebration, secrets, and surprises\n`;
  invite += `🌲 Twin Peaks atmosphere and Pacific Northwest charm\n\n`;
  
  invite += `📅 Date & Time: [TO BE ANNOUNCED]\n`;
  invite += `📍 Location: [TO BE ANNOUNCED]\n`;
  invite += `🔗 RSVP: [LINK TO BE PROVIDED]\n\n`;
  
  if (guest.dietary && guest.dietary !== 'None') {
    invite += `We have your dietary needs noted: ${guest.dietary}\n\n`;
  }
  
  invite += `Dress Code: Channel your inner Twin Peaks character!\n`;
  invite += `Think 1950s Pacific Northwest - plaid, vintage, mysterious elegance.\n\n`;
  
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

// Calculate decision progress
function calculateDecisionProgress() {
  const totalMoodBoards = AppData.decor.moodBoard ? AppData.decor.moodBoard.length : 0;
  const totalMenuItems = AppData.menu.menuItems ? AppData.menu.menuItems.length : 0;
  const totalGuests = AppData.guests.length;
  
  return {
    decorFavorited: totalMoodBoards > 0 ? Math.round((AppData.decorFavorites.size / totalMoodBoards) * 100) : 0,
    menuFeatured: totalMenuItems > 0 ? Math.round((AppData.menuFeatured.size / totalMenuItems) * 100) : 0,
    rolesAssigned: totalGuests > 0 ? Math.round((AppData.guests.filter(g => g.assignedCharacter).length / totalGuests) * 100) : 0,
    totalFavorites: AppData.decorFavorites.size + AppData.menuFavorites.size,
    totalFeatured: AppData.menuFeatured.size,
    totalAssigned: AppData.guests.filter(g => g.assignedCharacter).length
  };
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
    calculateDecisionProgress
  };
}
