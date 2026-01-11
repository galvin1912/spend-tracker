import {
  NOTES_GET_NOTES,
  NOTES_GET_NOTES_SUCCESS,
  NOTES_GET_NOTES_FAILED,
  NOTES_CREATE_NOTE_SUCCESS,
  NOTES_UPDATE_NOTE_SUCCESS,
  NOTES_DELETE_NOTE_SUCCESS,
  NOTES_RESTORE_NOTE_SUCCESS,
  NOTES_PIN_NOTE_SUCCESS,
  NOTES_SET_SELECTED_NOTE,
  NOTES_SET_SEARCH_QUERY,
  NOTES_FILTER_BY_TAG,
  NOTES_FILTER_BY_FOLDER,
  NOTES_CLEAR_FILTERS,
  NOTES_SET_SORT_BY,
  NOTES_SET_SAVE_STATUS,
  NOTES_CREATE_TAG_SUCCESS,
  NOTES_UPDATE_TAG_SUCCESS,
  NOTES_DELETE_TAG_SUCCESS,
  NOTES_GET_TAGS_SUCCESS,
  NOTES_CREATE_FOLDER_SUCCESS,
  NOTES_UPDATE_FOLDER_SUCCESS,
  NOTES_DELETE_FOLDER_SUCCESS,
  NOTES_GET_FOLDERS_SUCCESS,
  NOTES_UPDATE_NOTE_TAGS_SUCCESS,
  NOTES_UPDATE_NOTE_FOLDER_SUCCESS,
  NOTES_ARCHIVE_NOTE_SUCCESS,
  NOTES_UNARCHIVE_NOTE_SUCCESS,
  NOTES_SET_SHOW_ARCHIVED,
} from "./notesConstants";
import messageUtil from "../../utils/messageUtil";
import NotesLocalDB from "../../services/NotesLocalDB";
import NotesServices from "../../services/NotesServices";
import { addToSyncQueue } from "../../utils/syncQueue";
import store from "../../store";

/**
 * Get all notes (load from IndexedDB + sync from Firestore)
 */
export const getNotes = () => async (dispatch) => {
  dispatch({ type: NOTES_GET_NOTES });

  try {
    const {
      user: { uid },
    } = store.getState().user;

    if (!uid) {
      throw new Error("User not authenticated");
    }

    // Load from IndexedDB first (fast)
    const localNotes = await NotesLocalDB.getAllNotes(uid);
    dispatch({ type: NOTES_GET_NOTES_SUCCESS, payload: localNotes });

    // Sync from Firestore in background
    try {
      const firestoreNotes = await NotesServices.fetchNotesFromFirestore();
      // Merge and resolve conflicts
      const mergedNotes = firestoreNotes.map((serverNote) => {
        const localNote = localNotes.find((n) => n.id === serverNote.id);
        if (localNote && localNote.updatedAt !== serverNote.updatedAt) {
          return NotesServices.resolveConflicts(localNote, serverNote);
        }
        return serverNote;
      });

      // Add any new notes from server
      const localNoteIds = new Set(localNotes.map((n) => n.id));
      const newNotes = firestoreNotes.filter((n) => !localNoteIds.has(n.id));
      mergedNotes.push(...newNotes);

      dispatch({ type: NOTES_GET_NOTES_SUCCESS, payload: mergedNotes });
    } catch (syncError) {
      console.error("Background sync failed:", syncError);
      // Continue with local notes
    }
  } catch (error) {
    dispatch({ type: NOTES_GET_NOTES_FAILED });
    messageUtil.error("Không thể tải ghi chú. Vui lòng thử lại.");
  }
};

/**
 * Create a new note (auto-create when user starts typing)
 */
