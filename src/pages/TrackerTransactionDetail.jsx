import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Row, Col, Form, Input, InputNumber, Button, DatePicker, Card, Select, Popconfirm, message } from "antd";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import TransactionBg from "../assets/aaaaa.webp";
import TrackerServices from "../services/TrackerServices";

const TrackerTransactionDetail = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { trackerID, transactionID } = useParams();

  const [form] = Form.useForm();

  const [categories, setCategories] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // get categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const categories = await TrackerServices.getCategories(trackerID);
        setCategories([{ name: t("noCategory"), uid: "uncategorized" }, ...categories]);
      } catch (error) {
        message.error(error.message);
      }
    };

    getCategories();
  }, [trackerID, t]);

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
        message.error(error.message);
      }
    };

    getTransactionDetail();
  }, [trackerID, transactionID, form]);

  const onFinish = async (values) => {
    setIsSubmitting(true);

    try {
      await TrackerServices.updateTransaction(trackerID, transactionID, values);
      message.success(t("transactionUpdateSuccess"));
      navigate(`/tracker/detail/${trackerID}`);
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await TrackerServices.deleteTransaction(trackerID, transactionID);
      message.success(t("transactionDeleteSuccess"));
      navigate(`/tracker/detail/${trackerID}`);
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <Row gutter={[24, 12]}>
      <Col span={24} md={12}>
        <Card
          title={t("transactionDetail")}
          extra={
            <Link to={`/tracker/detail/${trackerID}`}>
              <Button danger>{t("back")}</Button>
            </Link>
          }
        >
          <Form name="transactionDetailForm" form={form} autoComplete="off" layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={t("time")}
              name="time"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("time").toLowerCase() }),
                },
              ]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label={t("transactionName")}
              name="name"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("transactionName").toLowerCase() }),
                },
                {
                  max: 50,
                  message: t("maxLength", { field: t("transactionName").toLowerCase(), length: 50 }),
                },
                {
                  whitespace: true,
                  message: t("emptyField", { field: t("transactionName").toLowerCase() }),
                },
              ]}
            >
              <Input placeholder={t("enterTransactionName")} />
            </Form.Item>

            <Form.Item
              label={t("amount")}
              name="amount"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("amount").toLowerCase() }),
                },
              ]}
            >
              <InputNumber
                className="w-full"
                placeholder={t("enterAmount")}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                prefix="₫"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label={t("transactionType")}
              name="type"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("transactionType").toLowerCase() }),
                },
              ]}
            >
              <Select
                placeholder={t("selectTransactionType")}
                options={[
                  { label: t("income"), value: "income" },
                  { label: t("expense"), value: "expense" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label={t("category")}
              name="category"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("category").toLowerCase() }),
                },
              ]}
            >
              <Select
                placeholder={t("selectCategory")}
                options={categories.map((category) => ({
                  label: category?.name,
                  value: category?.uid,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={t("description")}
              name="description"
              rules={[
                {
                  max: 100,
                  message: t("maxLength", { field: t("description").toLowerCase(), length: 100 }),
                },
                {
                  whitespace: true,
                  message: t("emptyField", { field: t("description").toLowerCase() }),
                },
              ]}
            >
              <Input.TextArea placeholder={t("enterDescription")} />
            </Form.Item>

            <Form.Item>
              <Link to={`/tracker/detail/${trackerID}`}>
                <Button className="me-2">{t("cancel")}</Button>
              </Link>
              <Popconfirm
                title={t("deleteTransactionConfirm")}
                description={t("deleteTransactionWarning")}
                okText={t("delete")}
                cancelText={t("cancel")}
                onConfirm={handleDeleteTransaction}
              >
                <Button danger type="primary" className="me-2">
                  {t("deleteTransaction")}
                </Button>
              </Popconfirm>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t("update")}
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
