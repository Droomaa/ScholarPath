import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

export function AiSimilarityCard() {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons name="creation" size={18} color="#FFD400" />
        <Text style={styles.headerText}>SIMILARITY MATCHING</Text>
      </View>
      <Text style={styles.body}>
        Your selections help ScholarPath AI discover opportunities that truly fit your strengths
        and interests.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.brandPrimary,
    borderWidth: 1,
    borderColor: 'rgba(198, 197, 215, 0.3)',
    borderRadius: 24,
    padding: 25,
    gap: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontFamily: FontFamily.extraBold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.3,
    color: '#FFD400',
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 21,
    color: AuthColors.white,
  },
});
