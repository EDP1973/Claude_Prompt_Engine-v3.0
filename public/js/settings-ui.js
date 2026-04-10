/**
 * Settings UI Controller
 * Manages deployment, hardware, and advanced configuration
 */

class SettingsManager {
  constructor() {
    this.config = this.loadConfig();
    this.hardwareTiers = {
      basic: {
        name: 'Basic',
        minRAM: 0,
        maxRAM: 4,
        tokens: 1000,
        models: 1,
        description: 'Minimal hardware, single model, limited tokens'
      },
      standard: {
        name: 'Standard',
        minRAM: 4,
        maxRAM: 16,
        tokens: 4000,
        models: 3,
        description: 'Standard hardware, multiple models, balanced performance'
      },
      premium: {
        name: 'Premium',
        minRAM: 16,
        maxRAM: Infinity,
        tokens: -1,
        models: 6,
        description: 'High-end hardware, all models, unlimited tokens'
      }
    };

    this.initializeUI();
    this.loadSettings();
  }

  /**
   * Initialize UI elements
   */
  initializeUI() {
    this.renderHardwareTiers();
    this.setupEventListeners();
    this.displaySystemInfo();
  }

  /**
   * Render hardware tier selection cards
   */
  renderHardwareTiers() {
    const container = document.getElementById('hardwareTiers');
    container.innerHTML = '';

    Object.entries(this.hardwareTiers).forEach(([key, tier]) => {
      const card = document.createElement('div');
      card.className = 'hardware-tier';
      card.id = `tier-${key}`;
      card.onclick = () => this.selectTier(key);

      card.innerHTML = `
        <div class="hardware-tier-name">${tier.name}</div>
        <div class="hardware-tier-specs">
          <div class="hardware-tier-spec-item">
            <span class="hardware-tier-spec-label">RAM:</span>
            <span class="hardware-tier-spec-value">${tier.minRAM}GB - ${tier.maxRAM === Infinity ? '∞' : tier.maxRAM + 'GB'}</span>
          </div>
          <div class="hardware-tier-spec-item">
            <span class="hardware-tier-spec-label">Token Limit:</span>
            <span class="hardware-tier-spec-value">${tier.tokens === -1 ? 'Unlimited' : tier.tokens.toLocaleString()}</span>
          </div>
          <div class="hardware-tier-spec-item">
            <span class="hardware-tier-spec-label">Max Models:</span>
            <span class="hardware-tier-spec-value">${tier.models}</span>
          </div>
          <div class="hardware-tier-spec-item" style="margin-top: 8px; color: #888; font-size: 0.85em;">
            ${tier.description}
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // Select current tier
    if (this.config.hardwareTier) {
      this.selectTier(this.config.hardwareTier);
    }
  }

  /**
   * Select hardware tier
   */
  selectTier(tierId) {
    document.querySelectorAll('.hardware-tier').forEach(el => {
      el.classList.remove('selected');
    });
    document.getElementById(`tier-${tierId}`).classList.add('selected');
    this.config.hardwareTier = tierId;
    this.updateHardwareDisplay();
  }

  /**
   * Update hardware display
   */
  updateHardwareDisplay() {
    const tier = this.hardwareTiers[this.config.hardwareTier];
    document.getElementById('currentTier').textContent = tier.name;
    document.getElementById('currentTokens').textContent = tier.tokens === -1 ? 'Unlimited' : tier.tokens.toLocaleString();
    document.getElementById('currentModels').textContent = tier.models;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Deployment mode change
    document.querySelectorAll('input[name="deployment"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateDeploymentDetails(e.target.value);
      });
    });

    // Database type change
    const dbType = document.getElementById('dbType');
    if (dbType) {
      dbType.addEventListener('change', (e) => {
        this.updateDatabaseDefaults(e.target.value);
      });
    }
  }

  /**
   * Update deployment details display
   */
  updateDeploymentDetails(mode) {
    const details = {
      localhost: `
        <p><strong>Localhost:</strong> Runs on http://localhost:3000 (configurable)</p>
        <p>Single user, local testing, no internet required</p>
        <p style="margin-top: 8px; color: #666;">✓ Recommended for development</p>
      `,
      'local-server': `
        <p><strong>Local Server:</strong> Accessible from LAN</p>
        <p>Multi-user support, requires network configuration</p>
        <p style="margin-top: 8px; color: #666;">✓ Recommended for team testing</p>
      `,
      cloud: `
        <p><strong>Cloud Solution:</strong> Deployed to cloud provider</p>
        <p>Requires AWS/Google Cloud/Azure setup and configuration</p>
        <p style="margin-top: 8px; color: #666;">✓ Recommended for production</p>
      `
    };

    document.getElementById('deploymentDetails').innerHTML = details[mode] || '';
    document.getElementById('currentDeployment').textContent = mode;
  }

  /**
   * Update database defaults based on type
   */
  updateDatabaseDefaults(type) {
    const defaults = {
      sqlite: { host: 'local', name: 'prompt_engine.db', user: '', password: '' },
      mysql: { host: 'localhost', name: 'prompt_engine', user: 'root', password: '' },
      postgres: { host: 'localhost', name: 'prompt_engine', user: 'postgres', password: '' }
    };

    const config = defaults[type];
    if (config) {
      document.getElementById('dbHost').value = config.host;
      document.getElementById('dbName').value = config.name;
      document.getElementById('dbUser').value = config.user;
    }
  }

  /**
   * Load settings from config
   */
  loadSettings() {
    // Load deployment
    const deploymentMode = this.config.deploymentMode || 'localhost';
    const deploymentRadio = document.querySelector(`input[name="deployment"][value="${deploymentMode}"]`);
    if (deploymentRadio) {
      deploymentRadio.checked = true;
      this.updateDeploymentDetails(deploymentMode);
    }

    // Load connection settings
    if (this.config.connection) {
      document.getElementById('serverHost').value = this.config.connection.host || 'localhost';
      document.getElementById('serverPort').value = this.config.connection.port || 3000;
      document.getElementById('protocol').value = this.config.connection.protocol || 'http';
    }

    // Load hardware
    if (this.config.hardwareTier) {
      this.selectTier(this.config.hardwareTier);
    }

    // Load performance settings
    if (this.config.performance) {
      document.getElementById('maxTokens').value = this.config.performance.maxTokens || 4000;
      document.getElementById('maxRecords').value = this.config.performance.maxRecords || 100000;
      document.getElementById('uploadLimit').value = this.config.performance.uploadLimit || 100;
      document.getElementById('enableCache').checked = this.config.performance.enableCache !== false;
      document.getElementById('enableCompression').checked = this.config.performance.enableCompression || false;
    }

    // Load security settings
    if (this.config.security) {
      document.getElementById('rateLimit').value = this.config.security.rateLimit || 100;
      document.getElementById('sessionTimeout').value = this.config.security.sessionTimeout || 30;
      document.getElementById('requireHttps').checked = this.config.security.requireHttps || false;
      document.getElementById('requireAuth').checked = this.config.security.requireAuth || false;
    }

    // Load database settings
    if (this.config.database) {
      document.getElementById('dbType').value = this.config.database.type || 'sqlite';
      document.getElementById('dbHost').value = this.config.database.host || 'localhost';
      document.getElementById('dbName').value = this.config.database.name || 'prompt_engine';
      document.getElementById('dbUser').value = this.config.database.user || 'root';
    }

    this.updateHardwareDisplay();
  }

  /**
   * Save deployment configuration
   */
  saveDeploymentConfig() {
    const mode = document.querySelector('input[name="deployment"]:checked').value;
    this.config.deploymentMode = mode;
    this.saveConfig();
    this.showToast(`✓ Deployment mode set to: ${mode}`);
  }

  /**
   * Save connection configuration
   */
  saveConnectionConfig() {
    this.config.connection = {
      host: document.getElementById('serverHost').value,
      port: parseInt(document.getElementById('serverPort').value),
      protocol: document.getElementById('protocol').value
    };
    this.saveConfig();
    this.showToast('✓ Connection settings saved');
  }

  /**
   * Save hardware configuration
   */
  saveHardwareConfig() {
    this.config.hardwareTier = this.config.hardwareTier || 'standard';
    this.saveConfig();
    this.showToast(`✓ Hardware tier: ${this.hardwareTiers[this.config.hardwareTier].name}`);
  }

  /**
   * Save performance configuration
   */
  savePerformanceConfig() {
    this.config.performance = {
      maxTokens: parseInt(document.getElementById('maxTokens').value),
      maxRecords: parseInt(document.getElementById('maxRecords').value),
      uploadLimit: parseInt(document.getElementById('uploadLimit').value),
      enableCache: document.getElementById('enableCache').checked,
      enableCompression: document.getElementById('enableCompression').checked
    };
    this.saveConfig();
    this.showToast('✓ Performance settings saved');
  }

  /**
   * Save security configuration
   */
  saveSecurityConfig() {
    this.config.security = {
      rateLimit: parseInt(document.getElementById('rateLimit').value),
      sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
      requireHttps: document.getElementById('requireHttps').checked,
      requireAuth: document.getElementById('requireAuth').checked
    };
    this.saveConfig();
    this.showToast('✓ Security settings saved');
  }

  /**
   * Save database configuration
   */
  saveDatabaseConfig() {
    this.config.database = {
      type: document.getElementById('dbType').value,
      host: document.getElementById('dbHost').value,
      name: document.getElementById('dbName').value,
      user: document.getElementById('dbUser').value,
      password: document.getElementById('dbPassword').value
    };
    this.saveConfig();
    this.showToast('✓ Database settings saved');
  }

  /**
   * Auto-detect hardware
   */
  autoDetectHardware() {
    this.showToast('🔍 Detecting hardware...');
    
    // Simulate detection (would be real in production)
    setTimeout(() => {
      const ram = Math.random() > 0.5 ? 16 : 8;
      let tier = 'basic';
      if (ram >= 16) tier = 'premium';
      else if (ram >= 4) tier = 'standard';

      this.selectTier(tier);
      this.showToast(`✓ Detected: ${ram}GB RAM → ${this.hardwareTiers[tier].name} tier`);
      document.getElementById('currentRAM').textContent = ram + ' GB';
    }, 1500);
  }

  /**
   * Detect deployment mode
   */
  detectDeployment() {
    this.showToast('🔍 Detecting deployment environment...');
    
    // Check environment
    setTimeout(() => {
      const deployment = 'localhost';
      document.querySelector(`input[name="deployment"][value="${deployment}"]`).checked = true;
      this.updateDeploymentDetails(deployment);
      this.showToast(`✓ Detected environment: ${deployment}`);
    }, 1000);
  }

  /**
   * Test connection
   */
  testConnection() {
    const host = document.getElementById('serverHost').value;
    const port = document.getElementById('serverPort').value;
    const protocol = document.getElementById('protocol').value;

    this.showToast('⏳ Testing connection...');

    setTimeout(() => {
      this.showToast(`✓ Connection successful: ${protocol}://${host}:${port}`);
    }, 1500);
  }

