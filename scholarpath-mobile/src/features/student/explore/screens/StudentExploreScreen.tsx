import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import {
  CategoryChips,
  ExploreCategory,
  ExploreSearchBar,
  JenjangFilter,
  ProgramListCard,
  SortOption,
  SortToggle,
} from '@/src/features/student/explore/components';
import {
  EXPLORE_PROGRAMS,
  getJenjangOptions,
} from '@/src/features/student/explore/constants/explore-programs';
import { HomeTopBar } from '@/src/features/student/home/components';
import { EducationLevel } from '@/src/types/shared/program';
import { AuthColors, AuthTypography } from '@/src/theme';

function getDefaultJenjang(
  options: readonly EducationLevel[],
  userEducationLevel: string
): EducationLevel {
  if (userEducationLevel === 'SMA' && options.includes('SMA')) {
    return 'SMA';
  }
  if (userEducationLevel === 'SMP' && options.includes('SMP')) {
    return 'SMP';
  }
  return options[0];
}

export function StudentExploreScreen() {
  const { educationLevel } = useStudentSession();
  const jenjangOptions = useMemo(
    () => getJenjangOptions(educationLevel),
    [educationLevel]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<ExploreCategory>('semua');
  const [selectedJenjang, setSelectedJenjang] = useState<EducationLevel>(() =>
    getDefaultJenjang(jenjangOptions, educationLevel)
  );
  const [sortBy, setSortBy] = useState<SortOption>('terbaru');

  const filteredPrograms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let results = EXPLORE_PROGRAMS.filter((program) =>
      program.educationLevels.includes(selectedJenjang)
    );

    if (category !== 'semua') {
      results = results.filter((program) => program.category === category);
    }

    if (query) {
      results = results.filter(
        (program) =>
          program.title.toLowerCase().includes(query) ||
          program.provider.toLowerCase().includes(query)
      );
    }

    return [...results].sort((a, b) =>
      sortBy === 'terbaru' ? b.sortDate - a.sortDate : b.popularity - a.popularity
    );
  }, [category, searchQuery, selectedJenjang, sortBy]);

  return (
    <View style={styles.screen}>
      <HomeTopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Eksplorasi</Text>
          <Text style={styles.subtitle}>
            Temukan beasiswa dan kompetisi yang sesuai denganmu.
          </Text>
        </View>

        <ExploreSearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <CategoryChips selected={category} onSelect={setCategory} />

        <JenjangFilter
          options={jenjangOptions}
          selected={selectedJenjang}
          onSelect={setSelectedJenjang}
        />
        <SortToggle selected={sortBy} onSelect={setSortBy} />

        <View style={styles.list}>
          {filteredPrograms.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada program yang ditemukan.</Text>
          ) : (
            filteredPrograms.map((program) => (
              <ProgramListCard
                key={program.id}
                program={program}
                onSeeMorePress={() =>
                  router.push(`/program/${program.id}` as Href)
                }
              />
            ))
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
    gap: 20,
  },
  header: {
    gap: 4,
  },
  title: {
    ...AuthTypography.profileInput,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  subtitle: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
  },
  list: {
    gap: 16,
  },
  emptyText: {
    ...AuthTypography.profileInput,
    color: AuthColors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
