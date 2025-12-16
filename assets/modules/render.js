// A Damn Fine Bridal Party - Rendering Module

// Helper function to render clues by phase
function renderCluesByPhase(phase) {
  const clues = AppData.clues.filter(c => c.reveal_phase === phase);
  
  if (clues.length === 0) {
    return '<p style="color: #999;">No clues for this phase.</p>';
  }
  
  return `
    <div style="display: grid; gap: 10px;">
      ${clues.map(clue => {
        const holder = AppData.characters.find(c => c.id === clue.holder_id);
        const typeColors = {
          'implicates': '#8B0000',
          'eliminates': '#0B4F3F',
          'timeline': '#C79810',
          'motive': '#8B0000',
          'red_herring': '#999',
          'twist': '#8B0000'
        };
        return `
          <div style="border-left: 4px solid ${typeColors[clue.type] || '#666'}; padding: 10px; background: white; border-radius: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
              <strong style="color: ${typeColors[clue.type] || '#666'};">${clue.type.toUpperCase()}</strong>
              <span style="background: #f0f0f0; padding: 2px 8px; border-radius: 3px; font-size: 12px;">Held by: ${holder ? holder.name : clue.holder_id}</span>
            </div>
            <p style="margin: 5px 0; font-size: 14px;">${clue.text}</p>
            <p style="margin: 5px 0; font-size: 12px; color: #666; font-style: italic;">💡 ${clue.trade_hint}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Helper function to render director notes for phase
function renderDirectorNotes(phase) {
  const phaseInfo = {
    'intro': {
      time: '0:50-1:10',
      notes: 'Characters are introduced. Envelope 1 opened. Guests begin to understand their roles and initial clues.',
      instructions: [
        'Ensure all guests have opened Envelope 1',
        'Give guests 5-10 minutes to read and absorb their character info',
        'Encourage initial mingling and character interactions',
        'Watch for shy guests and help draw them in'
      ]
    },
    'mid': {
      time: '1:10-1:25',
      notes: 'Investigation deepens. Envelope 2 opened. More clues revealed, patterns begin to emerge.',
      instructions: [
        'Announce it\'s time to open Envelope 2',
        'Clues should start connecting',
        'Watch for guests who are stuck and provide gentle hints',
        'Build tension and mystery atmosphere'
      ]
    },
    'pre-final': {
      time: '1:25-1:35',
      notes: 'Critical evidence emerges. Envelope 3 opened. Guests should be narrowing in on suspects.',
      instructions: [
        'Announce Envelope 3 opening',
        'Critical clues are now in play',
        'Guests should be forming theories',
        'Prepare for the final reveal'
      ]
    },
    'final': {
      time: '1:35-1:45',
      notes: 'Truth revealed before cupcake ceremony. Envelope 4 opened. All clues come together.',
      instructions: [
        'Have all guests open Envelope 4 BEFORE cupcakes',
        'Final revelations set up the solution',
        'Proceed to cupcake reveal ceremony',
        'The murderer (Josie/owner) is revealed!'
      ]
    }
  };
  
  const info = phaseInfo[phase];
  if (!info) return '<p>No director notes for this phase.</p>';
  
  return `
    <div style="background: #fff9e6; border: 2px solid #C79810; padding: 15px; border-radius: 8px;">
      <p><strong>⏰ Timing:</strong> ${info.time}</p>
      <p style="margin: 10px 0;">${info.notes}</p>
      <h4 style="margin: 15px 0 10px 0;">📋 Instructions:</h4>
      <ul style="margin: 5px 0; padding-left: 20px;">
        ${info.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
      </ul>
    </div>
  `;
}

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
    // Check if mood board exists
    if (!AppData.decor.moodBoard || AppData.decor.moodBoard.length === 0) {
      document.getElementById('mood-board').innerHTML = `
        <div class="alert alert-info">
          <strong>No mood boards yet!</strong> Click "Add Mood Board" below to start planning your decor.
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <button class="btn" onclick="showAddMoodBoardForm()">➕ Add Mood Board</button>
        </div>
      `;
    } else {
      // Controls at the top
      const controlsHtml = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
          <div>
            <button class="btn" onclick="showAddMoodBoardForm()">➕ Add Mood Board</button>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
              <input type="checkbox" id="autosave-toggle-decor" ${AppData.autosaveEnabled ? 'checked' : ''} onchange="handleAutosaveToggle()">
              <span>Autosave ${AppData.autosaveEnabled ? '✓' : ''}</span>
            </label>
            <button class="btn" onclick="handleImportDecor()">📂 Import</button>
            <button class="btn" onclick="exportDecor()">📥 Export</button>
            <button class="btn btn-secondary" onclick="handleResetDecor()">🔄 Reset</button>
          </div>
        </div>
      `;
      
      // Render mood board
      const moodHtml = AppData.decor.moodBoard.map(mood => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <h3 style="margin: 0;">${mood.name}</h3>
            <div>
              <button class="btn-sm" onclick="editMoodBoard('${mood.id}')" title="Edit mood board">✏️</button>
              <button class="btn-sm" onclick="deleteMoodBoard('${mood.id}')" title="Delete mood board">🗑️</button>
            </div>
          </div>
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
      
      document.getElementById('mood-board').innerHTML = controlsHtml + moodHtml;
    }
    
    // Render shopping list with CRUD
    if (!AppData.decor.shoppingList || AppData.decor.shoppingList.length === 0) {
      document.getElementById('shopping-list').innerHTML = `
        <div class="alert alert-info">
          <strong>No shopping list items yet!</strong> Click "Add Category" below to start your shopping list.
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <button class="btn" onclick="showAddShoppingCategoryForm()">➕ Add Category</button>
        </div>
      `;
    } else {
      const shoppingControlsHtml = `
        <div style="margin-bottom: 20px;">
          <button class="btn" onclick="showAddShoppingCategoryForm()">➕ Add Category</button>
        </div>
      `;
      
      const shoppingHtml = AppData.decor.shoppingList.map((category, catIndex) => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0;">${category.category}</h3>
            <div>
              <button class="btn-sm" onclick="showAddShoppingItemForm(${catIndex})" title="Add item to category">➕</button>
              <button class="btn-sm" onclick="deleteShoppingCategory(${catIndex})" title="Delete category">🗑️</button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Estimated Cost</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${category.items.map((item, itemIndex) => `
                <tr>
                  <td>${item.item}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.estimated}</td>
                  <td>${item.purchased ? '✓ Purchased' : 'Pending'}</td>
                  <td>
                    <button class="btn-sm" onclick="editShoppingItem(${catIndex}, ${itemIndex})" title="Edit item">✏️</button>
                    <button class="btn-sm" onclick="deleteShoppingItem(${catIndex}, ${itemIndex})" title="Delete item">🗑️</button>
                    <button class="btn-sm" onclick="togglePurchased(${catIndex}, ${itemIndex})" title="Toggle purchased">${item.purchased ? '↩️' : '✓'}</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('');
      
      document.getElementById('shopping-list').innerHTML = shoppingControlsHtml + shoppingHtml;
    }
    
    // Render vendors (from AppData.vendors loaded from vendors.json)
    if (!AppData.vendors || AppData.vendors.length === 0) {
      document.getElementById('vendors').innerHTML = `
        <div class="alert alert-info">
          <strong>No vendors yet!</strong> Use the Admin panel to manage vendors.
        </div>
      `;
    } else {
      const vendorsHtml = AppData.vendors.map(vendor => `
        <div class="card">
          <h3>${vendor.name}</h3>
          <p><strong>Type:</strong> ${vendor.type}</p>
          <p><strong>Contact:</strong> ${vendor.contact}</p>
          <p><strong>Phone:</strong> ${vendor.phone}</p>
          <p>${vendor.notes}</p>
          ${vendor.website ? `<p><a href="${vendor.website}" target="_blank">Visit Website</a></p>` : ''}
        </div>
      `).join('');
      
      document.getElementById('vendors').innerHTML = vendorsHtml;
    }
  },
  
  // Render food page
  food: function() {
    // Check if menu items exist
    if (!AppData.menu.menuItems || AppData.menu.menuItems.length === 0) {
      document.getElementById('menu-items').innerHTML = `
        <div class="alert alert-info">
          <strong>No menu items yet!</strong> Click "Add Menu Item" below to start building your menu.
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <button class="btn" onclick="showAddMenuItemForm()">➕ Add Menu Item</button>
        </div>
      `;
      return;
    }
    
    // Helper function to generate dietary badges
    const generateDietaryBadges = (item) => {
      const badges = [];
      const dietaryOptions = item.dietaryOptions || [];
      const description = (item.description + ' ' + dietaryOptions.join(' ')).toLowerCase();
      
      if (description.includes('vegan')) badges.push('<span class="dietary-badge vegan">🌱 Vegan</span>');
      if (description.includes('vegetarian')) badges.push('<span class="dietary-badge vegetarian">🥗 Vegetarian</span>');
      if (description.includes('gluten-free')) badges.push('<span class="dietary-badge gluten-free">🌾 Gluten-Free</span>');
      if (description.includes('dairy-free')) badges.push('<span class="dietary-badge dairy-free">🥛 Dairy-Free</span>');
      
      return badges.join(' ');
    };
    
    // Dynamically get categories from existing menu items
    const categories = [...new Set(AppData.menu.menuItems.map(item => item.category))].sort();
    
    // Controls at the top
    const controlsHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <button class="btn" onclick="showAddMenuItemForm()">➕ Add Menu Item</button>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="checkbox" id="autosave-toggle-menu" ${AppData.autosaveEnabled ? 'checked' : ''} onchange="handleAutosaveToggle()">
            <span>Autosave ${AppData.autosaveEnabled ? '✓' : ''}</span>
          </label>
          <button class="btn" onclick="handleImportMenu()">📂 Import</button>
          <button class="btn" onclick="exportMenu()">📥 Export</button>
          <button class="btn btn-secondary" onclick="handleResetMenu()">🔄 Reset</button>
        </div>
      </div>
    `;
    
    // Render menu items by category (dynamically determined)
    const menuHtml = categories.map(category => {
      const items = AppData.menu.menuItems.filter(item => item.category === category);
      if (items.length === 0) return '';
      
      return `
        <div class="card">
          <h3>${category}</h3>
          ${items.map(item => `
            <div style="padding: 15px; margin: 10px 0; background: var(--cream); border-radius: 8px; ${AppData.menuFeatured.has(item.id) ? 'border: 3px solid var(--gold);' : ''}">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <h4 style="color: var(--deep-cherry-red); margin: 0;">${item.name}</h4>
                <div>
                  <button class="btn-sm" onclick="editMenuItem('${item.id}')" title="Edit menu item">✏️</button>
                  <button class="btn-sm" onclick="deleteMenuItem('${item.id}')" title="Delete menu item">🗑️</button>
                </div>
              </div>
              <p>${item.description}</p>
              <p><strong>Serves:</strong> ${item.serves} | <strong>Prep Time:</strong> ${item.prepTime}</p>
              ${item.allergens && item.allergens.length > 0 ? `<p><strong>Allergens:</strong> ${item.allergens.join(', ')}</p>` : ''}
              ${item.dietaryOptions && item.dietaryOptions.length > 0 ? `<p><em>${item.dietaryOptions.join(', ')}</em></p>` : ''}
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
    
    document.getElementById('menu-items').innerHTML = controlsHtml + menuHtml;
    
    // Render prep timeline if it exists
    if (AppData.menu.prepTimeline && AppData.menu.prepTimeline.length > 0) {
      const timelineHtml = AppData.menu.prepTimeline.map(phase => `
        <div class="card">
          <h3>${phase.time}</h3>
          <ul class="item-list">
            ${phase.tasks.map(task => `<li>${task}</li>`).join('')}
          </ul>
        </div>
      `).join('');
      
      document.getElementById('prep-timeline').innerHTML = timelineHtml;
    }
  },
  
  // Render mystery page
  mystery: function() {
    // Add data management controls at the top
    const controlsHtml = `
      <div class="card">
        <h3>📦 Mystery Data Management</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
          <button class="btn" onclick="exportStory()">📥 Export Story</button>
          <button class="btn" onclick="handleImportStory()">📂 Import Story</button>
          <button class="btn" onclick="exportClues()">📥 Export Clues</button>
          <button class="btn" onclick="handleImportClues()">📂 Import Clues</button>
          <button class="btn" onclick="exportPackets()">📥 Export Packets</button>
          <button class="btn" onclick="handleImportPackets()">📂 Import Packets</button>
        </div>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">
          <strong>Note:</strong> Full CRUD editors for Story, Clues, and Packets can be accessed via the Admin panel's Global Data Manager.
        </p>
      </div>
    `;
    
    // Render story overview
    const storyHtml = `
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
    
    document.getElementById('story-overview').innerHTML = controlsHtml + storyHtml;
    
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
    
    // Render phase controls
    const phases = [
      { id: 'intro', name: 'Introduction', color: '#0B4F3F' },
      { id: 'mid', name: 'Mid-Investigation', color: '#C79810' },
      { id: 'pre-final', name: 'Pre-Final', color: '#8B0000' },
      { id: 'final', name: 'Final Reveal', color: '#8B0000' }
    ];
    
    const currentPhase = AppData.currentPhase || 'intro';
    const currentIndex = phases.findIndex(p => p.id === currentPhase);
    
    const phaseControlsHtml = `
      <div style="display: flex; gap: 10px; margin: 20px 0; flex-wrap: wrap;">
        ${phases.map((phase, index) => {
          const isActive = phase.id === currentPhase;
          const isCompleted = index < currentIndex;
          const backgroundColor = isActive ? phase.color : (isCompleted ? '#999' : '#f0f0f0');
          const textColor = isActive || isCompleted ? 'white' : '#333';
          return `
            <div style="flex: 1; min-width: 150px; padding: 15px; background: ${backgroundColor}; color: ${textColor}; border-radius: 8px; text-align: center;">
              <h4 style="margin: 0 0 5px 0; color: ${textColor};">${phase.name}</h4>
              <p style="margin: 0; font-size: 14px;">${isActive ? '▶️ CURRENT' : isCompleted ? '✅ Complete' : '⏳ Upcoming'}</p>
            </div>
          `;
        }).join('')}
      </div>
      
      <div style="text-align: center; margin: 20px 0;">
        ${currentIndex < phases.length - 1 ? `
          <button class="btn" onclick="handleAdvancePhase()" style="font-size: 16px; padding: 15px 30px;">
            ▶️ Advance to ${phases[currentIndex + 1].name}
          </button>
        ` : `
          <div class="alert alert-success">
            <strong>🎉 Mystery Complete!</strong> All phases have been completed.
          </div>
        `}
      </div>
      
      <div class="card" style="background: #f9f9f9; margin-top: 20px;">
        <h3>Current Phase: ${phases[currentIndex].name}</h3>
        <h4>Active Clues in This Phase:</h4>
        ${renderCluesByPhase(currentPhase)}
        <h4 style="margin-top: 20px;">Director's Notes:</h4>
        ${renderDirectorNotes(currentPhase)}
      </div>
    `;
    
    document.getElementById('phase-controls').innerHTML = phaseControlsHtml;
    
    // Render envelope list
    const envelopeListHtml = AppData.characters.map(char => {
      const packet = AppData.packets.find(p => p.character_id === char.id);
      if (!packet || !packet.envelopes) return '';
      
      return `
        <div class="card" style="margin: 15px 0; border-left: 4px solid var(--deep-cherry-red);">
          <h3>${char.name} (${char.role})</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
            ${packet.envelopes.map((env, index) => {
              const phaseColors = {
                'intro': '#0B4F3F',
                'mid': '#C79810',
                'pre-final': '#8B0000',
                'final': '#8B0000'
              };
              return `
                <div style="border: 2px solid ${phaseColors[env.phase]}; border-radius: 8px; padding: 15px; background: white;">
                  <div style="background: ${phaseColors[env.phase]}; color: white; padding: 5px 10px; border-radius: 4px; margin: -15px -15px 10px -15px; font-weight: bold; text-align: center;">
                    ${env.phase.toUpperCase()}
                  </div>
                  <h4 style="margin: 10px 0 5px 0; font-size: 14px;">${env.title}</h4>
                  <p style="font-size: 12px; color: #666; margin: 5px 0;">Envelope ${index + 1} of 4</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    document.getElementById('envelope-list').innerHTML = envelopeListHtml || '<p style="color: #999;">No envelope packets configured.</p>';
  },
  
  // Render schedule page
  schedule: function() {
    if (!AppData.schedule.timeline || AppData.schedule.timeline.length === 0) {
      document.getElementById('schedule-timeline').innerHTML = `
        <div class="alert alert-info">
          <strong>No timeline items yet!</strong> Click "Add Timeline Item" below to start building your schedule.
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <button class="btn" onclick="showAddTimelineForm()">➕ Add Timeline Item</button>
        </div>
      `;
      return;
    }
    
    // Controls at the top
    const controlsHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <button class="btn" onclick="showAddTimelineForm()">➕ Add Timeline Item</button>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="checkbox" id="autosave-toggle-schedule" ${AppData.autosaveEnabled ? 'checked' : ''} onchange="handleAutosaveToggle()">
            <span>Autosave ${AppData.autosaveEnabled ? '✓' : ''}</span>
          </label>
          <button class="btn" onclick="handleImportSchedule()">📂 Import</button>
          <button class="btn" onclick="exportSchedule()">📥 Export</button>
          <button class="btn btn-secondary" onclick="handleResetSchedule()">🔄 Reset</button>
        </div>
      </div>
    `;
    
    const scheduleHtml = AppData.schedule.timeline.map((block, index) => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0;">${block.time} - ${block.title}</h3>
          </div>
          <div>
            <button class="btn-sm" onclick="editTimelineItem(${index})" title="Edit timeline item">✏️</button>
            <button class="btn-sm" onclick="deleteTimelineItem(${index})" title="Delete timeline item">🗑️</button>
          </div>
        </div>
        <p><strong>Duration:</strong> ${block.duration}</p>
        <p>${block.description}</p>
        ${block.phase ? `<p><strong>Phase:</strong> <span class="badge badge-info">${block.phase}</span></p>` : ''}
        ${block.envelope_instruction ? `<p><strong>Envelope:</strong> <em>${block.envelope_instruction}</em></p>` : ''}
        <h4>Activities:</h4>
        <ul>
          ${block.activities.map(activity => `<li>${activity}</li>`).join('')}
        </ul>
        <p><strong>Music:</strong> ${block.music}</p>
        <p><em>${block.notes}</em></p>
      </div>
    `).join('');
    
    document.getElementById('schedule-timeline').innerHTML = controlsHtml + scheduleHtml;
  },
  
  // Render guests page
  guests: function() {
    // Check if guests list is empty
    if (!AppData.guests || AppData.guests.length === 0) {
      document.getElementById('guest-table').innerHTML = `
        <div class="alert alert-info">
          <strong>No guests yet!</strong> Click "Add Guest" below to start building your guest list.
        </div>
        <div style="text-align: center; margin: 20px 0;">
          <button class="btn" onclick="showAddGuestForm()">➕ Add Guest</button>
        </div>
      `;
      return;
    }
    
    // Helper function to generate RSVP badge
    const getRsvpBadge = (rsvp) => {
      const rsvpLower = (rsvp || 'pending').toLowerCase();
      const badges = {
        'confirmed': '<span class="badge badge-success">✓ Confirmed</span>',
        'invited': '<span class="badge badge-info">✉️ Invited</span>',
        'tentative': '<span class="badge badge-warning">? Tentative</span>',
        'not attending': '<span class="badge badge-danger">✗ Not Attending</span>',
        'pending': '<span class="badge badge-secondary">⏳ Pending</span>'
      };
      return badges[rsvpLower] || badges['pending'];
    };
    
    // Helper function to check if address is on file
    const hasAddress = (guest) => {
      return guest.address && 
             guest.address.street && 
             guest.address.street !== 'TBD' &&
             guest.address.city &&
             guest.address.state;
    };
    
    // Controls at the top
    const controlsHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <button class="btn" onclick="showAddGuestForm()">➕ Add Guest</button>
          <button class="btn btn-secondary" onclick="autoAssignAll()">🎭 Auto-Assign Characters</button>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
            <input type="checkbox" id="autosave-toggle-guests" ${AppData.autosaveEnabled ? 'checked' : ''} onchange="handleAutosaveToggle()">
            <span>Autosave ${AppData.autosaveEnabled ? '✓' : ''}</span>
          </label>
          <button class="btn" onclick="handleImportGuests()">📂 Import</button>
          <button class="btn" onclick="exportGuests()">📥 Export</button>
          <button class="btn btn-secondary" onclick="handleResetGuests()">🔄 Reset</button>
        </div>
      </div>
    `;
    
    const tableHtml = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>RSVP</th>
            <th>Dietary</th>
            <th>Character</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${AppData.guests.map(guest => {
            const character = guest.assignedCharacter ? 
              AppData.characters.find(c => c.id === guest.assignedCharacter) : null;
            
            const addressIndicator = hasAddress(guest) ? 
              '<span class="badge badge-success" style="font-size: 11px; margin-left: 5px;">📬 Address</span>' : 
              '<span class="badge badge-warning" style="font-size: 11px; margin-left: 5px;">📭 No address</span>';
            
            const phoneDisplay = guest.phone ? `<br><small>📞 ${guest.phone}</small>` : '';
            
            const accessibilityDisplay = guest.accessibility && guest.accessibility !== 'None' ?
              `<br><small style="color: var(--deep-cherry-red);">♿ ${guest.accessibility}</small>` :
              '';
            
            const dietaryInfo = guest.dietary && guest.dietary !== 'None' ?
              `${guest.dietary}${guest.dietarySeverity ? ` <em>(${guest.dietarySeverity})</em>` : ''}` :
              'None';
            
            const roleVibeDisplay = guest.roleVibe ? 
              `<br><small style="color: #666;">🎭 ${guest.roleVibe}</small>` : '';
            
            return `
              <tr>
                <td>
                  <strong>${guest.name}</strong>
                  ${addressIndicator}
                  ${roleVibeDisplay}
                </td>
                <td>
                  ${guest.email || '<em style="color: #999;">No email</em>'}${phoneDisplay}
                  ${accessibilityDisplay}
                </td>
                <td>${getRsvpBadge(guest.rsvp)}</td>
                <td><small>${dietaryInfo}</small></td>
                <td>
                  ${character ? `<span style="color: var(--forest-emerald);">${character.name}</span>` : '<span style="color: #999;">Unassigned</span>'}
                </td>
                <td>
                  <button class="btn-sm" onclick="editGuest(${guest.id})" title="Edit guest details">✏️ Edit</button>
                  <button class="btn-sm" onclick="deleteGuest(${guest.id})" title="Delete guest">🗑️</button>
                  <button class="btn-sm" onclick="copyInvite(${guest.id})" title="Copy invitation text">✉️</button>
                  ${character ? `<button class="btn-sm" onclick="printCharacterPacket('${character.id}')" title="Print character packet">🖨️</button>` : ''}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    
    document.getElementById('guest-table').innerHTML = controlsHtml + tableHtml;
    
    // Populate character guide dynamically if element exists
    const characterGuideElement = document.getElementById('character-list-guide');
    if (characterGuideElement) {
      const characterGuideHtml = AppData.characters && AppData.characters.length > 0 ?
        `<ul class="item-list">
          ${(() => {
            // Create assignment map for O(1) lookups
            const assignmentMap = new Map(
              (AppData.guests || []).map(g => [g.assignedCharacter, g])
            );
            return AppData.characters.map(char => {
              const assignedGuest = assignmentMap.get(char.id);
              return `
                <li>
                  <strong>${char.name || 'Unknown'} (${char.role || 'Unknown Role'}):</strong> ${char.personality || 'No description'}
                  ${assignedGuest ? `<span style="color: var(--forest-emerald); margin-left: 10px;">✓ Assigned to ${assignedGuest.name}</span>` : ''}
                </li>
              `;
            }).join('');
          })()}
        </ul>` :
        '<div class="alert alert-info">No characters available. Please add characters via <strong>Admin → Data Manager</strong>.</div>';
      
      characterGuideElement.innerHTML = characterGuideHtml;
    }
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
    const stats = calculateStats();
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
        
        <div class="decision-step ${stats.percentWithRsvp >= 80 ? 'completed' : ''}">
          <h3>Step 4: Guest RSVP Tracking</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.percentWithRsvp}%;">
              ${stats.percentWithRsvp}% with RSVP
            </div>
          </div>
          <p><strong>Status:</strong> ${stats.percentWithRsvp >= 80 ? '✓ Complete' : `${stats.guestsWithRsvp} of ${stats.totalGuests} guests have responded`}</p>
          <p>Track guest responses and confirm attendance.</p>
          <a href="guests.html" class="btn">Manage Guest List</a>
        </div>
        
        <div class="decision-step ${stats.percentWithAddress >= 80 ? 'completed' : ''}">
          <h3>Step 5: Guest Address Collection</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${stats.percentWithAddress}%;">
              ${stats.percentWithAddress}% with Address
            </div>
          </div>
          <p><strong>Status:</strong> ${stats.percentWithAddress >= 80 ? '✓ Complete' : `${stats.guestsWithAddress} of ${stats.totalGuests} guests have address on file`}</p>
          <p>Collect mailing addresses for invitations and thank you cards.</p>
          <a href="guests.html" class="btn">Update Guest Info</a>
        </div>
        
        <div class="decision-step ${progress.envelopeReadiness >= 100 ? 'completed' : ''}">
          <h3>Step 6: Mystery Envelope Preparation</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress.envelopeReadiness}%;">
              ${progress.envelopeReadiness}% Ready
            </div>
          </div>
          <p><strong>Status:</strong> ${progress.envelopeReadiness >= 100 ? '✓ Complete' : `${progress.guestsWithPackets} of ${progress.totalAssigned} assigned guests have complete envelope packets`}</p>
          <p>Ensure all guests with assigned roles have 4-envelope packets prepared.</p>
          <a href="mystery.html" class="btn">View Mystery Phase System</a>
          <button class="btn btn-secondary" onclick="downloadClueKitZip()">Download Clue Kit</button>
        </div>
        
        <div class="decision-step">
          <h3>Step 7: Review Schedule</h3>
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
      
      <div class="card">
        <h2>🎬 Director's Notes - Mystery Phase Timeline</h2>
        <p>Quick reference guide for managing the mystery phases during the party:</p>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 15px 0;">
          <h3 style="color: var(--deep-cherry-red);">Phase Timeline:</h3>
          <div style="display: grid; gap: 15px; margin-top: 15px;">
            ${['intro', 'mid', 'pre-final', 'final'].map((phase, index) => {
              const phaseNames = ['Introduction', 'Mid-Investigation', 'Pre-Final', 'Final Reveal'];
              const phaseTimes = ['0:50-1:10', '1:10-1:25', '1:25-1:35', '1:35-1:45'];
              const envelopeNums = [1, 2, 3, 4];
              const clueCount = AppData.clues.filter(c => c.reveal_phase === phase).length;
              return `
                <div style="border-left: 4px solid var(--deep-cherry-red); padding: 15px; background: white; border-radius: 4px;">
                  <h4 style="margin: 0 0 5px 0; color: var(--deep-cherry-red);">${phaseNames[index]}</h4>
                  <p style="margin: 5px 0; font-size: 14px;"><strong>⏰ Time:</strong> ${phaseTimes[index]}</p>
                  <p style="margin: 5px 0; font-size: 14px;"><strong>✉️ Envelope:</strong> #${envelopeNums[index]} - Open at start of phase</p>
                  <p style="margin: 5px 0; font-size: 14px;"><strong>🔍 Active Clues:</strong> ${clueCount} clues in circulation</p>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div class="alert alert-info" style="margin-top: 20px;">
          <strong>💡 Pro Tips:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Print all envelopes before the party and label them clearly</li>
            <li>Announce envelope openings loudly so all guests hear</li>
            <li>Give guests 2-3 minutes to read each new envelope</li>
            <li>Watch for stuck guests and provide gentle hints from unused clues</li>
            <li>The murderer (Josie/owner) should be engaged but not obvious</li>
            <li>Keep the energy high and the atmosphere mysterious!</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <a href="mystery.html" class="btn">View Full Mystery System</a>
          <button class="btn btn-secondary" onclick="downloadClueKitZip()">Download Director's Guide</button>
        </div>
      </div>
    `;
    
    // Insert decision mode before validation results
    const container = document.getElementById('validation-results').parentElement;
    const decisionDiv = document.createElement('div');
    decisionDiv.innerHTML = decisionModeHtml;
    // Insert all children (both Decision Mode and Director's Notes cards)
    while (decisionDiv.firstChild) {
      container.insertBefore(decisionDiv.firstChild, container.firstElementChild);
    }
    
    // Global Data Manager
    const dataManager = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
        ${[
          { name: 'Guests', dataset: 'guests', icon: '👥', count: AppData.guests.length, file: 'guests.json' },
          { name: 'Characters', dataset: 'characters', icon: '🎭', count: AppData.characters.length, file: 'characters.json' },
          { name: 'Decor', dataset: 'decor', icon: '🎨', count: AppData.decor.moodBoard ? AppData.decor.moodBoard.length : 0, file: 'decor.json' },
          { name: 'Vendors', dataset: 'vendors', icon: '🏪', count: AppData.vendors.length, file: 'vendors.json' },
          { name: 'Menu', dataset: 'menu', icon: '🍽️', count: AppData.menu.menuItems ? AppData.menu.menuItems.length : 0, file: 'menu.json' },
          { name: 'Schedule', dataset: 'schedule', icon: '📅', count: AppData.schedule.timeline ? AppData.schedule.timeline.length : 0, file: 'schedule.json' },
          { name: 'Story', dataset: 'story', icon: '📖', count: 1, file: 'story.json' },
          { name: 'Clues', dataset: 'clues', icon: '🔍', count: AppData.clues.length, file: 'clues.json' },
          { name: 'Packets', dataset: 'packets', icon: '📦', count: AppData.packets.length, file: 'packets.json' }
        ].map(ds => `
          <div style="background: var(--cream); padding: 20px; border-radius: 10px; border-left: 4px solid var(--deep-cherry-red);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="margin: 0; color: var(--deep-cherry-red);">${ds.icon} ${ds.name}</h3>
              <span style="background: var(--forest-emerald); color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">${ds.count} items</span>
            </div>
            <p style="font-size: 14px; color: #666; margin: 10px 0;"><code>${ds.file}</code></p>
            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 15px;">
              <button class="btn-sm" onclick="handleExportDataset('${ds.dataset}')" title="Export to JSON">📥 Export</button>
              <button class="btn-sm" onclick="handleImportDataset('${ds.dataset}')" title="Import from JSON">📂 Import</button>
              <button class="btn-sm" onclick="handleResetDataset('${ds.dataset}')" title="Reset to defaults">🔄 Reset</button>
              <a href="./data/${ds.file}" target="_blank" class="btn-sm" style="text-decoration: none; line-height: 1.5;">📄 View</a>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 30px; text-align: center;">
        <label style="display: inline-flex; align-items: center; gap: 10px; padding: 15px 25px; background: var(--cream); border-radius: 10px; cursor: pointer; font-size: 16px;">
          <input type="checkbox" id="autosave-toggle-admin" ${AppData.autosaveEnabled ? 'checked' : ''} onchange="handleAutosaveToggle()" style="width: 20px; height: 20px; cursor: pointer;">
          <span><strong>Autosave to Browser Storage</strong> ${AppData.autosaveEnabled ? '✓ Enabled' : '✗ Disabled'}</span>
        </label>
        <p style="margin-top: 10px; font-size: 14px; color: #666;">
          ${AppData.autosaveEnabled ? 
            '✓ All changes are automatically saved to your browser. Use Export to back up to files.' : 
            '⚠️ Changes are temporary. Use Export buttons to save your data to files.'}
        </p>
      </div>
    `;
    
    document.getElementById('data-links').innerHTML = dataManager;
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

// Phase advancement handler
window.handleAdvancePhase = function() {
  const phases = ['intro', 'mid', 'pre-final', 'final'];
  const currentIndex = phases.indexOf(AppData.currentPhase);
  if (currentIndex < phases.length - 1) {
    AppData.currentPhase = phases[currentIndex + 1];
    alert(`Advanced to phase: ${phases[currentIndex + 1].toUpperCase()}`);
    window.renderPage('mystery');
  } else {
    alert('Already at the final phase!');
  }
};
