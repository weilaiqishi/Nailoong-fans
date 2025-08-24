# 奶龙表情包网站后端设计

## 技术栈

- **Next.js API Routes**：用于构建后端API
- **Supabase**：
  - PostgreSQL 数据库
  - 存储服务（用于表情包图片）
  - 身份验证服务
  - 实时订阅（可选）

## API 设计

### 认证相关 API

#### 1. 用户注册

```
POST /api/auth/register
```

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "username": "cooluser"
}
```

**响应**：
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "cooluser"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1630000000
  }
}
```

**实现**：
```typescript
// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. 创建用户认证
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. 创建用户资料
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user?.id,
          username,
          email,
        },
      ])
      .select();

    if (profileError) throw profileError;

    return res.status(200).json({
      user: profileData[0],
      session: authData.session,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### 2. 用户登录

```
POST /api/auth/login
```

**请求体**：
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**响应**：
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "cooluser"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_at": 1630000000
  }
}
```

**实现**：
```typescript
// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // 获取用户资料
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) throw userError;

    return res.status(200).json({
      user: userData,
      session: data.session,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### 3. 用户登出

```
POST /api/auth/logout
```

**响应**：
```json
{
  "success": true
}
```

**实现**：
```typescript
// pages/api/auth/logout.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

### 表情包相关 API

#### 1. 获取表情包列表

```
GET /api/stickers
```

**查询参数**：
- `page`：页码（默认为1）
- `limit`：每页数量（默认为20）
- `sort`：排序方式（latest, popular, downloads）
- `tag`：按标签筛选
- `search`：搜索关键词

**响应**：
```json
{
  "stickers": [
    {
      "id": "uuid",
      "title": "奶龙表情1",
      "description": "描述",
      "image_url": "https://...",
      "user": {
        "id": "uuid",
        "username": "cooluser"
      },
      "likes_count": 42,
      "downloads_count": 24,
      "tags": [
        { "id": "uuid", "name": "可爱" },
        { "id": "uuid", "name": "奶龙" }
      ],
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "has_more": true
  }
}
```