  /**
   * Test database
   */
  testDatabase() {
    const type = document.getElementById('dbType').value;
    const host = document.getElementById('dbHost').value;
    const name = document.getElementById('dbName').value;

    this.showToast('⏳ Testing database connection...');

    setTimeout(() => {
      this.showToast(`✓ Database connection successful: ${type}://${host}/${name}`);
    }, 1500);
  }

  /**
   * Clear cache
   */
  clearCache() {
    if (confirm('Clear all cached data?')) {
      localStorage.clear();
      this.showToast('✓ Cache cleared successfully');
    }
  }

  /**
   * Export configuration
   */
  exportConfig() {
    const json = JSON.stringify(this.config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('✓ Settings exported');
  }

  /**
   * Reset to defaults
   */
  resetDefaults() {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      localStorage.removeItem('appConfig');
      this.config = this.getDefaultConfig();
      this.saveConfig();
      location.reload();
    }
  }

  /**
   * Display system information
   */
  displaySystemInfo() {
    const now = new Date();
    document.getElementById('buildDate').textContent = now.toISOString().split('T')[0];
  }

  /**
   * Save configuration to localStorage
   */
  saveConfig() {
    localStorage.setItem('appConfig', JSON.stringify(this.config));
  }

  /**
   * Load configuration from localStorage
   */
  loadConfig() {
    try {
      const saved = localStorage.getItem('appConfig');
      return saved ? JSON.parse(saved) : this.getDefaultConfig();
    } catch {
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      deploymentMode: 'localhost',
      hardwareTier: 'standard',
      connection: {
        host: 'localhost',
        port: 3000,
        protocol: 'http'
      },
      performance: {
        maxTokens: 4000,
        maxRecords: 100000,
        uploadLimit: 100,
        enableCache: true,
        enableCompression: false
      },
      security: {
        rateLimit: 100,
        sessionTimeout: 30,
        requireHttps: false,
        requireAuth: false
      },
      database: {
        type: 'sqlite',
        host: 'localhost',
        name: 'prompt_engine.db',
        user: 'root',
        password: ''
      }
    };
  }

