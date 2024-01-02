import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Row, Col, Form, Input, InputNumber, Button, DatePicker, Card, Select, message } from "antd";
import dayjs from "dayjs";
import TransactionBg from "../assets/transaction-bg.jpg";
import TrackerServices from "../services/TrackerServices";

const TrackerTransactionCreate = () => {
  const navigate = useNavigate();

  const { trackerID } = useParams();

  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // get categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const categories = await TrackerServices.getCategories(trackerID);
        setCategories([{ name: "Không có danh mục", uid: "uncategorized" }, ...categories]);
      } catch (error) {
        message.error(error.message);
      }
    };

    getCategories();
  }, [trackerID]);

  const onFinish = async (values) => {
    setIsSubmitting(true);

    try {
      await TrackerServices.createTransaction(trackerID, values);
      message.success("Thêm giao dịch thành công");
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
          title="Thêm giao dịch"
          extra={
            <Link to={`/tracker/detail/${trackerID}`}>
              <Button danger>Quay lại</Button>
            </Link>
          }
        >
          <Form
            name="transactionCreateForm"
            form={form}
            autoComplete="off"
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              time: dayjs(),
              category: "uncategorized",
              description: "",
            }}
          >
            <Form.Item
              label="Thời gian"
              name="time"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian",
                },
              ]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="Tên giao dịch"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên giao dịch",
                },
                {
                  max: 50,
                  message: "Tên giao dịch không được dài quá 50 ký tự",
                },
                {
                  whitespace: true,
                  message: "Tên giao dịch không được để trống",
                },
              ]}
            >
              <Input placeholder="Nhập tên giao dịch" />
            </Form.Item>

            <Form.Item
              label="Số tiền"
              name="amount"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số tiền",
                },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder="Nhập số tiền"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                prefix="₫"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Loại giao dịch"
              name="type"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại giao dịch",
                },
              ]}
            >
              <Select
                placeholder="Chọn loại giao dịch"
                options={[
                  { label: "Thu nhập", value: "income" },
                  { label: "Chi tiêu", value: "expense" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Danh mục"
              name="category"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn danh mục",
                },
              ]}
            >
              <Select
                placeholder="Chọn danh mục"
                options={categories.map((category) => ({
                  label: category?.name,
                  value: category?.uid,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[
                {
                  max: 100,
                  message: "Mô tả không được dài quá 100 ký tự",
                },
                {
                  whitespace: true,
                  message: "Mô tả không được để trống",
                },
              ]}
            >
              <Input.TextArea placeholder="Nhập mô tả" />
            </Form.Item>

            <Form.Item>
              <Link to={`/tracker/detail/${trackerID}`}>
                <Button className="me-2">Hủy</Button>
              </Link>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Thêm
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
      <Col span={24} md={12}>
        <img src={TransactionBg} alt="Transaction" className="img-fluid" />
      </Col>
    </Row>
  );
};

export default TrackerTransactionCreate;
