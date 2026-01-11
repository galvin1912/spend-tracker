import { useState, useEffect } from "react";
import { Button, List, Popconfirm, Empty } from "antd";
import { Plus, Edit, Trash } from "@styled-icons/boxicons-regular";
import { useDispatch, useSelector } from "react-redux";
import { getTags, createTag, updateTag, deleteTag } from "../../../features/notes/notesActions";
import TagModal from "./TagModal";
import store from "../../../store";

const TagsManager = () => {
  const dispatch = useDispatch();
  const tags = useSelector((state) => state.notes.tags);
  const notes = useSelector((state) => state.notes.notes);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);

  useEffect(() => {
    const loadTags = async () => {
      const {
        user: { uid },
      } = store.getState().user;
      if (uid) {
        await dispatch(getTags());
      }
    };
    loadTags();
  }, [dispatch]);

  const handleCreate = () => {
    setEditingTag(null);
    setModalVisible(true);
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setModalVisible(true);
  };

  const handleDelete = async (tagId) => {
    await dispatch(deleteTag(tagId));
  };

  const handleModalOk = async (values) => {
    if (editingTag) {
      await dispatch(updateTag(editingTag.id, values));
    } else {
      await dispatch(createTag(values));
    }
    setModalVisible(false);
    setEditingTag(null);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingTag(null);
  };

  const getTagUsageCount = (tagId) => {
    return Object.values(notes).filter(
      (note) => note.tags && note.tags.includes(tagId)
    ).length;
  };

  const tagsList = Object.values(tags);

  return (
    <div>
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Quản lý thẻ</h3>
        <Button type="primary" icon={<Plus size="16" />} onClick={handleCreate}>
          Tạo thẻ mới
        </Button>
      </div>

      {tagsList.length === 0 ? (
        <Empty description="Chưa có thẻ nào" />
      ) : (
        <List
          dataSource={tagsList}
          renderItem={(tag) => (
            <List.Item
              actions={[
                <Button
                  key="edit"
                  type="text"
                  icon={<Edit size="16" />}
                  onClick={() => handleEdit(tag)}
                >
                  Sửa
                </Button>,
                <Popconfirm
                  key="delete"
                  title="Xóa thẻ này?"
                  description="Thẻ sẽ bị xóa khỏi tất cả các ghi chú."
                  onConfirm={() => handleDelete(tag.id)}
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
                title={tag.name}
                description={`Được sử dụng trong ${getTagUsageCount(tag.id)} ghi chú`}
              />
            </List.Item>
          )}
        />
      )}

      <TagModal
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        tag={editingTag}
      />
    </div>
  );
};

export default TagsManager;
