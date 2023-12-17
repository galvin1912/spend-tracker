import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { Dropdown } from "antd";
import { Gsc } from "@styled-icons/crypto";
import { UserCircle } from "@styled-icons/boxicons-regular";
import { PeopleMoney } from "@styled-icons/fluentui-system-filled";
import { MoneyDollarBox } from "@styled-icons/remix-fill";
import { UserGroup } from "@styled-icons/fa-solid";
import { Login } from "@styled-icons/material-sharp";
import { logout } from "../../features/user/userActions";

const Header = () => {
  const dispatch = useDispatch();

  // get state from redux store
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);

  // memorize menu items
  const menu = useMemo(
    () => [
      {
        label: "Tài chính",
        key: "finance",
        icon: <PeopleMoney size="24" className="me-2" />,
        url: "/spend-tracker",
      },
      {
        label: "Doanh thu",
        key: "revenue",
        icon: <MoneyDollarBox size="24" className="me-2" />,
        url: "/revenue-tracker",
      },
      {
        label: "Nhóm",
        key: "group",
        icon: <UserGroup size="24" className="me-2" />,
        url: "/group",
      },
    ],
    []
  );

  // memorize account menu items
  const accountMenu = useMemo(
    () => [
      {
        label: `Xin chào, ${user?.fullName}`,
        key: "account",
      },
      {
        label: "Cài đặt",
        key: "setting",
        disabled: true,
      },
      {
        label: "Trợ giúp",
        key: "help",
        disabled: true,
      },
      {
        type: "divider",
      },
      {
        label: "Đăng xuất",
        key: "logout",
        onClick: () => dispatch(logout()),
      },
    ],
    [dispatch, user?.fullName]
  );

  return (
    <header>
      <div
        className="py-3 mb-3 border-bottom"
        style={{ background: "linear-gradient(to right, #f64c32, #5c0a98)" }}
      >
        <div className="container-fluid">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <Link
              to="/"
              className="d-flex align-items-center my-2 my-lg-0 me-lg-auto text-white text-decoration-none"
            >
              <Gsc size="32" />
              <span className="fs-4 fw-bold ms-2">GST</span>
            </Link>

            <ul className="nav col-12 col-lg-auto my-2 justify-content-center my-md-0">
              {menu.map((item) => (
                <li key={item.key}>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      `d-inline-flex align-items-center nav-link ${
                        isActive ? "bg-white rounded text-dark" : "text-white"
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </li>
              ))}

              {isAuthenticated ? (
                <li>
                  <Dropdown menu={{ items: accountMenu }} trigger={["click"]}>
                    <span
                      style={{ cursor: "pointer" }}
                      className="d-inline-flex align-items-center nav-link text-white"
                    >
                      <UserCircle size="24" className="me-2" />
                      Tài khoản
                    </span>
                  </Dropdown>
                </li>
              ) : (
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `d-inline-flex align-items-center nav-link ${
                        isActive ? "bg-white rounded text-dark" : "text-white"
                      }`
                    }
                  >
                    <Login size="24" className="me-2" />
                    Đăng nhập
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
