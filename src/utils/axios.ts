import axios from 'axios';

// Создаем экземпляр axios с базовым URL
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
});

// Добавляем перехватчик запросов
instance.interceptors.request.use(
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

// Добавляем перехватчик ответов
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Если получаем 401, очищаем токен и перенаправляем на страницу входа
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 