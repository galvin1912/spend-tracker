import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Button, Form, Input, Select } from "antd";
import { register } from "../features/user/userActions";
import LoginImage from "../assets/account-login-protection-8876027-7271014.png";

const Register = () => {
  const dispatch = useDispatch();

  const onFinish = (values) => {
    dispatch(register(values));
  };

  return (
    <>
      <Helmet
        title="Đăng kí | GST"
        meta={[
          {
            name: "description",
            content: "Đăng kí để sử dụng các tính năng của hệ thống.",
          },
        ]}
      />

      <div className="row">
        <div className="col-md-6 order-md-2">
          <Form
            name="registerForm"
            initialValues={{
              email: "",
              fullName: "",
              gender: "",
              password: "",
              passwordConfirm: "",
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
              label="Họ và tên"
              name="fullName"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập họ và tên!",
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

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
                {
                  pattern:
                    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
                  message:
                    "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt!",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="Nhập lại mật khẩu"
              name="passwordConfirm"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập lại mật khẩu!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      new Error("Mật khẩu nhập lại không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Đăng kí
              </Button>
            </Form.Item>

            <p>
              Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </Form>
        </div>

        <div className="col-md-6 order-md-1">
          <h1 className="d-none d-md-block">Đăng kí</h1>
          <p>
            Đăng kí để sử dụng các tính năng của hệ thống. Nếu bạn đã có tài
            khoản, vui lòng đăng nhập.
          </p>
          <img src={LoginImage} alt="Login" className="mw-100" />
        </div>
      </div>
    </>
  );
};

export default Register;
