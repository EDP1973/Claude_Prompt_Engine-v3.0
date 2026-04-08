# Self-Contained Package Builder

Build cross-platform native installers (.deb, .rpm, .dmg, .pkg, .exe) for Claude Prompt Engine.

## 📦 Overview

This system creates **fully self-contained, double-click installers** for all platforms:

- **Linux**: Debian (.deb) and RPM (.rpm) packages
- **macOS**: Installer (.pkg) and Disk Image (.dmg) packages  
- **Windows**: Executable (.exe) and MSI (.msi) installers

All packages include:
- ✅ Node.js runtime bundled
- ✅ All dependencies pre-installed
- ✅ Auto-start services configured
- ✅ GUI installer wizard
- ✅ One-click installation
- ✅ System integration (shortcuts, menu entries)

## 🚀 Quick Start

### Option 1: Automated Build via GitHub Actions (Recommended)

Push a version tag to automatically build all installers:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Installers will be built automatically and published as a GitHub Release.

### Option 2: Manual Local Build

On the target platform, run:

```bash
# On Linux (builds .deb and .rpm)
bash build/build-all.sh 1.0.0

# On macOS (builds .pkg and .dmg)
bash build/build-all.sh 1.0.0

# On Windows (builds .exe)
bash build/build-all.sh 1.0.0
```

Output packages will be in `dist/` directory.

## 🏗️ Build System Architecture

```
build/
├── build-all.sh               # Main build orchestrator
├── scripts/
│   ├── deb-preinstall.sh      # Debian pre-install hook
│   ├── deb-postinstall.sh     # Debian post-install hook
│   ├── deb-preuninstall.sh    # Debian pre-uninstall hook
│   ├── deb-afterremove.sh     # Debian cleanup
│   ├── rpm-*.sh               # RPM equivalents
│   └── macos-postinstall.sh   # macOS setup
├── templates/
│   ├── nsis-installer.nsi     # Windows NSIS template
│   └── windows-shortcuts.ps1  # Windows shortcuts
└── README.md                  # This file

.github/workflows/
└── build-installers.yml       # GitHub Actions CI/CD workflow
```

## 📋 Build Requirements

### All Platforms

- Node.js 18+
- npm 8+
- Git
- 500MB free disk space

### Linux (for building .deb, .rpm)

```bash
# Debian/Ubuntu
sudo apt-get install ruby-dev rubygems
sudo gem install fpm

# Or using Docker
docker run -v $(pwd):/src ubuntu:latest bash /src/build/build-all.sh 1.0.0
```

### macOS (for building .pkg, .dmg)

```bash
# Requirements already included
# Just needs macOS 10.13+
```

### Windows (for building .exe)

```powershell
# Install NSIS
choco install nsis -y

# Or install manually from:
# https://nsis.sourceforge.io/
```

## 🔧 Build Process

### 1. Preparation Phase

```bash
✓ Create build directories
✓ Install Node dependencies
✓ Verify project structure
✓ Copy application files
```

### 2. Package Building Phase

**Linux:**
- Uses `fpm` (Effing Package Manager)
- Creates .deb for Debian/Ubuntu
- Creates .rpm for Fedora/RHEL/CentOS

**macOS:**
- Uses native `pkgbuild` tool
- Creates .pkg installer
- Creates .dmg disk image

**Windows:**
- Uses NSIS (Nullsoft Scriptable Install System)
- Creates .exe installer
- Supports silent installation

### 3. Post-Build Phase

```bash
✓ Verify packages created
✓ Generate SHA256 checksums
✓ Create release notes
✓ Upload to GitHub Releases
```

## 📦 Installation Packages Included

### Linux Package Contents

**What gets installed:**

```
/opt/claude-prompt-engine/
├── server.js
├── package.json
├── public/
├── core/
├── cli/
├── configs/
├── logs/
└── node_modules/
```

**System integration:**

- Systemd service: `claude-prompt-engine`
- System user: `claude-engine`
- Systemd auto-start: `sudo systemctl enable claude-prompt-engine`
- Logs: `/var/log/claude-engine.log`

**Installation directory:**
- Debian/Ubuntu: `/opt/claude-prompt-engine`
- Fedora/RHEL: `/opt/claude-prompt-engine`

