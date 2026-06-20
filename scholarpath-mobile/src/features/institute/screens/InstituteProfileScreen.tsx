import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useInstituteApplicants } from '@/src/context/institute/InstituteApplicantsContext';
import { useInstitutePrograms } from '@/src/context/institute/InstituteProgramsContext';
import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import {
  InstituteProfileHeroCard,
  InstituteProfileMenuItem,
  InstituteProfileStatsGrid,
  InstituteTopBar,
} from '@/src/features/institute/components';
import { getInstituteProfileStats } from '@/src/features/institute/utils/get-institute-profile-stats';
import { AuthColors, FontFamily } from '@/src/theme';

export function InstituteProfileScreen() {
  const { instituteName, email, contactNumber, address, about, logoUri } = useInstituteSession();
  const { programs } = useInstitutePrograms();
  const { applicants } = useInstituteApplicants();
  const stats = getInstituteProfileStats(programs, applicants);

  return (
    <View style={styles.screen}>
      <InstituteTopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <InstituteProfileHeroCard
          instituteName={instituteName}
          email={email}
          contactNumber={contactNumber}
          address={address}
          logoUri={logoUri}
        />

        <View style={styles.statsWrap}>
          <InstituteProfileStatsGrid {...stats} />
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.sectionTitle}>About Institution</Text>
          <Text style={styles.aboutText}>{about || '—'}</Text>
        </View>

        <View style={styles.managementSection}>
          <Text style={styles.managementTitle}>Management</Text>
          <View style={styles.menuCard}>
            <InstituteProfileMenuItem
              icon="create-outline"
              title="Edit Profile"
              subtitle="Update institution details"
              onPress={() => router.push('/institute-edit-profile' as Href)}
            />
            <InstituteProfileMenuItem
              icon="settings-outline"
              title="Settings"
              subtitle="Team Management and others"
              showDivider
              onPress={() => router.push('/institute-settings' as Href)}
            />
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
    paddingBottom: 32,
    gap: 24,
  },
  statsWrap: {
    paddingHorizontal: 20,
  },
  aboutCard: {
    marginHorizontal: 20,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#F5F2FE',
    borderRadius: 16,
    padding: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  aboutText: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    color: '#464554',
  },
  managementSection: {
    gap: 12,
    paddingHorizontal: 20,
  },
  managementTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  menuCard: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
