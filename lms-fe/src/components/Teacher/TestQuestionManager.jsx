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

  const pickValue = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

  const isEditing = Boolean(editState.mode);

  const handleClose = () => {
    setActivePart(1);
    setGroups([]);
    setSelectedGroupId('');
    setQuestions([]);
    setEditState(emptyEditState);
    resetForms();
    onClose();
  };

  const normalizeSingleQuestions = (rows) => rows.map((row) => ({
    questionId: row.questionId,
    partId: row.partId,
    orderNumber: row.orderNumber,
    answerCorrect: row.answerCorrect,
    answerExplain: row.answerExplain,
    image: row.image || '',
    audio: row.audio || '',
    transcript: row.transcript || '',
    questionContent: row.questionContent || '',
    contentAnswerA: row.contentAnswerA || '',
    contentAnswerB: row.contentAnswerB || '',
    contentAnswerC: row.contentAnswerC || '',
    contentAnswerD: row.contentAnswerD || '',
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
      questionContent: pickValue(question.questionContent, question.QuestionContent) || '',
      contentAnswerA: pickValue(question.contentAnswerA, question.ContentAnswerA) || '',
      contentAnswerB: pickValue(question.contentAnswerB, question.ContentAnswerB) || '',
      contentAnswerC: pickValue(question.contentAnswerC, question.ContentAnswerC) || '',
      contentAnswerD: pickValue(question.contentAnswerD, question.ContentAnswerD) || '',
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
      const isAudio = field === 'audio' || (target === 'group' && Number(activePart) <= 4);
      const response = isAudio ? await uploadTestAudio({ file }) : await uploadTestImage({ file });
      const payload = response?.data || response;
      const fileUrl = payload?.url || payload?.data?.url;
      if (!fileUrl) throw new Error('Không lấy được đường dẫn file');

      if (target === 'single') {
        setSingleForm((prev) => ({ ...prev, [field]: fileUrl }));
      } else if (target === 'group') {
        setGroupForm((prev) => ({ ...prev, [field]: fileUrl }));
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

    setSavingSingle(true);
    try {
      const payload = {
        partId: Number(activePart),
        orderNumber: singleForm.orderNumber,
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
        orderNumberPart: groupForm.orderNumberPart,
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

    setSavingGroupQuestion(true);
    try {
      const payload = {
        orderNumber: groupQuestionForm.orderNumber,
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
    setSingleForm({
      orderNumber: String(question.orderNumber ?? ''),
      answerCorrect: question.answerCorrect || '',
      answerExplain: question.answerExplain || '',
      image: question.image || '',
      transcript: question.transcript || '',
      audio: question.audio || '',
      questionContent: question.questionContent || '',
      contentAnswerA: question.contentAnswerA || '',
      contentAnswerB: question.contentAnswerB || '',
      contentAnswerC: question.contentAnswerC || '',
      contentAnswerD: question.contentAnswerD || '',
    });
  };

  const handleEditGroup = (group) => {
    setEditState({ mode: 'group', partId: group.partId, questionId: null, dataQuestionId: group.dataQuestionId });
    setGroupForm({
      orderNumberPart: String(group.orderNumber ?? group.orderNumberPart ?? ''),
      dataQuestion: group.dataQuestion || '',
      transcript: group.transcript || '',
    });
  };

  const handleEditGroupQuestion = (group, question) => {
    setEditState({ mode: 'group-question', partId: group.partId, questionId: question.questionId, dataQuestionId: group.dataQuestionId });
    setGroupQuestionForm({
      orderNumber: String(question.orderNumber ?? ''),
      answerCorrect: question.answerCorrect || '',
      answerExplain: question.answerExplain || '',
      image: question.image || '',
      transcript: '',
      audio: '',
      questionContent: question.questionContent || '',
      contentAnswerA: question.contentAnswerA || '',
      contentAnswerB: question.contentAnswerB || '',
      contentAnswerC: question.contentAnswerC || '',
      contentAnswerD: question.contentAnswerD || '',
    });
  };

  const handleSaveEdit = async () => {
    const testId = test?.idTest || test?.testId;
    if (!testId) return;

    try {
      if (editState.mode === 'single') {
        const payload = {
          orderNumber: singleForm.orderNumber,
          answerCorrect: singleForm.answerCorrect,
          answerExplain: singleForm.answerExplain,
          image: singleForm.image,
        };

        if ([1, 2].includes(Number(editState.partId))) {
          payload.typeOne = {
            audio: singleForm.audio,
            transcript: singleForm.transcript,
          };
        }

        if (Number(editState.partId) === 5) {
          payload.typeTwo = {
            questionContent: singleForm.questionContent,
            contentAnswerA: singleForm.contentAnswerA,
            contentAnswerB: singleForm.contentAnswerB,
            contentAnswerC: singleForm.contentAnswerC,
            contentAnswerD: singleForm.contentAnswerD,
          };
        }

        await updateSingleQuestion({ testId, questionId: editState.questionId, payload });
        toast.success('Cập nhật câu hỏi thành công');
        setEditState(emptyEditState);
        resetForms();
        await loadQuestionsForPart(Number(activePart));
      }

      if (editState.mode === 'group') {
        await updateQuestionGroup({
          testId,
          dataQuestionId: editState.dataQuestionId,
          payload: {
            orderNumberPart: groupForm.orderNumberPart,
            dataQuestion: groupForm.dataQuestion,
            transcript: groupForm.transcript,
          },
        });
        toast.success('Cập nhật cụm câu hỏi thành công');
        setEditState(emptyEditState);
        resetForms();
        await loadGroups(Number(activePart));
        await loadQuestionsForPart(Number(activePart));
      }

      if (editState.mode === 'group-question') {
        const payload = {
          orderNumber: groupQuestionForm.orderNumber,
          answerCorrect: groupQuestionForm.answerCorrect,
          answerExplain: groupQuestionForm.answerExplain,
          image: groupQuestionForm.image,
        };

        payload.typeTwo = {
          questionContent: groupQuestionForm.questionContent,
          contentAnswerA: groupQuestionForm.contentAnswerA,
          contentAnswerB: groupQuestionForm.contentAnswerB,
          contentAnswerC: groupQuestionForm.contentAnswerC,
          contentAnswerD: groupQuestionForm.contentAnswerD,
        };

        await updateSingleQuestion({ testId, questionId: editState.questionId, payload });
        toast.success('Cập nhật câu hỏi trong cụm thành công');
        setEditState(emptyEditState);
        resetForms();
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
                activePart === part ? 'text-[#2C99E2] border-b-2 border-[#2C99E2]' : 'text-gray-600'
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

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-700">Ảnh câu hỏi (nếu có)</label>
              <input type="file" accept="image/*" onChange={(e) => handleUploadFile(e.target.files?.[0], 'image', 'single')} />
              {singleForm.image && <span className="text-sm text-gray-500">{singleForm.image}</span>}
            </div>

            {[1, 2].includes(Number(activePart)) && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Audio câu hỏi (Part 1-2)</label>
                  <input type="file" accept="audio/*" onChange={(e) => handleUploadFile(e.target.files?.[0], 'audio', 'single')} />
                  {singleForm.audio && <span className="text-sm text-gray-500">{singleForm.audio}</span>}
                </div>
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
                  : 'Part 6-7: nhập passage dùng chung cho cụm.'}
              </p>

              {Number(activePart) <= 4 ? (
                <input
                  className="p-3 border rounded-lg w-full"
                  placeholder="Đường dẫn audio dùng chung (hoặc upload bên dưới)"
                  value={groupForm.dataQuestion}
                  onChange={(e) => setGroupForm((p) => ({ ...p, dataQuestion: e.target.value }))}
                />
              ) : (
                <textarea
                  className="p-3 border rounded-lg w-full"
                  rows={4}
                  placeholder="Nội dung passage dùng chung"
                  value={groupForm.dataQuestion}
                  onChange={(e) => setGroupForm((p) => ({ ...p, dataQuestion: e.target.value }))}
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

              {Number(activePart) <= 4 && (
                <div>
                  <input type="file" accept="audio/*" onChange={(e) => handleUploadFile(e.target.files?.[0], 'dataQuestion', 'group')} />
                </div>
              )}

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

                  <div>
                    <label className="font-semibold text-gray-700">Ảnh câu hỏi (nếu có)</label>
                    <input type="file" accept="image/*" onChange={(e) => handleUploadFile(e.target.files?.[0], 'image', 'groupQuestion')} />
                    {groupQuestionForm.image && <span className="text-sm text-gray-500">{groupQuestionForm.image}</span>}
                  </div>

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
              <Button text="Đóng" variant="default" size="sm" onClick={() => { setEditState(emptyEditState); resetForms(); }} />
            </div>

            {editState.mode === 'single' && (
              <div className="grid gap-3">
                <input className="p-3 border rounded-lg" value={singleForm.orderNumber} onChange={(e) => setSingleForm((p) => ({ ...p, orderNumber: e.target.value }))} placeholder="Câu hỏi số" />
                <input className="p-3 border rounded-lg" value={singleForm.answerCorrect} onChange={(e) => setSingleForm((p) => ({ ...p, answerCorrect: e.target.value }))} placeholder="Đáp án đúng" />
                <input className="p-3 border rounded-lg" value={singleForm.answerExplain} onChange={(e) => setSingleForm((p) => ({ ...p, answerExplain: e.target.value }))} placeholder="Giải thích" />
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Ảnh câu hỏi</label>
                  <input type="file" accept="image/*" onChange={(e) => handleUploadFile(e.target.files?.[0], 'image', 'single')} />
                  {singleForm.image && <span className="text-sm text-gray-500">{singleForm.image}</span>}
                </div>
                {[1, 2].includes(Number(editState.partId)) && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Audio câu hỏi</label>
                      <input type="file" accept="audio/*" onChange={(e) => handleUploadFile(e.target.files?.[0], 'audio', 'single')} />
                      {singleForm.audio && <span className="text-sm text-gray-500">{singleForm.audio}</span>}
                    </div>
                    <textarea className="p-3 border rounded-lg" rows={5} placeholder="Transcript" value={singleForm.transcript} onChange={(e) => setSingleForm((p) => ({ ...p, transcript: e.target.value }))} />
                  </>
                )}
                {Number(editState.partId) === 5 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="p-3 border rounded-lg" value={singleForm.questionContent} onChange={(e) => setSingleForm((p) => ({ ...p, questionContent: e.target.value }))} placeholder="Nội dung câu hỏi" />
                    <input className="p-3 border rounded-lg" value={singleForm.contentAnswerA} onChange={(e) => setSingleForm((p) => ({ ...p, contentAnswerA: e.target.value }))} placeholder="Đáp án A" />
                    <input className="p-3 border rounded-lg" value={singleForm.contentAnswerB} onChange={(e) => setSingleForm((p) => ({ ...p, contentAnswerB: e.target.value }))} placeholder="Đáp án B" />
                    <input className="p-3 border rounded-lg" value={singleForm.contentAnswerC} onChange={(e) => setSingleForm((p) => ({ ...p, contentAnswerC: e.target.value }))} placeholder="Đáp án C" />
                    <input className="p-3 border rounded-lg" value={singleForm.contentAnswerD} onChange={(e) => setSingleForm((p) => ({ ...p, contentAnswerD: e.target.value }))} placeholder="Đáp án D" />
                  </div>
                )}
                <div className="flex justify-end">
                  <Button text="Lưu chỉnh sửa" variant="primary" size="sm" onClick={handleSaveEdit} />
                </div>
              </div>
            )}

            {editState.mode === 'group' && (
              <div className="grid gap-3">
                <input className="p-3 border rounded-lg" value={groupForm.orderNumberPart} onChange={(e) => setGroupForm((p) => ({ ...p, orderNumberPart: e.target.value }))} placeholder="Số thứ tự cụm" />
                <textarea className="p-3 border rounded-lg" rows={4} value={groupForm.dataQuestion} onChange={(e) => setGroupForm((p) => ({ ...p, dataQuestion: e.target.value }))} placeholder="Nội dung cụm" />
                {Number(editState.partId) <= 4 && (
                  <div>
                    <input type="file" accept="audio/*" onChange={(e) => handleUploadFile(e.target.files?.[0], 'dataQuestion', 'group')} />
                  </div>
                )}
                <textarea className="p-3 border rounded-lg" rows={3} value={groupForm.transcript} onChange={(e) => setGroupForm((p) => ({ ...p, transcript: e.target.value }))} placeholder="Transcript / ghi chú cụm" />
                <div className="flex justify-end">
                  <Button text="Lưu chỉnh sửa" variant="primary" size="sm" onClick={handleSaveEdit} />
                </div>
              </div>
            )}

            {editState.mode === 'group-question' && (
              <div className="grid gap-3">
                <input className="p-3 border rounded-lg" value={groupQuestionForm.orderNumber} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, orderNumber: e.target.value }))} placeholder="Câu hỏi số" />
                <input className="p-3 border rounded-lg" value={groupQuestionForm.answerCorrect} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, answerCorrect: e.target.value }))} placeholder="Đáp án đúng" />
                <input className="p-3 border rounded-lg" value={groupQuestionForm.answerExplain} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, answerExplain: e.target.value }))} placeholder="Giải thích" />
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Ảnh câu hỏi</label>
                  <input type="file" accept="image/*" onChange={(e) => handleUploadFile(e.target.files?.[0], 'image', 'groupQuestion')} />
                  {groupQuestionForm.image && <span className="text-sm text-gray-500">{groupQuestionForm.image}</span>}
                </div>
                <input className="p-3 border rounded-lg" value={groupQuestionForm.questionContent} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, questionContent: e.target.value }))} placeholder="Nội dung câu hỏi" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input className="p-3 border rounded-lg" value={groupQuestionForm.contentAnswerA} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerA: e.target.value }))} placeholder="Đáp án A" />
                  <input className="p-3 border rounded-lg" value={groupQuestionForm.contentAnswerB} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerB: e.target.value }))} placeholder="Đáp án B" />
                  <input className="p-3 border rounded-lg" value={groupQuestionForm.contentAnswerC} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerC: e.target.value }))} placeholder="Đáp án C" />
                  <input className="p-3 border rounded-lg" value={groupQuestionForm.contentAnswerD} onChange={(e) => setGroupQuestionForm((p) => ({ ...p, contentAnswerD: e.target.value }))} placeholder="Đáp án D" />
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