**Access after install:**
```bash
sudo systemctl start claude-prompt-engine
# Visit http://localhost:3000
```

### macOS Package Contents

**What gets installed:**

```
/Applications/claude-prompt-engine/
├── server.js
├── package.json
├── public/
├── core/
├── node_modules/
└── ...
```

**System integration:**

- LaunchAgent: `~/Library/LaunchAgents/com.claude-prompt-engine.plist`
- Auto-start: Enabled by default
- Logs: `/var/log/claude-engine.log`

**Installation methods:**

1. **PKG Installer** (Traditional)
   - Double-click `*.pkg` file
   - Follow installation wizard

2. **DMG Image** (Drag & Drop)
   - Double-click `*.dmg` file
   - Drag app to Applications folder

**Access after install:**
```bash
# Auto-starts automatically, or manually:
launchctl load ~/Library/LaunchAgents/com.claude-prompt-engine.plist
# Visit http://localhost:3000
```

### Windows Package Contents

**What gets installed:**

```
C:\Program Files\claude-prompt-engine\
├── server.js
├── package.json
├── public\
├── core\
├── node_modules\
└── ...
```

**System integration:**

- Start Menu: `Start → Claude Prompt Engine`
- Desktop Shortcut: `Claude Engine`
- PATH: Application added to system PATH
- Uninstall: Control Panel → Programs → Uninstall

**Installation:**
1. Double-click `*.exe` file
2. Follow installation wizard
3. Choose installation directory
4. Creates shortcuts automatically

**Access after install:**
```bash
# Via Start Menu or desktop shortcut
# Or in PowerShell:
cd "C:\Program Files\claude-prompt-engine"
npm start
# Visit http://localhost:3000
```

## 🔄 CI/CD Automation

### GitHub Actions Workflow

The workflow `.github/workflows/build-installers.yml` automatically:

1. **Triggered by:**
   - Pushing a version tag: `git push origin v1.0.0`
   - Publishing a GitHub Release
   - Manual dispatch from Actions tab

2. **Builds on all platforms:**
   - Ubuntu (for .deb, .rpm)
   - macOS (for .pkg, .dmg)
   - Windows (for .exe)

3. **Tests installation:**
   - Verifies each package installs correctly
   - Checks service/app starts
   - Validates directory structure

4. **Creates Release:**
   - Packages all installers
   - Generates SHA256 checksums
   - Creates GitHub Release
   - Tags release with version

### Triggering Automated Builds

**Via version tag:**
```bash
git tag v1.0.0
git push origin v1.0.0
# Workflow starts automatically
# Check: https://github.com/yourusername/repo/actions
```

**Via Release UI:**
1. Go to GitHub → Releases
2. Click "Create a new release"
3. Fill in version (e.g., v1.0.0)
4. Publish release
5. Workflow starts automatically

**Via Manual Dispatch:**
1. Go to GitHub → Actions
2. Select "Build Self-Contained Installers"
3. Click "Run workflow"
4. Enter version number
5. Click "Run"

## 🎯 Distribution Channels

After building, distribute installers via:

### 1. GitHub Releases (Recommended)

- Automatic creation via CI/CD
- Direct download links
- Version history
- Changelog support

```
https://github.com/yourusername/claude-prompt-engine/releases
```

### 2. Package Repositories

**Debian/Ubuntu:**
```bash
# Create Debian repository
apt-ftparchive generate apt.conf

# Users can then:
sudo add-apt-repository ppa:yourusername/claude-engine
sudo apt-get install claude-prompt-engine
```

**Fedora/RHEL:**
```bash
# Create RPM repository
createrepo ./repo/

# Users can then:
sudo dnf install claude-prompt-engine
```

### 3. Homebrew (macOS/Linux)

Create tap repository:
```bash
# Create repo: homebrew-claude-engine

# Formula file: claude-engine.rb
class ClaudeEngine < Formula
  desc "Claude Prompt Engine"
  homepage "https://github.com/yourusername/claude-prompt-engine"
  url "https://github.com/yourusername/claude-prompt-engine/releases/download/v1.0.0/Claude-Engine-1.0.0.dmg"
  version "1.0.0"
  sha256 "YOUR_SHA256_HERE"

  def install
    app.install "Claude Engine.app"
  end
end
```

