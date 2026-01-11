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

const initialState = {
  notes: {}, // Map<id, note>
  tags: {}, // Map<id, tag>
  folders: {}, // Map<id, folder>
  isLoading: false,
  selectedNoteId: null,
  searchQuery: "",
  filterTags: [],
  filterFolderId: null,
  showArchived: false,
  sortBy: "updatedAt", // 'updatedAt' | 'createdAt' | 'title'
  saveStatus: {}, // Map<noteId, 'saving' | 'saved' | 'error'>
};

const notesReducer = (state = initialState, action) => {
  switch (action.type) {
    case NOTES_GET_NOTES:
      return { ...state, isLoading: true };

    case NOTES_GET_NOTES_SUCCESS: {
      const notesMap = {};
      action.payload.forEach((note) => {
        notesMap[note.id] = note;
      });
      return {
        ...state,
        isLoading: false,
        notes: notesMap,
      };
    }

    case NOTES_GET_NOTES_FAILED:
      return { ...state, isLoading: false };

    case NOTES_CREATE_NOTE_SUCCESS:
    case NOTES_UPDATE_NOTE_SUCCESS:
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.payload.id]: action.payload,
        },
      };

    case NOTES_DELETE_NOTE_SUCCESS:
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.payload.id]: action.payload,
        },
      };

    case NOTES_RESTORE_NOTE_SUCCESS:
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.payload.id]: action.payload,
        },
      };

    case NOTES_PIN_NOTE_SUCCESS:
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.payload.id]: action.payload,
        },
      };

    case NOTES_SET_SELECTED_NOTE:
      return {
        ...state,
        selectedNoteId: action.payload,
      };

    case NOTES_SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case NOTES_FILTER_BY_TAG:
      return {
        ...state,
        filterTags: action.payload,
      };

    case NOTES_FILTER_BY_FOLDER:
      return {
        ...state,
        filterFolderId: action.payload,
      };

    case NOTES_CLEAR_FILTERS:
      return {
        ...state,
        filterTags: [],
        filterFolderId: null,
        searchQuery: "",
      };

    case NOTES_SET_SORT_BY:
      return {
        ...state,
        sortBy: action.payload,
      };

    case NOTES_SET_SAVE_STATUS:
      return {
        ...state,
        saveStatus: {
          ...state.saveStatus,
          [action.payload.noteId]: action.payload.status,
        },
      };

    case NOTES_GET_TAGS_SUCCESS: {
      const tagsMap = {};
      action.payload.forEach((tag) => {
        tagsMap[tag.id] = tag;
      });
      return {
        ...state,
        tags: tagsMap,
      };
    }

    case NOTES_CREATE_TAG_SUCCESS:
    case NOTES_UPDATE_TAG_SUCCESS:
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.payload.id]: action.payload,
        },
      };

    case NOTES_DELETE_TAG_SUCCESS: {
      const newTags = { ...state.tags };
      delete newTags[action.payload];
      return {
        ...state,
        tags: newTags,
      };
    }

    case NOTES_GET_FOLDERS_SUCCESS: {
      const foldersMap = {};
      action.payload.forEach((folder) => {
        foldersMap[folder.id] = folder;
      });
      return {
        ...state,
        folders: foldersMap,
      };
    }

    case NOTES_CREATE_FOLDER_SUCCESS:
    case NOTES_UPDATE_FOLDER_SUCCESS:
      return {
        ...state,
        folders: {
          ...state.folders,
          [action.payload.id]: action.payload,
        },
      };

    case NOTES_DELETE_FOLDER_SUCCESS: {
      const newFolders = { ...state.folders };
      delete newFolders[action.payload];
      return {
        ...state,
        folders: newFolders,
      };
    }

    case NOTES_UPDATE_NOTE_TAGS_SUCCESS:
    case NOTES_UPDATE_NOTE_FOLDER_SUCCESS:
    case NOTES_ARCHIVE_NOTE_SUCCESS:
    case NOTES_UNARCHIVE_NOTE_SUCCESS:
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.payload.id]: action.payload,
        },
      };

    case NOTES_SET_SHOW_ARCHIVED:
      return {
        ...state,
        showArchived: action.payload,
      };

    default:
      return state;
  }
};

export default notesReducer;
