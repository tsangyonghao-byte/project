import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Layout as AntLayout, 
  Menu, 
  Avatar, 
  Dropdown, 
  Button, 
  Badge, 
  Space,
  Drawer,
  Typography
} from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  CrownOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  DashboardOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import './Layout.css';

const { Header, Content, Footer } = AntLayout;
const { Text } = Typography;

const Layout = ({ children }) => {
  const { user, logout, hasActiveMembership, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/resources',
      icon: <BookOutlined />,
      label: '资源中心',
    },
    {
      key: '/pricing',
      icon: <CrownOutlined />,
      label: '会员服务',
    },
  ];

  const userMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '个人中心',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/dashboard'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  const adminMenuItems = [
    {
      key: 'admin',
      icon: <BarChartOutlined />,
      label: '管理后台',
      onClick: () => navigate('/admin'),
    },
    {
      type: 'divider',
    },
    ...userMenuItems,
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    setMobileMenuVisible(false);
  };

  const selectedKeys = [location.pathname];

  return (
    <AntLayout className="layout">
      <Header className="header">
        <div className="header-content">
          <div className="logo">
            <BookOutlined className="logo-icon" />
            <span className="logo-text">智师工具箱</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys}
              items={menuItems}
              onClick={handleMenuClick}
              className="nav-menu"
            />
          </div>

          {/* User Actions */}
          <div className="user-actions">
            {user ? (
              <Space size="large">
                {hasActiveMembership() && (
                  <Badge count="VIP" color="gold">
                    <CrownOutlined className="membership-icon" />
                  </Badge>
                )}
                
                <Dropdown
                  menu={{
                    items: isAdmin() ? adminMenuItems : userMenuItems,
                  }}
                  placement="bottomRight"
                  arrow
                >
                  <div className="user-info">
                    <Avatar 
                      src={user.avatar} 
                      icon={<UserOutlined />}
                      size="small"
                    />
                    <Text className="username">{user.username}</Text>
                  </div>
                </Dropdown>
              </Space>
            ) : (
              <Space size="middle">
                <Button 
                  type="text" 
                  icon={<LoginOutlined />}
                  onClick={() => navigate('/login')}
                >
                  登录
                </Button>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/register')}
                >
                  注册
                </Button>
              </Space>
            )}

            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="mobile-menu-button"
              onClick={() => setMobileMenuVisible(true)}
            />
          </div>
        </div>
      </Header>

      <Content className="content">
        <div className="content-wrapper">
          {children || <Outlet />}
        </div>
      </Content>

      <Footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>智师工具箱</h4>
            <p>打造中国教师首选的一站式数字化工作台</p>
          </div>
          <div className="footer-section">
            <h4>快速链接</h4>
            <p><a href="/resources">资源中心</a></p>
            <p><a href="/pricing">会员服务</a></p>
            <p><a href="/dashboard">个人中心</a></p>
          </div>
          <div className="footer-section">
            <h4>关于我们</h4>
            <p><a href="/about">关于智师</a></p>
            <p><a href="/contact">联系我们</a></p>
            <p><a href="/terms">服务条款</a></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 智师工具箱. All rights reserved.</p>
        </div>
      </Footer>

      {/* Mobile Navigation Drawer */}
      <Drawer
        title="导航菜单"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="vertical"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Drawer>
    </AntLayout>
  );
};

export default Layout;