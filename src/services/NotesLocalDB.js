import { getDB, get, getAll, put, deleteItem, STORES } from "../utils/indexedDB";
import Fuse from "fuse.js";

class NotesLocalDB {
  /**
   * Get all non-deleted notes for a user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  static getAllNotes = async (userId) => {
    await getDB();
    const allNotes = await getAll(STORES.NOTES);
    return allNotes.filter(
      (note) => note.userId === userId && !note.isDeleted
    );
  };

  /**
   * Get a single note by ID
   * @param {string} noteId
   * @returns {Promise<Object|null>}
   */
  static getNote = async (noteId) => {
    await getDB();
    return await get(STORES.NOTES, noteId);
  };

  /**
   * Save or update a note
   * @param {Object} note
   * @returns {Promise<void>}
   */
  static saveNote = async (note) => {
    await getDB();
    await put(STORES.NOTES, {
      ...note,
      updatedAt: Date.now(),
    });
  };

  /**
   * Soft delete a note
   * @param {string} noteId
   * @returns {Promise<void>}
   */
  static deleteNote = async (noteId) => {
    await getDB();
    const note = await get(STORES.NOTES, noteId);
    if (note) {
      note.isDeleted = true;
      note.deletedAt = Date.now();
      await put(STORES.NOTES, note);
    }
  };

  /**
   * Restore a soft-deleted note
   * @param {string} noteId
   * @returns {Promise<void>}
   */
  static restoreNote = async (noteId) => {
    await getDB();
    const note = await get(STORES.NOTES, noteId);
    if (note) {
      note.isDeleted = false;
      note.deletedAt = null;
      await put(STORES.NOTES, note);
    }
  };

  /**
   * Permanently delete a note
   * @param {string} noteId
   * @returns {Promise<void>}
   */
  static permanentlyDeleteNote = async (noteId) => {
    await getDB();
    await deleteItem(STORES.NOTES, noteId);
  };

  /**
   * Search notes using Fuse.js
   * @param {string} userId
   * @param {string} searchQuery
   * @returns {Promise<Array>}
   */
  static searchNotes = async (userId, searchQuery) => {
    const allNotes = await this.getAllNotes(userId);
    
    if (!searchQuery || searchQuery.trim() === "") {
      return allNotes;
    }

    const fuse = new Fuse(allNotes, {
      keys: ["title", "plainText"],
      threshold: 0.3,
      includeScore: true,
    });

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  };

  /**
   * Get notes by tag
   * @param {string} userId
   * @param {string} tagId
   * @returns {Promise<Array>}
   */
  static getNotesByTag = async (userId, tagId) => {
    const allNotes = await this.getAllNotes(userId);
    return allNotes.filter((note) => note.tags && note.tags.includes(tagId));
  };

  /**
   * Get notes by folder
   * @param {string} userId
   * @param {string} folderId
   * @returns {Promise<Array>}
   */
  static getNotesByFolder = async (userId, folderId) => {
    const allNotes = await this.getAllNotes(userId);
    return allNotes.filter((note) => note.folderId === folderId);
  };

  /**
   * Get all tags for a user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  static getAllTags = async (userId) => {
    await getDB();
    const allTags = await getAll(STORES.TAGS);
    return allTags.filter((tag) => tag.userId === userId);
  };

  /**
   * Save a tag
   * @param {Object} tag
   * @returns {Promise<void>}
   */
  static saveTag = async (tag) => {
    await getDB();
    await put(STORES.TAGS, tag);
  };

  /**
   * Get all folders for a user
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  static getAllFolders = async (userId) => {
    await getDB();
    const allFolders = await getAll(STORES.FOLDERS);
    return allFolders.filter((folder) => folder.userId === userId);
  };

  /**
   * Save a folder
   * @param {Object} folder
   * @returns {Promise<void>}
   */
  static saveFolder = async (folder) => {
    await getDB();
    await put(STORES.FOLDERS, folder);
  };

  /**
   * Delete a tag
   * @param {string} tagId
   * @returns {Promise<void>}
   */
  static deleteTag = async (tagId) => {
    await getDB();
    await deleteItem(STORES.TAGS, tagId);
  };

  /**
   * Delete a folder
   * @param {string} folderId
   * @returns {Promise<void>}
   */
  static deleteFolder = async (folderId) => {
    await getDB();
    await deleteItem(STORES.FOLDERS, folderId);
  };

  /**
   * Archive a note
   * @param {string} noteId
   * @returns {Promise<void>}
   */
  static archiveNote = async (noteId) => {
    await getDB();
    const note = await get(STORES.NOTES, noteId);
    if (note) {
      note.isArchived = true;
      await put(STORES.NOTES, note);
    }
  };

  /**
   * Unarchive a note
   * @param {string} noteId
   * @returns {Promise<void>}
   */
  static unarchiveNote = async (noteId) => {
    await getDB();
    const note = await get(STORES.NOTES, noteId);
    if (note) {
      note.isArchived = false;
      await put(STORES.NOTES, note);
    }
  };
}

export default NotesLocalDB;
