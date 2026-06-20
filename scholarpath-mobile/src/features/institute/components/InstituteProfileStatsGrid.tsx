import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { type InstituteProfileStats } from '@/src/features/institute/utils/get-institute-profile-stats';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteProfileStatsGridProps = InstituteProfileStats;

export function InstituteProfileStatsGrid({
  activePrograms,
  publishedPrograms,
  totalApplicants,
}: InstituteProfileStatsGridProps) {
  return (
    <View style={styles.grid}>
      <View style={styles.smallCard}>
        <Text style={styles.smallLabel}>Active Programs</Text>
        <Text style={styles.smallValue}>{activePrograms}</Text>
      </View>
      <View style={styles.smallCard}>
        <Text style={styles.smallLabel}>Program Published</Text>
        <Text style={styles.smallValue}>{publishedPrograms}</Text>
      </View>
      <View style={styles.totalCard}>
        <View style={styles.totalContent}>
          <Text style={styles.totalLabel}>Total Applicants</Text>
          <Text style={styles.totalValue}>{totalApplicants.toLocaleString()}</Text>
        </View>
        <View style={styles.totalIconWrap}>
          <Ionicons name="trending-up" size={20} color={AuthColors.white} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  smallCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#F5F2FE',
    borderRadius: 16,
    padding: 17,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  smallLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: '#464554',
    textTransform: 'uppercase',
  },
  smallValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.28,
    color: '#4648D4',
  },
  totalCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6063EE',
    borderRadius: 16,
    padding: 16,
    minHeight: 88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  totalContent: {
    gap: 4,
  },
  totalLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: '#FFFBFF',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.28,
    color: '#FFFBFF',
  },
  totalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 251, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
