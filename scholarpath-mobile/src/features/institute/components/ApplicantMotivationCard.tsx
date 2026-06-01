import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantMotivationCardProps = {
  motivationAnswer: string;
};

export function ApplicantMotivationCard({ motivationAnswer }: ApplicantMotivationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={20} color={AuthColors.profileBrand} />
        <Text style={styles.title}>Why they choose this program?</Text>
      </View>
      <Text style={styles.body}>{motivationAnswer}</Text>
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
    gap: 9,
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
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    color: '#464554',
  },
});
