import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, ColorPicker, Button, Row, Col, Card } from "antd";
import { createGroup } from "../features/group/groupActions";
import { useTranslation } from "react-i18next";
import GroupImage from "../assets/89z_2203_w009_n001_120b_p14_120.jpg";

const GroupCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const isCreatingGroup = useSelector((state) => state.group.isCreatingGroup);

  const handleChangeColor = (value) => {
    form.setFieldsValue({
      color: value.toHexString(),
    });
  };

  const onFinish = (values) => {
    dispatch(createGroup(values)).then(() => navigate("/group"));
  };

  return (
    <>
      <Helmet
        title={`${t('createGroup')} | GST`}
        meta={[
          {
            name: "description",
            content: t('createGroupDescription', 'Tạo nhóm mới.'),
          },
        ]}
      />

      <Row gutter={[24, 12]}>
        <Col span={24} md={12}>
          <Card
            title={t('createGroup')}
            extra={
              <Link to="/group">
                <Button danger>{t('back')}</Button>
              </Link>
            }
          >
            <Form
              name="groupCreateForm"
              form={form}
              initialValues={{
                groupName: "",
                description: "",
                color: "#1677FF",
              }}
              layout="vertical"
              autoComplete="off"
              onFinish={onFinish}
            >
              <Form.Item
                label={t('groupName')}
                name="groupName"
                rules={[
                  {
                    required: true,
                    message: t('required', { field: t('groupName').toLowerCase() }),
                  },
                  {
                    max: 50,
                    message: t('maxLength', { field: t('groupName').toLowerCase(), length: 50 }),
                  },
                  {
                    whitespace: true,
                    message: t('emptyField', { field: t('groupName').toLowerCase() }),
                  },
                ]}
              >
                <Input placeholder={t('enterGroupName', 'Nhập tên nhóm')} />
              </Form.Item>

              <Form.Item
                label={t('description')}
                name="description"
                rules={[
                  {
                    max: 500,
                    message: t('maxLength', { field: t('description').toLowerCase(), length: 500 }),
                  },
                ]}
              >
                <Input.TextArea placeholder={t('enterDescription')} />
              </Form.Item>

              <Form.Item
                label={t('groupColor')}
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
                <Link to="/group">
                  <Button className="me-2" type="default" disabled={isCreatingGroup}>
                    {t('cancel')}
                  </Button>
                </Link>
                <Button type="primary" htmlType="submit" loading={isCreatingGroup}>
                  {t('createGroup')}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={24} md={12}>
          <img src={GroupImage} alt={t('group')} className="img-fluid" />
        </Col>
      </Row>
    </>
  );
};

export default GroupCreate;
