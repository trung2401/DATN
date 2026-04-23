import axios from '../utils/axios-customize';

const getTeacherCourses = () => {
  const URL_BACKEND = 'course/getAllCourses';
  return axios.get(URL_BACKEND);
};

const getTeacherLessonsByCourse = ({ courseId, partId }) => {
  const query = new URLSearchParams();
  if (courseId) query.set('courseId', courseId);
  if (partId) query.set('partId', partId);
  const URL_BACKEND = `lession/getAll?${query.toString()}`;
  return axios.get(URL_BACKEND);
};

const createTeacherLesson = (payload) => {
  const URL_BACKEND = 'lession/add';
  return axios.post(URL_BACKEND, payload);
};

const updateTeacherLesson = ({ lessonId, payload }) => {
  const URL_BACKEND = `lession/${lessonId}`;
  return axios.put(URL_BACKEND, payload);
};

const deleteTeacherLesson = ({ lessonId }) => {
  const URL_BACKEND = `lession/${lessonId}`;
  return axios.delete(URL_BACKEND);
};

const uploadLessonVideo = ({ file }) => {
  const URL_BACKEND = 'lession/files/upload/video';
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const uploadLessonExercise = ({ file }) => {
  const URL_BACKEND = 'lession/files/upload/exercise';
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const getTeacherVocabularyLists = ({ userId }) => {
  const URL_BACKEND = `vocabulary-list/getAllVocabularyListsByUserId/${userId}`;
  return axios.get(URL_BACKEND);
};

export {
  getTeacherCourses,
  getTeacherLessonsByCourse,
  createTeacherLesson,
  updateTeacherLesson,
  deleteTeacherLesson,
  uploadLessonVideo,
  uploadLessonExercise,
  getTeacherVocabularyLists,
};
