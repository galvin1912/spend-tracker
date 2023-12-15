import { useSelector } from "react-redux";
import { Outlet, Link } from "react-router-dom";
import { Result, Button } from "antd";
import Header from "./Header";

const Layout = () => {
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
            subTitle="Xin lỗi, bạn cần đăng nhập để truy cập nội dung này."
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
