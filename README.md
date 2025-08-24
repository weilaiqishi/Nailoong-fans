# 奶龙表情包网站开发计划

## 项目概述

基于对 [Usagi.fan](https://www.usagi.fan/) 表情包网站的分析，我们计划开发一个类似的奶龙主题表情包网站。该网站将提供表情包浏览、搜索、上传、点赞和收藏等功能，并支持表情包分类和标签系统。

## 技术栈

- **前端框架**：Next.js
- **UI组件库**：Shadcn UI
- **数据库和存储**：Supabase
  - PostgreSQL 数据库
  - 图片存储
  - 身份验证

## 核心功能

### 1. 用户系统
- 用户注册和登录（使用 Supabase Auth）
- 用户上传的表情包管理

### 2. 表情包浏览
- 首页展示热门和最新表情包
- 分类浏览（按主题、风格等）
- 无限滚动加载更多表情包
- 响应式设计，适配移动端和桌面端

### 3. 表情包搜索
- 基于标签的搜索
- 基于文本描述的搜索
- 搜索结果过滤和排序

### 4. 表情包上传
- 支持图片上传（PNG、JPG、GIF格式）
- 支持输入图片链接
- 添加标签和描述
- 上传审核机制
- 上传进度显示

### 5. 表情包互动
- 点赞功能
- 分享功能（生成分享链接）

### 6. 表情包审核
- 管理员审核界面
- 审核流程（通过/拒绝）
- 审核通知

### 7. 标签系统
- 热门标签展示
- 标签云
- 标签关联推荐

## 数据库设计

### 表结构

#### 1. users 表
```sql
create table users (
  id uuid references auth.users primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### 2. stickers 表
```sql
create table stickers (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_url text not null,
  image_source text not null default 'upload', -- upload, link
  user_id uuid references users(id) not null,
  status text not null default 'pending', -- pending, approved, rejected
  likes_count integer default 0,
  downloads_count integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

#### 3. tags 表
```sql
create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamp with time zone default now()
);
```

#### 4. sticker_tags 表（多对多关系）
```sql
create table sticker_tags (
  sticker_id uuid references stickers(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (sticker_id, tag_id)
);
```

#### 5. likes 表
```sql
create table likes (
  user_id uuid references users(id) on delete cascade,
  sticker_id uuid references stickers(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, sticker_id)
);
```



## 前端页面规划

### 1. 公共页面
- **首页**：展示热门和最新表情包，分类导航
- **浏览页**：按分类浏览表情包，支持筛选和排序
- **搜索页**：搜索结果展示，支持筛选和排序
- **表情包详情页**：展示表情包详情，支持点赞、收藏、分享和下载
- **标签页**：展示特定标签下的所有表情包

### 2. 用户页面
- **登录/注册页**
- **个人资料页**
- **我的上传页**：管理已上传的表情包

- **上传表情包页**：上传新表情包

### 3. 管理员页面
- **审核页面**：审核待审核的表情包
- **用户管理页面**：管理用户
- **标签管理页面**：管理标签

## API 设计

### 1. 表情包相关
- `GET /api/stickers`：获取表情包列表，支持分页、筛选和排序
- `GET /api/stickers/:id`：获取表情包详情
- `POST /api/stickers/upload`：上传表情包图片
- `POST /api/stickers`：创建表情包（支持图片上传或链接）
- `PUT /api/stickers/:id`：更新表情包信息
- `DELETE /api/stickers/:id`：删除表情包

### 2. 用户相关
- `GET /api/users/:id`：获取用户信息
- `PUT /api/users/:id`：更新用户信息
- `GET /api/users/:id/stickers`：获取用户上传的表情包

### 3. 交互相关
- `POST /api/stickers/:id/like`：点赞表情包
- `DELETE /api/stickers/:id/like`：取消点赞
- `POST /api/stickers/:id/download`：下载表情包并增加下载计数

### 4. 标签相关
- `GET /api/tags`：获取所有标签
- `GET /api/tags/:id/stickers`：获取特定标签下的表情包

### 5. 审核相关
- `GET /api/admin/stickers/pending`：获取待审核的表情包
- `PUT /api/admin/stickers/:id/approve`：审核通过
- `PUT /api/admin/stickers/:id/reject`：审核拒绝

## 项目结构

```
/
├── app/                  # Next.js 应用目录
│   ├── api/              # API 路由
│   ├── (auth)/           # 认证相关页面
│   │   ├── login/        # 登录页面
│   │   └── register/     # 注册页面
│   ├── (main)/           # 主要页面
│   │   ├── page.tsx      # 首页
│   │   ├── browse/       # 浏览页面
│   │   ├── search/       # 搜索页面
│   │   ├── stickers/     # 表情包详情页面
│   │   └── tags/         # 标签页面
│   ├── (user)/           # 用户相关页面
│   │   ├── profile/      # 个人资料页面
│   │   ├── uploads/      # 我的上传页面
│   │   └── collections/  # 我的收藏页面
│   └── (admin)/          # 管理员页面
│       ├── review/       # 审核页面
│       ├── users/        # 用户管理页面
│       └── tags/         # 标签管理页面
├── components/           # 共享组件
│   ├── ui/               # UI 组件 (Shadcn UI)
│   ├── stickers/         # 表情包相关组件
│   ├── layout/           # 布局组件
│   └── forms/            # 表单组件
├── lib/                  # 工具函数和库
│   ├── supabase/         # Supabase 客户端
│   ├── utils/            # 工具函数
│   └── types/            # TypeScript 类型定义
├── public/               # 静态资源
└── styles/               # 全局样式
```

## 开发计划

### 阶段一：基础设施搭建
1. 创建 Next.js 项目并集成 Shadcn UI
2. 设置 Supabase 项目和数据库表
3. 实现基本的身份验证功能

### 阶段二：核心功能开发
1. 实现表情包上传和存储功能
2. 实现表情包浏览和搜索功能
3. 实现表情包点赞和收藏功能

### 阶段三：审核和管理功能
1. 实现表情包审核流程
2. 实现管理员功能

### 阶段四：优化和测试
1. 性能优化
2. 用户体验优化
3. 跨浏览器和设备测试

### 阶段五：部署和上线
1. 部署到生产环境
2. 监控和维护

## 总结

奶龙表情包网站将是一个功能完善的表情包分享平台，通过 Next.js 和 Shadcn UI 构建现代化的前端界面，使用 Supabase 提供强大的后端支持。该网站将支持表情包的浏览、搜索、上传、点赞、收藏等核心功能，并实现表情包审核机制，确保内容质量。