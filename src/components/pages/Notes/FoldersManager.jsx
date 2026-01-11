import { useState, useEffect } from "react";
import { Button, List, Popconfirm, Empty } from "antd";
import { Plus, Edit, Trash } from "@styled-icons/boxicons-regular";
import { useDispatch, useSelector } from "react-redux";
import { getFolders, createFolder, updateFolder, deleteFolder } from "../../../features/notes/notesActions";
import FolderModal from "./FolderModal";
import store from "../../../store";

const FoldersManager = () => {
  const dispatch = useDispatch();
  const folders = useSelector((state) => state.notes.folders);
  const notes = useSelector((state) => state.notes.notes);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  useEffect(() => {
    const loadFolders = async () => {
      const {
        user: { uid },
      } = store.getState().user;
      if (uid) {
        await dispatch(getFolders());
      }
    };
    loadFolders();
  }, [dispatch]);

  const handleCreate = () => {
    setEditingFolder(null);
    setModalVisible(true);
  };

  const handleEdit = (folder) => {
    setEditingFolder(folder);
    setModalVisible(true);
  };

  const handleDelete = async (folderId) => {
    await dispatch(deleteFolder(folderId));
  };

  const handleModalOk = async (values) => {
    if (editingFolder) {
      await dispatch(updateFolder(editingFolder.id, values));
    } else {
      await dispatch(createFolder(values));
    }
    setModalVisible(false);
    setEditingFolder(null);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingFolder(null);
  };

  const getFolderUsageCount = (folderId) => {
    return Object.values(notes).filter((note) => note.folderId === folderId).length;
  };

  const foldersList = Object.values(folders);

  return (
    <div>
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Quản lý thư mục</h3>
        <Button type="primary" icon={<Plus size="16" />} onClick={handleCreate}>
          Tạo thư mục mới
        </Button>
      </div>

      {foldersList.length === 0 ? (
        <Empty description="Chưa có thư mục nào" />
      ) : (
        <List
          dataSource={foldersList}
          renderItem={(folder) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="text"
                  icon={<Edit size="16" />}
                  onClick={() => handleEdit(folder)}
                >
                  Sửa
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Xóa thư mục này?"
                  description="Các ghi chú trong thư mục sẽ không còn thuộc thư mục nào."
                  onConfirm={() => handleDelete(folder.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="text" danger icon={<Trash size="16" />}>
                    Xóa
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={folder.name}
                description={`Chứa ${getFolderUsageCount(folder.id)} ghi chú`}
              />
            </List.Item>
          )}
        />
      )}

      <FolderModal
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        folder={editingFolder}
      />
    </div>
  );
};

export default FoldersManager;
