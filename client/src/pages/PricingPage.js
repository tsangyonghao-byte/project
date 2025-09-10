import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const PricingPage = () => {
  return (
    <div className="pricing-page">
      <Card>
        <Title level={2}>会员服务</Title>
        <p>这里将显示会员定价和支付功能。</p>
        <p>功能正在开发中，敬请期待...</p>
      </Card>
    </div>
  );
};

export default PricingPage;