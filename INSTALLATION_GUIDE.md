# Claude Prompt Engine - Installation Guide

## 🚀 Quick Installation

Choose your operating system for the fastest setup:

### **Linux / WSL**
```bash
bash installers/install.sh
```

### **macOS**
```bash
bash installers/install-macos.sh
```

### **Windows (PowerShell)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\installers\install.ps1
```

---

## 🤖 iAI Setup (Optional but Recommended)

iAI is the built-in intelligent assistant. It works best with a GitHub token:

### 1. Get a GitHub Personal Access Token
1. Visit [github.com/settings/tokens](https://github.com/settings/tokens)
2. Create a **Fine-grained token** or **Classic token**
3. Enable the **"Copilot Requests"** scope (or `read:enterprise` for classic)

### 2. Set Environment Variables

**Linux / macOS:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
export OPENAI_API_KEY=sk-xxxx    # optional — enables TTS voice output
```

**Or use the `.env` file (created by the installer):**
```
GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxx
```

### 3. Verify iAI is Working
```bash
npm run web
# Visit http://localhost:3000/iai.html
# The engine badge should show "● GitHub Copilot API"
```

iAI works **without a token** too — it falls back to `gh copilot suggest` if `gh` CLI is authenticated.

---

## 📋 System Requirements

| OS | Node.js | npm | Git |
|---|---|---|---|
| Linux | 18+ | 9+ | Optional |
| macOS | 18+ | 9+ | Included |
| Windows | 18+ | 9+ | Optional |

---

## 🖥️ Detailed Installation

### Linux / WSL Installation

#### Prerequisites
```bash
# Update package manager
sudo apt-get update

# Check Node.js version
node --version
npm --version
```

#### Automatic Installation
```bash
# Download and run installer
bash installers/install.sh

# Follow interactive prompts:
# 1. Choose installation directory
# 2. Select installation type (full/development/production)
# 3. Configure systemd service (optional)
```

#### Manual Installation
```bash
# Create project directory
mkdir -p ~/claude-prompt-engine
cd ~/claude-prompt-engine

# Clone or extract project files
git clone <repo-url> .

# Install dependencies
npm install

# Start server
npm start
```

---

### macOS Installation

#### Prerequisites
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Verify installation
brew --version
```

#### Automatic Installation
```bash
# Run macOS installer
bash installers/install-macos.sh

# Follow prompts for:
# - Optional LaunchAgent setup
# - Shell aliases
# - macOS app bundle
```

#### Manual Installation
```bash
# Install Node.js
brew install node

# Create project directory
mkdir -p ~/claude-prompt-engine
cd ~/claude-prompt-engine

# Install npm dependencies
npm install

# Start server
npm start
```

#### Shell Aliases (Optional)
Add to `~/.zshrc` or `~/.bashrc`:
```bash
alias claude-start='cd ~/claude-prompt-engine && npm start'
alias claude-logs='tail -f ~/claude-prompt-engine/logs/app.log'
alias claude-edit='code ~/claude-prompt-engine'
```

---

### Windows Installation

#### Prerequisites
- Windows 10 or later
- Administrator access

#### Using PowerShell (Recommended)
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Navigate to project directory
cd c:\path\to\claude-prompt-engine

# Run installer
.\installers\install.ps1

# Follow prompts
```

#### Using Command Prompt
```cmd
# Install Node.js from https://nodejs.org/
# Run installer as Administrator

# Verify installation
node --version
npm --version

# Create project directory
mkdir %USERPROFILE%\claude-prompt-engine
cd %USERPROFILE%\claude-prompt-engine

# Install dependencies
npm install

# Start server
npm start
```

---

## 📦 Installation Options

### Full Installation
```bash
install.sh --install-type full
```
Includes:
- Node.js and npm
- Git (if missing)
- GitHub CLI
- Copilot extension
- Systemd service (Linux)
- All optional tools

### Development Setup
```bash
install.sh --install-type development
```
Includes:
- All dependencies
- Dev tools
- Git
- Testing framework

### Production Setup
```bash
install.sh --install-type production
```
Minimal installation:
- Core dependencies only
- Optimized for production
- No optional tools

### Custom Installation
```bash
install.sh --install-type custom
```
Select individual components

---

## 🔧 Post-Installation

### Verify Installation
```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check server status
curl http://localhost:3000
```

### Access Web Interface
```
http://localhost:3000
```

### Link GitHub Copilot
1. Click "🔗 Link Copilot Account" button (top right)
2. Follow instructions in dialog
3. Complete GitHub CLI setup
4. Use "🚀 Copilot CLI" tab

---

## 🚀 Starting the Server

### Using npm
```bash
cd ~/claude-prompt-engine
npm start
```

### Using Systemd (Linux)
```bash
# Enable service
sudo systemctl enable claude-prompt-engine

# Start service
sudo systemctl start claude-prompt-engine

# View status
sudo systemctl status claude-prompt-engine

# View logs
sudo journalctl -u claude-prompt-engine -f
```

### Using LaunchAgent (macOS)
```bash
# Load agent
launchctl load ~/Library/LaunchAgents/com.claude-prompt-engine.plist

# Unload agent
launchctl unload ~/Library/LaunchAgents/com.claude-prompt-engine.plist

# View logs
log stream --predicate 'process == "node"' --level debug
```

### Using Shortcuts (Windows)
- **Desktop Shortcut** - Double-click to start
- **Start Menu** - Search "Claude Prompt Engine"
- **PowerShell** - Use `claude-start` alias

---

## 📁 Directory Structure

