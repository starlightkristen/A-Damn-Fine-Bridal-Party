// A Damn Fine Bridal Party - Rendering Module

// Render functions for each page
const Render = {
  
  // Render index/dashboard page
  index: function() {
    const stats = calculateStats();
    
    document.getElementById('dashboard-stats').innerHTML = `
      <div class="stat-card">
        <h3>${stats.totalGuests}</h3>
        <p>Total Guests</p>
      </div>
      <div class="stat-card">
        <h3>${stats.confirmedGuests}</h3>
        <p>Confirmed</p>
      </div>
      <div class="stat-card">
        <h3>${stats.assignedCharacters}</h3>
        <p>Characters Assigned</p>
      </div>
      <div class="stat-card">
        <h3>${stats.menuItems}</h3>
        <p>Menu Items</p>
      </div>
    `;
  },
  
  // Render decor page
  decor: function() {
    // Render mood board
    const moodHtml = AppData.decor.moodBoard.map(mood => `
      <div class="card">
        <h3>${mood.name}</h3>
        <p>${mood.description}</p>
        <div style="display: flex; gap: 10px; margin: 10px 0;">
          ${mood.colors.map(color => 
            `<div style="width: 50px; height: 50px; background: ${color}; border-radius: 5px;"></div>`
          ).join('')}
        </div>
        <ul>
          ${mood.items.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <div class="item-controls">
          <button class="favorite-btn ${AppData.decorFavorites.has(mood.id) ? 'active' : ''}" 
                  onclick="handleDecorFavorite('${mood.id}')">
            ${AppData.decorFavorites.has(mood.id) ? '❤️ Favorited' : '🤍 Favorite'}
          </button>
          <button class="add-to-list-btn ${AppData.decorShoppingList.has(mood.id) ? 'active' : ''}" 
                  onclick="handleDecorShoppingList('${mood.id}')">
            ${AppData.decorShoppingList.has(mood.id) ? '✓ In Shopping List' : '+ Add to Shopping List'}
          </button>
        </div>
      </div>
    `).join('');
    
    document.getElementById('mood-board').innerHTML = moodHtml;
    
    // Add export button
    const exportSection = `
      <div style="text-align: center; margin-top: 20px;">
        <button class="export-btn" onclick="exportDecorJSON()">
          📥 Export Decor Selections
        </button>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">
          Downloads your favorited items and shopping list as decor.json
        </p>
      </div>
    `;
    document.getElementById('mood-board').innerHTML += exportSection;
    
    // Render shopping list
    const shoppingHtml = AppData.decor.shoppingList.map(category => `
      <div class="card">
        <h3>${category.category}</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Estimated Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${category.items.map(item => `
              <tr>
                <td>${item.item}</td>
                <td>${item.quantity}</td>
                <td>$${item.estimated}</td>
                <td>${item.purchased ? '✓ Purchased' : 'Pending'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('');
    
    document.getElementById('shopping-list').innerHTML = shoppingHtml;
    
    // Render vendors
    const vendorsHtml = AppData.decor.vendors.map(vendor => `
      <div class="card">
        <h3>${vendor.name}</h3>
        <p><strong>Type:</strong> ${vendor.type}</p>
        <p><strong>Contact:</strong> ${vendor.contact}</p>
        <p><strong>Phone:</strong> ${vendor.phone}</p>
        <p>${vendor.notes}</p>
      </div>
    `).join('');
    
    document.getElementById('vendors').innerHTML = vendorsHtml;
  },
  
  // Render food page
  food: function() {
    // Helper function to generate dietary badges
    const generateDietaryBadges = (item) => {
      const badges = [];
      const description = (item.description + ' ' + item.dietaryOptions.join(' ')).toLowerCase();
      
      if (description.includes('vegan')) badges.push('<span class="dietary-badge vegan">🌱 Vegan</span>');
      if (description.includes('vegetarian')) badges.push('<span class="dietary-badge vegetarian">🥗 Vegetarian</span>');
      if (description.includes('gluten-free')) badges.push('<span class="dietary-badge gluten-free">🌾 Gluten-Free</span>');
      if (description.includes('dairy-free')) badges.push('<span class="dietary-badge dairy-free">🥛 Dairy-Free</span>');
      
      return badges.join(' ');
    };
    
    // Render menu items by category
    const categories = ['Dessert', 'Beverage', 'Main', 'Side', 'Appetizer'];
    const menuHtml = categories.map(category => {
      const items = AppData.menu.menuItems.filter(item => item.category === category);
      if (items.length === 0) return '';
      
      return `
        <div class="card">
          <h3>${category}</h3>
          ${items.map(item => `
            <div style="padding: 15px; margin: 10px 0; background: var(--cream); border-radius: 8px; ${AppData.menuFeatured.has(item.id) ? 'border: 3px solid var(--gold);' : ''}">
              <h4 style="color: var(--deep-cherry-red);">${item.name}</h4>
              <p>${item.description}</p>
              <p><strong>Serves:</strong> ${item.serves} | <strong>Prep Time:</strong> ${item.prepTime}</p>
              ${item.allergens.length > 0 ? `<p><strong>Allergens:</strong> ${item.allergens.join(', ')}</p>` : ''}
              ${item.dietaryOptions.length > 0 ? `<p><em>${item.dietaryOptions.join(', ')}</em></p>` : ''}
              <div style="margin: 10px 0;">
                ${generateDietaryBadges(item)}
              </div>
              <div class="item-controls">
                <button class="favorite-btn ${AppData.menuFavorites.has(item.id) ? 'active' : ''}" 
                        onclick="handleMenuFavorite('${item.id}')">
                  ${AppData.menuFavorites.has(item.id) ? '⭐ Starred' : '☆ Star'}
                </button>
                <button class="favorite-btn ${AppData.menuFeatured.has(item.id) ? 'active' : ''}" 
                        onclick="handleMenuFeatured('${item.id}')"
                        style="background: ${AppData.menuFeatured.has(item.id) ? 'var(--gold)' : 'transparent'}; border-color: var(--gold);">
                  ${AppData.menuFeatured.has(item.id) ? '🏆 Featured' : '🏆 Feature on Menu'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
    
    document.getElementById('menu-items').innerHTML = menuHtml;
    
    // Add export button
    const exportSection = `
      <div style="text-align: center; margin-top: 20px;">
        <button class="export-btn" onclick="exportMenuJSON()">
          📥 Export Menu Selections
        </button>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">
          Downloads your starred and featured menu items as menu.json
        </p>
      </div>
    `;
    document.getElementById('menu-items').innerHTML += exportSection;
    
    // Render prep timeline
    const timelineHtml = AppData.menu.prepTimeline.map(phase => `
      <div class="card">
        <h3>${phase.time}</h3>
        <ul class="item-list">
          ${phase.tasks.map(task => `<li>${task}</li>`).join('')}
        </ul>
      </div>
    `).join('');
    
    document.getElementById('prep-timeline').innerHTML = timelineHtml;
  },
  
  // Render mystery page
  mystery: function() {
    // Render story overview
    document.getElementById('story-overview').innerHTML = `
      <div class="card">
        <h2>${AppData.story.title}</h2>
        <h3>${AppData.story.subtitle}</h3>
        <p><strong>Setting:</strong> ${AppData.story.setting}</p>
        <p>${AppData.story.overview}</p>
      </div>
      
      <div class="card">
        <h3>The Murder</h3>
        <p><strong>Victim:</strong> ${AppData.story.theMurder.victim}</p>
        <p>${AppData.story.theMurder.victimDescription}</p>
        <p><strong>Cause of Death:</strong> ${AppData.story.theMurder.causeOfDeath}</p>
        <p><strong>Location:</strong> ${AppData.story.theMurder.location}</p>
      </div>
      
      <div class="card">
        <h3>Solution (Host Only!)</h3>
        <div class="alert alert-danger">
          <strong>Spoiler Alert:</strong> This section reveals the solution. Keep this page away from guests!
        </div>
        <p><strong>Murderer:</strong> ${AppData.story.theMurderer.character}</p>
        <p><strong>Motive:</strong> ${AppData.story.theMurderer.motive}</p>
        <p><strong>Method:</strong> ${AppData.story.theMurderer.method}</p>
        <p>${AppData.story.solution}</p>
      </div>
    `;
    
    // Render character list with role assignment controls
    const unassignedCount = AppData.guests.filter(g => !g.assignedCharacter).length;
    const assignmentStatus = `
      <div class="alert ${unassignedCount === 0 ? 'alert-success' : 'alert-warning'}" style="margin-bottom: 20px;">
        <strong>Assignment Status:</strong> ${AppData.guests.filter(g => g.assignedCharacter).length} of ${AppData.guests.length} guests assigned
        ${unassignedCount > 0 ? `<br><em>${unassignedCount} guest(s) still need role assignments</em>` : ''}
      </div>
      ${unassignedCount > 0 ? `
        <div style="text-align: center; margin: 20px 0;">
          <button class="btn" onclick="handleSuggestAssignments()">
            🎭 Suggest Role Assignments
          </button>
          <p style="margin-top: 10px; font-size: 14px; color: #666;">
            Automatically assigns unassigned guests to available roles
          </p>
        </div>
      ` : ''}
    `;
    
    const charactersHtml = AppData.characters.map(char => {
      const assignedGuest = AppData.guests.find(g => g.assignedCharacter === char.id);
      return `
      <div class="character-card">
        <h4>${char.name}</h4>
        <span class="role">${char.role}</span>
        ${assignedGuest ? `<p style="color: var(--forest-emerald); font-weight: bold;">✓ Assigned to: ${assignedGuest.name}</p>` : '<p style="color: #999;">Available</p>'}
        <p><strong>Briefing:</strong> ${char.briefing}</p>
        <p><strong>Costume:</strong> ${char.costume}</p>
        <p><strong>Personality:</strong> ${char.personality}</p>
        <button class="btn btn-secondary" onclick="printCharacterPacket('${char.id}')">Print Packet</button>
      </div>
    `;
    }).join('');
    
    document.getElementById('character-list').innerHTML = assignmentStatus + charactersHtml;
  },
  
  // Render schedule page
  schedule: function() {
    const scheduleHtml = AppData.schedule.timeline.map((block, index) => `
      <div class="card">
        <h3>${block.time} - ${block.title}</h3>
        <p><strong>Duration:</strong> ${block.duration}</p>
        <p>${block.description}</p>
        <h4>Activities:</h4>
        <ul>
          ${block.activities.map(activity => `<li>${activity}</li>`).join('')}
        </ul>
        <p><strong>Music:</strong> ${block.music}</p>
        <p><em>${block.notes}</em></p>
      </div>
    `).join('');
    
    document.getElementById('schedule-timeline').innerHTML = scheduleHtml;
  },
  
  // Render guests page
  guests: function() {
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Dietary</th>
            <th>Character</th>
            <th>RSVP</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${AppData.guests.map(guest => {
            const character = guest.assignedCharacter ? 
              AppData.characters.find(c => c.id === guest.assignedCharacter) : null;
            
            return `
              <tr>
                <td>${guest.name}</td>
                <td>${guest.email}</td>
                <td>${guest.dietary}</td>
                <td>${character ? character.name : 'Not assigned'}</td>
                <td>${guest.rsvp}</td>
                <td>
                  <button class="btn" onclick="copyInvite(${guest.id})">Copy Invite</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('guest-table').innerHTML = tableHtml;
  },
  
  // Render admin page
  admin: function() {
    const errors = validateData();
    
    const validationHtml = errors.length === 0 ? 
      '<div class="alert alert-success">✓ All data is valid!</div>' :
      `<div class="alert alert-danger">
        <strong>Validation Errors:</strong>
        <ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>
      </div>`;
    
    document.getElementById('validation-results').innerHTML = validationHtml;
    
    // Decision Mode Section
    const progress = calculateDecisionProgress();
    const decisionModeHtml = `
      <div class="card">
        <h2>🎯 Decision Mode - Guided Planning Flow</h2>
        <p>Follow this step-by-step guide to make all your planning decisions. Track your progress and export when ready!</p>
        
        <div class="decision-step ${progress.decorFavorited >= 33 ? 'completed' : ''}">
          <h3>Step 1: Decor Selection</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.decorFavorited}%;">
              ${progress.decorFavorited}% Favorited
            </div>
          </div>
          <p><strong>Status:</strong> ${progress.decorFavorited >= 33 ? '✓ Complete' : `${AppData.decorFavorites.size} of ${AppData.decor.moodBoard ? AppData.decor.moodBoard.length : 0} mood boards favorited`}</p>
          <p>Choose your favorite decor themes and add items to your shopping list.</p>
          <a href="decor.html" class="btn">Go to Decor Planning</a>
        </div>
        
        <div class="decision-step ${progress.menuFeatured >= 25 ? 'completed' : ''}">
          <h3>Step 2: Menu Curation</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.menuFeatured}%;">
              ${progress.menuFeatured}% Featured
            </div>
          </div>
          <p><strong>Status:</strong> ${progress.menuFeatured >= 25 ? '✓ Complete' : `${AppData.menuFeatured.size} menu items featured`}</p>
          <p>Star your favorites and feature the items you want on the final menu.</p>
          <a href="food.html" class="btn">Go to Menu Planning</a>
        </div>
        
        <div class="decision-step ${progress.rolesAssigned >= 80 ? 'completed' : ''}">
          <h3>Step 3: Character Assignments</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.rolesAssigned}%;">
              ${progress.rolesAssigned}% Assigned
            </div>
          </div>
          <p><strong>Status:</strong> ${progress.rolesAssigned >= 80 ? '✓ Complete' : `${progress.totalAssigned} of ${AppData.guests.length} guests assigned`}</p>
          <p>Assign mystery character roles to your guests.</p>
          <a href="mystery.html" class="btn">Go to Mystery Planning</a>
          <a href="guests.html" class="btn btn-secondary">Manage Guests</a>
        </div>
        
        <div class="decision-step">
          <h3>Step 4: Review Schedule</h3>
          <p>Finalize your 2-hour timeline and make any necessary adjustments.</p>
          <a href="schedule.html" class="btn">View Schedule</a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; background: linear-gradient(135deg, var(--deep-cherry-red), var(--dark-wood)); border-radius: 10px;">
          <h3 style="color: var(--gold); margin-bottom: 15px;">📦 Export Complete Plan</h3>
          <p style="color: white; margin-bottom: 15px;">Download all your decisions and data as a ZIP file</p>
          <button class="btn btn-secondary" onclick="downloadAllDataAsZip()" style="font-size: 18px;">
            ⬇️ Download Current Plan (ZIP)
          </button>
          <p style="color: var(--cream); margin-top: 10px; font-size: 14px;">
            Includes all JSON files with your favorites, featured items, and assignments
          </p>
        </div>
      </div>
    `;
    
    // Insert decision mode before validation results
    const container = document.getElementById('validation-results').parentElement;
    const decisionDiv = document.createElement('div');
    decisionDiv.innerHTML = decisionModeHtml;
    container.insertBefore(decisionDiv.firstElementChild, container.firstElementChild);
    
    // Data links
    document.getElementById('data-links').innerHTML = `
      <ul class="item-list">
        <li><a href="./data/guests.json" target="_blank">guests.json</a> <span>${AppData.guests.length} guests</span></li>
        <li><a href="./data/characters.json" target="_blank">characters.json</a> <span>${AppData.characters.length} characters</span></li>
        <li><a href="./data/decor.json" target="_blank">decor.json</a></li>
        <li><a href="./data/menu.json" target="_blank">menu.json</a> <span>${AppData.menu.menuItems.length} items</span></li>
        <li><a href="./data/schedule.json" target="_blank">schedule.json</a></li>
        <li><a href="./data/story.json" target="_blank">story.json</a></li>
      </ul>
    `;
  }
};

// Page rendering dispatcher
window.renderPage = function(page) {
  if (Render[page]) {
    Render[page]();
  }
};

// Helper functions for button actions
window.printCharacterPacket = function(characterId) {
  const character = AppData.characters.find(c => c.id === characterId);
  if (!character) return;
  
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Character Packet - ${character.name}</title>
        <style>
          body { font-family: Georgia, serif; padding: 40px; }
          h1 { color: #8B0000; }
          .section { margin: 20px 0; padding: 15px; background: #f5f5dc; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>${character.name}</h1>
        <h2>${character.role}</h2>
        <div class="section">
          <h3>Your Character Briefing</h3>
          <p>${character.briefing}</p>
        </div>
        <div class="section">
          <h3>Costume</h3>
          <p>${character.costume}</p>
        </div>
        <div class="section">
          <h3>Your Secret</h3>
          <p>${character.secret}</p>
        </div>
        <div class="section">
          <h3>Your Objective</h3>
          <p>${character.objective}</p>
        </div>
        <div class="section">
          <h3>Personality Traits</h3>
          <p>${character.personality}</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

window.copyInvite = function(guestId) {
  const inviteText = generateInviteText(guestId);
  
  navigator.clipboard.writeText(inviteText).then(() => {
    alert('Invite text copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy text:', err);
    alert('Failed to copy. Please try again.');
  });
};

window.autoAssignAll = function() {
  autoAssignCharacters();
  alert('Characters automatically assigned!');
  if (window.renderPage) {
    window.renderPage('guests');
  }
};

// Decor interaction handlers
window.handleDecorFavorite = function(itemId) {
  toggleDecorFavorite(itemId);
  window.renderPage('decor');
};

window.handleDecorShoppingList = function(itemId) {
  toggleDecorShoppingList(itemId);
  window.renderPage('decor');
};

// Menu interaction handlers
window.handleMenuFavorite = function(itemId) {
  toggleMenuFavorite(itemId);
  window.renderPage('food');
};

window.handleMenuFeatured = function(itemId) {
  toggleMenuFeatured(itemId);
  window.renderPage('food');
};

// Mystery/Role assignment handler
window.handleSuggestAssignments = function() {
  const unassigned = suggestAssignments();
  if (unassigned === 0) {
    alert('All guests have been assigned roles!');
  } else {
    alert(`Assignments suggested! ${unassigned} guest(s) could not be assigned (not enough available roles).`);
  }
  window.renderPage('mystery');
};
