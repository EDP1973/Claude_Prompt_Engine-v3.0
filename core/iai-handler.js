/**
 * iAI Handler — Claude Prompt Engine
 * Routes AI chat requests through:
 *   1. GitHub Copilot API  (api.githubcopilot.com — requires GH_TOKEN with Copilot Requests scope)
 *   2. GitHub CLI fallback (gh copilot suggest — uses local gh auth)
 *
 * Integrates with:
 *   - IAIMemory  : episodic + semantic + procedural memory
 *   - IAITools   : tool execution pipeline
 */

const https  = require('https');
const { exec } = require('child_process');
const util   = require('util');
const execPromise = util.promisify(exec);

// Lazy-load to avoid circular deps
let _memoryInstance = null;
let _toolsInstance  = null;

// ─── System prompts by context mode ─────────────────────────────────────────

const SYSTEM_PROMPTS = {
  general: `You are iAI, an intelligent assistant embedded in the Claude Prompt Engine application.
You help software developers, telephony engineers, and data professionals.
Be concise, practical, and direct. Use code blocks when sharing code or configs.`,

  prompt: `You are iAI, a prompt engineering specialist embedded in the Claude Prompt Engine.
Your role is to help users craft high-quality AI prompts for LLMs including Claude, GPT, Gemini, and others.
Focus on: specificity, context, constraints, output format, role assignment, and chain-of-thought techniques.
When reviewing prompts, suggest concrete improvements.`,

  data: `You are iAI, a data and SQL expert embedded in the Claude Prompt Engine's Smart Builder.
You help users with:
- CSV/Excel data import and column mapping to Vicidial fields
- MySQL query construction for contact/voter/lead databases
- Field detection: first_name, last_name, phone_number, DOB→age, political_party, county, district, etc.
- Vicidial lead list management and dialplan configuration
Be specific with SQL syntax and Vicidial field names.`
};

// ─── GitHub Copilot API ──────────────────────────────────────────────────────

