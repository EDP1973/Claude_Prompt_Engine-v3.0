/**
 * iAI Tool Registry
 * Every feature in Claude Prompt Engine is exposed as a callable tool.
 * iAI parses [TOOL: name(args)] markers in its own responses and executes them.
 */

const http  = require('http');
const https = require('https');

const BASE = 'http://localhost:' + (process.env.PORT || 3000);

// ── HTTP helpers ────────────────────────────────────────────────────────────

function apiGet(path) {
  return new Promise((resolve, reject) => {
    http.get(BASE + path, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d }); }
      });
    }).on('error', reject);
  });
}

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch { resolve({ raw: d }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Tool definitions ────────────────────────────────────────────────────────

const TOOLS = {

  // ─ Prompt Engine ─────────────────────────────────────────────────────────
  generate_prompt: {
    description: 'Generate an AI prompt. Args: {type, language, task, model, level, purpose}',
    example: 'generate_prompt({"type":"coding","language":"Python","task":"REST API","model":"Claude"})',
    async run(args) {
      return apiPost('/api/generate', args);
    }
  },

  list_templates: {
    description: 'List all available prompt templates.',
    example: 'list_templates()',
    async run() { return apiGet('/api/templates'); }
  },

  list_models: {
    description: 'List all supported AI models.',
    example: 'list_models()',
    async run() { return apiGet('/api/models'); }
  },

  get_history: {
    description: 'Get recent prompt generation history.',
    example: 'get_history()',
    async run() { return apiGet('/api/history'); }
  },

  get_stats: {
    description: 'Get usage statistics for the prompt engine.',
    example: 'get_stats()',
    async run() { return apiGet('/api/stats'); }
  },

  search_history: {
    description: 'Search prompt history. Args: {q: "search term"}',
    example: 'search_history({"q":"Python"})',
    async run(args) { return apiGet(`/api/search?q=${encodeURIComponent(args.q||'')}`); }
  },

  // ─ Data Import ───────────────────────────────────────────────────────────
  validate_import: {
    description: 'Validate imported data structure. Args: {data: [{...}], mapping: {...}}',
    example: 'validate_import({"data":[...],"mapping":{...}})',
    async run(args) { return apiPost('/api/import/validate', args); }
  },

  // ─ Query Builder ─────────────────────────────────────────────────────────
  build_query: {
    description: 'Generate a MySQL SELECT query. Args: {table, conditions:[{field,operator,value}], fields:[], orderBy, limit}',
    example: 'build_query({"table":"vicidial_list","conditions":[{"field":"state","operator":"=","value":"FL"}],"limit":100})',
    async run(args) { return apiPost('/api/query-builder/generate', args); }
  },

  analyze_query: {
    description: 'Analyze query performance and suggest indexes. Args: {query: "SELECT..."}',
    example: 'analyze_query({"query":"SELECT * FROM vicidial_list WHERE state=\'FL\'"})',
    async run(args) { return apiPost('/api/query-builder/analyze', args); }
  },

  get_saved_queries: {
    description: 'List all saved queries.',
    example: 'get_saved_queries()',
    async run() { return apiGet('/api/query-builder/saved'); }
  },

  advanced_query: {
    description: 'Generate advanced MySQL query with filters. Args: {filters:[{field,operator,value}], table, orderBy, limit, offset}',
    example: 'advanced_query({"filters":[{"field":"political_party","operator":"=","value":"DEM"}],"table":"leads","limit":500})',
    async run(args) { return apiPost('/api/query-builder/generate-from-analysis', args); }
  },

  // ─ Configuration ─────────────────────────────────────────────────────────
  get_config: {
    description: 'Get current system configuration.',
    example: 'get_config()',
    async run() { return apiGet('/api/config/current'); }
  },

  detect_hardware: {
    description: 'Detect hardware tier (low/medium/high) for optimization.',
    example: 'detect_hardware()',
    async run() { return apiGet('/api/config/detect-hardware'); }
  },

  get_carriers: {
    description: 'List configured SIP/telephony carriers.',
    example: 'get_carriers()',
    async run() { return apiGet('/api/carriers'); }
  },

  get_dialplans: {
    description: 'List configured Asterisk dialplans.',
    example: 'get_dialplans()',
    async run() { return apiGet('/api/dialplans'); }
  },

  get_ai_config: {
    description: 'Get AI model configuration (speech, NLP, analytics models).',
    example: 'get_ai_config()',
    async run() { return apiGet('/api/ai-config'); }
  },

  // ─ iAI / Memory ──────────────────────────────────────────────────────────
  get_iai_status: {
    description: 'Check which AI engines (Copilot API / CLI) are available.',
    example: 'get_iai_status()',
    async run() { return apiGet('/api/iai/status'); }
  },

  get_memory_summary: {
    description: 'Get iAI memory statistics (episodic, semantic, procedural).',
    example: 'get_memory_summary()',
    async run() { return apiGet('/api/iai/memory/summary'); }
  },

  search_memory: {
    description: 'Search iAI long-term memory. Args: {q: "search term"}',
    example: 'search_memory({"q":"user preferences"})',
    async run(args) { return apiGet(`/api/iai/memory/recall?q=${encodeURIComponent(args.q||'')}`); }
  },

  // ─ System ────────────────────────────────────────────────────────────────
  check_update: {
    description: 'Check if an update is available (git fetch).',
    example: 'check_update()',
    async run() { return apiGet('/api/iai/update/check'); }
  },

  apply_update: {
    description: 'Apply update: git pull + npm install + restart. Returns diff summary.',
    example: 'apply_update()',
    async run() { return apiPost('/api/iai/update/apply', {}); }
  },

  // ─ Web / Browser ─────────────────────────────────────────────────────────
  web_search: {
    description: 'Search the web. Args: {query: "search terms", maxResults: 5}',
    example: 'web_search({"query":"vicidial MySQL optimizations","maxResults":5})',
    async run(args) { return apiPost('/api/iai/browse/search', args); }
  },

  fetch_page: {
    description: 'Fetch and extract text from a web page. Args: {url: "https://..."}',
    example: 'fetch_page({"url":"https://docs.vicidial.org"})',
    async run(args) { return apiPost('/api/iai/browse/fetch', args); }
  },

  browser_navigate: {
    description: 'Open a URL in a controlled browser session. Args: {url, sessionId?}',
    example: 'browser_navigate({"url":"https://example.com"})',
    async run(args) { return apiPost('/api/iai/browse/navigate', args); }
  },

  browser_screenshot: {
    description: 'Take a screenshot of current browser page. Args: {sessionId?}',
    example: 'browser_screenshot()',
    async run(args) { return apiPost('/api/iai/browse/screenshot', args); }
  },

  browser_click: {
    description: 'Click an element in the browser. Args: {selector: "CSS selector", sessionId?}',
    example: 'browser_click({"selector":"#submit-btn"})',
    async run(args) { return apiPost('/api/iai/browse/click', args); }
  },

  browser_fill: {
    description: 'Fill a form field. Args: {selector, value, sessionId?}',
    example: 'browser_fill({"selector":"#search","value":"Vicidial"})',
    async run(args) { return apiPost('/api/iai/browse/fill', args); }
  }
};

// ── Tool executor ────────────────────────────────────────────────────────────

class IAITools {
  /**
   * Get tool manifest (for system prompt injection).
   */
  getManifest() {
    return Object.entries(TOOLS).map(([name, t]) =>
      `• ${name}: ${t.description}\n  Example: [TOOL: ${t.example}]`
    ).join('\n');
  }

  /**
   * Get tool names list (short).
   */
  getToolNames() { return Object.keys(TOOLS); }

  /**
   * Execute a single tool by name with parsed args.
   */
  async execute(name, args = {}) {
    const tool = TOOLS[name];
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    const start = Date.now();
    try {
      const result = await tool.run(args);
      return { tool: name, success: true, result, duration: Date.now() - start };
    } catch(e) {
      return { tool: name, success: false, error: e.message, duration: Date.now() - start };
    }
  }

  /**
   * Parse [TOOL: name(args)] markers from AI response text.
   * Returns array of {name, args, raw} found in the text.
   */
  parseToolCalls(text) {
    const calls = [];
    // Match [TOOL: name({...})] or [TOOL: name()]
    const re = /\[TOOL:\s*(\w+)\(([^)]*)\)\]/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const name = m[1];
      let args = {};
      if (m[2].trim()) {
        try { args = JSON.parse(m[2]); }
        catch { try { args = JSON.parse(`{${m[2]}}`); } catch { args = {}; } }
      }
      calls.push({ name, args, raw: m[0] });
    }
    return calls;
  }

  /**
   * Execute all tool calls found in an AI response.
   * Returns results array and cleaned text (markers replaced with results).
   */
  async executeFromText(text) {
    const calls = this.parseToolCalls(text);
    if (calls.length === 0) return { calls: [], results: [], text };

    const results = await Promise.all(calls.map(c => this.execute(c.name, c.args)));

    let cleanText = text;
    calls.forEach((call, i) => {
      const summary = results[i].success
        ? `\n\n**Tool: ${call.name}**\n\`\`\`json\n${JSON.stringify(results[i].result, null, 2).slice(0, 1000)}\n\`\`\``
        : `\n\n**Tool: ${call.name} failed:** ${results[i].error}`;
      cleanText = cleanText.replace(call.raw, summary);
    });

    return { calls, results, text: cleanText };
  }
}

module.exports = IAITools;
