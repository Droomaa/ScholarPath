import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  InstituteProgramAnalyticsCard,
  InstituteProgramDocumentsSection,
  InstituteProgramHeroBanner,
  InstituteProgramQuickStatCard,
  ProgramDocumentDetailOverlay,
  ProgramStatApplicantsIcon,
  ProgramStatCalendarIcon,
  ProgramStatPeopleIcon,
} from '@/src/features/institute/components';
import {
  formatProgramDeadlineFull,
  getInstituteProgramById,
  isProgramOverfilled,
} from '@/src/features/institute/constants/institute-programs';
import { AuthColors, FontFamily } from '@/src/theme';
import { type InstituteProgramDocument } from '@/src/types/institute/institute';

export function InstituteProgramDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = getInstituteProgramById(id ?? '');
  const [selectedDocument, setSelectedDocument] = useState<InstituteProgramDocument | null>(null);

  if (!program) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.notFound}>Program not found.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const overfilled = isProgramOverfilled(program);

  const handleViewApplicants = () => {
    router.push(`/(institute-tabs)/applicants?program=${program.id}` as Href);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={16} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Program Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <InstituteProgramHeroBanner program={program} />

        <View style={styles.statsGrid}>
          <InstituteProgramQuickStatCard
            icon={<ProgramStatCalendarIcon />}
            label="Application Deadline"
            value={formatProgramDeadlineFull(program.deadlineAt)}
          />
          <InstituteProgramQuickStatCard
            icon={<ProgramStatPeopleIcon />}
            label="Total Quota"
            value={String(program.quota)}
            suffix="People"
          />
          <InstituteProgramQuickStatCard
            icon={<ProgramStatApplicantsIcon />}
            label="Current Applicants"
            value={String(program.applicantCount)}
            valueSuffix={overfilled ? '(Overfilled)' : undefined}
            valueSuffixColor={overfilled ? '#BA1A1A' : undefined}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Analytics</Text>
          <InstituteProgramAnalyticsCard program={program} />
        </View>

        <InstituteProgramDocumentsSection
          documents={program.requiredDocuments}
          onDocumentPress={setSelectedDocument}
        />

        <Pressable style={styles.viewApplicantsButton} onPress={handleViewApplicants}>
          <MaterialCommunityIcons name="account-group-outline" size={18} color="#FFFBFF" />
          <Text style={styles.viewApplicantsText}>View Applicants</Text>
        </Pressable>
      </ScrollView>

      <ProgramDocumentDetailOverlay
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
    position: 'relative',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFound: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: AuthColors.textPrimary,
  },
  backLink: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.profileBrand,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(252, 248, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.profileBrand,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 23,
    paddingBottom: 32,
    gap: 24,
  },
  statsGrid: {
    gap: 16,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  viewApplicantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6063EE',
    borderRadius: 9999,
    minHeight: 50,
    marginTop: 8,
  },
  viewApplicantsText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#FFFBFF',
  },
});
