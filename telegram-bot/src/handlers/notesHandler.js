// ============================================================
// Notes Handler - Personal notes CRUD
// ============================================================

const Storage = require('../utils/storage');
const messages = require('../utils/messages');
const logger = require('../utils/logger');

const noteStorage = new Storage('notes.json');

// ── Get all notes for a user ────────────────────────────────
function getNotes(userId) {
  return noteStorage.get(String(userId), []);
}

// ── Add a note ──────────────────────────────────────────────
function addNote(userId, text) {
  const notes = getNotes(userId);
  notes.push({
    text: text.trim(),
    date: Date.now(),
  });
  noteStorage.set(String(userId), notes);
  logger.info(`Note added for user ${userId} (total: ${notes.length})`);
  return notes.length;
}

// ── Delete a note by index (1-based) ────────────────────────
function deleteNote(userId, index) {
  const notes = getNotes(userId);
  if (index < 1 || index > notes.length) {
    return false;
  }
  notes.splice(index - 1, 1);
  noteStorage.set(String(userId), notes);
  return true;
}

// ── Clear all notes ─────────────────────────────────────────
function clearNotes(userId) {
  const count = getNotes(userId).length;
  noteStorage.set(String(userId), []);
  return count;
}

module.exports = {
  getNotes,
  addNote,
  deleteNote,
  clearNotes,
};
