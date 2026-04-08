# 🚀 Claude Prompt Engine - Quick Start Guide

## 📦 Installation

```bash
# Navigate to project directory
cd /home/rick/claude-prompt-engine

# Install dependencies (if not already installed)
npm install
```

## 🎯 Running the Application

### Option 1: Default Port (3000)
```bash
npm run web
```
Then open your browser to: **http://localhost:3000**

### Option 2: Custom Port
```bash
PORT=3001 npm run web
```
Then open: **http://localhost:3001**

### Option 3: Run with Environment Variables
```bash
NODE_ENV=production npm run web
```

## ✨ Using the Web Interface

### The Dashboard Layout

**LEFT SIDE - Configuration Options:**
- 🤖 **Language Model Selection** - Choose Claude, GPT-4, GPT-3.5, Llama, Mistral, or Gemini
- 💻 **Programming Language** - Select from 12+ languages (JavaScript, Python, Go, Rust, etc.)
- 🎯 **Skill Level** - Beginner, Intermediate, or Advanced
- 📝 **Prompt Type** - Coding, Debugging, Testing, Refactoring, Documentation, Architecture, Code Review, or Optimization

**RIGHT SIDE - Task Definition:**
- 🎪 **Project Purpose** - Choose what you're building (Web App, API, Mobile App, Desktop Software, etc.)
- ✍️ **Task Description** - Describe your project in detail
- ⚙️ **Constraints** (Optional) - Add specific requirements or preferences

**BOTTOM - Output & Management:**
- 📤 **Generated Prompt** - View your created prompt
- 📚 **History Tab** - See all previously generated prompts
- 📊 **Statistics Tab** - Track usage patterns
- 📖 **Guide Tab** - In-app help and documentation

## 🔧 Step-by-Step: Generate Your First Prompt

### Example: Creating a React Chat App

1. **Start the server:**
   ```bash
   npm run web
   ```
   Open http://localhost:3000

2. **Select Language Model:**
   - Click on **Claude** (recommended for coding)

3. **Choose Programming Language:**
   - Click on **JavaScript** (or TypeScript for type safety)

4. **Select Skill Level:**
   - Choose **Intermediate** (good balance of detail and efficiency)

5. **Pick Project Purpose:**
   - Click on **🌐 Web Application**

6. **Select Prompt Type:**
   - Click on **Coding**

7. **Describe Your Task:**
   ```
   Create a React chat component that:
   - Displays messages in a scrollable list
   - Has a message input field with send button
   - Shows user avatars and timestamps
   - Implements real-time message updates with WebSocket
   - Supports emoji picker
   - Has typing indicators
   ```

8. **Add Optional Constraints:**
   ```
   - Must use TypeScript for type safety
   - Include error handling and loading states
   - Make it mobile responsive
   - Support dark mode
   - Use React Hooks (no class components)
   ```

9. **Click "🚀 GENERATE PROMPT"**

10. **View the Result:**
    - Your optimized prompt appears below
    - Click **"📋 COPY TO CLIPBOARD"** to copy it
    - Use it with Claude or your chosen LLM

## 🎨 UI Features Explained

### Multi-Select Buttons
- Click any button to toggle selection
- Selected buttons show a **glowing blue border** and neon effect
- Multiple selections are supported for same-level options

### Responsive Design
- Works on desktop, tablet, and mobile
- Adapts layout for smaller screens
- Touch-friendly on mobile devices

### Real-time Feedback
- ✅ Success messages in cyan
- ❌ Error messages in pink/magenta
- ℹ️ Info messages in light blue
- Auto-dismisses non-error messages after 4 seconds

### History Management
- Automatically saves all generated prompts
- View metadata (type, language, timestamp)
- Click items to re-use them (coming soon)
- Clear entire history with one click

### Statistics Tracking
- **Total Prompts** - Count of all generations
- **Top Type** - Most frequently used prompt type
- **Top Language** - Most commonly selected language

## 🔗 Using Generated Prompts

