import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
           throw new Error("No refresh token");
        }
        const res = await axios.post('http://localhost:3000/api/v1/auth/refresh-token', { refreshToken });
        // The API returns access_token in typical systems, let's assume it's data.data.token or similar based on backend. 
        // For standard implementation we assume res.data.token
        const token = res.data.token || res.data.data?.token;
        if (token) {
           localStorage.setItem('token', token);
           originalRequest.headers.Authorization = `Bearer ${token}`;
           return api(originalRequest);
        }
        throw new Error("Token refresh failed");
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
