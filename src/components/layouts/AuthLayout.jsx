import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { Spin } from "antd";
import Header from "./Header";

const AuthLayout = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const isCheckingAuth = useSelector((state) => state.user.isCheckingAuth);

  if (isCheckingAuth) {
    return (
      <>
        <Header />
        <div className="container-fluid">
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            <Spin size="large" />
          </div>
        </div>
      </>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Header />

      <div className="container-fluid">
        <Outlet />
      </div>
    </>
  );
};

export default AuthLayout;
