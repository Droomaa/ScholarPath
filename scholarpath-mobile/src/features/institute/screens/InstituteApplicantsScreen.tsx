import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useInstituteApplicants } from '@/src/context/institute/InstituteApplicantsContext';
import { useInstitutePrograms } from '@/src/context/institute/InstituteProgramsContext';
import {
  ApplicantCard,
  ApplicantFilterChips,
  ApplicantProgramChips,
  ApplicantStatsGrid,
  InstituteTopBar,
} from '@/src/features/institute/components';
import { buildApplicantProgramFilters, getApplicantListStats } from '@/src/services/institute';
import { filterApplicants } from '@/src/features/institute/constants/institute-applicants';
import { type ApplicantStatus } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';

const PAGE_SIZE = 5;

export function InstituteApplicantsScreen() {
  const {
    applicants,
    isLoading,
    isRefreshing,
    error,
    refreshApplicants,
  } = useInstituteApplicants();
  const { programs } = useInstitutePrograms();
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

  const programFilters = useMemo(
    () => buildApplicantProgramFilters(applicants, programs),
    [applicants, programs]
  );
  const stats = getApplicantListStats(applicants);

  const applicantsFiltered = useMemo(
    () =>
      filterApplicants(applicants, {
        status: statusFilter,
        programId: programFilter === 'all' ? undefined : programFilter,
        query: searchQuery,
        programs,
      }),
    [applicants, statusFilter, programFilter, searchQuery, programs]
  );

  const visibleApplicants = applicantsFiltered.slice(0, visibleCount);

  return (
    <View style={styles.screen}>
      <InstituteTopBar />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void refreshApplicants();
            }}
            tintColor={AuthColors.brandPrimary}
          />
        }>
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
          programs={programFilters}
        />

        <ApplicantStatsGrid
          totalReview={stats.totalApplicants}
          activePrograms={stats.activeProgramsCount}
          pendingReviews={stats.pendingReviews}
        />

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={AuthColors.brandPrimary} />
            <Text style={styles.stateText}>Memuat daftar pendaftar...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => void refreshApplicants()}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error ? (
          <>
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

            {applicantsFiltered.length === 0 ? (
              <View style={styles.centeredState}>
                <Text style={styles.stateText}>Belum ada pendaftar untuk instansi ini.</Text>
              </View>
            ) : null}

            {visibleCount < applicantsFiltered.length ? (
              <Pressable
                style={styles.loadMoreButton}
                onPress={() => setVisibleCount((prev) => prev + PAGE_SIZE)}>
                <Text style={styles.loadMoreText}>Load More Applicants</Text>
              </Pressable>
            ) : null}
          </>
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
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  stateText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: AuthColors.brandPrimary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.white,
  },
});
