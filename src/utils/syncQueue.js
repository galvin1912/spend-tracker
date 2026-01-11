import { getDB, get, put, getAll, deleteItem, STORES } from './indexedDB';

/**
 * Add note to sync queue
 * @param {string} noteId
 * @param {string} operation - 'create' | 'update' | 'delete'
 * @returns {Promise<void>}
 */
export const addToSyncQueue = async (noteId, operation) => {
  await getDB();
  
  const queueItem = {
    noteId,
    operation,
    timestamp: Date.now(),
    retryCount: 0,
  };

  await put(STORES.SYNC_QUEUE, queueItem);
};

/**
 * Get all pending sync operations
 * @returns {Promise<Array>}
 */
export const getSyncQueue = async () => {
  await getDB();
  const queue = await getAll(STORES.SYNC_QUEUE);
  return queue.sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Remove item from sync queue
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export const removeFromSyncQueue = async (noteId) => {
  await getDB();
  await deleteItem(STORES.SYNC_QUEUE, noteId);
};

/**
 * Increment retry count for a queue item
 * @param {string} noteId
 * @returns {Promise<void>}
 */
export const incrementRetryCount = async (noteId) => {
  await getDB();
  const item = await get(STORES.SYNC_QUEUE, noteId);
  if (item) {
    item.retryCount += 1;
    await put(STORES.SYNC_QUEUE, item);
  }
};

/**
 * Get retry delay based on retry count (exponential backoff)
 * @param {number} retryCount
 * @returns {number} Delay in milliseconds
 */
export const getRetryDelay = (retryCount) => {
  const delays = [1000, 2000, 4000, 8000, 16000, 30000];
  return delays[Math.min(retryCount, delays.length - 1)];
};

export default {
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  incrementRetryCount,
  getRetryDelay,
};
