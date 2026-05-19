import React, { useMemo, useState, useEffect } from "react";
import StatisticsCard from "../../components/StatisticsCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Pagination from "../../components/Pagination";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchNumberOfTests,
  fetchNumberOfUsers,
  fetchAllHistoryTests,
  fetchTransaction,
  fetchRevenue
} from "../../redux/slice/adminSlice";
const Dashboard = () => {
  const {
    numberOfUsers,
    numberOfTests,
    historyTests,
    revenue,
    loading,
    loadingRevenue,
    transactions,
    errorHistoryTest,
  } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const [revenueStartDate, setRevenueStartDate] = useState("");
  const [revenueEndDate, setRevenueEndDate] = useState("");

  const formatDateInputValue = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";
    return parsedDate.toISOString().slice(0, 10);
  };

  useEffect(() => {
    dispatch(fetchNumberOfTests()).unwrap();
    dispatch(fetchNumberOfUsers()).unwrap();
    dispatch(fetchAllHistoryTests());
    dispatch(fetchTransaction());
    dispatch(fetchRevenue());
  }, [dispatch]);

  const chartData = useMemo(() => {
    const series = Array.isArray(revenue?.revenueSeries) ? revenue.revenueSeries : [];
    const maxRevenue = Math.max(1, ...series.map((item) => Number(item.revenue || 0)));

    return series.map((item) => ({
      ...item,
      revenue: Number(item.revenue || 0),
      height: Math.max(8, Math.round((Number(item.revenue || 0) / maxRevenue) * 220)),
    }));
  }, [revenue]);

  const handleFilterRevenue = () => {
    dispatch(fetchRevenue({ startDate: revenueStartDate, endDate: revenueEndDate }));
  };

  const [currentPagePayments, setCurrentPagePayments] = useState(1);
  const [currentPageExams, setCurrentPageExams] = useState(1);
  const itemsPerPage = 5;

  const totalPayments = transactions.length;
  const totalPaymentPages = Math.ceil(totalPayments / itemsPerPage);
  const startIndexPayments = (currentPagePayments - 1) * itemsPerPage;
  const endIndexPayments = startIndexPayments + itemsPerPage;
  const currentPayments = transactions.slice(
    startIndexPayments,
    endIndexPayments
  );

  const totalExams = historyTests.length;
  const totalExamPages = Math.ceil(totalExams / itemsPerPage);
  const startIndexExams = (currentPageExams - 1) * itemsPerPage;
  const endIndexExams = startIndexExams + itemsPerPage;
  const currentExams = historyTests.slice(startIndexExams, endIndexExams);
  return (
    <main className="max-w-6xl w-full mx-auto space-y-6 p-4">
      <section className="flex flex-col space-y-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {loading ? (
          <div className="text-lg text-center font-semibold text-gray-600">
            Đang tải dữ liệu...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center items-center">
            <StatisticsCard
              icon={
                <FontAwesomeIcon
                  icon="fa-solid fa-file"
                  size="4x"
                  style={{ color: "#25B379" }}
                />
              }
              value={numberOfTests}
              description="Số lượng đề thi"
            />
            <StatisticsCard
              icon={
                <FontAwesomeIcon
                  icon="fa-solid fa-dollar-sign"
                  size="4x"
                  style={{ color: "#25B379" }}
                />
              }
              value={formatCurrency(revenue.totalAmount)}
              description="Doanh thu"
            />
            <StatisticsCard
              icon={
                <FontAwesomeIcon
                  icon="fa-solid fa-users"
                  size="4x"
                  style={{ color: "#25B379" }}
                />
              }
              value={numberOfUsers}
              description="Người dùng"
            />
          </div>
        )}
      </section>

      <section className="space-y-4 border-2 border-gray-200 rounded-lg px-10 py-8 shadow-xl bg-white">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
              Từ ngày
              <input
                type="date"
                value={revenueStartDate}
                onChange={(event) => setRevenueStartDate(event.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#25B379]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
              Đến ngày
              <input
                type="date"
                value={revenueEndDate}
                onChange={(event) => setRevenueEndDate(event.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#25B379]"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleFilterRevenue}
            className="inline-flex items-center justify-center rounded-lg bg-[#25B379] px-4 py-2.5 font-semibold text-white transition hover:bg-[#1e9a5a]"
          >
            Lọc doanh thu
          </button>
        </div>

        <p className="text-sm text-gray-500 font-medium">
          {revenue?.range?.startDate || revenue?.range?.endDate
            ? `Đang xem doanh thu từ ${formatDateInputValue(revenue?.range?.startDate || revenueStartDate)} đến ${formatDateInputValue(revenue?.range?.endDate || revenueEndDate)}`
            : "Đang xem toàn bộ doanh thu đã xác nhận."}
        </p>

        {loadingRevenue ? (
          <div className="py-8 text-center font-semibold text-gray-600">Đang tải doanh thu...</div>
        ) : chartData.length === 0 ? (
          <div className="py-8 text-center font-semibold text-gray-500">
            Không có dữ liệu doanh thu trong khoảng thời gian này.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-4 min-w-max h-[280px] px-2">
              {chartData.map((item) => (
                <div key={item.date} className="flex flex-col items-center gap-2 w-20">
                  <div className="flex h-[220px] items-end">
                    <div
                      className="w-12 rounded-t-lg bg-gradient-to-t from-[#25B379] to-[#7cc4f3] shadow-md"
                      style={{ height: `${item.height}px` }}
                      title={`${item.date}: ${formatCurrency(item.revenue)}`}
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-600 text-center">
                    {item.date}
                  </div>
                  <div className="text-xs font-bold text-[#25B379] text-center">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Hoạt động gần đây</h1>
        <div className="space-y-6 border-2 border-gray-200 rounded-lg px-10 py-8 shadow-xl">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold mb-2">Giao dịch gần đây</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
                <thead className="bg-gray-200">
                  <tr className="text-black font-bold">
                    <th className="py-3 px-4">ID Khóa học</th>
                    <th className="py-3 px-4">Tên người dùng</th>
                    <th className="py-3 px-4">Thành tiền</th>
                    <th className="py-3 px-4">Ngày đăng ký</th>
                    <th className="py-3 px-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPayments.map((payment) => (
                    <tr key={payment.registerCourseId || `${payment.id}-${payment.date}`} className="hover:bg-gray-100">
                      <td className="px-4 py-2 text-gray-600 font-semibold">
                        {payment.id}
                      </td>
                      <td className="px-4 py-2 text-gray-600 font-semibold">
                        {payment.userName}
                      </td>
                      <td className="px-4 py-2 font-bold text-[#25B379]">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-2 text-gray-600 font-semibold">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-4 py-2 font-semibold">
                        {payment.status === "confirmed" || payment.status === "confirned"
                          ? "Đã xác nhận"
                          : payment.status === "cancel"
                            ? "Đã hủy bỏ"
                            : "Chờ xác nhận"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPayments > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {startIndexPayments + 1} đến{" "}
                  {Math.min(endIndexPayments, totalPayments)} trong số{" "}
                  {totalPayments} giao dịch
                </span>
                <Pagination
                  currentPage={currentPagePayments}
                  totalPages={totalPaymentPages}
                  onPageChange={(page) => setCurrentPagePayments(page)}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold mb-2">
              Lịch sử làm đề gần đây
            </h2>
            {loading ? (
              <div className="text-lg text-center font-semibold text-gray-600">
                Đang tải dữ liệu...
              </div>
            ) : errorHistoryTest ? (
              <div className="text-lg text-center font-semibold text-red-600">
                Lỗi khi tải lịch sử làm đề
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
                    <thead className="bg-gray-200">
                      <tr className="text-black font-bold">
                        <th className="py-3 px-4">Tên đề thi</th>
                        <th className="px-4 py-2">Tên người dùng</th>
                        <th className="px-4 py-2">Điểm số</th>
                        <th className="py-3 px-4">Ngày làm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentExams.map((exam) => (
                        <tr key={exam.idTestHistory} className="hover:bg-gray-100">
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {exam.testName}
                          </td>
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {exam.userName}
                          </td>
                          <td className="px-4 py-2 font-bold text-[#25B379]">
                            {exam.score}/990
                          </td>
                          <td className="px-4 py-2 font-semibold text-gray-600">
                            {exam.dateTest ? String(exam.dateTest).split("T")[0] : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalExams > 0 && (
                  <div className="flex justify-between items-center p-4">
                    <span className="text-sm text-gray-600 font-semibold">
                      Hiển thị từ {startIndexExams + 1} đến{" "}
                      {Math.min(endIndexExams, totalExams)} trong số{" "}
                      {totalExams} bài thi
                    </span>
                    <Pagination
                      currentPage={currentPageExams}
                      totalPages={totalExamPages}
                      onPageChange={(page) => setCurrentPageExams(page)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
