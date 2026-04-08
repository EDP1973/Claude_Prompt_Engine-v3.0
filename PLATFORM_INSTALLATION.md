# Installation Guide - All Platforms

This document provides a complete overview of the Claude Prompt Engine installation experience across all platforms.

---

## 🪟 Windows Installation

### For Windows Users - Quickest Setup

**Simply double-click `INSTALL.bat`**

That's it! The installation script will:
1. ✅ Automatically install Node.js v18 (if not found)
2. ✅ Install all npm dependencies
3. ✅ Create configuration files
4. ✅ Generate helper scripts (START/STOP)
5. ✅ Verify installation

Then double-click `START.bat` to launch the server.

**Files:**
- `INSTALL.bat` - One-click installer
- `install-windows.ps1` - PowerShell script (runs automatically)
- `START.bat` - Quick server launcher
- `STOP.bat` - Graceful shutdown

**See Also:** `WINDOWS_INSTALLATION.md` for detailed guide

---

## 🍎 macOS Installation

### For macOS Users

```bash
# 1. Run the installer
bash install.sh

# 2. Start the server
./start.sh

# 3. Open browser
# http://localhost:3000
```

Or use the provided macOS-specific installer:
```bash
bash installers/install-macos.sh
```

**Files:**
- `install.sh` - Universal installer
- `installers/install-macos.sh` - macOS-specific
- `start.sh` - Server launcher
- `stop.sh` - Shutdown script

---

## 🐧 Linux/Unix Installation

### For Linux Users

```bash
# 1. Run the installer
bash install.sh

# 2. Start the server
./start.sh

# 3. Open browser
# http://localhost:3000
```

**Files:**
- `install.sh` - Universal installer
- `start.sh` - Server launcher
- `stop.sh` - Shutdown script

---

## 🆘 Troubleshooting

### Common Issues & Solutions

#### "Cannot find module 'sqlite3'"
```bash
# Option 1: Run fix script
bash fix-dependencies.sh

# Option 2: Manual fix
rm -rf node_modules package-lock.json
npm install
```

#### Dependencies Won't Install
```bash
# Clean npm cache
npm cache clean --force

# Reinstall
npm install --legacy-peer-deps
```

#### Port 3000 Already In Use
```bash
# Use different port
PORT=3001 npm run web
```

**See:** `INSTALL_TROUBLESHOOTING.md` for comprehensive guide

---

## 📋 What Gets Installed

### System Requirements
- **Node.js:** v18+ (auto-installed on Windows)
- **npm:** v9+ (included with Node.js)
- **Disk Space:** 500MB minimum
- **RAM:** 4GB minimum
- **Internet:** Required for setup

### Dependencies
- `sqlite3` - Database
- `xlsx` - Excel file parsing
- `csv-parse` - CSV file parsing
- `validator` - Data validation
- `axios` - HTTP requests

### Project Files
```
claude-prompt-engine/
├── core/              - Core modules (6 files)
├── public/            - Web UI pages and styles
├── cli/               - Command-line interface
├── migrations/        - Database migrations
├── server.js          - Main Node.js server
├── package.json       - Dependencies & scripts
├── INSTALL.bat        - Windows installer (Windows)
├── START.bat          - Windows server launcher (Windows)
├── STOP.bat           - Windows server shutdown (Windows)
├── install.sh         - Unix installer (macOS/Linux)
├── start.sh           - Unix server launcher (macOS/Linux)
├── stop.sh            - Unix server shutdown (macOS/Linux)
└── .env               - Environment config (created during install)
```

---

## 🚀 Quick Start by Platform

### Windows
```batch
INSTALL.bat     (double-click to install)
START.bat       (double-click to run)
```
Then open: http://localhost:3000

### macOS/Linux
```bash
bash install.sh     # Install
./start.sh          # Run
```
Then open: http://localhost:3000

### Manual/PowerShell
```bash
npm install         # Install dependencies
npm run web         # Start server
```
Then open: http://localhost:3000

---

## 📖 First Steps After Installation

### 1. Access Web Interface
```
http://localhost:3000
```

### 2. Configure System
```
http://localhost:3000/settings.html
```
- Set hardware tier
- Configure deployment mode

### 3. Import Data
```
http://localhost:3000/data-import.html
```
- Import CSV/Excel files
- Auto-map fields
- Validate data

### 4. Build Queries
```
http://localhost:3000/query-builder-form.html
```
Or visual mode:
```
http://localhost:3000/query-builder-visual.html
```

---

## 🔧 Advanced Usage

### Custom Port
```bash
PORT=3001 npm run web
```

### CLI Interface
```bash
npm run cli
```

### Run Tests
```bash
bash run-tests.sh
```

### Development Mode
```bash
NODE_ENV=development npm run web
```

---

## 📚 Documentation

### Core Guides
- **README.md** - Project overview
- **COMPREHENSIVE_DOCS.md** - Full documentation
- **INSTALLATION_GUIDE.md** - Detailed setup
- **INSTALL_TROUBLESHOOTING.md** - Common issues

### Platform-Specific
- **WINDOWS_INSTALLATION.md** - Windows guide
- **DOWNLOAD_AND_INSTALL.md** - Download instructions

### API & Development
- **API reference** - In COMPREHENSIVE_DOCS.md
- **Architecture** - In COMPREHENSIVE_DOCS.md

---

## ❌ Uninstalling

### Windows
1. Close any running instances (click STOP.bat)
2. Delete the entire project folder
3. (Optional) Uninstall Node.js via Settings

### macOS/Linux
```bash
# Stop server if running
./stop.sh

# Remove project
rm -rf claude-prompt-engine
```

---

## ✅ Verification

### Check Installation
```bash
node --version      # Should be v18+
npm --version       # Should be v9+
npm list sqlite3    # Should show sqlite3
```

### Test Server
```bash
npm run web         # Should see:
# ✅ Database connected
# ✅ Database schema initialized
# ✅ Phase 1 modules loaded
# ✨ Claude Prompt Engine - Phase 3 Server Ready
```

### Test Web Interface
```
http://localhost:3000
# Should show settings/import/query pages
```

---

## 🆘 Support

If you encounter issues:

1. Check the **INSTALL_TROUBLESHOOTING.md** file
2. Review logs in the `logs/` directory
3. Run the installer/fix script again
4. Report issues on GitHub

---

## 🎯 Success Indicators

After installation, you should see:

✅ INSTALL.bat runs successfully (Windows)
✅ npm packages installed (node_modules/ created)
✅ start.sh/start.bat launches without errors (macOS/Linux/Windows)
✅ Server starts on http://localhost:3000
✅ Web pages load without errors
✅ Database file created (prompt_engine.db)

---

## 📈 Next Steps

1. ✅ Complete installation
2. ✅ Start the server
3. ✅ Configure system in Settings
4. ✅ Import first data file
5. ✅ Build test query
6. ✅ Review COMPREHENSIVE_DOCS.md

---

**Status:** Production Ready ✅

**Installation:** Smooth & Self-Contained across all platforms

**Support:** Full documentation included
