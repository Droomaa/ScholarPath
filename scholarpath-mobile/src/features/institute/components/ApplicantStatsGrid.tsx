import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantStatsGridProps = {
  totalReview: number;
  activePrograms: number;
  pendingReviews: number;
};

export function ApplicantStatsGrid({
  totalReview,
  activePrograms,
  pendingReviews,
}: ApplicantStatsGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.mainCard}>
        <Text style={styles.mainLabel}>Total Review</Text>
        <Text style={styles.mainValue}>{totalReview.toLocaleString()}</Text>
        <Text style={styles.mainTrend}>↑ 12% from last month</Text>
      </View>
      <View style={styles.sideCol}>
        <View style={styles.smallCard}>
          <View style={styles.smallTop}>
            <Text style={styles.smallLabel}>Active Programs</Text>
            <Ionicons name="folder-outline" size={16} color={AuthColors.textMuted} />
          </View>
          <Text style={styles.smallValue}>{activePrograms}</Text>
        </View>
        <View style={styles.smallCard}>
          <View style={styles.smallTop}>
            <Text style={styles.smallLabel}>Pending Reviews</Text>
            <Ionicons name="alert-circle" size={16} color="#BA1A1A" />
          </View>
          <Text style={[styles.smallValue, styles.pendingValue]}>{pendingReviews}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  mainCard: {
    flex: 1.2,
    backgroundColor: '#4648D4',
    borderRadius: 16,
    padding: 16,
    gap: 4,
    justifyContent: 'center',
    minHeight: 120,
  },
  mainLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  mainValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: 28,
    lineHeight: 34,
    color: AuthColors.white,
  },
  mainTrend: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    color: '#90E7BB',
  },
  sideCol: {
    flex: 1,
    gap: 12,
  },
  smallCard: {
    flex: 1,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 14,
    padding: 12,
    gap: 4,
    justifyContent: 'center',
  },
  smallTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    color: AuthColors.textSecondary,
    flex: 1,
  },
  smallValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: 22,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  pendingValue: {
    color: '#BA1A1A',
  },
});
