import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';

import ModalWrapper from '../ModalWrapper';
import Button from '../Button';
import {
  createTeacherLesson,
  deleteTeacherLesson,
  getTeacherLessonsByCourse,
  getTeacherVocabularyLists,
  updateTeacherLesson,
  uploadLessonExercise,
  uploadLessonVideo,
} from '../../service/teacherCourseService';
import { getUser } from '../../service/userService';

const PARTS = [1, 2, 3, 4, 5, 6, 7];

const emptyForm = {
  lessionName: '',
  orderNumber: '',
  partId: '',
  listId: '',
  video: '',
  exercise: '',
};

const pickValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const getBackendOrigin = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';
  return backendUrl.replace(/\/api\/?$/, '');
};

const resolveFileUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const origin = getBackendOrigin();
  return `${origin}/${String(value).replace(/^\/+/, '')}`;
};

const normalizeLesson = (lesson) => ({
  lessionId: pickValue(lesson.lessionId, lesson.lessionID),
  courseId: pickValue(lesson.courseId, lesson.CourseID),
  lessionName: pickValue(lesson.lessionName, lesson.lessionname) || '',
  video: pickValue(lesson.video, lesson.Video) || '',
  orderNumber: pickValue(lesson.orderNumber, lesson.OrderNumber) || '',
  partId: pickValue(lesson.partId, lesson.PartID) || '',
  listId: pickValue(lesson.listId, lesson.ListID) || '',
  exercise: pickValue(lesson.exercise, lesson.Exercise) || '',
  part: lesson.part || null,
});

