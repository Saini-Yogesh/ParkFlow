import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Users,
  ParkingCircle,
  DollarSign,
  Menu,
  LogOut,
  BarChart,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import ChangePasswordModal from "../../../components/ChangePasswordModal";
import "../../../assets/css/AdminLayout.css";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleSidebar = () => setMobileOpen(!mobileOpen);
  const closeSidebar = () => setMobileOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const allMenuItems = [
    {
      text: "Enterprise",
      icon: <BarChart size={20} />,
      path: "/admin/enterprise",
      roles: ["SUPER_ADMIN"],
    },
    {
      text: "Location Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
      roles: ["PARKING_ADMIN"],
    },
    { text: "Locations", icon: <MapPin size={20} />, path: "/admin/locations", roles: ["PARKING_ADMIN"] },
    { text: "Workers", icon: <Users size={20} />, path: "/admin/workers", roles: ["PARKING_ADMIN"] },
    { text: "Slots", icon: <ParkingCircle size={20} />, path: "/admin/slots", roles: ["PARKING_ADMIN"] },
    { text: "Pricing", icon: <DollarSign size={20} />, path: "/admin/pricing", roles: ["PARKING_ADMIN"] },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(user?.role));

  const currentTitle =
    menuItems.find((m) => location.pathname.startsWith(m.path))?.text ||
    "Admin Panel";

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? "open" : ""}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">ParkNova Admin</div>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.text}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => {
                  navigate(item.path);
                  closeSidebar();
                }}
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button className="menu-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h2 className="header-title">{currentTitle}</h2>
          </div>

          <div className="header-right" ref={menuRef}>
            <button
              className="avatar-btn"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </button>

            {menuOpen && (
              <div className="profile-menu">
                <button
                  className="menu-item"
                  onClick={() => {
                    setMenuOpen(false);
                    setPasswordModalOpen(true);
                  }}
                >
                  <KeyRound size={16} />
                  <span>Change Password</span>
                </button>
                <button className="menu-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};

export default AdminLayout;
