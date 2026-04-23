import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DashboardTeacher = () => {
  return (
    <main className="max-w-6xl w-full mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Dashboard Giáo viên</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3 text-[#2C99E2]">
            <FontAwesomeIcon icon="fa-solid fa-file-lines" className="text-xl" />
            <h2 className="font-bold">Quản lý đề thi</h2>
          </div>
          <p className="mt-3 text-gray-600 font-medium">
            Tạo đề thi, chỉnh sửa đề thi, khóa/mở đề thi và quản lý cụm câu hỏi theo từng part.
          </p>
        </div>

        <div className="border-2 border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3 text-[#2C99E2]">
            <FontAwesomeIcon icon="fa-solid fa-list-check" className="text-xl" />
            <h2 className="font-bold">Phạm vi quyền</h2>
          </div>
          <p className="mt-3 text-gray-600 font-medium">
            Giáo viên chỉ thao tác với đề thi do chính mình tạo.
          </p>
        </div>
      </section>
    </main>
  );
};

export default DashboardTeacher;
