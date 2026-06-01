import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

type ProfileTextFieldProps = TextInputProps & {
  label: string;
};

export function ProfileTextField({ label, style, ...inputProps }: ProfileTextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={AuthColors.textMuted}
        {...inputProps}
      />
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
  input: {
    ...AuthTypography.profileInput,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileFieldBorder,
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingVertical: 13,
    color: AuthColors.textPrimary,
  },
});
