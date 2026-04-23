import React, { useState, useEffect } from "react";
import SearchBar from "../../components/SearchBar";
import Button from "../../components/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PackageForm from "../../components/Admin/PackageForm";
import ModalConfirm from "../../components/ConfirmModal";
import DetailPayment from "../../components/Admin/DetailPayment";
import Pagination from "../../components/Pagination";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRevenue,
  fetchTransaction,
  fetchConfirmRegisterCourse,
  fetchCancelRegisterCourse,
} from "../../redux/slice/adminSlice";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";
import { toast } from "react-toastify";
const ManagePayment = () => {
  const {
    revenue,
    transactions,
    loadingRevenue,
    loadingTransaction,
    errorRevenue,
    errorTransaction,
  } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchRevenue());
    dispatch(fetchTransaction());
  }, [dispatch]);

  

  const [currentPagePayments, setCurrentPagePayments] = useState(1);
  const [searchQueryPayments, setSearchQueryPayments] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const itemsPerPage = 4;

  // Search payment
  const filteredPayments = transactions.filter((payment) => {
    const userId = String(payment.userId ?? "");
    const courseId = String(payment.courseId ?? "");
    const userName = String(payment.userName ?? "");
    const query = searchQueryPayments.toLowerCase();
    return (
      userId.toLowerCase().includes(query) ||
      courseId.toLowerCase().includes(query) ||
      userName.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    setCurrentPagePayments(1);
  }, [searchQueryPayments]);

  const totalPayments = filteredPayments.length;
  const totalPaymentPages = Math.max(1, Math.ceil(totalPayments / itemsPerPage));
  const startIndexPayments = (currentPagePayments - 1) * itemsPerPage;
  const endIndexPayments = startIndexPayments + itemsPerPage;
  const currentPayments = filteredPayments.slice(
    startIndexPayments,
    endIndexPayments
  );
  const displayStart = totalPayments === 0 ? 0 : startIndexPayments + 1;
  const displayEnd = totalPayments === 0 ? 0 : Math.min(endIndexPayments, totalPayments);

  useEffect(() => {
    if (currentPagePayments > totalPaymentPages) {
      setCurrentPagePayments(totalPaymentPages);
    }
  }, [currentPagePayments, totalPaymentPages]);

  const handleConfirm = async (registerCourseId) => {
    if (!registerCourseId) return;

    try {
      setProcessingId(registerCourseId);
      await dispatch(fetchConfirmRegisterCourse({ registerCourseId })).unwrap();
      await dispatch(fetchTransaction()).unwrap();
      await dispatch(fetchRevenue()).unwrap();
      toast.success("Xác nhận giao dịch thành công");
    } catch (error) {
      toast.error(error || "Xác nhận giao dịch thất bại");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (registerCourseId) => {
    if (!registerCourseId) return;

    try {
      setProcessingId(registerCourseId);
      await dispatch(fetchCancelRegisterCourse({ registerCourseId })).unwrap();
      await dispatch(fetchTransaction()).unwrap();
      await dispatch(fetchRevenue()).unwrap();
      toast.success("Hủy giao dịch thành công");
    } catch (error) {
      toast.error(error || "Hủy giao dịch thất bại");
    } finally {
      setProcessingId(null);
    }
  };

 

  return (
    <main className="max-w-[92rem] w-full mx-auto space-y-6 p-4">
      <h1 className="text-2xl font-bold">Quản lý thanh toán</h1>
      <section className="mx-auto max-w-4xl flex flex-col space-y-3">
        {loadingRevenue ? (
          <div className="text-center font-semibold text-lg text-gray-600">
            Đang tải...
          </div>
        ) : errorRevenue ? (
          <div className="text-center font-semibold text-lg text-red-600">
            {errorRevenue}
          </div>
        ) : (
          <>
            <div className="flex border-2 border-gray-200 rounded-xl space-x-5 shadow-md p-5 items-center justify-around">
              <div className="flex gap-2 items-center justify-center text-md text-gray-600 font-semibold">
                <span>Tổng số giao dịch:</span>
                <span className="font-bold text-[#2C99E2]">
                  {Number(revenue?.numberTransaction || 0)}
                </span>
              </div>
              <div className="flex gap-2 items-center text-md justify-center text-gray-600 font-semibold">
                <span>Doanh thu:</span>
                <span className="font-bold text-[#2C99E2]">
                  {formatCurrency(Number(revenue?.totalAmount || 0))}
                </span>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="w-full flex flex-col py-5 px-8 gap-5 border-2 border-gray-200 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold">Danh sách giao dịch</h1>
        <div className="flex flex-row gap-4 w-full px-6">
          <SearchBar
            text="Tìm kiếm theo ID học viên, ID khóa học hoặc tên"
            focusBorderColor="focus:ring-gray-400"
            value={searchQueryPayments}
            onChange={(e) => setSearchQueryPayments(e.target.value)}
          />
        </div>
        {loadingTransaction ? (
          <div className="text-center font-semibold text-lg text-gray-600">
            Đang tải...
          </div>
        ) : errorTransaction ? (
          <div className="text-center font-semibold text-lg text-red-600">
            {errorTransaction}
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1200px] text-center border-2 border-gray-300 rounded-2xl overflow-hidden border-separate border-spacing-0">
              <thead className="bg-gray-200">
                <tr className="text-black font-bold">
                  <th className="py-3 px-4">ID học viên</th>
                  <th className="py-3 px-4">Tên người dùng</th>
                  <th className="py-3 px-4">ID khóa học</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Tiền trả GV</th>
                  <th className="py-3 px-4">Ngày đăng ký</th>
                  <th className="py-3 px-4">Ngày xác nhận</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.length > 0 ? (
                  currentPayments.map((payment) => (
                    <tr key={payment.registerCourseId ?? `${payment.id}-${payment.date}`} className="hover:bg-gray-100">
                      <td className="px-4 py-4 text-gray-600 font-semibold">
                        {payment.userId ?? "N/A"}
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-semibold">
                        {payment.userName ?? "N/A"}
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-semibold">
                        {payment.courseId ?? "N/A"}
                      </td>
                      <td className="px-4 py-4 font-bold text-[#2C99E2]">
                        {formatCurrency(payment.totalAmount)}
                      </td>
                      <td className="px-4 py-4 font-bold text-[#2C99E2]">
                        {formatCurrency(payment.totalAmountOfTeacher)}
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-semibold">
                        {formatDate(payment.date)}
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-semibold">
                        {payment.confirmDate
                          ? formatDate(payment.confirmDate)
                          : "Chờ xác nhận"}
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-semibold">
                        {payment.status === "pending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              text="Xác nhận"
                              variant="primary"
                              size="sm"
                              disabled={processingId === payment.registerCourseId}
                              onClick={() => handleConfirm(payment.registerCourseId)}
                            />
                            <Button
                              text="Hủy"
                              variant="delete"
                              size="sm"
                              disabled={processingId === payment.registerCourseId}
                              onClick={() => handleCancel(payment.registerCourseId)}
                            />
                          </div>
                        ) : (
                          <span
                            className={`font-semibold ${
                              payment.status === "confirmed"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {payment.status === "confirmed"
                              ? "Đã xác nhận"
                              : "Đã hủy"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-4 text-gray-600 font-semibold"
                    >
                      Không tìm thấy giao dịch phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
            {totalPayments > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {displayStart} đến{" "}
                  {displayEnd} trong số{" "}
                  {totalPayments} giao dịch
                </span>
                <Pagination
                  currentPage={currentPagePayments}
                  totalPages={totalPaymentPages}
                  onPageChange={(page) => setCurrentPagePayments(page)}
                />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};

export default ManagePayment;
