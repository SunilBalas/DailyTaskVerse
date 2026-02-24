import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5246/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user?.id;
};

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const taskApi = {
  getAll: (params) => api.get(`/task/${getUserId()}`, { params }),
  getById: (id) => api.get(`/task/${getUserId()}/${id}`),
  create: (data) => api.post(`/task/${getUserId()}`, data),
  update: (id, data) => api.put(`/task/${getUserId()}/${id}`, data),
  complete: (id) => api.patch(`/task/${getUserId()}/${id}/complete`),
  delete: (id) => api.delete(`/task/${getUserId()}/${id}`),
};

export const dailyLogApi = {
  getAll: (params) => api.get(`/dailylog/${getUserId()}`, { params }),
  getById: (id) => api.get(`/dailylog/${getUserId()}/${id}`),
  create: (data) => api.post(`/dailylog/${getUserId()}`, data),
  update: (id, data) => api.put(`/dailylog/${getUserId()}/${id}`, data),
  delete: (id) => api.delete(`/dailylog/${getUserId()}/${id}`),
};

export const dashboardApi = {
  get: () => api.get(`/dashboard/${getUserId()}`),
  weeklyReport: () => api.get(`/dashboard/${getUserId()}/weekly-report`),
  monthlyReport: () => api.get(`/dashboard/${getUserId()}/monthly-report`),
  statusDistribution: () => api.get(`/dashboard/${getUserId()}/status-distribution`),
  standup: () => api.get(`/dashboard/${getUserId()}/standup`),
  standupConfig: () => api.get(`/dashboard/${getUserId()}/standup-config`),
  updateStandupConfig: (data) => api.put(`/dashboard/${getUserId()}/standup-config`, data),
  timesheet: (weekStart) => api.get(`/dashboard/${getUserId()}/timesheet`, { params: { weekStart } }),
};

export const noteApi = {
  getAll: () => api.get(`/note/${getUserId()}`),
  getById: (id) => api.get(`/note/${getUserId()}/${id}`),
  create: (data) => api.post(`/note/${getUserId()}`, data),
  update: (id, data) => api.put(`/note/${getUserId()}/${id}`, data),
  delete: (id) => api.delete(`/note/${getUserId()}/${id}`),
};

export const exportApi = {
  tasks: (params) => api.get(`/export/${getUserId()}/tasks`, { params, responseType: 'blob' }),
  dailyLogs: () => api.get(`/export/${getUserId()}/daily-logs`, { responseType: 'blob' }),
  timesheet: (weekStart) => api.get(`/export/${getUserId()}/timesheet`, { params: { weekStart }, responseType: 'blob' }),
  notes: () => api.get(`/export/${getUserId()}/notes`, { responseType: 'blob' }),
};

export const notificationApi = {
  getAll: () => api.get(`/notification/${getUserId()}`),
  getUnreadCount: () => api.get(`/notification/${getUserId()}/unread-count`),
  markRead: (id) => api.patch(`/notification/${getUserId()}/${id}/read`),
  markAllRead: () => api.patch(`/notification/${getUserId()}/read-all`),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
};

export const azureDevOpsApi = {
  getSettings: () => api.get(`/azuredevops/${getUserId()}`),
  saveSettings: (data) => api.post(`/azuredevops/${getUserId()}`, data),
  testConnection: (data) => api.post(`/azuredevops/${getUserId()}/test-connection`, data),
  getProjects: (params) => api.get(`/azuredevops/${getUserId()}/projects`, { params }),
  getWorkItems: (params) => api.get(`/azuredevops/${getUserId()}/work-items`, { params }),
  getComments: (projectName, workItemId) => api.get(`/azuredevops/${getUserId()}/work-items/${encodeURIComponent(projectName)}/${workItemId}/comments`),
  deleteSettings: () => api.delete(`/azuredevops/${getUserId()}`),
};

export default api;
