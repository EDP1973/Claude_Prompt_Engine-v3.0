/**
 * iAI Advanced Memory System
 * ─ Episodic  : JSON files, per-session, fast read/write
 * ─ Semantic  : SQLite FTS, long-term facts + patterns
 * ─ Procedural: learned tool preferences and user habits
 */

const fs      = require('fs');
const path    = require('path');
const sqlite3 = require('sqlite3').verbose();
const EventEmitter = require('events');

const MEMORY_DIR = path.join(__dirname, '..', 'memory', 'iai');
const DB_PATH    = path.join(MEMORY_DIR, 'iai-memory.db');
const EPISODIC_DIR = path.join(MEMORY_DIR, 'episodes');

class IAIMemory extends EventEmitter {
  constructor() {
    super();
    this._db = null;
    this._sessionId = `s_${Date.now()}`;
    this._episodicCache = [];  // in-memory ring buffer (last 200 exchanges)
    this._ready = false;
    this._init();
  }

  _init() {
    // Ensure directories
    [MEMORY_DIR, EPISODIC_DIR].forEach(d => {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    });

    this._db = new sqlite3.Database(DB_PATH, err => {
      if (err) { console.error('[Memory] DB open failed:', err.message); return; }
      this._db.serialize(() => {
        // Semantic long-term memory
        this._db.run(`CREATE TABLE IF NOT EXISTS semantic (
          id        INTEGER PRIMARY KEY AUTOINCREMENT,
          category  TEXT NOT NULL,   -- 'fact'|'pattern'|'preference'|'learning'
          key       TEXT,
          content   TEXT NOT NULL,
          confidence REAL DEFAULT 1.0,
          source    TEXT,            -- where it was learned from
          access_count INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )`);
        // Full-text search index
        this._db.run(`CREATE VIRTUAL TABLE IF NOT EXISTS semantic_fts USING fts5(
          content, category, key, content=semantic, content_rowid=id
        )`);
        // Triggers to keep FTS in sync
        this._db.run(`CREATE TRIGGER IF NOT EXISTS sem_ai AFTER INSERT ON semantic BEGIN
          INSERT INTO semantic_fts(rowid, content, category, key) VALUES(new.id, new.content, new.category, new.key);
        END`);
        this._db.run(`CREATE TRIGGER IF NOT EXISTS sem_au AFTER UPDATE ON semantic BEGIN
          INSERT INTO semantic_fts(semantic_fts, rowid, content, category, key) VALUES('delete', old.id, old.content, old.category, old.key);
          INSERT INTO semantic_fts(rowid, content, category, key) VALUES(new.id, new.content, new.category, new.key);
        END`);
        // Procedural memory (tool usage stats + preferences)
        this._db.run(`CREATE TABLE IF NOT EXISTS procedural (
          tool      TEXT PRIMARY KEY,
          call_count INTEGER DEFAULT 0,
          success_count INTEGER DEFAULT 0,
          avg_duration_ms REAL DEFAULT 0,
          last_args TEXT,
          last_used TEXT
        )`);
        // Dream log
        this._db.run(`CREATE TABLE IF NOT EXISTS dream_log (
          id       INTEGER PRIMARY KEY AUTOINCREMENT,
          cycle    INTEGER,
          insights TEXT,
          actions  TEXT,
          created_at TEXT DEFAULT (datetime('now'))
        )`);
        this._ready = true;
        this.emit('ready');
      });
    });
  }

  _waitReady() {
    return new Promise(resolve => {
      if (this._ready) return resolve();
      this.once('ready', resolve);
    });
  }

  // ── Episodic memory ────────────────────────────────────────────────────

  /**
   * Record a conversation exchange to episodic memory.
   */
  addEpisode(role, content, metadata = {}) {
    const entry = {
      id: Date.now(),
      sessionId: this._sessionId,
      role,
      content: content.slice(0, 4000),
      metadata,
      ts: new Date().toISOString()
    };
    this._episodicCache.push(entry);
    if (this._episodicCache.length > 200) this._episodicCache.shift();

    // Persist to disk
    const file = path.join(EPISODIC_DIR, `${this._sessionId}.jsonl`);
    fs.appendFileSync(file, JSON.stringify(entry) + '\n');
    return entry;
  }

  /**
   * Get recent episodic memory (last N exchanges).
   */
  getRecentEpisodes(n = 20) {
    return this._episodicCache.slice(-n);
  }

  /**
   * Load a past session's episodes.
   */
  loadSession(sessionId) {
    const file = path.join(EPISODIC_DIR, `${sessionId}.jsonl`);
    if (!fs.existsSync(file)) return [];
    return fs.readFileSync(file, 'utf8')
      .split('\n').filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  }

  /**
   * List all past sessions.
   */
  listSessions() {
    return fs.readdirSync(EPISODIC_DIR)
      .filter(f => f.endsWith('.jsonl'))
      .map(f => ({
        sessionId: f.replace('.jsonl', ''),
        file: path.join(EPISODIC_DIR, f),
        size: fs.statSync(path.join(EPISODIC_DIR, f)).size
      }));
  }

  // ── Semantic memory ────────────────────────────────────────────────────

