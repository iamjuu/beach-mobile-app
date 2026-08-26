import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import * as Location from 'expo-location';
import api, { SOCKET_SERVER_URL } from '../api/axios';
import { useAuth } from './AuthContext';
import { playAlarmSoundLoop, stopAlarmSoundLoop, playConfirmationChime } from '../utils/soundUtils';
import {
  triggerUserFeedbackVibration,
  startEmergencyVibrationLoop,
  stopEmergencyVibration,
} from '../utils/vibrationUtils';

const EmergencyContext = createContext(null);

export function EmergencyProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activeEmergencies, setActiveEmergencies] = useState({});
  const [userEmergencyState, setUserEmergencyState] = useState(null);

  // Call state: null | { status: 'calling'|'incoming'|'connected'|'ended', emergencyId, peerName, remoteSocketId }
  const [callState, setCallState] = useState(null);
  const remoteSocketIdRef = useRef(null);

  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'MASTER_ADMIN' || user.role === 'GATE_ADMIN');

  // Connect socket
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      path: '/api/socket.io',
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    setSocket(s);

    s.on('connect', () => {
      if (isAdmin) {
        s.emit('join:admin');
      }
      const uid = user?.id || user?._id;
      if (uid) {
        s.emit('join:user', uid);
      }
      if (userEmergencyState?.emergencyId) {
        s.emit('join:emergency', userEmergencyState.emergencyId);
      }
    });

    s.on('connect_error', (err) => {
      console.warn('[EmergencyContext] Socket error:', err.message);
    });

    return () => {
      s.disconnect();
    };
  }, [user, isAdmin]);

  // Ensure rooms are joined on state change
  useEffect(() => {
    if (!socket || !socket.connected) return;
    if (isAdmin) {
      socket.emit('join:admin');
    }
    const uid = user?.id || user?._id;
    if (uid) {
      socket.emit('join:user', uid);
    }
    if (userEmergencyState?.emergencyId) {
      socket.emit('join:emergency', userEmergencyState.emergencyId);
    }
  }, [socket, user, isAdmin, userEmergencyState?.emergencyId]);

  // Admin polling fallback
  const pollActiveEmergencies = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await api.get('/emergency/active');
      const list = data?.data?.emergencies || [];
      const emgMap = {};
      list.forEach((item) => {
        emgMap[item.emergencyId] = item;
      });
      setActiveEmergencies(emgMap);

      if (list.length > 0) {
        playAlarmSoundLoop();
        startEmergencyVibrationLoop();
      } else {
        stopAlarmSoundLoop();
        stopEmergencyVibration();
      }
    } catch {
      // ignore
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      pollActiveEmergencies();
    }
  }, [isAdmin, pollActiveEmergencies]);

  // Socket event listeners for Emergency
  useEffect(() => {
    if (!socket || !isAdmin) return;

    const handleActiveList = (list) => {
      const emgMap = {};
      list.forEach((item) => {
        emgMap[item.emergencyId] = item;
      });
      setActiveEmergencies(emgMap);
      if (list.length > 0) {
        playAlarmSoundLoop();
        startEmergencyVibrationLoop();
      }
    };

    const handleEmergencyNew = (emergencyData) => {
      const { emergencyId } = emergencyData;
      setActiveEmergencies((prev) => ({
        ...prev,
        [emergencyId]: emergencyData,
      }));
      playAlarmSoundLoop();
      startEmergencyVibrationLoop();
    };

    const handleEmergencyClaimed = ({ emergencyId }) => {
      setActiveEmergencies((prev) => {
        const next = { ...prev };
        delete next[emergencyId];
        if (Object.keys(next).length === 0) {
          stopAlarmSoundLoop();
          stopEmergencyVibration();
        }
        return next;
      });
    };

    const handleStatusUpdate = ({ emergencyId, status, claimedBy }) => {
      setUserEmergencyState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status,
          claimedBy: claimedBy || 'Gate Officer',
          message: status === 'CLAIMED' ? `Officer Connected (${claimedBy || 'Gate Admin'})` : prev.message,
        };
      });
    };

    const handleEmergencyCancelled = ({ emergencyId }) => {
      setUserEmergencyState((prev) => (prev?.emergencyId === emergencyId ? null : prev));
      setActiveEmergencies((prev) => {
        const next = { ...prev };
        delete next[emergencyId];
        if (Object.keys(next).length === 0) {
          stopAlarmSoundLoop();
          stopEmergencyVibration();
        }
        return next;
      });
    };

    socket.on('emergency:active-list', handleActiveList);
    socket.on('emergency:new', handleEmergencyNew);
    socket.on('emergency:claimed', handleEmergencyClaimed);
    socket.on('emergency:status-update', handleStatusUpdate);
    socket.on('emergency:cancelled', handleEmergencyCancelled);

    return () => {
      socket.off('emergency:active-list', handleActiveList);
      socket.off('emergency:new', handleEmergencyNew);
      socket.off('emergency:claimed', handleEmergencyClaimed);
      socket.off('emergency:status-update', handleStatusUpdate);
      socket.off('emergency:cancelled', handleEmergencyCancelled);
    };
  }, [socket, isAdmin]);

  // Voice call signaling listeners
  useEffect(() => {
    if (!socket) return;

    const handleCallAnswered = ({ emergencyId, userSocketId }) => {
      if (userSocketId) remoteSocketIdRef.current = userSocketId;
      setCallState((prev) => (prev ? { ...prev, status: 'connected', remoteSocketId: userSocketId } : prev));
    };

    const handleCallIncoming = ({ emergencyId, adminName, adminSocketId }) => {
      remoteSocketIdRef.current = adminSocketId;
      setCallState({
        status: 'incoming',
        emergencyId,
        peerName: adminName || 'Gate Officer',
        remoteSocketId: adminSocketId,
      });
    };

    const handleCallEnded = () => {
      setCallState(null);
    };

    socket.on('call:answered', handleCallAnswered);
    socket.on('call:incoming', handleCallIncoming);
    socket.on('call:ended', handleCallEnded);

    return () => {
      socket.off('call:answered', handleCallAnswered);
      socket.off('call:incoming', handleCallIncoming);
      socket.off('call:ended', handleCallEnded);
    };
  }, [socket]);

  // Clean up sounds & vibration on unmount
  useEffect(() => {
    return () => {
      stopAlarmSoundLoop();
      stopEmergencyVibration();
    };
  }, []);

  // Action: Trigger SOS
  const triggerEmergency = async (locationDetails = '') => {
    triggerUserFeedbackVibration();
    playConfirmationChime();

    let coords = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
        };
      }
    } catch {
      // location permission skipped
    }

    const emergencyId = `emg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payload = {
      emergencyId,
      userId: user?.id || user?._id || 'ANONYMOUS',
      userName: user?.name || user?.phone || user?.username || 'Beach Resident/Visitor',
      userPhone: user?.phone || user?.username || '',
      location: locationDetails || (coords ? `GPS: ${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` : 'Muzhappilangad Beach Area'),
      coordinates: coords,
      timestamp: new Date().toISOString(),
    };

    setUserEmergencyState({
      status: 'PENDING',
      message: 'Emergency alert sent. Waiting for Gate Security...',
      emergencyId,
      coordinates: coords,
    });

    if (socket && socket.connected) {
      socket.emit('join:emergency', emergencyId);
      socket.emit('emergency:trigger', payload);
    } else {
      try {
        await api.post('/emergency/trigger', payload);
      } catch {
        // fallback
      }
    }
  };

  // Action: Admin Claim SOS
  const claimEmergency = async (emergencyId) => {
    triggerUserFeedbackVibration();
    stopAlarmSoundLoop();

    setActiveEmergencies((prev) => {
      const next = { ...prev };
      delete next[emergencyId];
      if (Object.keys(next).length === 0) {
        stopEmergencyVibration();
      }
      return next;
    });

    const adminInfo = {
      adminId: user?.id || user?._id || 'ADMIN',
      adminName: user?.name || 'Gate Officer',
    };

    if (socket && socket.connected) {
      socket.emit('emergency:claim', {
        emergencyId,
        ...adminInfo,
      });
    }

    try {
      await api.post(`/emergency/claim/${emergencyId}`);
    } catch {
      // handled by socket
    }
  };

  // Action: Cancel SOS
  const cancelUserEmergency = async (emergencyId) => {
    const targetId = emergencyId || userEmergencyState?.emergencyId;
    setUserEmergencyState(null);
    if (!targetId) return;

    if (socket && socket.connected) {
      socket.emit('emergency:cancel', { emergencyId: targetId });
    }
    try {
      await api.post(`/emergency/cancel/${targetId}`);
    } catch {
      // handled
    }
  };

  // Voice Call actions
  const startCall = (emergencyId, targetUserId, peerName = 'User') => {
    if (!socket) return;
    setCallState({ status: 'calling', emergencyId, peerName, remoteSocketId: null });
    socket.emit('call:offer', {
      emergencyId,
      userId: targetUserId,
      adminId: user?.id || user?._id,
      adminName: user?.name || 'Gate Officer',
    });
  };

  const acceptCall = () => {
    if (!socket || !callState) return;
    socket.emit('call:answer', {
      emergencyId: callState.emergencyId,
      adminSocketId: callState.remoteSocketId,
    });
    setCallState((prev) => ({ ...prev, status: 'connected' }));
  };

  const endCall = () => {
    if (socket?.connected && callState) {
      socket.emit('call:end', {
        targetSocketId: remoteSocketIdRef.current,
        emergencyId: callState.emergencyId,
      });
    }
    setCallState(null);
  };

  return (
    <EmergencyContext.Provider
      value={{
        socket,
        activeEmergencies,
        userEmergencyState,
        triggerEmergency,
        claimEmergency,
        cancelUserEmergency,
        setUserEmergencyState,
        callState,
        startCall,
        acceptCall,
        endCall,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
}
