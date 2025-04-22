import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Dropdown, Avatar } from "antd";
import { Gsc } from "@styled-icons/crypto";
import { UserCircle } from "@styled-icons/boxicons-regular";
import { PeopleMoney } from "@styled-icons/fluentui-system-filled";
import { UserGroup } from "@styled-icons/fa-solid";
import { Login } from "@styled-icons/material-sharp";
import { logout } from "../../features/user/userActions";

const Header = () => {
  // create navigate function
  const navigate = useNavigate();

  // create dispatch function
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
        url: "/tracker",
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
        className: "font-medium",
      },
      {
        label: "Cài đặt tài khoản",
        key: "setting",
        onClick: () => navigate("/user/settings"),
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
        danger: true,
        onClick: () => dispatch(logout()).then(() => navigate("/login")),
      },
    ],
    [dispatch, navigate, user?.fullName]
  );

  return (
    <header className="sticky top-0 z-10 w-full">
      <div 
        className="py-3 mb-4 border-b shadow-sm" 
        style={{ 
          background: "var(--header-bg)",
          borderRadius: "0 0 20px 20px",
        }}
      >
        <div className="container-fluid">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <Link to="/" className="d-flex align-items-center my-2 my-lg-0 me-lg-auto text-white text-decoration-none">
              <Gsc size="32" />
              <span className="fs-4 fw-bold ms-2">GST</span>
            </Link>

            <ul className="nav col-12 col-lg-auto my-2 justify-content-center my-md-0">
              {menu.map((item) => (
                <li key={item.key}>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      `d-inline-flex align-items-center nav-link ${isActive ? "active-nav bg-white rounded-xl text-primary font-medium shadow-sm" : "text-white"}`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </li>
              ))}

              {isAuthenticated ? (
                <li>
                  <Dropdown 
                    menu={{ 
                      items: accountMenu,
                      className: 'rounded-xl shadow-lg'
                    }} 
                    trigger={["click"]}
                    placement="bottomRight"
                    arrow
                  >
                    <div style={{ cursor: "pointer" }} className="d-inline-flex align-items-center nav-link text-white">
                      {user?.avatarUrl ? (
                        <Avatar src={user.avatarUrl} className="me-2" />
                      ) : (
                        <UserCircle size="24" className="me-2" />
                      )}
                      Tài khoản
                    </div>
                  </Dropdown>
                </li>
              ) : (
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `d-inline-flex align-items-center nav-link ${isActive ? "bg-white rounded-xl text-primary font-medium shadow-sm" : "text-white"}`
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
