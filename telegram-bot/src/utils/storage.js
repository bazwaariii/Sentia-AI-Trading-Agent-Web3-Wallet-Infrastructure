// ============================================================
// JSON File Storage - Simple persistent storage
// ============================================================

const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

// Ensure data directory exists
if (!fs.existsSync(config.DATA_DIR)) {
  fs.mkdirSync(config.DATA_DIR, { recursive: true });
  logger.info('Created data directory');
}

class Storage {
  constructor(filename) {
    this.filepath = path.join(config.DATA_DIR, filename);
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filepath)) {
        const raw = fs.readFileSync(this.filepath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      logger.error(`Failed to load ${this.filepath}: ${err.message}`);
    }
    return {};
  }

  _save() {
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      logger.error(`Failed to save ${this.filepath}: ${err.message}`);
    }
  }

  get(key, defaultVal = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultVal;
  }

  set(key, value) {
    this.data[key] = value;
    this._save();
  }

  delete(key) {
    delete this.data[key];
    this._save();
  }

  getAll() {
    return { ...this.data };
  }

  has(key) {
    return this.data[key] !== undefined;
  }

  size() {
    return Object.keys(this.data).length;
  }
}

module.exports = Storage;
