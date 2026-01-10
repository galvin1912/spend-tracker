import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Form, Input, Select, Button, Card, Avatar, message } from "antd";
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
    <div className="page-container">
      <Helmet
        title="Thông tin cá nhân | GST"
        meta={[
          {
            name: "description",
            content: "Quản lý cài đặt và tùy chọn tài khoản của bạn",
          },
        ]}
      />

      <div className="page-header">
        <h1 className="page-title">Cài đặt tài khoản</h1>
      </div>

      <div className="grid grid-cols-1 grid-cols-md-2">
        <Card title="Cập nhật thông tin" className="page-card">
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
                  message: "Vui lòng nhập giới tính!",
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

        <Card title="Thông tin cá nhân" className="page-card">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              src={user?.avatarUrl}
              style={{ 
                backgroundColor: 'var(--primary)',
                border: '3px solid var(--border)'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Email</div>
              <div style={{ fontSize: '1rem', color: 'var(--foreground)', fontWeight: 500 }}>{user?.email}</div>
            </div>
            <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Họ và tên</div>
              <div style={{ fontSize: '1rem', color: 'var(--foreground)', fontWeight: 500 }}>{user?.fullName}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Giới tính</div>
              <div style={{ fontSize: '1rem', color: 'var(--foreground)', fontWeight: 500 }}>
                {user?.gender === "male" ? 'Nam' : user?.gender === "female" ? "Nữ" : "Khác"}
              </div>
            </div>
          </div>

          <Card 
            type="inner" 
            title="Đổi mật khẩu"
            style={{ backgroundColor: 'var(--secondary)' }}
          >
            <Button 
              onClick={() => message.info("Tính năng đổi mật khẩu sẽ được cập nhật trong thời gian tới.")}
              block
            >
              Đổi mật khẩu
            </Button>
          </Card>
        </Card>
      </div>
    </div>
  );
};

export default UserSettings;
