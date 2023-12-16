import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Button, Form, Input } from "antd";
import { login } from "../features/user/userActions";
import LoginImage from "../assets/account-login-protection-8876027-7271014.png";

const Login = () => {
  const dispatch = useDispatch();

  const onFinish = (values) => {
    const { email, password } = values;
    dispatch(login(email, password));
  };

  return (
    <>
      <Helmet
        title="Đăng nhập | GST"
        meta={[
          {
            name: "description",
            content: "Đăng nhập để sử dụng các tính năng của hệ thống.",
          },
        ]}
      />

      <div className="row">
        <div className="col-md-6 order-md-2">
          <Form
            name="loginForm"
            initialValues={{
              email: "",
              password: "",
            }}
            onFinish={onFinish}
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
                {
                  type: "email",
                  message: "Email không hợp lệ!",
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

            <p>
              Bạn chưa có tài khoản? <Link to="/register">Đăng kí</Link>
            </p>
          </Form>
        </div>

        <div className="col-md-6 order-md-1">
          <h1 className="d-none d-md-block">Đăng nhập</h1>
          <p>
            Đăng nhập để sử dụng các tính năng của hệ thống. Nếu bạn chưa có tài
            khoản, vui lòng đăng kí.
          </p>
          <img src={LoginImage} alt="Login" className="mw-100" />
        </div>
      </div>
    </>
  );
};

export default Login;
