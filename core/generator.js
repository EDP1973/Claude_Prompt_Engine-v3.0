const templates = require("./templates");
const Memory = require("../memory/memory");
const buildContext = require("../memory/context");

const VALID_TYPES = Object.keys(templates);
const VALID_LEVELS = ["beginner", "intermediate", "advanced"];
const VALID_MODELS = ["Claude", "GPT-4", "GPT-3.5", "Llama", "Mistral", "Gemini"];
const VALID_PURPOSES = [
  "phone-app",
  "web-app",
  "desktop-app",
  "api",
  "cli-tool",
  "library",
  "config-file",
  "database-schema",
  "documentation",
  "automation-script",
  "database-query",
  "telephony-system",
  "asterisk-config",
  "voip-gateway"
];

class PromptEngine {
  constructor() {
    this.memory = new Memory();
  }

  validate(options) {
    const { type, language, task, level, model, purpose } = options;

    if (!VALID_TYPES.includes(type)) {
      throw new Error(
        `Invalid type: "${type}". Available types: ${VALID_TYPES.join(", ")}`
      );
    }

    if (!language) {
      throw new Error("Language is required");
    }

    if (!task) {
      throw new Error("Task is required");
    }

    if (level && !VALID_LEVELS.includes(level)) {
      throw new Error(
        `Invalid level: "${level}". Must be one of: ${VALID_LEVELS.join(", ")}`
      );
    }

    if (model && !VALID_MODELS.includes(model)) {
      throw new Error(
        `Invalid model: "${model}". Available models: ${VALID_MODELS.join(", ")}`
      );
    }

    if (purpose && !VALID_PURPOSES.includes(purpose)) {
      throw new Error(
        `Invalid purpose: "${purpose}". Available purposes: ${VALID_PURPOSES.join(", ")}`
      );
    }
  }

  generate(options) {
    const {
      type = "coding",
      language = "JavaScript",
      task,
      constraints = [],
      level = "intermediate",
      model = "Claude",
      purpose = "web-app"
    } = options;

    this.validate({ type, language, task, level, model, purpose });

    const recent = this.memory.getRecent();
    const relevant = this.memory.getRelevant(task);

    const memoryContext = buildContext({ recent, relevant });

    const prompt = templates[type]({
      language,
      task,
      context: memoryContext,
      constraints,
      level,
      model,
      purpose
    });

    this.memory.addEntry({ type, language, task, model, purpose });

    return prompt;
  }

  listTemplates() {
    return VALID_TYPES.map(type => ({
      type,
      description: this.getTemplateDescription(type)
    }));
  }

  listModels() {
    return VALID_MODELS;
  }

  listPurposes() {
    return VALID_PURPOSES.map(p => ({
      id: p,
      label: this.getPurposeLabel(p)
    }));
  }

  getTemplateDescription(type) {
    const descriptions = {
      coding: "Generate production-ready code",
      debugging: "Fix and debug code issues",
      refactor: "Improve existing code quality",
      testing: "Write comprehensive tests",
      documentation: "Create technical documentation",
      architecture: "Design system architecture",
      "code-review": "Review code for issues and improvements",
      optimization: "Optimize code performance",
      "database-query": "Write optimized database queries",
      "database-schema": "Design database schemas",
      "telephony-dialplan": "Create Asterisk/VoIP dialplans",
      "telephony-config": "Configure VoIP systems",
      "telephony-script": "Write IVR scripts"
    };
    return descriptions[type] || "Unknown template";
  }

  getPurposeLabel(purpose) {
    const labels = {
      "phone-app": "📱 Mobile App",
      "web-app": "🌐 Web Application",
      "desktop-app": "💻 Desktop Software",
      "api": "🔌 REST/GraphQL API",
      "cli-tool": "⌨️ Command Line Tool",
      "library": "📦 Library/Package",
      "config-file": "⚙️ Configuration File",
      "database-schema": "🗄️ Database Schema",
      "documentation": "📚 Documentation",
      "automation-script": "🤖 Automation Script",
      "database-query": "🗄️ Database Query",
      "telephony-system": "☎️ Telephony System",
      "asterisk-config": "🔊 Asterisk Config",
      "voip-gateway": "📞 VoIP Gateway"
    };
    return labels[purpose] || purpose;
  }
}

module.exports = PromptEngine;