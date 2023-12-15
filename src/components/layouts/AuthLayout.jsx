import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import Header from "./Header";

const AuthLayout = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

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
