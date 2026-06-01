import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthSpacing, AuthTypography } from '@/src/theme';

type OrDividerProps = {
  label: string;
};

export function OrDivider({ label }: OrDividerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AuthSpacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: AuthColors.divider,
  },
  label: {
    ...AuthTypography.divider,
    color: AuthColors.textMuted,
    textTransform: 'uppercase',
  },
});