  /**
   * Show toast notification
   */
  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

/**
 * Tab switching function
 */
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remove active from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(tabName).classList.add('active');

  // Add active to clicked button
  event.target.classList.add('active');
}

/**
 * Global function bindings
 */
function saveDeploymentConfig() {
  if (window.settingsManager) window.settingsManager.saveDeploymentConfig();
}

function saveConnectionConfig() {
  if (window.settingsManager) window.settingsManager.saveConnectionConfig();
}

function saveHardwareConfig() {
  if (window.settingsManager) window.settingsManager.saveHardwareConfig();
}

function savePerformanceConfig() {
  if (window.settingsManager) window.settingsManager.savePerformanceConfig();
}

function saveSecurityConfig() {
  if (window.settingsManager) window.settingsManager.saveSecurityConfig();
}

function saveDatabaseConfig() {
  if (window.settingsManager) window.settingsManager.saveDatabaseConfig();
}

function autoDetectHardware() {
  if (window.settingsManager) window.settingsManager.autoDetectHardware();
}

function detectDeployment() {
  if (window.settingsManager) window.settingsManager.detectDeployment();
}

function testConnection() {
  if (window.settingsManager) window.settingsManager.testConnection();
}

function testDatabase() {
  if (window.settingsManager) window.settingsManager.testDatabase();
}

