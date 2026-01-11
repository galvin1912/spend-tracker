import { useState, useEffect } from "react";
import { Modal, Input, Form } from "antd";
import PropTypes from "prop-types";

const TagModal = ({ visible, onCancel, onOk, tag = null }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (tag) {
        form.setFieldsValue({ name: tag.name });
      } else {
        form.resetFields();
      }
    }
  }, [visible, tag, form]);

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
      title={tag ? "Sửa thẻ" : "Tạo thẻ mới"}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={tag ? "Cập nhật" : "Tạo"}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Tên thẻ"
          rules={[
            { required: true, message: "Vui lòng nhập tên thẻ" },
            { max: 50, message: "Tên thẻ không được quá 50 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tên thẻ..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

TagModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  tag: PropTypes.object,
};

export default TagModal;
