const fs = require("fs");
const path = require("path");

const MEMORY_PATH = path.join(__dirname, "memory.json");
const LOCK_PATH = path.join(__dirname, "memory.lock");
const LOCK_TIMEOUT = 5000; // 5 second timeout

class Memory {
  constructor() {
    this.data = this.load();
  }

  load() {
    if (!fs.existsSync(MEMORY_PATH)) {
      return { history: [], preferences: {}, projects: {} };
    }
    try {
      return JSON.parse(fs.readFileSync(MEMORY_PATH, "utf-8"));
    } catch (err) {
      console.error("Error loading memory:", err.message);
      return { history: [], preferences: {}, projects: {} };
    }
  }

  acquireLock() {
    const start = Date.now();
    while (fs.existsSync(LOCK_PATH)) {
      if (Date.now() - start > LOCK_TIMEOUT) {
        throw new Error("Lock timeout - could not acquire memory lock");
      }
      // Busy wait is not ideal, but keeps it simple for this use case
    }
    fs.writeFileSync(LOCK_PATH, process.pid.toString());
  }

  releaseLock() {
    try {
      fs.unlinkSync(LOCK_PATH);
    } catch (err) {
      // Lock file may have been removed; ignore
    }
  }

  save() {
    this.acquireLock();
    try {
      fs.writeFileSync(MEMORY_PATH, JSON.stringify(this.data, null, 2));
    } finally {
      this.releaseLock();
    }
  }

  addEntry(entry) {
    if (!entry || !entry.type || !entry.language || !entry.task) {
      throw new Error("Invalid entry: missing type, language, or task");
    }

    this.data.history.push({
      ...entry,
      timestamp: new Date().toISOString()
    });

    if (this.data.history.length > 50) {
      this.data.history.shift();
    }

    this.save();
  }

  setPreference(key, value) {
    this.data.preferences[key] = value;
    this.save();
  }

  getRecent(n = 5) {
    const limit = Math.min(n, this.data.history.length);
    return this.data.history.slice(-limit);
  }

  getRelevant(keyword) {
    if (!keyword) return [];
    return this.data.history.filter(h =>
      h.task?.toLowerCase().includes(keyword.toLowerCase())
    ).slice(-5);
  }

  search(query) {
    if (!query) return [];
    const q = query.toLowerCase();
    return this.data.history.filter(h =>
      h.task?.toLowerCase().includes(q) ||
      h.language?.toLowerCase().includes(q) ||
      h.type?.toLowerCase().includes(q)
    );
  }

  filterByType(type) {
    if (!type) return [];
    return this.data.history.filter(h => h.type === type);
  }

  filterByLanguage(language) {
    if (!language) return [];
    return this.data.history.filter(h => h.language?.toLowerCase() === language.toLowerCase());
  }

  getStats() {
    const typeCount = {};
    const languageCount = {};

    this.data.history.forEach(entry => {
      typeCount[entry.type] = (typeCount[entry.type] || 0) + 1;
      languageCount[entry.language] = (languageCount[entry.language] || 0) + 1;
    });

    return {
      totalEntries: this.data.history.length,
      typeCount,
      languageCount
    };
  }

  clear() {
    this.data.history = [];
    this.save();
  }

  export(format = "json") {
    if (format === "json") {
      return JSON.stringify(this.data.history, null, 2);
    } else if (format === "csv") {
      const headers = ["timestamp", "type", "language", "task"];
      const rows = this.data.history.map(h =>
        [h.timestamp, h.type, h.language, `"${h.task?.replace(/"/g, '""')}"`].join(",")
      );
      return [headers.join(","), ...rows].join("\n");
    }
    throw new Error(`Unknown format: ${format}`);
  }
}

module.exports = Memory;