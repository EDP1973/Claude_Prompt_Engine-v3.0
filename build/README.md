# Building Self-Contained Installers

## What Are Self-Contained Packages?

Instead of users running terminal scripts, they get **native installers** like any normal application:

- **Linux users** get: `*.deb` or `*.rpm` files
  - Double-click or `sudo apt-get install` to install
  - Automatic service setup
  - System integration

- **macOS users** get: `*.dmg` or `*.pkg` files
  - Double-click and drag-to-Applications, or run .pkg installer
  - Auto-start configured
  - Application bundle integration

- **Windows users** get: `*.exe` file
  - Double-click installer.exe
  - GUI wizard with options
  - Start Menu shortcuts, Desktop icon
  - Add/Remove Programs integration

## Complete Build System Created

```
build/
├── build-all.sh ..................... Main build script (500+ lines)
├── scripts/
│   ├── deb-preinstall.sh ............ Debian pre-install
│   ├── deb-postinstall.sh ........... Debian post-install (auto-start service)
│   ├── deb-preuninstall.sh .......... Debian pre-uninstall
│   ├── deb-afterremove.sh ........... Debian cleanup
│   ├── rpm-preinstall.sh ............ RPM pre-install
│   ├── rpm-postinstall.sh ........... RPM post-install
│   ├── rpm-preuninstall.sh .......... RPM pre-uninstall
│   ├── rpm-afterremove.sh ........... RPM cleanup
│   └── macos-postinstall.sh ......... macOS post-install (LaunchAgent setup)
├── BUILD_GUIDE.md ................... Complete build documentation
└── README.md ........................ Overview

.github/workflows/
└── build-installers.yml ............ Automated CI/CD workflow
```

## How It Works

### 1. Preparation
- Copies application files
- Installs dependencies
- Creates staging directory

### 2. Platform Detection
- **On Linux**: Builds .deb and .rpm
- **On macOS**: Builds .pkg and .dmg  
- **On Windows**: Builds .exe

### 3. Package Creation
- Bundles Node.js runtime
- Includes all app files
- Configures auto-start services
- Creates GUI installers

### 4. Output
- Generates native installers in `dist/` directory
- Creates SHA256 checksums
- Ready for distribution

## What Gets Installed

### Linux (.deb, .rpm)
```
/opt/claude-prompt-engine/
├── Application files
├── Node.js executable
├── All dependencies
└── Pre-configured systemd service
```
- Service auto-starts on boot
- Accessible at http://localhost:3000
- Command: `sudo systemctl start claude-prompt-engine`

### macOS (.pkg, .dmg)
```
/Applications/claude-prompt-engine/
├── Application bundle
├── Node.js executable
├── All dependencies
└── LaunchAgent for auto-start
```
- App auto-starts on login
- Accessible at http://localhost:3000

### Windows (.exe)
```
C:\Program Files\claude-prompt-engine\
├── Application files
├── Node.js executable
├── All dependencies
├── Start Menu shortcuts
└── Desktop shortcut
```
- Accessible at http://localhost:3000

## Quick Start

### Automated (Recommended)

**Via GitHub Actions:**
```bash
git tag v1.0.0
git push origin v1.0.0
```
→ Workflow automatically builds all platforms
→ Creates GitHub Release with installers

### Manual Build

**On Linux** (creates .deb, .rpm):
```bash
bash build/build-all.sh 1.0.0
# Output: dist/claude-engine-1.0.0.deb, .rpm
```

**On macOS** (creates .pkg, .dmg):
```bash
bash build/build-all.sh 1.0.0
# Output: dist/Claude-Engine-1.0.0.pkg, .dmg
```

**On Windows** (creates .exe):
```bash
bash build/build-all.sh 1.0.0
# Output: dist/claude-engine-setup.exe
```

## Build Requirements

**All platforms:**
- Node.js 18+
- npm 8+
- Git
- 500MB free space

**Linux (for building packages):**
```bash
sudo gem install fpm
```

**macOS:**
- Built-in tools (pkgbuild, hdiutil)
- Just needs macOS 10.13+

**Windows:**
```powershell
choco install nsis -y
```

## CI/CD Pipeline

GitHub Actions workflow automatically:

1. **Builds on all platforms**
   - Ubuntu → .deb + .rpm
   - macOS → .pkg + .dmg
   - Windows → .exe

2. **Tests each package**
   - Verifies installation
   - Checks service starts
   - Validates directories

3. **Creates Release**
   - Generates SHA256 checksums
   - Publishes to GitHub Releases
   - Tags with version

## Distribution

After building, distribute via:

1. **GitHub Releases** (easiest)
   - Direct download links
   - Version history
   - Automatic creation

2. **Package Repositories**
   - `apt` for Debian/Ubuntu
   - `dnf` for Fedora/RHEL

3. **Homebrew** (macOS/Linux)
   - `brew install claude-engine`

4. **Chocolatey** (Windows)
   - `choco install claude-engine`

5. **Direct Download**
   - Host on website
   - Share links

## Next Steps

1. **Create a release tag:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Watch GitHub Actions:**
   - Go to https://github.com/yourusername/repo/actions
   - Monitor build progress
   - Download or create release automatically

3. **Distribute installers:**
   - Share GitHub Release link
   - Users double-click to install
   - Application starts automatically

## Example Installation Experience

**Linux User:**
```bash
wget https://github.com/.../releases/download/v1.0.0/claude-engine-1.0.0.deb
sudo apt-get install ./claude-engine-1.0.0.deb
# Service starts automatically
# Open http://localhost:3000
```

**macOS User:**
1. Download `Claude-Engine-1.0.0.dmg`
2. Double-click to open
3. Drag app to Applications folder
4. Done! (LaunchAgent starts app)
5. Open http://localhost:3000

**Windows User:**
1. Download `claude-engine-setup.exe`
2. Double-click to run
3. Follow wizard (next, next, finish)
4. Click Start Menu shortcut
5. Open http://localhost:3000

## Files Created

✅ **Build System:**
- `build/build-all.sh` - Main orchestrator (500+ lines)
- `build/scripts/deb-*.sh` - Debian hooks
- `build/scripts/rpm-*.sh` - RPM hooks
- `build/scripts/macos-postinstall.sh` - macOS setup

✅ **CI/CD:**
- `.github/workflows/build-installers.yml` - GitHub Actions

✅ **Documentation:**
- `build/BUILD_GUIDE.md` - Complete guide (11KB)
- `build/README.md` - Quick reference

## Status

🎉 **Self-Contained Package System Complete!**

✅ Cross-platform installer builder
✅ Automated GitHub Actions CI/CD
✅ Package-specific post-install hooks
✅ Auto-start service configuration
✅ System integration (shortcuts, menu items)
✅ SHA256 checksums for security
✅ Ready for production distribution

Users can now install your application like any normal software!
