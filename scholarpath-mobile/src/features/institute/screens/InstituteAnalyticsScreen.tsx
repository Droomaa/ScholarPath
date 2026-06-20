import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import { ApplicationsChart } from '@/src/features/institute/components';
import { getInstituteStats } from '@/src/features/institute/constants/institute-applicants';
import { AuthColors, FontFamily } from '@/src/theme';

export function InstituteAnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { memberSince } = useInstituteSession();
  const stats = getInstituteStats();
  const analyticsMemberSince = memberSince || new Date().toISOString();

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Detailed Analytics</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Performance overview for your institution.</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.totalApplicants}</Text>
            <Text style={styles.statLabel}>Total Applicants</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.pendingReviews}</Text>
            <Text style={styles.statLabel}>Pending Reviews</Text>
          </View>
        </View>
        <ApplicationsChart memberSince={analyticsMemberSince} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AuthColors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(252, 248, 255, 0.8)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(199, 196, 215, 0.2)',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontFamily: FontFamily.bold, fontSize: 18, color: AuthColors.profileBrand },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, gap: 20 },
  subtitle: { fontFamily: FontFamily.regular, fontSize: 16, color: AuthColors.textSecondary },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: AuthColors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    gap: 4,
  },
  statValue: { fontFamily: FontFamily.extraBold, fontSize: 24, color: '#4648D4' },
  statLabel: { fontFamily: FontFamily.medium, fontSize: 12, color: AuthColors.textSecondary },
});
