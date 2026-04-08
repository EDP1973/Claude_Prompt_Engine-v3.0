# Claude Prompt Engine v2.0

## 🌟 Overview

Claude Prompt Engine is a **futuristic AI-powered prompt generation tool** with a beautiful web interface. It helps developers create optimized prompts for multiple LLMs (Claude, GPT-4, Llama, etc.) with support for 12+ programming languages and diverse project types.

### ✨ Key Features

- 🤖 **Multi-Model Support** - Optimize prompts for Claude, GPT-4, GPT-3.5, Llama, Mistral, Gemini
- 💻 **12+ Languages** - JavaScript, Python, TypeScript, Go, Rust, Java, C++, C#, PHP, Ruby, Kotlin, Swift
- 🎯 **Smart Filtering** - Choose by skill level (Beginner/Intermediate/Advanced) and purpose
- 🎨 **Modern UI** - Futuristic glassmorphic design with smooth animations
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- 🎪 **10 Project Types** - Mobile App, Web App, API, CLI Tool, Library, Config, Database, Docs, Automation
- 📝 **8 Prompt Types** - Coding, Debugging, Testing, Refactoring, Documentation, Architecture, Review, Optimization
- 💾 **Memory System** - Automatic history and statistics tracking
- ⚙️ **REST API** - Programmatic access to all features

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Run Web Server
```bash
npm run web
```

### 3. Open Browser
```
http://localhost:3000
```

### 4. Generate Your First Prompt!

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute getting started guide with examples
- **[USER_MANUAL.md](./USER_MANUAL.md)** - Comprehensive documentation with advanced features

---

## 💡 How It Works

### Web Interface
1. Select your **Language Model** (Claude, GPT-4, etc.)
2. Choose your **Programming Language** (JavaScript, Python, etc.)
3. Pick your **Skill Level** (Beginner/Intermediate/Advanced)
4. Select your **Project Purpose** (Web App, API, Mobile App, etc.)
5. Choose a **Prompt Type** (Coding, Testing, Documentation, etc.)
6. Describe your **Task** in detail
7. Add optional **Constraints**
8. Click **GENERATE PROMPT**
9. Copy and use with your LLM!

### Project Purposes
- 📱 **Mobile App** - iOS/Android applications
- 🌐 **Web Application** - Websites and web apps
- 💻 **Desktop Software** - Electron, native apps
- 🔌 **REST/GraphQL API** - Backend services
- ⌨️ **Command Line Tool** - CLI utilities
- 📦 **Library/Package** - Reusable modules
- ⚙️ **Configuration File** - Config and setup files
- 🗄️ **Database Schema** - Database design
- 📚 **Documentation** - Technical guides
- 🤖 **Automation Script** - Automation tools

### Prompt Types
| Type | Purpose | Best For |
|------|---------|----------|
| 🔧 **Coding** | Generate new code | Building features from scratch |
| 🐛 **Debugging** | Fix bugs and issues | Resolving problems |
| ♻️ **Refactor** | Improve code quality | Cleaning up existing code |
| 🧪 **Testing** | Write test cases | Ensuring quality |
| 📖 **Documentation** | Create docs | Sharing knowledge |
| 🏗️ **Architecture** | Design systems | Planning structure |
| 👁️ **Code Review** | Review for issues | Quality assurance |
| ⚡ **Optimization** | Boost performance | Speed improvements |

---

## 🎯 Usage Examples

### Example 1: Create a React Component
```
Model: Claude
Language: JavaScript
Level: Intermediate
Purpose: Web Application
Type: Coding
Task: "Create a reusable React notification component with support for different types (success, error, warning, info), auto-dismiss timer, and animation"
```

### Example 2: Fix a Bug
```
Model: GPT-4
Language: Python
Level: Advanced
Purpose: API
Type: Debugging
Task: "Fix the async/await issue in our FastAPI endpoint that's causing race conditions when processing concurrent requests"
```

