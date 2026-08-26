import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

let emergencyVibrationTimer = null;

export function triggerUserFeedbackVibration() {
  try {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(200);
    }
  } catch {
    Vibration.vibrate(200);
  }
}

export function triggerSuccessHaptic() {
  try {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Vibration.vibrate([0, 100, 50, 100]);
    }
  } catch {
    Vibration.vibrate(100);
  }
}

export function triggerErrorHaptic() {
  try {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Vibration.vibrate([0, 200, 100, 200]);
    }
  } catch {
    Vibration.vibrate(300);
  }
}

export function startEmergencyVibrationLoop() {
  stopEmergencyVibration();
  // Pattern: wait 0ms, vibrate 600ms, wait 400ms, repeat
  Vibration.vibrate([0, 600, 400, 600, 400], true);
}

export function stopEmergencyVibration() {
  if (emergencyVibrationTimer) {
    clearInterval(emergencyVibrationTimer);
    emergencyVibrationTimer = null;
  }
  Vibration.cancel();
}
