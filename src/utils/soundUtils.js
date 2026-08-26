import { Audio } from 'expo-av';

let alarmSoundObject = null;

export async function playAlarmSoundLoop() {
  try {
    if (alarmSoundObject) {
      await alarmSoundObject.unloadAsync();
      alarmSoundObject = null;
    }
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/alarm.wav'),
      { isLooping: true, volume: 1.0 }
    );
    alarmSoundObject = sound;
    await sound.playAsync();
  } catch (error) {
    console.warn('[soundUtils] Error playing alarm sound:', error);
  }
}

export async function stopAlarmSoundLoop() {
  try {
    if (alarmSoundObject) {
      await alarmSoundObject.stopAsync();
      await alarmSoundObject.unloadAsync();
      alarmSoundObject = null;
    }
  } catch (error) {
    console.warn('[soundUtils] Error stopping alarm sound:', error);
  }
}

export async function playConfirmationChime() {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    // Soft beep using built-in or lightweight playback
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/alarm.wav'),
      { shouldPlay: true, volume: 0.3 }
    );
    setTimeout(() => {
      sound.unloadAsync().catch(() => {});
    }, 500);
  } catch {
    // audio fallback
  }
}
