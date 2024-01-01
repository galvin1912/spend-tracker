import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Input,
  ColorPicker,
  Button,
  Card,
  message,
} from "antd";
import TrackerServices from "../services/TrackerServices";
import EditImage from "../assets/write-edit.webp";

const TrackerCategoryDetail = () => {
  const navigate = useNavigate();

  const { trackerID, categoryID } = useParams();

  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getCategoryDetail = async () => {
      try {
        const categoryDetail = await TrackerServices.getCategoryDetail(
          trackerID,
          categoryID
        );
        form.setFieldsValue({
          name: categoryDetail.name,
          color: categoryDetail.color,
        });
      } catch (error) {
        message.error(error.message);
      }
    };

    getCategoryDetail();
  }, [trackerID, categoryID, form]);

  const handleChangeColor = (value) => {
    form.setFieldsValue({
      color: value.toHexString(),
    });
  };

  const onFinish = async (values) => {
    setIsSubmitting(true);

    try {
      await TrackerServices.updateCategory(trackerID, categoryID, values);
      message.success("Cập nhật danh mục thành công!");
      navigate(`/tracker/detail/${trackerID}/category/list`);
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
          title="Cập nhật danh mục"
          extra={
            <Link to={`/tracker/detail/${trackerID}/category/list`}>
              <Button danger>Quay lại</Button>
            </Link>
          }
        >
          <Form
            name="categoryDetailForm"
            form={form}
            layout="vertical"
            autoComplete="off"
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
              <ColorPicker
                format="hex"
                showText
                onChangeComplete={handleChangeColor}
              />
            </Form.Item>

            <Form.Item>
              <Link to={`/tracker/detail/${trackerID}/category/list`}>
                <Button className="me-2" disabled={isSubmitting}>
                  Hủy
                </Button>
              </Link>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={24} md={12}>
        <img src={EditImage} alt="Category" className="img-fluid" />
      </Col>
    </Row>
  );
};

export default TrackerCategoryDetail;
