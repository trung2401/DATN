import React, { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { toast } from 'react-toastify';
import ModalWrapper from '../ModalWrapper';
import Button from '../Button';
import {
  addQuestionToGroup,
  addSingleQuestionToTest,
  createQuestionGroup,
  deleteQuestionGroup,
  deleteSingleQuestion,
  getQuestionsForManage,
  getQuestionGroupsByPart,
  updateQuestionGroup,
  updateSingleQuestion,
  uploadTestAudio,
  uploadTestImage,
} from '../../service/examService';

const GROUP_PARTS = [3, 4, 6, 7];

const emptySingleForm = {
  orderNumber: '',
  answerCorrect: '',
  answerExplain: '',
  image: '',
  transcript: '',
  audio: '',
  questionContent: '',
  contentAnswerA: '',
  contentAnswerB: '',
  contentAnswerC: '',
  contentAnswerD: '',
};

const emptyGroupForm = {
  orderNumberPart: '',
  dataQuestion: '',
  transcript: '',
};

const emptyEditState = {
  mode: null,
  partId: null,
  questionId: null,
  dataQuestionId: null,
};

const FileUploadField = ({ label, accept, icon, value, onChange, hint = 'Chưa có file nào' }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 transition hover:border-[#25B379] hover:bg-[#f5faff]">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25B379]/10 text-[#25B379]">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="flex-1">
        <label className="block font-semibold text-gray-700 mb-1">{label}</label>
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#25B379] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#1e9a5a]"
        />
      </div>
    </div>

    <div className="mt-3 text-sm font-medium text-gray-500">
      {value ? <span className="break-all">{value}</span> : hint}
    </div>
  </div>
);

const TestQuestionManager = ({ show, onClose, test }) => {
  const [activePart, setActivePart] = useState(1);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editState, setEditState] = useState(emptyEditState);

  const [singleForm, setSingleForm] = useState(emptySingleForm);
  const [groupForm, setGroupForm] = useState(emptyGroupForm);
  const [groupQuestionForm, setGroupQuestionForm] = useState(emptySingleForm);
  const [editSingleForm, setEditSingleForm] = useState(emptySingleForm);
  const [editGroupForm, setEditGroupForm] = useState(emptyGroupForm);
  const [editGroupQuestionForm, setEditGroupQuestionForm] = useState(emptySingleForm);

  const [loadingGroups, setLoadingGroups] = useState(false);
  const [savingSingle, setSavingSingle] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [savingGroupQuestion, setSavingGroupQuestion] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isGroupPart = useMemo(() => GROUP_PARTS.includes(Number(activePart)), [activePart]);

  const resetForms = () => {
    setSingleForm(emptySingleForm);
    setGroupForm(emptyGroupForm);
    setGroupQuestionForm(emptySingleForm);
  };

  const resetEditForms = () => {
    setEditSingleForm(emptySingleForm);
    setEditGroupForm(emptyGroupForm);
    setEditGroupQuestionForm(emptySingleForm);
  };

  const pickValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

  const normalizeTypeOneFields = (source) => ({
    transcript: pickValue(source.transcript, source.Transcript, source.TypeOneQuestion?.Transcript) || '',
    audio: pickValue(source.audio, source.Audio, source.TypeOneQuestion?.Audio) || '',
  });

  const normalizeTypeTwoFields = (source) => ({
    questionContent: pickValue(
      source.questionContent,
      source.QuestionContent,
      source.TypeTwoQuestion?.QuestionContent
    ) || '',
    contentAnswerA: pickValue(
      source.contentAnswerA,
      source.ContentAnswerA,
      source.TypeTwoQuestion?.ContentAnswerA
    ) || '',
    contentAnswerB: pickValue(
      source.contentAnswerB,
      source.ContentAnswerB,
      source.TypeTwoQuestion?.ContentAnswerB
    ) || '',
    contentAnswerC: pickValue(
      source.contentAnswerC,
      source.ContentAnswerC,
      source.TypeTwoQuestion?.ContentAnswerC
    ) || '',
    contentAnswerD: pickValue(
      source.contentAnswerD,
      source.ContentAnswerD,
      source.TypeTwoQuestion?.ContentAnswerD
    ) || '',
  });

  const parseOrderNumber = (value) => {
    const trimmed = String(value ?? '').trim();
    if (!trimmed) return null;
    if (!/^[0-9]+$/.test(trimmed)) return NaN;
    return Number(trimmed);
  };

  const hasDuplicateOrderNumber = (list, orderNumber) => {
    if (orderNumber === null || Number.isNaN(orderNumber)) return false;
    return (list || []).some((item) => Number(item?.orderNumber) === Number(orderNumber));
  };

  const isEditing = Boolean(editState.mode);

  const handleClose = () => {
    setActivePart(1);
    setGroups([]);
    setSelectedGroupId('');
    setQuestions([]);
    setEditState(emptyEditState);
    resetForms();
    resetEditForms();
    onClose();
  };

  const normalizeSingleQuestions = (rows) => rows.map((row) => ({
    questionId: row.questionId,
    partId: row.partId,
    orderNumber: row.orderNumber,
    answerCorrect: row.answerCorrect,
    answerExplain: row.answerExplain,
    image: row.image || '',
    ...normalizeTypeOneFields(row),
    ...normalizeTypeTwoFields(row),
    dataQuestionId: row.dataQuestionId || null,
  }));

  const normalizeGroupQuestions = (rows) => rows.map((group) => ({
    dataQuestionId: pickValue(group.dataQuestionId, group.DataQuestionID),
    partId: pickValue(group.partId, group.PartID),
    dataQuestion: pickValue(group.dataQuestion, group.DataQuestion) || '',
    transcript: pickValue(group.transcript, group.Transcript) || '',
    orderNumber: pickValue(group.orderNumber, group.OrderNumber) || '',
    orderNumberPart: pickValue(group.orderNumberPart, group.OrderNumberPart, group.order, group.OrderNumber) || '',
    questions: (pickValue(group.questions, group.Questions) || []).map((question) => ({
      questionId: pickValue(question.questionId, question.QuestionID),
      orderNumber: pickValue(question.orderNumber, question.OrderNumber),
      answerCorrect: pickValue(question.answerCorrect, question.AnswerCorrect),
      answerExplain: pickValue(question.answerExplain, question.AnswerExplain) || '',
      image: pickValue(question.image, question.Image) || '',
      ...normalizeTypeTwoFields(question),
    }))
  }));

  const loadGroups = async (partId) => {
    if (!test?.idTest && !test?.testId) return;
    setLoadingGroups(true);
    try {
      const testId = test?.idTest || test?.testId;
      const res = await getQuestionGroupsByPart({ testId, partId });
      const payload = res?.data || res;
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
      const normalized = normalizeGroupQuestions(rows);
      setGroups(normalized);
      setSelectedGroupId(normalized[0]?.dataQuestionId ? String(normalized[0].dataQuestionId) : '');
    } catch (error) {
      setGroups([]);
      setSelectedGroupId('');
      toast.error(error?.message || 'Không tải được danh sách cụm câu hỏi');
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadQuestionsForPart = async (partId) => {
    if (!test?.idTest && !test?.testId) return;
    setLoadingQuestions(true);
    try {
      const testId = test?.idTest || test?.testId;
      const res = await getQuestionsForManage({ testId, partId });
      const payload = res?.data || res;
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

      if (GROUP_PARTS.includes(Number(partId))) {
        setQuestions(normalizeGroupQuestions(rows));
      } else {
        setQuestions(normalizeSingleQuestions(rows));
      }
    } catch (error) {
      setQuestions([]);
      toast.error(error?.message || 'Không tải được danh sách câu hỏi');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (!show) return;
    resetForms();
    if (GROUP_PARTS.includes(Number(activePart))) {
      loadGroups(Number(activePart));
      loadQuestionsForPart(Number(activePart));
    } else {
      setGroups([]);
      setSelectedGroupId('');
      loadQuestionsForPart(Number(activePart));
    }
  }, [show, activePart]);

  const handleUploadFile = async (file, field, target = 'single') => {
    if (!file) return;
    setUploading(true);
    try {
      const isAudio = field === 'audio' || ((target === 'group' || target === 'edit-group') && Number(activePart) <= 4);
      const response = isAudio ? await uploadTestAudio({ file }) : await uploadTestImage({ file });
      const payload = response?.data || response;
      const fileUrl = payload?.url || payload?.data?.url;
      if (!fileUrl) throw new Error('Không lấy được đường dẫn file');

      if (target === 'single') {
        setSingleForm((prev) => ({ ...prev, [field]: fileUrl }));
      } else if (target === 'group') {
        setGroupForm((prev) => ({ ...prev, [field]: fileUrl }));
      } else if (target === 'edit-single') {
        setEditSingleForm((prev) => ({ ...prev, [field]: fileUrl }));
      } else if (target === 'edit-group') {
        setEditGroupForm((prev) => ({ ...prev, [field]: fileUrl }));
      } else if (target === 'edit-groupQuestion') {
        setEditGroupQuestionForm((prev) => ({ ...prev, [field]: fileUrl }));
      } else {
        setGroupQuestionForm((prev) => ({ ...prev, [field]: fileUrl }));
      }

      toast.success('Tải file thành công');
    } catch (error) {
      toast.error(error?.message || 'Tải file thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSingleQuestion = async () => {
    const testId = test?.idTest || test?.testId;
    if (!testId) return;

    const orderNumber = parseOrderNumber(singleForm.orderNumber);
    if (orderNumber === null) {
      toast.error('Vui lòng nhập số thứ tự câu hỏi');
      return;
    }
    if (Number.isNaN(orderNumber)) {
      toast.error('Số thứ tự câu hỏi phải là số');
      return;
    }
    if (hasDuplicateOrderNumber(questions, orderNumber)) {
      toast.error('Số thứ tự câu hỏi đã tồn tại');
      return;
    }

    setSavingSingle(true);
    try {
      const payload = {
        partId: Number(activePart),
        orderNumber,
        answerCorrect: singleForm.answerCorrect,
        answerExplain: singleForm.answerExplain,
        image: singleForm.image,
      };

      if ([1, 2].includes(Number(activePart))) {
        payload.typeOne = {
          audio: singleForm.audio,
          transcript: singleForm.transcript,
        };
      }

      if (Number(activePart) === 5) {
        payload.typeTwo = {
          questionContent: singleForm.questionContent,
          contentAnswerA: singleForm.contentAnswerA,
          contentAnswerB: singleForm.contentAnswerB,
          contentAnswerC: singleForm.contentAnswerC,
          contentAnswerD: singleForm.contentAnswerD,
        };
      }

      await addSingleQuestionToTest({ testId, payload });
      toast.success('Thêm câu hỏi thành công');
      setSingleForm(emptySingleForm);
      await loadQuestionsForPart(Number(activePart));
    } catch (error) {
      toast.error(error?.message || 'Thêm câu hỏi thất bại');
    } finally {
      setSavingSingle(false);
    }
  };

  const handleCreateGroup = async () => {
    const testId = test?.idTest || test?.testId;
    if (!testId) return;

    const orderNumberPart = parseOrderNumber(groupForm.orderNumberPart);
    if (orderNumberPart === null) {
      toast.error('Vui lòng nhập số thứ tự cụm');
      return;
    }
    if (Number.isNaN(orderNumberPart)) {
      toast.error('Số thứ tự cụm phải là số');
      return;
    }
    if (hasDuplicateOrderNumber(groups, orderNumberPart)) {
      toast.error('Số thứ tự cụm đã tồn tại');
      return;
    }

    if (!groupForm.dataQuestion && Number(activePart) <= 4) {
      toast.error('Part 3-4 cần audio dùng chung cho cụm');
      return;
    }

    setSavingGroup(true);
    try {
      await createQuestionGroup({
        testId,
        partId: Number(activePart),
        dataQuestion: groupForm.dataQuestion,
        transcript: groupForm.transcript,
        orderNumberPart,
      });
      toast.success('Tạo cụm câu hỏi thành công');
      setGroupForm(emptyGroupForm);
      await loadGroups(Number(activePart));
      await loadQuestionsForPart(Number(activePart));
    } catch (error) {
      toast.error(error?.message || 'Tạo cụm câu hỏi thất bại');
    } finally {
      setSavingGroup(false);
    }
  };

  const handleAddQuestionToGroup = async () => {
    const testId = test?.idTest || test?.testId;
    if (!testId || !selectedGroupId) {
      toast.error('Vui lòng chọn cụm câu hỏi');
      return;
    }

    const orderNumber = parseOrderNumber(groupQuestionForm.orderNumber);
    if (orderNumber === null) {
      toast.error('Vui lòng nhập số thứ tự câu hỏi');
      return;
    }
    if (Number.isNaN(orderNumber)) {
      toast.error('Số thứ tự câu hỏi phải là số');
      return;
    }

    const selectedGroup = groups.find((group) => String(group.dataQuestionId) === String(selectedGroupId));
    if (!selectedGroup) {
      toast.error('Không tìm thấy cụm câu hỏi đã chọn');
      return;
    }
    if (hasDuplicateOrderNumber(selectedGroup.questions, orderNumber)) {
      toast.error('Số thứ tự câu hỏi trong cụm đã tồn tại');
      return;
    }

    setSavingGroupQuestion(true);
    try {
      const payload = {
        orderNumber,
        answerCorrect: groupQuestionForm.answerCorrect,
        answerExplain: groupQuestionForm.answerExplain,
        image: groupQuestionForm.image,
      };

      if ([3, 4].includes(Number(activePart))) {
        payload.typeTwo = {
          questionContent: groupQuestionForm.questionContent,
          contentAnswerA: groupQuestionForm.contentAnswerA,
          contentAnswerB: groupQuestionForm.contentAnswerB,
          contentAnswerC: groupQuestionForm.contentAnswerC,
          contentAnswerD: groupQuestionForm.contentAnswerD,
        };
      }

      if ([6, 7].includes(Number(activePart))) {
        payload.typeTwo = {
          questionContent: groupQuestionForm.questionContent,
          contentAnswerA: groupQuestionForm.contentAnswerA,
          contentAnswerB: groupQuestionForm.contentAnswerB,
          contentAnswerC: groupQuestionForm.contentAnswerC,
          contentAnswerD: groupQuestionForm.contentAnswerD,
        };
      }

      await addQuestionToGroup({
        testId,
        dataQuestionId: selectedGroupId,
        payload,
      });

      toast.success('Thêm câu hỏi vào cụm thành công');
      setGroupQuestionForm(emptySingleForm);
      await loadGroups(Number(activePart));
      await loadQuestionsForPart(Number(activePart));
    } catch (error) {
      toast.error(error?.message || 'Thêm câu hỏi vào cụm thất bại');
    } finally {
      setSavingGroupQuestion(false);
    }
  };

  const handleDeleteSingleQuestion = async (questionId) => {
    const testId = test?.idTest || test?.testId;
    if (!testId) return;

    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await deleteSingleQuestion({ testId, questionId });
      toast.success('Xóa câu hỏi thành công');
      await loadQuestionsForPart(Number(activePart));
    } catch (error) {
      toast.error(error?.message || 'Xóa câu hỏi thất bại');
    }
  };

  const handleDeleteGroup = async (dataQuestionId) => {
    const testId = test?.idTest || test?.testId;
    if (!testId) return;

    if (!window.confirm('Bạn có chắc muốn xóa cụm câu hỏi này?')) return;
    try {
      await deleteQuestionGroup({ testId, dataQuestionId });
      toast.success('Xóa cụm câu hỏi thành công');
      await loadGroups(Number(activePart));
      await loadQuestionsForPart(Number(activePart));
    } catch (error) {
      toast.error(error?.message || 'Xóa cụm câu hỏi thất bại');
    }
  };

  const handleEditSingleQuestion = (question) => {
    setEditState({ mode: 'single', partId: question.partId, questionId: question.questionId, dataQuestionId: question.dataQuestionId });
    setEditSingleForm({
      orderNumber: String(question.orderNumber ?? ''),
      answerCorrect: question.answerCorrect || '',
      answerExplain: question.answerExplain || '',
      image: question.image || '',
      ...normalizeTypeOneFields(question),
      ...normalizeTypeTwoFields(question),
    });
  };

  const handleEditGroup = (group) => {
    setEditState({ mode: 'group', partId: group.partId, questionId: null, dataQuestionId: group.dataQuestionId });
    setEditGroupForm({
      orderNumberPart: String(group.orderNumber ?? group.orderNumberPart ?? ''),
      dataQuestion: group.dataQuestion || '',
      transcript: group.transcript || '',
    });
  };

  const handleEditGroupQuestion = (group, question) => {
    setEditState({ mode: 'group-question', partId: group.partId, questionId: question.questionId, dataQuestionId: group.dataQuestionId });
    setEditGroupQuestionForm({
      orderNumber: String(question.orderNumber ?? ''),
      answerCorrect: question.answerCorrect || '',
      answerExplain: question.answerExplain || '',
      image: question.image || '',
      transcript: '',
      audio: '',
      ...normalizeTypeTwoFields(question),
    });
  };

  const handleSaveEdit = async () => {
    const testId = test?.idTest || test?.testId;
    if (!testId) return;

    try {
      if (editState.mode === 'single') {
        const payload = {
          orderNumber: editSingleForm.orderNumber,
          answerCorrect: editSingleForm.answerCorrect,
          answerExplain: editSingleForm.answerExplain,
          image: editSingleForm.image,
        };

        if ([1, 2].includes(Number(editState.partId))) {
          payload.typeOne = {
            audio: editSingleForm.audio,
            transcript: editSingleForm.transcript,
          };
        }

        if (Number(editState.partId) === 5) {
          payload.typeTwo = {
            questionContent: editSingleForm.questionContent,
            contentAnswerA: editSingleForm.contentAnswerA,
            contentAnswerB: editSingleForm.contentAnswerB,
            contentAnswerC: editSingleForm.contentAnswerC,
            contentAnswerD: editSingleForm.contentAnswerD,
          };
        }

        await updateSingleQuestion({ testId, questionId: editState.questionId, payload });
        toast.success('Cập nhật câu hỏi thành công');
        setEditState(emptyEditState);
        resetEditForms();
        await loadQuestionsForPart(Number(activePart));
      }

      if (editState.mode === 'group') {
        await updateQuestionGroup({
          testId,
          dataQuestionId: editState.dataQuestionId,
          payload: {
            orderNumberPart: editGroupForm.orderNumberPart,
            dataQuestion: editGroupForm.dataQuestion,
            transcript: editGroupForm.transcript,
          },
        });
        toast.success('Cập nhật cụm câu hỏi thành công');
        setEditState(emptyEditState);
        resetEditForms();
        await loadGroups(Number(activePart));
        await loadQuestionsForPart(Number(activePart));
      }

      if (editState.mode === 'group-question') {
        const payload = {
          orderNumber: editGroupQuestionForm.orderNumber,
          answerCorrect: editGroupQuestionForm.answerCorrect,
          answerExplain: editGroupQuestionForm.answerExplain,
          image: editGroupQuestionForm.image,
        };

        payload.typeTwo = {
          questionContent: editGroupQuestionForm.questionContent,
          contentAnswerA: editGroupQuestionForm.contentAnswerA,
          contentAnswerB: editGroupQuestionForm.contentAnswerB,
          contentAnswerC: editGroupQuestionForm.contentAnswerC,
          contentAnswerD: editGroupQuestionForm.contentAnswerD,
        };

        await updateSingleQuestion({ testId, questionId: editState.questionId, payload });
        toast.success('Cập nhật câu hỏi trong cụm thành công');
        setEditState(emptyEditState);
        resetEditForms();
        await loadGroups(Number(activePart));
        await loadQuestionsForPart(Number(activePart));
      }
    } catch (error) {
      toast.error(error?.message || 'Cập nhật thất bại');
    }
  };

  return (
    <ModalWrapper show={show} onClose={handleClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl py-6 px-5 w-full max-w-6xl shadow-lg max-h-[95vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Quản lý câu hỏi - {test?.testName || ''}</h2>
          <button
            onClick={handleClose}
            type="button"
            className="flex items-center justify-center w-8 h-8 hover:bg-gray-200 hover:rounded-lg"
          >
            <FontAwesomeIcon icon="fa-solid fa-xmark" size="lg" style={{ color: '#565E6C' }} />
          </button>
        </div>

        <ul className="flex flex-row gap-4 justify-center items-center py-3 cursor-pointer border-b mb-4">
          {Array.from({ length: 7 }, (_, i) => i + 1).map((part) => (
            <li
              key={part}
              onClick={() => setActivePart(part)}
              className={`px-2 py-2 text-base font-semibold ${
                activePart === part ? 'text-[#25B379] border-b-2 border-[#25B379]' : 'text-gray-600'
              }`}
            >
              Part {part}
            </li>
          ))}
        </ul>

        {!isGroupPart ? (
          <div className="grid grid-cols-1 gap-4">
            <h3 className="font-bold text-lg">Thêm câu hỏi riêng lẻ (Part {activePart})</h3>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-gray-700">Câu hỏi số:</label>
              <input
                className="p-3 border rounded-lg"
                placeholder="Ví dụ: 1, 2, 3..."
                value={singleForm.orderNumber}
                onChange={(e) => setSingleForm((p) => ({ ...p, orderNumber: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="p-3 border rounded-lg"
                placeholder="Đáp án đúng (A/B/C/D)"
                value={singleForm.answerCorrect}
                onChange={(e) => setSingleForm((p) => ({ ...p, answerCorrect: e.target.value }))}
              />
              <input
                className="p-3 border rounded-lg"
                placeholder="Giải thích đáp án"
                value={singleForm.answerExplain}
                onChange={(e) => setSingleForm((p) => ({ ...p, answerExplain: e.target.value }))}
              />
            </div>

            <FileUploadField
              label="Ảnh câu hỏi (nếu có)"
              accept="image/*"
              icon="fa-solid fa-image"
              value={singleForm.image}
              onChange={(e) => handleUploadFile(e.target.files?.[0], 'image', 'single')}
            />

            {[1, 2].includes(Number(activePart)) && (
              <>
                <FileUploadField
                  label="Audio câu hỏi (Part 1-2)"
                  accept="audio/*"
                  icon="fa-solid fa-music"
                  value={singleForm.audio}
                  onChange={(e) => handleUploadFile(e.target.files?.[0], 'audio', 'single')}
                />
                <textarea
                  className="p-3 border rounded-lg"
                  rows={5}
                  placeholder="Transcript"
                  value={singleForm.transcript}
                  onChange={(e) => setSingleForm((p) => ({ ...p, transcript: e.target.value }))}
                />
              </>
            )}

            {Number(activePart) === 5 && (
              <>
                <input
                  className="p-3 border rounded-lg"
                  placeholder="Nội dung câu hỏi"
                  value={singleForm.questionContent}
                  onChange={(e) => setSingleForm((p) => ({ ...p, questionContent: e.target.value }))}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="p-3 border rounded-lg" placeholder="Đáp án A" value={singleForm.contentAnswerA} onChange={(e) => setSingleForm((p) => ({ ...p, contentAnswerA: e.target.value }))} />
                  <input className="p-3 border rounded-lg" placeholder="Đáp án B" value={singleForm.contentAnswerB} onChange={(e) => setSingleForm((p) => ({ ...p, contentAnswerB: e.target.value }))} />
                  <input className="p-3 border rounded-lg" placeholder="Đáp án C" value={singleForm.contentAnswerC} onChange={(e) => setSingleForm((p) => ({ ...p, contentAnswerC: e.target.value }))} />
                  <input className="p-3 border rounded-lg" placeholder="Đáp án D" value={singleForm.contentAnswerD} onChange={(e) => setSingleForm((p) => ({ ...p, contentAnswerD: e.target.value }))} />
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button text={savingSingle ? 'Đang thêm...' : 'Thêm câu hỏi'} variant="primary" size="sm" onClick={handleAddSingleQuestion} disabled={savingSingle || uploading} />
            </div>

            <div className="border rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-lg">Danh sách câu hỏi Part {activePart}</h3>
              {loadingQuestions ? (
                <p className="text-gray-500">Đang tải...</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-center">Số thứ tự</th>
                        <th className="p-3">Đáp án</th>
                        <th className="p-3">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((question) => (
                        <tr key={question.questionId} className="border-t">
                          <td className="p-3 text-center">{question.orderNumber}</td>
                          <td className="p-3 text-center">{question.answerCorrect}</td>
                          <td className="p-3">
                            <div className="flex gap-2 justify-center">
                              <Button text="Chỉnh sửa" variant="default" size="sm" onClick={() => handleEditSingleQuestion(question)} />
                              <Button text="Xóa" variant="delete" size="sm" onClick={() => handleDeleteSingleQuestion(question.questionId)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                      {questions.length === 0 && (
                        <tr><td colSpan="4" className="p-4 text-center text-gray-500">Chưa có câu hỏi</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-lg">Tạo cụm câu hỏi (Part {activePart})</h3>
              <p className="text-sm text-gray-500">
                {Number(activePart) <= 4
                  ? 'Part 3-4: nhập/tải audio dùng chung cho cụm + transcript (nếu có).'
                  : 'Part 6-7: chọn file image dùng chung cho cụm.'}
              </p>

              {Number(activePart) <= 4 ? (
                <FileUploadField
                  label="Audio dùng chung"
                  accept="audio/*"
                  icon="fa-solid fa-music"
                  value={groupForm.dataQuestion}
                  onChange={(e) => handleUploadFile(e.target.files?.[0], 'dataQuestion', 'group')}
                />
              ) : (
                <FileUploadField
                  label="File image dùng chung"
                  accept="image/*"
                  icon="fa-solid fa-image"
                  value={groupForm.dataQuestion}
                  onChange={(e) => handleUploadFile(e.target.files?.[0], 'dataQuestion', 'group')}
                />
              )}

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-gray-700">Số thứ tự</label>
                <input
                  className="p-3 border rounded-lg"
                  placeholder="Ví dụ: 1, 2, 3..."
                  value={groupForm.orderNumberPart}
                  onChange={(e) => setGroupForm((p) => ({ ...p, orderNumberPart: e.target.value }))}
                />
              </div>

              <textarea
                className="p-3 border rounded-lg w-full"
                rows={3}
                placeholder="Transcript cụm (nếu có)"
                value={groupForm.transcript}
                onChange={(e) => setGroupForm((p) => ({ ...p, transcript: e.target.value }))}
              />

              <div className="flex justify-end">
                <Button text={savingGroup ? 'Đang tạo...' : 'Tạo cụm'} variant="primary" size="sm" onClick={handleCreateGroup} disabled={savingGroup || uploading} />
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold mb-2">Danh sách cụm</h4>
                {loadingGroups ? (
                  <p className="text-gray-500">Đang tải...</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {groups.map((group) => (
                      <div key={group.dataQuestionId} className="border rounded-lg p-3">
                        <div className="flex justify-between gap-2 items-start">
                          <div>
                            <p className="font-semibold">Cụm {group.orderNumber || group.orderNumberPart || group.dataQuestionId}</p>
                            <p className="text-sm text-gray-500">Số câu: {group.questions?.length || 0}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button text="Sửa" variant="default" size="sm" onClick={() => handleEditGroup(group)} />
                            <Button text="Xóa" variant="delete" size="sm" onClick={() => handleDeleteGroup(group.dataQuestionId)} />
                          </div>
                        </div>
                        <ul className="mt-2 space-y-2">
                          {(group.questions || []).map((question) => (
                            <li key={question.questionId} className="flex justify-between items-center gap-2 border-t pt-2">
                              <span className="text-sm">Câu {question.orderNumber}: {question.questionContent || question.answerCorrect || ''}</span>
                              <div className="flex gap-2">
                                <Button text="Sửa" variant="default" size="sm" onClick={() => handleEditGroupQuestion(group, question)} />
                                <Button text="Xóa" variant="delete" size="sm" onClick={() => handleDeleteSingleQuestion(question.questionId)} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-xl p-4 space-y-3">
              <h3 className="font-bold text-lg">Thêm câu hỏi vào cụm</h3>
              {loadingGroups ? (
                <p className="text-gray-500">Đang tải cụm...</p>
              ) : (
                <>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                  >
                    <option value="">-- Chọn cụm câu hỏi --</option>
                    {groups.map((g) => (
                      <option key={g.dataQuestionId} value={g.dataQuestionId}>
                        Cụm {g.orderNumber || g.orderNumberPart || g.dataQuestionId} - số câu: {g.questions?.length || 0}
                      </option>
                    ))}
                  </select>

                  <input
                    className="p-3 border rounded-lg w-full"
                    placeholder="Đáp án đúng (A/B/C/D)"
                    value={groupQuestionForm.answerCorrect}
                    onChange={(e) => setGroupQuestionForm((p) => ({ ...p, answerCorrect: e.target.value }))}
                  />

                  <input
                    className="p-3 border rounded-lg w-full"
                    placeholder="Giải thích đáp án"
                    value={groupQuestionForm.answerExplain}
                    onChange={(e) => setGroupQuestionForm((p) => ({ ...p, answerExplain: e.target.value }))}
                  />

                  <FileUploadField
                    label="Ảnh câu hỏi (nếu có)"
                    accept="image/*"
                    icon="fa-solid fa-image"
                    value={groupQuestionForm.image}
                    onChange={(e) => handleUploadFile(e.target.files?.[0], 'image', 'groupQuestion')}
                  />

                  {[3, 4].includes(Number(activePart)) && (
                    <>
                      <input
                        className="p-3 border rounded-lg w-full"
                        placeholder="Nội dung câu hỏi"
                        value={groupQuestionForm.questionContent}
                        onChange={(e) => setGroupQuestionForm((p) => ({ ...p, questionContent: e.target.value }))}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="p-3 border rounded-lg" placeholder="Đáp án A" value={groupQuestionForm.contentAnswerA} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerA: e.target.value }))} />
                        <input className="p-3 border rounded-lg" placeholder="Đáp án B" value={groupQuestionForm.contentAnswerB} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerB: e.target.value }))} />
                        <input className="p-3 border rounded-lg" placeholder="Đáp án C" value={groupQuestionForm.contentAnswerC} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerC: e.target.value }))} />
                        <input className="p-3 border rounded-lg" placeholder="Đáp án D" value={groupQuestionForm.contentAnswerD} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerD: e.target.value }))} />
                      </div>

                    </>
                  )}

                  {[6, 7].includes(Number(activePart)) && (
                    <>
                      <input className="p-3 border rounded-lg w-full" placeholder="Nội dung câu hỏi" value={groupQuestionForm.questionContent} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, questionContent: e.target.value }))} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="p-3 border rounded-lg" placeholder="Đáp án A" value={groupQuestionForm.contentAnswerA} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerA: e.target.value }))} />
                        <input className="p-3 border rounded-lg" placeholder="Đáp án B" value={groupQuestionForm.contentAnswerB} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerB: e.target.value }))} />
                        <input className="p-3 border rounded-lg" placeholder="Đáp án C" value={groupQuestionForm.contentAnswerC} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerC: e.target.value }))} />
                        <input className="p-3 border rounded-lg" placeholder="Đáp án D" value={groupQuestionForm.contentAnswerD} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerD: e.target.value }))} />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end">
                    <Button text={savingGroupQuestion ? 'Đang thêm...' : 'Thêm câu hỏi vào cụm'} variant="primary" size="sm" onClick={handleAddQuestionToGroup} disabled={savingGroupQuestion || uploading} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isEditing && (
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">Chỉnh sửa</h3>
              <Button text="Đóng" variant="default" size="sm" onClick={() => { setEditState(emptyEditState); resetEditForms(); }} />
            </div>

            {editState.mode === 'single' && (
              <div className="grid gap-3">
                <input className="p-3 border rounded-lg" value={editSingleForm.orderNumber} onChange={(e) => setEditSingleForm((p) => ({ ...p, orderNumber: e.target.value }))} placeholder="Câu hỏi số" />
                <input className="p-3 border rounded-lg" value={editSingleForm.answerCorrect} onChange={(e) => setEditSingleForm((p) => ({ ...p, answerCorrect: e.target.value }))} placeholder="Đáp án đúng" />
                <input className="p-3 border rounded-lg" value={editSingleForm.answerExplain} onChange={(e) => setEditSingleForm((p) => ({ ...p, answerExplain: e.target.value }))} placeholder="Giải thích" />
                <FileUploadField
                  label="Ảnh câu hỏi"
                  accept="image/*"
                  icon="fa-solid fa-image"
                  value={editSingleForm.image}
                  onChange={(e) => handleUploadFile(e.target.files?.[0], 'image', 'edit-single')}
                />
                {[1, 2].includes(Number(editState.partId)) && (
                  <>
                    <FileUploadField
                      label="Audio câu hỏi"
                      accept="audio/*"
                      icon="fa-solid fa-music"
                      value={editSingleForm.audio}
                      onChange={(e) => handleUploadFile(e.target.files?.[0], 'audio', 'edit-single')}
                    />
                    <textarea className="p-3 border rounded-lg" rows={5} placeholder="Transcript" value={editSingleForm.transcript} onChange={(e) => setEditSingleForm((p) => ({ ...p, transcript: e.target.value }))} />
                  </>
                )}
                {Number(editState.partId) === 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="p-3 border rounded-lg" value={editSingleForm.questionContent} onChange={(e) => setEditSingleForm((p) => ({ ...p, questionContent: e.target.value }))} placeholder="Nội dung câu hỏi" />
                    <input className="p-3 border rounded-lg" value={editSingleForm.contentAnswerA} onChange={(e) => setEditSingleForm((p) => ({ ...p, contentAnswerA: e.target.value }))} placeholder="Đáp án A" />
                    <input className="p-3 border rounded-lg" value={editSingleForm.contentAnswerB} onChange={(e) => setEditSingleForm((p) => ({ ...p, contentAnswerB: e.target.value }))} placeholder="Đáp án B" />
                    <input className="p-3 border rounded-lg" value={editSingleForm.contentAnswerC} onChange={(e) => setEditSingleForm((p) => ({ ...p, contentAnswerC: e.target.value }))} placeholder="Đáp án C" />
                    <input className="p-3 border rounded-lg" value={editSingleForm.contentAnswerD} onChange={(e) => setEditSingleForm((p) => ({ ...p, contentAnswerD: e.target.value }))} placeholder="Đáp án D" />
                  </div>
                )}
                <div className="flex justify-end">
                  <Button text="Lưu chỉnh sửa" variant="primary" size="sm" onClick={handleSaveEdit} />
                </div>
              </div>
            )}

            {editState.mode === 'group' && (
              <div className="grid gap-3">
                <input className="p-3 border rounded-lg" value={editGroupForm.orderNumberPart} onChange={(e) => setEditGroupForm((p) => ({ ...p, orderNumberPart: e.target.value }))} placeholder="Số thứ tự cụm" />
                {Number(editState.partId) <= 4 ? (
                  <FileUploadField
                    label="Chọn audio dùng chung"
                    accept="audio/*"
                    icon="fa-solid fa-music"
                    value={editGroupForm.dataQuestion}
                    onChange={(e) => handleUploadFile(e.target.files?.[0], 'dataQuestion', 'edit-group')}
                  />
                ) : (
                  <FileUploadField
                    label="File image dùng chung"
                    accept="image/*"
                    icon="fa-solid fa-image"
                    value={editGroupForm.dataQuestion}
                    onChange={(e) => handleUploadFile(e.target.files?.[0], 'dataQuestion', 'edit-group')}
                  />
                )}
                <textarea className="p-3 border rounded-lg" rows={3} value={editGroupForm.transcript} onChange={(e) => setEditGroupForm((p) => ({ ...p, transcript: e.target.value }))} placeholder="Transcript / ghi chú cụm" />
                <div className="flex justify-end">
                  <Button text="Lưu chỉnh sửa" variant="primary" size="sm" onClick={handleSaveEdit} />
                </div>
              </div>
            )}

            {editState.mode === 'group-question' && (
              <div className="grid gap-3">
                <input className="p-3 border rounded-lg" value={editGroupQuestionForm.orderNumber} onChange={(e) => setEditGroupQuestionForm((p) => ({ ...p, orderNumber: e.target.value }))} placeholder="Câu hỏi số" />
                <input className="p-3 border rounded-lg" value={editGroupQuestionForm.answerCorrect} onChange={(e) => setEditGroupQuestionForm((p) => ({ ...p, answerCorrect: e.target.value }))} placeholder="Đáp án đúng" />
                <input className="p-3 border rounded-lg" value={editGroupQuestionForm.answerExplain} onChange={(e) => setEditGroupQuestionForm((p) => ({ ...p, answerExplain: e.target.value }))} placeholder="Giải thích" />
                <FileUploadField
                  label="Ảnh câu hỏi"
                  accept="image/*"
                  icon="fa-solid fa-image"
                  value={editGroupQuestionForm.image}
                  onChange={(e) => handleUploadFile(e.target.files?.[0], 'image', 'edit-groupQuestion')}
                />
                <input className="p-3 border rounded-lg" value={editGroupQuestionForm.questionContent} onChange={(e) => setEditGroupQuestionForm((p) => ({ ...p, questionContent: e.target.value }))} placeholder="Nội dung câu hỏi" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="p-3 border rounded-lg" value={editGroupQuestionForm.contentAnswerA} onChange={(e) => setEditGroupQuestionForm((p) => ({ ...p, contentAnswerA: e.target.value }))} placeholder="Đáp án A" />
                  <input className="p-3 border rounded-lg" value={editGroupQuestionForm.contentAnswerB} onChange={(e) => setEditGroupQuestionForm((p) => ({ ...p, contentAnswerB: e.target.value }))} placeholder="Đáp án B" />
                  <input className="p-3 border rounded-lg" value={editGroupQuestionForm.contentAnswerC} onChange={(e) => setEditGroupQuestionForm((p) => ({ ...p, contentAnswerC: e.target.value }))} placeholder="Đáp án C" />
                  <input className="p-3 border rounded-lg" value={editGroupQuestionForm.contentAnswerD} onChange={(e) => setEditGroupQuestionForm((p) => ({ ...p, contentAnswerD: e.target.value }))} placeholder="Đáp án D" />
                </div>
                <div className="flex justify-end">
                  <Button text="Lưu chỉnh sửa" variant="primary" size="sm" onClick={handleSaveEdit} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default TestQuestionManager;
