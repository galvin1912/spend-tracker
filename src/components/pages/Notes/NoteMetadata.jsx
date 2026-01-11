import { useEffect } from "react";
import { Select, Button, Space } from "antd";
import { Pin, Archive } from "@styled-icons/boxicons-regular";
import { Pin as PinSolid, Archive as ArchiveSolid } from "@styled-icons/boxicons-solid";
import { useDispatch, useSelector } from "react-redux";
import {
  pinNote,
  archiveNote,
  unarchiveNote,
  updateNoteTags,
  updateNoteFolder,
} from "../../../features/notes/notesActions";
import { getTags, getFolders } from "../../../features/notes/notesActions";
import store from "../../../store";
import PropTypes from "prop-types";

const NoteMetadata = ({ noteId }) => {
  const dispatch = useDispatch();
  const note = useSelector((state) => state.notes.notes[noteId]);
  const tags = useSelector((state) => state.notes.tags);
  const folders = useSelector((state) => state.notes.folders);

  useEffect(() => {
    const loadMetadata = async () => {
      const {
        user: { uid },
      } = store.getState().user;
      if (uid) {
        await Promise.all([dispatch(getTags()), dispatch(getFolders())]);
      }
    };
    loadMetadata();
  }, [dispatch]);

  if (!note) {
    return null;
  }

  const handlePinToggle = () => {
    dispatch(pinNote(noteId));
  };

  const handleArchiveToggle = () => {
    if (note.isArchived) {
      dispatch(unarchiveNote(noteId));
    } else {
      dispatch(archiveNote(noteId));
    }
  };

  const handleTagsChange = (tagIds) => {
    dispatch(updateNoteTags(noteId, tagIds));
  };

  const handleFolderChange = (folderId) => {
    dispatch(updateNoteFolder(noteId, folderId || null));
  };

  const tagsOptions = Object.values(tags).map((tag) => ({
    label: tag.name,
    value: tag.id,
  }));

  const foldersOptions = Object.values(folders).map((folder) => ({
    label: folder.name,
    value: folder.id,
  }));

  return (
    <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0" }}>
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <Select
            mode="multiple"
            placeholder="Thêm thẻ..."
            value={note.tags || []}
            onChange={handleTagsChange}
            style={{ flex: 1, minWidth: "150px" }}
            options={tagsOptions}
            allowClear
          />
          <Select
            placeholder="Chọn thư mục..."
            value={note.folderId || undefined}
            onChange={handleFolderChange}
            style={{ flex: 1, minWidth: "150px" }}
            options={foldersOptions}
            allowClear
          />
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Button
            type={note.isPinned ? "primary" : "default"}
            icon={note.isPinned ? <PinSolid size="16" /> : <Pin size="16" />}
            onClick={handlePinToggle}
            size="small"
          >
            {note.isPinned ? "Đã ghim" : "Ghim"}
          </Button>
          <Button
            type={note.isArchived ? "default" : "default"}
            icon={note.isArchived ? <ArchiveSolid size="16" /> : <Archive size="16" />}
            onClick={handleArchiveToggle}
            size="small"
          >
            {note.isArchived ? "Đã lưu trữ" : "Lưu trữ"}
          </Button>
        </div>
      </Space>
    </div>
  );
};

NoteMetadata.propTypes = {
  noteId: PropTypes.string.isRequired,
};

export default NoteMetadata;
