const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const PromptEngine = require("./core/generator");
const Memory = require("./memory/memory");
const CopilotHandler = require("./cli/copilot-handler");

const PORT = process.env.PORT || 3000;
const MAX_BODY_SIZE = 1024 * 1024; // 1MB limit
const engine = new PromptEngine();
const memory = new Memory();
const copilotHandler = new CopilotHandler();

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
function handleAPI(req, res, pathname, query) {
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
    handleAPI(req, res, pathname, parsedUrl.query);
  } else if (pathname === "/" || pathname === "/index.html") {
    serveStatic(req, res, path.join(__dirname, "public", "index.html"));
  } else if (pathname.startsWith("/")) {
    serveStatic(req, res, path.join(__dirname, "public", pathname));
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`\n✨ Claude Prompt Engine - Web Server\n`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`\nPress Ctrl+C to stop\n`);
});
