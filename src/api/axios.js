import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://beach-verification-backend.onrender.com/api';
export const SOCKET_SERVER_URL = 'https://beach-verification-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('beach_app_token');
    const tokenTime = await AsyncStorage.getItem('beach_app_token_time');

    if (token && tokenTime) {
      if (Date.now() - parseInt(tokenTime, 10) >= SESSION_DURATION_MS) {
        const refreshToken = await AsyncStorage.getItem('beach_app_refresh_token');
        if (!refreshToken) {
          await AsyncStorage.multiRemove(['beach_app_token', 'beach_app_token_time']);
          delete config.headers.Authorization;
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
  } catch (e) {
    console.warn('[Axios] Request interceptor error:', e);
  }
  return config;
});

// Refresh token handling queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const storedRefreshToken = await AsyncStorage.getItem('beach_app_refresh_token');

      if (!storedRefreshToken) {
        await AsyncStorage.multiRemove(['beach_app_token', 'beach_app_token_time']);
        delete api.defaults.headers.common.Authorization;
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: storedRefreshToken,
        });

        const newAccessToken = response.data?.data?.accessToken || response.data?.data?.token;
        const newRefreshToken = response.data?.data?.refreshToken;

        if (newAccessToken) {
          await AsyncStorage.setItem('beach_app_token', newAccessToken);
          await AsyncStorage.setItem('beach_app_token_time', Date.now().toString());

          if (newRefreshToken) {
            await AsyncStorage.setItem('beach_app_refresh_token', newRefreshToken);
          }

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await AsyncStorage.multiRemove(['beach_app_token', 'beach_app_refresh_token', 'beach_app_token_time']);
        delete api.defaults.headers.common.Authorization;
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
