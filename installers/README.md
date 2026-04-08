# Installation Package Repository

This directory contains platform-specific installation scripts for Claude Prompt Engine with GitHub Copilot CLI integration.

## 🚀 Quick Install

### Linux / WSL
```bash
bash install.sh
```

### macOS
```bash
bash install-macos.sh
```

### Windows (PowerShell)
```powershell
.\install.ps1
```

---

## 📦 Available Installers

### `install.sh` - Universal Linux/WSL Installer
**Platform:** Linux, WSL, Ubuntu, Debian, Fedora, RHEL  
**Language:** Bash  
**Features:**
- Automatic package manager detection
- Node.js and npm installation
- Project structure setup
- Systemd service creation
- File permissions configuration
- Optional GitHub CLI integration

**Usage:**
```bash
bash install.sh [OPTIONS]

Options:
  --install-dir /path/to/install    Installation directory (default: current)
  --install-type full|dev|prod|custom  Installation type
  --help                              Show help message
```

**Installation Types:**
- `full` - All components and tools
- `development` - Development tools included
- `production` - Minimal, optimized setup
- `custom` - Choose individual components

### `install-macos.sh` - macOS Installer
**Platform:** macOS 10.13+  
**Language:** Bash  
**Features:**
- Homebrew integration
- Node.js installation via Homebrew
- LaunchAgent setup (auto-start)
- macOS app bundle creation
- zsh/bash shell aliases
- GitHub CLI and Copilot extension

**Usage:**
```bash
bash install-macos.sh

# Follow interactive prompts
```

**Interactive Options:**
- LaunchAgent setup (auto-start on login)
- Shell aliases (claude-start, claude-logs, etc.)
- macOS app bundle creation

### `install.ps1` - Windows PowerShell Installer
**Platform:** Windows 10+, Windows Server 2016+  
**Language:** PowerShell  
**Features:**
- Node.js installer download and execution
- Project structure creation
- Environment configuration
- Desktop and Start Menu shortcuts
- PowerShell profile setup
- Custom PowerShell functions

**Usage:**
```powershell
# Allow script execution (one-time)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run installer
.\install.ps1

# Optional: Specify installation directory
.\install.ps1 -InstallDir "C:\Projects\claude-engine"
```

**PowerShell Shortcuts:**
- `claude-start` - Start the server
- `claude-edit` - Open in VS Code
- `claude-logs` - View recent logs

---

## 🔧 Installation Process

### What Each Installer Does

#### 1. **System Checks**
- Verify Node.js availability
- Check npm version
- Detect package manager (Linux)
- Confirm OS compatibility

#### 2. **Dependency Installation**
- Install Node.js (if missing)
- Install npm (if missing)
- Install Git (recommended)
- Install GitHub CLI (optional)
- Install Copilot extension (optional)

#### 3. **Project Setup**
- Create project directories
  - core/
  - cli/
  - configs/
  - public/
  - logs/
  - .github/workflows/
- Set file permissions
- Create .env configuration file
- Create .gitignore

#### 4. **Service Configuration**
- Linux: Create systemd service
- macOS: Create LaunchAgent
- Windows: Create desktop shortcuts

#### 5. **Verification**
- Test Node.js
- Test npm
- Verify directories
- Confirm package.json
- Check server.js

---

## 📋 Requirements by Platform

### Linux/WSL
```
✓ Bash 4.0+
✓ Internet connection
✓ sudo access (for system packages)
✓ ~200MB disk space
```

### macOS
```
✓ Homebrew (auto-prompt to install)
✓ macOS 10.13+
✓ Internet connection
✓ ~200MB disk space
```

### Windows
```
✓ PowerShell 5.0+
✓ Administrator access (optional)
✓ Internet connection
✓ ~200MB disk space
```

---

## 🔑 Configuration

### Environment Variables (.env)
Created automatically with defaults:
```bash
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
ENABLE_COPILOT_CLI=true
```

Edit `~/.env` to customize:
- Server port
- Node environment
- Logging level
- Feature flags

### Directory Structure
```
claude-prompt-engine/
├── core/              # Prompt generation engine
├── cli/               # GitHub Copilot CLI handler
├── configs/           # Configuration databases
├── public/            # Web UI (HTML/CSS/JS)
├── logs/              # Application logs
├── server.js          # Main server
├── package.json       # Dependencies
├── .env               # Environment config
└── installers/        # This directory
```

