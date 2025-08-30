# 项目分析

## 页面结构 (Page Structure)

该页面采用了一个经典的单页布局，结构清晰、现代，主要由以下几个部分组成：

1.  **顶部核心区 (Header):**
    *   页面中央是核心的个人信息展示区。
    *   包含一个圆形的头像（doro），一个渐变色的主标题（doro の 小窝），以及一个指向 GitHub 表情包仓库的链接。
    *   整体居中，使用了 Flexbox 布局，是页面的视觉焦点。

2.  **项目卡片网格 (Project Grid):**
    *   主体内容是一个响应式的网格布局 (`grid`)，在桌面端显示为两列，在移动端则为单列。
    *   每个网格项都是一个“卡片”(Card)组件，用于展示一个项目。
    *   卡片内部包含项目标题、简短描述以及相关的技术标签。
    *   卡片具有毛玻璃效果 (`backdrop-blur-sm`) 和圆角，鼠标悬停时有阴影放大的过渡效果，提升了交互感。

3.  **页脚 (Footer):**
    *   位于页面底部，包含一个简单的版权声明。

## 配色方案 (Color Scheme)

该设计包含了两种截然不同的配色主题：**浅色模式 (Light Mode)** 和 **深色模式 (Dark Mode)**，用户可以根据系统设置或手动切换。

1.  **浅色模式 (Light Mode):**
    *   **背景:** 采用从玫瑰色 (`rose-50`) 到粉色 (`pink-50`) 再到紫红色 (`fuchsia-50`) 的柔和渐变，营造出一种温暖、明亮、充满活力的氛围。
    *   **主色调:** 以粉色 (`pink-600`) 和紫色 (`purple-600`) 作为强调色，广泛用于标题、链接和图标，与背景的柔和色调形成对比，非常醒目。
    *   **文本和卡片:** 卡片背景为半透明的白色 (`white/80`)，呈现出精致的毛玻璃效果。主要文本颜色为深灰色 (`gray-700`)，保证了在浅色背景下的可读性。

2.  **深色模式 (Dark Mode):**
    *   **背景:** 切换为从深灰色 (`gray-900`) 到深紫色 (`purple-900`) 的渐变，创造出一种沉静、优雅且富有科技感的视觉体验。
    *   **主色调:** 强调色变为亮粉色 (`pink-400`)，在深色背景下显得尤为突出和迷人。
    *   **文本和卡片:** 卡片背景为半透明的深灰色 (`gray-800/80`)，同样具备毛玻璃效果。主要文本颜色为浅灰色 (`gray-300`)，确保了夜间阅读的舒适性。

两种模式都利用了 Tailwind CSS 的功能和 CSS 变量，实现了流畅的颜色过渡和主题切换。

---

## 开发计划 (Development Plan)

### 第一优先级

**1. 数据库设计 (Database Design)**

**表名: `Stickers`**

| 字段名 (Column) | 类型 (Type)     | 描述 (Description)                               |
| :-------------- | :-------------- | :----------------------------------------------- |
| `id`            | `UUID`          | 主键，使用 UUID 以便未来扩展。                   |
| `image_url`     | `TEXT`          | **必需**。表情图片在云存储中的 URL。             |
| `title`         | `VARCHAR(255)`  | 可选。表情的标题。                               |
| `description`   | `TEXT`          | 可选。表情的详细描述。                           |
| `created_at`    | `TIMESTAMPTZ`   | **必需**。记录创建时间，默认为当前时间。         |

**2. Next.js 项目启动 (Initialize Next.js Project)**

```bash
# 1. 创建一个新的 Next.js 项目
npx create-next-app@latest doro-stickers --typescript --tailwind --eslint

# 2. 进入项目目录
cd doro-stickers

# 3. (推荐) 安装 Prisma 用于数据库交互
npm install prisma --save-dev
npx prisma init --datasource-provider postgresql
```

**3. 图片上传 CRUD (创建/读取/更新/删除)**

-   **后端 API (Next.js API Routes):**
    -   `POST /api/stickers`: 创建新的表情记录。
    -   `GET /api/stickers`: 获取所有表情的列表（用于管理页面）。
    -   `PUT /api/stickers/[id]`: 更新指定 `id` 的表情信息。
    -   `DELETE /api/stickers/[id]`: 删除指定 `id` 的表情。
-   **前端页面 (`/app/admin/page.tsx`):**
    -   创建受保护的管理页面，包含上传表单和表情列表。

**4. 首页表情包分页查询和展示**

-   **后端 API (`/api/stickers/feed`):**
    -   创建 API 端点，支持 `?page=1&limit=20` 形式的分页查询。
-   **前端页面 (`/app/page.tsx`):**
    -   在首页使用网格布局展示表情。
    -   实现分页逻辑（分页按钮或无限滚动）。

### 第二优先级 (后续迭代)

-   **用户系统:** 引入用户认证，将上传的表情与用户关联。
-   **搜索功能:** 基于表情的 `title` 和 `description` 实现搜索。
-   **一键复制/下载:** 提升用户体验。
-   **点赞/收藏:** 增加用户互动功能。
-   

## 部署资料

数据库
https://supabase.com/dashboard/project/mhyckmaeivojdgncdsfc