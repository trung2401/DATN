import axios from '../utils/axios-customize';

const getTeacherDashboardStats = ({ startDate, endDate } = {}) => {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const query = params.toString();
  const URL_BACKEND = query ? `teacher/dashboard/stats?${query}` : 'teacher/dashboard/stats';
  return axios.get(URL_BACKEND);
};

export {
  getTeacherDashboardStats,
};
