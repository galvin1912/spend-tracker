import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Row, Col, Form, Input, Select, Button, Card, Avatar, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { updateUserProfile } from "../features/user/userActions";

const UserSettings = () => {
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
        title="Cài đặt tài khoản | GST"
        meta={[
          {
            name: "description",
            content: "Quản lý thông tin cá nhân của bạn.",
          },
        ]}
      />

      <Row gutter={[24, 24]}>
        <Col span={24} md={16}>
          <Card title="Thông tin cá nhân">
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
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ!",
                  },
                ]}
              >
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ và tên!",
                  },
                  {
                    max: 50,
                    message: "Họ và tên không được vượt quá 50 ký tự!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn giới tính!",
                  },
                ]}
              >
                <Select
                  options={[
                    { value: "male", label: "Nam" },
                    { value: "female", label: "Nữ" },
                    { value: "other", label: "Khác" },
                  ]}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={isUpdatingProfile}>
                  Cập nhật thông tin
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={24} md={8}>
          <Card title="Thông tin tài khoản">
            <div className="text-center mb-4">
              <Avatar size={100} icon={<UserOutlined />} src={user?.avatarUrl} />
            </div>
            <div>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
              <p>
                <strong>Họ và tên:</strong> {user?.fullName}
              </p>
              <p>
                <strong>Giới tính:</strong> {user?.gender === "male" ? "Nam" : user?.gender === "female" ? "Nữ" : "Khác"}
              </p>
            </div>

            <div className="mt-4">
              <Card type="inner" title="Đổi mật khẩu">
                <Button onClick={() => message.info("Tính năng đổi mật khẩu sẽ được cập nhật trong thời gian tới.")}>Đổi mật khẩu</Button>
              </Card>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UserSettings;
