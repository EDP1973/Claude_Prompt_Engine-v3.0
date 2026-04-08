// State management
const state = {
  model: 'Claude',
  language: 'JavaScript',
  level: 'intermediate',
  type: 'coding',
  purpose: 'web-app',
  task: '',
  constraints: []
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadTemplates();
  loadModels();
  loadPurposes();
  setupEventListeners();
  loadStats();
});

// Load available templates
async function loadTemplates() {
  try {
    const response = await fetch('/api/templates');
    const templates = await response.json();
    
    const group = document.getElementById('typeGroup');
    group.innerHTML = '';
    
    templates.forEach(template => {
      const btn = document.createElement('button');
      btn.className = `option-btn ${template.type === 'coding' ? 'selected' : ''}`;
      btn.textContent = template.type.charAt(0).toUpperCase() + template.type.slice(1);
      btn.dataset.type = template.type;
      btn.title = template.description;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('#typeGroup .option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.type = template.type;
      });
      
      group.appendChild(btn);
    });
  } catch (error) {
    showStatus('Failed to load templates', 'error');
  }
}

// Load available models
async function loadModels() {
  try {
    const response = await fetch('/api/models');
    const models = await response.json();
    
    const group = document.getElementById('modelGroup');
    group.innerHTML = '';
    
    models.forEach(model => {
      const btn = document.createElement('button');
      btn.className = `option-btn ${model === 'Claude' ? 'selected' : ''}`;
      btn.textContent = model;
      btn.dataset.model = model;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('#modelGroup .option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.model = model;
      });
      
      group.appendChild(btn);
    });
  } catch (error) {
    showStatus('Failed to load models', 'error');
  }
}

// Load available purposes
async function loadPurposes() {
  try {
    const response = await fetch('/api/purposes');
    const purposes = await response.json();
    
    const grid = document.getElementById('purposeGroup');
    grid.innerHTML = '';
    
    purposes.forEach(purpose => {
      const btn = document.createElement('button');
      btn.className = `purpose-btn ${purpose.id === 'web-app' ? 'selected' : ''}`;
      btn.dataset.purpose = purpose.id;
      
      const label = purpose.label;
      const parts = label.split(' ');
      const emoji = parts[0];
      const text = parts.slice(1).join(' ');
      
      btn.innerHTML = `<span class="purpose-icon">${emoji}</span><span>${text}</span>`;
      
      btn.addEventListener('click', () => {
        document.querySelectorAll('#purposeGroup .purpose-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.purpose = purpose.id;
      });
      
      grid.appendChild(btn);
    });
  } catch (error) {
    showStatus('Failed to load purposes', 'error');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Language selection (new select element)
  const languageSelect = document.getElementById('languageSelect');
  if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
      state.language = e.target.value;
    });
  } else {
    // Fallback for button-based language selection
    document.querySelectorAll('#languageGroup .option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#languageGroup .option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.language = btn.dataset.lang;
      });
    });
  }

  // Level selection
  document.querySelectorAll('#levelGroup .option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#levelGroup .option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.level = btn.dataset.level;
    });
  });

  // Generate button
  document.getElementById('generateBtn').addEventListener('click', generatePrompt);

  // Copy button
  document.getElementById('copyBtn').addEventListener('click', copyToClipboard);

  // Clear button
  document.getElementById('clearBtn').addEventListener('click', clearForm);

  // Clear history button
  document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(tabName).classList.add('active');
      
      if (tabName === 'stats') {
        loadStats();
      } else if (tabName === 'telephony') {
        loadCarriers();
      } else if (tabName === 'dialplans') {
        loadDialPlans();
      } else if (tabName === 'aiconfig') {
        loadAIConfig();
      } else if (tabName === 'extensions') {
        loadExtensions();
      }
    });
  });

  // Task input
  document.getElementById('taskInput').addEventListener('input', (e) => {
    state.task = e.target.value;
  });

  // Constraints input
  document.getElementById('constraintsInput').addEventListener('input', (e) => {
    state.constraints = e.target.value
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);
  });
}

// Generate prompt
async function generatePrompt() {
  const btn = document.getElementById('generateBtn');
  
  if (!state.task.trim()) {
    showStatus('Please enter a task description', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Generating...';
  
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: state.type,
        language: state.language,
        task: state.task,
        constraints: state.constraints,
        level: state.level,
        model: state.model,
        purpose: state.purpose
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Generation failed');
    }

    const data = await response.json();
    displayOutput(data.prompt);
    showStatus('✅ Prompt generated successfully!', 'success');
    
    document.getElementById('copyBtn').style.display = 'block';
    
    // Reload history and stats
    loadHistory();
    loadStats();
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '🚀 GENERATE PROMPT';
  }
}