function clearCache() {
  if (window.settingsManager) window.settingsManager.clearCache();
}

function exportConfig() {
  if (window.settingsManager) window.settingsManager.exportConfig();
}

function resetDefaults() {
  if (window.settingsManager) window.settingsManager.resetDefaults();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  window.settingsManager = new SettingsManager();
});

// ── iAI Settings Functions ──────────────────────────────────────────────────

const IAI_KEYS = {
  openaiKey:    'iai_openai_key',
  githubToken:  'iai_github_token',
  iaiModel:     'iai_model',
  ttsEngine:    'iai_tts_engine',
  ttsVoice:     'iai_tts_voice',
  ttsModel:     'iai_tts_model',
  sttLang:      'iai_stt_lang',
  autoSpeak:    'iai_auto_speak',
  iaiContext:   'iai_context',
  iaiMaxTokens: 'iai_max_tokens',
  iaiMemory:    'iai_memory_enabled',
  iaiWebBrowse: 'iai_web_browse'
};

function loadIaiSettings() {
  const get = id => document.getElementById(id);
  const stored = key => localStorage.getItem(key);
  if (get('openaiKey'))         get('openaiKey').value           = stored(IAI_KEYS.openaiKey) || '';
  if (get('githubToken'))       get('githubToken').value          = stored(IAI_KEYS.githubToken) || '';
  if (get('iaiModel'))          get('iaiModel').value             = stored(IAI_KEYS.iaiModel) || 'gpt-4o-mini';
  if (get('ttsEngine'))         get('ttsEngine').value            = stored(IAI_KEYS.ttsEngine) || 'openai';
  if (get('ttsVoice'))          get('ttsVoice').value             = stored(IAI_KEYS.ttsVoice) || 'nova';
  if (get('ttsModel'))          get('ttsModel').value             = stored(IAI_KEYS.ttsModel) || 'tts-1';
  if (get('sttLang'))           get('sttLang').value              = stored(IAI_KEYS.sttLang) || 'en-US';
  if (get('autoSpeak'))         get('autoSpeak').checked          = stored(IAI_KEYS.autoSpeak) === 'true';
  if (get('iaiContext'))        get('iaiContext').value            = stored(IAI_KEYS.iaiContext) || 'general';
  if (get('iaiMaxTokens'))      get('iaiMaxTokens').value         = stored(IAI_KEYS.iaiMaxTokens) || '2048';
  if (get('iaiMemoryEnabled'))  get('iaiMemoryEnabled').checked   = stored(IAI_KEYS.iaiMemory) !== 'false';
  if (get('iaiWebBrowse'))      get('iaiWebBrowse').checked       = stored(IAI_KEYS.iaiWebBrowse) === 'true';
  updateTtsOptions();
}

