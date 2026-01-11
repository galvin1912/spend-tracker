import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Select, Space } from "antd";
import { Plus } from "@styled-icons/boxicons-regular";
import { 
  getNotes, 
  createNote, 
  setSortBy, 
  filterByTag, 
  filterByFolder, 
  setShowArchived,
  setSearchQuery
} from "../features/notes/notesActions";
import NotesList from "../components/pages/Notes/NotesList";
import NotesSearch from "../components/pages/Notes/NotesSearch";
import NotesFilter from "../components/pages/Notes/NotesFilter";

const Notes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const notes = useSelector((state) => state.notes.notes);
  const sortBy = useSelector((state) => state.notes.sortBy);
  const filterTags = useSelector((state) => state.notes.filterTags);
  const filterFolderId = useSelector((state) => state.notes.filterFolderId);
  const showArchived = useSelector((state) => state.notes.showArchived);
  const searchQuery = useSelector((state) => state.notes.searchQuery);
  
  const hasInitialized = useRef(false);
  const lastURLParams = useRef("");

  // Initialize Redux state from URL params on mount
  useEffect(() => {
    if (hasInitialized.current) return;
    
    hasInitialized.current = true;
    lastURLParams.current = searchParams.toString();

    // Read filter params from URL
    const urlTags = searchParams.get("tags");
    const urlFolder = searchParams.get("folder");
    const urlArchived = searchParams.get("archived");
    const urlSort = searchParams.get("sort");
    const urlSearch = searchParams.get("search");

    if (urlTags) {
      const tagIds = urlTags.split(",").filter(Boolean);
      if (tagIds.length > 0) {
        dispatch(filterByTag(tagIds));
      }
    }

    if (urlFolder) {
      dispatch(filterByFolder(urlFolder));
    }

    if (urlArchived === "true") {
      dispatch(setShowArchived(true));
    }

    if (urlSort && ["updatedAt", "createdAt", "title"].includes(urlSort)) {
      dispatch(setSortBy(urlSort));
    }

    if (urlSearch) {
      dispatch(setSearchQuery(urlSearch));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync Redux state to URL params when state changes
  useEffect(() => {
    if (!hasInitialized.current) return;

    const newSearchParams = new URLSearchParams();

    // Update tags
    if (filterTags.length > 0) {
      newSearchParams.set("tags", filterTags.join(","));
    }

    // Update folder
    if (filterFolderId) {
      newSearchParams.set("folder", filterFolderId);
    }

    // Update archived
    if (showArchived) {
      newSearchParams.set("archived", "true");
    }

    // Update sort (only if not default)
    if (sortBy && sortBy !== "updatedAt") {
      newSearchParams.set("sort", sortBy);
    }

    // Update search
    if (searchQuery && searchQuery.trim()) {
      newSearchParams.set("search", searchQuery.trim());
    }

    const newParamsString = newSearchParams.toString();
    
    // Only update URL if params actually changed
    if (newParamsString !== lastURLParams.current) {
      lastURLParams.current = newParamsString;
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [filterTags, filterFolderId, showArchived, sortBy, searchQuery, setSearchParams]);

  // Sync URL changes back to Redux state (for browser back/forward)
  useEffect(() => {
    if (!hasInitialized.current) return;

    const currentParamsString = searchParams.toString();
    
    // Only sync if URL changed externally (not from our own updates)
    if (currentParamsString === lastURLParams.current) return;
    
    // Update lastURLParams to prevent re-triggering
    const previousParams = lastURLParams.current;
    lastURLParams.current = currentParamsString;

    const urlTags = searchParams.get("tags");
    const urlFolder = searchParams.get("folder");
    const urlArchived = searchParams.get("archived");
    const urlSort = searchParams.get("sort");
    const urlSearch = searchParams.get("search");

    // Parse previous URL params for comparison
    const prevSearchParams = new URLSearchParams(previousParams);
    const prevTags = prevSearchParams.get("tags");
    const prevFolder = prevSearchParams.get("folder");
    const prevArchived = prevSearchParams.get("archived");
    const prevSort = prevSearchParams.get("sort");
    const prevSearch = prevSearchParams.get("search");

    // Only update if value actually changed
    if (urlTags !== prevTags) {
      const urlTagIds = urlTags ? urlTags.split(",").filter(Boolean) : [];
      dispatch(filterByTag(urlTagIds));
    }
    if (urlFolder !== prevFolder) {
      dispatch(filterByFolder(urlFolder || null));
    }
    if (urlArchived !== prevArchived) {
      dispatch(setShowArchived(urlArchived === "true"));
    }
    if (urlSort !== prevSort) {
      if (urlSort && ["updatedAt", "createdAt", "title"].includes(urlSort)) {
        dispatch(setSortBy(urlSort));
      } else if (!urlSort) {
        dispatch(setSortBy("updatedAt"));
      }
    }
    if (urlSearch !== prevSearch) {
      dispatch(setSearchQuery(urlSearch || ""));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    dispatch(getNotes());
  }, [dispatch]);

  const handleCreateNote = async () => {
    const newNote = await dispatch(createNote());
    if (newNote?.id) {
      navigate(`/notes/${newNote.id}`);
    }
  };

  const handleNoteSelect = (noteId) => {
    if (noteId) {
      // Navigation is handled by NotesList component now
      // This is kept for backward compatibility
    }
  };

  const handleSortChange = (value) => {
    dispatch(setSortBy(value));
    // URL will be updated automatically by the sync effect above
  };

  const hasNotes = notes && typeof notes === 'object' && Object.keys(notes).length > 0;

  // Mobile layout: Stack view
  return (
    <div className="page-container">
      <Helmet
        title="Ghi chú | GST"
        meta={[
          {
            name: "description",
            content: "Quản lý ghi chú cá nhân của bạn",
          },
        ]}
      />

      <div className="page-header">
        <h1 className="page-title">Ghi chú</h1>
        <Button type="primary" icon={<Plus size="20" />} onClick={handleCreateNote}>
          Tạo mới
        </Button>
      </div>

      <div>
        <Space direction="vertical" style={{ width: "100%" }}>
          <NotesSearch />
          <Select
            value={sortBy}
            onChange={handleSortChange}
            style={{ width: "100%" }}
            size="middle"
          >
            <Select.Option value="updatedAt">Mới nhất</Select.Option>
            <Select.Option value="createdAt">Cũ nhất</Select.Option>
            <Select.Option value="title">Theo tên</Select.Option>
          </Select>
          <NotesFilter />
        </Space>

        <div style={{ marginTop: "16px", minHeight: "400px" }}>
          {hasNotes ? (
            <NotesList height={500} onNoteSelect={handleNoteSelect} />
          ) : (
            <div style={{ textAlign: "center", padding: "32px" }}>
              <p style={{ color: "#8c8c8c", marginBottom: "16px" }}>
                Chưa có ghi chú nào
              </p>
              <Button type="primary" onClick={handleCreateNote}>
                Tạo ghi chú đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Notes;
