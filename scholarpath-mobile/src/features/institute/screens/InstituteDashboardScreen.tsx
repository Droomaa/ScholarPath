import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import {
  ApplicationsChart,
  InstituteTopBar,
  QuickActionCard,
  StatCard,
  UpcomingDeadlineItem,
} from '@/src/features/institute/components';
import { getInstituteStats } from '@/src/features/institute/constants/institute-applicants';
import { getActiveProgramsForDeadlines } from '@/src/features/institute/constants/institute-programs';
import { AuthColors, FontFamily } from '@/src/theme';

export function InstituteDashboardScreen() {
  const { instituteName, memberSince } = useInstituteSession();
  const stats = getInstituteStats();
  const upcomingPrograms = getActiveProgramsForDeadlines();
  const displayName = instituteName || 'Global Tech Academy';
  const analyticsMemberSince = memberSince || new Date().toISOString();

  return (
    <View style={styles.screen}>
      <InstituteTopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <MaterialCommunityIcons name="domain" size={20} color={AuthColors.white} />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeGreeting}>Hello,</Text>
            <Text style={styles.welcomeTitle} numberOfLines={3}>
              {displayName}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard label="Active Programs" value={stats.activePrograms} badge="+2" />
            <StatCard label="Total Applicants" value={stats.totalApplicants} badge="+14%" />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Pending Reviews"
              value={stats.pendingReviews}
              badge="High"
              badgeBg="#FFFBEB"
              badgeColor="#D97706"
            />
            <StatCard
              label="Accepted"
              value={stats.accepted}
              badge="Global"
              badgeBg="rgba(70, 72, 212, 0.1)"
              badgeColor="#4648D4"
            />
          </View>
        </View>

        <ApplicationsChart memberSince={analyticsMemberSince} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickActionCard
              icon="clipboard"
              label="Review Pending Applicants"
              onPress={() =>
                router.push('/(institute-tabs)/applicants?status=pending' as Href)
              }
            />
            <QuickActionCard
              icon="chart"
              label="Detailed Analytics"
              onPress={() => router.push('/institute-analytics' as Href)}
            />
            <QuickActionCard
              icon="settings"
              label="Institution Settings"
              onPress={() => router.push('/institute-settings' as Href)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
            <Text
              style={styles.viewAll}
              onPress={() =>
                router.push('/(institute-tabs)/programs?status=active' as Href)
              }>
              View All
            </Text>
          </View>
          <View style={styles.deadlineList}>
            {upcomingPrograms.map((program) => (
              <UpcomingDeadlineItem
                key={program.id}
                program={program}
                onPress={() => router.push(`/institute-program/${program.id}` as Href)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 32,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6063EE',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  welcomeText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  welcomeGreeting: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: '#565E74',
  },
  welcomeTitle: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
  },
  statsGrid: {
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.textPrimary,
  },
  viewAll: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.profileBrand,
  },
  quickActions: {
    gap: 12,
  },
  deadlineList: {
    gap: 12,
  },
});
