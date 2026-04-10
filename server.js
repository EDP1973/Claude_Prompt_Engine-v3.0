// Load .env before anything else
const envPath = require("path").join(__dirname, ".env");
if (require("fs").existsSync(envPath)) {
  require("fs").readFileSync(envPath, "utf8")
    .split("\n")
    .forEach(line => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    });
}

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const PromptEngine = require("./core/generator");
const Memory = require("./memory/memory");
const CopilotHandler = require("./cli/copilot-handler");
const IAIHandler = require("./core/iai-handler");
const IAIMemory  = require("./core/iai-memory");
const IAITools   = require("./core/iai-tools");
const IAIBrowse  = require("./core/iai-browse");

// Phase 3: Import new modules
const InstallConfig = require("./core/install-config");
const VicidialMapper = require("./core/vicidial-mapper");
const DataImporter = require("./core/data-importer");
const DataValidator = require("./core/data-validator");
const QueryBuilder = require("./core/query-builder");
const AdvancedMySQLQueryGenerator = require("./core/advanced-query-generator");
const ApiHandlers = require("./core/api-handlers");

const PORT = process.env.PORT || 3000;
const MAX_BODY_SIZE = 1024 * 1024; // 1MB limit
const DB_PATH = path.join(__dirname, "prompt_engine.db");

const engine = new PromptEngine();
const memory = new Memory();
const copilotHandler = new CopilotHandler();

// iAI subsystems
const iaiMemory = new IAIMemory();
const iaiTools  = new IAITools();
const iaiBrowse = new IAIBrowse();
const iaiHandler = new IAIHandler({ memory: iaiMemory, tools: iaiTools });

// Phase 3: Initialize Phase 1 modules
const installConfig = new InstallConfig();
const vicidialMapper = new VicidialMapper();
const dataImporter = new DataImporter();
const dataValidator = new DataValidator();
const queryBuilder = new QueryBuilder();
const advancedQueryGenerator = new AdvancedMySQLQueryGenerator(vicidialMapper);
const apiHandlers = new ApiHandlers();

// Phase 3: Database instance (singleton)
let db = null;

/**
 * Initialize SQLite database
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error("❌ Database connection failed:", err.message);
        reject(err);
        return;
      }
      
      console.log("✅ Database connected");
      
      // Create schema if it doesn't exist
      createDatabaseSchema()
        .then(() => resolve(db))
        .catch(reject);
    });
  });
}

/**
 * Create database schema
 */
