import axios from "../utils/axios-customize";

// Lấy tất cả đề thi (có hỗ trợ search)
const getAllTests = ({ search = "" } = {}) => {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const URL_BACKEND = `test/getAllTest${query}`;
  return axios.get(URL_BACKEND);
};

const getTestsByTeacher = ({ userId }) => {
  const URL_BACKEND = `test/getTestByUserID/${userId}`;
  return axios.get(URL_BACKEND);
};

// Lấy đề thi theo năm
const getExamByYear = ({ year }) => {
  const URL_BACKEND = `exam-service/getTestInfo?year=${year}`;
  return axios.get(URL_BACKEND);
};

// Lấy đề thi các năm
const getAllExamByYear = () => {
    const URL_BACKEND = 'exam-service/getYears';
    return axios.get(URL_BACKEND);
  };
// Lấy kết quả khi nộp bài thi
const resultSubmitExam = ({ obj }) => {
  const URL_BACKEND = "exam-service/TestAnswer";
  const data = {
    testId: obj.testId,
    timeDoTest: obj.timeDoTest,
    dateTest: obj.dateTest,
    userAnswers: obj.userAnswers,
    status: obj.status,
  };
  return axios.post(URL_BACKEND, data);
};

const submitTest = ({ historyOfTestID, answers }) => {
  const URL_BACKEND = "test/submit";
  return axios.post(URL_BACKEND, { historyOfTestID, answers });
};

// Lấy ra bài làm những chưa nộp đã rớt mạng
const getExamNotSubmit = ({testId}) => {
  const URL_BACKEND = `exam-service/getHistoryDraftByUserAndTest?testId=${testId}`;
  return axios.get(URL_BACKEND);
};

// Lấy ra chi tiết đề thi
const getExamById = ({ testId }) => {
    const URL_BACKEND = `test/getTest?testId=${testId}`;
    return axios.get(URL_BACKEND);
};

const startTest = ({ testId }) => {
  const URL_BACKEND = `test/${testId}/start`;
  return axios.post(URL_BACKEND);
};

// Lấy ra lịch sử làm bài thi
const getHistoryExam = () => {
    const URL_BACKEND = 'exam-service/getHistoryTestByUser';
    return axios.get(URL_BACKEND);
}

// Lấy ra lịch sử làm bài thi theo id
const getHistoryExamById = ({ testId }) => {
  const URL_BACKEND = `test/result/${testId}`;
    return axios.get(URL_BACKEND);
}

// Xóa lịch sử làm bài thi
const deleteHistoryExamById = ({ historyTestId }) => {
    const URL_BACKEND = `exam-service/deleteHistoryTest?historyTestId=${historyTestId}`;
    return axios.delete(URL_BACKEND);
}

const getTotalAttemptsByUser = ({ userId }) => {
  const URL_BACKEND = `test/getTotalAttemptsByUser/${userId}`;
  return axios.get(URL_BACKEND);
};

const getAverageTestScoreByUser = ({ userId }) => {
  const URL_BACKEND = `test/getAverageTestScoreByUser/${userId}`;
  return axios.get(URL_BACKEND);
};

const getResultListByUser = ({ userId }) => {
  const URL_BACKEND = `test/getResultListByUser/${userId}`;
  return axios.get(URL_BACKEND);
};

const setStatusTestByTeacher = ({ testId }) => {
  const URL_BACKEND = `test/${testId}/set-status`;
  return axios.put(URL_BACKEND);
};

const createTestByTeacher = ({ testName, audio }) => {
  const URL_BACKEND = "test/add";
  return axios.post(URL_BACKEND, { testName, audio });
};

const updateTestByTeacher = ({ testId, testName, audio }) => {
  const URL_BACKEND = `test/${testId}`;
  return axios.put(URL_BACKEND, { testName, audio });
};

const uploadTestAudio = ({ file }) => {
  const URL_BACKEND = "test/files/upload/audio";
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(URL_BACKEND, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const uploadTestImage = ({ file }) => {
  const URL_BACKEND = "test/files/upload/image";
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(URL_BACKEND, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

const createQuestionGroup = ({ testId, partId, dataQuestion, transcript, orderNumberPart }) => {
  const URL_BACKEND = `test/${testId}/groups`;
  return axios.post(URL_BACKEND, { partId, dataQuestion, transcript, orderNumberPart });
};

const getQuestionGroupsByPart = ({ testId, partId }) => {
  const URL_BACKEND = `test/${testId}/groups?partId=${partId}`;
  return axios.get(URL_BACKEND);
};

const addSingleQuestionToTest = ({ testId, payload }) => {
  const URL_BACKEND = `test/${testId}/questions/single`;
  return axios.post(URL_BACKEND, payload);
};

const addQuestionToGroup = ({ testId, dataQuestionId, payload }) => {
  const URL_BACKEND = `test/${testId}/groups/${dataQuestionId}/questions`;
  return axios.post(URL_BACKEND, payload);
};

const getQuestionsForManage = ({ testId, partId }) => {
  const URL_BACKEND = `test/${testId}/questions/manage?partId=${partId}`;
  return axios.get(URL_BACKEND);
};

const updateSingleQuestion = ({ testId, questionId, payload }) => {
  const URL_BACKEND = `test/${testId}/questions/${questionId}`;
  return axios.put(URL_BACKEND, payload);
};

const deleteSingleQuestion = ({ testId, questionId }) => {
  const URL_BACKEND = `test/${testId}/questions/${questionId}`;
  return axios.delete(URL_BACKEND);
};

const updateQuestionGroup = ({ testId, dataQuestionId, payload }) => {
  const URL_BACKEND = `test/${testId}/groups/${dataQuestionId}`;
  return axios.put(URL_BACKEND, payload);
};

const deleteQuestionGroup = ({ testId, dataQuestionId }) => {
  const URL_BACKEND = `test/${testId}/groups/${dataQuestionId}`;
  return axios.delete(URL_BACKEND);
};

export {
  getAllTests,
  getExamByYear,
  resultSubmitExam,
  submitTest,
  getExamById,
  getAllExamByYear,
  getHistoryExam,
  getHistoryExamById,
  getExamNotSubmit,
  deleteHistoryExamById,
  startTest,
  getTotalAttemptsByUser,
  getAverageTestScoreByUser,
  getResultListByUser,
  getTestsByTeacher,
  setStatusTestByTeacher,
  createTestByTeacher,
  updateTestByTeacher,
  uploadTestAudio,
  uploadTestImage,
  createQuestionGroup,
  getQuestionGroupsByPart,
  addSingleQuestionToTest,
  addQuestionToGroup,
  getQuestionsForManage,
  updateSingleQuestion,
  deleteSingleQuestion,
  updateQuestionGroup,
  deleteQuestionGroup,
};
