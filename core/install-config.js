/**
 * Installation Configuration Manager
 * Handles deployment mode selection, hardware tier detection, and configuration persistence
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

class InstallConfig {
  constructor() {
    this.configDir = path.join(process.cwd(), 'config');
    this.deploymentFile = path.join(this.configDir, 'deployment.json');
    this.hardwareFile = path.join(this.configDir, 'hardware-profile.json');
    
    // Ensure config directory exists
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    // Hardware tier definitions
    this.tiers = {
      basic: {
        name: 'Basic',
        minMemory: 0,
        maxMemory: 4096,
        tokenLimit: 1000,
        modelCount: 1,
        models: ['claude'],
        description: 'Minimal setup for testing'
      },
      standard: {
        name: 'Standard',
        minMemory: 4096,
        maxMemory: 16384,
        tokenLimit: 4000,
        modelCount: 3,
        models: ['claude', 'gpt-4', 'gemini'],
        description: 'Standard production setup'
      },
      premium: {
        name: 'Premium',
        minMemory: 16384,
        maxMemory: Infinity,
        tokenLimit: null, // Unlimited
        modelCount: 6,
        models: ['claude', 'gpt-4', 'gemini', 'llama', 'mistral', 'palm'],
        description: 'High-performance with all models'
      }
    };

    // Deployment modes
    this.deploymentModes = {
      localhost: {
        name: 'Localhost',
        description: 'Run on local machine only (development)',
        host: 'localhost',
        port: 3000
      },
      'local-server': {
        name: 'Local Server',
        description: 'Network accessible on local network',
        host: '0.0.0.0',
        port: 3000
      },
      cloud: {
        name: 'Cloud',
        description: 'Cloud deployment configuration',
        host: process.env.CLOUD_HOST || '0.0.0.0',
        port: process.env.CLOUD_PORT || 3000
      }
    };
  }

  /**
   * Get system memory in MB
   */
  getSystemMemoryMB() {
    return Math.round(os.totalmem() / (1024 * 1024));
  }

  /**
   * Get CPU count
   */
  getCPUCount() {
    return os.cpus().length;
  }

  /**
   * Auto-detect hardware tier based on available memory
   */
  detectHardwareTier() {
    const memoryMB = this.getSystemMemoryMB();
    const cpuCount = this.getCPUCount();

    let tier = 'basic';
    if (memoryMB >= 16384) {
      tier = 'premium';
    } else if (memoryMB >= 4096) {
      tier = 'standard';
    }

    return {
      detectedTier: tier,
      memoryMB,
      cpuCount,
      tierInfo: this.tiers[tier]
    };
  }

  /**
   * Save deployment configuration
   */
  saveDeploymentConfig(mode) {
    if (!this.deploymentModes[mode]) {
      throw new Error(`Invalid deployment mode: ${mode}`);
    }

    const config = {
      mode,
      ...this.deploymentModes[mode],
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(this.deploymentFile, JSON.stringify(config, null, 2));
    return config;
  }

  /**
   * Load deployment configuration
   */
  loadDeploymentConfig() {
    if (fs.existsSync(this.deploymentFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.deploymentFile, 'utf8'));
      } catch (err) {
        console.error('Error loading deployment config:', err);
        return null;
      }
    }
    return null;
  }

  /**
   * Save hardware profile
   */
  saveHardwareProfile(tier, manualOverride = false) {
    if (!this.tiers[tier]) {
      throw new Error(`Invalid hardware tier: ${tier}`);
    }

    const detection = this.detectHardwareTier();
    const config = {
      selectedTier: tier,
      manualOverride,
      detectedTier: detection.detectedTier,
      systemMemoryMB: detection.memoryMB,
      cpuCount: detection.cpuCount,
      ...this.tiers[tier],
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(this.hardwareFile, JSON.stringify(config, null, 2));
    return config;
  }

  /**
   * Load hardware profile
   */
  loadHardwareProfile() {
    if (fs.existsSync(this.hardwareFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.hardwareFile, 'utf8'));
      } catch (err) {
        console.error('Error loading hardware profile:', err);
        return null;
      }
    }
    return null;
  }

  /**
   * Get current configuration (auto-detect if not set)
   */
  getCurrentConfig() {
    let deployment = this.loadDeploymentConfig();
    let hardware = this.loadHardwareProfile();

    // Auto-detect if not configured
    if (!deployment) {
      deployment = this.saveDeploymentConfig('localhost');
    }
    if (!hardware) {
      const detection = this.detectHardwareTier();
      hardware = this.saveHardwareProfile(detection.detectedTier, false);
    }

    return {
      deployment,
      hardware,
      detection: this.detectHardwareTier()
    };
  }

  /**
   * Get LLM limits based on hardware tier
   */
  getLLMLimits(tier = null) {
    const hardware = tier ? this.tiers[tier] : this.loadHardwareProfile();
    
    if (!hardware) {
      hardware = this.tiers.standard; // Default to standard
    }

    return {
      maxTokens: hardware.tokenLimit,
      maxModels: hardware.modelCount,
      availableModels: hardware.models,
      tier: hardware.name
    };
  }

  /**
   * Validate token count against tier limit
   */
  validateTokenCount(tokens, tier = null) {
    const limits = this.getLLMLimits(tier);
    
    if (limits.maxTokens === null) {
      return { valid: true, message: 'Unlimited tokens' };
    }

    const valid = tokens <= limits.maxTokens;
    return {
      valid,
      message: valid 
        ? `Token count within limit (${tokens}/${limits.maxTokens})`
        : `Token count exceeds limit (${tokens}/${limits.maxTokens})`,
      currentTokens: tokens,
      limit: limits.maxTokens,
      remaining: limits.maxTokens - tokens
    };
  }

  /**
   * Get all available deployment modes
   */
  getDeploymentModes() {
    return Object.entries(this.deploymentModes).map(([key, config]) => ({
      id: key,
      ...config
    }));
  }

  /**
   * Get all available hardware tiers
   */
  getHardwareTiers() {
    return Object.entries(this.tiers).map(([key, config]) => ({
      id: key,
      ...config
    }));
  }

  /**
   * Format configuration for display
   */
  formatConfigForDisplay() {
    const current = this.getCurrentConfig();
    
    return {
      deployment: {
        mode: current.deployment.mode,
        host: current.deployment.host,
        port: current.deployment.port,
        name: current.deployment.name
      },
      hardware: {
        selectedTier: current.hardware.selectedTier,
        detectedTier: current.detection.detectedTier,
        systemMemory: `${current.detection.memoryMB}MB`,
        cpuCount: current.detection.cpuCount,
        tokenLimit: current.hardware.tokenLimit || 'Unlimited',
        availableModels: current.hardware.models
      }
    };
  }

  /**
   * Print configuration summary to console
   */
  printConfigSummary() {
    const config = this.formatConfigForDisplay();
    
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          CLAUDE PROMPT ENGINE - CONFIGURATION              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log('📡 DEPLOYMENT MODE:');
    console.log(`   Mode: ${config.deployment.mode}`);
    console.log(`   Host: ${config.deployment.host}`);
    console.log(`   Port: ${config.deployment.port}\n`);

    console.log('💻 HARDWARE TIER:');
    console.log(`   Selected: ${config.hardware.selectedTier}`);
    console.log(`   Detected: ${config.hardware.detectedTier}`);
    console.log(`   System Memory: ${config.hardware.systemMemory}`);
    console.log(`   CPU Cores: ${config.hardware.cpuCount}`);
    console.log(`   Token Limit: ${config.hardware.tokenLimit}`);
    console.log(`   Available Models: ${config.hardware.availableModels.join(', ')}\n`);
  }
}

module.exports = InstallConfig;