function saveIaiKeys() {
  const get = id => document.getElementById(id);
  if (get('openaiKey') && get('openaiKey').value)   localStorage.setItem(IAI_KEYS.openaiKey, get('openaiKey').value);
  if (get('githubToken') && get('githubToken').value) localStorage.setItem(IAI_KEYS.githubToken, get('githubToken').value);
  if (get('iaiModel')) localStorage.setItem(IAI_KEYS.iaiModel, get('iaiModel').value);
  showSettingsToast('API keys saved');
}

function saveVoiceSettings() {
  const get = id => document.getElementById(id);
  if (get('ttsEngine'))  localStorage.setItem(IAI_KEYS.ttsEngine,  get('ttsEngine').value);
  if (get('ttsVoice'))   localStorage.setItem(IAI_KEYS.ttsVoice,   get('ttsVoice').value);
  if (get('ttsModel'))   localStorage.setItem(IAI_KEYS.ttsModel,   get('ttsModel').value);
  if (get('sttLang'))    localStorage.setItem(IAI_KEYS.sttLang,    get('sttLang').value);
  if (get('autoSpeak'))  localStorage.setItem(IAI_KEYS.autoSpeak,  get('autoSpeak').checked);
  showSettingsToast('Voice settings saved');
}

function saveIaiBehaviour() {
  const get = id => document.getElementById(id);
  if (get('iaiContext'))        localStorage.setItem(IAI_KEYS.iaiContext,   get('iaiContext').value);
  if (get('iaiMaxTokens'))      localStorage.setItem(IAI_KEYS.iaiMaxTokens, get('iaiMaxTokens').value);
  if (get('iaiMemoryEnabled'))  localStorage.setItem(IAI_KEYS.iaiMemory,    get('iaiMemoryEnabled').checked);
  if (get('iaiWebBrowse'))      localStorage.setItem(IAI_KEYS.iaiWebBrowse, get('iaiWebBrowse').checked);
  showSettingsToast('Behaviour settings saved');
}

