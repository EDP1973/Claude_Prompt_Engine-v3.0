/**
 * Learning Engine - Self-Learning & Optimization System
 * Tracks prompt effectiveness, learns user patterns, improves recommendations
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class LearningEngine {
    constructor(dbPath = './memory/learning.db') {
        this.dbPath = dbPath;
        this.db = null;
        this.init();
    }

    /**
     * Initialize learning database
     */
    init() {
        this.db = new sqlite3.Database(this.dbPath);
        this.createTables();
    }

    /**
     * Create learning database tables
     */
    createTables() {
        const queries = [
            // Track prompt usage and effectiveness
            `CREATE TABLE IF NOT EXISTS prompt_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt_id TEXT NOT NULL,
                prompt_text TEXT NOT NULL,
                model TEXT NOT NULL,
                language TEXT NOT NULL,
                project_type TEXT NOT NULL,
                purpose TEXT NOT NULL,
                user_rating INTEGER,
                success_score REAL DEFAULT 0,
                usage_count INTEGER DEFAULT 0,
                avg_execution_time INTEGER DEFAULT 0,
                errors_count INTEGER DEFAULT 0,
                improvements_made TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(prompt_id)
            )`,

            // Track user preferences
            `CREATE TABLE IF NOT EXISTS user_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE NOT NULL,
                preferred_models TEXT DEFAULT '[]',
                preferred_languages TEXT DEFAULT '[]',
                preferred_project_types TEXT DEFAULT '[]',
                preferred_purposes TEXT DEFAULT '[]',
                coding_style TEXT,
                experience_level TEXT,
                avg_rating REAL DEFAULT 0,
                total_prompts_used INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Track prompt variations and improvements
            `CREATE TABLE IF NOT EXISTS prompt_iterations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt_id TEXT NOT NULL,
                version INTEGER DEFAULT 1,
                original_text TEXT NOT NULL,
                improved_text TEXT,
                improvement_reason TEXT,
                effectiveness_gain REAL DEFAULT 0,
                user_feedback TEXT,
                applied INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(prompt_id) REFERENCES prompt_metrics(prompt_id)
            )`,

            // Track user feedback
            `CREATE TABLE IF NOT EXISTS user_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                prompt_id TEXT NOT NULL,
                rating INTEGER NOT NULL,
                comment TEXT,
                helpful BOOLEAN DEFAULT 1,
                issues_found TEXT,
                suggestions TEXT,
                generated_code_quality TEXT,
                execution_success BOOLEAN DEFAULT 1,
                execution_error TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(prompt_id) REFERENCES prompt_metrics(prompt_id)
            )`,

            // Track frequently used combinations
            `CREATE TABLE IF NOT EXISTS pattern_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model TEXT NOT NULL,
                language TEXT NOT NULL,
                project_type TEXT NOT NULL,
                purpose TEXT NOT NULL,
                frequency INTEGER DEFAULT 1,
                avg_success_rate REAL DEFAULT 0,
                recommended BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(model, language, project_type, purpose)
            )`,

            // Track model performance
            `CREATE TABLE IF NOT EXISTS model_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model TEXT UNIQUE NOT NULL,
                total_uses INTEGER DEFAULT 0,
                avg_success_rate REAL DEFAULT 0,
                avg_rating REAL DEFAULT 0,
                quality_score REAL DEFAULT 0,
                reliability_score REAL DEFAULT 0,
                speed_score REAL DEFAULT 0,
                recommendations_count INTEGER DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Learning suggestions
            `CREATE TABLE IF NOT EXISTS learning_suggestions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                suggestion_type TEXT NOT NULL,
                target_type TEXT NOT NULL,
                target_id TEXT NOT NULL,
                suggestion TEXT NOT NULL,
                confidence_score REAL DEFAULT 0,
                implemented BOOLEAN DEFAULT 0,
                result TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Track system improvements made
            `CREATE TABLE IF NOT EXISTS system_improvements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                improvement_type TEXT NOT NULL,
                description TEXT NOT NULL,
                affected_items TEXT,
                effectiveness_improvement REAL,
                applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                rollback_available BOOLEAN DEFAULT 0
            )`
        ];

        queries.forEach(query => {
            this.db.run(query, (err) => {
                if (err) console.error('DB Error:', err.message);
            });
        });
    }

    /**
     * Record prompt usage and effectiveness
     */
    recordPromptUsage(promptData) {
        return new Promise((resolve, reject) => {
            const {
                promptId, promptText, model, language, projectType, purpose
            } = promptData;

            const sql = `
                INSERT INTO prompt_metrics 
                (prompt_id, prompt_text, model, language, project_type, purpose)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(prompt_id) DO UPDATE SET
                    usage_count = usage_count + 1,
                    updated_at = CURRENT_TIMESTAMP
            `;

            this.db.run(sql, [promptId, promptText, model, language, projectType, purpose], 
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, changes: this.changes });
                }
            );
        });
    }

    /**
     * Record user feedback on prompt
     */
    recordFeedback(feedbackData) {
        return new Promise((resolve, reject) => {
            const {
                userId, promptId, rating, comment, helpful, 
                codeQuality, executionSuccess, executionError
            } = feedbackData;

            const sql = `
                INSERT INTO user_feedback 
                (user_id, prompt_id, rating, comment, helpful, 
                 generated_code_quality, execution_success, execution_error)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(sql, 
                [userId, promptId, rating, comment, helpful, codeQuality, 
                 executionSuccess, executionError],
                function(err) {
                    if (err) reject(err);
                    else {
                        // Update prompt metrics
                        this.updatePromptMetrics(promptId, rating);
                        // Update user preferences
                        this.updateUserPreferences(userId, feedbackData);
                        resolve({ id: this.lastID });
                    }
                }
            );
        });
    }

    /**
     * Update prompt metrics based on feedback
     */
    updatePromptMetrics(promptId, rating) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE prompt_metrics 
                SET user_rating = COALESCE(
                    (SELECT AVG(rating) FROM user_feedback WHERE prompt_id = ?),
                    0
                ),
                success_score = COALESCE(
                    (SELECT CAST(SUM(CASE WHEN execution_success = 1 THEN 1 ELSE 0 END) AS REAL) / COUNT(*) 
                     FROM user_feedback WHERE prompt_id = ?),
                    0
                )
                WHERE prompt_id = ?
            `;

            this.db.run(sql, [promptId, promptId, promptId], (err) => {
                if (err) reject(err);
                else resolve(true);
            });
        });
    }

    /**
     * Update user preferences based on feedback
     */
    updateUserPreferences(userId, feedbackData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO user_preferences (user_id)
                VALUES (?)
                ON CONFLICT(user_id) DO UPDATE SET
                    total_prompts_used = total_prompts_used + 1,
                    avg_rating = (SELECT AVG(rating) FROM user_feedback WHERE user_id = ?),
                    updated_at = CURRENT_TIMESTAMP
            `;

            this.db.run(sql, [userId, userId], (err) => {
                if (err) reject(err);
                else resolve(true);
            });
        });
    }

    /**
     * Analyze usage patterns and identify best combinations
     */
    analyzePatterns() {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT OR REPLACE INTO pattern_analysis 
                (model, language, project_type, purpose, frequency, avg_success_rate)
                SELECT 
                    model, language, project_type, purpose,
                    COUNT(*) as frequency,
                    AVG(success_score) as avg_success_rate
                FROM prompt_metrics
                GROUP BY model, language, project_type, purpose
                HAVING frequency > 2
            `;

            this.db.run(sql, function(err) {
                if (err) reject(err);
                else resolve({ patterns: this.changes });
            });
        });
    }

    /**
     * Get top performing prompts
     */
    getTopPrompts(limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    prompt_id, prompt_text, model, language, 
                    project_type, purpose, success_score, 
                    usage_count, user_rating
                FROM prompt_metrics
                WHERE success_score > 0
                ORDER BY success_score DESC, usage_count DESC
                LIMIT ?
            `;

            this.db.all(sql, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Get recommended prompts for user
     */
    getRecommendations(userId, limit = 5) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    pm.prompt_id, pm.prompt_text, pm.model, 
                    pm.language, pm.project_type, pm.purpose,
                    pm.success_score, pm.user_rating,
                    pa.frequency as popularity
                FROM prompt_metrics pm
                LEFT JOIN pattern_analysis pa ON 
                    pm.model = pa.model AND 
                    pm.language = pa.language AND
                    pm.project_type = pa.project_type AND
                    pm.purpose = pa.purpose
                WHERE pm.success_score > 0.7
                ORDER BY pm.success_score DESC, pa.frequency DESC
                LIMIT ?
            `;

            this.db.all(sql, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Get user profile and preferences
     */
    getUserProfile(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM user_preferences WHERE user_id = ?
            `;

            this.db.get(sql, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row || {});
            });
        });
    }

    /**
     * Generate improvement suggestions
     */
    generateSuggestions() {
        return new Promise((resolve, reject) => {
            // Find low-performing prompts
            const lowPerformingSql = `
                SELECT 
                    prompt_id, model, language, project_type,
                    success_score, usage_count
                FROM prompt_metrics
                WHERE usage_count > 5 AND success_score < 0.5
                ORDER BY success_score ASC
                LIMIT 5
            `;

            this.db.all(lowPerformingSql, (err, rows) => {
                if (err) reject(err);
                else {
                    const suggestions = rows.map(row => ({
                        type: 'IMPROVE_PROMPT',
                        target: row.prompt_id,
                        reason: `Low success rate (${(row.success_score * 100).toFixed(1)}%) after ${row.usage_count} uses`,
                        recommendation: `Consider revising prompt for ${row.language} ${row.project_type} projects`,
                        confidence: 0.8
                    }));

                    resolve(suggestions);
                }
            });
        });
    }

    /**
     * Get model performance analytics
     */
    getModelAnalytics() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    model,
                    COUNT(*) as total_prompts,
                    AVG(success_score) as avg_success_rate,
                    AVG(user_rating) as avg_user_rating,
                    SUM(usage_count) as total_uses
                FROM prompt_metrics
                GROUP BY model
                ORDER BY avg_success_rate DESC
            `;

            this.db.all(sql, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
    }

    /**
     * Get learning statistics
     */
    getLearningStats() {
        return new Promise((resolve, reject) => {
            const stats = {};

            // Total prompts tracked
            this.db.get('SELECT COUNT(*) as count FROM prompt_metrics', (err, row) => {
                stats.totalPrompts = row?.count || 0;

                // Average success rate
                this.db.get('SELECT AVG(success_score) as avg FROM prompt_metrics', (err, row) => {
                    stats.avgSuccessRate = row?.avg || 0;

                    // Total feedback received
                    this.db.get('SELECT COUNT(*) as count FROM user_feedback', (err, row) => {
                        stats.totalFeedback = row?.count || 0;

                        // Unique users
                        this.db.get('SELECT COUNT(DISTINCT user_id) as count FROM user_feedback', (err, row) => {
                            stats.uniqueUsers = row?.count || 0;

                            // Most common combinations
                            this.db.all(`
                                SELECT model, language, project_type, purpose, frequency
                                FROM pattern_analysis
                                WHERE frequency > 1
                                ORDER BY frequency DESC
                                LIMIT 5
                            `, (err, rows) => {
                                stats.topCombinations = rows || [];
                                resolve(stats);
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Export learning data
     */
    exportLearningData() {
        return new Promise((resolve, reject) => {
            const exportData = {
                timestamp: new Date().toISOString(),
                stats: {},
                topPrompts: [],
                userPreferences: [],
                patterns: [],
                suggestions: []
            };

            // Get all data
            this.getLearningStats().then(stats => {
                exportData.stats = stats;
                return this.getTopPrompts(20);
            }).then(prompts => {
                exportData.topPrompts = prompts;
                return this.analyzePatterns();
            }).then(() => {
                const fs = require('fs');
                const filePath = path.join('./memory/learning-export-' + Date.now() + '.json');
                fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));
                resolve({ exported: filePath, size: JSON.stringify(exportData).length });
            }).catch(err => reject(err));
        });
    }

    /**
     * Close database connection
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            }
        });
    }
}

module.exports = LearningEngine;
