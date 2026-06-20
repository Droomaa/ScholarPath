import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { AuthColors, AuthSpacing, AuthTypography, FontFamily } from '@/src/theme';

type AuthTextFieldProps = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  showPasswordToggle?: boolean;
  isPasswordVisible?: boolean;
  onTogglePassword?: () => void;
  prefix?: string;
  error?: string;
};

export function AuthTextField({
  label,
  icon,
  showPasswordToggle = false,
  isPasswordVisible = false,
  onTogglePassword,
  prefix,
  error,
  style,
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputWrapperError : null]}>
        <View style={styles.iconLeft}>
          <Ionicons name={icon} size={18} color={AuthColors.textPlaceholder} />
        </View>
        {prefix ? (
          <View style={styles.prefixContainer}>
            <Text style={styles.prefixText}>{prefix}</Text>
          </View>
        ) : null}
        <TextInput
          style={[styles.input, prefix ? styles.inputWithPrefix : undefined, style]}
          placeholderTextColor={AuthColors.textPlaceholder}
          secureTextEntry={showPasswordToggle && !isPasswordVisible}
          {...inputProps}
        />
        {showPasswordToggle ? (
          <Pressable style={styles.iconRight} onPress={onTogglePassword} hitSlop={8}>
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={AuthColors.textPlaceholder}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: AuthSpacing.sm,
  },
  label: {
    ...AuthTypography.label,
    color: AuthColors.textSecondary,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWrapperError: {
    borderWidth: 1,
    borderColor: '#BA1A1A',
    borderRadius: AuthSpacing.inputRadius,
  },
  iconLeft: {
    position: 'absolute',
    left: AuthSpacing.md,
    zIndex: 1,
  },
  prefixContainer: {
    position: 'absolute',
    left: 44,
    zIndex: 1,
    borderRightWidth: 1,
    borderRightColor: AuthColors.phoneBorder,
    paddingRight: 9,
    height: 24,
    justifyContent: 'center',
  },
  prefixText: {
    ...AuthTypography.input,
    color: AuthColors.textSecondary,
  },
  input: {
    ...AuthTypography.input,
    backgroundColor: AuthColors.inputBackground,
    borderRadius: AuthSpacing.inputRadius,
    paddingVertical: 14,
    paddingLeft: 48,
    paddingRight: AuthSpacing.md,
    color: AuthColors.textPrimary,
  },
  inputWithPrefix: {
    paddingLeft: 96,
  },
  iconRight: {
    position: 'absolute',
    right: AuthSpacing.md,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: '#BA1A1A',
  },
});
