import axios from "../utils/axios-customize";

// Lấy thông tin user
const getAllUser = () => {
  const URL_BACKEND = "auth/getAllUsers?page=1&limit=1000";
  return axios.get(URL_BACKEND);
};

// Lấy số lượng user
const getNumberOfUser = () => {
  const URL_BACKEND = "auth/getTotalUsersCount";
  return axios.get(URL_BACKEND);
};

// Lấy số lượng bài test
const getNumberOfTest = () => {
  const URL_BACKEND = "test/getTotalTestsCount";
  return axios.get(URL_BACKEND);
};

// Lấy lịch sử bài thi
const getAllHistoryTest = () => {
  const URL_BACKEND = "test/getResultList";
  return axios.get(URL_BACKEND);
};

// Lấy thông tin bài test
const getAllTest = () => {
  const URL_BACKEND = "exam-service/getAllTest";
  return axios.get(URL_BACKEND);
};

// Lấy quyền của user
const getPermissionOfUser = ({ idUser }) => {
  const URL_BACKEND = "user-service/getPermissionOfUser";
  const data = {
    idUser: idUser,
  };
  return axios.post(URL_BACKEND, data);
};

// Cập nhật quyền của user
const updatePermissionOfUser = ({ idUser, namePermission, typeUpdate }) => {
  const URL_BACKEND = "user-service/updatePermission";
  const data = {
    idUser: idUser,
    namePermission: namePermission,
    typeUpdate: typeUpdate,
  };
  return axios.post(URL_BACKEND, data);
};

// Thêm quyền cho user
const addPermissionForUser = ({ namePermission }) => {
  const URL_BACKEND = "user-service/addPermission";
  const data = {
    namePermission: namePermission,
  };
  return axios.post(URL_BACKEND, data);
};
// Xóa quyền của user
const detelePermissionOfUser = ({ permissionId }) => {
  const URL_BACKEND = "user-service/removePermission";
  const data = {
    permissionId: permissionId,
  };
  return axios.post(URL_BACKEND, data);
};
// Thêm mới user
const addUser = ({ userName, password, gmail, phone, name, roleId }) => {
  const URL_BACKEND = "auth/create";
  const data = {
    userName,
    password,
    gmail,
    phone,
    name,
    roleId,
  };
  return axios.post(URL_BACKEND, data);
};

// Xóa user
const deleteUser = ({ userId }) => {
  const URL_BACKEND = "user-service/removeUser";
  const data = {
    userId: userId,
  };
  return axios.post(URL_BACKEND, data);
};

const updateUserByAdmin = ({ userId, name, phone }) => {
  const URL_BACKEND = `auth/admin-update/${userId}`;
  return axios.put(URL_BACKEND, { name, phone });
};

const lockAccountByAdmin = ({ userId, lock }) => {
  const URL_BACKEND = `auth/lock/${userId}`;
  return axios.put(URL_BACKEND, { lock });
};

// Lấy tất cả thông tin thanh toán
const getAllPayment = () => {
  const URL_BACKEND = 'register-course/getAll';
  return axios.get(URL_BACKEND);
}

// Lấy doanh thu
const getRevenue = () => {
  const URL_BACKEND = 'register-course/getTotalRevenueConfirmed'
  return axios.get(URL_BACKEND);
}

const getAllCourses = () => {
  const URL_BACKEND = "course/getAllCourses";
  return axios.get(URL_BACKEND);
};

const getAllCoursesByStudent = () => {
  const URL_BACKEND = "course/getAllCoursesByStudent";
  return axios.get(URL_BACKEND);
};

const createCourse = ({
  courseName,
  teacherId,
  courseDesc,
  duration,
  price,
  input,
  target,
  percentSalary,
}) => {
  const URL_BACKEND = "course/add";
  return axios.post(URL_BACKEND, {
    courseName,
    teacherId,
    courseDesc,
    duration,
    price,
    input,
    target,
    percentSalary,
  });
};

const updateCourseById = ({
  courseId,
  courseName,
  teacherId,
  courseDesc,
  duration,
  price,
  input,
  target,
  percentSalary,
}) => {
  const URL_BACKEND = `course/${courseId}`;
  return axios.put(URL_BACKEND, {
    courseName,
    teacherId,
    courseDesc,
    duration,
    price,
    input,
    target,
    percentSalary,
  });
};

const setStatusCourse = ({ courseId, status }) => {
  const URL_BACKEND = `course/${courseId}/set-status`;
  return axios.put(URL_BACKEND, { status });
};

const confirmRegisterCourse = ({ registerCourseId }) => {
  const URL_BACKEND = `register-course/${registerCourseId}/confirm`;
  return axios.put(URL_BACKEND);
};

const cancelRegisterCourse = ({ registerCourseId }) => {
  const URL_BACKEND = `register-course/${registerCourseId}/cancel`;
  return axios.put(URL_BACKEND);
};

// Xóa đề thi
const deleteTest = ({ testId }) => {
  const URL_BACKEND = `exam-service/deleteTest?testId=${testId}`;
  return axios.delete(URL_BACKEND);
}

// Lấy chi tiết đề thi

const getTestDetail = ({ testId }) => {
  const URL_BACKEND = `exam-service/getTestForEdit?testId=${testId}`;
  return axios.get(URL_BACKEND);
}

// Thêm đề thi
const createTest = ({testName, year,duration,parts, questions }) => {
  const URL_BACKEND = "exam-service/createTest";
  const data = {
    testName: testName,
    year: year,
    duration: duration,
    parts: parts,
    questions: questions,
  };
  return axios.post(URL_BACKEND, data);
}
// Cập nhật đề thi
const updateTest = ({ testId, testName, year,duration,parts, questions }) => {
  const URL_BACKEND = "exam-service/updateTest";
  const data = {
    testId: testId,
    testName: testName,
    year: year,
    duration: duration,
    parts: parts,
    questions: questions,
  };
  return axios.post(URL_BACKEND, data);
}

// Tải ảnh lên
const uploadImage = async ({ file }) => {
  const URL_BACKEND = "exam-service/files/upload/image";
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Tải audio lên
const uploadAudio = async ({ file }) => {
  const URL_BACKEND = "exam-service/files/upload/audio";
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(URL_BACKEND, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};


export {
  getAllUser,
  addUser,
  deleteUser,
  updateUserByAdmin,
  lockAccountByAdmin,
  getNumberOfUser,
  getNumberOfTest,
  getAllHistoryTest,
  getAllTest,
  getPermissionOfUser,
  updatePermissionOfUser,
  addPermissionForUser,
  detelePermissionOfUser,
  getAllPayment,
  getRevenue,
  getAllCourses,
  getAllCoursesByStudent,
  createCourse,
  updateCourseById,
  setStatusCourse,
  confirmRegisterCourse,
  cancelRegisterCourse,
  deleteTest,
  getTestDetail,
  createTest,
  updateTest,
  uploadImage,
  uploadAudio
};
