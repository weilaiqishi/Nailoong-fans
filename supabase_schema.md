# Supabase 数据库设计

## 表: `stickers`

根据项目需求，我们将在 Supabase 中创建一个名为 `stickers` 的表来存储表情包信息。

### 表结构

| 字段名 (Column) | 类型 (Type)     | 描述 (Description)                               | 默认值 (Default) | 约束 (Constraints) |
| :-------------- | :-------------- | :----------------------------------------------- | :--------------- | :----------------- |
| `id`            | `uuid`          | 主键，唯一标识符。                               | `gen_random_uuid()` | **Primary Key**    |
| `created_at`    | `timestamptz`   | 记录创建时间。                                   | `now()`          | Not Null           |
| `image_url`     | `text`          | 表情图片的URL。                                  | `null`           | Not Null           |
| `title`         | `text`          | 表情的标题或名字。                               | `null`           |                    |
| `description`   | `text`          | 表情的详细描述。                                 | `null`           |                    |

### RLS (Row Level Security) 策略

为了数据安全，建议启用 RLS 并设置以下策略：

1.  **公开读取**: 允许任何人读取 `stickers` 表中的数据。

2.  **管理员写入**: 只允许拥有特定角色的用户（例如 `admin` 或 `authenticated`）进行插入、更新和删除操作。

## 完整 SQL 创建脚本

您可以直接在 Supabase SQL Editor 中运行以下完整脚本来创建表和配置RLS策略。

```sql
-- 1. 创建 "stickers" 表
CREATE TABLE public.stickers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  image_url text NOT NULL,
  title text NULL,
  description text NULL,
  CONSTRAINT stickers_pkey PRIMARY KEY (id)
);

-- 2. 为 "stickers" 表启用行级安全 (RLS)
-- 这是一个重要的安全措施，确保您的数据默认是受保护的。
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;

-- 3. 创建一个策略，允许任何人（包括未登录用户）读取表情包数据
-- 这使得您的首页可以公开展示表情包列表。
CREATE POLICY "Allow public read access"
ON public.stickers
FOR SELECT
USING (true);

-- 4. 创建一个策略，允许登录后的用户进行“增、删、改”操作
-- 注意：此策略允许任何已登录的用户修改或删除任何记录。
-- 在更复杂的应用中，您可能需要更精细的控制（例如，添加一个 user_id 字段，并只允许用户修改自己的记录）。
CREATE POLICY "Allow insert/update/delete for authenticated users"
ON public.stickers
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```
