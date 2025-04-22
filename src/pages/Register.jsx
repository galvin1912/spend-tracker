import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Button, Form, Input, Select } from "antd";
import { register } from "../features/user/userActions";
import { useTranslation } from "react-i18next";
import LoginImage from "../assets/account-login-protection-8876027-7271014.png";

const Register = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // get state from redux store
  const isRegistering = useSelector((state) => state.user.isRegistering);

  // handle form submit
  const onFinish = (values) => {
    dispatch(register(values));
  };

  return (
    <>
      <Helmet
        title={`${t('registerTitle')} | GST`}
        meta={[
          {
            name: "description",
            content: t("registerDescription"),
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
              label={t("fullName")}
              name="fullName"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("fullName").toLowerCase() }),
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

            <Form.Item
              label={t("password")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("password").toLowerCase() }),
                },
                {
                  pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
                  message: t("passwordStrength"),
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label={t("confirmPassword")}
              name="passwordConfirm"
              rules={[
                {
                  required: true,
                  message: t("required", { field: t("confirmPassword").toLowerCase() }),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error(t("passwordsDontMatch")));
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isRegistering}>
                {t("register")}
              </Button>
            </Form.Item>

            <p>
              {t('haveAccount')} <Link to="/login">{t('login')}</Link>
            </p>
          </Form>
        </div>

        <div className="col-md-6 order-md-1">
          <h1 className="d-none d-md-block">{t('register')}</h1>
          <p>{t('registerDescription')}</p>
          <img src={LoginImage} alt="Login" className="mw-100" />
        </div>
      </div>
    </>
  );
};

export default Register;
