const Memory = require("../memory/memory");

function run() {
  const memory = new Memory();
  const subcommand = process.argv[3];
  const arg = process.argv[4];

  try {
    switch (subcommand) {
      case "search":
        if (!arg) {
          console.error("❌ Please provide a search query: cpe memory search <query>");
          process.exit(1);
        }
        searchMemory(memory, arg);
        break;

      case "clear":
        clearMemory(memory);
        break;

      case "export":
        exportMemory(memory, arg || "json");
        break;

      case "filter":
        if (!arg) {
          console.error("❌ Please specify filter type: cpe memory filter type:<type> or lang:<language>");
          process.exit(1);
        }
        filterMemory(memory, arg);
        break;

      default:
        viewMemory(memory);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

function viewMemory(memory) {
  const data = memory.data;
  console.log("\n📚 Memory Data:\n");
  console.log(JSON.stringify(data, null, 2));
  console.log();
}

function searchMemory(memory, query) {
  const results = memory.search(query);
  if (results.length === 0) {
    console.log(`\n❌ No results found for: "${query}"\n`);
    return;
  }

  console.log(`\n🔍 Found ${results.length} result(s) for: "${query}"\n`);
  results.forEach((entry, i) => {
    const date = new Date(entry.timestamp).toLocaleString();
    console.log(`  ${i + 1}. [${entry.type}] ${entry.language}`);
    console.log(`     Date: ${date}`);
    console.log(`     Task: ${entry.task}\n`);
  });
}

function clearMemory(memory) {
  const count = memory.data.history.length;
  memory.clear();
  console.log(`\n✅ Cleared ${count} entries from memory.\n`);
}

function exportMemory(memory, format) {
  try {
    const exported = memory.export(format);
    console.log("\n📤 Exported Memory:\n");
    console.log(exported);
    console.log();
  } catch (error) {
    console.error(`❌ Export failed: ${error.message}`);
    process.exit(1);
  }
}

function filterMemory(memory, filter) {
  const [filterType, ...valueParts] = filter.split(":");
  
  if (!filterType || !valueParts.length) {
    console.error("❌ Invalid filter format. Use: type:<type> or lang:<language>");
    process.exit(1);
  }

  const value = valueParts.join(":").trim();
  if (!value) {
    console.error("❌ Filter value cannot be empty");
    process.exit(1);
  }

  let results = [];

  if (filterType === "type") {
    results = memory.filterByType(value);
  } else if (filterType === "lang") {
    results = memory.filterByLanguage(value);
  } else {
    console.error("❌ Unknown filter. Use: type:<type> or lang:<language>");
    process.exit(1);
  }

  if (results.length === 0) {
    console.log(`\n❌ No results found for ${filterType}: "${value}"\n`);
    return;
  }

  console.log(`\n🔍 Found ${results.length} result(s) for ${filterType}: "${value}"\n`);
  results.forEach((entry, i) => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    console.log(`  ${i + 1}. [${entry.type}] ${entry.language} - ${date}`);
    console.log(`     Task: ${entry.task.substring(0, 70)}${entry.task.length > 70 ? "..." : ""}\n`);
  });
}

module.exports = run;