export const createNote = () => async (dispatch) => {
  try {
    const {
      user: { uid },
    } = store.getState().user;

    if (!uid) {
      throw new Error("User not authenticated");
    }

    // Generate a unique ID compatible with Firestore
    const noteId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = Date.now();

    const newNote = {
      id: noteId,
      userId: uid,
      title: "Untitled",
      content: {
        type: "doc",
        content: [],
      },
      plainText: "",
      tags: [],
      folderId: null,
      isPinned: false,
      isArchived: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      syncedAt: null,
      syncStatus: "pending",
      version: 1,
    };

    await NotesLocalDB.saveNote(newNote);
    await addToSyncQueue(noteId, "create");

    dispatch({ type: NOTES_CREATE_NOTE_SUCCESS, payload: newNote });
    dispatch({ type: NOTES_SET_SELECTED_NOTE, payload: noteId });

    return newNote;
  } catch (error) {
    messageUtil.error("Không thể tạo ghi chú mới. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Update note content (debounced auto-save)
 */
export const updateNote = (noteId, updates) => async (dispatch) => {
  try {
    const note = await NotesLocalDB.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    // Extract plain text from content for search
    const extractPlainText = (content) => {
      if (typeof content === "string") return content;
      if (content?.type === "doc" && content?.content) {
        return content.content
          .map((node) => {
            if (node.type === "paragraph" && node.content) {
              return node.content.map((n) => n.text || "").join("");
            }
            return node.text || "";
          })
          .join("\n");
      }
      return "";
    };

    // Auto-generate title from first line ONLY if title is empty or "Untitled"
    // This is just a suggestion for initial title, don't override if user has set a custom title
    let title = updates.title !== undefined ? updates.title : note.title;
    
    // Only auto-generate if title hasn't been customized (is "Untitled" or empty)
    if (updates.content && !updates.title && (!note.title || note.title === "Untitled")) {
      const plainText = extractPlainText(updates.content);
      const firstLine = plainText.split("\n")[0].trim();
      if (firstLine) {
        title = firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;
      }
    }

    const updatedNote = {
      ...note,
      ...updates,
      title: title,
      plainText: updates.content ? extractPlainText(updates.content) : note.plainText,
      updatedAt: Date.now(),
      syncStatus: note.syncedAt ? "pending" : "pending",
      version: (note.version || 1) + 1,
    };

    await NotesLocalDB.saveNote(updatedNote);
    await addToSyncQueue(noteId, "update");

    dispatch({ type: NOTES_UPDATE_NOTE_SUCCESS, payload: updatedNote });
    dispatch({
      type: NOTES_SET_SAVE_STATUS,
      payload: { noteId, status: "saved" },
    });

    // Clear saved status after 2 seconds
    setTimeout(() => {
      dispatch({
        type: NOTES_SET_SAVE_STATUS,
        payload: { noteId, status: null },
      });
    }, 2000);

    return updatedNote;
  } catch (error) {
    dispatch({
      type: NOTES_SET_SAVE_STATUS,
      payload: { noteId, status: "error" },
    });
    messageUtil.error("Không thể lưu ghi chú. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Soft delete a note
 */
export const deleteNote = (noteId) => async (dispatch) => {
  try {
    await NotesLocalDB.deleteNote(noteId);
    const note = await NotesLocalDB.getNote(noteId);

    await addToSyncQueue(noteId, "delete");

    dispatch({ type: NOTES_DELETE_NOTE_SUCCESS, payload: note });

    // Show undo notification
    messageUtil.info("Ghi chú đã được xóa", 5);
    
    // Auto-restore after 5 seconds if not undone
    setTimeout(async () => {
      const currentNote = await NotesLocalDB.getNote(noteId);
      if (currentNote && currentNote.isDeleted) {
        // Note still deleted, could implement permanent delete after 30 days
      }
    }, 5000);

    return note;
  } catch (error) {
    messageUtil.error("Không thể xóa ghi chú. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Restore a soft-deleted note
 */
export const restoreNote = (noteId) => async (dispatch) => {
  try {
    await NotesLocalDB.restoreNote(noteId);
    const note = await NotesLocalDB.getNote(noteId);

    await addToSyncQueue(noteId, "update");

    dispatch({ type: NOTES_RESTORE_NOTE_SUCCESS, payload: note });
    messageUtil.success("Ghi chú đã được khôi phục");

    return note;
  } catch (error) {
    messageUtil.error("Không thể khôi phục ghi chú. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Pin/unpin a note
 */
export const pinNote = (noteId) => async (dispatch) => {
  try {
    const note = await NotesLocalDB.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    const updatedNote = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: Date.now(),
      syncStatus: "pending",
    };

    await NotesLocalDB.saveNote(updatedNote);
    await addToSyncQueue(noteId, "update");

    dispatch({ type: NOTES_PIN_NOTE_SUCCESS, payload: updatedNote });

    return updatedNote;
  } catch (error) {
    messageUtil.error("Không thể ghim/bỏ ghim ghi chú. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Set selected note for editing
 */
export const setSelectedNote = (noteId) => (dispatch) => {
  dispatch({ type: NOTES_SET_SELECTED_NOTE, payload: noteId });
};

/**
 * Set search query
 */
export const setSearchQuery = (query) => (dispatch) => {
  dispatch({ type: NOTES_SET_SEARCH_QUERY, payload: query });
};

/**
 * Filter by tag
 */
export const filterByTag = (tagIds) => (dispatch) => {
  dispatch({ type: NOTES_FILTER_BY_TAG, payload: tagIds });
};

/**
 * Filter by folder
 */
export const filterByFolder = (folderId) => (dispatch) => {
  dispatch({ type: NOTES_FILTER_BY_FOLDER, payload: folderId });
};

/**
 * Clear all filters
 */
export const clearFilters = () => (dispatch) => {
  dispatch({ type: NOTES_CLEAR_FILTERS });
};

/**
 * Set sort order
 */
export const setSortBy = (sortBy) => (dispatch) => {
  dispatch({ type: NOTES_SET_SORT_BY, payload: sortBy });
};

/**
 * Set save status for a note
 */
export const setSaveStatus = (noteId, status) => (dispatch) => {
  dispatch({
    type: NOTES_SET_SAVE_STATUS,
    payload: { noteId, status },
  });
};

/**
 * Force sync a note
 */
export const forceSyncNote = (noteId) => async (dispatch) => {
  try {
    dispatch({
      type: NOTES_SET_SAVE_STATUS,
      payload: { noteId, status: "saving" },
    });

    const note = await NotesLocalDB.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    await NotesServices.syncNoteToFirestore(note);

    dispatch({
      type: NOTES_SET_SAVE_STATUS,
      payload: { noteId, status: "saved" },
    });

    setTimeout(() => {
      dispatch({
        type: NOTES_SET_SAVE_STATUS,
        payload: { noteId, status: null },
      });
    }, 2000);
  } catch (error) {
    dispatch({
      type: NOTES_SET_SAVE_STATUS,
      payload: { noteId, status: "error" },
    });
    messageUtil.error("Không thể đồng bộ ghi chú. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Get all tags
 */
export const getTags = () => async (dispatch) => {
  try {
    const {
      user: { uid },
    } = store.getState().user;

    if (!uid) {
      throw new Error("User not authenticated");
    }

    const tags = await NotesLocalDB.getAllTags(uid);
    dispatch({ type: NOTES_GET_TAGS_SUCCESS, payload: tags });
    return tags;
  } catch (error) {
    console.error("Failed to get tags:", error);
    throw error;
  }
};

/**
 * Create a new tag
 */
export const createTag = (tagData) => async (dispatch) => {
  try {
    const {
      user: { uid },
    } = store.getState().user;

    if (!uid) {
      throw new Error("User not authenticated");
    }

    const tagId = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = Date.now();

    const newTag = {
      id: tagId,
      userId: uid,
      name: tagData.name,
      color: tagData.color || null,
      createdAt: now,
      updatedAt: now,
    };

    await NotesLocalDB.saveTag(newTag);
    await NotesServices.syncTagToFirestore(newTag).catch((err) => {
      console.error("Failed to sync tag:", err);
    });

    dispatch({ type: NOTES_CREATE_TAG_SUCCESS, payload: newTag });
    return newTag;
  } catch (error) {
    messageUtil.error("Không thể tạo thẻ. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Update a tag
 */
export const updateTag = (tagId, updates) => async (dispatch) => {
  try {
    let tag = await NotesLocalDB.getTag?.(tagId);
    if (!tag) {
      // If getTag doesn't exist, get from getAllTags
      const {
        user: { uid },
      } = store.getState().user;
      const allTags = await NotesLocalDB.getAllTags(uid);
      const foundTag = allTags.find((t) => t.id === tagId);
      if (!foundTag) {
        throw new Error("Tag not found");
      }
      tag = foundTag;
    }

    const updatedTag = {
      ...tag,
      ...updates,
      updatedAt: Date.now(),
    };

    await NotesLocalDB.saveTag(updatedTag);
    await NotesServices.syncTagToFirestore(updatedTag).catch((err) => {
      console.error("Failed to sync tag:", err);
    });

    dispatch({ type: NOTES_UPDATE_TAG_SUCCESS, payload: updatedTag });
    return updatedTag;
  } catch (error) {
    messageUtil.error("Không thể cập nhật thẻ. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Delete a tag
 */
export const deleteTag = (tagId) => async (dispatch) => {
  try {
    const {
      user: { uid },
    } = store.getState().user;

    // Remove tag from all notes that use it
    const allNotes = await NotesLocalDB.getAllNotes(uid);
    const notesWithTag = allNotes.filter((note) => note.tags && note.tags.includes(tagId));

    for (const note of notesWithTag) {
      const updatedTags = note.tags.filter((id) => id !== tagId);
      await NotesLocalDB.saveNote({
        ...note,
        tags: updatedTags,
        updatedAt: Date.now(),
      });
      await addToSyncQueue(note.id, "update");
    }

    await NotesLocalDB.deleteTag?.(tagId);
    await NotesServices.deleteTagFromFirestore(tagId).catch((err) => {
      console.error("Failed to delete tag from Firestore:", err);
    });

    dispatch({ type: NOTES_DELETE_TAG_SUCCESS, payload: tagId });
    messageUtil.success("Thẻ đã được xóa");
  } catch (error) {
    messageUtil.error("Không thể xóa thẻ. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Get all folders
 */
export const getFolders = () => async (dispatch) => {
  try {
    const {
      user: { uid },
    } = store.getState().user;

    if (!uid) {
      throw new Error("User not authenticated");
    }

    const folders = await NotesLocalDB.getAllFolders(uid);
    dispatch({ type: NOTES_GET_FOLDERS_SUCCESS, payload: folders });
    return folders;
  } catch (error) {
    console.error("Failed to get folders:", error);
    throw error;
  }
};

/**
 * Create a new folder
 */
export const createFolder = (folderData) => async (dispatch) => {
  try {
    const {
      user: { uid },
    } = store.getState().user;

    if (!uid) {
      throw new Error("User not authenticated");
    }

    const folderId = `folder_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const now = Date.now();

    const newFolder = {
      id: folderId,
      userId: uid,
      name: folderData.name,
      createdAt: now,
      updatedAt: now,
    };

    await NotesLocalDB.saveFolder(newFolder);
    await NotesServices.syncFolderToFirestore(newFolder).catch((err) => {
      console.error("Failed to sync folder:", err);
    });

    dispatch({ type: NOTES_CREATE_FOLDER_SUCCESS, payload: newFolder });
    return newFolder;
  } catch (error) {
    messageUtil.error("Không thể tạo thư mục. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Update a folder
 */
export const updateFolder = (folderId, updates) => async (dispatch) => {
  try {
    const {
      user: { uid },
    } = store.getState().user;
    const allFolders = await NotesLocalDB.getAllFolders(uid);
    const folder = allFolders.find((f) => f.id === folderId);

    if (!folder) {
      throw new Error("Folder not found");
    }

    const updatedFolder = {
      ...folder,
      ...updates,
      updatedAt: Date.now(),
    };

    await NotesLocalDB.saveFolder(updatedFolder);
    await NotesServices.syncFolderToFirestore(updatedFolder).catch((err) => {
      console.error("Failed to sync folder:", err);
    });

    dispatch({ type: NOTES_UPDATE_FOLDER_SUCCESS, payload: updatedFolder });
    return updatedFolder;
  } catch (error) {
    messageUtil.error("Không thể cập nhật thư mục. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Delete a folder
 */
export const deleteFolder = (folderId) => async (dispatch) => {
  try {
    const {
      user: { uid },
    } = store.getState().user;

    // Remove folder from all notes that use it
    const allNotes = await NotesLocalDB.getAllNotes(uid);
    const notesWithFolder = allNotes.filter((note) => note.folderId === folderId);

    for (const note of notesWithFolder) {
      await NotesLocalDB.saveNote({
        ...note,
        folderId: null,
        updatedAt: Date.now(),
      });
      await addToSyncQueue(note.id, "update");
    }

    await NotesLocalDB.deleteFolder?.(folderId);
    await NotesServices.deleteFolderFromFirestore(folderId).catch((err) => {
      console.error("Failed to delete folder from Firestore:", err);
    });

    dispatch({ type: NOTES_DELETE_FOLDER_SUCCESS, payload: folderId });
    messageUtil.success("Thư mục đã được xóa");
  } catch (error) {
    messageUtil.error("Không thể xóa thư mục. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Update note tags
 */
export const updateNoteTags = (noteId, tagIds) => async (dispatch) => {
  try {
    const note = await NotesLocalDB.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    const updatedNote = {
      ...note,
      tags: tagIds,
      updatedAt: Date.now(),
      syncStatus: "pending",
    };

    await NotesLocalDB.saveNote(updatedNote);
    await addToSyncQueue(noteId, "update");

    dispatch({ type: NOTES_UPDATE_NOTE_TAGS_SUCCESS, payload: updatedNote });
    dispatch({ type: NOTES_UPDATE_NOTE_SUCCESS, payload: updatedNote });

    return updatedNote;
  } catch (error) {
    messageUtil.error("Không thể cập nhật thẻ. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Update note folder
 */
export const updateNoteFolder = (noteId, folderId) => async (dispatch) => {
  try {
    const note = await NotesLocalDB.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    const updatedNote = {
      ...note,
      folderId: folderId,
      updatedAt: Date.now(),
      syncStatus: "pending",
    };

    await NotesLocalDB.saveNote(updatedNote);
    await addToSyncQueue(noteId, "update");

    dispatch({ type: NOTES_UPDATE_NOTE_FOLDER_SUCCESS, payload: updatedNote });
    dispatch({ type: NOTES_UPDATE_NOTE_SUCCESS, payload: updatedNote });

    return updatedNote;
  } catch (error) {
    messageUtil.error("Không thể cập nhật thư mục. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Archive a note
 */
export const archiveNote = (noteId) => async (dispatch) => {
  try {
    const note = await NotesLocalDB.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    const updatedNote = {
      ...note,
      isArchived: true,
      updatedAt: Date.now(),
      syncStatus: "pending",
    };

    await NotesLocalDB.saveNote(updatedNote);
    await addToSyncQueue(noteId, "update");

    dispatch({ type: NOTES_ARCHIVE_NOTE_SUCCESS, payload: updatedNote });
    dispatch({ type: NOTES_UPDATE_NOTE_SUCCESS, payload: updatedNote });
    messageUtil.success("Ghi chú đã được lưu trữ");

    return updatedNote;
  } catch (error) {
    messageUtil.error("Không thể lưu trữ ghi chú. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Unarchive a note
 */
export const unarchiveNote = (noteId) => async (dispatch) => {
  try {
    const note = await NotesLocalDB.getNote(noteId);
    if (!note) {
      throw new Error("Note not found");
    }

    const updatedNote = {
      ...note,
      isArchived: false,
      updatedAt: Date.now(),
      syncStatus: "pending",
    };

    await NotesLocalDB.saveNote(updatedNote);
    await addToSyncQueue(noteId, "update");

    dispatch({ type: NOTES_UNARCHIVE_NOTE_SUCCESS, payload: updatedNote });
    dispatch({ type: NOTES_UPDATE_NOTE_SUCCESS, payload: updatedNote });
    messageUtil.success("Ghi chú đã được bỏ lưu trữ");

    return updatedNote;
  } catch (error) {
    messageUtil.error("Không thể bỏ lưu trữ ghi chú. Vui lòng thử lại.");
    throw error;
  }
};

/**
 * Set show archived notes filter
 */
export const setShowArchived = (show) => (dispatch) => {
  dispatch({ type: NOTES_SET_SHOW_ARCHIVED, payload: show });
};
