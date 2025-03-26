import axios from 'axios';

// Create an Axios instance with your backend's base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Update if necessary
});

// Helper to set the Authorization header for Axios
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;
