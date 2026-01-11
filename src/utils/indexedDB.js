import { openDB } from 'idb';

const DB_NAME = 'spend-tracker-notes';
const DB_VERSION = 2;

const STORES = {
  NOTES: 'notes',
  SYNC_QUEUE: 'syncQueue',
  TAGS: 'tags',
  FOLDERS: 'folders',
};

let dbInstance = null;

/**
 * Initialize IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
export const initDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Notes store
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const notesStore = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
        notesStore.createIndex('updatedAt', 'updatedAt');
        notesStore.createIndex('deletedAt', 'deletedAt');
        notesStore.createIndex('userId', 'userId');
        notesStore.createIndex('isDeleted', 'isDeleted');
        notesStore.createIndex('isPinned', 'isPinned');
        notesStore.createIndex('isArchived', 'isArchived');
        notesStore.createIndex('folderId', 'folderId');
      } else if (oldVersion < 2) {
        // Add isArchived index if upgrading from version 1
        const notesStore = transaction.objectStore(STORES.NOTES);
        if (!notesStore.indexNames.contains('isArchived')) {
          notesStore.createIndex('isArchived', 'isArchived');
        }
      }

      // Sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'noteId' });
        syncStore.createIndex('timestamp', 'timestamp');
        syncStore.createIndex('operation', 'operation');
      }

      // Tags store
      if (!db.objectStoreNames.contains(STORES.TAGS)) {
        const tagsStore = db.createObjectStore(STORES.TAGS, { keyPath: 'id' });
        tagsStore.createIndex('userId', 'userId');
      }

      // Folders store
      if (!db.objectStoreNames.contains(STORES.FOLDERS)) {
        const foldersStore = db.createObjectStore(STORES.FOLDERS, { keyPath: 'id' });
        foldersStore.createIndex('userId', 'userId');
      }
    },
  });

  return dbInstance;
};

/**
 * Get database instance
 * @returns {Promise<IDBDatabase>}
 */
export const getDB = async () => {
  if (!dbInstance) {
    await initDB();
  }
  return dbInstance;
};

/**
 * Generic get operation
 * @param {string} storeName
 * @param {string} key
 * @returns {Promise<any>}
 */
export const get = async (storeName, key) => {
  const db = await getDB();
  return db.get(storeName, key);
};

/**
 * Generic get all operation
 * @param {string} storeName
 * @returns {Promise<any[]>}
 */
export const getAll = async (storeName) => {
  const db = await getDB();
  return db.getAll(storeName);
};

/**
 * Generic put operation
 * @param {string} storeName
 * @param {any} value
 * @returns {Promise<void>}
 */
export const put = async (storeName, value) => {
  const db = await getDB();
  return db.put(storeName, value);
};

/**
 * Generic delete operation
 * @param {string} storeName
 * @param {string} key
 * @returns {Promise<void>}
 */
export const deleteItem = async (storeName, key) => {
  const db = await getDB();
  return db.delete(storeName, key);
};

/**
 * Query with index
 * @param {string} storeName
 * @param {string} indexName
 * @param {IDBKeyRange} range
 * @returns {Promise<any[]>}
 */
export const query = async (storeName, indexName, range = null) => {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readonly');
  const index = tx.store.index(indexName);
  return index.getAll(range);
};

/**
 * Clear all data from a store
 * @param {string} storeName
 * @returns {Promise<void>}
 */
export const clear = async (storeName) => {
  const db = await getDB();
  return db.clear(storeName);
};

export { STORES };
export default {
  initDB,
  getDB,
  get,
  getAll,
  put,
  deleteItem,
  query,
  clear,
  STORES,
};
