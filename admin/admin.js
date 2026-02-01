// API Configuration
const API_URL = 'http://localhost:8000/api';

// Utility Functions
function showMessage(message, type = 'success') {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = `<div class="${type}">${message}</div>`;
  setTimeout(() => messageDiv.innerHTML = '', 5000);
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(sectionId).classList.add('active');
  event.target.classList.add('active');
  
  // Load data for the section
  loadSectionData(sectionId);
}

async function loadSectionData(sectionId) {
  switch(sectionId) {
    case 'server-info':
      await loadServerInfo();
      break;
    case 'features':
      await loadFeatures();
      break;
    case 'how-to-start':
      await loadSteps();
      break;
    case 'server-details':
      await loadDetails();
      break;
    case 'plugins':
      await loadPlugins();
      break;
    case 'rules':
      await loadRules();
      break;
    case 'payment-methods':
      await loadPaymentMethods();
      break;
    case 'legal':
      await loadLegalDocuments();
      break;
  }
}

// ============================================
// SERVER INFO
// ============================================

async function loadServerInfo() {
  try {
    const response = await fetch(`${API_URL}/server-info`);
    const data = await response.json();
    
    document.getElementById('server-name').value = data.name || '';
    document.getElementById('max-players').value = data.maxPlayers || 100;
    document.getElementById('game-version').value = data.gameVersion || '';
    document.getElementById('download-url').value = data.downloadUrl || '';
    document.getElementById('virus-total-url').value = data.virusTotalUrl || '';
  } catch (error) {
    console.error('Error loading server info:', error);
  }
}