After installation, your directory will look like:
```
claude-prompt-engine/
├── core/                 # Prompt generation engine
├── cli/                  # Copilot CLI handler
├── configs/              # Configuration files
├── public/               # Web UI
├── logs/                 # Application logs
├── server.js             # Main server
├── package.json          # Dependencies
├── .env                  # Environment variables
├── .gitignore            # Git ignore rules
└── installers/           # Installation scripts
```

---

## 🔑 Configuration

### Environment Variables (.env)
```bash
# Server
PORT=3000
NODE_ENV=production
HOST=localhost

# API
MAX_BODY_SIZE=1048576

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# GitHub (optional)
GITHUB_TOKEN=your_token_here

# Feature Flags
ENABLE_COPILOT_CLI=true
```

---

## 🐛 Troubleshooting

### "Node.js not found"
```bash
# Install Node.js
# Linux: sudo apt-get install nodejs npm
# macOS: brew install node
# Windows: Download from nodejs.org
```

### "Permission denied"
```bash
# Make scripts executable
chmod +x installers/*.sh

# Run with appropriate permissions
bash installers/install.sh
```

### "Port 3000 already in use"
```bash
# Use different port
PORT=3001 npm start

# Or kill process using port
lsof -ti:3000 | xargs kill -9
```

### "npm install fails"
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### "Cannot connect to http://localhost:3000"
```bash
# Check if server is running
ps aux | grep node

# Check if port is open
netstat -an | grep 3000

# View logs
tail -f logs/app.log
```

---

## 🔗 Linking GitHub Copilot

### Via Web Interface (Recommended)
1. Open http://localhost:3000
2. Click "🔗 Link Copilot Account" button
3. Follow instructions in modal dialog
4. Complete GitHub CLI setup

### Via Terminal
```bash
# Install GitHub CLI
brew install gh  # macOS
sudo apt-get install gh  # Linux

# Authenticate
gh auth login

# Install Copilot extension
gh extension install github/gh-copilot

# Verify
gh copilot status
```

---

## 📚 Using Copilot CLI Features

After linking GitHub Copilot:

### Generate Install Scripts
```bash
# Via Web Interface
# Click "🚀 Copilot CLI" tab
# Select platform (Node.js, Python, LAMP, Docker, Full-Stack)
# Download script
# Run: bash install-*.sh
```

### Test Prompts
```bash
# In web interface
# 1. Generate a prompt
# 2. Go to Copilot CLI tab
# 3. Test button
# 4. Get recommendations
```

### Create CI/CD Workflows
```bash
# In web interface
# 1. Go to Copilot CLI tab
# 2. Select workflow type
# 3. Copy YAML
# 4. Save to .github/workflows/
# 5. Commit and push
```

---

## 📖 Next Steps

After installation:

1. **Read QUICK_START.md** - 5-minute guide
2. **Read USER_MANUAL.md** - Complete feature guide
3. **Read COPILOT_CLI_GUIDE.md** - CLI integration details
4. **Generate your first prompt** - Try the main feature
5. **Setup Copilot CLI** - Link your GitHub account
6. **Generate install scripts** - Try platform-specific setup

---

## 🆘 Getting Help

### Documentation
- `QUICK_START.md` - Getting started
- `USER_MANUAL.md` - Features and usage
- `COPILOT_CLI_GUIDE.md` - CLI integration
- `INSTALLATION_GUIDE.md` - This file
- `GITHUB_COPILOT_LINKING.md` - Account linking

### Support
- Check relevant documentation first
- Review troubleshooting section
- Check GitHub issues
- See log files in `logs/` directory

---

## 🔄 Uninstallation

### Linux/WSL
```bash
# Disable service
sudo systemctl stop claude-prompt-engine
sudo systemctl disable claude-prompt-engine

# Remove files
rm -rf ~/claude-prompt-engine

# Remove service file
sudo rm /etc/systemd/system/claude-prompt-engine.service
sudo systemctl daemon-reload
```

### macOS
```bash
# Unload agent
launchctl unload ~/Library/LaunchAgents/com.claude-prompt-engine.plist

# Remove files
rm -rf ~/claude-prompt-engine
rm ~/Library/LaunchAgents/com.claude-prompt-engine.plist

# Remove aliases (from .zshrc)
# Manually edit ~/.zshrc to remove claude-* aliases
```

### Windows
```powershell
# Remove shortcuts
Remove-Item $env:USERPROFILE\Desktop\"Claude Prompt Engine.lnk"
Remove-Item "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Claude Prompt Engine.lnk"

# Remove directory
Remove-Item $env:USERPROFILE\claude-prompt-engine -Recurse -Force
```

---

## ✅ Verification Checklist

After installation, verify:

- [ ] Server starts without errors
- [ ] Web interface loads at http://localhost:3000
- [ ] All tabs are accessible
- [ ] Prompt generation works
- [ ] Copilot CLI tab is available
- [ ] GitHub linking button works
- [ ] Install script generation works
- [ ] Documentation files are present

---

## 💡 Tips

1. **Keep updated** - Regularly pull latest changes
2. **Backup .env** - Keep your configuration safe
3. **Monitor logs** - Check logs for issues
4. **Test locally** - Before deploying to production
5. **Use version control** - Commit your configurations
6. **Set strong passwords** - If exposing to network
7. **Use HTTPS** - In production environments

---

## 📞 Support

For issues:
1. Check documentation
2. Review error messages
3. Check logs in `logs/` directory
4. Search GitHub issues
5. File new issue with details

---

**Version 1.0** | Created with GitHub Copilot | Last Updated: 2024
