# 🚀 Claude Prompt Engine - User Manual

## Table of Contents
1. [Quick Start](#quick-start)
2. [Feature Overview](#feature-overview)
3. [Getting Started](#getting-started)
4. [Advanced Usage](#advanced-usage)
5. [Tips & Tricks](#tips--tricks)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Installation & Running
```bash
# Install dependencies
npm install

# Start the web server
npm run web

# Open browser
http://localhost:3000
```

### 2. Generate Your First Prompt
1. Select a **Language Model** (Claude, GPT-4, etc.)
2. Choose your **Programming Language** (JavaScript, Python, etc.)
3. Pick your **Skill Level** (Beginner, Intermediate, Advanced)
4. Select your **Project Purpose** (Web App, API, Mobile App, etc.)
5. Choose a **Prompt Type** (Coding, Debugging, Testing, etc.)
6. Enter your **Task Description**
7. Click **GENERATE PROMPT**

---

## Feature Overview

### 🤖 Language Models
Choose the AI model you'll be using your prompts with:
- **Claude** - Anthropic's advanced reasoning model
- **GPT-4** - OpenAI's latest powerful model
- **GPT-3.5** - OpenAI's faster, cost-effective model
- **Llama** - Meta's open-source model
- **Mistral** - Mistral's efficient model
- **Gemini** - Google's multimodal model

*The engine optimizes prompts specifically for each model's strengths and capabilities.*

### 💻 Programming Languages
Supported languages include:
- JavaScript/TypeScript
- Python
- Go
- Rust
- Java
- C++/C#
- PHP
- Ruby
- Kotlin
- Swift
- And more...

### 🎯 Skill Levels
Adjust complexity based on expertise:
- **Beginner** - Simple, well-explained code with comments
- **Intermediate** - Professional code following best practices
- **Advanced** - Optimized, production-ready with advanced patterns

### 🎪 Project Purposes
Define what you're building:
- **📱 Mobile App** - iOS/Android applications
- **🌐 Web Application** - Web apps and websites
- **💻 Desktop Software** - Electron, native desktop apps
- **🔌 REST/GraphQL API** - Backend services
- **⌨️ Command Line Tool** - CLI utilities and tools
- **📦 Library/Package** - Reusable code modules
- **⚙️ Configuration File** - Config, YAML, JSON files
- **🗄️ Database Schema** - Database design and migrations
- **📚 Documentation** - Technical documentation
- **🤖 Automation Script** - Scripts for automation

### 📝 Prompt Types

#### 🔧 Coding
Generate production-ready code from scratch.
- **Use for:** New features, prototypes, complete implementations
- **Output:** Full, executable code with comments

#### 🐛 Debugging
Fix existing code and resolve issues.
- **Use for:** Bug fixes, error resolution, troubleshooting
- **Output:** Debugged code with explanations of the fix

#### ♻️ Refactor
Improve existing code quality and maintainability.
- **Use for:** Code cleanup, optimization, design improvements
- **Output:** Refactored code with better structure

#### 🧪 Testing
Write comprehensive test cases and suites.
- **Use for:** Unit tests, integration tests, test coverage
- **Output:** Complete test code with multiple scenarios

#### 📖 Documentation
Create technical documentation and guides.
- **Use for:** API docs, README files, code documentation
- **Output:** Well-formatted markdown documentation

#### 🏗️ Architecture
Design system architecture and components.
- **Use for:** System design, architecture planning, scalability
- **Output:** Architecture diagrams and implementation recommendations

#### 👁️ Code Review
Review code for issues and improvements.
- **Use for:** Quality assurance, peer review, best practices
- **Output:** Detailed review with suggestions and ratings

#### ⚡ Optimization
Boost performance and efficiency.
- **Use for:** Performance tuning, memory optimization, speed improvements
- **Output:** Optimized code with performance comparisons

---

## Getting Started

### Step 1: Select Your Environment

**Choose Language Model:**
- Click on your target AI model in the "Language Model" section
- This optimizes the prompt format for that specific model

**Choose Programming Language:**
- Select your preferred language
- The generated code will be written in this language

**Choose Skill Level:**
- Beginner: More explanation and comments
- Intermediate: Professional-grade code
- Advanced: Optimized, production-level code

### Step 2: Define Your Project

**Select Project Purpose:**
- Click on the purpose that matches your project type
- This shapes the entire approach and recommendations

**Choose Prompt Type:**
- Select what you want to achieve (Coding, Testing, Debugging, etc.)

### Step 3: Describe Your Task

**Write Task Description:**
```
Example for Web App:
"Create a React component for user authentication with email/password login, 
remember me functionality, and error handling for invalid credentials."
```

**Add Constraints (Optional):**
```
Example constraints:
- Must use TypeScript
- Include form validation
- Support dark mode
- Responsive design
```

### Step 4: Generate

Click **GENERATE PROMPT** to create your optimized prompt.

---

## Advanced Usage

### Using with Language Models

#### With Claude (Claude API)
```python
import anthropic

prompt = # Your generated prompt from the engine

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=2048,
    messages=[
        {"role": "user", "content": prompt}
    ]
)
```

#### With OpenAI (GPT-4)
```python
import openai

prompt = # Your generated prompt

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful coding assistant"},
        {"role": "user", "content": prompt}
    ]
)
```

#### With Open Source Models (Ollama)
```bash
# Install Ollama and a model
ollama pull llama2

# Use the generated prompt
ollama run llama2 "<your-generated-prompt>"
```

### Creating Complex Prompts

**Multi-step approach:**
1. Start with Coding to generate initial structure
2. Use Code Review to validate the approach
3. Use Testing to ensure comprehensive coverage
4. Use Optimization to improve performance

**Iterative refinement:**
1. Generate base prompt
2. Copy and modify for specific variations
3. Run multiple times with different parameters
4. Combine best results

### Memory & History

- All generated prompts are saved automatically
- View recent generations in the **History** tab
- Check statistics in the **Statistics** tab
- Clear history anytime with the **Clear History** button

---

## Tips & Tricks

### 💡 Best Practices for Better Results

1. **Be Specific in Task Description**
   - ❌ "Create a login feature"
   - ✅ "Create a React login component with email/password validation, JWT tokens, and 2FA support"

2. **Use Constraints Strategically**
   - Add must-have requirements
   - Specify technology preferences
   - Include deployment constraints

3. **Start with Intermediate Level**
   - Most production code is intermediate+
   - Adjust up/down based on results

4. **Choose the Right Purpose**
   - Mobile app vs web app have different considerations
   - API needs different approach than desktop software
   - Purpose shapes performance and design requirements

5. **Leverage Prompt Types**
   - Use "Coding" for new features
   - Use "Testing" for every new feature
   - Use "Code Review" before deployment
   - Use "Optimization" for performance-critical code

### 🎯 Example Workflows

**Complete Feature Development:**
1. Use "Coding" to generate the feature
2. Use "Testing" to generate test cases
3. Use "Code Review" to validate quality
4. Use "Documentation" to create guides

**Debugging Complex Issues:**
1. Describe the issue with Debugging prompt type
2. Use Code Review to check for edge cases
3. Generate tests to prevent regression
4. Optimize if performance was the root cause

**Learning & Exploration:**
1. Set level to "Beginner"
2. Use "Documentation" to understand concepts
3. Generate "Coding" examples
4. Gradually increase level as you learn

---

## Troubleshooting

### ❌ "Please enter a task description"
**Solution:** The task field is required. Add a detailed description of what you want to accomplish.

### ❌ "Generation failed"
**Solution:** 
- Check your internet connection
- Try refreshing the page
- Clear browser cache and try again
- Ensure the server is running

### ❌ Prompts not being saved
**Solution:**
- Check browser localStorage settings
- Ensure cookies are enabled
- Restart the server: `npm run web`

### ❌ Server won't start
**Solution:**
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Or specify a different port
PORT=3001 npm run web
```

### ⚠️ History is empty even after generating
**Solution:**
- Check the memory.json file exists in /memory folder
- Ensure write permissions in the directory
- Try clearing and regenerating a prompt

---

## API Reference

### REST Endpoints

#### Get Templates
```
GET /api/templates
Response: [{type, description}, ...]
```

#### Get Models
```
GET /api/models
Response: [model1, model2, ...]
```

#### Get Purposes
```
GET /api/purposes
Response: [{id, label}, ...]
```

#### Generate Prompt
```
POST /api/generate
Body: {
  type: string,
  language: string,
  task: string,
  constraints: array,
  level: string,
  model: string,
  purpose: string
}
Response: {success: true, prompt: string}
```

#### Get History
```
GET /api/history
Response: [entry1, entry2, ...]
```

#### Get Statistics
```
GET /api/stats
Response: {totalEntries, typeCount, languageCount}
```

#### Clear Memory
```
POST /api/memory/clear
Response: {success: true, cleared: number}
```

---

## Performance Tips

- **Shorter tasks** = Faster generation
- **Specific constraints** = Better targeted results
- **Matching model** = More relevant code structure
- **Correct purpose** = Better architectural suggestions

---

## Keyboard Shortcuts

- `Ctrl+Enter` - Generate prompt (coming soon)
- `Ctrl+C` - Copy output (use button for now)

---

## Support & Contributing

- **Issues?** Check the troubleshooting section
- **Suggestions?** Create an issue on GitHub
- **Want to contribute?** Submit a pull request

---

## Version Information

- **Prompt Engine Version:** 2.0
- **Last Updated:** April 2026
- **License:** MIT

---

## Quick Reference Card

| Purpose | Best Type | Level | Use Case |
|---------|-----------|-------|----------|
| New Feature | Coding | Intermediate | Building from scratch |
| Fix Bug | Debugging | Your Level | Resolving issues |
| Code Quality | Refactor | Advanced | Improving existing code |
| Ensure Quality | Testing | Intermediate | Writing test suites |
| Share Knowledge | Documentation | Beginner | Creating guides |
| Plan Implementation | Architecture | Advanced | System design |
| Before Deployment | Code Review | Your Level | Final check |
| Speed Issues | Optimization | Advanced | Performance tuning |

---

**Happy prompting! 🚀✨**
