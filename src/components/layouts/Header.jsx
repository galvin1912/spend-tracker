import { useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Dropdown, Avatar, Drawer } from "antd";
import { UserCircle } from "@styled-icons/boxicons-regular";
import { Wallet } from "@styled-icons/boxicons-solid";
import logo from "../../assets/logo.png";
import { PeopleMoney } from "@styled-icons/fluentui-system-filled";
import { UserGroup, Bars } from "@styled-icons/fa-solid";
import { Close, Settings } from "@styled-icons/material";
import { Login } from "@styled-icons/material-sharp";
import { logout } from "../../features/user/userActions";
import useMediaQuery from "../../hooks/useMediaQuery";

const Header = () => {
  // create navigate function
  const navigate = useNavigate();

  // create dispatch function
  const dispatch = useDispatch();

  // get state from redux store
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const user = useSelector((state) => state.user.user);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Detect mobile screen
  const isMobile = useMediaQuery("(max-width: 767px)");

  // memorize menu items
  const menu = useMemo(
    () => [
      {
        label: 'Quản lý chi tiêu',
        key: "finance",
        icon: <PeopleMoney size="24" />,
        url: "/tracker",
      },
      {
        label: 'Ví',
        key: "wallet",
        icon: <Wallet size="24" />,
        url: "/wallet",
      },
      {
        label: 'Nhóm',
        key: "group",
        icon: <UserGroup size="24" />,
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
        label: 'Cài đặt',
        key: "setting",
        onClick: () => navigate("/user/settings"),
      },
      {
        label: 'Trợ giúp',
        key: "help",
        disabled: true,
      },
      {
        type: "divider",
      },
      {
        label: 'Đăng xuất',
        key: "logout",
        danger: true,
        onClick: () => dispatch(logout()).then(() => navigate("/login")),
      },
    ],
    [dispatch, navigate, user?.fullName]
  );

  // Close mobile menu when route changes
  const handleNavClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Navigation items component (reusable for desktop and mobile)
  // eslint-disable-next-line react/prop-types
  const NavItems = ({ onItemClick, isMobile: isMobileNav }) => (
    <>
      {menu.map((item) => (
        <NavLink
          key={item.key}
          to={item.url}
          onClick={onItemClick}
          className={({ isActive }) =>
            `nav-link ${isActive ? "active-nav" : ""} ${isMobileNav ? "mobile-nav-link" : "desktop-nav-link"}`
          }
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}

      {isAuthenticated ? (
        isMobileNav ? (
          // Mobile: Show account menu items directly as links
          <>
            <div className="mobile-nav-link mobile-nav-divider">
              {user?.avatarUrl ? (
                <Avatar src={user.avatarUrl} size="small" />
              ) : (
                <UserCircle size="24" />
              )}
              <span className="mobile-nav-user-name">{user?.fullName || 'Người dùng'}</span>
            </div>
            <NavLink
              to="/user/settings"
              onClick={onItemClick}
              className={({ isActive }) =>
                `nav-link mobile-nav-link ${isActive ? "active-nav" : ""}`
              }
            >
              <Settings size="24" />
              <span>Cài đặt</span>
            </NavLink>
            <div
              className="nav-link mobile-nav-link mobile-nav-logout"
              onClick={() => {
                dispatch(logout()).then(() => {
                  navigate("/login");
                  onItemClick();
                });
              }}
            >
              <span>Đăng xuất</span>
            </div>
          </>
        ) : (
          // Desktop: Use dropdown
          <Dropdown 
            menu={{ 
              items: accountMenu,
              className: 'rounded-xl shadow-lg'
            }} 
            trigger={["click"]}
            placement="bottomRight"
            arrow
          >
            <div 
              style={{ cursor: "pointer" }} 
              className="nav-link desktop-nav-link"
            >
              {user?.avatarUrl ? (
                <Avatar src={user.avatarUrl} size="small" />
              ) : (
                <UserCircle size="24" />
              )}
              <span>Tài khoản</span>
            </div>
          </Dropdown>
        )
      ) : (
        <NavLink
          to="/login"
          onClick={onItemClick}
          className={({ isActive }) =>
            `nav-link ${isActive ? "active-nav" : ""} ${isMobileNav ? "mobile-nav-link" : "desktop-nav-link"}`
          }
        >
          <Login size="24" />
          <span>Đăng nhập</span>
        </NavLink>
      )}
    </>
  );

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <Link to="/" className="header-logo" onClick={handleNavClick}>
              <img src={logo} alt="GST Logo" className="header-logo-img" />
              <span className="header-logo-text">GST</span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="header-nav-desktop">
                <NavItems />
              </nav>
            )}

            {/* Mobile Hamburger Button */}
            {isMobile && (
              <button
                className="header-menu-button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Bars size="24" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobile && (
        <Drawer
          title={
            <div className="drawer-header">
              <Link to="/" className="drawer-logo" onClick={handleNavClick}>
                <img src={logo} alt="GST Logo" className="drawer-logo-img" />
                <span className="drawer-logo-text">GST</span>
              </Link>
            </div>
          }
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          closeIcon={<Close size="24" />}
          className="mobile-menu-drawer"
        >
          <nav className="header-nav-mobile">
            <NavItems onItemClick={handleNavClick} isMobile={true} />
          </nav>
        </Drawer>
      )}
    </>
  );
};

export default Header;
