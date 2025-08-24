# 奶龙表情包网站前端设计

## 页面布局

### 全局布局

网站将采用现代化的响应式设计，主要布局组件包括：

1. **顶部导航栏**
   - Logo和网站名称
   - 主导航菜单（首页、浏览、上传等）
   - 搜索框
   - 用户菜单（登录/注册按钮或用户头像下拉菜单）
   - 主题切换按钮（暗/亮模式）

2. **页脚**
   - 版权信息
   - 链接（关于我们、联系方式、使用条款等）
   - 社交媒体链接

### 响应式设计

- 桌面端：多列网格布局，充分利用宽屏空间
- 平板端：减少列数，优化触摸交互
- 移动端：单列布局，简化导航为汉堡菜单

## 页面设计

### 1. 首页

```

#### 6. ImageLinkInput

图片链接输入组件，用于通过链接上传表情包图片。

```tsx
interface ImageLinkInputProps {
  onLinkSubmit: (url: string) => void;
  error?: string;
}

const ImageLinkInput: React.FC<ImageLinkInputProps> = ({
  onLinkSubmit,
  error,
}) => {
  const [link, setLink] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePreview = async () => {
    if (!link) return;
    
    try {
      setLoading(true);
      // 这里可以添加链接验证逻辑
      setPreview(link);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (link && preview) {
      onLinkSubmit(link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex">
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="输入图片链接..."
          className="rounded-r-none"
        />
        <Button
          onClick={handlePreview}
          className="rounded-l-none"
          disabled={!link || loading}
        >
          {loading ? (
            <Loader2Icon className="h-4 w-4 animate-spin" />
          ) : (
            "预览"
          )}
        </Button>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      {preview && (
        <div className="space-y-4">
          <div className="border rounded-md p-4 flex justify-center">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-64 object-contain" 
              onError={() => setPreview(null)}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">
            使用此图片
          </Button>
        </div>
      )}
    </div>
  );
};
```
+----------------------------------+
|            导航栏               |
+----------------------------------+
|                                  |
|          欢迎横幅/轮播          |
|                                  |
+----------------------------------+
|                                  |
|          热门标签云             |
|                                  |
+----------------------------------+
|                                  |
|          热门表情包             |
|        (网格卡片布局)           |
|                                  |
+----------------------------------+
|                                  |
|          最新表情包             |
|        (网格卡片布局)           |
|                                  |
+----------------------------------+
|            页脚                 |
+----------------------------------+
```

#### 组件：
- `HeroBanner`：展示网站主题和特色内容
- `TagCloud`：展示热门标签
- `StickerGrid`：表情包网格展示
- `StickerCard`：单个表情包卡片
- `LoadMoreButton`：加载更多按钮

### 2. 浏览页

```
+----------------------------------+
|            导航栏               |
+----------------------------------+
|                                  |
|          分类选择器             |
|                                  |
+----------------------------------+
|          |                       |
|          |                       |
|  筛选    |     表情包网格       |
|  侧边栏  |     (带分页)         |
|          |                       |
|          |                       |
+----------------------------------+
|            页脚                 |
+----------------------------------+
```

#### 组件：
- `CategorySelector`：分类选择器
- `FilterSidebar`：筛选选项侧边栏
- `StickerGrid`：表情包网格
- `Pagination`：分页控件

### 3. 搜索结果页

```
+----------------------------------+
|            导航栏               |
+----------------------------------+
|                                  |
|          搜索框和结果统计       |
|                                  |
+----------------------------------+
|          |                       |
|          |                       |
|  筛选    |     搜索结果         |
|  侧边栏  |     (带分页)         |
|          |                       |
|          |                       |
+----------------------------------+
|            页脚                 |
+----------------------------------+
```

#### 组件：
- `SearchHeader`：搜索框和结果统计
- `FilterSidebar`：筛选选项侧边栏
- `SearchResults`：搜索结果网格
- `NoResults`：无结果提示

### 4. 表情包详情页

```
+----------------------------------+
|            导航栏               |
+----------------------------------+
|                                  |
|          表情包大图             |
|                                  |
+----------------------------------+
|                                  |
|  标题、描述、上传者、上传时间   |
|                                  |
+----------------------------------+
|                                  |
|  交互按钮(点赞、收藏、分享、下载)|
|                                  |
+----------------------------------+
|                                  |
|          标签列表               |
|                                  |
+----------------------------------+
|                                  |
|          相关推荐               |
|                                  |
+----------------------------------+
|            页脚                 |
+----------------------------------+
```

#### 组件：
- `StickerImage`：表情包大图展示
- `StickerInfo`：表情包信息
- `ActionButtons`：交互按钮组
- `TagList`：标签列表
- `RelatedStickers`：相关表情包推荐

### 5. 上传页面

```
+----------------------------------+
|            导航栏               |
+----------------------------------+
|                                  |
|          上传表单               |
|   +------------------------+     |
|   |  上传方式选择        |     |
|   |  (本地上传/链接)      |     |
|   +------------------------+     |
|                                  |
|   +------------------------+     |
|   |  拖放区域/上传按钮    |     |
|   |  或                  |     |
|   |  图片链接输入框      |     |
|   +------------------------+     |
|                                  |
|   +------------------------+     |
|   |  表情包标题和描述    |     |
|   +------------------------+     |
|                                  |
|   +------------------------+     |
|   |  标签选择/创建       |     |
|   +------------------------+     |
|                                  |
|   +------------------------+     |
|   |  提交按钮            |     |
|   +------------------------+     |
|                                  |
+----------------------------------+
|            页脚                 |
+----------------------------------+
```

#### 组件：
- `UploadForm`：上传表单容器
- `UploadMethodSelector`：上传方式选择器（本地上传/链接）
- `FileDropzone`：文件拖放区域（本地上传模式）
- `ImageLinkInput`：图片链接输入框（链接模式）
- `StickerPreview`：上传预览
- `TitleDescriptionInput`：标题和描述输入
- `TagSelector`：标签选择器
- `SubmitButton`：提交按钮

### 6. 用户个人资料页

```
+----------------------------------+
|            导航栏               |
+----------------------------------+
|                                  |
|          用户信息               |
|  (头像、用户名、注册时间等)     |
|                                  |
+----------------------------------+
|                                  |
|          标签页导航             |
| [我的上传] [我的收藏] [设置]    |
|                                  |
+----------------------------------+
|                                  |
|          内容区域               |
|     (根据选中的标签页显示)      |
|                                  |
+----------------------------------+
|            页脚                 |
+----------------------------------+
```

#### 组件：
- `UserProfile`：用户信息展示
- `ProfileTabs`：个人资料标签页导航
- `UserUploads`：用户上传的表情包
- `UserCollections`：用户收藏的表情包
- `UserSettings`：用户设置表单

### 7. 管理员审核页面

```
+----------------------------------+
|            导航栏               |
+----------------------------------+
|                                  |
|          审核队列               |
|                                  |
+----------------------------------+
|                                  |
|          表情包列表             |
|  (带审核状态和操作按钮)         |
|                                  |
+----------------------------------+
|            页脚                 |
+----------------------------------+
```

#### 组件：
- `ReviewQueue`：审核队列统计
- `ReviewList`：待审核表情包列表
- `ReviewItem`：单个待审核表情包
- `ApproveRejectButtons`：审核操作按钮

## 组件设计

### 核心组件

#### 1. StickerCard

表情包卡片组件，用于在网格中展示单个表情包。

```tsx
interface StickerCardProps {
  id: string;
  imageUrl: string;
  title: string;
  username: string;
  likesCount: number;
  isLiked?: boolean;
  isCollected?: boolean;
  tags?: { id: string; name: string }[];
}

const StickerCard: React.FC<StickerCardProps> = ({
  id,
  imageUrl,
  title,
  username,
  likesCount,
  isLiked,
  isCollected,
  tags,
}) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/stickers/${id}`}>
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium line-clamp-1">{title}</h3>
          <div className="flex items-center space-x-1">
            <HeartIcon className={isLiked ? "text-red-500" : "text-gray-400"} />
            <span className="text-xs">{likesCount}</span>
          </div>
        </div>
        <div className="mt-1 text-xs text-gray-500">by {username}</div>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="outline" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">+{tags.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

#### 2. StickerGrid

表情包网格组件，用于展示多个表情包卡片。

```tsx
interface StickerGridProps {
  stickers: Sticker[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const StickerGrid: React.FC<StickerGridProps> = ({
  stickers,
  loading,
  onLoadMore,
  hasMore,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {stickers.map((sticker) => (
          <StickerCard key={sticker.id} {...sticker} />
        ))}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => <StickerCardSkeleton key={i} />)}
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="mt-4"
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                加载中...
              </>
            ) : (
              "加载更多"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
```

#### 3. TagSelector

标签选择器组件，用于在上传表情包时选择或创建标签。

```tsx
interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // 加载可用标签的逻辑
  useEffect(() => {
    // 从API获取可用标签
    // setAvailableTags([...]);
  }, []);

  const handleAddTag = () => {
    if (inputValue && !selectedTags.includes(inputValue)) {
      const newTags = [...selectedTags, inputValue];
      onChange(newTags);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    onChange(newTags);
  };

  return (
    <div className="space-y-2">
      <div className="flex">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="添加标签..."
          className="rounded-r-none"
        />
        <Button
          onClick={handleAddTag}
          className="rounded-l-none"
          disabled={!inputValue}
        >
          添加
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge key={tag} className="flex items-center gap-1 px-3 py-1.5">
            {tag}
            <XIcon
              className="h-3 w-3 cursor-pointer"
              onClick={() => handleRemoveTag(tag)}
            />
          </Badge>
        ))}
      </div>
      
      {availableTags.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium">推荐标签：</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableTags
              .filter((tag) => !selectedTags.includes(tag))
              .slice(0, 10)
              .map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    if (!selectedTags.includes(tag)) {
                      onChange([...selectedTags, tag]);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 4. UploadMethodSelector

上传方式选择器组件，用于选择通过本地上传或链接上传表情包。

```tsx
interface UploadMethodSelectorProps {
  method: 'upload' | 'link';
  onChange: (method: 'upload' | 'link') => void;
}

const UploadMethodSelector: React.FC<UploadMethodSelectorProps> = ({
  method,
  onChange,
}) => {
  return (
    <div className="flex space-x-2 mb-4">
      <Button
        variant={method === 'upload' ? 'default' : 'outline'}
        onClick={() => onChange('upload')}
        className="flex-1"
      >
        <UploadIcon className="mr-2 h-4 w-4" />
        本地上传
      </Button>
      <Button
        variant={method === 'link' ? 'default' : 'outline'}
        onClick={() => onChange('link')}
        className="flex-1"
      >
        <LinkIcon className="mr-2 h-4 w-4" />
        图片链接
      </Button>
    </div>
  );
};
```

#### 5. FileDropzone

文件拖放上传组件，用于上传表情包图片。

```tsx
interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  acceptedFileTypes = ["image/png", "image/jpeg", "image/gif"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file: File) => {
    if (!acceptedFileTypes.includes(file.type)) {
      setError("不支持的文件类型，请上传PNG、JPG或GIF图片");
      return false;
    }
    
    if (file.size > maxFileSize) {
      setError(`文件大小不能超过${maxFileSize / 1024 / 1024}MB`);
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadIcon className="mb-2 h-10 w-10 text-gray-400" />
        <p className="mb-1 text-sm font-medium">拖放文件到这里或点击上传</p>
        <p className="text-xs text-gray-500">
          支持PNG、JPG、GIF格式，最大{maxFileSize / 1024 / 1024}MB
        </p>
        <Input
          type="file"
          accept={acceptedFileTypes.join(",")}
          onChange={handleFileInput}
          className="mt-4 w-full max-w-xs"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
```

#### 5. ActionButtons

表情包交互按钮组件，用于点赞、收藏、分享和下载表情包。

```tsx
interface ActionButtonsProps {
  stickerId: string;
  isLiked: boolean;
  isCollected: boolean;
  likesCount: number;
  onLike: () => void;
  onCollect: () => void;
  onShare: () => void;
  onDownload: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  stickerId,
  isLiked,
  isCollected,
  likesCount,
  onLike,
  onCollect,
  onShare,
  onDownload,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <Button
        variant={isLiked ? "default" : "outline"}
        size="sm"
        className={`flex items-center space-x-1 ${isLiked ? "bg-red-500 hover:bg-red-600" : ""}`}
        onClick={onLike}
      >
        <HeartIcon className="h-4 w-4" />
        <span>{likesCount}</span>
      </Button>
      
      <Button
        variant={isCollected ? "default" : "outline"}
        size="sm"
        className={`flex items-center space-x-1 ${isCollected ? "bg-yellow-500 hover:bg-yellow-600" : ""}`}
        onClick={onCollect}
      >
        <BookmarkIcon className="h-4 w-4" />
        <span>收藏</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
        onClick={onShare}
      >
        <ShareIcon className="h-4 w-4" />
        <span>分享</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
        onClick={onDownload}
      >
        <DownloadIcon className="h-4 w-4" />
        <span>下载</span>
      </Button>
    </div>
  );
};
```

## 主题和样式

### 颜色方案

网站将使用以下颜色方案：

- **主色调**：蓝色系（#3B82F6）- 代表奶龙的主题色
- **强调色**：粉色（#EC4899）- 用于突出显示和交互元素
- **中性色**：灰色系列 - 用于文本和背景
- **功能色**：
  - 成功：绿色（#10B981）
  - 警告：黄色（#F59E0B）
  - 错误：红色（#EF4444）
  - 信息：蓝色（#3B82F6）

### 排版

- **主要字体**：系统字体栈，优先使用 sans-serif
- **标题**：较大字重（600-700）
- **正文**：中等字重（400-500）
- **字体大小**：
  - 大标题：1.5rem - 2rem
  - 小标题：1.25rem - 1.5rem
  - 正文：1rem
  - 小文本：0.875rem
  - 微文本：0.75rem

### 间距和布局

- 使用 4px 的基础单位进行间距设计
- 组件内部间距：16px - 24px
- 组件之间间距：24px - 48px
- 页面边距：
  - 移动端：16px
  - 桌面端：48px - 64px

### 动画和过渡

- 使用平滑的过渡效果（0.2s - 0.3s）
- 悬停效果：轻微的缩放或阴影变化
- 加载动画：使用骨架屏和微妙的加载指示器

## 响应式设计断点

- **移动端**：< 640px
- **平板端**：640px - 1024px
- **桌面端**：> 1024px

## 无障碍设计

- 所有交互元素都有适当的焦点状态
- 图片有 alt 文本
- 颜色对比度符合 WCAG 2.1 AA 标准
- 键盘导航支持
- 屏幕阅读器友好的 ARIA 标签

## 性能优化

- 图片懒加载
- 组件懒加载
- 无限滚动代替分页（适用于表情包浏览）
- 使用 Next.js 的图片优化功能
- 缓存策略

## 用户体验考虑

- 表情包预览和放大功能
- 拖放上传
- 上传进度指示器
- 即时反馈（点赞、收藏等操作）
- 错误处理和用户提示
- 空状态和加载状态的友好展示

## 总结

奶龙表情包网站的前端设计将以用户友好、现代化和响应式为核心原则。通过使用 Next.js 和 Shadcn UI，我们将创建一个视觉吸引人且功能丰富的表情包分享平台，为用户提供流畅的浏览、搜索、上传和互动体验。