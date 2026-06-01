import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  InstituteProgramCard,
  InstituteTopBar,
  ProgramStatusTabs,
} from '@/src/features/institute/components';
import { getProgramsByTab } from '@/src/features/institute/constants/institute-programs';
import { type InstituteProgramTab } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

export function InstituteProgramsScreen() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const [selectedTab, setSelectedTab] = useState<InstituteProgramTab>('active');

  useEffect(() => {
    if (status === 'active' || status === 'review' || status === 'closed') {
      setSelectedTab(status);
    }
  }, [status]);

  const programs = useMemo(() => getProgramsByTab(selectedTab), [selectedTab]);

  return (
    <View style={styles.screen}>
      <InstituteTopBar />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Programs</Text>
          <Text style={styles.subtitle}>Oversee institutional scholarships and grants.</Text>
        </View>

        <ProgramStatusTabs selected={selectedTab} onSelect={setSelectedTab} />

        <View style={styles.list}>
          {programs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No programs in this category</Text>
              <Text style={styles.emptySubtitle}>
                Programs will appear here based on their current status.
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
});
