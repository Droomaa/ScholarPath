import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export function AiHeroSection() {
  return (
    <LinearGradient
      colors={['#6063EE', '#4648D4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={styles.orbTopRight} />

      <View style={styles.graphicArea}>
        <View style={styles.orbitOuter} />
        <View style={styles.orbitInner} />

        <View style={[styles.floatingTag, styles.tagTopLeft]}>
          <Text style={styles.tagStem}>STEM Research</Text>
        </View>
        <View style={[styles.floatingTag, styles.tagBottomRight]}>
          <Text style={styles.tagArtistic}>Artistic Grants</Text>
        </View>

        <View style={styles.iconCircle}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircleGradient}
          />
          <MaterialCommunityIcons name="creation" size={72} color={AuthColors.profileBrand} />
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>Temukan Masa Depan{'\n'}Akademikmu dengan AI</Text>
        <Text style={styles.subtitle}>
          Algoritma cerdas kami menganalisis ribuan peluang untuk memberikan rekomendasi
          yang paling cocok untukmu.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  orbTopRight: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  graphicArea: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    marginBottom: 16,
  },
  orbitOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.13)',
  },
  orbitInner: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  floatingTag: {
    position: 'absolute',
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  tagTopLeft: {
    top: 16,
    left: 0,
  },
  tagBottomRight: {
    bottom: 46,
    right: -8,
  },
  tagStem: {
    fontFamily: FontFamily.extraBold,
    fontSize: 10,
    lineHeight: 15,
    color: '#92400E',
  },
  tagArtistic: {
    fontFamily: FontFamily.extraBold,
    fontSize: 10,
    lineHeight: 15,
    color: '#BA1A1A',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: AuthColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: AuthColors.brandIndigo,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 8,
  },
  iconCircleGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  textBlock: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.white,
    textAlign: 'center',
  },
  subtitle: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
});
