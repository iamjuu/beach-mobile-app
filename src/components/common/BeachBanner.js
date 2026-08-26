import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { ShieldAlert, Waves, Compass } from 'lucide-react-native';
import { colors } from '../../theme/colors';

const BANNER_IMAGES = {
  home: require('../../assets/images/hero.png'),
  pass: require('../../assets/banners/pass-banner.jpg'),
  services: require('../../assets/banners/services-banner.jpg'),
  visits: require('../../assets/banners/visits-banner.jpg'),
  reports: require('../../assets/banners/reports-banner.jpg'),
  profile: require('../../assets/banners/profile-banner.jpg'),
};

export default function BeachBanner({
  type = 'home',
  title = 'Muzhappilangad Beach',
  subtitle = 'Asia’s Longest Drive-In Beach',
  onPressRules,
  showBadge = true,
}) {
  const imageSource = BANNER_IMAGES[type] || BANNER_IMAGES.home;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <View style={styles.overlay}>
          <View style={styles.topRow}>
            {showBadge && (
              <View style={styles.tideBadge}>
                <Waves size={14} color="#38bdf8" />
                <Text style={styles.tideText}>Safe Driving: Low Tide Active</Text>
              </View>
            )}
            {onPressRules && (
              <TouchableOpacity
                style={styles.rulesButton}
                onPress={onPressRules}
                activeOpacity={0.8}
              >
                <ShieldAlert size={14} color="#f8fafc" />
                <Text style={styles.rulesText}>Beach Rules</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.bottomContent}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceGlassBorder,
    backgroundColor: colors.card,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imageBackground: {
    width: '100%',
    height: 175,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.55)',
    justifyContent: 'space-between',
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    gap: 6,
  },
  tideText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '600',
  },
  rulesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  rulesText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomContent: {
    marginTop: 'auto',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#e2e8f0',
    marginTop: 2,
    fontWeight: '500',
  },
});