  /**
   * Store a long-term fact / pattern / preference.
   */
  async remember(category, content, { key = null, confidence = 1.0, source = null } = {}) {
    await this._waitReady();
    return new Promise((resolve, reject) => {
      // Upsert by key if provided
      if (key) {
        this._db.run(
          `INSERT INTO semantic (category, key, content, confidence, source)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT DO NOTHING`,
          [category, key, content, confidence, source],
          function(err) {
            if (err) return reject(err);
            if (this.changes === 0) {
              // update existing
              this._db && this._db.run(
                `UPDATE semantic SET content=?, confidence=?, updated_at=datetime('now'), access_count=access_count+1
                 WHERE key=? AND category=?`,
                [content, confidence, key, category], resolve
              );
            } else resolve(this.lastID);
          }
        );
      } else {
        this._db.run(
          `INSERT INTO semantic (category, content, confidence, source) VALUES (?,?,?,?)`,
          [category, content, confidence, source],
          function(err) { err ? reject(err) : resolve(this.lastID); }
        );
      }
    });
  }

  /**
   * Full-text search semantic memory.
   */
  async recall(query, { limit = 10, category = null } = {}) {
    await this._waitReady();
    return new Promise((resolve, reject) => {
      const cat = category ? `AND s.category = '${category}'` : '';
      this._db.all(
        `SELECT s.* FROM semantic s
         JOIN semantic_fts f ON s.id = f.rowid
         WHERE semantic_fts MATCH ?
         ${cat}
         ORDER BY rank, s.confidence DESC
         LIMIT ?`,
        [query, limit],
        (err, rows) => {
          if (err) {
            // Fallback to LIKE if FTS fails
            this._db.all(
              `SELECT * FROM semantic WHERE content LIKE ? ${cat} ORDER BY confidence DESC LIMIT ?`,
              [`%${query}%`, limit],
              (e2, r2) => e2 ? reject(e2) : resolve(r2 || [])
            );
          } else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Get all memories in a category.
   */
  async getCategory(category, limit = 50) {
    await this._waitReady();
    return new Promise((resolve, reject) =>
      this._db.all(
        `SELECT * FROM semantic WHERE category=? ORDER BY confidence DESC, updated_at DESC LIMIT ?`,
        [category, limit],
        (err, rows) => err ? reject(err) : resolve(rows || [])
      )
    );
  }

  // ── Procedural memory ──────────────────────────────────────────────────

  async recordToolUse(tool, success, durationMs, args = null) {
    await this._waitReady();
    return new Promise(resolve =>
      this._db.run(
        `INSERT INTO procedural (tool, call_count, success_count, avg_duration_ms, last_args, last_used)
         VALUES (?, 1, ?, ?, ?, datetime('now'))
         ON CONFLICT(tool) DO UPDATE SET
           call_count = call_count + 1,
           success_count = success_count + ?,
           avg_duration_ms = (avg_duration_ms * call_count + ?) / (call_count + 1),
           last_args = ?,
           last_used = datetime('now')`,
        [tool, success?1:0, durationMs, args?JSON.stringify(args).slice(0,500):null,
         success?1:0, durationMs, args?JSON.stringify(args).slice(0,500):null],
        resolve
      )
    );
  }

  async getToolStats() {
    await this._waitReady();
    return new Promise((resolve, reject) =>
      this._db.all(`SELECT * FROM procedural ORDER BY call_count DESC`, [], (e,r) => e?reject(e):resolve(r||[]))
    );
  }

  // ── Dream log ──────────────────────────────────────────────────────────

  async logDream(cycle, insights, actions) {
    await this._waitReady();
    return new Promise(resolve =>
      this._db.run(
        `INSERT INTO dream_log (cycle, insights, actions) VALUES (?,?,?)`,
        [cycle, JSON.stringify(insights), JSON.stringify(actions)],
        resolve
      )
    );
  }

  async getRecentDreams(n = 5) {
    await this._waitReady();
    return new Promise((resolve, reject) =>
      this._db.all(
        `SELECT * FROM dream_log ORDER BY created_at DESC LIMIT ?`, [n],
        (e,r) => e ? reject(e) : resolve((r||[]).map(row => ({
          ...row,
          insights: JSON.parse(row.insights || '[]'),
          actions:  JSON.parse(row.actions  || '[]')
        })))
      )
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────

  async getSummary() {
    await this._waitReady();
    const [semantic, procedural, dreams] = await Promise.all([
      new Promise(r => this._db.get(`SELECT COUNT(*) as n FROM semantic`, [], (e,row) => r(row?.n||0))),
      new Promise(r => this._db.get(`SELECT COUNT(*) as n FROM procedural`, [], (e,row) => r(row?.n||0))),
      new Promise(r => this._db.get(`SELECT COUNT(*) as n FROM dream_log`, [], (e,row) => r(row?.n||0)))
    ]);
    return {
      sessionId: this._sessionId,
      episodic: this._episodicCache.length,
      semantic,
      procedural,
      dreams,
      sessions: this.listSessions().length
    };
  }

  /**
   * Export everything as JSON for backup / inspection.
   */
  async export() {
    const [semantic, procedural, dreams] = await Promise.all([
      this.getCategory('fact', 1000).catch(() => []),
      this.getToolStats().catch(() => []),
      this.getRecentDreams(20).catch(() => [])
    ]);
    return {
      exportedAt: new Date().toISOString(),
      episodic: this._episodicCache,
      semantic,
      procedural,
      dreams
    };
  }
}

module.exports = IAIMemory;
