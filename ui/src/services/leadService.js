import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listLeads = async (params = {}) => {
  try {
    const response = await apiClient.get('/leads', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch leads');
  }
};

export const createLead = async (payload) => {
  try {
    const response = await apiClient.post('/leads', payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to create lead');
  }
};

export const updateLead = async (id, payload) => {
  try {
    const response = await apiClient.put(`/leads/${id}`, payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to update lead');
  }
};

export const deleteLead = async (id) => {
  try {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to delete lead');
  }
};
