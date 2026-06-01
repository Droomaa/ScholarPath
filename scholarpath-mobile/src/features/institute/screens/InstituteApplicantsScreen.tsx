import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useInstituteApplicants } from '@/src/context/institute/InstituteApplicantsContext';
import {
  ApplicantCard,
  ApplicantFilterChips,
  ApplicantProgramChips,
  ApplicantStatsGrid,
  InstituteTopBar,
} from '@/src/features/institute/components';
import {
  APPLICANT_PROGRAM_FILTERS,
  filterApplicants,
  getInstituteStats,
} from '@/src/features/institute/constants/institute-applicants';
import { type ApplicantStatus } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 5;

export function InstituteApplicantsScreen() {
  const { applicants } = useInstituteApplicants();
  const { status: statusParam, program: programParam } = useLocalSearchParams<{
    status?: string;
    program?: string;
  }>();
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'all'>('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (
      statusParam === 'pending' ||
      statusParam === 'accepted' ||
      statusParam === 'rejected' ||
      statusParam === 'all'
    ) {
      setStatusFilter(statusParam);
    }
  }, [statusParam]);

  useEffect(() => {
    if (programParam) {
      setProgramFilter(programParam);
      setVisibleCount(PAGE_SIZE);
    }
  }, [programParam]);

  const stats = getInstituteStats(applicants);

  const applicantsFiltered = useMemo(
    () =>
      filterApplicants(applicants, {
        status: statusFilter,
        programId: programFilter === 'all' ? undefined : programFilter,
        query: searchQuery,
      }),
    [applicants, statusFilter, programFilter, searchQuery]
  );

  const visibleApplicants = applicantsFiltered.slice(0, visibleCount);

  return (
    <View style={styles.screen}>
      <InstituteTopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={AuthColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search applicants"
            placeholderTextColor={AuthColors.textMuted}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setVisibleCount(PAGE_SIZE);
            }}
          />
        </View>

        <ApplicantFilterChips selected={statusFilter} onSelect={setStatusFilter} />
        <ApplicantProgramChips
          selected={programFilter}
          onSelect={setProgramFilter}
          programs={APPLICANT_PROGRAM_FILTERS}
        />

        <ApplicantStatsGrid
          totalReview={stats.totalApplicants}
          activePrograms={stats.activeProgramsCount}
          pendingReviews={stats.pendingReviews}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Applicants</Text>
          <Text style={styles.sectionCount}>{applicantsFiltered.length} candidates</Text>
        </View>

        <View style={styles.list}>
          {visibleApplicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              onPress={() => router.push(`/institute-applicant/${applicant.id}` as Href)}
            />
          ))}
        </View>

        {visibleCount < applicantsFiltered.length ? (
          <Pressable
            style={styles.loadMoreButton}
            onPress={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
            <Text style={styles.loadMoreText}>Load More Applicants</Text>
          </Pressable>
        ) : null}
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
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: AuthColors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.textPrimary,
  },
  sectionCount: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: AuthColors.textMuted,
  },
  list: {
    gap: 12,
  },
  loadMoreButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: AuthColors.profileBrand,
    borderRadius: 9999,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 4,
  },
  loadMoreText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.profileBrand,
  },
});
