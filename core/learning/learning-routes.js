/**
 * Learning & Update API Routes
 * Exposes self-learning and auto-update capabilities
 */

const express = require('express');
const router = express.Router();

// Import managers (to be initialized in main server.js)
let learningEngine;
let updateManager;

/**
 * Initialize managers
 */
function initManagers(learning, updates) {
    learningEngine = learning;
    updateManager = updates;
}

// ============================================================================
// LEARNING ENGINE ENDPOINTS
// ============================================================================

/**
 * POST /api/learning/record-usage
 * Record prompt usage
 */
router.post('/learning/record-usage', async (req, res) => {
    try {
        const result = await learningEngine.recordPromptUsage(req.body);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/learning/feedback
 * Submit feedback on prompt
 */
router.post('/learning/feedback', async (req, res) => {
    try {
        const result = await learningEngine.recordFeedback(req.body);
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/learning/recommendations
 * Get personalized prompt recommendations
 */
router.get('/learning/recommendations', async (req, res) => {
    try {
        const userId = req.query.userId || 'anonymous';
        const limit = parseInt(req.query.limit) || 5;
        const recommendations = await learningEngine.getRecommendations(userId, limit);
        res.json({ success: true, data: recommendations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/learning/top-prompts
 * Get top performing prompts
 */
router.get('/learning/top-prompts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const prompts = await learningEngine.getTopPrompts(limit);
        res.json({ success: true, data: prompts });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/learning/user-profile
 * Get user profile and preferences
 */
router.get('/learning/user-profile', async (req, res) => {
    try {
        const userId = req.query.userId || 'anonymous';
        const profile = await learningEngine.getUserProfile(userId);
        res.json({ success: true, data: profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/learning/analytics
 * Get model performance analytics
 */
router.get('/learning/analytics', async (req, res) => {
    try {
        const analytics = await learningEngine.getModelAnalytics();
        res.json({ success: true, data: analytics });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/learning/stats
 * Get learning statistics
 */
router.get('/learning/stats', async (req, res) => {
    try {
        const stats = await learningEngine.getLearningStats();
        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/learning/suggestions
 * Get AI-generated improvement suggestions
 */
router.get('/learning/suggestions', async (req, res) => {
    try {
        const suggestions = await learningEngine.generateSuggestions();
        res.json({ success: true, data: suggestions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/learning/analyze-patterns
 * Analyze usage patterns
 */
router.post('/learning/analyze-patterns', async (req, res) => {
    try {
        const result = await learningEngine.analyzePatterns();
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/learning/export
 * Export learning data
 */
router.get('/learning/export', async (req, res) => {
    try {
        const result = await learningEngine.exportLearningData();
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================================================
// UPDATE MANAGER ENDPOINTS
// ============================================================================

/**
 * GET /api/updates/check
 * Check for available updates
 */
router.get('/updates/check', async (req, res) => {
    try {
        const result = await updateManager.checkForUpdates();
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/updates/status
 * Get current update status
 */
router.get('/updates/status', async (req, res) => {
    try {
        const status = updateManager.getStatus();
        res.json({ success: true, data: status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/updates/download
 * Download available update
 */
router.post('/updates/download', async (req, res) => {
    try {
        const result = await updateManager.downloadUpdate();
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/updates/apply
 * Apply downloaded update
 */
router.post('/updates/apply', async (req, res) => {
    try {
        const updatePath = req.body.updatePath;
        if (!updatePath) {
            throw new Error('Update path required');
        }

        const result = await updateManager.applyUpdate(updatePath);
        await updateManager.logUpdateEvent({
            type: 'UPDATE_APPLIED',
            version: updateManager.updateInfo?.version,
            backup: result.backupPath
        });

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/updates/rollback
 * Rollback to previous version
 */
router.post('/updates/rollback', async (req, res) => {
    try {
        const backupPath = req.body.backupPath;
        if (!backupPath) {
            throw new Error('Backup path required');
        }

        const result = await updateManager.rollback(backupPath);
        await updateManager.logUpdateEvent({
            type: 'ROLLBACK',
            from: updateManager.config.currentVersion,
            backup: backupPath
        });

        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/updates/backups
 * List available backups
 */
router.get('/updates/backups', async (req, res) => {
    try {
        const backups = updateManager.getBackups();
        res.json({ success: true, data: backups });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/updates/history
 * Get update history
 */
router.get('/updates/history', async (req, res) => {
    try {
        const history = updateManager.getUpdateHistory();
        res.json({ success: true, data: history });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/updates/toggle-auto-update
 * Enable/disable automatic updates
 */
router.post('/updates/toggle-auto-update', async (req, res) => {
    try {
        const enabled = req.body.enabled !== false;
        updateManager.config.autoUpdate = enabled;
        res.json({ 
            success: true, 
            data: { 
                autoUpdateEnabled: enabled,
                message: enabled ? 'Auto-update enabled' : 'Auto-update disabled'
            } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = { router, initManagers };
