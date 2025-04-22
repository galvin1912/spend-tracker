import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Button, Form, Input } from "antd";
import { login } from "../features/user/userActions";
import { useTranslation } from "react-i18next";
import LoginImage from "../assets/account-login-protection-8876027-7271014.png";

const Login = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const isLoggingIn = useSelector((state) => state.user.isLoggingIn);

  const onFinish = (values) => {
    dispatch(login(values));
  };

  return (
    <>
      <Helmet
        title={`${t("loginTitle")} | GST`}
        meta={[
          {
            name: "description",
            content: t("loginDescription"),
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
              <Input />
            </Form.Item>

            <Form.Item
              label={t("password")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("password").toLowerCase() }),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoggingIn}>
                {t("login")}
              </Button>
            </Form.Item>

            <p>
              {t('noAccount')} <Link to="/register">{t('register')}</Link>
            </p>
          </Form>
        </div>

        <div className="col-md-6 order-md-1">
          <h1 className="d-none d-md-block">{t('login')}</h1>
          <p>{t('loginDescription')}</p>
          <img src={LoginImage} alt="Login" className="mw-100" />
        </div>
      </div>
    </>
  );
};

export default Login;
