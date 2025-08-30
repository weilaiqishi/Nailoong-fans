export const ITEMS_PER_PAGE = 30;

export const Pagination = ({ page, totalItems, onPageChange, itemsPerPage = ITEMS_PER_PAGE, onPageSizeChange }: {
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onPageSizeChange?: (size: number) => void;
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

    if (totalPages > 1) {
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button 
                key={i}
                onClick={() => handlePageChange(i)}
                className={`px-3 py-1 text-xs border rounded ${
                    i === page 
                    ? 'border-purple-500 bg-purple-600 text-white' 
                    : 'border-gray-300 bg-white dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 text-gray-700 hover:bg-gray-50'
                }`}
                >
                {i}
                </button>
            );
        }
    }
    return pageNumbers;
  };

  const pageSizeOptions = [10, 20, 30, 50, 100];

  if (totalPages <= 1 && !onPageSizeChange) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-4 mt-8 mb-4">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {`Total ${totalItems} items`}
      </span>
      <div className="flex items-center gap-2">
        {totalPages > 1 && (
            <>
                <button onClick={() => handlePageChange(1)} disabled={page === 1} className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:disabled:opacity-30">First</button>
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:disabled:opacity-30">Prev</button>
                {renderPageNumbers()}
                <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:disabled:opacity-30">Next</button>
                <button onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} className="px-3 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:disabled:opacity-30">Last</button>
            </>
        )}
        {onPageSizeChange && (
            <div className="flex items-center gap-2">
            <select
                value={itemsPerPage}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
                {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                    {`${size} / page`}
                </option>
                ))}
            </select>
            </div>
        )}
      </div>
    </div>
  );
};