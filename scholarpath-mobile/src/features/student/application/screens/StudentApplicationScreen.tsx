import { router, type Href } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useApplications } from '@/src/context/shared/ApplicationContext';
import {
  ActiveProgramCard,
  ApplicationEmptyState,
  ApplicationSectionHeader,
  RegistrationStatusCard,
} from '@/src/features/student/application/components';
import { HomeTopBar } from '@/src/features/student/home/components';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

function getRegisterHref(programId: string, activeProgramId: string): Href {
  return `/program-register/${programId}?activeId=${activeProgramId}` as Href;
}

export function StudentApplicationScreen() {
  const { activePrograms, registrations, removeActiveProgram } = useApplications();

  const handleRemoveActiveProgram = (programTitle: string, activeProgramId: string) => {
    Alert.alert(
      'Hapus Program Aktif?',
      `Yakin ingin menghapus "${programTitle}" dari daftar program aktif?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => removeActiveProgram(activeProgramId),
        },
      ]
    );
  };

  const hasRegistrations = registrations.length > 0;
  const hasActivePrograms = activePrograms.length > 0;

  return (
    <View style={styles.screen}>
      <HomeTopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Pendaftaran Saya</Text>
          <Text style={styles.pageSubtitle}>
            Pantau status pendaftaran beasiswa dan program pendidikanmu.
          </Text>
        </View>

        <View style={styles.section}>
          <ApplicationSectionHeader
            title="Status Pendaftaran"
            showSeeAll={hasRegistrations}
            onSeeAllPress={() => router.push('/track-application' as Href)}
          />
          {hasRegistrations ? (
            <View style={styles.list}>
              {registrations.map((application) => (
                <RegistrationStatusCard key={application.id} application={application} />
              ))}
            </View>
          ) : (
            <ApplicationEmptyState />
          )}
        </View>

        <View style={styles.section}>
          <ApplicationSectionHeader title="Program Aktif" />
          {hasActivePrograms ? (
            <View style={styles.list}>
              {activePrograms.map((program) => {
                const programId = program.programId ?? program.id;
                const registerHref = getRegisterHref(programId, program.id);

                return (
                  <ActiveProgramCard
                    key={program.id}
                    program={program}
                    onCompleteDocumentsPress={() => router.push(registerHref)}
                    onPress={() => router.push(registerHref)}
                    onRemovePress={() => handleRemoveActiveProgram(program.title, program.id)}
                  />
                );
              })}
            </View>
          ) : (
            <ApplicationEmptyState />
          )}
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
    gap: 24,
  },
  pageHeader: {
    gap: 4,
  },
  pageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
  },
  pageSubtitle: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
  },
  section: {
    gap: 16,
  },
  list: {
    gap: 16,
  },
});
