import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

type ProfileSelectFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onPress: () => void;
};

export function ProfileSelectField({ label, placeholder, value, onPress }: ProfileSelectFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.select} onPress={onPress}>
        <Text style={[styles.value, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={AuthColors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    ...AuthTypography.profileLabel,
    color: AuthColors.textSecondary,
    paddingLeft: 4,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileFieldBorder,
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingVertical: 12,
    minHeight: 48,
  },
  value: {
    ...AuthTypography.profileInput,
    flex: 1,
    color: AuthColors.textPrimary,
  },
  placeholder: {
    color: AuthColors.textMuted,
  },
});