async function updateServerInfo(event) {
  event.preventDefault();
  
  const data = {
    name: document.getElementById('server-name').value,
    maxPlayers: parseInt(document.getElementById('max-players').value),
    gameVersion: document.getElementById('game-version').value,
    downloadUrl: document.getElementById('download-url').value,
    virusTotalUrl: document.getElementById('virus-total-url').value
  };
  
  try {
    const response = await fetch(`${API_URL}/server-info`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Server info updated successfully!');
    } else {
      showMessage('Error updating server info', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

// ============================================
// FEATURES
// ============================================

async function loadFeatures() {
  try {
    const response = await fetch(`${API_URL}/features`);
    const features = await response.json();
    
    const listDiv = document.getElementById('features-list');
    listDiv.innerHTML = features.map(feature => `
      <div class="item-card">
        <div class="item-info">
          <h3>${feature.title} (${feature.language})</h3>
          <p>${feature.description || ''}</p>
          <small>Icon: ${feature.icon} | Order: ${feature.order}</small>
        </div>
        <div class="item-actions">
          <button class="danger" onclick="deleteFeature(${feature.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading features:', error);
  }
}

async function createFeature(event) {
  event.preventDefault();
  
  const data = {
    serverInfoId: 1,
    language: document.getElementById('feature-lang').value,
    title: document.getElementById('feature-title').value,
    description: document.getElementById('feature-description').value,
    icon: document.getElementById('feature-icon').value,
    order: parseInt(document.getElementById('feature-order').value)
  };
  
  try {
    const response = await fetch(`${API_URL}/features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Feature added successfully!');
      event.target.reset();
      loadFeatures();
    } else {
      showMessage('Error adding feature', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

async function deleteFeature(id) {
  if (!confirm('Are you sure you want to delete this feature?')) return;
  
  try {
    const response = await fetch(`${API_URL}/features/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showMessage('Feature deleted successfully!');
      loadFeatures();
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

// ============================================
// HOW TO START STEPS
// ============================================

async function loadSteps() {
  try {
    const response = await fetch(`${API_URL}/how-to-start`);
    const steps = await response.json();
    
    const listDiv = document.getElementById('steps-list');
    listDiv.innerHTML = steps.map(step => `
      <div class="item-card">
        <div class="item-info">
          <h3>Step ${step.stepNumber}: ${step.title} (${step.language})</h3>
          <p>${step.content.substring(0, 100)}...</p>
          ${step.imageUrl ? '<small>📷 Has image</small>' : ''}
          ${step.videoUrl ? '<small>🎥 Has video</small>' : ''}
        </div>
        <div class="item-actions">
          <button class="danger" onclick="deleteStep(${step.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading steps:', error);
  }
}

async function createStep(event) {
  event.preventDefault();
  
  const data = {
    language: document.getElementById('step-lang').value,
    stepNumber: parseInt(document.getElementById('step-number').value),
    title: document.getElementById('step-title').value,
    content: document.getElementById('step-content').value,
    imageUrl: document.getElementById('step-image').value || undefined,
    videoUrl: document.getElementById('step-video').value || undefined
  };
  
  try {
    const response = await fetch(`${API_URL}/how-to-start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Step added successfully!');
      event.target.reset();
      loadSteps();
    } else {
      showMessage('Error adding step', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

async function deleteStep(id) {
  if (!confirm('Are you sure you want to delete this step?')) return;
  
  try {
    const response = await fetch(`${API_URL}/how-to-start/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showMessage('Step deleted successfully!');
      loadSteps();
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

// ============================================
// SERVER DETAILS
// ============================================

async function loadDetails() {
  try {
    const response = await fetch(`${API_URL}/server-details`);
    const details = await response.json();
    
    const listDiv = document.getElementById('details-list');
    listDiv.innerHTML = details.map(detail => `
      <div class="item-card">
        <div class="item-info">
          <h3>${detail.title} (${detail.language})</h3>
          <p>Section: ${detail.section} | Order: ${detail.order}</p>
          ${detail.imageUrl ? '<small>📷 Has image</small>' : ''}
          ${detail.videoUrl ? '<small>🎥 Has video</small>' : ''}
        </div>
        <div class="item-actions">
          <button class="danger" onclick="deleteDetail(${detail.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading details:', error);
  }
}

async function createDetail(event) {
  event.preventDefault();
  
  const data = {
    language: document.getElementById('detail-lang').value,
    section: document.getElementById('detail-section').value,
    title: document.getElementById('detail-title').value,
    content: document.getElementById('detail-content').value,
    imageUrl: document.getElementById('detail-image').value || undefined,
    videoUrl: document.getElementById('detail-video').value || undefined,
    order: parseInt(document.getElementById('detail-order').value)
  };
  
  try {
    const response = await fetch(`${API_URL}/server-details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Server detail added successfully!');
      event.target.reset();
      loadDetails();
    } else {
      showMessage('Error adding detail', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

async function deleteDetail(id) {
  if (!confirm('Are you sure you want to delete this detail?')) return;
  
  try {
    const response = await fetch(`${API_URL}/server-details/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showMessage('Detail deleted successfully!');
      loadDetails();
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

// ============================================
// PLUGINS
// ============================================

async function loadPlugins() {
  try {
    const response = await fetch(`${API_URL}/plugins`);
    const plugins = await response.json();
    
    const listDiv = document.getElementById('plugins-list');
    listDiv.innerHTML = plugins.map(plugin => `
      <div class="item-card">
        <div class="item-info">
          <h3>${plugin.name} (${plugin.language})</h3>
          <p>${plugin.description}</p>
          <small>Commands: ${plugin.commands.length} | Order: ${plugin.order}</small>
        </div>
        <div class="item-actions">
          <button class="secondary" onclick="viewPluginCommands(${plugin.id})">Commands</button>
          <button class="danger" onclick="deletePlugin(${plugin.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading plugins:', error);
  }
}

async function createPlugin(event) {
  event.preventDefault();
  
  const data = {
    language: document.getElementById('plugin-lang').value,
    name: document.getElementById('plugin-name').value,
    description: document.getElementById('plugin-description').value,
    order: parseInt(document.getElementById('plugin-order').value),
    commands: []
  };
  
  try {
    const response = await fetch(`${API_URL}/plugins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Plugin added successfully!');
      event.target.reset();
      loadPlugins();
    } else {
      showMessage('Error adding plugin', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

async function deletePlugin(id) {
  if (!confirm('Are you sure you want to delete this plugin?')) return;
  
  try {
    const response = await fetch(`${API_URL}/plugins/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showMessage('Plugin deleted successfully!');
      loadPlugins();
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

function viewPluginCommands(id) {
  alert('To add commands, use the API directly:\nPOST /api/commands with pluginId: ' + id);
}

// ============================================
// RULES
// ============================================

async function loadRules() {
  try {
    const response = await fetch(`${API_URL}/rules`);
    const rules = await response.json();
    
    const listDiv = document.getElementById('rules-list');
    listDiv.innerHTML = rules.map(rule => `
      <div class="item-card">
        <div class="item-info">
          <h3>${rule.title} (${rule.language})</h3>
          <p>${rule.content.substring(0, 100)}...</p>
          <small>Order: ${rule.order}</small>
        </div>
        <div class="item-actions">
          <button class="danger" onclick="deleteRule(${rule.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading rules:', error);
  }
}

async function createRule(event) {
  event.preventDefault();
  
  const data = {
    language: document.getElementById('rule-lang').value,
    title: document.getElementById('rule-title').value,
    content: document.getElementById('rule-content').value,
    order: parseInt(document.getElementById('rule-order').value)
  };
  
  try {
    const response = await fetch(`${API_URL}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Rule added successfully!');
      event.target.reset();
      loadRules();
    } else {
      showMessage('Error adding rule', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

async function deleteRule(id) {
  if (!confirm('Are you sure you want to delete this rule?')) return;
  
  try {
    const response = await fetch(`${API_URL}/rules/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showMessage('Rule deleted successfully!');
      loadRules();
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

// ============================================
// PAYMENT METHODS
// ============================================

async function loadPaymentMethods() {
  try {
    const response = await fetch(`${API_URL}/payment-methods`);
    const methods = await response.json();
    
    const listDiv = document.getElementById('payments-list');
    listDiv.innerHTML = methods.map(method => `
      <div class="item-card">
        <div class="item-info">
          <h3>${method.name}</h3>
          <p>Order: ${method.order} | ${method.enabled ? '✅ Enabled' : '❌ Disabled'}</p>
          <img src="${method.imageUrl}" alt="${method.name}" style="max-width: 100px; margin-top: 0.5rem;">
        </div>
        <div class="item-actions">
          <button class="danger" onclick="deletePaymentMethod(${method.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading payment methods:', error);
  }
}

async function createPaymentMethod(event) {
  event.preventDefault();
  
  const data = {
    name: document.getElementById('payment-name').value,
    imageUrl: document.getElementById('payment-image').value,
    order: parseInt(document.getElementById('payment-order').value),
    enabled: document.getElementById('payment-enabled').checked
  };
  
  try {
    const response = await fetch(`${API_URL}/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Payment method added successfully!');
      event.target.reset();
      loadPaymentMethods();
    } else {
      showMessage('Error adding payment method', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

async function deletePaymentMethod(id) {
  if (!confirm('Are you sure you want to delete this payment method?')) return;
  
  try {
    const response = await fetch(`${API_URL}/payment-methods/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showMessage('Payment method deleted successfully!');
      loadPaymentMethods();
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

// ============================================
// LEGAL DOCUMENTS
// ============================================

async function loadLegalDocuments() {
  try {
    const response = await fetch(`${API_URL}/legal-documents`);
    const docs = await response.json();
    
    const listDiv = document.getElementById('legal-list');
    listDiv.innerHTML = docs.map(doc => `
      <div class="item-card">
        <div class="item-info">
          <h3>${doc.title} (${doc.language})</h3>
          <p>Type: ${doc.type}</p>
          <small>Updated: ${new Date(doc.updatedAt).toLocaleDateString()}</small>
        </div>
        <div class="item-actions">
          <button class="secondary" onclick="editLegalDocument(${doc.id})">Edit</button>
          <button class="danger" onclick="deleteLegalDocument(${doc.id})">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading legal documents:', error);
  }
}

async function createLegalDocument(event) {
  event.preventDefault();
  
  const data = {
    language: document.getElementById('legal-lang').value,
    type: document.getElementById('legal-type').value,
    title: document.getElementById('legal-title').value,
    content: document.getElementById('legal-content').value
  };
  
  try {
    const response = await fetch(`${API_URL}/legal-documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      showMessage('Legal document saved successfully!');
      event.target.reset();
      loadLegalDocuments();
    } else {
      showMessage('Error saving legal document', 'error');
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

async function editLegalDocument(id) {
  alert('Edit functionality: Use the form to update the document for the same language and type combination.');
}

async function deleteLegalDocument(id) {
  if (!confirm('Are you sure you want to delete this legal document?')) return;
  
  try {
    const response = await fetch(`${API_URL}/legal-documents/${id}`, { method: 'DELETE' });
    if (response.ok) {
      showMessage('Legal document deleted successfully!');
      loadLegalDocuments();
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadServerInfo();
});
