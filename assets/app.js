// A Damn Fine Bridal Party - Main Application Logic

// Global data store
const AppData = {
  guests: [],
  characters: [],
  decor: {},
  menu: {},
  schedule: {},
  story: {},
  clues: [],
  packets: [],
  // In-memory state for interactive features
  decorFavorites: new Set(),
  decorShoppingList: new Set(),
  menuFavorites: new Set(),
  menuFeatured: new Set(),
  rolePreferences: {}, // guestId -> characterId mapping
  currentPhase: 'intro' // Track current mystery phase
};

// Load all data on page initialization
async function loadData() {
  try {
    const [guests, characters, decor, menu, schedule, story, clues, packets] = await Promise.all([
      fetch('./data/guests.json').then(r => r.json()),
      fetch('./data/characters.json').then(r => r.json()),
      fetch('./data/decor.json').then(r => r.json()),
      fetch('./data/menu.json').then(r => r.json()),
      fetch('./data/schedule.json').then(r => r.json()),
      fetch('./data/story.json').then(r => r.json()),
      fetch('./data/clues.json').then(r => r.json()),
      fetch('./data/packets.json').then(r => r.json())
    ]);
    
    AppData.guests = guests;
    AppData.characters = characters;
    AppData.decor = decor;
    AppData.menu = menu;
    AppData.schedule = schedule;
    AppData.story = story;
    AppData.clues = clues;
    AppData.packets = packets;
    
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
    const packet = getPacketForCharacter(character.id);
    if (packet && packet.intro_profile) {
      invite += `🎭 YOUR SECRET CHARACTER ASSIGNMENT:\n`;
      invite += `${packet.intro_profile.name} - ${packet.intro_profile.role}\n`;
      invite += `"${packet.intro_profile.tagline}"\n\n`;
      invite += `${packet.intro_profile.overview}\n\n`;
      invite += `Costume Essentials: ${packet.intro_profile.costume_essentials.join(', ')}\n\n`;
      invite += `Come prepared to solve a mystery and stay in character!\n\n`;
    } else {
      invite += `🎭 YOUR SECRET CHARACTER ASSIGNMENT:\n`;
      invite += `${character.name} - ${character.role}\n`;
      invite += `Come prepared to solve a mystery and stay in character!\n\n`;
    }
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
