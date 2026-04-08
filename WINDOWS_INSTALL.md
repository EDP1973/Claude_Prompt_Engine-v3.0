# Claude Prompt Engine - Windows Installation Guide

## 📦 Installation Options

### Option 1: EXE Installer (Recommended)

```
claude-prompt-engine-1.0.0-installer.exe
```

**What it does:**
- Installs to: C:\\Program Files\\Claude Prompt Engine
- Creates Start Menu shortcuts
- Creates Desktop shortcut
- Installs npm dependencies on first run
- Registers in Add/Remove Programs

**Steps:**
1. Download claude-prompt-engine-1.0.0-installer.exe
2. Double-click to run
3. Click "Install"
4. Wait for npm to install dependencies
5. Click "Finish"
6. Application launches automatically at http://localhost:3000

### Option 2: MSI Installer

```
claude-prompt-engine-1.0.0.msi
```

**What it does:**
- Windows package manager compatible
- Can be deployed via Group Policy
- Integrates with Windows Update
- Professional deployment option

**Steps:**
1. Download claude-prompt-engine-1.0.0.msi
2. Double-click or use: msiexec /i claude-prompt-engine-1.0.0.msi
3. Follow wizard
4. Application installs to Program Files

### Option 3: Portable ZIP

```
claude-prompt-engine-1.0.0-portable.zip
```

**What it does:**
- No installation required
- Extract and run
- Can be run from USB drive
- Perfect for testing

**Steps:**
1. Extract to any folder
2. Double-click: run.bat
3. Wait for npm install
4. Browser opens to http://localhost:3000

### Option 4: PowerShell Script

```powershell
.\installers\install.ps1
```

**What it does:**
- Flexible installation script
- Installs to C:\\Program Files or custom location
- Creates service (optional)
- Works with or without admin rights

**Steps:**
1. Open PowerShell as Administrator
2. Run: Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
3. Run: .\\installers\\install.ps1
4. Follow prompts

## 🚀 First Launch

After installation:

1. **Find shortcuts:**
   - Start Menu → Claude Prompt Engine
   - Desktop → Claude Prompt Engine shortcut
   - Or navigate to: C:\\Program Files\\Claude Prompt Engine\\start.bat

2. **Access web UI:**
   - Opens automatically, or
   - Manually go to: http://localhost:3000

3. **Link Copilot:**
   - Click "Link Copilot Account" button

4. **Generate prompts:**
   - Select AI model (Claude, GPT-4, etc.)
   - Choose language and project type
   - Click "Generate"

## 🔧 Manual Commands

If you prefer command line:

```batch
cd "C:\\Program Files\\Claude Prompt Engine"

REM Start the app
start.bat

REM Stop the app
stop.bat

REM Reinstall dependencies
install-deps.bat

REM Register as Windows Service (requires admin)
powershell -ExecutionPolicy Bypass register-service.ps1
```

## 🐛 Troubleshooting

### "Port 3000 already in use"

```batch
REM Find what's using port 3000
netstat -ano | findstr :3000

REM Kill process (replace PID with actual number)
taskkill /PID <PID> /F

REM Or set custom port
set PORT=3001
start.bat
```

### "npm install failed"

```batch
REM Make sure Node.js is installed
node --version

REM If not installed, download from: https://nodejs.org/

REM Then retry
cd "C:\\Program Files\\Claude Prompt Engine"
npm install --production
```

### "Can't connect to localhost:3000"

1. Check if service is running:
   ```batch
   tasklist | findstr node.exe
   ```

2. Check firewall:
   - Allow Node.js through Windows Firewall
   - Or temporarily disable to test

3. Try alternate port:
   ```batch
   set PORT=3001
   start.bat
   ```

### "Uninstall not working"

```batch
REM Stop all node processes
taskkill /IM node.exe /F

REM Then uninstall via Control Panel or:
REM Settings → Apps → Claude Prompt Engine → Uninstall
```

## 📊 System Requirements

| Requirement | Minimum |
|-------------|---------|
| OS | Windows 7 SP1 or later |
| Processor | Any modern processor |
| RAM | 512 MB |
| Disk Space | 500 MB |
| Node.js | 18.0+ (bundled in installer) |
| Network | Required for npm install |

## 🔄 Updating

### Automatic Check
The app checks for updates automatically. When available:
1. Notification appears in web UI
2. Click to download and install
3. Application restarts with new version

### Manual Update
```batch
cd "C:\\Program Files\\Claude Prompt Engine"
git pull origin main
npm install --production
```

## 🔐 Security

- All packages verified with SHA256 checksums
- Signed installers (EXE/MSI) for Windows SmartScreen
- No malware: Open source, auditable code
- HTTPS for GitHub connections

## 📞 Support

- **Documentation:** See README.md
- **Issues:** Check logs in: C:\\Program Files\\Claude Prompt Engine\\logs\\
- **Help:** Run: start.bat and check browser console (F12)

## 🎓 Features

✓ Multi-model LLM support (Claude, GPT-4, Gemini, LLaMA, Mistral)
✓ GitHub Copilot integration
✓ Self-learning system
✓ Auto-update capability
✓ Telephony configuration
✓ Browser extensions
✓ Glasmorphic web UI
✓ Production-ready

---

**Ready to use!** Choose your preferred installation method above.
