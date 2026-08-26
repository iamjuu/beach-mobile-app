import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import * as publicApi from '../api/publicApi';
import { SOCKET_SERVER_URL } from '../api/axios';

const FeatureContext = createContext(null);

export function FeatureProvider({ children }) {
  const [featureSettings, setFeatureSettings] = useState({
    emergencySosEnabled: true,
    publicReportEnabled: true,
    userReportEnabled: true,
    trackUserEnabled: false,
    orderFoodEnabled: true,
    resortBookingEnabled: true,
    tabMaintenance: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchFeatures = useCallback(async () => {
    try {
      const { data } = await publicApi.getFeatures();
      if (data?.data?.settings) {
        setFeatureSettings((prev) => ({
          ...prev,
          ...data.data.settings,
        }));
      }
    } catch {
      // Fallback to defaults if backend offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Real-time socket feature synchronization
  useEffect(() => {
    let socketInstance = null;

    const handleFeaturesUpdated = (payload) => {
      if (payload?.settings) {
        setFeatureSettings((prev) => ({
          ...prev,
          ...payload.settings,
        }));
      }
    };

    try {
      socketInstance = io(SOCKET_SERVER_URL, {
        path: '/api/socket.io',
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });
      socketInstance.on('features:updated', handleFeaturesUpdated);
    } catch (e) {
      console.warn('FeatureContext socket error:', e);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const getTabMaintenance = useCallback(
    (tabId) => {
      const tabs = featureSettings.tabMaintenance || [];
      return tabs.find((t) => t.tabId === tabId) || { isBlocked: false };
    },
    [featureSettings.tabMaintenance]
  );

  return (
    <FeatureContext.Provider
      value={{
        featureSettings,
        loading,
        fetchFeatures,
        getTabMaintenance,
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatureSettings() {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error('useFeatureSettings must be used within a FeatureProvider');
  }
  return context;
}
