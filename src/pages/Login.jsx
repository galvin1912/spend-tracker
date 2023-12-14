import { Button, Form, Input } from "antd";
import LoginImage from "../assets/account-login-protection-8876027-7271014.png";

const Login = () => {
  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="row">
      <div className="col-md-6 order-md-2">
        <Form
          name="basic"
          initialValues={{
            email: "",
            password: "",
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="col-md-6 order-md-1">
        <h1 className="d-none d-md-block">Đăng nhập</h1>
        <p>
          Đăng nhập để sử dụng các tính năng của hệ thống. Nếu bạn chưa có tài
          khoản, vui lòng liên hệ với quản trị viên để được cấp quyền truy cập.
        </p>
        <img src={LoginImage} alt="Login" className="mw-100" />
      </div>
    </div>
  );
};

export default Login;
