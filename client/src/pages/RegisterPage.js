import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  message,
  Progress
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

const { Title, Text, Link } = Typography;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const result = await register(values);
      if (result.success) {
        message.success('注册成功！');
        navigate('/dashboard');
      }
    } catch (error) {
      message.error('注册失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  const passwordValidator = (_, value) => {
    if (!value) {
      return Promise.reject('请输入密码');
    }
    if (value.length < 6) {
      return Promise.reject('密码长度不能少于6位');
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return Promise.reject('密码必须包含大小写字母和数字');
    }
    return Promise.resolve();
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    if (/[^a-zA-Z\d]/.test(password)) strength += 25;
    return Math.min(strength, 100);
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
              创建账户
            </Title>
            <Text className="auth-subtitle">
              加入智师工具箱，开启高效教学之旅
            </Text>
          </div>

          <Card className="auth-card">
            <Form
              form={form}
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名长度不能少于3位' },
                  { max: 50, message: '用户名长度不能超过50位' },
                  { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

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
                name="phone"
                label="手机号码"
                rules={[
                  { required: true, message: '请输入手机号码' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="请输入手机号码"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { validator: passwordValidator }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  onChange={(e) => {
                    const strength = getPasswordStrength(e.target.value);
                    form.setFieldsValue({ passwordStrength: strength });
                  }}
                />
              </Form.Item>

              <Form.Item noStyle>
                {form.getFieldValue('password') && (
                  <div className="password-strength">
                    <Text type="secondary">密码强度：</Text>
                    <Progress
                      percent={getPasswordStrength(form.getFieldValue('password'))}
                      size="small"
                      strokeColor={{
                        '0%': '#ff4d4f',
                        '50%': '#faad14',
                        '100%': '#52c41a'
                      }}
                      showInfo={false}
                    />
                    <Text type="secondary" className="strength-text">
                      {getPasswordStrength(form.getFieldValue('password')) < 40 ? '弱' :
                       getPasswordStrength(form.getFieldValue('password')) < 70 ? '中' : '强'}
                    </Text>
                  </div>
                )}
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请确认密码"
                />
              </Form.Item>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意服务条款')),
                  },
                ]}
              >
                <Checkbox>
                  我已阅读并同意{' '}
                  <Link href="#" target="_blank">
                    服务条款
                  </Link>{' '}
                  和{' '}
                  <Link href="#" target="_blank">
                    隐私政策
                  </Link>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                >
                  立即注册
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-footer">
              <Text type="secondary">
                已有账户？{' '}
                <Link href="/login" className="auth-link">
                  立即登录
                </Link>
              </Text>
            </div>
          </Card>

          <div className="auth-benefits">
            <Title level={4} className="benefits-title">
              注册即可享受
            </Title>
            <Space direction="vertical" size="middle" className="benefits-list">
              <div className="benefit-item">
                <CheckCircleOutlined className="benefit-icon" />
                <Text>免费浏览所有资源</Text>
              </div>
              <div className="benefit-item">
                <CheckCircleOutlined className="benefit-icon" />
                <Text>个性化资源推荐</Text>
              </div>
              <div className="benefit-item">
                <CheckCircleOutlined className="benefit-icon" />
                <Text>收藏喜欢的资源</Text>
              </div>
              <div className="benefit-item">
                <CheckCircleOutlined className="benefit-icon" />
                <Text>专属客服支持</Text>
              </div>
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;