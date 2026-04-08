# Claude Prompt Engine - Windows Installation Guide

## Quick Start (Recommended)

### Step 1: Double-Click INSTALL.bat

Simply **double-click** `INSTALL.bat` in the project folder. That's it!

The script will:
- ✅ Check for Node.js (install if missing)
- ✅ Verify npm is available
- ✅ Install all dependencies
- ✅ Create configuration files
- ✅ Create helper scripts
- ✅ Verify everything works

### Step 2: Start the Server

Double-click `START.bat` to launch the server.

You'll see:
```
╔════════════════════════════════════════════════════════════════════════╗
║         Claude Prompt Engine - Starting Server...                     ║
╚════════════════════════════════════════════════════════════════════════╝

Starting server on port 3000...
Access the application at: http://localhost:3000
```

### Step 3: Open Your Browser

Visit: **http://localhost:3000**

## What Gets Installed

### Automatic Installation (via INSTALL.bat)

If Node.js is not found, the installer automatically:
- Downloads Node.js v18 (Windows 64-bit or 32-bit)
- Installs Node.js silently
- Verifies installation

### Dependencies Installed
- `sqlite3` - Database management
- `xlsx` - Excel file parsing
- `csv-parse` - CSV file parsing
- `validator` - Data validation
- `axios` - HTTP requests

All dependencies are managed by npm and installed automatically.

## What Each Script Does

### INSTALL.bat
- One-click installation
- Installs Node.js if needed
- Installs all npm dependencies
- Creates configuration files
- Creates helper scripts
- Verifies installation

### START.bat
- Launches the server
- Creates database on first run
- Initializes all Phase 3 components
- Opens on http://localhost:3000

### STOP.bat
- Gracefully stops the server
- Terminates any Node.js processes

## First-Time Setup

After starting the server, visit these pages in order:

### 1. Settings (Configure System)
```
http://localhost:3000/settings.html
```
- Set hardware tier (Basic/Standard/Premium)
- Configure deployment mode
- Save your preferences

### 2. Data Import (Load Your Data)
```
http://localhost:3000/data-import.html
```
- Import CSV, Excel, or TXT files
- Auto-detect field mappings
- Validate phone numbers
- Detect duplicates

### 3. Query Builder (Create Queries)
```
http://localhost:3000/query-builder-form.html
```
(Form-based query building)

Or: **http://localhost:3000/query-builder-visual.html**
(Visual drag-drop interface)

## Troubleshooting

### Problem: "Node.js not found"
**Solution:** The installer will automatically download and install Node.js v18 for you.

### Problem: "Port 3000 already in use"
**Solution:** Use a different port or stop other servers:
```batch
cd your-project-folder
set PORT=3001
npm run web
```

### Problem: "sqlite3 installation failed"
**Solution:** Run the fix script:
```batch
bash fix-dependencies.sh
```
Or reinstall:
```batch
npm install --legacy-peer-deps
```

### Problem: Dependencies not installing
**Solution:** Open PowerShell or Command Prompt and run:
```batch
cd your-project-folder
del node_modules /s /q
npm install
```

### Problem: Cannot find module errors
**Solution:** See INSTALL_TROUBLESHOOTING.md for comprehensive solutions.

## System Requirements

### Minimum
- Windows 10 or newer
- 4GB RAM
- 500MB free disk space
- Internet connection (for initial setup)

### Recommended
- Windows 10/11 (Latest)
- 8GB RAM
- 2GB free disk space
- High-speed internet

## Advanced Usage

### Command Line / PowerShell

```batch
REM Navigate to project
cd claude-prompt-engine

REM Start server
npm run web

REM Start on different port
set PORT=3001 && npm run web

REM Run CLI interface
npm run cli

REM View all available scripts
npm run
```

### Using PowerShell Script Directly

Instead of INSTALL.bat, you can run the PowerShell script directly:

```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
.\install-windows.ps1
```

## File Structure After Installation

```
claude-prompt-engine\
├── INSTALL.bat                 ← Double-click to install
├── START.bat                   ← Double-click to start
├── STOP.bat                    ← Double-click to stop
├── install-windows.ps1         ← PowerShell installer
├── node_modules\               ← All dependencies
├── core\                       ← Core modules
├── public\                     ← Web pages & styles
├── server.js                   ← Main server
├── package.json                ← Configuration
├── prompt_engine.db            ← Database (created on first run)
├── .env                        ← Environment config
├── config.json                 ← Application config
└── logs\                       ← Server logs
```

## Documentation

- **COMPREHENSIVE_DOCS.md** - Full documentation
- **INSTALLATION_GUIDE.md** - Detailed setup
- **INSTALL_TROUBLESHOOTING.md** - Common issues
- **API documentation** - In COMPREHENSIVE_DOCS.md

## Uninstalling

To remove Claude Prompt Engine:

1. Close any running instances (click STOP.bat or close the terminal)
2. Delete the entire `claude-prompt-engine` folder
3. Optionally uninstall Node.js via Windows Settings (if not needed elsewhere)

## Getting Help

If you encounter issues:

1. Check **INSTALL_TROUBLESHOOTING.md**
2. Run **INSTALL.bat** again to verify installation
3. Check logs in the **logs** folder
4. Visit GitHub Issues for more help

## Next Steps

After successful installation:

1. ✅ Open http://localhost:3000
2. ✅ Configure system in Settings
3. ✅ Import your first data file
4. ✅ Build a test query
5. ✅ Review COMPREHENSIVE_DOCS.md

---

**Status:** Production Ready ✅

Your Claude Prompt Engine is ready to use!
