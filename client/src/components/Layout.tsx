import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Button, Drawer, Avatar, Tooltip, theme } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  ToolOutlined,
  UserOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoneyCollectOutlined,
  CheckCircleOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useAuth } from "../hooks/useAuth";

const { Header, Sider, Content } = Layout;

const NAV_ITEMS = [
  { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "/members", icon: <TeamOutlined />, label: "Members" },
  { key: "/payments", icon: <MoneyCollectOutlined />, label: "Payments" },
  { key: "/attendance", icon: <CheckCircleOutlined />, label: "Attendance" },
  { key: "/plans", icon: <CreditCardOutlined />, label: "Plans" },
  { key: "/equipment", icon: <ToolOutlined />, label: "Equipment" },
];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const menuItems = [
    ...NAV_ITEMS,
    ...(user?.role === "superadmin"
      ? [{ key: "/users", icon: <UserOutlined />, label: "Users" }]
      : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const siderWidth = collapsed ? 80 : 260;

  const sideMenu = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Brand */}
      <div
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 24px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "default",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, rgb(7, 95, 172) 0%, #00f2fe 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(7,95,172,0.4)",
              flexShrink: 0,
            }}
          >
            <FireOutlined style={{ fontSize: 20, color: "#fff" }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                  letterSpacing: -0.3,
                }}
              >
                Gym Manager
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
              >
                Management System
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav Section Label */}
      {!collapsed && (
        <div
          style={{
            padding: "20px 24px 8px",
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}
        >
          Navigation
        </div>
      )}

      {/* Menu Items */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: collapsed ? "8px 0" : "0 12px",
        }}
      >
        {menuItems.map((item) => {
          const isActive = location.pathname === item.key;
          return (
            <Tooltip
              key={item.key}
              title={collapsed ? item.label : ""}
              placement="right"
            >
              <div
                onClick={() => navigate(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: collapsed ? "10px 0" : "10px 12px",
                  margin: "2px 0",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(7,95,172,0.25) 0%, rgba(0,242,254,0.25) 100%)"
                    : "transparent",
                  borderLeft: isActive
                    ? "3px solid rgb(7, 95, 172)"
                    : "3px solid transparent",
                  justifyContent: collapsed ? "center" : "flex-start",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span
                  style={{
                    fontSize: 18,
                    color: isActive
                      ? "rgb(7, 95, 172)"
                      : "rgba(255,255,255,0.65)",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s",
                  }}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span
                    style={{
                      color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      whiteSpace: "nowrap",
                      transition: "color 0.2s",
                    }}
                  >
                    {item.label}
                  </span>
                )}
                {isActive && !collapsed && (
                  <div
                    style={{
                      position: "absolute",
                      right: 12,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "rgb(7, 95, 172)",
                      boxShadow: "0 0 8px rgba(7,95,172,0.6)",
                    }}
                  />
                )}
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* User Profile + Logout */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: collapsed ? "16px 0" : "12px 16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px",
            borderRadius: 10,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <Avatar
            size={36}
            style={{
              background:
                "linear-gradient(135deg, rgb(7, 95, 172) 0%, #00f2fe 100%)",
              flexShrink: 0,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  textTransform: "capitalize",
                }}
              >
                {user?.role}
              </div>
            </div>
          )}
          {!collapsed && (
            <Tooltip title="Logout" placement="top">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  color: "rgba(255,255,255,0.45)",
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ff4d4f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                }}
              />
            </Tooltip>
          )}
        </div>
        {collapsed && (
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 4 }}
          >
            <Tooltip title="Logout" placement="right">
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  color: "rgba(255,255,255,0.45)",
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ff4d4f";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Layout className="h-screen overflow-hidden">
      {isMobile ? (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{
            body: { padding: 0, background: "#0a0e27" },
            header: { display: "none" },
          }}
        >
          {sideMenu}
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
          collapsedWidth={80}
          style={{
            background: "#0a0e27",
            borderRight: "1px solid rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}
        >
          {sideMenu}
        </Sider>
      )}
      <Layout className="flex flex-col" style={{ background: "#f5f5f5" }}>
        <Header
          className="flex items-center justify-between px-4 sm:px-6 shrink-0"
          style={{
            background: colorBgContainer,
            borderBottom: "1px solid #f0f0f0",
            height: 64,
            lineHeight: "64px",
          }}
        >
          <div className="flex items-center gap-3">
            <Button
              type="text"
              icon={
                isMobile ? (
                  <MenuUnfoldOutlined />
                ) : collapsed ? (
                  <MenuUnfoldOutlined />
                ) : (
                  <MenuFoldOutlined />
                )
              }
              onClick={() =>
                isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)
              }
              style={{ fontSize: 18 }}
            />
            {!isMobile && !collapsed && (
              <div style={{ color: "#999", fontSize: 13 }}>
                {NAV_ITEMS.find((n) => n.key === location.pathname)?.label ??
                  ""}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span
              className="text-sm truncate hidden sm:inline"
              style={{ color: "#666" }}
            >
              {user?.name}
            </span>
            <Avatar
              size={32}
              style={{
                background:
                  "linear-gradient(135deg, rgb(7, 95, 172) 0%,rgb(5, 75, 78) 100%)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </div>
        </Header>
        <Content
          className="m-2 sm:m-4 p-4 sm:p-6 flex-1"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
