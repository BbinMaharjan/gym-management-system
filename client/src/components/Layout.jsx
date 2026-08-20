import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Drawer, theme } from 'antd';
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
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
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
  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/members',
      icon: <TeamOutlined />,
      label: 'Members',
    },
    {
      key: '/payments',
      icon: <MoneyCollectOutlined />,
      label: 'Payments',
    },
    {
      key: '/attendance',
      icon: <CheckCircleOutlined />,
      label: 'Attendance',
    },
    {
      key: '/plans',
      icon: <CreditCardOutlined />,
      label: 'Plans',
    },
    {
      key: '/equipment',
      icon: <ToolOutlined />,
      label: 'Equipment',
    },
    ...(user?.role === 'superadmin'
      ? [
          {
            key: '/users',
            icon: <UserOutlined />,
            label: 'Users',
          },
        ]
      : []),
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const sideMenu = (
    <>
      <div className="flex items-center justify-center h-16 text-white text-lg font-bold">
        {collapsed && !isMobile ? 'GM' : 'Gym Manager'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </>
  );

  return (
    <Layout className="h-screen overflow-hidden">
      {isMobile ? (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={240}
          styles={{ body: { padding: 0, background: '#001529' }, header: { display: 'none' } }}
        >
          {sideMenu}
        </Drawer>
      ) : (
        <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
          {sideMenu}
        </Sider>
      )}
      <Layout className="flex flex-col">
        <Header className="flex items-center justify-between px-4 shrink-0" style={{ background: colorBgContainer }}>
          <Button
            type="text"
            icon={isMobile ? <MenuUnfoldOutlined /> : collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => (isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed))}
          />
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="text-sm truncate hidden sm:inline">
              {user?.name} ({user?.role})
            </span>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} size={isMobile ? 'small' : 'middle'}>
              {!isMobile && 'Logout'}
            </Button>
          </div>
        </Header>
        <Content
          className={`m-2 sm:m-6 p-4 sm:p-6 flex-1`}
          style={{ background: colorBgContainer, borderRadius: borderRadiusLG, minHeight: 280, overflow: 'auto' }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
