import axios from "../utils/axios-customize";

const getOpenCourses = () => {
  const URL_BACKEND = "course/getAllCoursesByStudent";
  return axios.get(URL_BACKEND);
};

const getCourseCurriculum = ({ courseId }) => {
  const URL_BACKEND = `lession/getAll?courseId=${courseId}`;
  return axios.get(URL_BACKEND);
};

const registerCourse = ({ courseId, totalAmount }) => {
  const URL_BACKEND = "register-course/add";
  return axios.post(URL_BACKEND, { courseId, totalAmount });
};

const getVocabularyByList = ({ listId }) => {
  const URL_BACKEND = `vocabulary-list/${listId}/vocabularies`;
  return axios.get(URL_BACKEND);
};

const getVocabularyListInfo = ({ listId }) => {
  const URL_BACKEND = `vocabulary-list/${listId}`;
  return axios.get(URL_BACKEND);
};

const getUserRegisteredCourses = () => {
  const URL_BACKEND = "register-course/getAll";
  return axios.get(URL_BACKEND);
};

export { getOpenCourses, getCourseCurriculum, registerCourse, getVocabularyByList, getVocabularyListInfo, getUserRegisteredCourses };
