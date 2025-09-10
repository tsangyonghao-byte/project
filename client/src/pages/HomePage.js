import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Typography, 
  Space, 
  Statistic, 
  List, 
  Avatar,
  Carousel,
  Tag
} from 'antd';
import {
  BookOutlined,
  UserOutlined,
  DownloadOutlined,
  StarOutlined,
  CrownOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { resourceAPI } from '../services/api';
import './HomePage.css';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredResources, setFeaturedResources] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      const [resourcesResponse, statsResponse] = await Promise.all([
        resourceAPI.getFeaturedResources(6),
        resourceAPI.getResourceStats()
      ]);
      
      setFeaturedResources(resourcesResponse.data.data);
      setStats(statsResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch home page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <BookOutlined className="feature-icon" />,
      title: '海量优质资源',
      description: '精选教学课件、试题、活动方案等资源，质量保证，随时下载'
    },
    {
      icon: <UserOutlined className="feature-icon" />,
      title: '智能分类管理',
      description: '按学段、学科、主题多维度分类，快速找到所需资源'
    },
    {
      icon: <DownloadOutlined className="feature-icon" />,
      title: '一键下载使用',
      description: '会员专属下载权限，无广告、无限制，提升工作效率'
    }
  ];

  const testimonials = [
    {
      name: '张老师',
      subject: '小学语文',
      content: '智师工具箱的资源质量很高，节省了我很多备课时间，强烈推荐！',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      name: '李老师',
      subject: '初中数学',
      content: '分类清晰，搜索方便，找到了很多优质的教学资料，非常实用。',
      avatar: 'https://via.placeholder.com/40'
    },
    {
      name: '王老师',
      subject: '幼儿园',
      content: '作为新手教师，这里的资源帮助我快速成长，感谢智师工具箱！',
      avatar: 'https://via.placeholder.com/40'
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <Title level={1} className="hero-title">
              智师工具箱
            </Title>
            <Paragraph className="hero-subtitle">
              打造中国教师首选的一站式数字化工作台
            </Paragraph>
            <Paragraph className="hero-description">
              我们提供的不仅仅是资源，更是一套高效、智能、美观的工作流解决方案
            </Paragraph>
            <Space size="large" className="hero-actions">
              <Button 
                type="primary" 
                size="large" 
                icon={<BookOutlined />}
                onClick={() => navigate('/resources')}
              >
                浏览资源
              </Button>
              <Button 
                size="large" 
                icon={<CrownOutlined />}
                onClick={() => navigate('/pricing')}
              >
                开通会员
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="优质资源"
                value={stats.totalResources || 0}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="下载次数"
                value={stats.totalDownloads || 0}
                prefix={<DownloadOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="注册用户"
                value={5000}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="会员服务"
                value="终身"
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <Title level={2} className="section-title">核心优势</Title>
          <Paragraph className="section-subtitle">
            为教师量身打造的数字化解决方案
          </Paragraph>
        </div>
        
        <Row gutter={[32, 32]} justify="center">
          {features.map((feature, index) => (
            <Col xs={24} sm={24} md={8} key={index}>
              <Card className="feature-card" hoverable>
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <Title level={4} className="feature-title">{feature.title}</Title>
                <Paragraph className="feature-description">{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Featured Resources Section */}
      <div className="featured-section">
        <div className="section-header">
          <Title level={2} className="section-title">精选资源</Title>
          <Paragraph className="section-subtitle">
            最受欢迎的教学资源推荐
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {featuredResources.map((resource) => (
            <Col xs={24} sm={12} md={8} lg={6} key={resource._id}>
              <Card
                hoverable
                className="resource-card"
                onClick={() => navigate(`/resources/${resource._id}`)}
              >
                <div className="resource-image">
                  <Avatar
                    size={64}
                    icon={<BookOutlined />}
                    src={resource.thumbnailUrl}
                  />
                </div>
                <div className="resource-info">
                  <Text className="resource-title" ellipsis={{ tooltip: resource.title }}>
                    {resource.title}
                  </Text>
                  <div className="resource-meta">
                    <Space size="small">
                      <Tag color="blue">{resource.subject}</Tag>
                      <Tag color="green">{resource.gradeLevel}</Tag>
                    </Space>
                  </div>
                  <div className="resource-stats">
                    <Space size="large">
                      <Text type="secondary">
                        <DownloadOutlined /> {resource.downloadCount}
                      </Text>
                      <Text type="secondary">
                        <StarOutlined /> {resource.favoriteCount}
                      </Text>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="section-action">
          <Button 
            type="primary" 
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/resources')}
          >
            查看更多资源
          </Button>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <div className="section-header">
          <Title level={2} className="section-title">用户评价</Title>
          <Paragraph className="section-subtitle">
            听听老师们怎么说
          </Paragraph>
        </div>

        <Row gutter={[32, 32]} justify="center">
          {testimonials.map((testimonial, index) => (
            <Col xs={24} sm={24} md={8} key={index}>
              <Card className="testimonial-card">
                <div className="testimonial-content">
                  <Paragraph className="testimonial-text">
                    "{testimonial.content}"
                  </Paragraph>
                </div>
                <div className="testimonial-author">
                  <Avatar src={testimonial.avatar} size={40} />
                  <div className="author-info">
                    <Text strong>{testimonial.name}</Text>
                    <Text type="secondary">{testimonial.subject}</Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <Title level={2} className="cta-title">
            开启高效教学之旅
          </Title>
          <Paragraph className="cta-description">
            立即注册成为会员，解锁所有优质资源，让教学更轻松
          </Paragraph>
          <Space size="large" className="cta-actions">
            <Button 
              type="primary" 
              size="large"
              icon={<CrownOutlined />}
              onClick={() => navigate('/pricing')}
            >
              立即开通会员
            </Button>
            <Button 
              size="large"
              onClick={() => navigate('/resources')}
            >
              免费浏览资源
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default HomePage;