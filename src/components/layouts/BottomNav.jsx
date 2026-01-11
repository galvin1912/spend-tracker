import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { PeopleMoney } from "@styled-icons/fluentui-system-filled";
import { Wallet, Note } from "@styled-icons/boxicons-solid";
import { UserGroup } from "@styled-icons/fa-solid";
import { Settings } from "@styled-icons/material";
import useMediaQuery from "../../hooks/useMediaQuery";

const BottomNav = () => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Don't show bottom nav on auth pages or if not mobile
  if (!isMobile || !isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      label: "Chi tiêu",
      key: "tracker",
      icon: PeopleMoney,
      url: "/tracker",
      end: false, // Match all /tracker/* routes
    },
    {
      label: "Ví",
      key: "wallet",
      icon: Wallet,
      url: "/wallet",
      end: false, // Match all /wallet/* routes
    },
    {
      label: "Nhóm",
      key: "group",
      icon: UserGroup,
      url: "/group",
      end: false, // Match all /group/* routes
    },
    {
      label: "Ghi chú",
      key: "notes",
      icon: Note,
      url: "/notes",
      end: false, // Match all /notes/* routes
    },
    {
      label: "Cài đặt",
      key: "settings",
      icon: Settings,
      url: "/user/settings",
      end: true, // Only match exact /user/settings
    },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.key}
            to={item.url}
            end={item.end}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "bottom-nav-item-active" : ""}`
            }
          >
            <Icon size="20" />
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
