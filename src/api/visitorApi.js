import api, { API_BASE_URL } from './axios';

export const getInstructions = () => api.get('/beach/instructions');
export const submitEntry = (data) => api.post('/visitor-entry', data);
export const getEntryStatus = (id) => api.get(`/visitor-entry/${id}/status`);
export const getEntryEventsUrl = (id) => `${API_BASE_URL}/visitor-entry/${id}/events`;
