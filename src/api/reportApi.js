import api, { API_BASE_URL } from './axios';

export const createReport = (formData) => api.post('/beach-reports', formData);
export const createReportJson = (data) => api.post('/beach-reports', data);
export const getMyReports = () => api.get('/beach-reports/me');
export const getUserReportEventsUrl = (token) =>
  `${API_BASE_URL}/beach-reports/events/user?token=${encodeURIComponent(token)}`;
