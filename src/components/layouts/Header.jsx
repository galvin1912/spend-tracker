import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Dropdown, Avatar, Switch, Space } from "antd";
import { Gsc } from "@styled-icons/crypto";
import { UserCircle } from "@styled-icons/boxicons-regular";
import { Translate } from "styled-icons/material";
import { PeopleMoney } from "@styled-icons/fluentui-system-filled";
import { UserGroup } from "@styled-icons/fa-solid";
import { Login } from "@styled-icons/material-sharp";
import { logout } from "../../features/user/userActions";
import { setLanguage } from "../../features/language/languageActions";
import { useTranslation } from "react-i18next";

const Header = () => {
  // create navigate function
  const navigate = useNavigate();

  // create dispatch function
  const dispatch = useDispatch();

  // Initialize translation hook
  const { t } = useTranslation();

  // get state from redux store
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);
  const currentLanguage = useSelector((state) => state.language.currentLanguage);

  // Handle language change
  const handleLanguageChange = (checked) => {
    const newLang = checked ? "en" : "vi";
    dispatch(setLanguage(newLang));
  };

  // memorize menu items
  const menu = useMemo(
    () => [
      {
        label: t('trackers'),
        key: "finance",
        icon: <PeopleMoney size="24" className="me-2" />,
        url: "/tracker",
      },
      {
        label: t('groups'),
        key: "group",
        icon: <UserGroup size="24" className="me-2" />,
        url: "/group",
      },
    ],
    [t]
  );

  // memorize account menu items
  const accountMenu = useMemo(
    () => [
      {
        label: `${t('hello')}, ${user?.fullName}`,
        key: "account",
        className: "font-medium",
      },
      {
        label: t('settings'),
        key: "setting",
        onClick: () => navigate("/user/settings"),
      },
      {
        label: t('help'),
        key: "help",
        disabled: true,
      },
      {
        type: "divider",
      },
      {
        label: t('logout'),
        key: "logout",
        danger: true,
        onClick: () => dispatch(logout()).then(() => navigate("/login")),
      },
    ],
    [dispatch, navigate, user?.fullName, t]
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

              {/* Language Switcher */}
              <li className="mx-2">
                <div className="d-inline-flex align-items-center nav-link text-white">
                  <Translate size="24" className="me-2" />
                  <Space>
                    <span>VI</span>
                    <Switch 
                      size="small"
                      checked={currentLanguage === 'en'} 
                      onChange={handleLanguageChange}
                    />
                    <span>EN</span>
                  </Space>
                </div>
              </li>

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
                      {t('account')}
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
                    {t('login')}
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
