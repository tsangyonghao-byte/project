# 智师工具箱 (Teacher's Power Station)

一个为教师群体打造的一站式数字化资源与工具平台，提供高质量的教学资源和智能化工作流解决方案。

## 🚀 项目概述

### 核心功能
- **资源中心**: 海量优质教学资源，支持多维度筛选和搜索
- **会员系统**: 终身会员和月度会员，支持在线支付和激活码兑换
- **用户中心**: 个人信息管理、订单查询、资源收藏
- **管理后台**: 完整的后台管理系统，支持资源管理、用户管理、订单管理、激活码管理
- **激活码系统**: 支持批量生成和管理激活码，用于渠道合作和市场活动

### 技术栈
- **后端**: Node.js + Express + MongoDB
- **前端**: React + Ant Design
- **数据库**: MongoDB
- **认证**: JWT + Cookie
- **文件上传**: Multer
- **API**: RESTful API

## 📦 项目结构

```
Teacher_Power_Station/
├── server/                    # 后端服务
│   ├── config/               # 配置文件
│   ├── controllers/          # 控制器
│   ├── middleware/           # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由
│   ├── utils/               # 工具函数
│   └── app.js               # 主应用文件
├── client/                   # 前端应用
│   ├── public/              # 静态资源
│   └── src/
│       ├── components/      # 组件
│       ├── contexts/        # React Context
│       ├── pages/           # 页面组件
│       ├── services/        # API服务
│       └── utils/           # 工具函数
├── uploads/                  # 文件上传目录
│   ├── resources/          # 资源文件
│   └── avatars/            # 头像文件
└── docs/                    # 文档目录
```

## 🛠️ 安装和运行

### 环境要求
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

### 1. 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
cd ..
```

### 2. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

### 3. 启动服务
```bash
# 启动后端服务
npm run dev

# 启动前端服务（新终端）
cd client
npm start
```

### 4. 访问应用
- 前端应用: http://localhost:3000
- 后端API: http://localhost:3000/api
- 管理后台: http://localhost:3000/admin

## 📋 功能模块

### 用户端功能
1. **首页**: 展示平台核心价值、精选资源、用户评价
2. **资源中心**: 资源浏览、搜索、筛选、详情查看
3. **用户认证**: 注册、登录、微信扫码登录
4. **会员服务**: 定价展示、在线支付、激活码兑换
5. **个人中心**: 个人信息管理、订单查询、资源收藏

### 管理后台功能
1. **数据看板**: 用户、资源、订单、收入统计
2. **资源管理**: 资源上传、编辑、删除、分类管理
3. **用户管理**: 用户列表、状态管理、会员管理
4. **订单管理**: 订单查看、状态管理
5. **激活码管理**: 生成、导出、管理激活码
6. **系统设置**: 网站配置、支付配置

## 🔧 核心特性

### 认证系统
- JWT Token认证
- Cookie存储和自动续期
- 角色权限控制（用户/管理员）
- 微信扫码登录（预留接口）

### 文件上传
- 支持多种文件格式（PDF、Word、Excel、PPT、图片等）
- 文件大小限制和类型验证
- 自动生成缩略图和预览图
- 防盗链保护

### 激活码系统
- 批量生成激活码
- 支持终身会员和月度会员
- 激活码状态管理（未使用/已使用/已过期）
- CSV/Excel导出功能

### 搜索和筛选
- 全文搜索
- 多维度筛选（学段、学科、主题）
- 标签系统
- 排序功能（最新、最热、最多下载）

## 📊 数据模型

### 用户模型 (User)
- 基本信息：用户名、邮箱、手机、头像
- 会员信息：会员类型、到期时间
- 权限信息：角色、状态
- 关联数据：收藏、订单、激活码记录

### 资源模型 (Resource)
- 基本信息：标题、描述、文件信息
- 分类信息：学段、学科、主题、标签
- 统计信息：下载量、浏览量、收藏量
- 状态信息：发布状态、公开状态

### 订单模型 (Order)
- 订单信息：订单号、金额、支付方式
- 会员信息：会员类型、到期时间
- 状态信息：支付状态、订单状态

### 激活码模型 (ActivationCode)
- 激活码信息：编码、会员类型、有效期
- 状态信息：使用状态、使用者、使用时间
- 管理信息：批次、描述、创建者

## 🔒 安全特性

- JWT Token认证
- 密码加密存储
- 文件上传安全验证
- API访问限制
- 输入数据验证和过滤
- CORS跨域配置
- Helmet安全头设置

## 📱 响应式设计

- 移动端适配
- 平板端适配
- 桌面端优化
- 触摸友好的交互

## 🚀 部署指南

### 生产环境部署
1. **构建前端应用**
```bash
cd client
npm run build
```

2. **环境变量配置**
```bash
# 设置生产环境变量
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

3. **启动服务**
```bash
npm start
```

### Docker部署
```dockerfile
# Dockerfile示例
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN cd client && npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者：小七老师
- 邮箱：admin@teacherpower.com
- 项目地址：https://github.com/yourusername/teacher-power-station

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**智师工具箱** - 让教学更智能，让工作更高效！