/**
 * Update Manager - Automatic Update & Upgrade System
 * Checks for updates, downloads patches, manages versions
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class UpdateManager {
    constructor(config = {}) {
        this.config = {
            repoOwner: config.repoOwner || 'yourusername',
            repoName: config.repoName || 'claude-prompt-engine',
            checkInterval: config.checkInterval || 86400000, // 24 hours
            autoUpdate: config.autoUpdate !== false,
            updateDir: config.updateDir || './updates',
            currentVersion: config.currentVersion || this.readVersion(),
            ...config
        };

        this.updateCheckUrl = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/releases/latest`;
        this.lastCheckTime = null;
        this.updateAvailable = false;
        this.updateInfo = null;

        this.ensureUpdateDir();
    }

    /**
     * Read current version from package.json
     */
    readVersion() {
        try {
            const packageJson = require('../../package.json');
            return packageJson.version || '1.0.0';
        } catch (err) {
            return '1.0.0';
        }
    }

    /**
     * Ensure update directory exists
     */
    ensureUpdateDir() {
        if (!fs.existsSync(this.config.updateDir)) {
            fs.mkdirSync(this.config.updateDir, { recursive: true });
        }
    }

    /**
     * Check for updates from GitHub
     */
    async checkForUpdates() {
        try {
            console.log('[UPDATE] Checking for updates...');

            const release = await this.fetchLatestRelease();
            
            if (!release) {
                console.log('[UPDATE] No releases found');
                return { available: false };
            }

            const latestVersion = release.tag_name.replace(/^v/, '');
            const currentVersion = this.config.currentVersion;

            if (this.isNewerVersion(latestVersion, currentVersion)) {
                console.log(`[UPDATE] New version available: ${latestVersion} (current: ${currentVersion})`);
                this.updateAvailable = true;
                this.updateInfo = {
                    version: latestVersion,
                    releaseNotes: release.body,
                    downloadUrl: release.assets[0]?.browser_download_url,
                    publishedAt: release.published_at,
                    assets: release.assets
                };

                this.lastCheckTime = Date.now();
                return { available: true, ...this.updateInfo };
            } else {
                console.log(`[UPDATE] You have the latest version (${currentVersion})`);
                this.lastCheckTime = Date.now();
                return { available: false, currentVersion };
            }
        } catch (err) {
            console.error('[UPDATE] Error checking for updates:', err.message);
            return { available: false, error: err.message };
        }
    }

    /**
     * Fetch latest release from GitHub API
     */
    async fetchLatestRelease() {
        return new Promise((resolve, reject) => {
            https.get(this.updateCheckUrl, {
                headers: {
                    'User-Agent': 'Claude-Prompt-Engine',
                    'Accept': 'application/vnd.github.v3+json'
                }
            }, (res) => {
                let data = '';

                res.on('data', chunk => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.message === 'Not Found') {
                            resolve(null);
                        } else {
                            resolve(response);
                        }
                    } catch (err) {
                        reject(err);
                    }
                });
            }).on('error', reject);
        });
    }

    /**
     * Compare versions (returns true if version1 > version2)
     */
    isNewerVersion(version1, version2) {
        const v1 = version1.split('.').map(Number);
        const v2 = version2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const n1 = v1[i] || 0;
            const n2 = v2[i] || 0;
            if (n1 > n2) return true;
            if (n1 < n2) return false;
        }
        return false;
    }

    /**
     * Download update package
     */
    async downloadUpdate(updateInfo = this.updateInfo) {
        if (!updateInfo) {
            throw new Error('No update information available');
        }

        try {
            console.log(`[UPDATE] Downloading update version ${updateInfo.version}...`);

            const downloadPath = path.join(this.config.updateDir, `update-${updateInfo.version}.zip`);

            return new Promise((resolve, reject) => {
                const file = fs.createWriteStream(downloadPath);
                
                https.get(updateInfo.downloadUrl, (res) => {
                    let downloaded = 0;
                    const total = parseInt(res.headers['content-length'], 10);

                    res.on('data', (chunk) => {
                        downloaded += chunk.length;
                        const progress = Math.round((downloaded / total) * 100);
                        console.log(`[UPDATE] Download progress: ${progress}%`);
                    });

                    res.pipe(file);

                    file.on('finish', () => {
                        file.close();
                        console.log(`[UPDATE] Download complete: ${downloadPath}`);
                        resolve({
                            path: downloadPath,
                            size: fs.statSync(downloadPath).size,
                            version: updateInfo.version
                        });
                    });
                }).on('error', (err) => {
                    fs.unlink(downloadPath, () => {}); // Delete incomplete file
                    reject(err);
                });
            });
        } catch (err) {
            console.error('[UPDATE] Download error:', err.message);
            throw err;
        }
    }

    /**
     * Verify update package integrity
     */
    async verifyUpdate(updatePath, checksumUrl) {
        try {
            console.log('[UPDATE] Verifying update integrity...');

            const fileContent = fs.readFileSync(updatePath);
            const fileChecksum = crypto.createHash('sha256').update(fileContent).digest('hex');

            if (checksumUrl) {
                const expectedChecksum = await this.fetchChecksum(checksumUrl);
                if (fileChecksum !== expectedChecksum) {
                    throw new Error('Checksum mismatch - package may be corrupted');
                }
            }

            console.log('[UPDATE] Verification passed');
            return { verified: true, checksum: fileChecksum };
        } catch (err) {
            console.error('[UPDATE] Verification error:', err.message);
            throw err;
        }
    }

    /**
     * Fetch checksum from GitHub
     */
    async fetchChecksum(checksumUrl) {
        return new Promise((resolve, reject) => {
            https.get(checksumUrl, (res) => {
                let data = '';
                res.on('data', chunk => { data += chunk; });
                res.on('end', () => {
                    const match = data.match(/^([a-f0-9]{64})/m);
                    resolve(match ? match[1] : '');
                });
            }).on('error', reject);
        });
    }

    /**
     * Create backup before update
     */
    async createBackup() {
        try {
            console.log('[UPDATE] Creating backup...');

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(this.config.updateDir, `backup-${timestamp}`);

            // Create backup of important files
            const filesToBackup = [
                'package.json',
                'server.js',
                'public/',
                'core/',
                '.env'
            ];

            fs.mkdirSync(backupDir, { recursive: true });

            for (const file of filesToBackup) {
                const source = path.join(process.cwd(), file);
                const dest = path.join(backupDir, file);

                if (fs.existsSync(source)) {
                    if (fs.statSync(source).isDirectory()) {
                        this.copyDir(source, dest);
                    } else {
                        fs.copyFileSync(source, dest);
                    }
                }
            }

            console.log(`[UPDATE] Backup created: ${backupDir}`);
            return backupDir;
        } catch (err) {
            console.error('[UPDATE] Backup error:', err.message);
            throw err;
        }
    }

    /**
     * Recursively copy directory
     */
    copyDir(src, dest) {
        fs.mkdirSync(dest, { recursive: true });
        const files = fs.readdirSync(src);

        files.forEach(file => {
            const srcFile = path.join(src, file);
            const destFile = path.join(dest, file);

            if (fs.statSync(srcFile).isDirectory()) {
                this.copyDir(srcFile, destFile);
            } else {
                fs.copyFileSync(srcFile, destFile);
            }
        });
    }

    /**
     * Apply update (install files)
     */
    async applyUpdate(updatePath) {
        try {
            console.log('[UPDATE] Applying update...');

            // Create backup first
            const backupPath = await this.createBackup();

            // Extract and apply update
            const { stdout, stderr } = await execAsync(`cd ${process.cwd()} && unzip -o ${updatePath}`);

            console.log('[UPDATE] Update files extracted');

            // Install npm dependencies
            console.log('[UPDATE] Installing dependencies...');
            await execAsync('npm install --production');

            console.log('[UPDATE] Update applied successfully');
            console.log(`[UPDATE] Backup available at: ${backupPath}`);

            return {
                success: true,
                backupPath,
                appliedAt: new Date().toISOString()
            };
        } catch (err) {
            console.error('[UPDATE] Update application error:', err.message);
            throw err;
        }
    }

    /**
     * Rollback to previous version
     */
    async rollback(backupPath) {
        try {
            console.log('[UPDATE] Rolling back to backup...');

            if (!fs.existsSync(backupPath)) {
                throw new Error(`Backup not found: ${backupPath}`);
            }

            // Restore from backup
            const filesToRestore = fs.readdirSync(backupPath);

            for (const file of filesToRestore) {
                const source = path.join(backupPath, file);
                const dest = path.join(process.cwd(), file);

                if (fs.statSync(source).isDirectory()) {
                    // Remove current and restore from backup
                    if (fs.existsSync(dest)) {
                        fs.rmSync(dest, { recursive: true });
                    }
                    this.copyDir(source, dest);
                } else {
                    fs.copyFileSync(source, dest);
                }
            }

            console.log('[UPDATE] Rollback complete');
            return { success: true, restoredFrom: backupPath };
        } catch (err) {
            console.error('[UPDATE] Rollback error:', err.message);
            throw err;
        }
    }

    /**
     * Schedule automatic update checks
     */
    startAutoCheck() {
        console.log('[UPDATE] Starting automatic update checks...');

        // Check immediately
        this.checkForUpdates();

        // Check periodically
        setInterval(() => {
            this.checkForUpdates().then(result => {
                if (result.available && this.config.autoUpdate) {
                    console.log('[UPDATE] Update available - auto-downloading...');
                    this.downloadUpdate(result).catch(err => {
                        console.error('[UPDATE] Auto-download failed:', err.message);
                    });
                }
            });
        }, this.config.checkInterval);

        return true;
    }

    /**
     * Get update status
     */
    getStatus() {
        return {
            currentVersion: this.config.currentVersion,
            updateAvailable: this.updateAvailable,
            latestVersion: this.updateInfo?.version,
            lastCheckTime: this.lastCheckTime ? new Date(this.lastCheckTime) : null,
            autoUpdateEnabled: this.config.autoUpdate,
            updateInfo: this.updateInfo
        };
    }

    /**
     * Get available backups
     */
    getBackups() {
        try {
            const backups = [];
            const files = fs.readdirSync(this.config.updateDir);

            files.forEach(file => {
                if (file.startsWith('backup-')) {
                    const fullPath = path.join(this.config.updateDir, file);
                    const stat = fs.statSync(fullPath);
                    backups.push({
                        name: file,
                        path: fullPath,
                        size: stat.size,
                        created: stat.birthtime
                    });
                }
            });

            return backups.sort((a, b) => b.created - a.created);
        } catch (err) {
            console.error('[UPDATE] Error reading backups:', err.message);
            return [];
        }
    }

    /**
     * Get update history
     */
    getUpdateHistory() {
        try {
            const historyFile = path.join(this.config.updateDir, 'update-history.json');

            if (fs.existsSync(historyFile)) {
                return JSON.parse(fs.readFileSync(historyFile, 'utf8'));
            }
            return [];
        } catch (err) {
            console.error('[UPDATE] Error reading history:', err.message);
            return [];
        }
    }

    /**
     * Log update event
     */
    async logUpdateEvent(event) {
        try {
            const historyFile = path.join(this.config.updateDir, 'update-history.json');
            let history = this.getUpdateHistory();

            history.push({
                timestamp: new Date().toISOString(),
                ...event
            });

            fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
        } catch (err) {
            console.error('[UPDATE] Error logging event:', err.message);
        }
    }
}

module.exports = UpdateManager;
