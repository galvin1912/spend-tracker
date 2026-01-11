import store from "../store";
import { Timestamp, where } from "firebase/firestore";
import { request } from "../utils/requestUtil";
import NotesLocalDB from "./NotesLocalDB";
import { removeFromSyncQueue } from "../utils/syncQueue";

class NotesServices {
  /**
   * Sync a single note to Firestore
   * @param {Object} note
   * @returns {Promise<void>}
   */
  static syncNoteToFirestore = async (note) => {
    const methodName = "syncNoteToFirestore";
    try {
      const {
        user: { uid },
      } = store.getState().user;

      if (!uid) {
        throw new Error("User not authenticated");
      }

      // Convert timestamps
      const firestoreNote = {
        ...note,
        userId: uid,
        createdAt: note.createdAt instanceof Timestamp
          ? note.createdAt
          : Timestamp.fromMillis(note.createdAt),
        updatedAt: note.updatedAt instanceof Timestamp
          ? note.updatedAt
          : Timestamp.fromMillis(note.updatedAt),
        deletedAt: note.deletedAt
          ? note.deletedAt instanceof Timestamp
            ? note.deletedAt
            : Timestamp.fromMillis(note.deletedAt)
          : null,
        syncedAt: Timestamp.now(),
      };

      // Remove local-only fields
      delete firestoreNote.syncStatus;

      // Use PUT to create or update (idempotent)
      await request("/notes", {
        method: "PUT",
        uid: note.id,
        data: firestoreNote,
      });

      // Update local note with syncedAt
      const updatedNote = {
        ...note,
        syncedAt: Date.now(),
        syncStatus: "synced",
      };
      await NotesLocalDB.saveNote(updatedNote);

      // Remove from sync queue
      await removeFromSyncQueue(note.id);
    } catch (error) {
      console.error(`[NotesServices.${methodName}] Error:`, {
        method: methodName,
        params: { noteId: note.id },
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
          originalError: error.originalError || error,
        },
      });
      throw error;
    }
  };

  /**
   * Batch sync all pending notes
   * @returns {Promise<{success: number, failed: number}>}
   */
  static syncAllNotes = async () => {
    const methodName = "syncAllNotes";
    try {
      const {
        user: { uid },
      } = store.getState().user;

      if (!uid) {
        throw new Error("User not authenticated");
      }

      const allNotes = await NotesLocalDB.getAllNotes(uid);
      const pendingNotes = allNotes.filter(
        (note) => note.syncStatus === "pending" || !note.syncedAt
      );

      const results = { success: 0, failed: 0 };

      // Batch sync (limit to 10 at a time to avoid overwhelming)
      const batchSize = 10;
      for (let i = 0; i < pendingNotes.length; i += batchSize) {
        const batch = pendingNotes.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(async (note) => {
            try {
              await this.syncNoteToFirestore(note);
              results.success++;
            } catch (error) {
              console.error(`Failed to sync note ${note.id}:`, error);
              results.failed++;
            }
          })
        );
      }

      return results;
    } catch (error) {
      console.error(`[NotesServices.${methodName}] Error:`, {
        method: methodName,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      });
      throw error;
    }
  };

  /**
   * Fetch all notes from Firestore
   * @returns {Promise<Array>}
   */
  static fetchNotesFromFirestore = async () => {
    const methodName = "fetchNotesFromFirestore";
    try {
      const {
        user: { uid },
      } = store.getState().user;

      if (!uid) {
        throw new Error("User not authenticated");
      }

      const firestoreNotes = await request("/notes", {
        method: "GET",
        queryConstraints: [where("userId", "==", uid)],
      });

      // Convert Firestore timestamps to milliseconds
      const notes = firestoreNotes.map((note) => ({
        ...note,
        createdAt: note.createdAt?.toMillis?.() || note.createdAt,
        updatedAt: note.updatedAt?.toMillis?.() || note.updatedAt,
        deletedAt: note.deletedAt?.toMillis?.() || note.deletedAt,
        syncedAt: note.syncedAt?.toMillis?.() || note.syncedAt,
        syncStatus: "synced",
      }));

      // Save to IndexedDB
      for (const note of notes) {
        await NotesLocalDB.saveNote(note);
      }

      return notes;
    } catch (error) {
      console.error(`[NotesServices.${methodName}] Error:`, {
        method: methodName,
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      });
      throw error;
    }
  };

  /**
   * Resolve conflicts between local and server note
   * @param {Object} localNote
   * @param {Object} serverNote
   * @returns {Object} Resolved note
   */
  static resolveConflicts = (localNote, serverNote) => {
    // Last-write-wins: compare updatedAt timestamps
    const localUpdatedAt = localNote.updatedAt?.toMillis?.() || localNote.updatedAt;
    const serverUpdatedAt = serverNote.updatedAt?.toMillis?.() || serverNote.updatedAt;

    if (localUpdatedAt > serverUpdatedAt) {
      // Local is newer, keep local
      return localNote;
    } else {
      // Server is newer, use server
      return {
        ...serverNote,
        createdAt: serverNote.createdAt?.toMillis?.() || serverNote.createdAt,
        updatedAt: serverNote.updatedAt?.toMillis?.() || serverNote.updatedAt,
        deletedAt: serverNote.deletedAt?.toMillis?.() || serverNote.deletedAt,
        syncedAt: serverNote.syncedAt?.toMillis?.() || serverNote.syncedAt,
        syncStatus: "synced",
      };
    }
  };

  /**
   * Delete note from Firestore
   * @param {string} noteId
   * @returns {Promise<void>}
   */
  static deleteNoteFromFirestore = async (noteId) => {
    const methodName = "deleteNoteFromFirestore";
    try {
      await request("/notes", {
        method: "DELETE",
        uid: noteId,
      });
    } catch (error) {
      console.error(`[NotesServices.${methodName}] Error:`, {
        method: methodName,
        params: { noteId },
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      });
      throw error;
    }
  };

  /**
   * Sync a tag to Firestore
   * @param {Object} tag
   * @returns {Promise<void>}
   */
  static syncTagToFirestore = async (tag) => {
    const methodName = "syncTagToFirestore";
    try {
      const {
        user: { uid },
      } = store.getState().user;

      if (!uid) {
        throw new Error("User not authenticated");
      }

      const firestoreTag = {
        ...tag,
        userId: uid,
        createdAt: tag.createdAt instanceof Timestamp
          ? tag.createdAt
          : Timestamp.fromMillis(tag.createdAt),
        updatedAt: tag.updatedAt instanceof Timestamp
          ? tag.updatedAt
          : Timestamp.fromMillis(tag.updatedAt),
      };

      await request("/tags", {
        method: "PUT",
        uid: tag.id,
        data: firestoreTag,
      });
    } catch (error) {
      console.error(`[NotesServices.${methodName}] Error:`, {
        method: methodName,
        params: { tagId: tag.id },
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      });
      throw error;
    }
  };

  /**
   * Delete tag from Firestore
   * @param {string} tagId
   * @returns {Promise<void>}
   */
  static deleteTagFromFirestore = async (tagId) => {
    const methodName = "deleteTagFromFirestore";
    try {
      await request("/tags", {
        method: "DELETE",
        uid: tagId,
      });
    } catch (error) {
      console.error(`[NotesServices.${methodName}] Error:`, {
        method: methodName,
        params: { tagId },
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      });
      throw error;
    }
  };

  /**
   * Sync a folder to Firestore
   * @param {Object} folder
   * @returns {Promise<void>}
   */
  static syncFolderToFirestore = async (folder) => {
    const methodName = "syncFolderToFirestore";
    try {
      const {
        user: { uid },
      } = store.getState().user;

      if (!uid) {
        throw new Error("User not authenticated");
      }

      const firestoreFolder = {
        ...folder,
        userId: uid,
        createdAt: folder.createdAt instanceof Timestamp
          ? folder.createdAt
          : Timestamp.fromMillis(folder.createdAt),
        updatedAt: folder.updatedAt instanceof Timestamp
          ? folder.updatedAt
          : Timestamp.fromMillis(folder.updatedAt),
      };

      await request("/folders", {
        method: "PUT",
        uid: folder.id,
        data: firestoreFolder,
      });
    } catch (error) {
      console.error(`[NotesServices.${methodName}] Error:`, {
        method: methodName,
        params: { folderId: folder.id },
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      });
      throw error;
    }
  };

  /**
   * Delete folder from Firestore
   * @param {string} folderId
   * @returns {Promise<void>}
   */
  static deleteFolderFromFirestore = async (folderId) => {
    const methodName = "deleteFolderFromFirestore";
    try {
      await request("/folders", {
        method: "DELETE",
        uid: folderId,
      });
    } catch (error) {
      console.error(`[NotesServices.${methodName}] Error:`, {
        method: methodName,
        params: { folderId },
        error: {
          message: error.message,
          code: error.code,
          stack: error.stack,
        },
      });
      throw error;
    }
  };
}

export default NotesServices;
