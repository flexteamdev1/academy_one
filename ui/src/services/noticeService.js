import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listNotices = async (params = {}) => {
  try {
    const response = await apiClient.get('/notices', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to load notices');
  }
};

export const createNotice = async (payload) => {
  try {
    const hasFiles = Array.isArray(payload?.attachments) && payload.attachments.some((item) => item?.file);
    if (hasFiles) {
      const formData = new FormData();
      formData.append('title', payload.title || '');
      formData.append('content', payload.content || '');
      formData.append('status', payload.status || 'PUBLISHED');
      if (payload.scheduledAt) formData.append('scheduledAt', payload.scheduledAt);
      formData.append('visibleFor', JSON.stringify(payload.visibleFor || []));
      formData.append('grades', JSON.stringify(payload.grades || []));
      formData.append('channels', JSON.stringify(payload.channels || []));
      payload.attachments.forEach((item) => {
        if (item?.file) formData.append('attachments', item.file);
      });

      const response = await apiClient.post('/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const response = await apiClient.post('/notices', payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Unable to create notice');
  }
};

export const updateNotice = async (id, payload) => {
  try {
    const hasFiles = Array.isArray(payload?.attachments) && payload.attachments.some((item) => item?.file);
    if (hasFiles) {
      const formData = new FormData();
      formData.append('title', payload.title || '');
      formData.append('content', payload.content || '');
      formData.append('status', payload.status || 'DRAFT');
      if (payload.scheduledAt) formData.append('scheduledAt', payload.scheduledAt);
      formData.append('visibleFor', JSON.stringify(payload.visibleFor || []));
      formData.append('grades', JSON.stringify(payload.grades || []));
      formData.append('channels', JSON.stringify(payload.channels || []));

      const existing = Array.isArray(payload.attachments)
        ? payload.attachments.filter((item) => !item?.file)
        : [];
      formData.append('existingAttachments', JSON.stringify(existing));

      payload.attachments.forEach((item) => {
        if (item?.file) formData.append('attachments', item.file);
      });

      const response = await apiClient.put(`/notices/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }

    const response = await apiClient.put(`/notices/${id}`, payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Unable to update notice');
  }
};
