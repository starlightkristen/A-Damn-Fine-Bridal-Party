// A Damn Fine Bridal Party - Main Application Logic

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
  // In-memory state for interactive features
  decorFavorites: new Set(),
  decorShoppingList: new Set(),
  menuFavorites: new Set(),
  menuFeatured: new Set(),
  rolePreferences: {}, // guestId -> characterId mapping
  currentPhase: 'intro', // Track current mystery phase
  // Autosave settings
  autosaveEnabled: false,
  // Original defaults for reset
  defaults: {}
};

// Load all data on page initialization
async function loadData() {
  try {
    // Check if autosave is enabled and data exists in localStorage
    const autosaveEnabled = localStorage.getItem('autosaveEnabled') === 'true';
    AppData.autosaveEnabled = autosaveEnabled;
    
    if (autosaveEnabled && localStorage.getItem('appData')) {
      // Load from localStorage
      const saved = JSON.parse(localStorage.getItem('appData'));
      AppData.guests = saved.guests || [];
      AppData.characters = saved.characters || [];
      AppData.decor = saved.decor || {};
      AppData.vendors = saved.vendors || [];
      AppData.menu = saved.menu || {};
      AppData.schedule = saved.schedule || {};
      AppData.story = saved.story || {};
      AppData.clues = saved.clues || [];
      AppData.packets = saved.packets || [];
    } else {
      // Load from JSON files
      const [guests, characters, decor, vendors, menu, schedule, story, clues, packets] = await Promise.all([
        fetch('./data/guests.json').then(r => r.json()),
        fetch('./data/characters.json').then(r => r.json()),
        fetch('./data/decor.json').then(r => r.json()),
        fetch('./data/vendors.json').then(r => r.json()),
        fetch('./data/menu.json').then(r => r.json()),
        fetch('./data/schedule.json').then(r => r.json()),
        fetch('./data/story.json').then(r => r.json()),
        fetch('./data/clues.json').then(r => r.json()),
        fetch('./data/packets.json').then(r => r.json())
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
    }
    
    // Store defaults for reset functionality
    if (!AppData.defaults.guests) {
      const [guests, characters, decor, vendors, menu, schedule, story, clues, packets] = await Promise.all([
        fetch('./data/guests.json').then(r => r.json()),
        fetch('./data/characters.json').then(r => r.json()),
        fetch('./data/decor.json').then(r => r.json()),
        fetch('./data/vendors.json').then(r => r.json()),
        fetch('./data/menu.json').then(r => r.json()),
        fetch('./data/schedule.json').then(r => r.json()),
        fetch('./data/story.json').then(r => r.json()),
        fetch('./data/clues.json').then(r => r.json()),
        fetch('./data/packets.json').then(r => r.json())
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
        packets: JSON.parse(JSON.stringify(packets))
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
function handleSaveGuest(event, guestId) {
  event.preventDefault();
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
    // Add new guest
    const newId = AppData.guests.length > 0 ? Math.max(...AppData.guests.map(g => g.id)) + 1 : 1;
    guestData.id = newId;
    AppData.guests.push(guestData);
  } else {
    // Update existing guest
    const index = AppData.guests.findIndex(g => g.id === guestId);
    if (index !== -1) {
      AppData.guests[index] = { ...AppData.guests[index], ...guestData };
    }
  }
  
  saveToLocalStorage();
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
}

// Delete guest with confirmation
function deleteGuest(guestId) {
  const guest = AppData.guests.find(g => g.id === guestId);
  if (!guest) return;
  
  if (confirm(`Are you sure you want to delete ${guest.name}? This cannot be undone.`)) {
    AppData.guests = AppData.guests.filter(g => g.id !== guestId);
    saveToLocalStorage();
    
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
  AppData.autosaveEnabled = !AppData.autosaveEnabled;
  localStorage.setItem('autosaveEnabled', AppData.autosaveEnabled.toString());
  
  if (AppData.autosaveEnabled) {
    saveToLocalStorage();
  } else {
    localStorage.removeItem('appData');
  }
  
  return AppData.autosaveEnabled;
}

// Save current state to localStorage
function saveToLocalStorage() {
  if (!AppData.autosaveEnabled) return;
  
  const dataToSave = {
    guests: AppData.guests,
    characters: AppData.characters,
    decor: AppData.decor,
    vendors: AppData.vendors,
    menu: AppData.menu,
    schedule: AppData.schedule,
    story: AppData.story,
    clues: AppData.clues,
    packets: AppData.packets
  };
  
  localStorage.setItem('appData', JSON.stringify(dataToSave));
}

// Reset to defaults from repo
async function resetToDefaults(datasetName) {
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
  } else {
    // Reset specific dataset
    if (AppData.defaults[datasetName]) {
      AppData[datasetName] = JSON.parse(JSON.stringify(AppData.defaults[datasetName]));
    }
  }
  
  saveToLocalStorage();
}

// ============================================================================
// GENERIC CRUD HELPERS
// ============================================================================

// Add item to array dataset
function addItem(datasetName, item) {
  if (Array.isArray(AppData[datasetName])) {
    AppData[datasetName].push(item);
  } else if (AppData[datasetName] && Array.isArray(AppData[datasetName][datasetName])) {
    // For nested arrays like menu.menuItems
    AppData[datasetName][datasetName].push(item);
  }
  saveToLocalStorage();
}

// Update item in array dataset
function updateItem(datasetName, id, updates) {
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
  
  saveToLocalStorage();
}

// Delete item from array dataset
function deleteItem(datasetName, id) {
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
  
  saveToLocalStorage();
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
        item.hasOwnProperty('id') && item.hasOwnProperty('name')
      );
    
    case 'characters':
      return Array.isArray(data) && data.every(item => 
        item.hasOwnProperty('id') && item.hasOwnProperty('name') && item.hasOwnProperty('role')
      );
    
    case 'vendors':
      return Array.isArray(data) && data.every(item => 
        item.hasOwnProperty('name') && item.hasOwnProperty('type')
      );
    
    case 'menu':
      return data.hasOwnProperty('menuItems') && Array.isArray(data.menuItems);
    
    case 'decor':
      return data.hasOwnProperty('moodBoard') && data.hasOwnProperty('shoppingList');
    
    case 'schedule':
      return data.hasOwnProperty('timeline') && Array.isArray(data.timeline);
    
    case 'story':
      return data.hasOwnProperty('title') && data.hasOwnProperty('theMurder') && 
             data.hasOwnProperty('theMurderer');
    
    case 'clues':
      return Array.isArray(data) && data.every(item => 
        item.hasOwnProperty('id') && item.hasOwnProperty('type') && item.hasOwnProperty('text')
      );
    
    case 'packets':
      return Array.isArray(data) && data.every(item => 
        item.hasOwnProperty('character_id') && item.hasOwnProperty('intro_profile') && 
        item.hasOwnProperty('envelopes')
      );
    
    default:
      return true; // Allow unknown datasets
  }
}

// Apply imported data
function applyImportedData(datasetName, data) {
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
    handleResetGuests
  };
}
