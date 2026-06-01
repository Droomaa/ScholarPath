import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthSpacing, AuthTypography } from '@/src/theme';

export function BrandHeader() {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <MaterialCommunityIcons name="school" size={24} color={AuthColors.brandPrimary} />
        <Text style={styles.title}>ScholarPath</Text>
      </View>
      <Text style={styles.tagline}>Empowering your academic journey</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: AuthSpacing.sm,
    marginBottom: AuthSpacing.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AuthSpacing.sm,
  },
  title: {
    ...AuthTypography.brandTitle,
    color: AuthColors.brandPrimary,
  },
  tagline: {
    ...AuthTypography.tagline,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
});
