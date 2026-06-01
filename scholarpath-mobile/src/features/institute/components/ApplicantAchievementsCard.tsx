import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { type ApplicantAchievement } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantAchievementsCardProps = {
  achievements: ApplicantAchievement[];
};

export function ApplicantAchievementsCard({ achievements }: ApplicantAchievementsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="trophy-outline" size={18} color={AuthColors.profileBrand} />
        <Text style={styles.title}>Top Achievements</Text>
      </View>
      <View style={styles.list}>
        {achievements.map((achievement, index) => (
          <View key={`${achievement.title}-${index}`} style={styles.item}>
            <Ionicons
              name={index === 0 ? 'medal-outline' : 'ribbon-outline'}
              size={24}
              color={AuthColors.profileBrand}
            />
            <View style={styles.content}>
              <Text style={styles.itemTitle}>{achievement.title}</Text>
              <Text style={styles.itemDescription}>{achievement.description}</Text>
            </View>
          </View>
        ))}
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
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.35,
    color: AuthColors.textPrimary,
    textTransform: 'uppercase',
  },
  list: {
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#F5F2FE',
    borderRadius: 12,
    padding: 16,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  itemDescription: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
  },
});
