import { useSelector } from "react-redux";
import { Outlet, Link } from "react-router-dom";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";
import Header from "./Header";

const Layout = () => {
  const { t } = useTranslation();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  return (
    <>
      <Header />

      <div className="container-fluid">
        {isAuthenticated ? (
          <Outlet />
        ) : (
          <Result
            status="403"
            title="403"
            subTitle={t("accessDenied")}
            extra={
              <Link to="/login">
                <Button type="primary">{t("login")}</Button>
              </Link>
            }
          />
        )}
      </div>
    </>
  );
};

export default Layout;
