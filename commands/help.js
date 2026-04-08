function run() {
  const help = `
╭─ Claude Prompt Engine ────────────────────────────────────────╮
│ Generate AI prompts for various coding tasks with context    │
╰───────────────────────────────────────────────────────────────╯

USAGE:
  cpe <command> [options]

COMMANDS:

  generate [options]      Generate a prompt
    --type <type>        Prompt type (see types below)
    --lang <language>    Programming language
    --task <description> Task description
    --level <level>      Skill level: beginner, intermediate, advanced (default: intermediate)
    --context <text>     Additional context
    --constraints <list> Comma-separated constraints

    Example:
      cpe generate --type coding --lang Python --task "Build REST API"

  list [section]          List available resources
    templates             Show all prompt templates
    history               Show recent prompt history
    stats                 Show memory statistics
    (default: show all)

  memory <subcommand>     Manage saved prompts
    search <query>       Search for prompts
    filter type:<type>   Filter by type
    filter lang:<lang>   Filter by language
    export [format]      Export memory (json, csv)
    clear                Clear all history
    (default: view all)

  help                    Show this help message

PROMPT TYPES:

  coding           Generate production-ready code
  debugging        Fix and debug code issues
  refactor         Improve existing code quality
  testing          Write comprehensive tests
  documentation    Create technical documentation
  architecture     Design system architecture
  code-review      Review code for issues
  optimization     Optimize code performance

EXAMPLES:

  # Generate Python code
  cpe generate --type coding --lang Python --task "Create a web scraper"

  # Debug JavaScript code
  cpe generate --type debugging --lang JavaScript --task "TypeError in async function"

  # Write tests for Java code
  cpe generate --type testing --lang Java --task "UserService class" --level advanced

  # Get code review
  cpe generate --type code-review --lang Go --task "$(cat main.go)" --constraints "performance,security"

  # Search saved prompts
  cpe memory search "API"

  # Filter by language
  cpe memory filter lang:Python

  # Export history as CSV
  cpe memory export csv

`;

  console.log(help);
}

module.exports = run;
