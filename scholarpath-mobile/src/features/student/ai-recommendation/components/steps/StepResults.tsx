import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getProgramById } from '@/src/features/student/explore/constants/explore-programs';
import { AiWizardHeader } from '@/src/features/student/ai-recommendation/components/AiWizardHeader';
import { getProgramRewardLabel } from '@/src/features/student/ai-recommendation/utils/match-programs';
import { type AiProgramMatch } from '@/src/types/student/ai-recommendation';
import { ProgramCategory } from '@/src/types/shared/program';
import { AuthColors, FontFamily } from '@/src/theme';

type StepResultsProps = {
  matches: AiProgramMatch[];
};

export function StepResults({ matches }: StepResultsProps) {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ProgramCategory>('beasiswa');

  const filteredMatches = useMemo(() => {
    return matches
      .filter((match) => getProgramById(match.programId)?.category === category)
      .map((match, index) => ({ ...match, rank: index + 1 }));
  }, [matches, category]);

  const topMatch = filteredMatches[0];
  const secondMatch = filteredMatches[1];
  const thirdMatch = filteredMatches[2];
  const restMatches = filteredMatches.slice(3);

  return (
    <View style={styles.screen}>
      <AiWizardHeader rightLabel="Result" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBlock}>
          <Text style={styles.pageTitle}>Top 5 Picks For You</Text>
          <Text style={styles.pageSubtitle}>
            Our AI analyzed hundreds opportunities to find your perfect matches.
          </Text>
        </View>

        <View style={styles.toggle}>
          <View
            style={[
              styles.toggleIndicator,
              category === 'kompetisi' && styles.toggleIndicatorRight,
            ]}
          />
          <Pressable style={styles.toggleButton} onPress={() => setCategory('beasiswa')}>
            <Text
              style={[
                styles.toggleText,
                category === 'beasiswa' && styles.toggleTextActive,
              ]}>
              Scholarships
            </Text>
          </Pressable>
          <Pressable style={styles.toggleButton} onPress={() => setCategory('kompetisi')}>
            <Text
              style={[
                styles.toggleText,
                category === 'kompetisi' && styles.toggleTextActive,
              ]}>
              Competitions
            </Text>
          </Pressable>
        </View>

        {filteredMatches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Belum ada rekomendasi di kategori ini</Text>
            <Text style={styles.emptySubtitle}>
              Coba ubah preferensi atau lihat kategori lainnya.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {topMatch ? <RankOneCard match={topMatch} /> : null}
            {secondMatch ? <RankTwoCard match={secondMatch} /> : null}
            {thirdMatch ? <RankThreeCard match={thirdMatch} /> : null}
            {restMatches.map((match) => (
              <RankListItem key={match.programId} match={match} />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.homeButton} onPress={() => router.replace('/(tabs)' as Href)}>
          <Text style={styles.homeButtonText}>Back To Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RankOneCard({ match }: { match: AiProgramMatch }) {
  const program = getProgramById(match.programId);
  if (!program) return null;

  return (
    <Pressable onPress={() => router.push(`/program/${program.id}` as Href)}>
      <LinearGradient
        colors={[AuthColors.brandPrimary, '#6366F1', AuthColors.loginGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.rankOneCard}>
        <View style={styles.rankOneTopRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankBadgeText}>RANK #1</Text>
          </View>
          <View style={styles.matchBadge}>
            <Ionicons name="star" size={13} color={AuthColors.white} />
            <Text style={styles.matchBadgeText}>{match.matchPercent}% MATCH</Text>
          </View>
        </View>

        <Text style={styles.rankOneTitle}>{program.title}</Text>
        <Text style={styles.rankOneDescription} numberOfLines={2}>
          {program.description}
        </Text>

        <View style={styles.insightBox}>
          <View style={styles.insightHeader}>
            <MaterialCommunityIcons name="creation" size={14} color="#90E7BB" />
            <Text style={styles.insightLabel}>AI INSIGHT</Text>
          </View>
          <Text style={styles.insightText}>"{match.insight}"</Text>
        </View>

        <View style={styles.rankOneFooter}>
          <View style={styles.rewardBox}>
            <Text style={styles.rewardLabel}>REWARD AMOUNT</Text>
            <Text style={styles.rewardValue} numberOfLines={2}>
              {getProgramRewardLabel(program)}
            </Text>
          </View>

          <View style={styles.footerDivider} />

          <Pressable
            style={styles.applyButton}
            onPress={(event) => {
              event.stopPropagation();
              router.push(`/program-register/${program.id}` as Href);
            }}>
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function RankTwoCard({ match }: { match: AiProgramMatch }) {
  const program = getProgramById(match.programId);
  if (!program) return null;

  return (
    <View style={styles.rankTwoCard}>
      <View style={styles.rankTwoHeader}>
        <Text style={styles.rankTwoLabel}>RANK #2</Text>
        <View style={styles.rankTwoMatchRow}>
          <Text style={styles.rankTwoMatch}>{match.matchPercent}%</Text>
          <Ionicons name="flash" size={12} color={AuthColors.brandPrimary} />
        </View>
      </View>
      <Text style={styles.rankTwoTitle}>{program.title}</Text>
      <View style={styles.perfectFitBox}>
        <MaterialCommunityIcons name="creation" size={18} color={AuthColors.brandPrimary} />
        <Text style={styles.perfectFitText}>
          <Text style={styles.perfectFitBold}>Perfect fit: </Text>
          {match.insight}
        </Text>
      </View>
      <View style={styles.rankTwoFooter}>
        <Text style={styles.rankTwoReward}>{getProgramRewardLabel(program)}</Text>
        <Pressable onPress={() => router.push(`/program/${program.id}` as Href)}>
          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={12} color={AuthColors.brandPrimary} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function RankThreeCard({ match }: { match: AiProgramMatch }) {
  const program = getProgramById(match.programId);
  if (!program) return null;

  return (
    <Pressable
      style={styles.rankThreeCard}
      onPress={() => router.push(`/program/${program.id}` as Href)}>
      <View style={styles.rankThreeNumber}>
        <Text style={styles.rankThreeNumberText}>3</Text>
      </View>
      <View style={styles.rankThreeContent}>
        <Text style={styles.rankThreeTitle}>{program.title}</Text>
        <View style={styles.rankThreeMeta}>
          <Text style={styles.rankThreeMatch}>{match.matchPercent}% Match</Text>
          <Text style={styles.rankThreeDot}>•</Text>
          <Text style={styles.rankThreeReward}>{getProgramRewardLabel(program)}</Text>
        </View>
      </View>
      <Ionicons name="bookmark-outline" size={18} color={AuthColors.textMuted} />
    </Pressable>
  );
}

function RankListItem({ match }: { match: AiProgramMatch }) {
  const program = getProgramById(match.programId);
  if (!program) return null;

  return (
    <Pressable
      style={styles.listItem}
      onPress={() => router.push(`/program/${program.id}` as Href)}>
      <View style={styles.listItemLeft}>
        <Text style={styles.listItemRank}>{String(match.rank).padStart(2, '0')}</Text>
        <Text style={styles.listItemTitle}>{program.title}</Text>
      </View>
      <View style={styles.listItemBadge}>
        <Text style={styles.listItemBadgeText}>{match.matchPercent}% MATCH</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AuthColors.background },
  scrollContent: { paddingHorizontal: 16, paddingTop: 23, paddingBottom: 120, gap: 32 },
  headerBlock: { gap: 8 },
  pageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    lineHeight: 36.4,
    color: AuthColors.textPrimary,
  },
  pageSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textSecondary,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: AuthColors.profileProgressTrack,
    borderRadius: 9999,
    padding: 4,
    position: 'relative',
  },
  toggleIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: '48%',
    height: 40,
    borderRadius: 9999,
    backgroundColor: AuthColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  toggleIndicatorRight: { left: '50%' },
  toggleButton: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  toggleText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: AuthColors.textSecondary,
  },
  toggleTextActive: { color: AuthColors.brandPrimary },
  list: { gap: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
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
  rankOneCard: { borderRadius: 24, padding: 24, gap: 8, overflow: 'hidden' },
  rankOneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 4,
  },
  rankBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 14.4,
    color: AuthColors.white,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  matchBadgeText: {
    fontFamily: FontFamily.extraBold,
    fontSize: 12,
    lineHeight: 14.4,
    color: AuthColors.white,
  },
  rankOneTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: AuthColors.white,
    paddingTop: 8,
  },
  rankOneDescription: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  insightBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 17,
    gap: 4,
    marginTop: 8,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 14.4,
    letterSpacing: 0.6,
    color: '#90E7BB',
    textTransform: 'uppercase',
  },
  insightText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  rankOneFooter: {
    gap: 0,
    paddingTop: 20,
    marginTop: 4,
  },
  rewardBox: {
    width: '100%',
    gap: 6,
    paddingBottom: 4,
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    marginVertical: 16,
  },
  rewardLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  },
  rewardValue: {
    fontFamily: FontFamily.extraBold,
    fontSize: 22,
    lineHeight: 30,
    color: AuthColors.white,
  },
  applyButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AuthColors.white,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 15,
    minHeight: 48,
  },
  applyButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: AuthColors.brandPrimary,
  },
  rankTwoCard: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileProgressTrack,
    borderRadius: 24,
    padding: 25,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rankTwoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankTwoLabel: {
    fontFamily: FontFamily.extraBold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 1,
    color: 'rgba(44, 42, 188, 0.4)',
    textTransform: 'uppercase',
  },
  rankTwoMatchRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rankTwoMatch: {
    fontFamily: FontFamily.extraBold,
    fontSize: 12,
    lineHeight: 14.4,
    color: AuthColors.brandPrimary,
  },
  rankTwoTitle: {
    fontFamily: FontFamily.regular,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
    paddingBottom: 8,
  },
  perfectFitBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(44, 42, 188, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(44, 42, 188, 0.1)',
    borderRadius: 12,
    padding: 13,
  },
  perfectFitText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textSecondary,
  },
  perfectFitBold: { fontFamily: FontFamily.bold, color: AuthColors.brandPrimary },
  rankTwoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  rankTwoReward: {
    fontFamily: FontFamily.extraBold,
    fontSize: 18,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  viewDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  viewDetailsText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: AuthColors.brandPrimary,
  },
  rankThreeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileProgressTrack,
    borderRadius: 24,
    padding: 21,
  },
  rankThreeNumber: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: AuthColors.profileChipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankThreeNumberText: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textMuted,
  },
  rankThreeContent: { flex: 1, gap: 2 },
  rankThreeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 25.6,
    color: AuthColors.textPrimary,
  },
  rankThreeMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankThreeMatch: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 14.4,
    color: '#10B981',
  },
  rankThreeDot: { color: AuthColors.textMuted },
  rankThreeReward: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 14.4,
    color: AuthColors.textSecondary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    padding: 17,
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  listItemRank: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.dot,
  },
  listItemTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textSecondary,
    flex: 1,
  },
  listItemBadge: {
    backgroundColor: AuthColors.profileChipBackground,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  listItemBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: -0.5,
    color: AuthColors.textMuted,
    textTransform: 'uppercase',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 17,
    backgroundColor: 'rgba(252, 248, 255, 0.9)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AuthColors.profileProgressTrack,
  },
  homeButton: {
    alignSelf: 'center',
    backgroundColor: AuthColors.brandPrimary,
    borderRadius: 20,
    paddingHorizontal: 28,
    height: 44,
    minWidth: 168,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AuthColors.brandPrimary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  homeButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.white,
  },
});
