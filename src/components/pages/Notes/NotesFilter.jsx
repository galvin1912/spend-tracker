import { useMemo, useState, useEffect } from "react";
import { Select, Button, Space, Checkbox, Modal } from "antd";
import { CloseOutlined, SettingOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { filterByTag, filterByFolder, clearFilters, setShowArchived } from "../../../features/notes/notesActions";
import NotesLocalDB from "../../../services/NotesLocalDB";
import store from "../../../store";
import TagsManager from "./TagsManager";
import FoldersManager from "./FoldersManager";

const NotesFilter = () => {
  const dispatch = useDispatch();
  const filterTags = useSelector((state) => state.notes.filterTags);
  const filterFolderId = useSelector((state) => state.notes.filterFolderId);
  const showArchived = useSelector((state) => state.notes.showArchived);
  const [tags, setTags] = useState([]);
  const [folders, setFolders] = useState([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsTab, setSettingsTab] = useState("tags"); // "tags" or "folders"

  useEffect(() => {
    const loadFilters = async () => {
      const {
        user: { uid },
      } = store.getState().user;

      if (uid) {
        const [allTags, allFolders] = await Promise.all([
          NotesLocalDB.getAllTags(uid),
          NotesLocalDB.getAllFolders(uid),
        ]);
        setTags(allTags);
        setFolders(allFolders);
      }
    };

    loadFilters();
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filterTags.length > 0 || filterFolderId !== null;
  }, [filterTags, filterFolderId]);

  const handleTagChange = (values) => {
    dispatch(filterByTag(values));
  };

  const handleFolderChange = (value) => {
    // Ensure null instead of undefined when clearing
    dispatch(filterByFolder(value ?? null));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleShowArchivedChange = (e) => {
    dispatch(setShowArchived(e.target.checked));
  };

  return (
    <Space direction="vertical" style={{ width: "100%", marginBottom: "16px" }}>
      <Select
        mode="multiple"
        placeholder="Lọc theo thẻ"
        value={filterTags}
        onChange={handleTagChange}
        style={{ width: "100%" }}
        allowClear
        options={tags.map((tag) => ({
          label: tag.name,
          value: tag.id,
        }))}
      />

      <Select
        placeholder="Lọc theo thư mục"
        value={filterFolderId}
        onChange={handleFolderChange}
        style={{ width: "100%" }}
        allowClear
        options={folders.map((folder) => ({
          label: folder.name,
          value: folder.id,
        }))}
      />

      <Checkbox checked={showArchived} onChange={handleShowArchivedChange}>
        Hiển thị notes đã lưu trữ
      </Checkbox>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {hasActiveFilters && (
          <Button
            icon={<CloseOutlined />}
            onClick={handleClearFilters}
            size="small"
          >
            Xóa bộ lọc
          </Button>
        )}
        <Button
          icon={<SettingOutlined />}
          onClick={() => setSettingsModalVisible(true)}
          size="small"
        >
          Quản lý thẻ và thư mục
        </Button>
      </div>

      <Modal
        title="Quản lý thẻ và thư mục"
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <div>
            <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
              <Button
                type={settingsTab === "tags" ? "primary" : "default"}
                onClick={() => setSettingsTab("tags")}
              >
                Thẻ
              </Button>
              <Button
                type={settingsTab === "folders" ? "primary" : "default"}
                onClick={() => setSettingsTab("folders")}
              >
                Thư mục
              </Button>
            </div>
            {settingsTab === "tags" ? <TagsManager /> : <FoldersManager />}
          </div>
        </Space>
      </Modal>
    </Space>
  );
};

export default NotesFilter;