### With Claude (Recommended)
```python
import anthropic

prompt = """[Your generated prompt from the engine]"""

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=2048,
    messages=[{"role": "user", "content": prompt}]
)
print(response.content[0].text)
```

### With GPT-4
```python
import openai

prompt = """[Your generated prompt from the engine]"""

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are an expert coding assistant"},
        {"role": "user", "content": prompt}
    ]
)
print(response.choices[0].message.content)
```

### With Ollama (Local Models)
```bash
# Install Ollama: https://ollama.ai

# Pull a model
ollama pull mistral

# Use your prompt
ollama run mistral "[Your generated prompt from the engine]"
```

## 📊 API Endpoints

The web server also exposes REST APIs for programmatic access:

```bash
# Get available models
curl http://localhost:3000/api/models

# Get available purposes
curl http://localhost:3000/api/purposes

# Get available templates
curl http://localhost:3000/api/templates

# Generate a prompt (POST)
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "type": "coding",
    "language": "Python",
    "task": "Create a REST API",
    "model": "Claude",
    "purpose": "api",
    "level": "intermediate"
  }'

# Get generation history
curl http://localhost:3000/api/history

# Get statistics
curl http://localhost:3000/api/stats

# Clear memory
curl -X POST http://localhost:3000/api/memory/clear
```

## 🎯 Pro Tips

### For Best Results:
1. **Be Specific** - "Create a login form" → "Create a secure login form with email/password, remember-me, and 2FA"
2. **Use Constraints** - Let the engine know your preferences upfront
3. **Match Purpose** - Choose the correct purpose for accurate suggestions
4. **Appropriate Level** - Use Advanced for production code, Beginner for learning

### Workflow Examples:

**Feature Development:**
1. Generate with "Coding" type
2. Generate with "Testing" type for test cases
3. Generate with "Code Review" type for validation
4. Use "Documentation" for guides

**Bug Fixing:**
1. Generate with "Debugging" type
2. Use "Code Review" to check solution quality
3. Generate with "Testing" to prevent regression

**Learning Path:**
1. Start with "Beginner" level
2. Use "Documentation" to understand
3. Generate "Coding" examples
4. Gradually increase level

## 🐛 Troubleshooting

### Server Won't Start
```bash
# Check if port is already in use
lsof -i :3000

# Use a different port
PORT=3001 npm run web

# Or kill the existing process (if it's yours)
kill <PID>
```

### History Not Saving
```bash
# Check memory file permissions
ls -la memory/memory.json

# Make sure directory is writable
chmod 755 memory/
```

### Prompts Not Generating
- Ensure task description is filled in
- Check browser console (F12) for errors
- Try refreshing the page
- Clear browser cache

### UI Not Loading Properly
- Ensure styles.css is being served
- Check network tab (F12) for missing files
- Try a different browser
- Clear browser cache and cookies

## 📚 File Structure

```
claude-prompt-engine/
├── public/
│   ├── index.html          # Main web interface
│   ├── styles.css          # Futuristic styling
│   └── app.js              # Client-side logic
├── core/
│   ├── generator.js        # Prompt generation engine
│   └── templates.js        # Prompt templates
├── memory/
│   ├── memory.js           # Memory management
│   └── memory.json         # Stored prompts
├── commands/
│   ├── generate.js         # CLI generation
│   ├── list.js             # List command
│   └── memory.js           # Memory command
├── server.js               # Web server
├── index.js                # CLI entry point
├── package.json            # Dependencies
├── USER_MANUAL.md          # Full documentation
└── QUICK_START.md          # This file
```

## 🚀 Next Steps

1. **Try generating prompts** for your projects
2. **Copy and use** the generated prompts with your LLM
3. **Check history** to see your generated prompts
4. **Review statistics** to understand your usage patterns
5. **Read the full manual** (USER_MANUAL.md) for advanced features

## 📞 Support

- **Documentation:** See USER_MANUAL.md for comprehensive guide
- **Server Issues:** Check server logs
- **Browser Issues:** Check browser console (F12)
- **API Issues:** Check network tab and response codes

---

**Happy Prompting! 🎨✨**

Start at http://localhost:3000 and create amazing prompts!