// Display output
function displayOutput(prompt) {
  const output = document.getElementById('outputContent');
  output.className = 'output-content';
  output.textContent = prompt;
  
  // Scroll to output
  output.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Copy to clipboard
function copyToClipboard() {
  const output = document.getElementById('outputContent');
  
  if (output.textContent === 'Your generated prompt will appear here...' || !output.textContent) {
    showStatus('No prompt to copy', 'error');
    return;
  }

  navigator.clipboard.writeText(output.textContent).then(() => {
    showStatus('✅ Copied to clipboard!', 'success');
  }).catch(err => {
    showStatus('Failed to copy', 'error');
  });
}

// Load history
async function loadHistory() {
  try {
    const response = await fetch('/api/history');
    const history = await response.json();
    
    const list = document.getElementById('historyList');
    
    if (history.length === 0) {
      list.innerHTML = '<div class="output-empty">No history yet</div>';
      return;
    }

    list.innerHTML = history.reverse().map(item => {
      const date = new Date(item.timestamp).toLocaleString();
      const taskShort = item.task.substring(0, 60) + (item.task.length > 60 ? '...' : '');
      return `
        <div class="history-item">
          <div class="history-item-meta">
            ${item.type} • ${item.language} • ${date}
          </div>
          <div class="history-item-task">${taskShort}</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

// Clear history
async function clearHistory() {
  if (!confirm('Are you sure you want to clear all history?')) return;

  try {
    await fetch('/api/memory/clear', { method: 'POST' });
    showStatus('✅ History cleared!', 'success');
    loadHistory();
    loadStats();
  } catch (error) {
    showStatus('Failed to clear history', 'error');
  }
}

// Load statistics
async function loadStats() {
  try {
    const response = await fetch('/api/stats');
    const stats = await response.json();

    document.getElementById('totalStat').textContent = stats.totalEntries;

    // Type stats
    const typeStatsDiv = document.getElementById('typeStats');
    if (Object.keys(stats.typeCount).length > 0) {
      const topType = Object.entries(stats.typeCount).sort((a, b) => b[1] - a[1])[0];
      typeStatsDiv.innerHTML = `
        <div style="background: rgba(0, 217, 255, 0.1); border: 1px solid rgba(0, 217, 255, 0.3); padding: 1rem; border-radius: 10px; text-align: center;">
          <div style="font-size: 2rem; color: #00d9ff; font-weight: bold;">${topType[1]}</div>
          <div style="color: var(--text-dim); font-size: 0.9rem;">Top: ${topType[0]}</div>
        </div>
      `;
    }

    // Language stats
    const langStatsDiv = document.getElementById('langStats');
    if (Object.keys(stats.languageCount).length > 0) {
      const topLang = Object.entries(stats.languageCount).sort((a, b) => b[1] - a[1])[0];
      langStatsDiv.innerHTML = `
        <div style="background: rgba(255, 0, 110, 0.1); border: 1px solid rgba(255, 0, 110, 0.3); padding: 1rem; border-radius: 10px; text-align: center;">
          <div style="font-size: 2rem; color: #ff006e; font-weight: bold;">${topLang[1]}</div>
          <div style="color: var(--text-dim); font-size: 0.9rem;">Top: ${topLang[0]}</div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

// Clear form
function clearForm() {
  if (!confirm('Clear all form fields?')) return;

  document.getElementById('taskInput').value = '';
  document.getElementById('constraintsInput').value = '';
  
  state.task = '';
  state.constraints = [];
  
  document.getElementById('outputContent').className = 'output-empty';
  document.getElementById('outputContent').textContent = 'Your generated prompt will appear here...';
  document.getElementById('copyBtn').style.display = 'none';
  
  showStatus('Form cleared', 'info');
}

// Show status message
function showStatus(message, type = 'info') {
  const container = document.getElementById('statusMessage');
  
  const div = document.createElement('div');
  div.className = `status ${type}`;
  div.textContent = message;
  
  container.innerHTML = '';
  container.appendChild(div);
  
  if (type !== 'error') {
    setTimeout(() => {
      div.remove();
    }, 4000);
  }
}

// ========== NEW TAB FEATURES ==========

// Load Carriers Configuration
async function loadCarriers() {
  try {
    const response = await fetch('/api/carriers');
    const carriersData = await response.json();
    const carriersList = document.getElementById('carriersList');
    
    if (!carriersList) return;
    
    carriersList.innerHTML = '';
    carriersData.carriers.forEach(carrier => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(0, 217, 255, 0.1);
        border: 1px solid rgba(0, 217, 255, 0.3);
        padding: 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      card.innerHTML = `
        <div style="font-size: 1.5rem;">${carrier.icon}</div>
        <div style="font-weight: bold; color: var(--primary); margin: 0.5rem 0;">${carrier.name}</div>
        <div style="font-size: 0.8rem; color: var(--text-dim);">${carrier.region}</div>
      `;
      card.addEventListener('click', () => displayCarrierConfig(carrier));
      card.addEventListener('mouseover', () => {
        card.style.background = 'rgba(0, 217, 255, 0.2)';
        card.style.transform = 'translateY(-2px)';
      });
      card.addEventListener('mouseout', () => {
        card.style.background = 'rgba(0, 217, 255, 0.1)';
        card.style.transform = 'translateY(0)';
      });
      carriersList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading carriers:', error);
  }
}

// Display Carrier Configuration
function displayCarrierConfig(carrier) {
  const config = document.getElementById('carrierConfig');
  if (!config) return;
  
  const configText = `CARRIER: ${carrier.name}
Region: ${carrier.region}
Type: ${carrier.type}

FEATURES:
${carrier.features.map(f => `  • ${f}`).join('\n')}

PROTOCOLS: ${carrier.protocols.join(', ')}

API ENDPOINT: ${carrier.apiEndpoint}
AUTHENTICATION: ${carrier.authentication}

BANDWIDTH: ${carrier.bandwidth}
LATENCY: ${carrier.latency}`;
  
  config.textContent = configText;
}

// Load Dial Plans
async function loadDialPlans() {
  try {
    const response = await fetch('/api/dialplans');
    const dialplansData = await response.json();
    const dialplansList = document.getElementById('dialplansList');
    
    if (!dialplansList) return;
    
    dialplansList.innerHTML = '';
    dialplansData.dialplans.forEach(plan => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(255, 0, 110, 0.1);
        border: 1px solid rgba(255, 0, 110, 0.3);
        padding: 1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      card.innerHTML = `
        <div style="font-size: 1.3rem;">${plan.icon}</div>
        <div style="font-weight: bold; color: var(--accent); margin: 0.5rem 0;">${plan.name}</div>
        <div style="font-size: 0.75rem; color: var(--text-dim);">Complexity: ${plan.complexity}</div>
      `;
      card.addEventListener('click', () => displayDialPlanDetail(plan));
      card.addEventListener('mouseover', () => {
        card.style.background = 'rgba(255, 0, 110, 0.2)';
        card.style.transform = 'translateY(-2px)';
      });
      card.addEventListener('mouseout', () => {
        card.style.background = 'rgba(255, 0, 110, 0.1)';
        card.style.transform = 'translateY(0)';
      });
      dialplansList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading dial plans:', error);
  }
}

// Display Dial Plan Details
function displayDialPlanDetail(plan) {
  const detail = document.getElementById('dialplanDetail');
  if (!detail) return;
  
  const rulesText = plan.rules.map(rule => 
    `Rule: ${rule.name}\n  Prompt: ${rule.prompt}\n  Action: ${rule.action}`
  ).join('\n\n');
  
  const detailText = `DIAL PLAN: ${plan.name}
Description: ${plan.description}
Use Case: ${plan.useCase}
Complexity: ${plan.complexity}
Recording: ${plan.recordingEnabled ? 'Enabled' : 'Disabled'}

AI FEATURES:
${plan.aiFeatures.map(f => `  • ${f}`).join('\n')}

RULES:
${rulesText}`;
  
  detail.textContent = detailText;
}

// Load AI Configuration
async function loadAIConfig() {
  try {
    const response = await fetch('/api/ai-config');
    const aiConfig = await response.json();
    
    // Load STT Options
    const sttOptions = document.getElementById('sttOptions');
    if (sttOptions) {
      sttOptions.innerHTML = '';
      aiConfig.speechRecognition.forEach(stt => {
        const label = document.createElement('label');
        label.style.cssText = `
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 5px;
          cursor: pointer;
        `;
        label.innerHTML = `
          <input type="radio" name="stt" value="${stt.id}" />
          <div>
            <strong style="color: var(--primary);">${stt.name}</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">${stt.accuracy}% accuracy</div>
          </div>
        `;
        sttOptions.appendChild(label);
      });
    }
    
    // Load TTS Options
    const ttsOptions = document.getElementById('ttsOptions');
    if (ttsOptions) {
      ttsOptions.innerHTML = '';
      aiConfig.textToSpeech.forEach(tts => {
        const label = document.createElement('label');
        label.style.cssText = `
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(0, 153, 204, 0.05);
          border: 1px solid rgba(0, 153, 204, 0.2);
          border-radius: 5px;
          cursor: pointer;
        `;
        label.innerHTML = `
          <input type="radio" name="tts" value="${tts.id}" />
          <div>
            <strong style="color: var(--secondary);">${tts.name}</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">${tts.voices} voices</div>
          </div>
        `;
        ttsOptions.appendChild(label);
      });
    }
    
    // Load NLP Options
    const nlpOptions = document.getElementById('nlpOptions');
    if (nlpOptions) {
      nlpOptions.innerHTML = '';
      aiConfig.nlpAndIntent.forEach(nlp => {
        const label = document.createElement('label');
        label.style.cssText = `
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 0, 110, 0.05);
          border: 1px solid rgba(255, 0, 110, 0.2);
          border-radius: 5px;
          cursor: pointer;
        `;
        label.innerHTML = `
          <input type="radio" name="nlp" value="${nlp.id}" />
          <div>
            <strong style="color: var(--accent);">${nlp.name}</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">${nlp.intents} intents</div>
          </div>
        `;
        nlpOptions.appendChild(label);
      });
    }
    
    // Load Voice Features
    const voiceFeatures = document.getElementById('voiceFeatures');
    if (voiceFeatures && aiConfig.voiceRecognition) {
      voiceFeatures.innerHTML = '';
      const features = aiConfig.voiceRecognition;
      ['speakerIdentification', 'emotionDetection', 'toneAnalysis', 'languageDetection'].forEach(feature => {
        const div = document.createElement('div');
        div.style.cssText = `
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(0, 217, 255, 0.05);
          border-radius: 5px;
        `;
        const enabled = features[feature];
        div.innerHTML = `
          <input type="checkbox" ${enabled ? 'checked' : ''} disabled />
          <span style="color: var(--text-light); font-size: 0.9rem;">${feature.replace(/([A-Z])/g, ' $1').trim()}</span>
        `;
        voiceFeatures.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Error loading AI config:', error);
  }
}

// Load Browser Extensions
async function loadExtensions() {
  try {
    const response = await fetch('/api/extensions');
    const extensionsData = await response.json();
    const extensionsList = document.getElementById('extensionsList');
    
    if (!extensionsList) return;
    
    extensionsList.innerHTML = '';
    extensionsData.extensions.forEach(ext => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 153, 204, 0.05));
        border: 1px solid rgba(0, 217, 255, 0.2);
        padding: 1.5rem;
        border-radius: 10px;
        transition: all 0.3s ease;
      `;
      card.innerHTML = `
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">${ext.icon}</div>
        <div style="font-weight: bold; color: var(--primary); margin-bottom: 0.5rem;">${ext.name}</div>
        <div style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 0.75rem;">${ext.description}</div>
        <div style="font-size: 0.75rem; color: var(--text-dim);">
          <strong>Platforms:</strong> ${ext.platforms.slice(0, 2).join(', ')}${ext.platforms.length > 2 ? '...' : ''}
        </div>
      `;
      card.addEventListener('mouseover', () => {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 10px 30px rgba(0, 217, 255, 0.2)';
      });
      card.addEventListener('mouseout', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      });
      extensionsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading extensions:', error);
  }
}

// ========== GITHUB COPILOT CLI INTEGRATION ==========

// Check Copilot CLI Status
async function checkCopilotStatus() {
  try {
    const response = await fetch('/api/copilot/status');
    const status = await response.json();
    const statusDiv = document.getElementById('cliStatus');
    if (statusDiv) {
      statusDiv.textContent = `Status: ${status.status || 'Not found'}\nMessage: ${status.message}`;
    }
  } catch (error) {
    console.error('Error checking CLI status:', error);
  }
}

// Generate Installation Script
async function generateInstallScript(platform) {
  try {
    const response = await fetch('/api/copilot/install-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: platform,
        options: { name: 'my-project' }
      })
    });

    const data = await response.json();
    const scriptOutput = document.getElementById('scriptOutput');
    if (scriptOutput) {
      scriptOutput.textContent = data.script;
      scriptOutput.style.display = 'block';
      document.getElementById('downloadScriptBtn').style.display = 'block';
    }
  } catch (error) {
    console.error('Error generating script:', error);
    showStatus('Failed to generate install script', 'error');
  }
}

// Download Installation Script
function downloadInstallScript() {
  const scriptOutput = document.getElementById('scriptOutput');
  if (!scriptOutput || !scriptOutput.textContent) return;

  const blob = new Blob([scriptOutput.textContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'install-script.sh';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Test Prompt
async function testPrompt() {
  const input = document.getElementById('testPromptInput');
  if (!input || !input.value) {
    showStatus('Enter a prompt to test', 'error');
    return;
  }

  try {
    const response = await fetch('/api/copilot/test-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: input.value,
        model: state.model || 'Claude'
      })
    });

    const result = await response.json();
    const resultsDiv = document.getElementById('testResults');
    if (resultsDiv) {
      resultsDiv.innerHTML = `
        <strong style="color: var(--primary);">✅ Prompt Test Results</strong>
        <div style="margin-top: 0.75rem;">
          <strong>Status:</strong> ${result.status}<br>
          <strong>Model:</strong> ${result.model}<br>
          <strong>Recommendations:</strong>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
            ${result.recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      `;
      resultsDiv.style.display = 'block';
    }
    showStatus('Prompt test completed!', 'success');
  } catch (error) {
    console.error('Error testing prompt:', error);
    showStatus('Failed to test prompt', 'error');
  }
}

// Generate GitHub Workflow
async function generateGitHubWorkflow(projectType) {
  try {
    const response = await fetch('/api/copilot/github-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectType: projectType })
    });

    const data = await response.json();
    const workflowOutput = document.getElementById('workflowOutput');
    if (workflowOutput) {
      workflowOutput.textContent = data.workflow;
      workflowOutput.style.display = 'block';
      document.getElementById('copyWorkflowBtn').style.display = 'block';
    }
  } catch (error) {
    console.error('Error generating workflow:', error);
    showStatus('Failed to generate workflow', 'error');
  }
}

// Copy Workflow to Clipboard
function copyWorkflowToClipboard() {
  const workflowOutput = document.getElementById('workflowOutput');
  if (!workflowOutput || !workflowOutput.textContent) return;

  navigator.clipboard.writeText(workflowOutput.textContent).then(() => {
    showStatus('Workflow copied to clipboard!', 'success');
  }).catch(() => {
    showStatus('Failed to copy to clipboard', 'error');
  });
}

// Show GitHub Copilot Account Linking Dialog
function showLinkCopilotDialog() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  // Create modal content
  const content = document.createElement('div');
  content.style.cssText = `
    background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(10, 30, 50, 0.95));
    border: 2px solid rgba(0, 217, 255, 0.5);
    border-radius: 15px;
    padding: 2rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 217, 255, 0.3);
    color: var(--text-light);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  `;

  content.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <h2 style="color: var(--primary); margin: 0 0 1rem 0; font-size: 1.5rem;">
        🔗 Link GitHub Copilot Account
      </h2>
      <p style="margin: 0; color: rgba(255, 255, 255, 0.7); font-size: 0.9rem;">
        Connect your GitHub account to use Copilot CLI features
      </p>
    </div>

    <div style="background: rgba(0, 0, 0, 0.3); border-left: 3px solid var(--primary); padding: 1rem; border-radius: 5px; margin-bottom: 1.5rem;">
      <h3 style="color: var(--primary); margin-top: 0; margin-bottom: 0.75rem;">⚡ Quick Setup (2 minutes)</h3>
      <ol style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
        <li style="margin-bottom: 0.5rem;">
          <strong>Install GitHub CLI</strong>
          <code style="display: block; background: rgba(0, 217, 255, 0.1); padding: 0.5rem; margin-top: 0.25rem; border-radius: 3px; font-family: monospace; color: #00d9ff;">
            brew install gh  # macOS
          </code>
          <code style="display: block; background: rgba(0, 217, 255, 0.1); padding: 0.5rem; margin-top: 0.25rem; border-radius: 3px; font-family: monospace; color: #00d9ff;">
            sudo apt-get install gh  # Linux
          </code>
        </li>
        <li style="margin-bottom: 0.5rem;">
          <strong>Authenticate</strong>
          <code style="display: block; background: rgba(0, 217, 255, 0.1); padding: 0.5rem; margin-top: 0.25rem; border-radius: 3px; font-family: monospace; color: #00d9ff;">
            gh auth login
          </code>
        </li>
        <li style="margin-bottom: 0.5rem;">
          <strong>Install Copilot Extension</strong>
          <code style="display: block; background: rgba(0, 217, 255, 0.1); padding: 0.5rem; margin-top: 0.25rem; border-radius: 3px; font-family: monospace; color: #00d9ff;">
            gh extension install github/gh-copilot
          </code>
        </li>
        <li>
          <strong>Verify Installation</strong>
          <code style="display: block; background: rgba(0, 217, 255, 0.1); padding: 0.5rem; margin-top: 0.25rem; border-radius: 3px; font-family: monospace; color: #00d9ff;">
            gh copilot status
          </code>
        </li>
      </ol>
    </div>

    <div style="background: rgba(255, 0, 110, 0.1); border-left: 3px solid rgba(255, 0, 110, 0.5); padding: 1rem; border-radius: 5px; margin-bottom: 1.5rem;">
      <h3 style="color: rgba(255, 0, 110, 0.9); margin-top: 0; margin-bottom: 0.5rem;">ℹ️ What You'll Get</h3>
      <ul style="margin: 0; padding-left: 1.5rem; line-height: 1.6; color: rgba(255, 255, 255, 0.8);">
        <li>✓ Generate platform-specific setup scripts</li>
        <li>✓ Validate your prompts before deployment</li>
        <li>✓ Create GitHub Actions CI/CD workflows</li>
        <li>✓ Automate environment setup</li>
      </ul>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <a href="https://cli.github.com/" target="_blank" rel="noopener noreferrer" style="
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 217, 255, 0.2);
        border: 1px solid rgba(0, 217, 255, 0.5);
        color: var(--primary);
        padding: 0.75rem;
        border-radius: 5px;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
      " 
      onmouseover="this.style.background='rgba(0, 217, 255, 0.3)'; this.style.transform='translateY(-2px)';"
      onmouseout="this.style.background='rgba(0, 217, 255, 0.2)'; this.style.transform='translateY(0)';">
        📥 Install GitHub CLI
      </a>
      <a href="https://github.com/login" target="_blank" rel="noopener noreferrer" style="
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 0.8);
        padding: 0.75rem;
        border-radius: 5px;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.3s ease;
      "
      onmouseover="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.transform='translateY(-2px)';"
      onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.transform='translateY(0)';">
        🔐 Login to GitHub
      </a>
    </div>

    <button onclick="this.parentElement.parentElement.parentElement.remove();" style="
      width: 100%;
      margin-top: 1rem;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
    "
    onmouseover="this.style.background='rgba(0, 0, 0, 0.4)';"
    onmouseout="this.style.background='rgba(0, 0, 0, 0.3)';">
      Close
    </button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  // Close on modal click (outside content)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  });
}

// Initialize Copilot CLI Event Listeners
function initCopilotCliListeners() {
  // Check CLI status
  const checkCliBtn = document.getElementById('checkCliBtn');
  if (checkCliBtn) {
    checkCliBtn.addEventListener('click', checkCopilotStatus);
    // Auto-check on tab load
    setTimeout(checkCopilotStatus, 500);
  }

  // Link account button
  const linkAccountBtn = document.getElementById('linkAccountBtn');
  if (linkAccountBtn) {
    linkAccountBtn.addEventListener('click', showLinkCopilotDialog);
  }

  // Platform buttons
  document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const platform = btn.dataset.platform;
      generateInstallScript(platform);
    });
  });

  // Download script button
  const downloadScriptBtn = document.getElementById('downloadScriptBtn');
  if (downloadScriptBtn) {
    downloadScriptBtn.addEventListener('click', downloadInstallScript);
  }

  // Test prompt button
  const testPromptBtn = document.getElementById('testPromptBtn');
  if (testPromptBtn) {
    testPromptBtn.addEventListener('click', testPrompt);
  }

  // Workflow buttons
  document.querySelectorAll('.workflow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      generateGitHubWorkflow(type);
    });
  });

  // Copy workflow button
  const copyWorkflowBtn = document.getElementById('copyWorkflowBtn');
  if (copyWorkflowBtn) {
    copyWorkflowBtn.addEventListener('click', copyWorkflowToClipboard);
  }

  // Link Copilot button in header
  const copilotCliBtn = document.getElementById('copilotCliBtn');
  if (copilotCliBtn) {
    copilotCliBtn.addEventListener('click', () => {
      document.querySelector('[data-tab="copilot"]').click();
    });
  }
}

// Load initial data
loadHistory();
loadStats();
initCopilotCliListeners();
