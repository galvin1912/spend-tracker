import { useState, useEffect } from "react";
import { Modal, Input, Form } from "antd";
import PropTypes from "prop-types";

const FolderModal = ({ visible, onCancel, onOk, folder = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (folder) {
        form.setFieldsValue({ name: folder.name });
      } else {
        form.resetFields();
      }
    }
  }, [visible, folder, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onOk(values);
      setLoading(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={folder ? "Sửa thư mục" : "Tạo thư mục mới"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={folder ? "Cập nhật" : "Tạo"}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên thư mục"
          rules={[
            { required: true, message: "Vui lòng nhập tên thư mục" },
            { max: 50, message: "Tên thư mục không được quá 50 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tên thư mục..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

FolderModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  folder: PropTypes.object,
};

export default FolderModal;
