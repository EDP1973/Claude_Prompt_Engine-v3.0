const PromptEngine = require("../core/generator");

const engine = new PromptEngine();

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].replace("--", "");
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`Missing value for flag --${key}`);
      }
      args[key] = value;
    }
  }
  return args;
}

function run() {
  try {
    const args = parseArgs(process.argv.slice(3));

    if (!args.task) {
      throw new Error("Task is required (--task)");
    }

    const prompt = engine.generate({
      type: args.type,
      language: args.lang,
      task: args.task,
      context: args.context,
      constraints: args.constraints ? args.constraints.split(",").map(c => c.trim()) : [],
      level: args.level
    });

    console.log("\n=== GENERATED PROMPT ===\n");
    console.log(prompt);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

module.exports = run;