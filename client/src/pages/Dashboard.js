import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Card>
        <Title level={2}>个人中心</Title>
        <p>这里将显示用户的个人信息、订单、收藏等功能。</p>
        <p>功能正在开发中，敬请期待...</p>
      </Card>
    </div>
  );
};

export default Dashboard;