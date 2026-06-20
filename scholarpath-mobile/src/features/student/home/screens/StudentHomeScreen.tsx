import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useExplorePrograms } from '@/src/context/student/ExploreProgramsContext';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import {
  AiRecommendationCard,
  HomeTopBar,
  OlympiadCard,
  ScholarshipCard,
  SectionHeader,
} from '@/src/features/student/home/components';
import {
  mapProgramToOlympiadItem,
  mapProgramToScholarshipItem,
} from '@/src/features/student/home/utils/map-home-programs';
import { filterProgramsForStudentLevel } from '@/src/services/explore/resolve-education-levels';
import { AuthColors, AuthTypography } from '@/src/theme';
import { getFirstName } from '@/src/utils/getFirstName';

const HOME_SECTION_LIMIT = 6;

export function StudentHomeScreen() {
  const { fullName, educationLevel, hasAiRecommendationHistory, aiRecommendation } =
    useStudentSession();
  const { programs } = useExplorePrograms();
  const firstName = getFirstName(fullName);

  const visiblePrograms = useMemo(
    () => filterProgramsForStudentLevel(programs, educationLevel),
    [programs, educationLevel]
  );

  const scholarshipItems = useMemo(
    () =>
      visiblePrograms
        .filter((program) => program.category === 'beasiswa')
        .slice(0, HOME_SECTION_LIMIT)
        .map(mapProgramToScholarshipItem),
    [visiblePrograms]
  );

  const olympiadItems = useMemo(
    () =>
      visiblePrograms
        .filter((program) => program.category === 'kompetisi')
        .slice(0, HOME_SECTION_LIMIT)
        .map(mapProgramToOlympiadItem),
    [visiblePrograms]
  );

  return (
    <View style={styles.screen}>
      <HomeTopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>Halo, {firstName} 👋</Text>
          <Text style={styles.greetingSubtitle}>
            Ayo temukan peluang masa depanmu hari ini.
          </Text>
        </View>

        <AiRecommendationCard
          hasHistory={hasAiRecommendationHistory}
          recommendation={aiRecommendation}
          onStartAiPress={() => router.push('/ai-recommendation' as Href)}
          onRegisterPress={() => {
            if (aiRecommendation?.programId) {
              router.push(`/program/${aiRecommendation.programId}` as Href);
            }
          }}
        />

        <View style={styles.section}>
          <SectionHeader
            title="Rekomendasi Beasiswa"
            onSeeAllPress={() => router.push('/explore')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {scholarshipItems.length === 0 ? (
              <Text style={styles.emptyHint}>Belum ada beasiswa untuk ditampilkan.</Text>
            ) : (
              scholarshipItems.map((item) => (
                <ScholarshipCard
                  key={item.id}
                  item={item}
                  showMatch={hasAiRecommendationHistory}
                  onPress={() => router.push(`/program/${item.id}` as Href)}
                />
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Olimpiade & Lomba"
            onSeeAllPress={() => router.push('/explore')}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}>
            {olympiadItems.length === 0 ? (
              <Text style={styles.emptyHint}>Belum ada kompetisi untuk ditampilkan.</Text>
            ) : (
              olympiadItems.map((item) => (
                <OlympiadCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/program/${item.id}` as Href)}
                />
              ))
            )}
          </ScrollView>
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
  greeting: {
    gap: 4,
  },
  greetingTitle: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
  },
  greetingSubtitle: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
  },
  section: {
    gap: 16,
  },
  horizontalList: {
    gap: 16,
    paddingRight: 20,
  },
  emptyHint: {
    ...AuthTypography.profileInput,
    color: AuthColors.textMuted,
    paddingVertical: 8,
  },
});