### Example 3: Write Tests
```
Model: Claude
Language: TypeScript
Level: Intermediate
Purpose: Library
Type: Testing
Task: "Write comprehensive unit tests for a JSON parsing utility that handles edge cases like empty strings, null values, and malformed JSON"
```

---

## 🛠️ API Reference

### REST Endpoints

```bash
# Get all language models
GET /api/models
# Response: ["Claude", "GPT-4", "GPT-3.5", ...]

# Get all project purposes
GET /api/purposes
# Response: [{id: "web-app", label: "🌐 Web Application"}, ...]

# Get all prompt templates
GET /api/templates
# Response: [{type: "coding", description: "..."}, ...]

# Generate a prompt
POST /api/generate
# Body: {type, language, task, constraints, level, model, purpose}
# Response: {success: true, prompt: "..."}

# Get generation history
GET /api/history
# Response: [{type, language, task, timestamp, model, purpose}, ...]

# Get statistics
GET /api/stats
# Response: {totalEntries, typeCount, languageCount}

# Clear memory
POST /api/memory/clear
# Response: {success: true, cleared: <count>}
```

### Example API Call
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "coding",
    "language": "Python",
    "task": "Create a web scraper for product data",
    "constraints": ["Use BeautifulSoup", "Handle errors gracefully"],
    "level": "intermediate",
    "model": "Claude",
    "purpose": "cli-tool"
  }'
```

---

## 📊 Features in Detail

### 🎨 Futuristic Design
- **Glassmorphic UI** - Frosted glass effect cards
- **Neon Accents** - Cyan and pink neon glows
- **Smooth Animations** - Fluid transitions and micro-interactions
- **Dark Theme** - Easy on the eyes, modern aesthetic
- **Responsive Layout** - Adapts to all screen sizes

### 💾 Memory System
- **Automatic Saving** - All prompts saved to memory.json
- **History Tracking** - View past generations
- **Statistics** - Track usage patterns
- **File Locking** - Prevents concurrent write issues
- **Error Recovery** - Gracefully handles corrupted files

### ⚙️ Production Ready
- **Request Size Limits** - Prevents DoS attacks
- **Error Handling** - Comprehensive error recovery
- **Input Validation** - All inputs validated
- **Concurrent Access** - Thread-safe memory operations
- **Performance Optimized** - Efficient array operations

### 🔐 Security
- **Body Size Limits** - 1MB max request size
- **Input Validation** - All parameters validated
- **Error Messages** - No sensitive info exposed
- **CORS Support** - Cross-origin requests enabled

---

## 🖥️ System Requirements

- **Node.js** 14+ (recommended 16+)
- **npm** 6+ or **yarn**
- **Modern Browser** (Chrome, Firefox, Safari, Edge)
- **RAM** - 256MB minimum
- **Disk** - 100MB for dependencies and history

---

## 📦 Installation

### From GitHub
```bash
git clone https://github.com/yourusername/claude-prompt-engine.git
cd claude-prompt-engine
npm install
```

### Manual
1. Download or clone this repository
2. Extract to desired location
3. Run: `npm install`
4. Run: `npm run web`

---

## 🚀 Running the Application

### Web Server (Recommended)
```bash
# Default port 3000
npm run web

# Custom port
PORT=3001 npm run web

# Production mode
NODE_ENV=production npm run web
```

### CLI Mode
```bash
# Generate prompt from command line
npm run cli -- generate --type coding --lang JavaScript --task "Create a counter"

# List templates
npm run cli -- list templates

# View memory
npm run cli -- memory

