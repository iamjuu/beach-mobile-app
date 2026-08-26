import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useFeatureSettings } from '../../context/FeatureContext';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';

export default function UserLocationTracker() {
  const { featureSettings } = useFeatureSettings();
  const { user } = useAuth();
  const { socket } = useEmergency();

  useEffect(() => {
    if (!featureSettings.trackUserEnabled || !user) return;

    let locationSubscription = null;

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          (location) => {
            if (socket && socket.connected) {
              socket.emit('location:update', {
                userId: user.id || user._id,
                userName: user.name || user.phone,
                role: user.role,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                speed: location.coords.speed,
                heading: location.coords.heading,
                timestamp: location.timestamp,
              });
            }
          }
        );
      } catch (err) {
        console.warn('[UserLocationTracker] Tracking error:', err);
      }
    };

    startTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [featureSettings.trackUserEnabled, user, socket]);

  return null;
}
