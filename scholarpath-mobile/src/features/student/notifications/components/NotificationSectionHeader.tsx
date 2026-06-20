import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type NotificationSectionHeaderProps = {
  label: string;
};

export function NotificationSectionHeader({ label }: NotificationSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: AuthColors.textMuted,
    textTransform: 'uppercase',
  },
});
