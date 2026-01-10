import { useSelector } from "react-redux";
import { Outlet, Link } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import Header from "./Header";

const Layout = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const isCheckingAuth = useSelector((state) => state.user.isCheckingAuth);

  return (
    <>
      <Header />

      <div className="container-fluid">
        {isCheckingAuth ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            <Spin size="large" />
          </div>
        ) : isAuthenticated ? (
          <Outlet />
        ) : (
          <Result
            status="403"
            title="403"
            subTitle="Truy cập bị từ chối"
            extra={
              <Link to="/login">
                <Button type="primary">Đăng nhập</Button>
              </Link>
            }
          />
        )}
      </div>
    </>
  );
};

export default Layout;
