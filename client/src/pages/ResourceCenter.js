import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const ResourceCenter = () => {
  return (
    <div className="resource-center">
      <Card>
        <Title level={2}>资源中心</Title>
        <p>这里将显示资源列表，包含搜索、筛选和分类功能。</p>
        <p>功能正在开发中，敬请期待...</p>
      </Card>
    </div>
  );
};

export default ResourceCenter;