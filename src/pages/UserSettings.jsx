import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Row, Col, Form, Input, Select, Button, Card, Avatar, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { updateUserProfile } from "../features/user/userActions";

const UserSettings = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isUpdatingProfile } = useSelector((state) => state.user);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
      });
    }
  }, [form, user]);

  return (
    <>
      <Helmet
        title={`${t("personalInfo")} | GST`}
        meta={[
          {
            name: "description",
            content: t("personalInfoDescription"),
          },
        ]}
      />

      <Row gutter={[24, 24]}>
        <Col span={24} md={16}>
          <Card title={t("updateProfile")}>
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => dispatch(updateUserProfile(values))}
              initialValues={{
                email: "",
                fullName: "",
                gender: "",
              }}
            >
              <Form.Item
                label={t("email")}
                name="email"
                rules={[
                  {
                    required: true,
                    message: t("required", { field: t("email").toLowerCase() }),
                  },
                  {
                    type: "email",
                    message: t("invalidEmail"),
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label={t("fullName")}
                name="fullName"
                rules={[
                  {
                    required: true,
                    message: t("required", { field: t("fullName").toLowerCase() }),
                  },
                  {
                    max: 50,
                    message: t("maxLength", { field: t("fullName").toLowerCase(), length: 50 }),
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={t("gender")}
                name="gender"
                rules={[
                  {
                    required: true,
                    message: t("required", { field: t("gender").toLowerCase() }),
                  },
                ]}
              >
                <Select
                  options={[
                    { value: "male", label: t("male") },
                    { value: "female", label: t("female") },
                    { value: "other", label: t("other") },
                  ]}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isUpdatingProfile}>
                  {t("updateProfile")}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={24} md={8}>
          <Card title={t("personalInfo")}>
            <div className="text-center mb-4">
              <Avatar size={100} icon={<UserOutlined />} src={user?.avatarUrl} />
            </div>
            <div>
              <p>
                <strong>{t("email")}:</strong> {user?.email}
              </p>
              <p>
                <strong>{t("fullName")}:</strong> {user?.fullName}
              </p>
              <p>
                <strong>{t("gender")}:</strong> {user?.gender === "male" ? t('male') : user?.gender === "female" ? t("female") : t("other")}
              </p>
            </div>

            <div className="mt-4">
              <Card type="inner" title={t("changePassword")}>
                <Button onClick={() => message.info(t("changePasswordMessage"))}>{t("changePassword")}</Button>
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UserSettings;
