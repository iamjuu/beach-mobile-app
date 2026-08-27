import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/authApi';
import * as publicApi from '../api/publicApi';
import api from '../api/axios';

const AuthContext = createContext(null);
const SESSION_DURATION = 15 * 60 * 60 * 1000; // 15 hours in milliseconds

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  useEffect(() => {
    if (!token || !user) return;
    let timer;
    const checkExpiry = async () => {
      const storedTime = await AsyncStorage.getItem('beach_app_token_time');
      if (!storedTime) return;
      const elapsed = Date.now() - parseInt(storedTime, 10);
      const remaining = Math.max(0, SESSION_DURATION - elapsed);
      if (remaining <= 0) {
        await logout();
      } else {
        timer = setTimeout(async () => {
          await logout();
        }, remaining);
      }
    };
    checkExpiry();
    return () => clearTimeout(timer);
  }, [token, user]);

  const loadStoredSession = async () => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem('beach_app_token');
      const storedTime = await AsyncStorage.getItem('beach_app_token_time');
      const storedUser = await AsyncStorage.getItem('beach_app_user');

      if (storedToken && storedUser) {
        if (storedTime) {
          const elapsed = Date.now() - parseInt(storedTime, 10);
          if (elapsed >= SESSION_DURATION) {
            await logout();
            return;
          }
        }
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
        // Validate with backend in background
        fetchProfile();
      }
    } catch (e) {
      console.warn('[AuthContext] Error loading session:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await authApi.getMe();
      const userData = res.data?.data?.user || res.data?.data;
      if (userData) {
        setUser(userData);
        await AsyncStorage.setItem('beach_app_user', JSON.stringify(userData));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        await logout();
      }
    }
  };

  const handleAuthSuccess = async (data) => {
    const accessToken = data?.accessToken || data?.token;
    const refreshToken = data?.refreshToken;
    const userData = data?.user || data;

    if (accessToken) {
      setToken(accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      await AsyncStorage.setItem('beach_app_token', accessToken);
      await AsyncStorage.setItem('beach_app_token_time', Date.now().toString());
    }
    if (refreshToken) {
      await AsyncStorage.setItem('beach_app_refresh_token', refreshToken);
    }
    if (userData) {
      setUser(userData);
      await AsyncStorage.setItem('beach_app_user', JSON.stringify(userData));
    }
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    const data = response.data?.data || response.data;
    await handleAuthSuccess(data);
    return data;
  };

  const loginResident = async (phone, secId) => {
    const response = await publicApi.loginResident({ phone, secId });
    const data = response.data?.data || response.data;
    await handleAuthSuccess(data);
    return data;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    const data = response.data?.data || response.data;
    await handleAuthSuccess(data);
    return data;
  };

  const registerResident = async (formData) => {
    const response = await publicApi.registerResidentPass(formData);
    const data = response.data?.data || response.data;
    if (data?.token || data?.accessToken) {
      await handleAuthSuccess(data);
    }
    return data;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common.Authorization;
    await AsyncStorage.multiRemove([
      'beach_app_token',
      'beach_app_refresh_token',
      'beach_app_token_time',
      'beach_app_user',
    ]);
  };

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'MASTER_ADMIN' || user.role === 'GATE_ADMIN');
  const isResident = user && (user.role === 'RESIDENT' || user.role === 'USER');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isResident,
        login,
        loginResident,
        register,
        registerResident,
        logout,
        refreshUserProfile: fetchProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
