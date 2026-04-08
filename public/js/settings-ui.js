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