Users can then:
```bash
brew tap yourusername/claude-engine
brew install claude-engine
```

### 4. Chocolatey (Windows)

Create Chocolatey package:
```bash
choco new claude-engine
# Edit claude-engine.nuspec
choco pack
choco push claude-engine.*.nupkg --source=https://push.chocolatey.org/
```

Users can then:
```powershell
choco install claude-engine
```

### 5. Direct Download

Host on your website:
```
https://yoursite.com/downloads/claude-engine-1.0.0.deb
https://yoursite.com/downloads/Claude-Engine-1.0.0.dmg
https://yoursite.com/downloads/claude-engine-setup.exe
```

## 🔐 Security

### Signing Packages (Optional)

**Linux packages:**
```bash
# Sign DEB package
dpkg-sig -k YOUR_KEY_ID -s builder -g "--detach-sign --armor" *.deb

# Sign RPM package
rpmsign --addsign *.rpm
```

**macOS packages:**
```bash
# Codesign DMG
codesign -s - *.dmg

# Notarize DMG (required for distribution)
xcrun notarytool submit *.dmg --apple-id "your@email.com"
```

**Windows packages:**
```powershell
# Sign EXE with certificate
signtool sign /f certificate.pfx /p PASSWORD installer.exe
```

### Verification

Users can verify integrity:

```bash
# Linux
sha256sum -c SHA256SUMS

# macOS
shasum -a 256 *.dmg

# Windows (PowerShell)
$(Get-FileHash installer.exe).Hash -eq $expected_hash
```

## 📊 File Sizes (Approximate)

```
claude-engine-1.0.0.deb    ~150MB  (with Node.js)
claude-engine-1.0.0.rpm    ~160MB  (with Node.js)
Claude-Engine-1.0.0.pkg    ~200MB  (with Node.js)
Claude-Engine-1.0.0.dmg    ~220MB  (with Node.js)
claude-engine-setup.exe    ~250MB  (with Node.js)
```

## 🆘 Troubleshooting

### Build fails: "fpm not found"

**Linux:**
```bash
sudo gem install fpm
```

### Build fails: "NSIS not found"

**Windows:**
```powershell
choco install nsis -y
# Or download from https://nsis.sourceforge.io/
```

### Installation fails: "Permission denied"

**Linux:**
```bash
sudo dpkg -i *.deb
sudo apt-get install -f -y
```

**macOS:**
```bash
sudo installer -pkg *.pkg -target /
```

### Service won't start

**Linux:**
```bash
sudo systemctl status claude-prompt-engine
sudo systemctl start claude-prompt-engine
sudo journalctl -u claude-prompt-engine
```

**macOS:**
```bash
launchctl load ~/Library/LaunchAgents/com.claude-prompt-engine.plist
tail -f /var/log/claude-engine.log
```

## 📝 Customization

### Change Installation Path

Edit build scripts to change installation directory:

```bash
# In build/build-all.sh
APP_DIR="/custom/path/claude-prompt-engine"
```

### Add Custom Services

Modify post-install scripts:

```bash
# In build/scripts/deb-postinstall.sh
# Add custom service configuration
```

### Include Additional Files

Modify staging directory in build-all.sh:

```bash
# Copy additional files
cp -r custom-files "$staging/"
```

## 🎯 Next Steps

1. **Prepare release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Watch CI/CD build:**
   - Go to GitHub Actions
   - Monitor build progress
   - Download artifacts or create release

3. **Distribute installers:**
   - Share GitHub Release link
   - Upload to package repositories
   - Create Homebrew/Chocolatey taps

4. **User installation:**
   - Windows: Double-click .exe
   - macOS: Double-click .dmg or .pkg
   - Linux: `sudo apt-get install` or `sudo dnf install`

## 📚 Resources

- [FPM Documentation](https://github.com/jordansissel/fpm)
- [NSIS Documentation](https://nsis.sourceforge.io/Docs/)
- [macOS Installer Guide](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchDaemons.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Homebrew Tap Guide](https://docs.brew.sh/Taps)
- [Chocolatey Package Guide](https://docs.chocolatey.org/)

---

**Version 1.0** | Self-Contained Package Builder  
Created with GitHub Copilot | Production Ready ✅