---

## 🆘 Troubleshooting

### Installation Fails

**"Node.js not found"**
```bash
# Linux
sudo apt-get install nodejs npm

# macOS
brew install node

# Windows
# Download from nodejs.org
```

**"Permission denied"**
```bash
# Make scripts executable
chmod +x install.sh install-macos.sh

# Run with bash explicitly
bash install.sh
```

**"Package manager not found"**
```bash
# Update package lists
sudo apt-get update

# Install build essentials
sudo apt-get install build-essential
```

### Server Won't Start

**"Port 3000 in use"**
```bash
# Use different port
PORT=3001 npm start

# Or kill process
lsof -ti:3000 | xargs kill -9
```

**"Cannot find module"**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## ✨ Post-Installation

### Start the Server
```bash
# Linux/macOS
cd ~/claude-prompt-engine
npm start

# Windows
cd %USERPROFILE%\claude-prompt-engine
npm start
```

### Access Web Interface
```
http://localhost:3000
```

### Link GitHub Copilot
1. Click "🔗 Link Copilot Account" button
2. Follow instructions in modal
3. Complete GitHub CLI setup

### Use Copilot CLI Features
1. Go to "🚀 Copilot CLI" tab
2. Generate install scripts
3. Test prompts
4. Create CI/CD workflows

---

## 📚 Documentation

After installation, read:

1. **INSTALLATION_GUIDE.md** - Detailed installation steps
2. **QUICK_START.md** - 5-minute getting started
3. **USER_MANUAL.md** - Complete feature guide
4. **COPILOT_CLI_GUIDE.md** - CLI integration
5. **GITHUB_COPILOT_LINKING.md** - Account linking
6. **README.md** - Project overview

---

## 🔄 Update Installation

### Using Git
```bash
cd ~/claude-prompt-engine
git pull origin main
npm install
npm start
```

### Manual Update
1. Backup current installation
2. Download new version
3. Extract files
4. Run `npm install`

---

## 🗑️ Uninstall

### Linux/WSL
```bash
# Disable service
sudo systemctl stop claude-prompt-engine
sudo systemctl disable claude-prompt-engine

# Remove files
rm -rf ~/claude-prompt-engine
```

### macOS
```bash
# Unload agent
launchctl unload ~/Library/LaunchAgents/com.claude-prompt-engine.plist

# Remove files
rm -rf ~/claude-prompt-engine
```

### Windows
```powershell
# Remove shortcuts
Remove-Item $env:USERPROFILE\Desktop\"Claude Prompt Engine.lnk"

# Remove directory
Remove-Item $env:USERPROFILE\claude-prompt-engine -Recurse -Force
```

---

## 🎯 Installation Success Checklist

- [ ] Installer completed without errors
- [ ] .env file created
- [ ] Project directories exist
- [ ] npm install succeeded
- [ ] server.js found
- [ ] Server starts: `npm start`
- [ ] Web interface loads: http://localhost:3000
- [ ] Documentation files readable
- [ ] Copilot linking button functional

---

## 💡 Pro Tips

1. **Custom installation directory:**
   ```bash
   bash install.sh --install-dir /opt/claude-engine
   ```

2. **Production optimized:**
   ```bash
   bash install.sh --install-type production
   ```

3. **Skip GitHub CLI:**
   - Edit script and comment out optional tools section

4. **Use different port:**
   ```bash
   PORT=3001 npm start
   ```

5. **Run as service:**
   - Linux: `sudo systemctl start claude-prompt-engine`
   - macOS: `launchctl load ~/Library/LaunchAgents/...`

---

## 🔗 Resources

- **GitHub CLI:** https://cli.github.com/
- **Copilot Extension:** https://github.com/github/gh-copilot
- **Node.js:** https://nodejs.org/
- **GitHub:** https://github.com/

---

## 📞 Support

- Check relevant documentation
- Review error messages
- Check logs: `tail -f logs/app.log`
- See GitHub issues
- File bug reports with details

---

**Version 1.0** | Universal Cross-Platform Installation  
**Created with GitHub Copilot** | Last Updated: 2024