function createDatabaseSchema() {
  return new Promise((resolve, reject) => {
    const schema = `
      -- Data imports
      CREATE TABLE IF NOT EXISTS data_imports (
        id TEXT PRIMARY KEY,
        filename TEXT,
        import_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        record_count INTEGER,
        validation_status TEXT,
        mapping_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Column mappings
      CREATE TABLE IF NOT EXISTS column_mappings (
        id TEXT PRIMARY KEY,
        import_id TEXT,
        source_column TEXT,
        vicidial_field TEXT,
        data_type TEXT,
        FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE CASCADE
      );

      -- Validation results
      CREATE TABLE IF NOT EXISTS validation_results (
        id TEXT PRIMARY KEY,
        import_id TEXT,
        row_number INTEGER,
        issue_type TEXT,
        details TEXT,
        FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE CASCADE
      );

      -- Duplicate records
      CREATE TABLE IF NOT EXISTS duplicate_records (
        id TEXT PRIMARY KEY,
        import_id TEXT,
        row_number INTEGER,
        duplicate_of INTEGER,
        reason TEXT,
        FOREIGN KEY (import_id) REFERENCES data_imports(id) ON DELETE CASCADE
      );

      -- Saved queries
      CREATE TABLE IF NOT EXISTS saved_queries (
        id TEXT PRIMARY KEY,
        name TEXT,
        conditions_json TEXT,
        query_output TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Query history
      CREATE TABLE IF NOT EXISTS query_history (
        id TEXT PRIMARY KEY,
        query_text TEXT,
        execution_time INTEGER,
        records_affected INTEGER,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Deployment configuration
      CREATE TABLE IF NOT EXISTS deployment_config (
        id TEXT PRIMARY KEY,
        mode TEXT,
        host TEXT,
        port INTEGER,
        protocol TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Hardware profile
      CREATE TABLE IF NOT EXISTS hardware_profile (
        id TEXT PRIMARY KEY,
        tier TEXT,
        ram_gb INTEGER,
        cpu_cores INTEGER,
        token_limit INTEGER,
        max_models INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_data_imports_date ON data_imports(import_date);
      CREATE INDEX IF NOT EXISTS idx_column_mappings_import ON column_mappings(import_id);
      CREATE INDEX IF NOT EXISTS idx_validation_results_import ON validation_results(import_id);
      CREATE INDEX IF NOT EXISTS idx_duplicate_records_import ON duplicate_records(import_id);
      CREATE INDEX IF NOT EXISTS idx_saved_queries_date ON saved_queries(created_at);
      CREATE INDEX IF NOT EXISTS idx_query_history_date ON query_history(executed_at);
    `;

    db.exec(schema, (err) => {
      if (err) {
        console.error("❌ Schema creation failed:", err.message);
        reject(err);
      } else {
        console.log("✅ Database schema initialized");
        resolve();
      }
    });
  });
}

// Serve static files
function serveStatic(req, res, filePath) {
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }
    
    const ext = path.extname(filePath);
    let contentType = "text/html";
    if (ext === ".css") contentType = "text/css";
    if (ext === ".js") contentType = "text/javascript";
    if (ext === ".json") contentType = "application/json";
    
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

// Parse JSON request body with size limit
function parseBody(req, callback) {
  let body = "";
  let size = 0;

  req.on("data", chunk => {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      req.connection.destroy();
      callback(new Error("Request body too large"));
      return;
    }
    body += chunk.toString();
  });

  req.on("end", () => {
    try {
      const data = body ? JSON.parse(body) : {};
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  });

  req.on("error", (err) => {
    callback(err);
  });
}

