// A Damn Fine Bridal Party - Rendering Module

// HTML escape function to prevent XSS
function escapeHtml(unsafe) {
  if (typeof unsafe !== 'string') return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;");
}

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
  
  // Render Decor Wizard page
  'decor-wizard': function() {
    if (!AppData.decor.sections || AppData.decor.sections.length === 0) {
      // Initialize sections if they don't exist
      AppData.decor.sections = Object.keys(DECOR_CURATED_OPTIONS).map(id => ({
        id,
        name: DECOR_CURATED_OPTIONS[id].label,
        selectedOptions: [],
        customIdea: "",
        notes: "",
        status: "draft"
      }));
    }
    
    // Render all sections
    const sectionsHtml = AppData.decor.sections.map(section => {
      const options = DECOR_CURATED_OPTIONS[section.id];
      if (!options) return '';
      
      const isMulti = options.multi;
      const statusBadge = section.status === 'final' 
        ? '<span style="background: #0B4F3F; color: white; padding: 3px 10px; border-radius: 3px; font-size: 12px;">FINAL ✓</span>'
        : '<span style="background: #999; color: white; padding: 3px 10px; border-radius: 3px; font-size: 12px;">DRAFT</span>';
      
      const optionsHtml = options.options.map(opt => {
        const isSelected = section.selectedOptions && section.selectedOptions.includes(opt);
        const inputType = isMulti ? 'checkbox' : 'radio';
        const inputName = `section-${section.id}`;
        
        return `
          <label style="display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid ${isSelected ? '#8B0000' : '#ddd'}; border-radius: 4px; background: ${isSelected ? '#fff5f5' : 'white'}; cursor: pointer; margin-bottom: 8px;">
            <input type="${inputType}" 
                   name="${inputName}" 
                   value="${escapeHtml(opt)}" 
                   ${isSelected ? 'checked' : ''}
                   onchange="handleDecorOptionChange('${escapeHtml(section.id)}', '${escapeHtml(opt)}', this.checked, ${isMulti})">
            <span>${escapeHtml(opt)}</span>
          </label>
        `;
      }).join('');
      
      return `
        <div class="card" style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3>${section.name}</h3>
            ${statusBadge}
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>Curated Options:</strong> <span style="color: #666; font-size: 14px;">${isMulti ? '(Select multiple)' : '(Select one)'}</span>
            <div style="margin-top: 10px;">
              ${optionsHtml}
            </div>
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;"><strong>Custom Idea:</strong></label>
            <input type="text" 
                   placeholder="Enter your own idea..." 
                   value="${escapeHtml(section.customIdea || '')}"
                   onchange="handleDecorCustomIdea('${escapeHtml(section.id)}', this.value)"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;"><strong>Notes:</strong></label>
            <textarea placeholder="Additional notes for this section..." 
                      onchange="handleDecorNotes('${escapeHtml(section.id)}', this.value)"
                      style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 60px;">${escapeHtml(section.notes || '')}</textarea>
          </div>
          
          <div>
            <button class="btn ${section.status === 'final' ? 'btn-secondary' : ''}" 
                    onclick="handleDecorToggleStatus('${escapeHtml(section.id)}')">
              ${section.status === 'final' ? '⬅️ Mark as Draft' : '✓ Mark as Final'}
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    document.getElementById('decor-wizard-sections').innerHTML = sectionsHtml;
    
    // Render shopping list
    renderDecorShoppingList();
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
    
    // Render dynamic Allergy Map from guest data
    const guestsWithDietary = AppData.guests.filter(g => g.dietary && g.dietary.toLowerCase() !== 'none');
    
    if (guestsWithDietary.length === 0) {
      document.getElementById('allergy-map').innerHTML = `
        <div class="alert alert-success">
          <strong>No dietary restrictions reported!</strong> All guests can enjoy the full menu.
        </div>
      `;
    } else {
      // Group guests by their dietary needs
      const dietaryMap = {};
      guestsWithDietary.forEach(guest => {
        const needs = guest.dietary.split(',').map(s => s.trim());
        needs.forEach(need => {
          if (!dietaryMap[need]) dietaryMap[need] = [];
          dietaryMap[need].push(guest.name);
        });
      });
      
      const mapHtml = `
        <div class="alert alert-warning">
          <strong>Current Dietary Needs:</strong>
          <ul>
            ${Object.keys(dietaryMap).map(need => `
              <li><strong>${escapeHtml(need)}:</strong> ${dietaryMap[need].map(name => escapeHtml(name)).join(', ')}</li>
            `).join('')}
          </ul>
          <p><em>This list is automatically updated from your Guest List. All menu items indicate allergens and dietary options.</em></p>
        </div>
      `;
      document.getElementById('allergy-map').innerHTML = mapHtml;
    }
    
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
  
  // Render Menu Planner page
  'menu-planner': function() {
    if (!AppData.menu.menuItems || AppData.menu.menuItems.length === 0) {
      document.getElementById('menu-planner-items').innerHTML = `
        <div class="alert alert-info">
          <strong>No menu items yet!</strong> Click "Add Menu Item" above to start.
        </div>
      `;
      document.getElementById('dietary-summary').innerHTML = '<p>No items to analyze.</p>';
      document.getElementById('category-totals').innerHTML = '<p>No items to categorize.</p>';
      return;
    }
    
    // Group by category
    const categories = {};
    AppData.menu.menuItems.forEach(item => {
      const cat = item.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    });
    
    // Render items by category
    let html = '';
    ['Appetizer', 'Main', 'Side', 'Dessert', 'Beverage', 'Other'].forEach(catName => {
      if (!categories[catName] || categories[catName].length === 0) return;
      
      html += `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #8B0000; border-bottom: 2px solid #8B0000; padding-bottom: 5px;">${catName}s</h3>
          <div style="display: grid; gap: 15px; margin-top: 15px;">
      `;
      
      categories[catName].forEach(item => {
        const tagBadges = (item.tags || []).map(tag => {
          const colors = { V: '#0B4F3F', VG: '#228B22', GF: '#DAA520', DF: '#4682B4' };
          return `<span style="background: ${colors[tag] || '#999'}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${tag}</span>`;
        }).join(' ');
        
        const allergenList = (item.allergens || []).length > 0 
          ? `<p style="color: #8B0000; font-size: 13px; margin: 5px 0;"><strong>⚠️ Allergens:</strong> ${item.allergens.join(', ')}</p>`
          : '';
        
        const shortlistBadge = item.shortlist 
          ? '<span style="background: #FFD700; color: #000; padding: 3px 10px; border-radius: 3px; font-size: 12px;">SHORTLIST ⭐</span>'
          : '';
        
        const finalBadge = item.final 
          ? '<span style="background: #0B4F3F; color: white; padding: 3px 10px; border-radius: 3px; font-size: 12px;">FINAL ✓</span>'
          : '';
        
        html += `
          <div style="border: 1px solid ${item.final ? '#0B4F3F' : '#ddd'}; border-radius: 4px; padding: 15px; background: white;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
              <div>
                <strong style="font-size: 16px;">${item.name}</strong>
                <div style="margin-top: 5px;">${tagBadges}</div>
              </div>
              <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                ${shortlistBadge}
                ${finalBadge}
              </div>
            </div>
            <p style="margin: 8px 0; color: #666;">${item.description || ''}</p>
            ${allergenList}
            <div style="display: flex; gap: 15px; margin: 8px 0; font-size: 13px; color: #666;">
              <span><strong>Serves:</strong> ${item.serves || 'N/A'}</span>
              <span><strong>Prep:</strong> ${item.prep || 'N/A'}</span>
              <span><strong>Source:</strong> ${item.source || 'N/A'}</span>
            </div>
            ${item.notes ? `<p style="font-size: 13px; color: #666; font-style: italic; margin: 8px 0;">Note: ${item.notes}</p>` : ''}
            <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
              <button class="btn btn-secondary" onclick="handleMenuToggleShortlist('${item.id}')" style="font-size: 13px; padding: 5px 12px;">
                ${item.shortlist ? '⭐ Remove from Shortlist' : '⭐ Add to Shortlist'}
              </button>
              <button class="btn ${item.final ? 'btn-secondary' : ''}" onclick="handleMenuToggleFinal('${item.id}')" style="font-size: 13px; padding: 5px 12px;">
                ${item.final ? '✓ Unmark Final' : '✓ Mark as Final'}
              </button>
              <button class="btn btn-secondary" onclick="deleteMenuItem('${item.id}')" style="font-size: 13px; padding: 5px 12px; color: #8B0000;">🗑️ Delete</button>
            </div>
          </div>
        `;
      });
      
      html += '</div></div>';
    });
    
    document.getElementById('menu-planner-items').innerHTML = html;
    
    // Render dietary summary
    const coverage = calculateDietaryCoverage();
    const coverageHtml = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>${coverage.totalFinal}</h3>
          <p>Final Items</p>
        </div>
        <div class="stat-card">
          <h3>${coverage.V}</h3>
          <p>Vegetarian 🌱</p>
        </div>
        <div class="stat-card">
          <h3>${coverage.VG}</h3>
          <p>Vegan 🥗</p>
        </div>
        <div class="stat-card">
          <h3>${coverage.GF}</h3>
          <p>Gluten-Free 🌾</p>
        </div>
        <div class="stat-card">
          <h3>${coverage.DF}</h3>
          <p>Dairy-Free 🥛</p>
        </div>
      </div>
    `;
    document.getElementById('dietary-summary').innerHTML = coverageHtml;
    
    // Render category totals
    const catTotals = calculateCategoryTotals();
    const totalsHtml = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5; border-bottom: 2px solid #8B0000;">
            <th style="padding: 10px; text-align: left;">Category</th>
            <th style="padding: 10px; text-align: center;">Total</th>
            <th style="padding: 10px; text-align: center;">Shortlist</th>
            <th style="padding: 10px; text-align: center;">Final</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(catTotals).map(cat => `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 10px;"><strong>${cat}</strong></td>
              <td style="padding: 10px; text-align: center;">${catTotals[cat].total}</td>
              <td style="padding: 10px; text-align: center;">${catTotals[cat].shortlist}</td>
              <td style="padding: 10px; text-align: center;">${catTotals[cat].final}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    document.getElementById('category-totals').innerHTML = totalsHtml;
  },
  
  // Render Role Assignment page
  'role-assignment': function() {
    const assignedGuests = AppData.guests.filter(g => g.assignedCharacter);
    const unassignedGuests = AppData.guests.filter(g => !g.assignedCharacter);
    
    let html = `
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5; border-bottom: 2px solid #8B0000;">
            <th style="padding: 10px; text-align: left;">Guest</th>
            <th style="padding: 10px; text-align: left;">Assigned Role</th>
            <th style="padding: 10px; text-align: center;">Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    AppData.guests.forEach(guest => {
      const character = guest.assignedCharacter 
        ? AppData.characters.find(c => c.id === guest.assignedCharacter)
        : null;
      
      html += `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 10px;"><strong>${guest.name}</strong></td>
          <td style="padding: 10px;">
            <select onchange="handleRoleAssign(${guest.id}, this.value)" style="width: 100%; padding: 5px;">
              <option value="">-- No Role --</option>
              ${AppData.characters.map(c => `
                <option value="${c.id}" ${guest.assignedCharacter === c.id ? 'selected' : ''}>
                  ${c.name} (${c.role})
                </option>
              `).join('')}
            </select>
          </td>
          <td style="padding: 10px; text-align: center;">
            ${character ? `<button class="btn btn-secondary" onclick="printGuestPacket(${guest.id})" style="font-size: 13px;">📦 Print Packet</button>` : ''}
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    document.getElementById('role-assignment-matrix').innerHTML = html;
    
    // Packet print list
    const packetListHtml = assignedGuests.map(guest => {
      const character = AppData.characters.find(c => c.id === guest.assignedCharacter);
      return `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
          <strong>${guest.name}</strong> → ${character?.name || 'Unknown'} (${character?.role || ''})
          <button class="btn" onclick="printGuestPacket(${guest.id})" style="margin-left: 15px;">📦 Print Packet</button>
        </div>
      `;
    }).join('');
    
    document.getElementById('packet-print-list').innerHTML = packetListHtml || '<p>No guests with assigned roles yet.</p>';
  },
  
  // Render Host Controls page
  'host-controls': function() {
    // Show rehearsal mode indicator if active
    if (AppData.settings.rehearsalMode) {
      document.getElementById('rehearsal-mode-indicator').style.display = 'block';
    }
    
    // Phase Timer
    const phaseDurations = AppData.settings.phaseDurations || { intro: 20, mid: 20, preFinal: 15, final: 15 };
    const currentPhase = AppData.currentPhase || 'intro';
    
    const timerHtml = `
      <div style="text-align: center; padding: 30px; background: #f5f5f5; border-radius: 8px;">
        <h3 style="color: #8B0000;">Current Phase: ${currentPhase.toUpperCase()}</h3>
        <p style="font-size: 18px; margin: 15px 0;">Duration: ${phaseDurations[currentPhase]} minutes</p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button class="btn" onclick="handlePhaseStart()">▶️ Start Timer</button>
          <button class="btn btn-secondary" onclick="handlePhaseNext()">⏭️ Next Phase</button>
          <button class="btn btn-secondary" onclick="handlePhaseReset()">🔄 Reset</button>
        </div>
      </div>
    `;
    document.getElementById('phase-timer-controls').innerHTML = timerHtml;
    
    // Hint Controls
    const hintBoostEnabled = AppData.settings.hintBoost !== false;
    const hintsHtml = `
      <div style="padding: 20px; background: #fff9e6; border: 2px solid #C79810; border-radius: 8px;">
        <p>Extra Log Lady prophecies to help stuck guests:</p>
        <div style="margin: 15px 0;">
          <label style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" ${hintBoostEnabled ? 'checked' : ''} onchange="handleHintBoostToggle(this.checked)">
            <span>Enable Hint Boost</span>
          </label>
        </div>
        <button class="btn" onclick="handleBroadcastHint()" ${!hintBoostEnabled ? 'disabled' : ''}>
          📢 Broadcast Log Lady Hint
        </button>
        <div id="hint-display" style="margin-top: 15px; padding: 15px; background: white; border-radius: 4px; font-style: italic; display: none;"></div>
      </div>
    `;
    document.getElementById('hint-controls').innerHTML = hintsHtml;
    
    // Cupcake Controller
    const cupcakeOrder = AppData.settings.cupcakeOrder || AppData.story.cupcakeReveal || [];
    const currentIndex = AppData.cupcakeRevealIndex || 0;
    
    const cupcakeHtml = `
      <div style="padding: 20px;">
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
          <h3>Current Position: ${currentIndex} / ${cupcakeOrder.length}</h3>
          <div style="font-size: 24px; font-weight: bold; color: #8B0000; margin: 15px 0;">
            ${currentIndex > 0 ? cupcakeOrder[currentIndex - 1] : 'Ready to start...'}
          </div>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn" onclick="handleCupcakeNext()" ${currentIndex >= cupcakeOrder.length ? 'disabled' : ''}>
            ➡️ Reveal Next (${currentIndex + 1}/${cupcakeOrder.length})
          </button>
          <button class="btn btn-secondary" onclick="handleCupcakeReset()">🔄 Reset Order</button>
          <button class="btn btn-secondary" onclick="printCupcakeTags()">🖨️ Print Tags</button>
        </div>
        <div style="margin-top: 20px;">
          <details>
            <summary style="cursor: pointer; padding: 10px; background: #f5f5f5; border-radius: 4px;">
              View All Cupcake Lines (${cupcakeOrder.length})
            </summary>
            <ol style="margin: 10px 0; padding-left: 20px;">
              ${cupcakeOrder.map((line, i) => `
                <li style="padding: 5px; ${i < currentIndex ? 'color: #999; text-decoration: line-through;' : ''}">${line}</li>
              `).join('')}
            </ol>
          </details>
        </div>
      </div>
    `;
    document.getElementById('cupcake-controller').innerHTML = cupcakeHtml;
    
    // Twin Peaks Flavor
    const currentFlavor = AppData.settings.twinPeaksFlavor || 'standard';
    const flavorHtml = `
      <div style="padding: 20px; text-align: center;">
        <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
          ${['light', 'standard', 'extra'].map(flavor => `
            <button class="btn ${currentFlavor === flavor ? '' : 'btn-secondary'}" 
                    onclick="handleFlavorChange('${flavor}')"
                    style="min-width: 120px;">
              ${flavor.charAt(0).toUpperCase() + flavor.slice(1)}
            </button>
          `).join('')}
        </div>
        <p style="color: #666; font-size: 14px;">
          ${currentFlavor === 'light' ? 'Light: Toned-down mysterious language' : 
            currentFlavor === 'extra' ? 'Extra: Full Twin Peaks mysticism' :
            'Standard: Balanced Twin Peaks atmosphere'}
        </p>
      </div>
    `;
    document.getElementById('flavor-controls').innerHTML = flavorHtml;
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
      const characterGuideHtml = AppData.characters?.length > 0 ?
        `<ul class="item-list">
          ${AppData.characters.map(char => {
            // Find all guests assigned to this character
            const assignedGuests = (AppData.guests?.filter(g => g.assignedCharacter === char.id)) || [];
            const assignmentStatus = assignedGuests.length > 0 ?
              `<span style="color: var(--forest-emerald); margin-left: 10px;">✓ Assigned to ${assignedGuests.map(g => g.name).join(', ')}</span>` :
              '';
            return `
              <li>
                <strong>${char.name || 'Unknown'} (${char.role || 'Unknown Role'}):</strong> ${char.personality || 'No description'}
                ${assignmentStatus}
              </li>
            `;
          }).join('')}
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
    
    // Render settings panel
    renderSettingsPanel();
  }
};

// Helper function to render settings panel
function renderSettingsPanel() {
  const settings = AppData.settings || {};
  const phaseDurations = settings.phaseDurations || { intro: 20, mid: 20, preFinal: 15, final: 15 };
  
  const settingsHtml = `
    <div style="display: grid; gap: 20px;">
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 4px; background: white;">
        <h3>🌲 Twin Peaks Flavor</h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Adjust the Twin Peaks mysticism level in Log Lady prophecies and flavor text.</p>
        <div style="display: flex; gap: 10px;">
          ${['light', 'standard', 'extra'].map(flavor => `
            <button class="btn ${(settings.twinPeaksFlavor || 'standard') === flavor ? '' : 'btn-secondary'}" 
                    onclick="handleAdminSettingChange('twinPeaksFlavor', '${flavor}')">
              ${flavor.charAt(0).toUpperCase() + flavor.slice(1)}
            </button>
          `).join('')}
        </div>
      </div>
      
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 4px; background: white;">
        <h3>⏱️ Phase Durations (minutes)</h3>
        <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
          <div>
            <label style="display: block; margin-bottom: 5px;"><strong>Intro Phase:</strong></label>
            <input type="number" value="${phaseDurations.intro}" 
                   onchange="handleAdminPhaseDurationChange('intro', this.value)"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px;"><strong>Mid Phase:</strong></label>
            <input type="number" value="${phaseDurations.mid}" 
                   onchange="handleAdminPhaseDurationChange('mid', this.value)"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px;"><strong>Pre-Final Phase:</strong></label>
            <input type="number" value="${phaseDurations.preFinal}" 
                   onchange="handleAdminPhaseDurationChange('preFinal', this.value)"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px;"><strong>Final Phase:</strong></label>
            <input type="number" value="${phaseDurations.final}" 
                   onchange="handleAdminPhaseDurationChange('final', this.value)"
                   style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
        </div>
      </div>
      
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 4px; background: white;">
        <h3>🎭 Rehearsal Mode</h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Simulate the event without saving changes to Firestore.</p>
        <label style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" ${settings.rehearsalMode ? 'checked' : ''} 
                 onchange="handleAdminSettingChange('rehearsalMode', this.checked)">
          <span>Enable Rehearsal Mode</span>
        </label>
        ${settings.rehearsalMode ? '<p style="color: #8B0000; margin-top: 10px;"><strong>⚠️ Changes will NOT be saved!</strong></p>' : ''}
      </div>
      
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 4px; background: white;">
        <h3>💡 Hint Boost</h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Enable extra Log Lady prophecies for guests who get stuck.</p>
        <label style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" ${settings.hintBoost !== false ? 'checked' : ''} 
                 onchange="handleAdminSettingChange('hintBoost', this.checked)">
          <span>Enable Hint Boost</span>
        </label>
      </div>
      
      <div style="border: 1px solid #ddd; padding: 20px; border-radius: 4px; background: white;">
        <h3>🛡️ PG-13 Mode</h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 15px;">Keep all content family-friendly (always enforced).</p>
        <label style="display: flex; align-items: center; gap: 10px;">
          <input type="checkbox" checked disabled>
          <span>PG-13 Mode (Always Active)</span>
        </label>
      </div>
    </div>
  `;
  
  const panel = document.getElementById('settings-panel');
  if (panel) {
    panel.innerHTML = settingsHtml;
  }
}

// Page rendering dispatcher
window.renderPage = function(page) {
  if (Render[page]) {
    Render[page]();
  }
};

// Re-render current page (called by Firestore listeners)
window.renderCurrentPage = function() {
  const page = getPageName();
  if (window.renderPage && typeof window.renderPage === 'function') {
    window.renderPage(page);
  }
};

// Get current page name from URL
function getPageName() {
  const path = window.location.pathname;
  const page = path.split('/').pop().replace('.html', '') || 'index';
  return page;
}

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

// ============================================================================
// Decor Wizard Handlers
// ============================================================================

window.handleDecorOptionChange = async function(sectionId, option, checked, isMulti) {
  const section = getDecorSection(sectionId);
  if (!section) return;
  
  if (isMulti) {
    // Multi-select: add or remove from array
    if (checked) {
      if (!section.selectedOptions.includes(option)) {
        section.selectedOptions.push(option);
      }
    } else {
      section.selectedOptions = section.selectedOptions.filter(o => o !== option);
    }
  } else {
    // Single-select: replace array with single item
    section.selectedOptions = checked ? [option] : [];
  }
  
  await saveDecorSection(sectionId, section);
};

window.handleDecorCustomIdea = async function(sectionId, value) {
  const section = getDecorSection(sectionId);
  if (!section) return;
  
  section.customIdea = value;
  await saveDecorSection(sectionId, section);
};

window.handleDecorNotes = async function(sectionId, value) {
  const section = getDecorSection(sectionId);
  if (!section) return;
  
  section.notes = value;
  await saveDecorSection(sectionId, section);
};

window.handleDecorToggleStatus = async function(sectionId) {
  await toggleDecorSectionStatus(sectionId);
  // Re-render the page to show updated status
  if (window.renderPage) {
    window.renderPage('decor-wizard');
  }
};

function renderDecorShoppingList() {
  if (!AppData.decor.shoppingList || AppData.decor.shoppingList.length === 0) {
    document.getElementById('decor-shopping-list').innerHTML = `
      <div class="alert alert-info">
        <p>Mark sections as "Final" to generate shopping list items automatically.</p>
      </div>
    `;
    return;
  }
  
  // Group by section
  const grouped = {};
  AppData.decor.shoppingList.forEach(item => {
    if (!grouped[item.section]) {
      grouped[item.section] = [];
    }
    grouped[item.section].push(item);
  });
  
  let html = '<div style="display: grid; gap: 15px;">';
  
  Object.keys(grouped).forEach(section => {
    html += `
      <div style="border: 1px solid #ddd; border-radius: 4px; padding: 15px; background: white;">
        <h4 style="margin: 0 0 10px 0; color: #8B0000;">${section}</h4>
        <ul style="margin: 0; padding-left: 20px;">
          ${grouped[section].map(item => `
            <li>
              ${item.item} 
              ${item.notes ? `<span style="color: #666; font-size: 12px;">(${item.notes})</span>` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });
  
  html += '</div>';
  document.getElementById('decor-shopping-list').innerHTML = html;
}

window.printDecorPlan = function() {
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Decor Plan - A Damn Fine Bridal Party</title>
        <style>
          body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #8B0000; border-bottom: 3px solid #8B0000; padding-bottom: 10px; }
          h2 { color: #0B4F3F; margin-top: 30px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .final-badge { background: #0B4F3F; color: white; padding: 3px 10px; border-radius: 3px; font-size: 12px; }
          ul { list-style: none; padding: 0; }
          li { padding: 5px 0; border-bottom: 1px solid #eee; }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>🌲 Decor Plan - A Damn Fine Bridal Party</h1>
        <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
        
        ${(AppData.decor.sections || []).map(section => `
          <div class="section">
            <h2>
              ${section.name} 
              ${section.status === 'final' ? '<span class="final-badge">FINAL ✓</span>' : ''}
            </h2>
            ${section.selectedOptions && section.selectedOptions.length > 0 ? `
              <p><strong>Selections:</strong></p>
              <ul>
                ${section.selectedOptions.map(opt => `<li>• ${opt}</li>`).join('')}
              </ul>
            ` : ''}
            ${section.customIdea ? `<p><strong>Custom Idea:</strong> ${section.customIdea}</p>` : ''}
            ${section.notes ? `<p><strong>Notes:</strong> ${section.notes}</p>` : ''}
          </div>
        `).join('')}
        
        <h2>Shopping List</h2>
        ${(AppData.decor.shoppingList || []).length > 0 ? `
          <ul>
            ${AppData.decor.shoppingList.map(item => `
              <li>☐ ${item.item} ${item.notes ? `(${item.notes})` : ''}</li>
            `).join('')}
          </ul>
        ` : '<p>No items in shopping list yet.</p>'}
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

// ============================================================================
// Menu Planner Handlers
// ============================================================================

window.handleMenuToggleShortlist = async function(itemId) {
  await toggleMenuShortlist(itemId);
  // Re-render the page to show updated status
  if (window.renderPage) {
    window.renderPage('menu-planner');
  }
};

window.handleMenuToggleFinal = async function(itemId) {
  await toggleMenuFinal(itemId);
  // Re-render the page to show updated status
  if (window.renderPage) {
    window.renderPage('menu-planner');
  }
};

window.printMenuPreview = function() {
  const finalItems = (AppData.menu.menuItems || []).filter(i => i.final);
  
  // Group by category
  const categories = {};
  finalItems.forEach(item => {
    const cat = item.category || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });
  
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Menu - A Damn Fine Bridal Party</title>
        <style>
          body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #8B0000; border-bottom: 3px solid #8B0000; padding-bottom: 10px; }
          h2 { color: #0B4F3F; margin-top: 30px; }
          .category { margin-bottom: 30px; page-break-inside: avoid; }
          .menu-item { margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          .menu-item h3 { margin: 0; color: #333; }
          .tags { display: inline-flex; gap: 5px; margin-top: 5px; }
          .tag { background: #0B4F3F; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; }
          .allergen { color: #8B0000; font-weight: bold; }
          @media print {
            body { padding: 20px; }
            .category { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>🌲 Menu - A Damn Fine Bridal Party</h1>
        <p><em>Generated on ${new Date().toLocaleDateString()}</em></p>
        
        ${['Appetizer', 'Main', 'Side', 'Dessert', 'Beverage', 'Other'].map(catName => {
          if (!categories[catName] || categories[catName].length === 0) return '';
          return `
            <div class="category">
              <h2>${catName}s</h2>
              ${categories[catName].map(item => `
                <div class="menu-item">
                  <h3>${item.name}</h3>
                  ${(item.tags && item.tags.length > 0) ? `
                    <div class="tags">
                      ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                  ` : ''}
                  <p>${item.description || ''}</p>
                  ${(item.allergens && item.allergens.length > 0) ? `
                    <p class="allergen">⚠️ Contains: ${item.allergens.join(', ')}</p>
                  ` : ''}
                  <p><em>Serves: ${item.serves || 'N/A'}</em></p>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #8B0000;">
          <h3>Dietary Information</h3>
          <p>V = Vegetarian | VG = Vegan | GF = Gluten-Free | DF = Dairy-Free</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};


// ============================================================================
// Role Assignment Handlers
// ============================================================================

window.handleRoleAssign = async function(guestId, characterId) {
  await assignRoleToGuest(guestId, characterId || null);
  if (window.renderPage) {
    window.renderPage('role-assignment');
  }
};

window.filterAssignments = function(filter) {
  // Simple filter UI update
  document.querySelectorAll('[id^="filter-"]').forEach(btn => {
    btn.classList.add('btn-secondary');
  });
  document.getElementById(`filter-${filter}`).classList.remove('btn-secondary');
  
  // For now, just re-render (could add actual filtering logic)
  if (window.renderPage) {
    window.renderPage('role-assignment');
  }
};

window.autoAssignRoles = function() {
  autoAssignCharacters();
  if (window.renderPage) {
    window.renderPage('role-assignment');
  }
};

window.printGuestPacket = function(guestId) {
  const guest = AppData.guests.find(g => g.id === guestId);
  if (!guest || !guest.assignedCharacter) {
    alert('Guest must have an assigned role to print packet.');
    return;
  }
  
  const character = AppData.characters.find(c => c.id === guest.assignedCharacter);
  const packet = AppData.packets.find(p => p.character_id === guest.assignedCharacter);
  
  if (!character || !packet) {
    alert('Character packet data not found.');
    return;
  }
  
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Character Packet - ${guest.name}</title>
        <style>
          body { font-family: Georgia, serif; padding: 40px; }
          .page-break { page-break-after: always; }
          h1 { color: #8B0000; border-bottom: 3px solid #8B0000; padding-bottom: 10px; }
          h2 { color: #0B4F3F; margin-top: 30px; }
          .envelope { padding: 30px; border: 2px solid #8B0000; margin: 20px 0; page-break-inside: avoid; }
          .intro { background: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          @media print {
            body { padding: 20px; }
            .page-break { page-break-after: always; }
          }
        </style>
      </head>
      <body>
        <h1>🌲 Character Packet for ${guest.name}</h1>
        
        <div class="intro">
          <h2>${packet.intro_profile.name}</h2>
          <h3>${packet.intro_profile.role}</h3>
          <p><em>${packet.intro_profile.tagline}</em></p>
          <p>${packet.intro_profile.overview}</p>
          
          <h4>Costume Essentials:</h4>
          <ul>
            ${(packet.intro_profile.costume_essentials || []).map(item => `<li>${item}</li>`).join('')}
          </ul>
          
          <p><strong>Secret Preview:</strong> ${packet.intro_profile.secret_preview}</p>
        </div>
        
        <div class="page-break"></div>
        
        ${(packet.envelopes || []).map((env, idx) => `
          <div class="envelope">
            <h2>Envelope ${idx + 1}: ${env.title}</h2>
            <h3>Phase: ${env.phase.toUpperCase()}</h3>
            <p><strong>Contents:</strong></p>
            <p>${env.contents}</p>
            <p><strong>Instructions:</strong></p>
            <p>${env.instructions}</p>
          </div>
          ${idx < packet.envelopes.length - 1 ? '<div class="page-break"></div>' : ''}
        `).join('')}
        
        <div class="page-break"></div>
        
        <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">
          <h2>Costume Tips for ${character.name}</h2>
          <p>${character.costume || 'No specific costume requirements.'}</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

// ============================================================================
// Host Controls Handlers
// ============================================================================

window.handlePhaseStart = function() {
  const phase = AppData.currentPhase || 'intro';
  const duration = AppData.settings.phaseDurations?.[phase] || 20;
  alert(`Starting ${phase.toUpperCase()} phase - Duration: ${duration} minutes\n\nUse a separate timer app for actual timing.`);
};

window.handlePhaseNext = function() {
  const phases = ['intro', 'mid', 'preFinal', 'final'];
  const currentIndex = phases.indexOf(AppData.currentPhase || 'intro');
  if (currentIndex < phases.length - 1) {
    AppData.currentPhase = phases[currentIndex + 1];
    alert(`Advanced to phase: ${AppData.currentPhase.toUpperCase()}`);
    if (window.renderPage) window.renderPage('host-controls');
  } else {
    alert('Already at final phase!');
  }
};

window.handlePhaseReset = function() {
  AppData.currentPhase = 'intro';
  alert('Phase reset to INTRO');
  if (window.renderPage) window.renderPage('host-controls');
};

window.handleHintBoostToggle = async function(enabled) {
  await updateSettings({ hintBoost: enabled });
  if (window.renderPage) window.renderPage('host-controls');
};

window.handleBroadcastHint = function() {
  const hints = [
    "The log knows who held the poison. Look for the elegant one.",
    "False heritage claims hide dark truths. Follow the money.",
    "Someone's grandmother's recipe wasn't theirs at all.",
    "The pie business depends on a lie. Cassandra found proof."
  ];
  const hint = hints[Math.floor(Math.random() * hints.length)];
  
  const flavoredHint = getFlavorText(hint, AppData.settings.twinPeaksFlavor);
  
  const display = document.getElementById('hint-display');
  if (display) {
    display.textContent = `"${flavoredHint}"`;
    display.style.display = 'block';
  }
  
  alert(`Log Lady Prophecy:\n\n"${flavoredHint}"\n\nShare this hint with your guests!`);
};

window.handleCupcakeNext = function() {
  const revealed = advanceCupcakeReveal();
  if (revealed) {
    alert(`Cupcake Reveal ${AppData.cupcakeRevealIndex}:\n\n"${revealed}"`);
    if (window.renderPage) window.renderPage('host-controls');
  }
};

window.handleCupcakeReset = function() {
  resetCupcakeReveal();
  alert('Cupcake reveal order reset!');
  if (window.renderPage) window.renderPage('host-controls');
};

window.printCupcakeTags = function() {
  const cupcakeOrder = AppData.settings.cupcakeOrder || AppData.story.cupcakeReveal || [];
  
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Cupcake Tags</title>
        <style>
          body { font-family: Georgia, serif; padding: 20px; }
          .tag { 
            border: 2px dashed #8B0000; 
            padding: 30px; 
            margin: 20px; 
            text-align: center; 
            font-size: 24px; 
            font-weight: bold;
            page-break-inside: avoid;
            display: inline-block;
            width: 300px;
          }
          @media print {
            .tag { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>🧁 Cupcake Reveal Tags</h1>
        <p>Cut these out and attach to cupcakes in order:</p>
        ${cupcakeOrder.map((line, idx) => `
          <div class="tag">
            <div style="font-size: 16px; color: #666;">Tag ${idx + 1}</div>
            <div style="margin-top: 15px;">${line}</div>
          </div>
        `).join('')}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

window.handleFlavorChange = async function(flavor) {
  await updateSettings({ twinPeaksFlavor: flavor });
  if (window.renderPage) window.renderPage('host-controls');
};

// ============================================================================
// Admin Settings Handlers
// ============================================================================

window.handleAdminSettingChange = async function(key, value) {
  const newSettings = {};
  newSettings[key] = value;
  await updateSettings(newSettings);
  renderSettingsPanel();
};

window.handleAdminPhaseDurationChange = async function(phase, value) {
  const phaseDurations = AppData.settings.phaseDurations || {};
  phaseDurations[phase] = parseInt(value);
  await updateSettings({ phaseDurations });
  renderSettingsPanel();
};
