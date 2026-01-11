import NotesServices from "../services/NotesServices";
import { getSyncQueue } from "./syncQueue";
import { incrementRetryCount, getRetryDelay } from "./syncQueue";

let syncInterval = null;
let isSyncing = false;

/**
 * Start background sync service
 * Syncs pending notes every 5-10 seconds when online
 */
export const startBackgroundSync = () => {
  if (syncInterval) {
    return; // Already running
  }

  // Initial sync after 2 seconds
  setTimeout(() => {
    performSync();
  }, 2000);

  // Then sync every 10 seconds
  syncInterval = setInterval(() => {
    if (navigator.onLine && !isSyncing) {
      performSync();
    }
  }, 10000);

  // Sync when coming back online
  window.addEventListener("online", () => {
    if (!isSyncing) {
      performSync();
    }
  });
};

/**
 * Stop background sync service
 */
export const stopBackgroundSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

/**
 * Perform sync operation
 */
const performSync = async () => {
  if (isSyncing || !navigator.onLine) {
    return;
  }

  isSyncing = true;

  try {
    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
      isSyncing = false;
      return;
    }

    // Process queue items
    for (const item of queue) {
      try {
        // Get note from IndexedDB
        const NotesLocalDB = (await import("../services/NotesLocalDB")).default;
        const note = await NotesLocalDB.getNote(item.noteId);

        if (!note) {
          // Note doesn't exist, remove from queue
          const { removeFromSyncQueue } = await import("./syncQueue");
          await removeFromSyncQueue(item.noteId);
          continue;
        }

        // Check retry count
        if (item.retryCount >= 5) {
          console.warn(`Max retries reached for note ${item.noteId}`);
          continue;
        }

        // Check if we should retry (exponential backoff)
        const delay = getRetryDelay(item.retryCount);
        const timeSinceLastAttempt = Date.now() - item.timestamp;
        
        if (timeSinceLastAttempt < delay) {
          continue; // Not time to retry yet
        }

        // Attempt sync
        // For delete operations, we still sync the note (with isDeleted: true) for soft delete
        // This allows undo functionality
        await NotesServices.syncNoteToFirestore(note);
      } catch (error) {
        console.error(`Failed to sync note ${item.noteId}:`, error);
        // Increment retry count
        await incrementRetryCount(item.noteId);
      }
    }

    // Also sync all notes (batch)
    await NotesServices.syncAllNotes();
  } catch (error) {
    console.error("Background sync error:", error);
  } finally {
    isSyncing = false;
  }
};

export default {
  startBackgroundSync,
  stopBackgroundSync,
};
