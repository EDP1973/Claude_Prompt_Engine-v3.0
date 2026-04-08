# Claude Prompt Engine - Web Interface

## 🚀 Quick Start

### Start the Web Server

```bash
cd /home/rick/claude-prompt-engine
node server.js
```

The web interface will be available at: **http://localhost:3000**

### Command Line Usage (CLI)

```bash
node index.js generate --type coding --lang Python --task "Build API"
node index.js list
node index.js memory search "API"
```

## 🌐 Web Interface Features

### Generate Prompts
- Select from 8 prompt types
- Specify programming language
- Add task description
- Set skill level (beginner/intermediate/advanced)
- Add constraints (performance, security, etc.)
- View and copy generated prompt

### Dashboard
- **Stats Tab**: View statistics about your prompt history
  - Total prompts generated
  - Languages used
  - Distribution by type
  
- **Templates Tab**: Browse all available template types

### History & Search
- View all recent prompts
- Search prompts by keyword
- Automatically saved with timestamps
- Keeps last 50 prompts

### Memory Management
- Clear history with one click
- Search saved prompts
- View usage statistics

## 📋 Available Prompt Types

1. **Coding** - Generate production-ready code
2. **Debugging** - Fix and debug code issues
3. **Refactor** - Improve existing code quality
4. **Testing** - Write comprehensive tests
5. **Documentation** - Create technical documentation
6. **Architecture** - Design system architecture
7. **Code Review** - Review code for issues
8. **Optimization** - Optimize code performance

## 🔌 API Endpoints

### GET /api/templates
Get all available prompt templates
```bash
curl http://localhost:3000/api/templates
```

### POST /api/generate
Generate a prompt
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "coding",
    "language": "Python",
    "task": "Build REST API",
    "level": "intermediate",
    "constraints": ["async", "performance"]
  }'
```

### GET /api/history
Get recent prompts
```bash
curl http://localhost:3000/api/history
```

### GET /api/search?q=<query>
Search prompts
```bash
curl http://localhost:3000/api/search?q=API
```

### GET /api/filter?type=<type>
Filter by type
```bash
curl http://localhost:3000/api/filter?type=coding
```

### GET /api/filter?lang=<language>
Filter by language
```bash
curl http://localhost:3000/api/filter?lang=Python
```

### GET /api/stats
Get memory statistics
```bash
curl http://localhost:3000/api/stats
```

### POST /api/memory/clear
Clear all history
```bash
curl -X POST http://localhost:3000/api/memory/clear
```

## 🎨 UI Highlights

- **Modern Design**: Gradient background, responsive layout
- **Real-time Stats**: Updates automatically every 10 seconds
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: Clean, intuitive interface
- **Error Handling**: Clear error messages and validation

## 📦 Project Structure

```
claude-prompt-engine/
├── server.js                 # Express server
├── index.js                  # CLI entry point
├── core/
│   ├── generator.js         # Prompt engine with validation
│   └── templates.js         # 8 prompt templates
├── memory/
│   ├── memory.js            # Memory management (search, filter, stats)
│   └── context.js           # Context builder
├── commands/
│   ├── generate.js          # Generate command (CLI)
│   ├── list.js              # List command
│   ├── memory.js            # Memory commands
│   └── help.js              # Help system
├── public/
│   └── index.html           # Web UI (complete frontend)
└── memory.json              # Persistent memory storage
```

## 🛠️ Technology Stack

- **Backend**: Node.js (native http module, no dependencies)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: JSON file (memory.json)
- **Architecture**: REST API

## 💡 Tips

1. **Copy Prompts**: Click "Copy to Clipboard" button after generating
2. **Search**: Use keywords to find related prompts
3. **Constraints**: Add comma-separated constraints for specific needs
4. **History**: Automatic save means you can reference past prompts
5. **Refresh Stats**: Stats auto-update every 10 seconds

## 🔄 Both Interfaces Work Together

- CLI generates prompts → saved to memory
- Web interface reads same memory
- Both can search and manage history
- Seamless integration!

## 🎯 Example Workflows

### Web Workflow
1. Visit http://localhost:3000
2. Select template type
3. Enter language and task
4. Click "Generate Prompt"
5. Copy result to clipboard
6. Check history for past prompts

### CLI Workflow
1. Run: `node index.js help`
2. Run: `node index.js list templates`
3. Run: `node index.js generate --type testing --lang Python --task "..."`
4. Run: `node index.js memory search "API"`

