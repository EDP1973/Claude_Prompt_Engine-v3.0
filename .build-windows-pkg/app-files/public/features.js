// Enhanced app.js - Additional features for telephony, AI config, extensions, and personal AI guide

// Load Carriers Configuration
async function loadCarriers() {
  try {
    const response = await fetch('/api/carriers');
    const carriersData = await response.json();
    const carriersList = document.getElementById('carriersList');
    
    if (!carriersList) return; // Tab not visible yet
    
    carriersList.innerHTML = '';
    carriersData.carriers.forEach(carrier => {
      const card = document.createElement('div');
      card.className = 'carrier-card';
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
        <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 0.5rem;">
          ${carrier.features.slice(0, 2).join(', ')}...
        </div>
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
  
  const configText = `
CARRIER: ${carrier.name}
Region: ${carrier.region}
Type: ${carrier.type}

FEATURES:
${carrier.features.map(f => `  • ${f}`).join('\n')}

PROTOCOLS:
${carrier.protocols.join(', ')}

CODECS:
${carrier.codecs.join(', ')}

API ENDPOINT: ${carrier.apiEndpoint}

AUTHENTICATION: ${carrier.authentication}

BANDWIDTH: ${carrier.bandwidth}
LATENCY: ${carrier.latency}

AI INTEGRATION:
${Object.entries(carrier.aiIntegration).map(([k, v]) => `  ${k}: ${JSON.stringify(v)}`).join('\n')}

PRICING:
${Object.entries(carrier.pricing).map(([k, v]) => `  ${k}: ${v}`).join('\n')}
`;
  config.textContent = configText;
}

// Load Dial Plans
async function loadDialPlans() {
  try {
    const response = await fetch('/api/dialplans');
    const dialplansData = await response.json();
    const dialplansList = document.getElementById('dialplansList');
    
    if (!dialplansList) return; // Tab not visible yet
    
    dialplansList.innerHTML = '';
    dialplansData.dialplans.forEach(plan => {
      const card = document.createElement('div');
      card.className = 'dialplan-card';
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
        <div style="font-size: 0.8rem; color: var(--text-dim);">${plan.description}</div>
        <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.5rem;">
          Complexity: ${plan.complexity}
        </div>
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
  
  const detailText = `
DIAL PLAN: ${plan.name}
Description: ${plan.description}
Use Case: ${plan.useCase}
Complexity: ${plan.complexity}
Recording: ${plan.recordingEnabled ? 'Enabled' : 'Disabled'}

AI FEATURES:
${plan.aiFeatures.map(f => `  • ${f}`).join('\n')}

RULES:
${rulesText}
`;
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
          transition: background 0.3s;
        `;
        label.innerHTML = `
          <input type="radio" name="stt" value="${stt.id}" />
          <div>
            <strong style="color: var(--primary);">${stt.name}</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">${stt.accuracy}% accuracy, ${stt.languages.length} languages</div>
          </div>
        `;
        label.addEventListener('mouseover', () => label.style.background = 'rgba(0, 217, 255, 0.1)');
        label.addEventListener('mouseout', () => label.style.background = 'rgba(0, 217, 255, 0.05)');
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
          transition: background 0.3s;
        `;
        label.innerHTML = `
          <input type="radio" name="tts" value="${tts.id}" />
          <div>
            <strong style="color: var(--secondary);">${tts.name}</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">${tts.voices} voices, ${tts.naturalness}</div>
          </div>
        `;
        label.addEventListener('mouseover', () => label.style.background = 'rgba(0, 153, 204, 0.1)');
        label.addEventListener('mouseout', () => label.style.background = 'rgba(0, 153, 204, 0.05)');
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
          transition: background 0.3s;
        `;
        label.innerHTML = `
          <input type="radio" name="nlp" value="${nlp.id}" />
          <div>
            <strong style="color: var(--accent);">${nlp.name}</strong>
            <div style="font-size: 0.8rem; color: var(--text-dim);">${nlp.intents} intents, ${nlp.languages.length} languages</div>
          </div>
        `;
        label.addEventListener('mouseover', () => label.style.background = 'rgba(255, 0, 110, 0.1)');
        label.addEventListener('mouseout', () => label.style.background = 'rgba(255, 0, 110, 0.05)');
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
          <input type="checkbox" ${enabled ? 'checked' : ''} />
          <span style="color: var(--text-light);">${feature.replace(/([A-Z])/g, ' $1').trim()}</span>
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
        <div style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1rem;">${ext.description}</div>
        <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 0.75rem;">
          <strong>Platforms:</strong> ${ext.platforms.join(', ')}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1rem;">
          <strong>Features:</strong> ${ext.features.slice(0, 3).join(', ')}...
        </div>
        <button style="
          background: rgba(0, 217, 255, 0.2);
          border: 1px solid rgba(0, 217, 255, 0.5);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.3s;
        " onmouseover="this.style.background='rgba(0, 217, 255, 0.3)'" onmouseout="this.style.background='rgba(0, 217, 255, 0.2)'">
          Install Extension
        </button>
      `;
      extensionsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading extensions:', error);
  }
}

// Initialize all new tabs on page load
document.addEventListener('DOMContentLoaded', () => {
  // Add event listeners for new tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.getAttribute('data-tab');
      
      // Load data for each tab when clicked
      if (tabName === 'telephony') loadCarriers();
      if (tabName === 'dialplans') loadDialPlans();
      if (tabName === 'aiconfig') loadAIConfig();
      if (tabName === 'extensions') loadExtensions();
    });
  });
  
  // Auto-load if tabs are already visible
  setTimeout(() => {
    if (document.getElementById('carriersList')) loadCarriers();
    if (document.getElementById('dialplansList')) loadDialPlans();
    if (document.getElementById('sttOptions')) loadAIConfig();
    if (document.getElementById('extensionsList')) loadExtensions();
  }, 500);
});

// Export functions for use
window.telephonyFeatures = {
  loadCarriers,
  loadDialPlans,
  loadAIConfig,
  loadExtensions
};
