import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { PhoneOff, Mic, MicOff, PhoneCall, Radio, Volume2 } from 'lucide-react-native';
import { useEmergency } from '../../context/EmergencyContext';
import { colors } from '../../theme/colors';

export default function VoiceCallOverlay() {
  const { callState, acceptCall, endCall } = useEmergency();
  const [isMuted, setIsMuted] = useState(false);

  if (!callState) return null;

  const isIncoming = callState.status === 'incoming';
  const isCalling = callState.status === 'calling';
  const isConnected = callState.status === 'connected';

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Modal visible={true} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Status */}
          <View style={styles.avatarCircle}>
            <Radio size={48} color={isConnected ? '#10b981' : colors.primaryLight} />
          </View>

          <Text style={styles.peerName}>{callState.peerName || 'Gate Security Office'}</Text>
          <Text style={styles.callStatus}>
            {isIncoming && 'Incoming Emergency Call...'}
            {isCalling && 'Calling Security Admin...'}
            {isConnected && 'Voice Call Active (Full Duplex)'}
          </Text>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            {isIncoming && (
              <TouchableOpacity style={styles.acceptBtn} onPress={acceptCall} activeOpacity={0.8}>
                <PhoneCall size={24} color="#ffffff" />
                <Text style={styles.actionText}>Answer</Text>
              </TouchableOpacity>
            )}

            {isConnected && (
              <TouchableOpacity
                style={[styles.muteBtn, isMuted && styles.muteBtnActive]}
                onPress={toggleMute}
                activeOpacity={0.8}
              >
                {isMuted ? <MicOff size={24} color="#ef4444" /> : <Mic size={24} color="#ffffff" />}
                <Text style={styles.actionText}>{isMuted ? 'Muted' : 'Mute'}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.endBtn} onPress={endCall} activeOpacity={0.8}>
              <PhoneOff size={24} color="#ffffff" />
              <Text style={styles.actionText}>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    elevation: 10,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  peerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  callStatus: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 32,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    width: '100%',
  },
  acceptBtn: {
    backgroundColor: '#10b981',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteBtn: {
    backgroundColor: colors.cardSecondary,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  muteBtnActive: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  endBtn: {
    backgroundColor: colors.danger,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
