# GitHub Copilot Account Linking Guide

## 🔗 Link Your GitHub Account

### Quick Setup (2 minutes)

#### Step 1: Install GitHub CLI

**macOS (using Homebrew):**
```bash
brew install gh
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install gh
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install gh
```

**Windows (using Chocolatey):**
```bash
choco install gh
```

#### Step 2: Authenticate with GitHub

```bash
gh auth login
```

This will prompt you to:
1. Select "GitHub.com"
2. Choose authentication protocol (HTTPS or SSH)
3. Paste your authentication token or use browser authentication
4. Authorize the CLI

#### Step 3: Install Copilot Extension

```bash
gh extension install github/gh-copilot
```

#### Step 4: Verify Installation

```bash
gh copilot status
```

### ✅ What You Get

Once linked, you can use these features from the web interface:

- **📦 Install Scripts** - Generate platform-specific setup scripts
  - Node.js (npm + dependencies)
  - Python (venv + pip)
  - LAMP (Apache + PHP + MySQL)
  - Docker (containerized)
  - Full-Stack (complete setup)

- **🧪 Prompt Testing** - Validate your prompts before use
  - Quality assessment
  - Improvement recommendations
  - Model compatibility check

- **🔄 CI/CD Workflows** - Create GitHub Actions pipelines
  - Node.js CI/CD
  - Python CI/CD
  - LAMP CI/CD

### 🎯 Using from Web Interface

1. **Open the web interface:**
   ```
   http://localhost:3000
   ```

2. **Click "🔗 Link Copilot Account" button** (top right)
   - Shows a beautiful modal with instructions
   - Provides direct links to GitHub CLI and GitHub login

3. **Complete GitHub CLI setup** using the terminal commands shown

4. **Go to "🚀 Copilot CLI" tab** to access features

### 🐛 Troubleshooting

#### "gh: command not found"
- Install GitHub CLI first: `brew install gh`
- Add to PATH if needed: `export PATH=$PATH:/usr/local/bin`

#### "gh copilot: command not found"
- Install the extension: `gh extension install github/gh-copilot`

#### "Not authenticated"
- Login: `gh auth login`
- Verify: `gh auth status`

#### "gh extension install fails"
- Update GitHub CLI: `gh upgrade`
- Try again: `gh extension install github/gh-copilot`

### 🔐 Security Notes

- Your credentials are stored locally in `~/.config/gh/`
- Each machine needs separate authentication
- You can revoke access anytime on GitHub.com settings
- Never share your authentication tokens

### 📚 Resources

- **GitHub CLI Documentation:** https://cli.github.com/
- **Copilot CLI Extension:** https://github.com/github/gh-copilot
- **GitHub Authentication:** https://docs.github.com/en/authentication

### 💡 Tips

1. **Install on multiple machines:**
   - Repeat the setup on each machine where you want to use it

2. **Use in CI/CD:**
   - Store `GH_TOKEN` as GitHub Actions secret
   - Reference it in workflows

3. **Check account details:**
   ```bash
   gh auth status
   ```

4. **Logout when done:**
   ```bash
   gh auth logout
   ```

### ✨ Next Steps

After linking:
1. Go to **🚀 Copilot CLI** tab
2. Click a platform button to generate install scripts
3. Download and run the script
4. Your environment is ready!

---

**Need help?** Check the main documentation files or GitHub issues.
