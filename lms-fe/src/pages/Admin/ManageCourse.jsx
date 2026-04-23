import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import SearchBar from "../../components/SearchBar";
import Button from "../../components/Button";
import Pagination from "../../components/Pagination";
import ModalWrapper from "../../components/ModalWrapper";
import {
  getAllCourses,
  createCourse,
  updateCourseById,
  setStatusCourse,
} from "../../service/adminService";
import formatCurrency from "../../utils/formatCurrency";

const initialForm = {
  courseName: "",
  teacherId: "",
  courseDesc: "",
  duration: "",
  price: "",
  input: "",
  target: "",
  percentSalary: "",
};

const ManageCourse = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingCourseStatus, setEditingCourseStatus] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [editFormData, setEditFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllCourses();
      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];
      setCourses(rows);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Lỗi khi tải danh sách khóa học";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter((course) => {
      const courseId = String(course.courseId ?? "").toLowerCase();
      const name = String(course.courseName ?? "").toLowerCase();
      const teacherName = String(course.teacherName ?? "").toLowerCase();
      return (
        courseId.includes(query) ||
        name.includes(query) ||
        teacherName.includes(query)
      );
    });
  }, [courses, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalCourses = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalCourses / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const validateForm = (values) => {
    const errors = {};

    if (!values.courseName.trim()) errors.courseName = "Vui lòng nhập tên khóa học";
    if (!values.teacherId.trim()) errors.teacherId = "Vui lòng nhập ID giáo viên";
    if (!values.courseDesc.trim()) errors.courseDesc = "Vui lòng nhập mô tả khóa học";
    if (!values.duration.trim()) errors.duration = "Vui lòng nhập thời hạn";
    if (!values.price.trim()) errors.price = "Vui lòng nhập giá";
    if (!values.input.trim()) errors.input = "Vui lòng nhập đầu vào";
    if (!values.target.trim()) errors.target = "Vui lòng nhập đầu ra";
    if (!values.percentSalary.trim()) errors.percentSalary = "Vui lòng nhập % tiền trả giáo viên";

    const teacherId = Number(values.teacherId);
    const price = Number(values.price);
    const percentSalary = Number(values.percentSalary);

    if (values.teacherId.trim() && (!Number.isInteger(teacherId) || teacherId <= 0)) {
      errors.teacherId = "ID giáo viên phải là số nguyên dương";
    }

    if (values.price.trim() && (Number.isNaN(price) || price < 0)) {
      errors.price = "Giá phải là số không âm";
    }

    if (
      values.percentSalary.trim() &&
      (Number.isNaN(percentSalary) || percentSalary < 0 || percentSalary > 100)
    ) {
      errors.percentSalary = "% tiền trả giáo viên phải từ 0 đến 100";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setFormErrors(validateForm(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      setSubmitting(true);
      await createCourse({
        courseName: formData.courseName.trim(),
        teacherId: Number(formData.teacherId),
        courseDesc: formData.courseDesc.trim(),
        duration: formData.duration.trim(),
        price: Number(formData.price),
        input: formData.input.trim(),
        target: formData.target.trim(),
        percentSalary: Number(formData.percentSalary),
      });

      toast.success("Thêm khóa học thành công");
      setShowAddModal(false);
      setFormData(initialForm);
      setFormErrors({});
      await loadCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Thêm khóa học thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    if (submitting) return;
    setShowAddModal(false);
    setFormData(initialForm);
    setFormErrors({});
  };

  const openEditModal = (course) => {
    setEditingCourseId(course.courseId);
    setEditingCourseStatus(Number(course.status ?? 1));
    setEditFormData({
      courseName: String(course.courseName || ""),
      teacherId: String(course.teacherId || ""),
      courseDesc: String(course.courseDesc || ""),
      duration: String(course.duration || ""),
      price: String(course.price ?? ""),
      input: String(course.input || ""),
      target: String(course.target || ""),
      percentSalary: String(course.percentSalary ?? ""),
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (updating) return;
    setShowEditModal(false);
    setEditingCourseId(null);
    setEditingCourseStatus(1);
    setEditFormData(initialForm);
    setEditFormErrors({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    const next = { ...editFormData, [name]: value };
    setEditFormData(next);
    setEditFormErrors(validateForm(next));
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();

    const errors = validateForm(editFormData);
    setEditFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (!editingCourseId) {
      toast.error("Không tìm thấy ID khóa học");
      return;
    }

    try {
      setUpdating(true);
      await updateCourseById({
        courseId: editingCourseId,
        courseName: editFormData.courseName.trim(),
        teacherId: Number(editFormData.teacherId),
        courseDesc: editFormData.courseDesc.trim(),
        duration: editFormData.duration.trim(),
        price: Number(editFormData.price),
        input: editFormData.input.trim(),
        target: editFormData.target.trim(),
        percentSalary: Number(editFormData.percentSalary),
      });

      toast.success("Cập nhật khóa học thành công");
      closeEditModal();
      await loadCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Cập nhật khóa học thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleCourseStatus = async () => {
    if (!editingCourseId) {
      toast.error("Không tìm thấy ID khóa học");
      return;
    }

    const nextStatus = Number(editingCourseStatus) === 1 ? 0 : 1;

    try {
      setUpdating(true);
      await setStatusCourse({
        courseId: editingCourseId,
        status: nextStatus,
      });

      setEditingCourseStatus(nextStatus);
      toast.success(nextStatus === 1 ? "Mở khóa học thành công" : "Đóng khóa học thành công");
      await loadCourses();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Cập nhật trạng thái khóa học thất bại");
    } finally {
      setUpdating(false);
    }
  };

  const displayStart = totalCourses === 0 ? 0 : startIndex + 1;
  const displayEnd = totalCourses === 0 ? 0 : Math.min(endIndex, totalCourses);

  return (
    <main className="max-w-[90rem] w-full mx-auto space-y-6 p-4">
      <section className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý khóa học</h1>
        <Button
          text="Thêm mới"
          variant="primary"
          size="sm"
          icon={<FontAwesomeIcon icon="fa-solid fa-plus" />}
          onClick={() => setShowAddModal(true)}
        />
      </section>

      <section className="flex flex-row justify-between items-end border-2 border-gray-200 p-5 rounded-lg shadow-md">
        <div className="flex flex-row gap-4 w-full">
          <SearchBar
            text="Tìm kiếm bằng ID khóa học, tên khóa học hoặc tên giáo viên"
            focusBorderColor="focus:ring-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      <section className="flex max-h-screen flex-col border-2 text-gray-600 font-semibold border-gray-200 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-4 text-gray-600 font-semibold text-lg">Đang tải...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600 font-semibold text-lg">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left whitespace-nowrap">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tên khóa học</th>
                    <th className="px-4 py-3">Tên giáo viên</th>
                    <th className="px-4 py-3">Thời hạn</th>
                    <th className="px-4 py-3">Giá</th>
                    <th className="px-4 py-3">Số lượng học viên</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCourses.map((course) => (
                    <tr key={course.courseId} className="border-t-2 border-gray-200 hover:bg-gray-100">
                      <td className="px-4 py-2">{course.courseId}</td>
                      <td className="px-4 py-2">{course.courseName || "N/A"}</td>
                      <td className="px-4 py-2 max-w-[280px] truncate" title={course.teacherName || ""}>{course.teacherName || "N/A"}</td>
                      <td className="px-4 py-2">{course.duration || "N/A"}</td>
                      <td className="px-4 py-2 font-bold text-[#2C99E2]">{formatCurrency(Number(course.price || 0))}</td>
                      <td className="px-4 py-2">{Number(course.studentCount || 0)}</td>
                      <td className="px-4 py-2">{Number(course.status) === 1 ? "Đang mở" : "Đã đóng"}</td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          text="Chỉnh sửa"
                          variant="default"
                          size="sm"
                          icon={<FontAwesomeIcon icon="fa-solid fa-pencil" />}
                          onClick={() => openEditModal(course)}
                        />
                      </td>
                    </tr>
                  ))}
                  {currentCourses.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center text-gray-600 font-semibold py-4">
                        Không tìm thấy khóa học.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalCourses > 0 && (
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-600 font-semibold">
                  Hiển thị từ {displayStart} đến {displayEnd} trong số {totalCourses} khóa học
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                />
              </div>
            )}
          </>
        )}
      </section>

      <ModalWrapper show={showAddModal} onClose={closeModal}>
        <form
          onSubmit={handleSubmit}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl mx-auto bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-6 pt-6 pb-6 max-h-[92vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Thêm khóa học</h2>
            <button
              type="button"
              onClick={closeModal}
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200"
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" style={{ color: "#565E6C" }} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Tên khóa học (courseName)</label>
              <input name="courseName" value={formData.courseName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {formErrors.courseName && <span className="text-sm text-red-500">{formErrors.courseName}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">ID giáo viên (teacherID)</label>
              <input name="teacherId" value={formData.teacherId} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {formErrors.teacherId && <span className="text-sm text-red-500">{formErrors.teacherId}</span>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-semibold">Mô tả khóa học (courseDesc)</label>
              <textarea name="courseDesc" value={formData.courseDesc} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {formErrors.courseDesc && <span className="text-sm text-red-500">{formErrors.courseDesc}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Thời hạn (duration)</label>
              <input name="duration" value={formData.duration} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {formErrors.duration && <span className="text-sm text-red-500">{formErrors.duration}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Giá (price)</label>
              <input name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {formErrors.price && <span className="text-sm text-red-500">{formErrors.price}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Đầu vào (input)</label>
              <input name="input" value={formData.input} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {formErrors.input && <span className="text-sm text-red-500">{formErrors.input}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Đầu ra (target)</label>
              <input name="target" value={formData.target} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {formErrors.target && <span className="text-sm text-red-500">{formErrors.target}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">% tiền trả GV (percentSalary)</label>
              <input name="percentSalary" value={formData.percentSalary} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {formErrors.percentSalary && <span className="text-sm text-red-500">{formErrors.percentSalary}</span>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button text="Hủy" variant="default" size="sm" onClick={closeModal} disabled={submitting} />
            <Button text={submitting ? "Đang lưu..." : "Lưu"} variant="primary" size="sm" type="submit" disabled={submitting} />
          </div>
        </form>
      </ModalWrapper>

      <ModalWrapper show={showEditModal} onClose={closeEditModal}>
        <form
          onSubmit={handleUpdateCourse}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl mx-auto bg-white border-2 border-gray-200 shadow-lg rounded-2xl px-6 pt-6 pb-6 max-h-[92vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Cập nhật khóa học</h2>
            <button
              type="button"
              onClick={closeEditModal}
              className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg transition-all duration-200"
            >
              <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" style={{ color: "#565E6C" }} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Tên khóa học (courseName)</label>
              <input name="courseName" value={editFormData.courseName} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {editFormErrors.courseName && <span className="text-sm text-red-500">{editFormErrors.courseName}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">ID giáo viên (teacherID)</label>
              <input name="teacherId" value={editFormData.teacherId} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {editFormErrors.teacherId && <span className="text-sm text-red-500">{editFormErrors.teacherId}</span>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-semibold">Mô tả khóa học (courseDesc)</label>
              <textarea name="courseDesc" value={editFormData.courseDesc} onChange={handleEditChange} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {editFormErrors.courseDesc && <span className="text-sm text-red-500">{editFormErrors.courseDesc}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Thời hạn (duration)</label>
              <input name="duration" value={editFormData.duration} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {editFormErrors.duration && <span className="text-sm text-red-500">{editFormErrors.duration}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Giá (price)</label>
              <input name="price" value={editFormData.price} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {editFormErrors.price && <span className="text-sm text-red-500">{editFormErrors.price}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Đầu vào (input)</label>
              <input name="input" value={editFormData.input} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {editFormErrors.input && <span className="text-sm text-red-500">{editFormErrors.input}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">Đầu ra (target)</label>
              <input name="target" value={editFormData.target} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {editFormErrors.target && <span className="text-sm text-red-500">{editFormErrors.target}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold">% tiền trả GV (percentSalary)</label>
              <input name="percentSalary" value={editFormData.percentSalary} onChange={handleEditChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400" />
              {editFormErrors.percentSalary && <span className="text-sm text-red-500">{editFormErrors.percentSalary}</span>}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              text={Number(editingCourseStatus) === 1 ? "Đóng khóa học" : "Mở khóa học"}
              variant={Number(editingCourseStatus) === 1 ? "delete" : "primary"}
              size="sm"
              onClick={handleToggleCourseStatus}
              disabled={updating}
            />
            <Button text="Hủy" variant="default" size="sm" onClick={closeEditModal} disabled={updating} />
            <Button text={updating ? "Đang cập nhật..." : "Xác nhận"} variant="primary" size="sm" type="submit" disabled={updating} />
          </div>
        </form>
      </ModalWrapper>
    </main>
  );
};

export default ManageCourse;
