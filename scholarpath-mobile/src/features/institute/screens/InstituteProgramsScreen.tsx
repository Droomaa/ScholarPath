import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useInstitutePrograms } from '@/src/context/institute/InstituteProgramsContext';
import {
  InstituteProgramCard,
  InstituteTopBar,
  ProgramStatusTabs,
} from '@/src/features/institute/components';
import { type InstituteProgramTab } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

export function InstituteProgramsScreen() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const {
    getProgramsByTab,
    isLoading,
    isRefreshing,
    error,
    refreshPrograms,
  } = useInstitutePrograms();
  const [selectedTab, setSelectedTab] = useState<InstituteProgramTab>('active');

  useEffect(() => {
    if (status === 'active' || status === 'review' || status === 'closed') {
      setSelectedTab(status);
    }
  }, [status]);

  const programs = useMemo(() => getProgramsByTab(selectedTab), [getProgramsByTab, selectedTab]);

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
              void refreshPrograms();
            }}
            tintColor={AuthColors.brandPrimary}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Programs</Text>
          <Text style={styles.subtitle}>Oversee institutional scholarships and grants.</Text>
        </View>

        <ProgramStatusTabs selected={selectedTab} onSelect={setSelectedTab} />

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={AuthColors.brandPrimary} />
            <Text style={styles.stateText}>Memuat program institusi...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => void refreshPrograms()}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error ? (
          <View style={styles.list}>
            {programs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No programs in this category</Text>
                <Text style={styles.emptySubtitle}>
                  Programs owned by your institution will appear here.
                </Text>
              </View>
            ) : (
              programs.map((program) => (
                <InstituteProgramCard
                  key={program.id}
                  program={program}
                  onViewPress={() => router.push(`/institute-program/${program.id}` as Href)}
                />
              ))
            )}
          </View>
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
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  header: {
    gap: 4,
    paddingBottom: 8,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: '#464554',
  },
  list: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: AuthColors.textPrimary,
  },
  emptySubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  stateText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: AuthColors.textSecondary,
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