// API Routes
async function handleAPI(req, res, pathname, query) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    if (pathname === "/api/templates" && req.method === "GET") {
      const templates = engine.listTemplates();
      res.writeHead(200);
      res.end(JSON.stringify(templates));
    }

    else if (pathname === "/api/models" && req.method === "GET") {
      const models = engine.listModels();
      res.writeHead(200);
      res.end(JSON.stringify(models));
    }

    else if (pathname === "/api/purposes" && req.method === "GET") {
      const purposes = engine.listPurposes();
      res.writeHead(200);
      res.end(JSON.stringify(purposes));
    }

    else if (pathname === "/api/generate" && req.method === "POST") {
      parseBody(req, (err, data) => {
        if (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        try {
          const prompt = engine.generate({
            type: data.type || "coding",
            language: data.language || "JavaScript",
            task: data.task,
            constraints: data.constraints || [],
            level: data.level || "intermediate",
            model: data.model || "Claude",
            purpose: data.purpose || "web-app"
          });

          res.writeHead(200);
          res.end(JSON.stringify({ success: true, prompt }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    }

    else if (pathname === "/api/history" && req.method === "GET") {
      const recent = memory.getRecent(20);
      res.writeHead(200);
      res.end(JSON.stringify(recent));
    }

    else if (pathname === "/api/search" && req.method === "GET") {
      const query = url.parse(req.url, true).query;
      const results = memory.search(query.q || "");
      res.writeHead(200);
      res.end(JSON.stringify(results));
    }

    else if (pathname === "/api/filter" && req.method === "GET") {
      const query = url.parse(req.url, true).query;
      let results = [];

      if (query.type) {
        results = memory.filterByType(query.type);
      } else if (query.lang) {
        results = memory.filterByLanguage(query.lang);
      }

      res.writeHead(200);
      res.end(JSON.stringify(results));
    }

    else if (pathname === "/api/stats" && req.method === "GET") {
      const stats = memory.getStats();
      res.writeHead(200);
      res.end(JSON.stringify(stats));
    }

    else if (pathname === "/api/memory/clear" && req.method === "POST") {
      const count = memory.data.history.length;
      memory.clear();
      res.writeHead(200);
      res.end(JSON.stringify({ success: true, cleared: count }));
    }

    else if (pathname === "/api/carriers" && req.method === "GET") {
      fs.readFile(path.join(__dirname, "configs", "carriers.json"), "utf-8", (err, data) => {
        try {
          if (err) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Carriers config not found" }));
            return;
          }
          res.writeHead(200);
          res.end(data);
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/dialplans" && req.method === "GET") {
      fs.readFile(path.join(__dirname, "configs", "dialplans.json"), "utf-8", (err, data) => {
        try {
          if (err) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Dialplans config not found" }));
            return;
          }
          res.writeHead(200);
          res.end(data);
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/ai-config" && req.method === "GET") {
      fs.readFile(path.join(__dirname, "configs", "ai-config-simple.json"), "utf-8", (err, data) => {
        try {
          if (err) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "AI config not found" }));
            return;
          }
          res.writeHead(200);
          res.end(data);
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/extensions" && req.method === "GET") {
      fs.readFile(path.join(__dirname, "configs", "extensions.json"), "utf-8", (err, data) => {
        try {
          if (err) {
            res.writeHead(404);
            res.end(JSON.stringify({ error: "Extensions config not found" }));
            return;
          }
          res.writeHead(200);
          res.end(data);
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/copilot/status" && req.method === "GET") {
      copilotHandler.getCliStatus().then(status => {
        res.writeHead(200);
        res.end(JSON.stringify(status));
      }).catch(err => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    }

    else if (pathname === "/api/copilot/install-script" && req.method === "POST") {
      parseBody(req, (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
          }

          const platform = data.platform || 'nodejs';
          const options = data.options || {};
          const script = copilotHandler.generateInstallScript(platform, options);

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            platform: platform,
            script: script,
            filename: `install-${platform}.sh`,
            message: `Generated ${platform} install script`
          }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/copilot/test-prompt" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
          }

          const prompt = data.prompt || '';
          const model = data.model || 'Claude';
          const result = await copilotHandler.runPromptTest(prompt, model);

          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/copilot/github-workflow" && req.method === "POST") {
      parseBody(req, (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid JSON" }));
            return;
          }

          const projectType = data.projectType || 'nodejs';
          const workflow = copilotHandler.createGitHubWorkflow(projectType);

          res.writeHead(200);
          res.end(JSON.stringify({
            success: true,
            projectType: projectType,
            workflow: workflow,
            filename: `.github/workflows/ci.yml`
          }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // ============================================================================
    // PHASE 3: Data Import API Routes
    // ============================================================================

    else if (pathname === "/api/import/upload" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          const result = await apiHandlers.uploadFile(data, db);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/import/validate" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          const result = await apiHandlers.validateImportedData(data, db);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/import/mapping" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          const result = await apiHandlers.saveColumnMapping(data, db);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // ============================================================================
    // PHASE 3: Query Builder API Routes
    // ============================================================================

    else if (pathname === "/api/query-builder/generate" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          const result = await apiHandlers.generateQuery(data, db);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/query-builder/execute" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          const result = await apiHandlers.executeQuery(data, db);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/query-builder/saved" && req.method === "GET") {
      try {
        const result = await apiHandlers.getSavedQueries(db);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    // ============================================================================
    // PHASE 4: Advanced Query Generator - Data Analysis Based
    // ============================================================================

    else if (pathname === "/api/query-builder/analyze" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          const analysis = advancedQueryGenerator.analyzeData(data.rows, data.columns);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true, analysis }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/query-builder/generate-from-analysis" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          // First analyze if not already done
          if (!data.analysisProfile) {
            advancedQueryGenerator.analyzeData(data.rows, data.columns);
          }

          const query = advancedQueryGenerator.generateQuery(
            data.columnName,
            data.operator,
            data.value,
            data.tableName || 'contacts',
            data.selectColumns
          );

          res.writeHead(200);
          res.end(JSON.stringify({ success: true, query }));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/query-builder/analysis-report" && req.method === "GET") {
      try {
        const report = advancedQueryGenerator.getAnalysisReport();
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, report }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    // ============================================================================
    // PHASE 3: Configuration API Routes
    // ============================================================================

    else if (pathname === "/api/config/deployment" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          const result = await apiHandlers.setDeploymentMode(data, db);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/config/hardware" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        try {
          if (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid request" }));
            return;
          }

          const result = await apiHandlers.setHardwareConfig(data, db);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/config/current" && req.method === "GET") {
      try {
        const result = await apiHandlers.getCurrentConfig(db);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    else if (pathname === "/api/config/detect-hardware" && req.method === "GET") {
      try {
        const hardware = installConfig.detectHardwareTier();
        res.writeHead(200);
        res.end(JSON.stringify(hardware));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    // ── iAI routes ────────────────────────────────────────────────────────
    else if (pathname === "/api/iai/status" && req.method === "GET") {
      const status = await iaiHandler.status();
      res.writeHead(200);
      res.end(JSON.stringify(status));
      return;
    }

    else if (pathname === "/api/iai/chat" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        if (err) { res.writeHead(400); res.end(JSON.stringify({ error: "Invalid JSON" })); return; }
        try {
          const { messages, context, model } = data;
          if (!messages || !Array.isArray(messages) || messages.length === 0) {
            res.writeHead(400); res.end(JSON.stringify({ error: "messages array required" })); return;
          }
          const result = await iaiHandler.chat(messages, context || 'general', model || null);
          res.writeHead(200);
          res.end(JSON.stringify(result));
        } catch(e) {
          res.writeHead(503);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/iai/tts" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        if (err) { res.writeHead(400); res.end(JSON.stringify({ error: "Invalid JSON" })); return; }
        const { text, voice } = data;
        if (!text) { res.writeHead(400); res.end(JSON.stringify({ error: "text required" })); return; }

        const openaiKey = process.env.OPENAI_API_KEY;
        if (!openaiKey) {
          res.writeHead(503); res.end(JSON.stringify({ error: "OPENAI_API_KEY not set" })); return;
        }

        const body = JSON.stringify({ model: 'tts-1', input: text.slice(0, 4096), voice: voice || 'nova' });
        const https = require('https');
        const ttsReq = https.request({
          hostname: 'api.openai.com',
          path: '/v1/audio/speech',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        }, ttsRes => {
          if (ttsRes.statusCode !== 200) {
            let e = '';
            ttsRes.on('data', d => e += d);
            ttsRes.on('end', () => { res.writeHead(502); res.end(JSON.stringify({ error: e })); });
            return;
          }
          res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' });
          ttsRes.pipe(res);
        });
        ttsReq.on('error', e => { res.writeHead(502); res.end(JSON.stringify({ error: e.message })); });
        ttsReq.setTimeout(20000, () => { ttsReq.destroy(); res.writeHead(504); res.end(JSON.stringify({ error: 'TTS timeout' })); });
        ttsReq.write(body);
        ttsReq.end();
      });
      return;
    }

    // ── iAI Memory routes ──────────────────────────────────────────────────

    else if (pathname === "/api/iai/memory/summary" && req.method === "GET") {
      try {
        const summary = await iaiMemory.getSummary();
        res.writeHead(200); res.end(JSON.stringify(summary));
      } catch(e) {
        res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }

    else if (pathname === "/api/iai/memory/recall" && req.method === "GET") {
      const q = query.q || '';
      if (!q) { res.writeHead(400); res.end(JSON.stringify({ error: "q param required" })); return; }
      try {
        const results = await iaiMemory.recall(q, { limit: parseInt(query.limit) || 10 });
        res.writeHead(200); res.end(JSON.stringify({ query: q, results }));
      } catch(e) {
        res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }

    else if (pathname === "/api/iai/memory/sessions" && req.method === "GET") {
      try {
        const sessions = iaiMemory.listSessions();
        res.writeHead(200); res.end(JSON.stringify({ sessions }));
      } catch(e) {
        res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }

    else if (pathname === "/api/iai/memory/export" && req.method === "GET") {
      try {
        const data = await iaiMemory.export();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="iai-memory.json"' });
        res.end(JSON.stringify(data, null, 2));
      } catch(e) {
        res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }

    else if (pathname === "/api/iai/memory/remember" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        if (err) { res.writeHead(400); res.end(JSON.stringify({ error: "Invalid JSON" })); return; }
        const { category, content, key, confidence } = data;
        if (!category || !content) { res.writeHead(400); res.end(JSON.stringify({ error: "category and content required" })); return; }
        try {
          const id = await iaiMemory.remember(category, content, { key, confidence: confidence || 1.0, source: 'user' });
          res.writeHead(200); res.end(JSON.stringify({ id, saved: true }));
        } catch(e) {
          res.writeHead(500); res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // ── iAI Browse routes ──────────────────────────────────────────────────

    else if (pathname === "/api/iai/browse/search" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        if (err) { res.writeHead(400); res.end(JSON.stringify({ error: "Invalid JSON" })); return; }
        const { query: q, maxResults } = data;
        if (!q) { res.writeHead(400); res.end(JSON.stringify({ error: "query required" })); return; }
        try {
          const results = await iaiBrowse.search(q, maxResults || 5);
          res.writeHead(200); res.end(JSON.stringify(results));
        } catch(e) {
          res.writeHead(502); res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/iai/browse/fetch" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        if (err) { res.writeHead(400); res.end(JSON.stringify({ error: "Invalid JSON" })); return; }
        const { url: targetUrl } = data;
        if (!targetUrl) { res.writeHead(400); res.end(JSON.stringify({ error: "url required" })); return; }
        try {
          const result = await iaiBrowse.fetchPage(targetUrl);
          res.writeHead(200); res.end(JSON.stringify(result));
        } catch(e) {
          res.writeHead(502); res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // ── iAI Update routes ──────────────────────────────────────────────────

    else if (pathname === "/api/iai/update/check" && req.method === "GET") {
      const { exec } = require('child_process');
      exec('git fetch origin --dry-run 2>&1 && git log HEAD..origin/HEAD --oneline 2>/dev/null | head -10',
        { cwd: __dirname, timeout: 15000 },
        (err, stdout, stderr) => {
          const behind = (stdout || '').trim().split('\n').filter(Boolean);
          res.writeHead(200);
          res.end(JSON.stringify({
            updateAvailable: behind.length > 0,
            commitsAhead: behind.length,
            commits: behind,
            currentVersion: require('./package.json').version
          }));
        }
      );
      return;
    }

    else if (pathname === "/api/iai/update/apply" && req.method === "POST") {
      const { exec } = require('child_process');
      exec('git pull origin HEAD 2>&1 && npm install --silent 2>&1',
        { cwd: __dirname, timeout: 60000 },
        (err, stdout) => {
          if (err) {
            res.writeHead(500); res.end(JSON.stringify({ error: err.message, output: stdout }));
          } else {
            res.writeHead(200); res.end(JSON.stringify({ success: true, output: stdout.slice(0, 2000), message: 'Update applied. Restart the server to complete.' }));
          }
        }
      );
      return;
    }

    // ── Setup Wizard API ───────────────────────────────────────────────────────

    else if (pathname === "/api/setup/config" && req.method === "GET") {
      // Return masked config (keys truncated, not full values)
      const cfg = {};
      const mask = v => v ? v.substring(0, 8) + '…' : '';
      cfg.OPENAI_API_KEY = mask(process.env.OPENAI_API_KEY);
      cfg.GH_TOKEN       = mask(process.env.GH_TOKEN);
      cfg.TELNYX_API_KEY = mask(process.env.TELNYX_API_KEY);
      cfg.MYSQL_HOST     = process.env.MYSQL_HOST || 'localhost';
      cfg.MYSQL_USER     = process.env.MYSQL_USER || 'root';
      cfg.MYSQL_DB       = process.env.MYSQL_DB   || 'vicidial';
      cfg.PORT           = process.env.PORT        || '3000';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cfg));
      return;
    }

    else if (pathname === "/api/setup/validate-key" && req.method === "POST") {
      parseBody(req, async (err, data) => {
        if (err) { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad request' })); return; }
        const { type, key } = data;
        const https = require('https');

        const httpsGet = (opts) => new Promise((resolve, reject) => {
          const req2 = https.request(opts, r => {
            let d = ''; r.on('data', c => d += c);
            r.on('end', () => resolve({ status: r.statusCode, body: d }));
          });
          req2.on('error', reject);
          req2.setTimeout(8000, () => { req2.destroy(); reject(new Error('timeout')); });
          req2.end();
        });

        try {
          if (type === 'openai') {
            const r = await httpsGet({
              hostname: 'api.openai.com', path: '/v1/models',
              headers: { 'Authorization': `Bearer ${key}` }
            });
            if (r.status !== 200) {
              res.writeHead(200); res.end(JSON.stringify({ valid: false, error: 'Invalid key' })); return;
            }
            const chatBody = JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'ok' }], max_tokens: 3 });
            const chatOpts = {
              hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
              headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(chatBody) }
            };
            const chatReq = https.request(chatOpts, chatRes => {
              let d = ''; chatRes.on('data', c => d += c);
              chatRes.on('end', () => {
                res.writeHead(200);
                res.end(JSON.stringify({ valid: true, quota: chatRes.statusCode === 200, status: chatRes.statusCode }));
              });
            });
            chatReq.on('error', () => { res.writeHead(200); res.end(JSON.stringify({ valid: true, quota: false })); });
            chatReq.setTimeout(10000, () => chatReq.destroy());
            chatReq.write(chatBody); chatReq.end();
            return;
          }

          if (type === 'github') {
            const r = await httpsGet({
              hostname: 'api.github.com', path: '/user',
              headers: { 'Authorization': `token ${key}`, 'User-Agent': 'claude-prompt-engine' }
            });
            if (r.status === 200) {
              const user = JSON.parse(r.body);
              res.writeHead(200); res.end(JSON.stringify({ valid: true, username: user.login }));
            } else {
              res.writeHead(200); res.end(JSON.stringify({ valid: false, error: 'Invalid token' }));
            }
            return;
          }

          res.writeHead(400); res.end(JSON.stringify({ error: 'Unknown key type' }));
        } catch(e) {
          res.writeHead(200); res.end(JSON.stringify({ valid: false, error: e.message }));
        }
      });
      return;
    }

    else if (pathname === "/api/setup/save-env" && req.method === "POST") {
      parseBody(req, (err, updates) => {
        if (err) { res.writeHead(400); res.end(JSON.stringify({ error: 'Bad request' })); return; }
        const envPath = path.join(__dirname, '.env');

        let existing = {};
        if (fs.existsSync(envPath)) {
          fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
            const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
            if (m) existing[m[1]] = m[2].trim();
          });
        }

        Object.entries(updates).forEach(([k, v]) => {
          if (v !== null && v !== undefined && v !== '') existing[k] = v;
        });

        const lines = [
          '# Claude Prompt Engine — Environment Variables',
          `# Updated by Setup Wizard on ${new Date().toISOString().slice(0,10)}`,
          '# NEVER commit this file to version control',
          '',
          '# AI Engine',
          `OPENAI_API_KEY=${existing.OPENAI_API_KEY || ''}`,
          `GH_TOKEN=${existing.GH_TOKEN || ''}`,
          '',
          '# Telephony',
          `TELNYX_API_KEY=${existing.TELNYX_API_KEY || ''}`,
          '',
          '# Database',
          `MYSQL_HOST=${existing.MYSQL_HOST || 'localhost'}`,
          `MYSQL_USER=${existing.MYSQL_USER || 'root'}`,
          `MYSQL_PASS=${existing.MYSQL_PASS || ''}`,
          `MYSQL_DB=${existing.MYSQL_DB || 'vicidial'}`,
          '',
          '# App',
          `PORT=${existing.PORT || '3000'}`,
          `NODE_ENV=${existing.NODE_ENV || 'development'}`,
        ];

        fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');

        Object.entries(existing).forEach(([k, v]) => {
          if (v) process.env[k] = v;
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, keys: Object.keys(updates) }));
      });
      return;
    }

    else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname.startsWith("/api/")) {
    handleAPI(req, res, pathname, parsedUrl.query).catch(err => {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    });
  } else if (pathname === "/" || pathname === "/index.html") {
    serveStatic(req, res, path.join(__dirname, "public", "index.html"));
  } else if (pathname.startsWith("/")) {
    serveStatic(req, res, path.join(__dirname, "public", pathname));
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

// Phase 3: Initialize database and start server
async function startServer() {
  try {
    console.log("\n🔧 Initializing Phase 3 components...\n");
    
    // Initialize database
    console.log("📊 Setting up database...");
    await initializeDatabase();
    
    console.log("✅ Phase 1 modules loaded:");
    console.log("   • InstallConfig - Hardware detection & configuration");
    console.log("   • VicidialMapper - Field mapping engine");
    console.log("   • DataImporter - File parsing (Excel/CSV/Text)");
    console.log("   • DataValidator - Validation & deduplication");
    console.log("   • QueryBuilder - MySQL query generation");
    console.log("   • ApiHandlers - REST API layer");
    
    console.log("\n✅ Phase 2 UI components available at:");
    console.log("   • http://localhost:" + PORT + "/data-import.html");
    console.log("   • http://localhost:" + PORT + "/query-builder-form.html");
    console.log("   • http://localhost:" + PORT + "/query-builder-visual.html");
    console.log("   • http://localhost:" + PORT + "/settings.html");
    
    // Start server
    server.listen(PORT, () => {
      console.log(`\n✨ Claude Prompt Engine v${require('./package.json').version}\n`);
      console.log(`🌐 Server:   http://localhost:${PORT}`);
      console.log(`🤖 iAI:      http://localhost:${PORT}/iai.html`);
      console.log(`🔑 Setup:    http://localhost:${PORT}/setup.html`);
      console.log(`📊 Database: ${DB_PATH}`);
      const hasOpenAI = !!process.env.OPENAI_API_KEY;
      const hasGH     = !!(process.env.GH_TOKEN || process.env.GITHUB_TOKEN);
      console.log(`🧠 AI Engine: ${hasOpenAI ? 'OpenAI ✅' : 'OpenAI ❌'} | Copilot: ${hasGH ? 'token set' : 'no token'}`);
      if (!hasOpenAI) {
        console.log(`\n  ⚠️  Run: npm run setup  — to configure API keys`);
      }
      console.log(`\n✅ All systems operational — Press Ctrl+C to stop\n`);
    });

    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Run: kill $(lsof -t -i:${PORT})  or use PORT=<other> npm run web\n`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
