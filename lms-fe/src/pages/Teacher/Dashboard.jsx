import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSelector } from 'react-redux';
import StatisticsCard from '../../components/StatisticsCard';
import { getTeacherDashboardStats } from '../../service/teacherDashboardService';

const currencyFormatter = new Intl.NumberFormat('vi-VN');

const formatDateInputValue = (date) => {
  if (!date) return '';
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  return value.toISOString().slice(0, 10);
};

const DashboardTeacher = () => {
  const userInfo = useSelector((state) => state.user.userInfo);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadStats = async ({ startDate: nextStartDate, endDate: nextEndDate } = {}) => {
    setLoading(true);
    setError('');

    try {
      const response = await getTeacherDashboardStats({
        startDate: nextStartDate ?? startDate,
        endDate: nextEndDate ?? endDate,
      });

      const payload = response?.data ?? response;
      setStats(payload);
    } catch (fetchError) {
      setError(fetchError?.message || 'Không tải được dữ liệu dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = useMemo(() => {
    const series = Array.isArray(stats?.revenueSeries) ? stats.revenueSeries : [];
    const maxRevenue = Math.max(1, ...series.map((item) => Number(item.revenue || 0)));
    return series.map((item) => ({
      ...item,
      revenue: Number(item.revenue || 0),
      height: Math.max(8, Math.round((Number(item.revenue || 0) / maxRevenue) * 220)),
    }));
  }, [stats]);

  const handleApplyFilter = async () => {
    await loadStats({ startDate, endDate });
  };

  const totalRevenue = Number(stats?.totalRevenue || 0);
  const totalTests = Number(stats?.totalTests || 0);
  const releasedCourses = Number(stats?.releasedCourses || 0);

  return (
    <main className="max-w-6xl w-full mx-auto space-y-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Dashboard Giáo viên</h1>
        <p className="text-sm text-gray-500 font-medium">
          Xin chào {userInfo?.name || userInfo?.userName || 'giáo viên'} — theo dõi doanh thu, đề thi và khóa học đã phát hành.
        </p>
      </div>

      <section className="border-2 border-gray-200 rounded-xl shadow-sm p-5 bg-white space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
              Từ ngày
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C99E2]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-gray-700">
              Đến ngày
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#2C99E2]"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleApplyFilter}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2C99E2] px-4 py-2.5 font-semibold text-white transition hover:bg-[#2383c5]"
          >
            <FontAwesomeIcon icon="fa-solid fa-filter" />
            Lọc dữ liệu
          </button>
        </div>

        <p className="text-sm text-gray-500">
          {stats?.range?.startDate || stats?.range?.endDate
            ? `Đang xem dữ liệu doanh thu từ ${formatDateInputValue(stats?.range?.startDate || startDate)} đến ${formatDateInputValue(stats?.range?.endDate || endDate)}`
            : 'Đang xem toàn bộ dữ liệu theo thời điểm giáo viên nhận được doanh thu.'}
        </p>

        {loading ? (
          <div className="py-12 text-center text-gray-600 font-semibold">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="py-6 text-center text-red-600 font-semibold">{error}</div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatisticsCard
          icon={<FontAwesomeIcon icon="fa-solid fa-sack-dollar" className="text-3xl text-[#2C99E2]" />}
          value={`${currencyFormatter.format(totalRevenue)} đ`}
          description="Tổng doanh thu giáo viên nhận được"
        />
        <StatisticsCard
          icon={<FontAwesomeIcon icon="fa-solid fa-file-lines" className="text-3xl text-[#2C99E2]" />}
          value={totalTests}
          description="Tổng số đề thi đã tạo"
        />
        <StatisticsCard
          icon={<FontAwesomeIcon icon="fa-solid fa-graduation-cap" className="text-3xl text-[#2C99E2]" />}
          value={releasedCourses}
          description="Tổng số khóa học đã phát hành"
        />
      </section>

      <section className="border-2 border-gray-200 rounded-xl shadow-sm p-5 bg-white space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Biểu đồ doanh thu</h2>
            <p className="text-sm text-gray-500 font-medium">Doanh thu theo ngày nhận tiền.</p>
          </div>
          <div className="text-sm text-gray-500 font-semibold">
            {chartData.length} điểm dữ liệu
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="py-10 text-center text-gray-500 font-medium">
            Không có dữ liệu doanh thu trong khoảng thời gian này.
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex items-end gap-4 min-w-max h-[280px] px-2">
              {chartData.map((item) => (
                <div key={item.date} className="flex flex-col items-center gap-2 w-20">
                  <div className="flex h-[220px] items-end">
                    <div
                      className="w-12 rounded-t-lg bg-gradient-to-t from-[#2C99E2] to-[#7cc4f3] shadow-md"
                      style={{ height: `${item.height}px` }}
                      title={`${item.date}: ${currencyFormatter.format(item.revenue)} đ`}
                    />
                  </div>
                  <div className="text-xs font-semibold text-gray-600 text-center">
                    {item.date}
                  </div>
                  <div className="text-xs font-bold text-[#2C99E2] text-center">
                    {currencyFormatter.format(item.revenue)} đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardTeacher;
