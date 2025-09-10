import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const ResourceDetail = () => {
  return (
    <div className="resource-detail">
      <Card>
        <Title level={2}>资源详情</Title>
        <p>这里将显示资源的详细信息，包括预览、下载等功能。</p>
        <p>功能正在开发中，敬请期待...</p>
      </Card>
    </div>
  );
};

export default ResourceDetail;