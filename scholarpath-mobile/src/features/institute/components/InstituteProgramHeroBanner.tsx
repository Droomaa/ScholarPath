import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { type InstituteProgram } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteProgramHeroBannerProps = {
  program: InstituteProgram;
};

export function InstituteProgramHeroBanner({ program }: InstituteProgramHeroBannerProps) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={program.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.overlay}
      />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{program.categoryBadgeLabel}</Text>
        </View>
        <Text style={styles.title}>{program.title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 256,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  banner: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4648D4',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.white,
  },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: 36,
    lineHeight: 45,
    letterSpacing: -0.72,
    color: AuthColors.white,
  },
});
