import api from './axios';

export const searchResidents = (name) =>
  api.get('/public/residents/search', { params: { name } });

export const registerResidentPass = (formData) =>
  api.post('/public/resident-register', formData);

export const loginResident = (data) => api.post('/public/resident-login', data);

export const getFeatures = () => api.get('/public/features');
