import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Row, Col, Form, Input, ColorPicker, Button, Card, message } from "antd";
import { useTranslation } from "react-i18next";
import CategoryImage from "../assets/4569774.jpg";
import TrackerServices from "../services/TrackerServices";

const TrackerCategoryCreate = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      message.success(t('categoryCreateSuccess'));
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
          title={t('createCategory')}
          extra={
            <Link to={`/tracker/detail/${trackerID}`}>
              <Button danger>{t('back')}</Button>
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
              label={t('categoryName')}
              name="name"
              rules={[
                {
                  required: true,
                  message: t('required', { field: t('categoryName').toLowerCase() }),
                },
                {
                  max: 20,
                  message: t('maxLength', { field: t('categoryName').toLowerCase(), length: 20 }),
                },
                {
                  whitespace: true,
                  message: t('emptyField', { field: t('categoryName').toLowerCase() }),
                },
              ]}
            >
              <Input placeholder={t('enterCategoryName')} />
            </Form.Item>

            <Form.Item
              label={t('categoryColor')}
              name="color"
              rules={[
                {
                  required: true,
                  message: t('selectColor'),
                },
              ]}
            >
              <ColorPicker format="hex" showText onChangeComplete={handleChangeColor} />
            </Form.Item>

            <Form.Item>
              <Link to={`/tracker/detail/${trackerID}`}>
                <Button className="me-2" disabled={isSubmitting}>
                  {t('cancel')}
                </Button>
              </Link>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t('createCategory')}
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
