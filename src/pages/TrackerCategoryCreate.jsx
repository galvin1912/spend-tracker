import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Row, Col, Form, Input, ColorPicker, Button, Card, message } from "antd";
import CategoryImage from "../assets/4569774.jpg";
import TrackerServices from "../services/TrackerServices";

const TrackerCategoryCreate = () => {
  const navigate = useNavigate();

  const { trackerID } = useParams();

  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangeColor = (value) => {
    form.setFieldsValue({
      color: value.toHexString(),
    });
  };

  const onFinish = async (values) => {
    setIsSubmitting(true);
    try {
      await TrackerServices.createCategory(trackerID, values);
      message.success("Tạo danh mục thành công!");
      navigate(`/tracker/detail/${trackerID}`);
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Row gutter={[24, 12]}>
      <Col span={24} md={12}>
        <Card
          title="Thêm danh mục"
          extra={
            <Link to={`/tracker/detail/${trackerID}`}>
              <Button danger>Quay lại</Button>
            </Link>
          }
        >
          <Form
            form={form}
            name="trackerCategoryCreateForm"
            layout="vertical"
            autoComplete="off"
            initialValues={{
              name: "",
              color: "#1677FF",
            }}
            onFinish={onFinish}
          >
            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên danh mục",
                },
                {
                  max: 20,
                  message: "Tên danh mục không được vượt quá 20 ký tự",
                },
                {
                  whitespace: true,
                  message: "Tên danh mục không được để trống",
                },
              ]}
            >
              <Input placeholder="Nhập tên danh mục" />
            </Form.Item>

            <Form.Item
              label="Màu sắc (hiển thị trên biểu đồ)"
              name="color"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn màu sắc!",
                },
              ]}
            >
              <ColorPicker format="hex" showText onChangeComplete={handleChangeColor} />
            </Form.Item>

            <Form.Item>
              <Link to={`/tracker/detail/${trackerID}`}>
                <Button className="me-2" disabled={isSubmitting}>
                  Hủy
                </Button>
              </Link>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Tạo danh mục
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={24} md={12}>
        <img src={CategoryImage} alt="Category" className="img-fluid" />
      </Col>
    </Row>
  );
};

export default TrackerCategoryCreate;
