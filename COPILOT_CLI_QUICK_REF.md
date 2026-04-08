# Quick Reference - GitHub Copilot CLI Integration

## 🚀 Quick Start (2 minutes)

### 1. Install GitHub CLI
```bash
brew install gh  # or apt-get install gh
```

### 2. Link Your Account
```bash
gh auth login
gh extension install github/gh-copilot
```

### 3. Access the Web Interface
```
http://localhost:3000
```

### 4. Go to "🚀 Copilot CLI" Tab

---

## 📋 Features Overview

| Feature | Purpose | Time | Result |
|---------|---------|------|--------|
| **CLI Status** | Check if Copilot is installed | 10s | Status report |
| **Install Script** | Auto-generate setup scripts | 30s | Ready-to-run script |
| **Prompt Test** | Validate your prompts | 15s | Test results & tips |
| **CI/CD Workflow** | Generate GitHub Actions | 20s | Ready-to-deploy workflow |

---

## 🔧 Install Scripts Generator

### Platforms Available

```
📦 Node.js      → npm, dependencies, project structure
🐍 Python       → venv, pip, requirements
🌐 LAMP         → Apache, PHP, MySQL setup
🐳 Docker       → Containerized environment
🔧 Full-Stack   → Node.js + React + Docker
```

### Usage
1. Click platform button
2. Download script
3. Run: `bash install-*.sh`

**Includes:**
- ✓ Project structure
- ✓ Dependencies setup
- ✓ GitHub Actions workflow
- ✓ Configuration files
- ✓ Error handling

---

## ✅ Prompt Testing

### How It Works
```
Your Prompt
    ↓
Test Endpoint
    ↓
Analysis
    ↓
Recommendations
```

### Example
```json
{
  "status": "success",
  "prompt": "Create a REST API",
  "recommendations": [
    "Add error handling",
    "Include type definitions",
    "Add unit tests"
  ]
}
```

---

## 🔄 GitHub Actions Workflows

### Available Workflows

**Node.js CI/CD**
```yaml
Triggers: [push, pull_request]
Runs: lint, test, build
Node: 18+
```

**Python CI/CD**
```yaml
Triggers: [push, pull_request]
Runs: test, coverage
Python: 3.9+
```

**LAMP CI/CD**
```yaml
Triggers: [push, pull_request]
Runs: test, deploy
PHP: 8.0+
```

### Deploy Workflow
```bash
1. Click workflow type
2. Copy YAML
3. Create .github/workflows/ci.yml
4. Paste content
5. Push to repository
```

---

## 📡 API Endpoints

### Status
```bash
GET /api/copilot/status
```
Returns: CLI status and version

### Generate Script
```bash
POST /api/copilot/install-script
Body: {"platform": "nodejs"}
```
Returns: Installation script

### Test Prompt
```bash
POST /api/copilot/test-prompt
Body: {"prompt": "...", "model": "Claude"}
```
Returns: Test results

### Create Workflow
```bash
POST /api/copilot/github-workflow
Body: {"projectType": "nodejs"}
```
Returns: GitHub Actions YAML

---

## 💡 Tips & Tricks

### Faster Setup
```bash
# Use full-stack for complete setup
# Includes frontend, backend, Docker
```

### Better Prompts
```
✓ Be specific
✓ Include examples
✓ Specify output format
✓ Set constraints
```

### Workflow Tips
```
✓ Cache dependencies
✓ Parallelize tests
✓ Skip on docs changes
✓ Use matrix builds
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| CLI not found | `brew install gh` |
| Permission denied | `chmod +x script.sh` |
| Workflow not running | Check `.github/workflows/` |
| Script fails | Review error, check permissions |

---

## 📊 Example Workflow

### Scenario: Launch Python Project

**Time: ~5 minutes**

```
1. Click 🐍 Python button          (10s)
2. Download install script          (5s)
3. Run: bash install-python.sh      (2 min)
4. Click Python CI/CD workflow      (5s)
5. Copy & create .github/workflows  (10s)
6. Commit & push                    (10s)
7. ✅ Project ready with CI/CD
```

---

## 🔐 Security Checklist

- [ ] Never commit secrets
- [ ] Use GitHub Secrets for keys
- [ ] Validate all inputs
- [ ] Review scripts before running
- [ ] Use minimal permissions
- [ ] Keep dependencies updated
- [ ] Monitor workflow logs

---

## ⚡ Performance Settings

### For Faster Workflows
```yaml
# Cache dependencies
- uses: actions/cache@v2
  with:
    path: node_modules
    key: ${{ hashFiles('package.json') }}

# Parallelize tests
strategy:
  matrix:
    node-version: [16, 18, 20]
```

---

## 🎯 Best Practices

1. **Test Locally First**
   - Run script in local environment
   - Verify output before committing

2. **Use Version Control**
   - Commit workflows to git
   - Tag releases
   - Use branches for testing

3. **Monitor Continuously**
   - Check GitHub Actions tab
   - Review logs regularly
   - Set up notifications

4. **Update Regularly**
   - Keep actions updated
   - Update dependencies
   - Security patches

---

## 📚 Documentation

Full guides available:
- `COPILOT_CLI_GUIDE.md` - Complete reference
- `README.md` - Project overview
- `QUICK_START.md` - Getting started
- `USER_MANUAL.md` - Detailed usage

---

## 🆘 Troubleshooting Flowchart

```
Issue with CLI?
├─ Not installed?
│  └─ Run: brew install gh
├─ Not authenticated?
│  └─ Run: gh auth login
└─ Extension missing?
   └─ Run: gh extension install github/gh-copilot

Script fails?
├─ Permission error?
│  └─ chmod +x script.sh
├─ Command not found?
│  └─ Check PATH environment
└─ Other error?
   └─ Read script output carefully

Workflow won't run?
├─ Not in .github/workflows/?
│  └─ Create correct directory
├─ Syntax error?
│  └─ Validate YAML
└─ Workflow disabled?
   └─ Enable in repo settings
```

---

## 🚀 Next Steps

1. **Install GitHub CLI** - `brew install gh`
2. **Link Account** - `gh auth login`
3. **Access Interface** - `http://localhost:3000`
4. **Choose Platform** - Pick your tech stack
5. **Run Script** - Execute generated setup
6. **Deploy Workflow** - Automate your CI/CD

---

## 📞 Support Resources

| Resource | URL |
|----------|-----|
| GitHub CLI | https://cli.github.com |
| Copilot CLI | https://github.com/github/gh-copilot |
| GitHub Actions | https://docs.github.com/actions |
| Issues | https://github.com/cli/cli/issues |

---

## 📈 What You Get

✅ Automated environment setup  
✅ Pre-configured CI/CD pipelines  
✅ Best practices included  
✅ Multi-platform support  
✅ Zero configuration needed  
✅ Production-ready scripts  

---

## 🎉 You're All Set!

**Start using GitHub Copilot CLI integration now:**

1. Open http://localhost:3000
2. Click "🚀 Copilot CLI" tab
3. Choose your platform
4. Download and run script
5. Your environment is ready! 🚀

---

**Version 1.0** | Created with GitHub Copilot | Updated: 2024