const CourseLessonManager = ({ show, onClose, course }) => {
  const [activePart, setActivePart] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [teacherId, setTeacherId] = useState('');
  const [vocabLists, setVocabLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const courseId = course?.courseId || course?.CourseID || null;
  const courseName = course?.courseName || course?.CourseName || 'Khóa học';

  const resolveCurrentUserId = async () => {
    const localId = localStorage.getItem('user_id');
    if (localId) return Number(localId);

    const response = await getUser();
    const profile = response?.data || response;
    const userId = Number(profile?.userId || profile?.UserID || 0);
    if (userId) {
      localStorage.setItem('user_id', String(userId));
      return userId;
    }

    throw new Error('Không lấy được thông tin giáo viên hiện tại');
  };

  const loadVocabularyLists = async () => {
    try {
      setLoadingLists(true);
      const currentUserId = teacherId || (await resolveCurrentUserId());
      setTeacherId(String(currentUserId));
      const response = await getTeacherVocabularyLists({ userId: currentUserId });
      const payload = response?.data || response;
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      setVocabLists(rows.map((item) => ({
        listId: item.listId || item.ListID,
        nameList: item.nameList || item.NameList || 'Không tên',
      })));
    } catch (error) {
      setVocabLists([]);
      toast.error(error?.message || 'Không tải được danh sách từ vựng');
    } finally {
      setLoadingLists(false);
    }
  };

  const loadLessons = async (partId = activePart) => {
    if (!courseId) return;
    setLoadingLessons(true);
    try {
      const response = await getTeacherLessonsByCourse({ courseId, partId });
      const payload = response?.data || response;
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      setLessons(rows.map(normalizeLesson));
    } catch (error) {
      setLessons([]);
      toast.error(error?.message || 'Không tải được danh sách bài giảng');
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    if (!show) return;
    setActivePart(1);
    setEditingLessonId(null);
    setForm(emptyForm);
    loadVocabularyLists();
    loadLessons(1);
  }, [show, courseId]);

  useEffect(() => {
    if (!show) return;
    loadLessons(activePart);
  }, [activePart, show]);

  const resetForm = () => {
    setEditingLessonId(null);
    setForm(emptyForm);
  };

  const handleClose = () => {
    resetForm();
    setLessons([]);
    setVocabLists([]);
    setTeacherId('');
    onClose();
  };

  const handleFileUpload = async (file, field) => {
    if (!file) return;

    const isVideo = field === 'video';
    const allowedExtensions = isVideo
      ? ['.mp4', '.webm', '.ogg', '.mov', '.mkv']
      : ['.pdf', '.doc', '.docx'];

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(
        isVideo
          ? 'Vui lòng chọn file video hợp lệ (.mp4, .webm, .ogg, .mov, .mkv)!'
          : 'Vui lòng chọn file bài tập hợp lệ (.pdf, .doc, .docx)!'
      );
      return;
    }

    setUploading(true);
    try {
      const response = isVideo ? await uploadLessonVideo({ file }) : await uploadLessonExercise({ file });
      const payload = response?.data || response;
      const fileUrl = payload?.url || payload?.data?.url;
      if (!fileUrl) {
        throw new Error('Không lấy được URL file');
      }

      setForm((prev) => ({ ...prev, [field]: fileUrl }));
      toast.success('Tải file thành công');
    } catch (error) {
      toast.error(error?.message || 'Tải file thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!courseId) return;

    if (!form.lessionName.trim()) {
      toast.error('Vui lòng nhập tên bài giảng');
      return;
    }

    if (!form.partId) {
      toast.error('Vui lòng chọn Part');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseId,
        lessionName: form.lessionName.trim(),
        orderNumber: form.orderNumber || null,
        partId: Number(form.partId),
        listId: form.listId ? Number(form.listId) : null,
        video: form.video || null,
        exercise: form.exercise || null,
      };

      if (editingLessonId) {
        await updateTeacherLesson({ lessonId: editingLessonId, payload });
        toast.success('Cập nhật bài giảng thành công');
      } else {
        await createTeacherLesson(payload);
        toast.success('Thêm bài giảng thành công');
      }

      resetForm();
      await loadLessons(activePart);
    } catch (error) {
      toast.error(error?.message || 'Lưu bài giảng thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLessonId(lesson.lessionId);
    setForm({
      lessionName: lesson.lessionName || '',
      orderNumber: String(lesson.orderNumber ?? ''),
      partId: String(lesson.partId ?? activePart),
      listId: String(lesson.listId ?? ''),
      video: lesson.video || '',
      exercise: lesson.exercise || '',
    });
    setActivePart(Number(lesson.partId || activePart));
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài giảng này?')) return;
    try {
      await deleteTeacherLesson({ lessonId });
      toast.success('Xóa bài giảng thành công');
      await loadLessons(activePart);
    } catch (error) {
      toast.error(error?.message || 'Xóa bài giảng thất bại');
    }
  };

  const currentLessons = useMemo(() => lessons.filter((lesson) => Number(lesson.partId) === Number(activePart)), [lessons, activePart]);

  return (
    <ModalWrapper show={show} onClose={handleClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl py-6 px-5 w-full max-w-7xl shadow-lg max-h-[95vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Quản lý bài giảng - {courseName}</h2>
            <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa bài giảng theo từng Part TOEIC.</p>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" style={{ color: '#565E6C' }} />
          </button>
        </div>

        <ul className="flex flex-row gap-4 justify-center items-center py-3 cursor-pointer border-b mb-4 overflow-x-auto">
          {PARTS.map((part) => (
            <li
              key={part}
              onClick={() => setActivePart(part)}
              className={`px-2 py-2 text-base font-semibold ${
                activePart === part ? 'text-[#2C99E2] border-b-2 border-[#2C99E2]' : 'text-gray-600'
              }`}
            >
              Part {part}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="border rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-lg">{editingLessonId ? 'Chỉnh sửa bài giảng' : 'Thêm bài giảng mới'}</h3>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Part</label>
              <select
                className="p-3 border rounded-lg"
                value={form.partId}
                onChange={(e) => setForm((prev) => ({ ...prev, partId: e.target.value }))}
              >
                <option value="">-- Chọn part --</option>
                {PARTS.map((part) => (
                  <option key={part} value={part}>
                    Part {part}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Số thứ tự</label>
              <input
                className="p-3 border rounded-lg"
                placeholder="Ví dụ: 1, 2, 3..."
                value={form.orderNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, orderNumber: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Tên bài giảng</label>
              <input
                className="p-3 border rounded-lg"
                placeholder="Nhập tên bài giảng"
                value={form.lessionName}
                onChange={(e) => setForm((prev) => ({ ...prev, lessionName: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Danh sách từ vựng</label>
              <select
                className="p-3 border rounded-lg"
                value={form.listId}
                onChange={(e) => setForm((prev) => ({ ...prev, listId: e.target.value }))}
              >
                <option value="">-- Không chọn --</option>
                {loadingLists ? (
                  <option value="">Đang tải...</option>
                ) : (
                  vocabLists.map((list) => (
                    <option key={list.listId} value={list.listId}>
                      {list.nameList}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Video bài giảng</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0], 'video')}
              />
              {form.video && <span className="text-sm text-gray-500 break-all">{form.video}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Bài tập</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                onChange={(e) => handleFileUpload(e.target.files?.[0], 'exercise')}
              />
              {form.exercise && <span className="text-sm text-gray-500 break-all">{form.exercise}</span>}
            </div>

            <div className="flex justify-end gap-2">
              {editingLessonId && (
                <Button
                  text="Hủy sửa"
                  variant="default"
                  size="sm"
                  onClick={resetForm}
                  disabled={saving || uploading}
                />
              )}
              <Button
                text={saving ? 'Đang lưu...' : editingLessonId ? 'Cập nhật' : 'Thêm bài giảng'}
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={saving || uploading}
              />
            </div>
          </div>

          <div className="border rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-lg">Danh sách bài giảng - Part {activePart}</h3>
            {loadingLessons ? (
              <p className="text-gray-500">Đang tải...</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-center">Số thứ tự</th>
                      <th className="p-3 text-center">Tên bài giảng</th>
                      <th className="p-3 text-center">Danh sách từ vựng</th>
                      <th className="p-3 text-center">Video</th>
                      <th className="p-3 text-center">Bài tập</th>
                      <th className="p-3 text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLessons.map((lesson) => (
                      <tr key={lesson.lessionId} className="border-t align-top">
                        <td className="p-3 text-center">{lesson.orderNumber}</td>
                        <td className="p-3">{lesson.lessionName}</td>
                        <td className="p-3 text-center">
                          {vocabLists.find((item) => String(item.listId) === String(lesson.listId))?.nameList || '---'}
                        </td>
                        <td className="p-3 text-center">
                          {lesson.video ? (
                            <a href={resolveFileUrl(lesson.video)} target="_blank" rel="noreferrer" className="text-[#2C99E2] underline">
                              Xem file
                            </a>
                          ) : (
                            '---'
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {lesson.exercise ? (
                            <a href={resolveFileUrl(lesson.exercise)} target="_blank" rel="noreferrer" className="text-[#2C99E2] underline">
                              Xem file
                            </a>
                          ) : (
                            '---'
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <Button text="Chỉnh sửa" variant="default" size="sm" onClick={() => handleEdit(lesson)} />
                            <Button text="Xóa" variant="delete" size="sm" onClick={() => handleDelete(lesson.lessionId)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentLessons.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-4 text-center text-gray-500">
                          Chưa có bài giảng
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CourseLessonManager;
