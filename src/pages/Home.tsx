import React, { useState } from 'react';
import { Search, Download, ExternalLink, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

// 表情包文件类型定义
interface EmojiFile {
  id: string;
  size: string;
  format: string;
  modifiedDate: string;
  imageUrl: string;
}

// 模拟表情包数据
const mockEmojiFiles: EmojiFile[] = Array.from({ length: 72 }, (_, i) => ({
  id: `173504${8750 + i}`,
  size: `${Math.floor(Math.random() * 500) + 100}.${Math.floor(Math.random() * 100)} MB`,
  format: 'GPF',
  modifiedDate: '2025-01-05',
  imageUrl: i < 2 ? 
    `https://lf-code-agent.coze.cn/obj/x-ai-cn/252549595650/image/region_images/supplies_images/FileManagementPage/${i + 1}.jpeg` : 
    `https://picsum.photos/seed/${i}/200/200`
}));

// 头部组件
const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-pink-300 flex items-center justify-center">
            <span className="font-bold text-purple-800">d</span>
          </div>
          <h1 className="text-xl font-bold text-purple-800">doroの小窝</h1>
          <span className="text-xs text-pink-500">❤️doro的资源收集屋❤️</span>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-pink-100 text-purple-600"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="搜索文件名称..." 
            className="w-full py-2 px-4 pr-10 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button className="absolute right-0 top-0 h-full px-4 bg-purple-600 text-white rounded-r-lg">
            <Search size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>当前1/72页，共2087项</span>
        <span>页次切换：8×9=72项/页</span>
      </div>
    </header>
  );
};

// 文件卡片组件
const FileCard = ({ file }: { file: EmojiFile }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-transform hover:transform hover:scale-105">
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        {file.imageUrl ? (
          <img 
            src={file.imageUrl} 
            alt={`Emoji ${file.id}`} 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/default/200/200';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            <span className="text-xs">无预览图</span>
          </div>
        )}
      </div>
      <div className="p-2 text-xs">
        <div className="font-medium text-gray-800 truncate mb-1">{file.id}...</div>
        <div className="flex justify-between text-gray-600 mb-1">
          <span>{file.size}</span>
          <span>{file.format}</span>
        </div>
        <div className="flex justify-between text-gray-500 mb-2">
          <span>{file.modifiedDate}</span>
          <span>修改</span>
        </div>
        <div className="flex gap-1">
          <button className="flex-1 py-1 bg-gray-100 text-gray-800 rounded text-xs flex items-center justify-center">
            <Download size={14} className="mr-1" /> 下载
          </button>
          <button className="flex-1 py-1 bg-gray-100 text-gray-800 rounded text-xs flex items-center justify-center">
            <ExternalLink size={14} className="mr-1" /> 
            打开
          </button>
        </div>
      </div>
    </div>
  );
};

// 分页组件
const Pagination = () => {
  return (
    <div className="flex justify-center items-center gap-1 mt-8 mb-4">
      <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">首页</button>
      <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">上一页</button>
      <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">1</button>
      <button className="px-3 py-1 text-xs border border-purple-500 rounded bg-purple-600 text-white">2</button>
      <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">3</button>
      <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">4</button>
      <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">5</button>
      <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">下一页</button>
      <button className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50">末页</button>
    </div>
  );
};

// 页脚组件
const Footer = () => {
  return (
    <footer className="mt-auto text-center text-xs text-gray-500 pt-8 pb-4">
      <p>© 2025 doroの小窝 - 资源收集屋 - 本站资源均来源于网络，仅供学习交流使用，请于下载后24小时内删除</p>
      <p className="mt-1">本站不存储任何实际文件，所有内容均为索引指向，如有侵权请联系删除</p>
    </footer>
  );
};

// 主页面组件
export default function Home() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen bg-pink-50 ${theme === 'dark' ? 'dark bg-gray-900 text-white' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Header />
        
        <div className="grid grid-cols-8 gap-3 mb-6">
          {mockEmojiFiles.map((file, index) => (
            <FileCard key={index} file={file} />
          ))}
        </div>
        
        <Pagination />
        <Footer />
      </div>
    </div>
  );
}