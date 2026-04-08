const PromptEngine = require("../core/generator");
const Memory = require("../memory/memory");

function run() {
  const engine = new PromptEngine();
  const memory = new Memory();

  const command = process.argv[3];

  switch (command) {
    case "templates":
      listTemplates(engine);
      break;
    case "history":
      listHistory(memory);
      break;
    case "stats":
      showStats(memory);
      break;
    default:
      listAll(engine, memory);
  }
}

function listTemplates(engine) {
  console.log("\n📋 Available Prompt Templates:\n");
  const templates = engine.listTemplates();
  templates.forEach(t => {
    console.log(`  ${t.type.padEnd(15)} - ${t.description}`);
  });
  console.log();
}

function listHistory(memory) {
  const recent = memory.getRecent(10);
  if (recent.length === 0) {
    console.log("\n📚 No history yet.\n");
    return;
  }

  console.log("\n📚 Recent Prompts (last 10):\n");
  recent.forEach((entry, i) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    console.log(`  ${i + 1}. [${entry.type}] ${entry.language} - ${date}`);
    console.log(`     Task: ${entry.task.substring(0, 60)}${entry.task.length > 60 ? "..." : ""}`);
  });
  console.log();
}

function showStats(memory) {
  const stats = memory.getStats();
  console.log("\n📊 Memory Statistics:\n");
  console.log(`  Total entries: ${stats.totalEntries}`);

  if (Object.keys(stats.typeCount).length > 0) {
    console.log("\n  By Type:");
    Object.entries(stats.typeCount).forEach(([type, count]) => {
      console.log(`    ${type}: ${count}`);
    });
  }

  if (Object.keys(stats.languageCount).length > 0) {
    console.log("\n  By Language:");
    Object.entries(stats.languageCount).forEach(([lang, count]) => {
      console.log(`    ${lang}: ${count}`);
    });
  }
  console.log();
}

function listAll(engine, memory) {
  listTemplates(engine);
  listHistory(memory);
  showStats(memory);
}

module.exports = run;
