import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useExplorePrograms } from '@/src/context/student/ExploreProgramsContext';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import {
  CategoryChips,
  ExploreCategory,
  ExploreSearchBar,
  JenjangFilter,
  type JenjangFilterValue,
  ProgramListCard,
  SortOption,
  SortToggle,
} from '@/src/features/student/explore/components';
import { getJenjangFilterOptions } from '@/src/features/student/explore/constants/explore-programs';
import { HomeTopBar } from '@/src/features/student/home/components';
import { filterProgramsForStudentLevel } from '@/src/services/explore/resolve-education-levels';
import { AuthColors, AuthTypography } from '@/src/theme';

function getDefaultJenjangFilter(
  options: readonly JenjangFilterValue[],
  userEducationLevel: string
): JenjangFilterValue {
  if (userEducationLevel === 'SMA' && options.includes('SMA')) {
    return 'SMA';
  }
  if (userEducationLevel === 'SMP' && options.includes('SMP')) {
    return 'SMP';
  }
  return options[0] ?? 'semua';
}

export function StudentExploreScreen() {
  const { educationLevel } = useStudentSession();
  const { programs, isLoading, refresh } = useExplorePrograms();
  const [refreshing, setRefreshing] = useState(false);

  const jenjangOptions = useMemo(
    () => getJenjangFilterOptions(educationLevel),
    [educationLevel]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<ExploreCategory>('semua');
  const [selectedJenjang, setSelectedJenjang] = useState<JenjangFilterValue>(() =>
    getDefaultJenjangFilter(jenjangOptions, educationLevel)
  );
  const [sortBy, setSortBy] = useState<SortOption>('terbaru');

  const filteredPrograms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let results = filterProgramsForStudentLevel(programs, educationLevel);

    if (selectedJenjang !== 'semua') {
      results = results.filter((program) => program.educationLevels.includes(selectedJenjang));
    }

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
  }, [category, educationLevel, programs, searchQuery, selectedJenjang, sortBy]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const showInitialLoader = isLoading && programs.length === 0;

  return (
    <View style={styles.screen}>
      <HomeTopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
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
          {showInitialLoader ? (
            <ActivityIndicator
              size="large"
              color={AuthColors.profileBrand}
              style={styles.loader}
            />
          ) : filteredPrograms.length === 0 ? (
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
  loader: {
    paddingVertical: 24,
  },
  emptyText: {
    ...AuthTypography.profileInput,
    color: AuthColors.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
