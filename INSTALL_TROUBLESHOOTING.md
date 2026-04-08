# Installation Troubleshooting Guide

## Problem: "Cannot find module 'sqlite3'"

This error occurs when `node_modules` hasn't been properly installed or has permission issues.

### Solution 1: Fresh Installation (Recommended)

```bash
# Clean everything
rm -rf node_modules package-lock.json

# Fresh install
npm install

# Start server
npm run web
```

### Solution 2: If You Have Permission Issues

If you see "EACCES: permission denied" errors:

```bash
# Navigate to project directory
cd claude-prompt-engine

# Remove problematic node_modules
rm -rf node_modules

# Clean npm cache
npm cache clean --force

# Reinstall with fresh permissions
npm install
```

### Solution 3: Quick Fix for Existing Issues

The cleanest way is to use a fresh clone:

```bash
cd /tmp
rm -rf my-install
git clone <repository-url> my-install
cd my-install
npm install
npm run web
```

## Why This Happens

- **Root-owned node_modules**: Previous installations created node_modules owned by root, causing permission issues
- **Corrupted cache**: npm cache can contain stale references
- **Platform differences**: Different OS have different permission models

## Prevention

1. Always run `npm install` in a clean directory
2. Use the provided `start.sh` and `install.sh` scripts
3. Don't mix sudo and regular npm commands
4. Keep `.gitignore` excluding `node_modules/`

## Complete Fresh Start

If nothing else works:

```bash
# 1. Navigate somewhere else
cd /tmp

# 2. Clone fresh
git clone <repository-url> cpe-fresh
cd cpe-fresh

# 3. Install
bash install.sh

# 4. Run
./start.sh
```

## Verification

After installation, verify everything works:

```bash
# Check Node.js
node -v

# Check npm
npm -v

# Check dependencies
npm list sqlite3

# Test server startup
npm run web
```

You should see:
```
✅ Database connected
✅ Database schema initialized
✅ Phase 1 modules loaded
✅ Phase 2 UI components available
✨ Claude Prompt Engine - Phase 3 Server Ready
```

## If Issues Persist

1. Check Node.js version: `node -v` (should be v18+)
2. Check npm version: `npm -v` (should be v9+)
3. Check disk space: `df -h`
4. Check permissions: `ls -la node_modules | head`
5. Run diagnostic: `npm doctor`

## Support

For additional help, see:
- COMPREHENSIVE_DOCS.md - Full documentation
- INSTALLATION_GUIDE.md - Detailed installation steps
- GitHub Issues - Report problems
