import api from './axios';

export async function getServices(params = {}) {
  const response = await api.get('/services', { params });
  return response.data;
}

export async function getServiceById(id) {
  const response = await api.get(`/services/${id}`);
  return response.data;
}

export async function createService(serviceData) {
  const response = await api.post('/services', serviceData);
  return response.data;
}

export async function updateService(id, serviceData) {
  const response = await api.put(`/services/${id}`, serviceData);
  return response.data;
}

export async function deleteService(id) {
  const response = await api.delete(`/services/${id}`);
  return response.data;
}

// Food items
export async function addMenuItem(serviceId, itemData) {
  const response = await api.post(`/services/${serviceId}/menu`, itemData);
  return response.data;
}

export async function updateMenuItem(serviceId, itemId, itemData) {
  const response = await api.put(`/services/${serviceId}/menu/${itemId}`, itemData);
  return response.data;
}

export async function toggleMenuItemAvailability(serviceId, itemId) {
  const response = await api.patch(`/services/${serviceId}/menu/${itemId}/toggle`);
  return response.data;
}

export async function deleteMenuItem(serviceId, itemId) {
  const response = await api.delete(`/services/${serviceId}/menu/${itemId}`);
  return response.data;
}
