// src/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

// Helper to set the Authorization header for Axios
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// --- NEW FILE MANAGEMENT API FUNCTIONS ---

/**
 * Uploads a file for a specific task.
 * @param {string|number} taskId - The ID of the task.
 * @param {File} file - The file object to upload.
 * @param {function} onUploadProgress - Optional callback for upload progress.
 * @returns {Promise<object>} - The API response.
 */
export const uploadTaskFile = (taskId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' must match the key expected by Laravel backend

  return api.post(`/tasks/${taskId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress, // Pass the progress callback to axios
  });
};

/**
 * Fetches all files associated with a specific task.
 * @param {string|number} taskId - The ID of the task.
 * @returns {Promise<object>} - The API response containing the list of files.
 */
export const getTaskFiles = (taskId) => {
  return api.get(`/tasks/${taskId}/files`);
};

/**
 * Initiates a download for a specific file.
 * Note: This URL can be used directly in an <a> tag href for downloads if preferred,
 * or called via JS to trigger a download programmatically.
 * @param {string|number} fileId - The ID of the file.
 * @returns {Promise<Blob>} - The API response (typically a blob for file download).
 */
export const downloadFile = (fileId) => {
  // For direct download, constructing the URL might be enough.
  // If using JS to trigger download and handle response:
  return api.get(`/files/${fileId}/download`, {
    responseType: 'blob', // Important for handling file downloads
  });
};

/**
 * Deletes a specific file.
 * @param {string|number} fileId - The ID of the file.
 * @returns {Promise<object>} - The API response.
 */
export const deleteTaskFile = (fileId) => {
  return api.delete(`/files/${fileId}`);
};

// --- END OF NEW FILE MANAGEMENT API FUNCTIONS ---

export default api;