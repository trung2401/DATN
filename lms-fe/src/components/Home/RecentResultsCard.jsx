import React, { useState } from "react";
import Button from "../Button.jsx";
import Pagination from "../Pagination.jsx";
import { Link } from "react-router-dom";
import formatDate from "../../utils/formatDate.js";
const RecentResultsCard = ({ data }) => {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-5xl w-full mx-auto border-2 border-gray-200 rounded-2xl shadow-lg px-8 py-6">
      <table className="w-full text-center border-2 border-gray-200 shadow-lg rounded-2xl border-separate border-spacing-0 overflow-hidden">
        <thead className="bg-gray-200">
          <tr className="text-black font-bold">
            <th className="py-3 px-4">Tên đề thi</th>
            <th className="py-3 px-4">Điểm số</th>
            <th className="py-3 px-4">Ngày nộp bài</th>
            <th className="py-3 px-4">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((result, index) => (
            <tr key={index} className="hover:bg-[#E6F0FA]">
              <td className="py-3 px-4 text-gray-600 font-medium">
                {result.nameTest}
              </td>
              <td className="py-3 px-4 text-[#2C99E2] font-bold">
                {`${result.score}/${result.total}`}
              </td>
              <td className="py-3 px-4 text-gray-600 font-medium">
                {formatDate(result.date)}
              </td>
              <td className="py-3 px-4">
                <Link to={`/exam/result/${result.idTestHistory}`}>
                  <Button text="Xem chi tiết" variant="primary" size="sm" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Phân trang */}
      {data.length > itemsPerPage && (
        <div className="py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default RecentResultsCard;