async function callCopilotAPI(messages, model, token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: model || 'gpt-4o',
      messages,
      max_tokens: 2048,
      temperature: 0.7,
      stream: false
    });

    const options = {
      hostname: 'api.githubcopilot.com',
      path:     '/chat/completions',
      method:   'POST',
      headers: {
        'Authorization':   `Bearer ${token}`,
        'Content-Type':    'application/json',
        'Content-Length':  Buffer.byteLength(body),
        'Editor-Version':  'vscode/1.85.0',
        'Copilot-Integration-Id': 'claude-prompt-engine-iai'
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.choices?.[0]?.message?.content || '');
          } catch(e) { reject(new Error('Invalid API response')); }
        } else {
          reject(new Error(`Copilot API ${res.statusCode}: ${data.slice(0,200)}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('Request timed out')); });
    req.write(body);
    req.end();
  });
}

// ─── GitHub CLI fallback ─────────────────────────────────────────────────────

async function callCLIFallback(messages, context) {
  // Build a single prompt from the message history for `gh copilot suggest`
  const last = messages.filter(m => m.role === 'user').pop();
  if (!last) throw new Error('No user message found');

  const prompt = last.content.replace(/"/g, '\\"').replace(/`/g, "'");
  const target = context === 'data' ? 'git' : 'shell';

  try {
    const { stdout, stderr } = await execPromise(
      `echo "${prompt}" | gh copilot suggest --target ${target} 2>&1`,
      { timeout: 20000 }
    );
    if (stdout.trim()) return stdout.trim();
    throw new Error(stderr || 'No output from gh copilot');
  } catch(e) {
    // gh copilot explain fallback
    try {
      const { stdout } = await execPromise(
        `gh copilot explain "${prompt.slice(0, 200)}" 2>&1`,
        { timeout: 20000 }
      );
      return stdout.trim() || 'CLI returned no response.';
    } catch(e2) {
      throw new Error('GitHub CLI fallback failed: ' + e2.message);
    }
  }
}

// ─── Main handler ────────────────────────────────────────────────────────────

class IAIHandler {
  constructor({ memory = null, tools = null } = {}) {
    this.lastEngine = null;
    this.memory = memory;
    this.tools  = tools;
  }

  /** Attach memory/tools after construction (useful for deferred init). */
  setMemory(m) { this.memory = m; }
  setTools(t)  { this.tools  = t; }

  // ── Build enriched system prompt ─────────────────────────────────────────

  async _buildSystemPrompt(context, userQuery) {
    let base = SYSTEM_PROMPTS[context] || SYSTEM_PROMPTS.general;

    // Inject tool manifest
    if (this.tools) {
      base += `\n\n## Available Tools\nYou can call tools by embedding markers in your response:\n${this.tools.getManifest()}\n\nOnly use tools when they would genuinely help. Results will be automatically injected.`;
    }

    // Inject relevant memories
    if (this.memory && userQuery) {
      try {
        const recalled = await this.memory.recall(userQuery, { limit: 5 });
        if (recalled.length > 0) {
          const memLines = recalled.map(r => `• [${r.category}] ${r.content}`).join('\n');
          base += `\n\n## Relevant Memory\n${memLines}`;
        }
      } catch(e) {
        // memory recall failure is non-fatal
      }
    }

    return base;
  }

  // ── Core AI call ─────────────────────────────────────────────────────────

  async _callAI(fullMessages, model) {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (token) {
      try {
        const text = await callCopilotAPI(fullMessages, model, token);
        this.lastEngine = 'copilot-api';
        return { text, engine: 'GitHub Copilot API', model: model || 'gpt-4o' };
      } catch(e) {
        console.warn('[iAI] Copilot API failed, falling back to CLI:', e.message);
      }
    }
    try {
      const text = await callCLIFallback(fullMessages, 'general');
      this.lastEngine = 'gh-cli';
      return { text, engine: 'GitHub Copilot CLI', model: 'gh-copilot' };
    } catch(e) {
      throw new Error('iAI unavailable: ' + e.message +
        '\n\nTo enable iAI, set GH_TOKEN in your environment with Copilot Requests permission.');
    }
  }

  /**
   * Chat with iAI — full pipeline: memory recall → AI → tool execution → memory save.
   * @param {Array}  messages  - [{role, content}] conversation history
   * @param {string} context   - 'general' | 'prompt' | 'data'
   * @param {string} model     - optional model override
   * @returns {Promise<{text, engine, model, toolsUsed, memoryRecalled}>}
   */
  async chat(messages, context = 'general', model = null) {
    const userMsg = messages.filter(m => m.role === 'user').pop();
    const userQuery = userMsg?.content || '';

    // Build system prompt with memory + tool manifest
    const systemPrompt = await this._buildSystemPrompt(context, userQuery);
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // First AI call
    const aiResult = await this._callAI(fullMessages, model);
    let finalText = aiResult.text;
    let toolsUsed = [];

    // Execute tool calls found in response
    if (this.tools && finalText) {
      const toolCalls = this.tools.parseToolCalls(finalText);
      if (toolCalls.length > 0) {
        const { results, text: textAfterTools } = await this.tools.executeFromText(finalText);
        toolsUsed = results;

        // If tools ran, do a follow-up AI call so it can incorporate results
        const toolSummary = results.map(r =>
          r.success
            ? `Tool ${r.tool} returned: ${JSON.stringify(r.result).slice(0, 500)}`
            : `Tool ${r.tool} failed: ${r.error}`
        ).join('\n');

        const followUp = [
          { role: 'system', content: systemPrompt },
          ...messages,
          { role: 'assistant', content: textAfterTools },
          { role: 'user',      content: `Tool results:\n${toolSummary}\n\nPlease provide a final helpful response based on these results.` }
        ];

        try {
          const followResult = await this._callAI(followUp, model);
          finalText = followResult.text;
        } catch(e) {
          // fall back to text-with-tool-results embedded
          finalText = textAfterTools;
        }

        // Record tool usage in procedural memory
        if (this.memory) {
          results.forEach(r => {
            this.memory.recordToolUse(r.tool, r.success, r.duration).catch(() => {});
          });
        }
      }
    }

    // Save exchange to episodic memory
    if (this.memory) {
      this.memory.addEpisode('user',      userQuery,  { context, model: model || 'gpt-4o' });
      this.memory.addEpisode('assistant', finalText,  { context, engine: aiResult.engine, toolsUsed: toolsUsed.length });

      // Auto-extract and store facts from the exchange (lightweight heuristic)
      this._extractAndRemember(userQuery, finalText, context).catch(() => {});
    }

    return {
      text:       finalText,
      engine:     aiResult.engine,
      model:      aiResult.model,
      toolsUsed:  toolsUsed.map(r => ({ tool: r.tool, success: r.success })),
      memoryRecalled: !!this.memory
    };
  }

  // ── Auto-extract facts to semantic memory ─────────────────────────────────

  async _extractAndRemember(userQuery, aiReply, context) {
    if (!this.memory) return;
    // Store the query+topic as a learning entry (condensed, keyed by hash)
    const key = `q_${Buffer.from(userQuery.slice(0, 100)).toString('base64').slice(0, 20)}`;
    await this.memory.remember('learning',
      `User asked about: ${userQuery.slice(0, 200)}`,
      { key, confidence: 0.6, source: `context:${context}` }
    ).catch(() => {});
  }

  /**
   * Check which engines are available.
   */
  async status() {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    let apiAvailable  = false;
    let cliAvailable  = false;

    if (token) {
      try {
        await callCopilotAPI(
          [{ role: 'system', content: 'ping' }, { role: 'user', content: 'reply with: ok' }],
          'gpt-4o', token
        );
        apiAvailable = true;
      } catch(e) {
        // not available
      }
    }

    try {
      await execPromise('gh copilot --version 2>/dev/null', { timeout: 5000 });
      cliAvailable = true;
    } catch(e) {
      // not available
    }

    const memoryReady = !!this.memory;
    const toolsReady  = !!this.tools;

    return {
      apiAvailable,
      cliAvailable,
      tokenSet:    !!token,
      memoryReady,
      toolsReady,
      activeEngine: apiAvailable ? 'GitHub Copilot API' : cliAvailable ? 'GitHub Copilot CLI' : 'none',
      models: apiAvailable
        ? ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'o1-mini']
        : ['gh-copilot']
    };
  }
}

module.exports = IAIHandler;
