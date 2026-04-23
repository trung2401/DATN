import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxPagesToShow = 6;
  const pages = [];

  // Logic để xác định các trang hiển thị
  if (totalPages <= maxPagesToShow) {
    // Nếu tổng số trang nhỏ hơn hoặc bằng maxPagesToShow, hiển thị tất cả
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Hiển thị trang đầu, trang cuối, trang hiện tại và các trang lân cận
    const leftBound = Math.max(2, currentPage - 1);
    const rightBound = Math.min(totalPages - 1, currentPage + 1);

    // Luôn thêm trang 1
    pages.push(1);

    // Thêm dấu "..." nếu cần
    if (leftBound > 2) {
      pages.push('...');
    }

    // Thêm các trang lân cận
    for (let i = leftBound; i <= rightBound; i++) {
      pages.push(i);
    }

    // Thêm dấu "..."
    if (rightBound < totalPages - 1) {
      pages.push('...');
    }
    // Luôn thêm trang cuối
    if (totalPages > 1) {
      pages.push(totalPages);
    }
  }

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Trước
      </button>

      {pages.map((page, index) => (
        <button
          key={index}
          className={`px-3 py-1.5 rounded-md border cursor-pointer
            ${page === currentPage
              ? 'text-white border border-[#2C99E2] bg-[#2C99E2] font-bold'
              : page === '...'
              ? 'text-gray-600 border-none cursor-default'
              : 'text-[#49719C] border-[#49719C] hover:bg-gray-100 font-semibold'}
          `}
          onClick={() => page !== '...' && onPageChange(page)}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Tiếp
      </button>
    </div>
  );
};



export default Pagination;