# Search memory
npm run cli -- memory search "API"
```

---

## 📚 File Structure

```
claude-prompt-engine/
├── public/
│   ├── index.html              # Main web interface (futuristic UI)
│   ├── styles.css              # Modern glassmorphic styling
│   └── app.js                  # Interactive web client logic
├── core/
│   ├── generator.js            # Prompt generation engine (enhanced)
│   ├── templates.js            # Prompt templates with LLM/purpose support
│   └── context.js              # Context building from memory
├── memory/
│   ├── memory.js               # Memory management (with file locking)
│   ├── memory.json             # Persistent prompt history
│   └── memory.lock             # Concurrency lock file
├── commands/
│   ├── generate.js             # CLI generate command (improved)
│   ├── list.js                 # CLI list command
│   ├── memory.js               # CLI memory management (robust parsing)
│   └── help.js                 # CLI help
├── server.js                   # Web server with new endpoints
├── index.js                    # CLI entry point
├── package.json                # Dependencies
├── USER_MANUAL.md              # Full documentation (10K words)
├── QUICK_START.md              # Quick start guide
├── README.md                   # This file
└── VERSION.txt                 # Version info
```

---

## 🔄 Development

### Available Commands

```bash
# Start web server
npm run web

# Run CLI
npm run cli -- [command]

# Install dependencies
npm install

# View version
cat package.json | grep version
```

### Project Structure
- **Frontend:** Pure HTML/CSS/JavaScript (no frameworks)
- **Backend:** Node.js HTTP server
- **Memory:** JSON file with simple file locking
- **CLI:** Node.js command-line interface

---

## 📋 Supported Languages

JavaScript, Python, TypeScript, Go, Rust, Java, C++, C#, PHP, Ruby, Kotlin, Swift, and more!

---

## 🤖 Supported Models

- **Claude** - Anthropic's reasoning-focused model
- **GPT-4** - OpenAI's most capable model
- **GPT-3.5** - OpenAI's fast and efficient model
- **Llama** - Meta's open-source model
- **Mistral** - Mistral's optimized model
- **Gemini** - Google's multimodal model

---

## 🎓 Learning Resources

1. **Quick Start** - See QUICK_START.md for 5-minute guide
2. **Full Manual** - See USER_MANUAL.md for comprehensive documentation
3. **In-App Guide** - Visit the "Guide" tab in the web interface
4. **Examples** - Check the "History" tab for previously generated prompts

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use a different port
PORT=3001 npm run web

# Or find and kill existing process
lsof -i :3000
kill <PID>
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### History Not Saving
```bash
# Check permissions
chmod 755 memory/
chmod 644 memory/memory.json

# Or delete and let it recreate
rm memory/memory.json
```

### Browser Shows Blank Page
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear cache: Open DevTools → Application → Clear storage
- Try different browser

---

## 🎯 Version History

### v2.0 (Current)
- ✨ Futuristic web UI with glassmorphic design
- 🤖 Multi-LLM support with model-specific optimization
- 🎪 10 project purposes with tailored suggestions
- 📊 Built-in statistics and history tracking
- 🔐 Enhanced security with request limits
- 🚀 REST API for programmatic access
- 💾 Concurrent write protection with file locking

### v1.1
- Basic web interface
- CLI commands
- Memory management

### v1.0
- Initial release

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues and enhancement requests.

---

## 📞 Support

- 📖 Full documentation in USER_MANUAL.md
- 🚀 Quick start guide in QUICK_START.md
- 💬 In-app help in the "Guide" tab
- 🔗 API documentation above

---

## ✨ Features Showcase

### Intelligent Prompt Generation
The engine analyzes your selections and generates contextually optimized prompts tailored to:
- Your chosen LLM's strengths and capabilities
- Your project's requirements and constraints
- Your skill level and experience
- Best practices for your programming language
- Industry standards for your project type

### Real-time Analytics
Track your usage with built-in statistics:
- Total prompts generated
- Most used prompt types
- Preferred programming languages
- Model usage patterns

### Seamless Integration
Use generated prompts with:
- Claude API
- OpenAI API (GPT-4, GPT-3.5)
- Ollama (local models)
- Any LLM via copy-paste

---

## 🎉 Get Started Now!

```bash
# 1. Install
npm install

# 2. Run
npm run web

# 3. Open
http://localhost:3000

# 4. Generate amazing prompts! 🚀
```

---

**Built with ❤️ for developers who love AI**

Happy Prompting! ✨
