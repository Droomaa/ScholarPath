import { StyleSheet, View } from 'react-native';

import { AuthColors, AuthSpacing } from '@/src/theme';
import { UserRole } from '@/src/types/shared/auth';

type ProgressIndicatorProps = {
  role: UserRole;
};

export function ProgressIndicator({ role }: ProgressIndicatorProps) {
  const isStudent = role === 'student';

  return (
    <View style={styles.container}>
      <View style={[styles.bar, isStudent ? styles.active : styles.inactive]} />
      <View style={[styles.bar, !isStudent ? styles.active : styles.inactive]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: AuthSpacing.sm,
  },
  bar: {
    flex: 1,
    height: 6,
    borderRadius: 9999,
  },
  active: {
    backgroundColor: AuthColors.brandIndigo,
  },
  inactive: {
    backgroundColor: AuthColors.progressInactive,
  },
});