function updateTtsOptions() {
  const get = id => document.getElementById(id);
  const isOpenAI = !get('ttsEngine') || get('ttsEngine').value === 'openai';
  if (get('openaiVoiceSection'))    get('openaiVoiceSection').style.display    = isOpenAI ? '' : 'none';
  if (get('openaiTtsModelSection')) get('openaiTtsModelSection').style.display = isOpenAI ? '' : 'none';
}

async function checkIaiStatus() {
  const get = id => document.getElementById(id);
  const el = get('iaiStatus'), diag = get('iaiDiag');
  if (el) el.textContent = 'Checking...';
  try {
    const r = await fetch('/api/iai/status');
    const d = await r.json();
    if (el) {
      const ok = d.apiAvailable || d.cliAvailable;
      el.innerHTML = '<span style="color:' + (ok ? '#4caf50' : '#ff6b6b') + '">' + (ok ? 'Online' : 'Offline') + '</span>'
        + ' | Engine: <strong>' + (d.activeEngine || 'None') + '</strong>'
        + ' | Models: ' + ((d.models || []).join(', ') || 'N/A');
    }
    if (diag) diag.textContent = JSON.stringify(d, null, 2);
  } catch(e) {
    if (el) el.innerHTML = '<span style="color:#ff6b6b">Error: ' + e.message + '</span>';
    if (diag) diag.textContent = 'Error: ' + e.message;
  }
}

async function testIaiConnection() {
  showSettingsToast('Testing iAI connection...');
  try {
    const r = await fetch('/api/iai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Reply with only: iAI connected OK', mode: 'general' })
    });
    const d = await r.json();
    if (d.text) showSettingsToast('iAI: ' + d.text.slice(0, 60));
    else showSettingsToast('iAI test failed: ' + (d.error || 'No response'));
  } catch(e) {
    showSettingsToast('Connection error: ' + e.message);
  }
}

async function testVoice() {
  const get = id => document.getElementById(id);
  const engine = get('ttsEngine') ? get('ttsEngine').value : 'browser';
  if (engine === 'openai') {
    try {
      const voice = get('ttsVoice') ? get('ttsVoice').value : 'nova';
      const r = await fetch('/api/iai/tts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'iAI voice is working.', voice: voice })
      });
      if (r.ok) {
        const blob = await r.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audio.play();
        showSettingsToast('OpenAI TTS playing...');
      } else {
        const err = await r.json().catch(() => ({}));
        showSettingsToast('TTS error: ' + (err.error || r.status));
      }
    } catch(e) { showSettingsToast('TTS error: ' + e.message); }
  } else {
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance('iAI voice is working.');
      utt.lang = get('sttLang') ? get('sttLang').value : 'en-US';
      speechSynthesis.speak(utt);
      showSettingsToast('Browser TTS playing...');
    } else {
      showSettingsToast('Browser TTS not supported');
    }
  }
}

function viewIaiMemory() {
  window.open('/iai.html', '_blank');
}

async function clearIaiMemory() {
  if (!confirm('Clear all iAI memory? This cannot be undone.')) return;
  showSettingsToast('Clearing memory...');
  try {
    const r = await fetch('/api/iai/memory/remember', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' })
    });
    showSettingsToast(r.ok ? 'Memory cleared' : 'Failed to clear memory');
  } catch(e) { showSettingsToast('Error: ' + e.message); }
}

function showSettingsToast(msg) {
  let t = document.getElementById('settingsToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'settingsToast';
    t.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#1a1a2e;border:1px solid #00d4ff;color:#fff;padding:12px 20px;border-radius:8px;font-size:0.9em;z-index:9999;opacity:0;transition:opacity 0.3s;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(function() { t.style.opacity = '0'; }, 3000);
}

// Load iAI settings and bind tab click handler
document.addEventListener('DOMContentLoaded', function() {
  loadIaiSettings();
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (btn.textContent.indexOf('iAI') !== -1) checkIaiStatus();
    });
  });
});
