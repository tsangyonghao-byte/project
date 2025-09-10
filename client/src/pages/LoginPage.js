import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Typography, 
  Space, 
  Divider,
  message,
  Tabs
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  WechatOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

const { Title, Text, Link } = Typography;
const { TabPane } = Tabs;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const result = await login(values);
      if (result.success) {
        message.success('登录成功！');
        navigate(from, { replace: true });
      }
    } catch (error) {
      message.error('登录失败，请检查邮箱和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleWechatLogin = () => {
    message.info('微信登录功能开发中...');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <div className="auth-header">
            <div className="auth-logo">
              <UserOutlined className="logo-icon" />
              <span className="logo-text">智师工具箱</span>
            </div>
            <Title level={2} className="auth-title">
              欢迎回来
            </Title>
            <Text className="auth-subtitle">
              登录您的账户，继续您的教学之旅
            </Text>
          </div>

          <Card className="auth-card">
            <Tabs defaultActiveKey="email" centered>
              <TabPane tab="邮箱登录" key="email">
                <Form
                  form={form}
                  name="login"
                  onFinish={handleLogin}
                  layout="vertical"
                  size="large"
                >
                  <Form.Item
                    name="email"
                    label="邮箱地址"
                    rules={[
                      { required: true, message: '请输入邮箱地址' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="请输入邮箱地址"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    label="密码"
                    rules={[
                      { required: true, message: '请输入密码' },
                      { min: 6, message: '密码长度不能少于6位' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="请输入密码"
                    />
                  </Form.Item>

                  <Form.Item>
                    <div className="auth-options">
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>记住我</Checkbox>
                      </Form.Item>
                      <Link href="#" className="auth-link">
                        忘记密码？
                      </Link>
                    </div>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="手机登录" key="phone">
                <Form layout="vertical" size="large">
                  <Form.Item
                    label="手机号码"
                    rules={[
                      { required: true, message: '请输入手机号码' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="请输入手机号码"
                    />
                  </Form.Item>

                  <Form.Item
                    label="验证码"
                    rules={[
                      { required: true, message: '请输入验证码' },
                      { len: 6, message: '验证码长度为6位' }
                    ]}
                  >
                    <Input
                      prefix={<LockOutlined />}
                      placeholder="请输入验证码"
                      suffix={
                        <Button type="link" size="small">
                          获取验证码
                        </Button>
                      }
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      block
                      size="large"
                    >
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>

            <Divider>
              <Text type="secondary">其他登录方式</Text>
            </Divider>

            <div className="social-login">
              <Button
                icon={<WechatOutlined />}
                size="large"
                block
                onClick={handleWechatLogin}
              >
                微信登录
              </Button>
            </div>

            <div className="auth-footer">
              <Text type="secondary">
                还没有账户？{' '}
                <Link href="/register" className="auth-link">
                  立即注册
                </Link>
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;