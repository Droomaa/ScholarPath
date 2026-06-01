import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import {
  AiRecommendationCard,
  HomeTopBar,
  OlympiadCard,
  ScholarshipCard,
  SectionHeader,
} from '@/src/features/student/home/components';
import {
  OLYMPIAD_ITEMS,
  SCHOLARSHIP_ITEMS,
} from '@/src/features/student/home/constants/home-mock-data';
import { AuthColors, AuthTypography } from '@/src/theme';
import { getFirstName } from '@/src/utils/getFirstName';

export function StudentHomeScreen() {
  const { fullName, hasAiRecommendationHistory, aiRecommendation } = useStudentSession();
  const firstName = getFirstName(fullName);

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
            {SCHOLARSHIP_ITEMS.map((item) => (
              <ScholarshipCard
                key={item.id}
                item={item}
                showMatch={hasAiRecommendationHistory}
                onPress={() => router.push(`/program/${item.id}` as Href)}
              />
            ))}
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
            {OLYMPIAD_ITEMS.map((item) => (
              <OlympiadCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/program/${item.id}` as Href)}
              />
            ))}
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
});
