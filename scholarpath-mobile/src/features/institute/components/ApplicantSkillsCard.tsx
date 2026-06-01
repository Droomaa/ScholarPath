import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { type ApplicantSkill } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantSkillsCardProps = {
  skills: ApplicantSkill[];
};

export function ApplicantSkillsCard({ skills }: ApplicantSkillsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="star-outline" size={20} color="#FFFBFF" />
        <Text style={styles.title}>Key Skills</Text>
      </View>
      <View style={styles.list}>
        {skills.map((skill) => (
          <View key={skill.name} style={styles.row}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{skill.level}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#6063EE',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.35,
    color: '#FFFBFF',
    textTransform: 'uppercase',
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skillName: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFBFF',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 251, 255, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFBFF',
  },
});
