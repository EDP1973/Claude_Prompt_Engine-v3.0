# 📦 Claude Prompt Engine - Download & Installation

Your **self-contained, ready-to-use installer packages** are ready! No additional dependencies needed beyond what's typical for your platform.

---

## 📍 Where to Find the Installers

All compiled installer packages are located in the **`dist/`** directory of this repository:

```
📁 claude-prompt-engine/
  └─ 📁 dist/
      ├─ claude-prompt-engine-1.0.0.deb      (43 KB - Debian/Ubuntu)
      ├─ claude-prompt-engine-1.0.0-1.x86_64.rpm  (54 KB - Fedora/RHEL)
      └─ SHA256SUMS                          (Checksums for verification)
```

---

## 🚀 Installation by Platform

### **Linux - Debian/Ubuntu**

#### Download
```bash
# Download from dist/ folder
cd ~/Downloads
# Or clone the repo and navigate to dist/
```

#### Install
```bash
sudo apt-get install ./claude-prompt-engine-1.0.0.deb
```

#### Verify
```bash
sudo systemctl status claude-prompt-engine
curl http://localhost:3000
```

#### Start/Stop
```bash
# Start the service
sudo systemctl start claude-prompt-engine

# Stop the service
sudo systemctl stop claude-prompt-engine

# View logs
sudo journalctl -u claude-prompt-engine -f
```

---

### **Linux - Fedora/RHEL**

#### Download
```bash
cd ~/Downloads
# Navigate to dist/ folder and download the .rpm file
```

#### Install
```bash
sudo dnf install ./claude-prompt-engine-1.0.0-1.x86_64.rpm
```

#### Verify
```bash
sudo systemctl status claude-prompt-engine
curl http://localhost:3000
```

#### Start/Stop
```bash
# Start the service
sudo systemctl start claude-prompt-engine

# Stop the service
sudo systemctl stop claude-prompt-engine

# View logs
sudo journalctl -u claude-prompt-engine -f
```

---

### **macOS** (Script-based installer)

While compiled .pkg files are available in `installers/`, you can also use the shell script:

```bash
chmod +x installers/install-macos.sh
./installers/install-macos.sh
```

Then access at: `http://localhost:3000`

---

### **Windows** (PowerShell installer)

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\installers\install.ps1
```

Then access at: `http://localhost:3000`

---

## ✅ Verification Checklist

After installation:

1. **Service is running:**
   ```bash
   systemctl status claude-prompt-engine
   ```

2. **Web UI is accessible:**
   ```bash
   curl http://localhost:3000
   ```

3. **Logs are being generated:**
   ```bash
   sudo journalctl -u claude-prompt-engine --no-pager | head -20
   ```

4. **Checksum matches** (for security):
   ```bash
   cd dist/
   sha256sum -c SHA256SUMS
   ```

---

## 📊 Package Contents

Each installer includes:

- ✅ Full application code (public/, core/, cli/, configs/, memory/)
- ✅ All configuration files (AI models, carriers, dial plans, extensions)
- ✅ Self-learning system (learning engine & database)
- ✅ Auto-update system (version checking, safe updates)
- ✅ systemd service file (for Linux/macOS)
- ✅ Post-install setup (npm dependencies, permissions, service registration)

**Note:** The installer will run `npm install --production` during post-install to pull Node.js dependencies. This requires internet connectivity.

---

## 🔧 What Gets Installed

### Linux (.deb / .rpm):

```
/opt/claude-prompt-engine/          Main application directory
├── public/                          Web UI files
├── core/                            Core modules (learning, updates, etc.)
├── cli/                             CLI handlers
├── configs/                         Configuration files
├── memory/                          Learning memory storage
├── server.js                        Main server
├── package.json                     Dependencies
└── logs/                            Application logs

/etc/systemd/system/
└── claude-prompt-engine.service     systemd service file
```

### macOS:

```
~/Library/LaunchAgents/
└── com.claude.engine.plist          LaunchAgent configuration

/Applications/Claude\ Prompt\ Engine/     Main application
```

### Windows:

```
C:\Program Files\Claude Prompt Engine\    Main application
C:\Users\[User]\AppData\Roaming\Microsoft\Windows\Start Menu\Startup\
└── Claude Prompt Engine.lnk              Startup shortcut
```

---

## 🔐 Security & Verification

### Verify Checksum (Linux/macOS)
```bash
cd dist/
sha256sum -c SHA256SUMS

# Or verify manually:
sha256sum -c - <<< "9cdaf2497049209572ca366cf4a505f3f44f1cec707a110ee2eeaeef48b5dd95  claude-prompt-engine-1.0.0-1.x86_64.rpm"
sha256sum -c - <<< "f361fced8bab07718b5629216046cc8f3a41b50b1e298c9e013ae7d8386025cc  claude-prompt-engine-1.0.0.deb"
```

---

## 🐛 Troubleshooting

### Service won't start
```bash
# Check logs
sudo journalctl -u claude-prompt-engine -n 50

# Manually test
node /opt/claude-prompt-engine/server.js
```

### Port 3000 already in use
```bash
# Find what's using port 3000
lsof -i :3000

# Or change the port via environment variable
sudo systemctl edit claude-prompt-engine
# Add: Environment="PORT=3001"
sudo systemctl restart claude-prompt-engine
```

### Permission denied errors
```bash
# Fix permissions
sudo chown -R claude-engine:claude-engine /opt/claude-prompt-engine
sudo chmod -R 755 /opt/claude-prompt-engine
```

---

## 📝 Next Steps

1. **Access the web UI**: Open `http://localhost:3000` in your browser
2. **Link your GitHub Copilot account**: Click "Link Copilot Account" in the UI
3. **Generate your first prompt**: Select a model, language, and project type
4. **Explore features**:
   - Multi-model LLM support (Claude, GPT-4, Gemini, LLaMA, etc.)
   - Self-learning system tracking prompt performance
   - Automatic updates checking
   - GitHub Copilot CLI integration
   - Browser extension support
   - Telephony platform configuration

---

## 🔄 Uninstallation

### Debian/Ubuntu
```bash
sudo apt-get remove claude-prompt-engine
sudo apt-get purge claude-prompt-engine  # Also remove configs
```

### Fedora/RHEL
```bash
sudo dnf remove claude-prompt-engine
```

### macOS
```bash
./installers/install-macos.sh uninstall
```

### Windows
```powershell
.\installers\install.ps1 -Uninstall
```

---

## 📞 Support

For issues or questions:
- Check logs: `sudo journalctl -u claude-prompt-engine -f`
- Review configuration: `/opt/claude-prompt-engine/configs/`
- See installation logs: Look in application logs directory

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-07  
**Package Format:** Self-contained installers (npm dependencies installed at runtime)
