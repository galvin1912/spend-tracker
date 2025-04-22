import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Row, Col, Form, Input, ColorPicker, Button, Card, message } from "antd";
import { useTranslation } from "react-i18next";
import TrackerServices from "../services/TrackerServices";
import EditImage from "../assets/write-edit.webp";

const TrackerCategoryDetail = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { trackerID, categoryID } = useParams();

  const [form] = Form.useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getCategoryDetail = async () => {
      try {
        const categoryDetail = await TrackerServices.getCategoryDetail(trackerID, categoryID);
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
      message.success(t('categoryUpdateSuccess'));
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
          title={t('updateCategory')}
          extra={
            <Link to={`/tracker/detail/${trackerID}/category/list`}>
              <Button danger>{t('back')}</Button>
            </Link>
          }
        >
          <Form name="categoryDetailForm" form={form} layout="vertical" autoComplete="off" onFinish={onFinish}>
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
              <Link to={`/tracker/detail/${trackerID}/category/list`}>
                <Button className="me-2" disabled={isSubmitting}>
                  {t('cancel')}
                </Button>
              </Link>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {t('update')}
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
