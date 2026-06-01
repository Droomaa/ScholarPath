import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';
import type { AiRecommendation } from '@/src/types/student/student-session';

type AiRecommendationCardProps = {
  hasHistory: boolean;
  recommendation: AiRecommendation | null;
  onStartAiPress?: () => void;
  onRegisterPress?: () => void;
};

export function AiRecommendationCard({
  hasHistory,
  recommendation,
  onStartAiPress,
  onRegisterPress,
}: AiRecommendationCardProps) {
  if (!hasHistory || !recommendation) {
    return (
      <LinearGradient
        colors={['#6063EE', '#4648D4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.orbTopRight} />
        <View style={styles.orbBottomLeft} />
        <View style={styles.emptyContent}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="creation" size={13} color={AuthColors.white} />
            <Text style={styles.badgeText}>AI Recommended</Text>
          </View>
          <Text style={styles.emptyTitle}>Belum ada rekomendasi AI</Text>
          <Text style={styles.emptySubtitle}>
            Mulai sesi AI Recommendation untuk mendapatkan beasiswa dan peluang yang paling
            cocok dengan profilmu.
          </Text>
          <Pressable style={styles.ctaButton} onPress={onStartAiPress}>
            <Text style={styles.ctaText}>Mulai AI Recommendation</Text>
            <Ionicons name="arrow-forward" size={16} color={AuthColors.profileBrand} />
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#6063EE', '#4648D4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.leftCol}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="creation" size={13} color={AuthColors.white} />
              <Text style={styles.badgeText}>AI Recommended</Text>
            </View>
            <Text style={styles.subtitle}>{recommendation.subtitle}</Text>
          </View>
          <View style={styles.matchCol}>
            <Text style={styles.matchPercent}>{recommendation.matchPercent}%</Text>
            <Text style={styles.matchLabel}>MATCH</Text>
          </View>
        </View>
        <Text style={styles.title}>{recommendation.title}</Text>
        <View style={styles.providerRow}>
          <View style={styles.providerLogo}>
            <MaterialCommunityIcons name="domain" size={14} color={AuthColors.profileBrand} />
          </View>
          <Text style={styles.providerName}>{recommendation.provider}</Text>
        </View>
        <View style={styles.footerRow}>
          <View style={styles.deadlineRow}>
            <Ionicons name="calendar-outline" size={16} color={AuthColors.white} />
            <Text style={styles.deadlineText}>Deadline: {recommendation.deadline}</Text>
          </View>
          <Pressable style={styles.registerButton} onPress={onRegisterPress}>
            <Text style={styles.registerText}>Daftar{'\n'}Sekarang</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    overflow: 'hidden',
    shadowColor: AuthColors.profileProgressFill,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 8,
  },
  orbTopRight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    gap: 8,
  },
  emptyContent: {
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftCol: {
    flex: 1,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.white,
  },
  subtitle: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
    opacity: 0.9,
  },
  matchCol: {
    alignItems: 'flex-end',
  },
  matchPercent: {
    fontFamily: FontFamily.extraBold,
    fontSize: 28,
    lineHeight: 28,
    color: AuthColors.white,
  },
  matchLabel: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
    opacity: 0.8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
    lineHeight: 20,
    paddingTop: 8,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: AuthColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerName: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  deadlineText: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
  },
  registerButton: {
    backgroundColor: AuthColors.white,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  registerText: {
    ...AuthTypography.profileInput,
    color: AuthColors.profileBrand,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.white,
  },
  emptySubtitle: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.white,
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: AuthColors.white,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
  },
  ctaText: {
    ...AuthTypography.profileInput,
    color: AuthColors.profileBrand,
    fontFamily: FontFamily.semiBold,
  },
});
