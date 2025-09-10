import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <Card>
        <Title level={2}>管理后台</Title>
        <p>这里将显示管理后台的各种功能模块。</p>
        <p>功能正在开发中，敬请期待...</p>
      </Card>
    </div>
  );
};

export default AdminPanel;