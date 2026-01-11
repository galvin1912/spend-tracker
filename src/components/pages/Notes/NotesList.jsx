import { useCallback } from "react";
import { List } from "react-window";
import { Empty, Skeleton } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import NoteCard from "./NoteCard";
import NotesLocalDB from "../../../services/NotesLocalDB";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import store from "../../../store";
import { pinNote, archiveNote, unarchiveNote, deleteNote } from "../../../features/notes/notesActions";

const NotesList = ({ height = 600, onNoteSelect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notesMap = useSelector((state) => state.notes.notes);
  const selectedNoteId = useSelector((state) => state.notes.selectedNoteId);
  const searchQuery = useSelector((state) => state.notes.searchQuery);
  const filterTags = useSelector((state) => state.notes.filterTags);
  const filterFolderId = useSelector((state) => state.notes.filterFolderId);
  const showArchived = useSelector((state) => state.notes.showArchived);
  const sortBy = useSelector((state) => state.notes.sortBy);
  const isLoading = useSelector((state) => state.notes.isLoading);
  const [filteredNotes, setFilteredNotes] = useState([]);

  // Filter and sort notes
  useEffect(() => {
    const filterAndSort = async () => {
      const {
        user: { uid },
      } = store.getState().user;

      if (!uid) {
        setFilteredNotes([]);
        return;
      }

      if (!notesMap || typeof notesMap !== 'object') {
        setFilteredNotes([]);
        return;
      }

      let notes = Object.values(notesMap).filter((note) => !note.isDeleted);

      // Apply archive filter
      if (!showArchived) {
        notes = notes.filter((note) => !note.isArchived);
      }

      // Apply search
      if (searchQuery && searchQuery.trim()) {
        const searchResults = await NotesLocalDB.searchNotes(uid, searchQuery);
        const searchIds = new Set(searchResults.map((n) => n.id));
        notes = notes.filter((note) => searchIds.has(note.id));
      }

      // Apply tag filter
      if (filterTags.length > 0) {
        notes = notes.filter(
          (note) => note.tags && note.tags.some((tagId) => filterTags.includes(tagId))
        );
      }

      // Apply folder filter
      if (filterFolderId != null) {
        notes = notes.filter((note) => note.folderId === filterFolderId);
      }

      // Sort
      notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        switch (sortBy) {
          case "createdAt":
            return (b.createdAt || 0) - (a.createdAt || 0);
          case "title":
            return (a.title || "").localeCompare(b.title || "");
          case "updatedAt":
          default:
            return (b.updatedAt || 0) - (a.updatedAt || 0);
        }
      });

      setFilteredNotes(notes);
    };

    filterAndSort();
  }, [notesMap, searchQuery, filterTags, filterFolderId, sortBy, showArchived]);

  const handleNoteClick = useCallback(
    (noteId) => {
      // Navigate to note detail route
      navigate(`/notes/${noteId}`);
      if (onNoteSelect) {
        onNoteSelect(noteId);
      }
    },
    [navigate, onNoteSelect]
  );

  const handlePin = useCallback(
    (noteId) => {
      dispatch(pinNote(noteId));
    },
    [dispatch]
  );

  const handleArchive = useCallback(
    (noteId) => {
      const note = notesMap[noteId];
      if (note?.isArchived) {
        dispatch(unarchiveNote(noteId));
      } else {
        dispatch(archiveNote(noteId));
      }
    },
    [dispatch, notesMap]
  );

  const handleDelete = useCallback(
    (noteId) => {
      dispatch(deleteNote(noteId));
      // Toast message is already shown in deleteNote action
    },
    [dispatch]
  );

  const Row = useCallback(
    ({ index, style }) => {
      const note = filteredNotes[index];
      if (!note) return null;

      return (
        <div style={style}>
          <NoteCard
            note={note}
            onClick={() => handleNoteClick(note.id)}
            isSelected={note.id === selectedNoteId}
            onPin={handlePin}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        </div>
      );
    },
    [filteredNotes, selectedNoteId, handleNoteClick, handlePin, handleArchive, handleDelete]
  );

  if (isLoading) {
    return (
      <div style={{ padding: "16px" }}>
        <Skeleton active paragraph={{ rows: 3 }} />
        <Skeleton active paragraph={{ rows: 3 }} />
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <Empty
          description={
            searchQuery || filterTags.length > 0 || filterFolderId != null
              ? "Không tìm thấy ghi chú nào"
              : "Chưa có ghi chú nào"
          }
        />
      </div>
    );
  }

  // Calculate item height (approximate)
  const itemHeight = 120;

  return (
    <div style={{ width: "100%" }}>
      <List
        rowComponent={Row}
        rowCount={filteredNotes.length}
        rowHeight={itemHeight}
        rowProps={{}}
        style={{ height, width: "100%" }}
      />
    </div>
  );
};

NotesList.propTypes = {
  height: PropTypes.number,
  onNoteSelect: PropTypes.func,
};

export default NotesList;
