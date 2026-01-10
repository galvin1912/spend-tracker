import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Row, Col, Form, Input, InputNumber, Button, DatePicker, Card, Select, Popconfirm, message } from "antd";
import dayjs from "../configs/dayjs";
import TransactionBg from "../assets/aaaaa.webp";
import TrackerServices from "../services/TrackerServices";
import { translateError } from "../utils/errorTranslator";

const TrackerTransactionDetail = () => {
  const navigate = useNavigate();
  const { trackerID, transactionID } = useParams();

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
        message.error(translateError(error));
      }
    };

    getCategories();
  }, [trackerID]);

  // get transaction detail
  useEffect(() => {
    const getTransactionDetail = async () => {
      try {
        const transactionDetail = await TrackerServices.getTransactionDetail(trackerID, transactionID);
        form.setFieldsValue({
          ...transactionDetail,
          time: dayjs(transactionDetail.time.toDate()),
          amount: Math.abs(transactionDetail.amount),
        });
      } catch (error) {
        message.error(translateError(error));
      }
    };

    getTransactionDetail();
  }, [trackerID, transactionID, form]);

  const onFinish = async (values) => {
    setIsSubmitting(true);

    try {
      await TrackerServices.updateTransaction(trackerID, transactionID, values);
      message.success("Cập nhật giao dịch thành công");
      navigate(`/tracker/detail/${trackerID}`);
    } catch (error) {
      message.error(translateError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await TrackerServices.deleteTransaction(trackerID, transactionID);
      message.success("Xóa giao dịch thành công");
      navigate(`/tracker/detail/${trackerID}`);
    } catch (error) {
      message.error(translateError(error));
    }
  };

  return (
    <Row gutter={[24, 12]}>
      <Col span={24} md={12}>
        <Card
          title="Chi tiết giao dịch"
          extra={
            <Link to={`/tracker/detail/${trackerID}`}>
              <Button danger>Quay lại</Button>
            </Link>
          }
        >
          <Form name="transactionDetailForm" form={form} autoComplete="off" layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Thời gian"
              name="time"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập thời gian!",
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
                  message: "Vui lòng nhập tên giao dịch!",
                },
                {
                  max: 50,
                  message: "Tên giao dịch không được vượt quá 50 ký tự!",
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
                  message: "Vui lòng nhập số tiền!",
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
                  message: "Vui lòng nhập loại giao dịch!",
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
                  message: "Vui lòng nhập danh mục!",
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
                  message: "Mô tả không được vượt quá 100 ký tự!",
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
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa giao dịch này?"
                description="Hành động này không thể hoàn tác"
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={handleDeleteTransaction}
              >
                <Button danger type="primary" className="me-2">
                  Xóa giao dịch
                </Button>
              </Popconfirm>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Cập nhật
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

export default TrackerTransactionDetail;
