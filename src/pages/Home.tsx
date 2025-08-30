import { useState, useEffect } from 'react';
import { Search, Download, ExternalLink, Moon, Sun, Languages } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/lib/supabaseClient';
import { Sticker } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 30;

// 头部组件
const Header = ({ page, totalItems }: { page: number; totalItems: number }) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, toggleTheme } = useTheme();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handleLangChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="w-full mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-pink-300 flex items-center justify-center">
            <span className="font-bold text-purple-800">N</span>
          </div>
          <h1 className="text-xl font-bold text-purple-800">Nailong fans</h1>
          <span className="text-xs text-pink-500">{t('nailong_sticker_collection')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="p-2 rounded-full bg-pink-100 text-purple-600">
              <Languages size={16} />
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
              <a onClick={() => handleLangChange('zh')} href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('switch_to_zh')}</a>
              <a onClick={() => handleLangChange('en')} href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('switch_to_en')}</a>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-pink-100 text-purple-600"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder={t('search_placeholder')}
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
        <span>{t('current_page_info', { page, totalPages, totalItems })}</span>
      </div>
    </header>
  );
};

// 文件卡片组件
const FileCard = ({ file }: { file: Sticker }) => {
  const { t } = useTranslation();
  const modifiedDate = file.created_at ? new Date(file.created_at).toLocaleDateString() : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-transform hover:transform hover:scale-105">
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
        {file.image_url ? (
          <img 
            src={file.image_url} 
            alt={`Sticker ${file.title}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/default/200/200';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            <span className="text-xs">{t('no_preview')}</span>
          </div>
        )}
      </div>
      <div className="p-2 text-xs">
        {file.title && <div className="font-medium text-gray-800 truncate mb-1">{file.title}</div>}
        <div className="flex justify-between text-gray-500 mb-2">
          {modifiedDate && <span>{modifiedDate}</span>}
        </div>
        <div className="flex gap-1">
          <button className="flex-1 py-1 bg-gray-100 text-gray-800 rounded text-xs flex items-center justify-center">
            <Download size={14} className="mr-1" /> {t('download')}
          </button>
          <button className="flex-1 py-1 bg-gray-100 text-gray-800 rounded text-xs flex items-center justify-center">
            <ExternalLink size={14} className="mr-1" /> 
            {t('open')}
          </button>
        </div>
      </div>
    </div>
  );
};

// 分页组件
const Pagination = ({ page, totalItems, onPageChange }: { page: number; totalItems: number; onPageChange: (page: number) => void; }) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button 
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 text-xs border rounded ${
            i === page 
              ? 'border-purple-500 bg-purple-600 text-white' 
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="flex justify-center items-center gap-1 mt-8 mb-4">
      <button onClick={() => handlePageChange(1)} disabled={page === 1} className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">{t('first_page')}</button>
      <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">{t('previous_page')}</button>
      {renderPageNumbers()}
      <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">{t('next_page')}</button>
      <button onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50">{t('last_page')}</button>
    </div>
  );
};

// 页脚组件
const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="mt-auto text-center text-xs text-gray-500 pt-8 pb-4">
      <p>{t('footer_text_1')}</p>
      <p className="mt-1">{t('footer_text_2')}</p>
    </footer>
  );
};

// 主页面组件
export default function Home() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const [files, setFiles] = useState<Sticker[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        const { data, error, count } = await supabase
          .from('stickers')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          throw error;
        }

        if (data) {
          setFiles(data);
          setTotalItems(count || 0);
        }
      } catch (error: any) {
        toast.error(t('fetch_error', { message: error.message }));
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [page]);
  
  return (
    <div className={`min-h-screen bg-pink-50 ${theme === 'dark' ? 'dark bg-gray-900 text-white' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Header page={page} totalItems={totalItems} />
        
        {loading ? (
          <div className="text-center">{t('loading')}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        )}
        
        <Pagination page={page} totalItems={totalItems} onPageChange={setPage} />
        <Footer />
      </div>
    </div>
  );
}
