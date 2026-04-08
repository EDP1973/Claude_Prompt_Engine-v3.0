#!/usr/bin/env node

const runGenerate = require("./commands/generate");
const runList = require("./commands/list");
const runMemory = require("./commands/memory");
const runHelp = require("./commands/help");

const command = process.argv[2];

switch (command) {
  case "generate":
    runGenerate();
    break;

  case "list":
    runList();
    break;

  case "memory":
    runMemory();
    break;

  case "help":
    runHelp();
    break;

  case undefined:
  case "":
    console.log(`
Claude Prompt Engine

Usage:
  cpe help                                    Show full help
  cpe generate --type <type> --lang <lang> --task "<task>"
  cpe list [templates|history|stats]
  cpe memory [search|filter|export|clear]

Examples:
  cpe generate --type coding --lang Python --task "Build API"
  cpe list templates
  cpe memory search "API"
  cpe help
`);
    break;

  default:
    console.error(`\n❌ Unknown command: "${command}"\n`);
    console.log("Run 'cpe help' for usage information.\n");
    process.exit(1);
}