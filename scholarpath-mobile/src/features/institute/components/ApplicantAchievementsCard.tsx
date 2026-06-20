import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { type ApplicantAchievement } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantAchievementsCardProps = {
  achievements: ApplicantAchievement[];
};

export function ApplicantAchievementsCard({ achievements }: ApplicantAchievementsCardProps) {
  const section = achievements[0];
  if (!section) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={AuthColors.profileBrand} />
        <Text style={styles.title}>{section.title}</Text>
      </View>
      <View style={styles.answerBox}>
        <Text style={styles.answerText}>{section.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 17,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.35,
    color: AuthColors.textPrimary,
    textTransform: 'uppercase',
  },
  answerBox: {
    backgroundColor: '#F5F2FE',
    borderRadius: 12,
    padding: 16,
  },
  answerText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    color: '#464554',
  },
});