**实现**：
```typescript
// pages/api/stickers/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { page = 1, limit = 20, sort = 'latest', tag, search } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const offset = (pageNumber - 1) * limitNumber;

  try {
    let query = supabase
      .from('stickers')
      .select(
        `
        *,
        user:users(id, username),
        tags:sticker_tags(tag:tags(id, name))
      `,
        { count: 'exact' }
      )
      .eq('status', 'approved')
      .range(offset, offset + limitNumber - 1);

    // 添加搜索条件
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // 添加标签筛选
    if (tag) {
      query = query.contains('tags.tag.name', [tag]);
    }

    // 添加排序
    switch (sort) {
      case 'popular':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'downloads':
        query = query.order('downloads_count', { ascending: false });
        break;
      case 'latest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // 格式化数据
    const formattedData = data.map((sticker) => ({
      ...sticker,
      tags: sticker.tags.map((t: any) => t.tag),
    }));

    return res.status(200).json({
      stickers: formattedData,
      pagination: {
        total: count || 0,
        page: pageNumber,
        limit: limitNumber,
        has_more: count ? offset + limitNumber < count : false,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### 2. 获取表情包详情

```
GET /api/stickers/:id
```

**响应**：
```json
{
  "id": "uuid",
  "title": "奶龙表情1",
  "description": "描述",
  "image_url": "https://...",
  "image_source": "upload",
  "user": {
    "id": "uuid",
    "username": "cooluser"
  },
  "likes_count": 42,
  "downloads_count": 24,
  "is_liked": true,
  "tags": [
    { "id": "uuid", "name": "可爱" },
    { "id": "uuid", "name": "奶龙" }
  ],
  "created_at": "2023-01-01T00:00:00Z"
}
```

**实现**：
```typescript
// pages/api/stickers/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const user = await getUserFromRequest(req);

  try {
    // 获取表情包详情
    const { data, error } = await supabase
      .from('stickers')
      .select(
        `
        *,
        user:users(id, username),
        tags:sticker_tags(tag:tags(id, name))
      `
      )
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error) throw error;

    // 格式化标签数据
    const formattedData = {
      ...data,
      tags: data.tags.map((t: any) => t.tag),
    };

    // 如果用户已登录，检查是否已点赞和收藏
    if (user) {
      // 检查是否已点赞
      const { data: likeData, error: likeError } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id)
        .eq('sticker_id', id)
        .maybeSingle();

      if (likeError) throw likeError;

      // 检查是否已收藏
      const { data: collectData, error: collectError } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .eq('sticker_id', id)
        .maybeSingle();

      if (collectError) throw collectError;

      formattedData.is_liked = !!likeData;
      formattedData.is_collected = !!collectData;
    } else {
      formattedData.is_liked = false;
      formattedData.is_collected = false;
    }

    return res.status(200).json(formattedData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### 3. 上传表情包图片

```
POST /api/stickers/upload
```

**请求体**：
```json
{
  "image": "base64_encoded_image_or_file"
}
```

**响应**：
```json
{
  "image_url": "https://..."
}
```

#### 4. 创建表情包

```
POST /api/stickers
```

**请求体**：
```json
{
  "title": "奶龙表情1",
  "description": "描述",
  "image_url": "https://...",
  "image_source": "upload", // "upload" 或 "link"
  "tags": ["可爱", "奶龙"]
}
```

**响应**：
```json
{
  "id": "uuid",
  "title": "奶龙表情1",
  "description": "描述",
  "image_url": "https://...",
  "image_source": "upload",
  "status": "pending",
  "created_at": "2023-01-01T00:00:00Z"
}
```

**上传表情包图片实现**：
```typescript
// pages/api/stickers/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';
import { getUserFromRequest } from '@/lib/auth';
import { nanoid } from 'nanoid';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  try {
    // 上传图片到 Supabase Storage
    const imageData = Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    const imagePath = `stickers/${user.id}/${nanoid()}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from('stickers')
      .upload(imagePath, imageData, {
        contentType: 'image/png', // 根据实际图片类型调整
      });

    if (storageError) throw storageError;

    // 获取图片 URL
    const { data: urlData } = supabase.storage
      .from('stickers')
      .getPublicUrl(imagePath);

    const imageUrl = urlData.publicUrl;

    return res.status(200).json({ image_url: imageUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

**创建表情包实现**：
```typescript
// pages/api/stickers/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // 处理 GET 请求（获取表情包列表）
    // ...
  } else if (req.method === 'POST') {
    // 处理 POST 请求（创建表情包）
    const user = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, image_url, image_source, tags } = req.body;

    if (!title || !image_url || !image_source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 验证 image_source 是否有效
    if (image_source !== 'upload' && image_source !== 'link') {
      return res.status(400).json({ error: 'Invalid image source' });
    }

    try {
      // 1. 创建表情包记录
      const { data: stickerData, error: stickerError } = await supabase
        .from('stickers')
        .insert([
          {
            title,
            description,
            image_url,
            image_source,
            user_id: user.id,
            status: 'pending', // 需要审核
          },
        ])
        .select()
        .single();

      if (stickerError) throw stickerError;

      // 2. 处理标签
      if (tags && tags.length > 0) {
        // 获取或创建标签
        for (const tagName of tags) {
          // 检查标签是否存在
          let { data: existingTag, error: tagError } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .maybeSingle();

          if (tagError) throw tagError;

          let tagId;

          if (existingTag) {
            tagId = existingTag.id;
          } else {
            // 创建新标签
            const { data: newTag, error: newTagError } = await supabase
              .from('tags')
              .insert([{ name: tagName }])
              .select()
              .single();

            if (newTagError) throw newTagError;

            tagId = newTag.id;
          }

          // 关联标签和表情包
          const { error: relationError } = await supabase
            .from('sticker_tags')
            .insert([{
              sticker_id: stickerData.id,
              tag_id: tagId,
            }]);

          if (relationError) throw relationError;
        }
      }

      return res.status(201).json(stickerData);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
```

#### 4. 点赞表情包

```
POST /api/stickers/:id/like
```

**响应**：
```json
{
  "success": true,
  "likes_count": 43
}
```

**实现**：
```typescript
// pages/api/stickers/[id]/like.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'POST') {
      // 添加点赞
      const { error } = await supabase
        .from('likes')
        .insert([{
          user_id: user.id,
          sticker_id: id,
        }])
        .single();

      if (error && error.code !== '23505') { // 忽略唯一约束错误（已点赞）
        throw error;
      }

      // 更新点赞计数
      const { data, error: updateError } = await supabase.rpc(
        'increment_likes_count',
        { sticker_id: id }
      );

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        likes_count: data,
      });
    } else {
      // 取消点赞
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('sticker_id', id);

      if (error) throw error;

      // 更新点赞计数
      const { data, error: updateError } = await supabase.rpc(
        'decrement_likes_count',
        { sticker_id: id }
      );

      if (updateError) throw updateError;

      return res.status(200).json({
        success: true,
        likes_count: data,
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### 5. 收藏表情包

```
POST /api/stickers/:id/collect
```

**响应**：
```json
{
  "success": true
}
```

**实现**：
```typescript
// pages/api/stickers/[id]/collect.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'POST') {
      // 添加收藏
      const { error } = await supabase
        .from('collections')
        .insert([{
          user_id: user.id,
          sticker_id: id,
        }])
        .single();

      if (error && error.code !== '23505') { // 忽略唯一约束错误（已收藏）
        throw error;
      }

      return res.status(200).json({ success: true });
    } else {
      // 取消收藏
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('user_id', user.id)
        .eq('sticker_id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### 6. 下载表情包

```
POST /api/stickers/:id/download
```

**响应**：
```json
{
  "success": true,
  "download_url": "https://..."
}
```

**实现**：
```typescript
// pages/api/stickers/[id]/download.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    // 获取表情包信息
    const { data, error } = await supabase
      .from('stickers')
      .select('image_url')
      .eq('id', id)
      .single();

    if (error) throw error;

    // 更新下载计数
    const { error: updateError } = await supabase.rpc(
      'increment_downloads_count',
      { sticker_id: id }
    );

    if (updateError) throw updateError;

    return res.status(200).json({
      success: true,
      download_url: data.image_url,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

### 管理员 API

#### 1. 获取待审核表情包

```
GET /api/admin/stickers/pending
```

**响应**：
```json
{
  "stickers": [
    {
      "id": "uuid",
      "title": "奶龙表情1",
      "description": "描述",
      "image_url": "https://...",
      "user": {
        "id": "uuid",
        "username": "cooluser"
      },
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "has_more": false
  }
}
```

**实现**：
```typescript
// pages/api/admin/stickers/pending.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);

  if (!user || !isAdmin(user)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { page = 1, limit = 20 } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const offset = (pageNumber - 1) * limitNumber;

  try {
    const { data, error, count } = await supabase
      .from('stickers')
      .select(
        `
        *,
        user:users(id, username)
      `,
        { count: 'exact' }
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNumber - 1);

    if (error) throw error;

    return res.status(200).json({
      stickers: data,
      pagination: {
        total: count || 0,
        page: pageNumber,
        limit: limitNumber,
        has_more: count ? offset + limitNumber < count : false,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

#### 2. 审核表情包

```
PUT /api/admin/stickers/:id/review
```

**请求体**：
```json
{
  "status": "approved", // 或 "rejected"
  "reason": "不符合社区规范" // 仅在拒绝时需要
}
```

**响应**：
```json
{
  "success": true
}
```

**实现**：
```typescript
// pages/api/admin/stickers/[id]/review.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/server';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status, reason } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  if (status === 'rejected' && !reason) {
    return res.status(400).json({ error: 'Reason is required for rejection' });
  }

  const user = await getUserFromRequest(req);

  if (!user || !isAdmin(user)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // 更新表情包状态
    const { error } = await supabase
      .from('stickers')
      .update({
        status,
        review_reason: status === 'rejected' ? reason : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    // 获取表情包和上传者信息
    const { data: stickerData, error: stickerError } = await supabase
      .from('stickers')
      .select('title, user_id')
      .eq('id', id)
      .single();

    if (stickerError) throw stickerError;

    // 可以在这里添加通知逻辑，例如发送邮件通知用户审核结果

    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

## 数据库函数和触发器

### 1. 点赞计数函数

```sql
-- 增加点赞计数
CREATE OR REPLACE FUNCTION increment_likes_count(sticker_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE stickers
  SET likes_count = likes_count + 1
  WHERE id = sticker_id
  RETURNING likes_count INTO new_count;
  
  RETURN new_count;
END;
$$;

-- 减少点赞计数
CREATE OR REPLACE FUNCTION decrement_likes_count(sticker_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE stickers
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = sticker_id
  RETURNING likes_count INTO new_count;
  
  RETURN new_count;
END;
$$;
```

### 2. 下载计数函数

```sql
CREATE OR REPLACE FUNCTION increment_downloads_count(sticker_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE stickers
  SET downloads_count = downloads_count + 1
  WHERE id = sticker_id
  RETURNING downloads_count INTO new_count;
  
  RETURN new_count;
END;
$$;
```

## Supabase 存储配置

### 1. 存储桶设置

创建以下存储桶：

1. **stickers**：用于存储表情包图片
   - 公共访问：是
   - 文件结构：`stickers/{user_id}/{random_id}`

2. **avatars**：用于存储用户头像
   - 公共访问：是
   - 文件结构：`avatars/{user_id}`

### 2. 存储策略

为 stickers 桶设置以下策略：

```sql
-- 允许已认证用户上传文件
CREATE POLICY "允许已认证用户上传表情包" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'stickers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 允许所有人读取文件
CREATE POLICY "允许所有人读取表情包" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'stickers');

-- 允许用户删除自己的文件
CREATE POLICY "允许用户删除自己的表情包" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'stickers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

为 avatars 桶设置以下策略：

```sql
-- 允许已认证用户上传头像
CREATE POLICY "允许已认证用户上传头像" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  name = auth.uid()::text
);

-- 允许所有人读取头像
CREATE POLICY "允许所有人读取头像" ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 允许用户更新自己的头像
CREATE POLICY "允许用户更新自己的头像" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  name = auth.uid()::text
);
```

## 行级安全策略

为数据库表设置行级安全策略：

### 1. users 表

```sql
-- 启用行级安全
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许用户读取所有用户资料
CREATE POLICY "允许所有人读取用户资料" ON users
FOR SELECT
TO public
USING (true);

-- 允许用户更新自己的资料
CREATE POLICY "允许用户更新自己的资料" ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid());
```

### 2. stickers 表

```sql
-- 启用行级安全
ALTER TABLE stickers ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取已审核通过的表情包
CREATE POLICY "允许所有人读取已审核表情包" ON stickers
FOR SELECT
TO public
USING (status = 'approved');

-- 允许用户读取自己上传的表情包（包括待审核和被拒绝的）
CREATE POLICY "允许用户读取自己的表情包" ON stickers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 允许用户创建表情包
CREATE POLICY "允许用户创建表情包" ON stickers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 允许用户更新自己的表情包
CREATE POLICY "允许用户更新自己的表情包" ON stickers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 允许用户删除自己的表情包
CREATE POLICY "允许用户删除自己的表情包" ON stickers
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 允许管理员读取所有表情包
CREATE POLICY "允许管理员读取所有表情包" ON stickers
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));

-- 允许管理员更新所有表情包
CREATE POLICY "允许管理员更新所有表情包" ON stickers
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid() AND users.role = 'admin'
));
```

### 3. likes 表

```sql
-- 启用行级安全
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取点赞记录
CREATE POLICY "允许所有人读取点赞记录" ON likes
FOR SELECT
TO public
USING (true);

-- 允许已认证用户创建点赞记录
CREATE POLICY "允许已认证用户创建点赞记录" ON likes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 允许用户删除自己的点赞记录
CREATE POLICY "允许用户删除自己的点赞记录" ON likes
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
```

### 4. collections 表

```sql
-- 启用行级安全
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- 允许用户读取自己的收藏记录
CREATE POLICY "允许用户读取自己的收藏记录" ON collections
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 允许已认证用户创建收藏记录
CREATE POLICY "允许已认证用户创建收藏记录" ON collections
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 允许用户删除自己的收藏记录
CREATE POLICY "允许用户删除自己的收藏记录" ON collections
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
```

## 身份验证和授权

### 1. 用户角色

在 users 表中添加 role 字段来区分普通用户和管理员：

```sql
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user';
```

可能的角色值：
- `user`：普通用户
- `admin`：管理员

### 2. 权限检查函数

```typescript
// lib/auth.ts
import { NextApiRequest } from 'next';
import { supabase } from './supabase/server';

export async function getUserFromRequest(req: NextApiRequest) {
  // 从请求头中获取 JWT
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return null;
  
  try {
    // 验证 JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return null;
    
    // 获取用户资料
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) return null;
    
    return data;
  } catch (error) {
    return null;
  }
}

export function isAdmin(user: any) {
  return user?.role === 'admin';
}
```

## 中间件

### 1. 认证中间件

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // 刷新会话（如果存在）
  const { data: { session } } = await supabase.auth.getSession();
  
  // 检查是否需要认证
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');
  const isProtectedRoute = (
    req.nextUrl.pathname.startsWith('/api/stickers') && 
    req.method !== 'GET'
  ) || req.nextUrl.pathname.startsWith('/api/admin');
  
  // 如果是受保护的路由但没有会话，返回 401
  if (isProtectedRoute && !session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 如果是管理员路由，检查用户是否是管理员
  if (req.nextUrl.pathname.startsWith('/api/admin') && session) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
  }
  
  return res;
}

export const config = {
  matcher: [
    '/api/auth/:path*',
    '/api/stickers/:path*',
    '/api/admin/:path*',
  ],
};
```

## 实时功能（可选）

使用 Supabase 的实时订阅功能，可以实现以下实时功能：

### 1. 实时点赞计数更新

```typescript
// hooks/useRealtimeLikes.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useRealtimeLikes(stickerId: string, initialCount: number) {
  const [likesCount, setLikesCount] = useState(initialCount);
  
  useEffect(() => {
    // 设置初始值
    setLikesCount(initialCount);
    
    // 订阅表情包更新
    const subscription = supabase
      .channel(`sticker-${stickerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stickers',
          filter: `id=eq.${stickerId}`,
        },
        (payload) => {
          if (payload.new && payload.new.likes_count !== undefined) {
            setLikesCount(payload.new.likes_count);
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [stickerId, initialCount]);
  
  return likesCount;
}
```

### 2. 实时审核通知

```typescript
// hooks/useRealtimeReview.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useRealtimeReview(stickerId: string, initialStatus: string) {
  const [status, setStatus] = useState(initialStatus);
  const [reviewReason, setReviewReason] = useState<string | null>(null);
  
  useEffect(() => {
    // 设置初始值
    setStatus(initialStatus);
    
    // 订阅表情包更新
    const subscription = supabase
      .channel(`sticker-review-${stickerId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'stickers',
          filter: `id=eq.${stickerId}`,
        },
        (payload) => {
          if (payload.new) {
            setStatus(payload.new.status);
            setReviewReason(payload.new.review_reason);
          }
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [stickerId, initialStatus]);
  
  return { status, reviewReason };
}
```

## 错误处理

### 1. API 错误处理中间件

```typescript
// lib/error-handler.ts
import { NextApiRequest, NextApiResponse } from 'next';

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void> | void;

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error: any) {
      console.error('API Error:', error);
      
      // 确定状态码
      const statusCode = error.statusCode || 500;
      
      // 确定错误消息
      const message = error.message || 'Internal Server Error';
      
      // 返回错误响应
      res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
      });
    }
  };
}
```

### 2. 自定义错误类

```typescript
// lib/errors.ts
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
  
  static badRequest(message: string = 'Bad Request') {
    return new ApiError(message, 400);
  }
  
  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(message, 401);
  }
  
  static forbidden(message: string = 'Forbidden') {
    return new ApiError(message, 403);
  }
  
  static notFound(message: string = 'Not Found') {
    return new ApiError(message, 404);
  }
  
  static methodNotAllowed(message: string = 'Method Not Allowed') {
    return new ApiError(message, 405);
  }
  
  static conflict(message: string = 'Conflict') {
    return new ApiError(message, 409);
  }
  
  static internalServerError(message: string = 'Internal Server Error') {
    return new ApiError(message, 500);
  }
}
```

## 总结

奶龙表情包网站的后端设计基于 Next.js API Routes 和 Supabase 服务，提供了完整的用户认证、表情包管理、交互功能和管理员功能。通过 Supabase 的数据库、存储和身份验证服务，可以快速构建功能完善的表情包分享平台。

后端设计包括：

1. **用户认证**：注册、登录和登出功能
2. **表情包管理**：上传、浏览、搜索和详情查看
3. **交互功能**：点赞、收藏和下载
4. **审核功能**：管理员审核表情包
5. **数据库设计**：表结构、函数和触发器
6. **存储配置**：存储桶和访问策略
7. **安全策略**：行级安全和权限控制
8. **实时功能**：使用 Supabase 实时订阅
9. **错误处理**：统一的错误处理机制

这些功能和设计为奶龙表情包网站提供了坚实的后端基础，确保网站的安全性、可扩展性和用户体验。