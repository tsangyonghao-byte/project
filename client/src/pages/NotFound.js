import React from 'react';
import { Card, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <Card className="not-found-card">
        <div className="not-found-content">
          <Title level={1}>404</Title>
          <Title level={3}>页面未找到</Title>
          <Paragraph>
            抱歉，您访问的页面不存在或已被移除。
          </Paragraph>
          <div className="not-found-actions">
            <Button type="primary" onClick={() => navigate('/')}>
              返回首页
            </Button>
            <Button onClick={() => navigate(-1)}>
              返回上一页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;