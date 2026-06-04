import axios from 'axios';

// Create Axios Instance
const api = axios.create({
  baseURL: '', // Handled by Vite proxy in development
});

// Interceptor to inject JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginUser = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const registerUser = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getUserProfile = async () => {
  const response = await api.get('/api/auth/profile');
  return response.data;
};

// Agent Search endpoint
export const queryAgent = async (query, signal) => {
  const response = await api.post('/api/agent', { query }, { signal });
  return response.data;
};

// Saved Jobs endpoints
export const getSavedJobs = async () => {
  const response = await api.get('/api/jobs/saved');
  return response.data;
};

export const saveJob = async (jobData) => {
  const response = await api.post('/api/jobs/save', jobData);
  return response.data;
};

export const unsaveJob = async (jobId) => {
  const response = await api.delete(`/api/jobs/saved/${jobId}`);
  return response.data;
};

// Search History endpoints
export const getSearchHistory = async () => {
  const response = await api.get('/api/jobs/history');
  return response.data;
};

export const deleteHistoryItem = async (historyId) => {
  const response = await api.delete(`/api/jobs/history/${historyId}`);
  return response.data;
};

export default api;
