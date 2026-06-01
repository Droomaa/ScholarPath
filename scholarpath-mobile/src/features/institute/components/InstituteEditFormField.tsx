import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type InstituteEditFormFieldProps = TextInputProps & {
  label: string;
  multiline?: boolean;
  minHeight?: number;
  footer?: string;
};

export function InstituteEditFormField({
  label,
  multiline = false,
  minHeight,
  footer,
  style,
  ...inputProps
}: InstituteEditFormFieldProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          minHeight ? { minHeight } : null,
          style,
        ]}
        placeholderTextColor={AuthColors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...inputProps}
      />
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 25,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
    marginBottom: 4,
  },
  input: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
    borderWidth: 1,
    borderColor: '#C7C4D7',
    borderRadius: 12,
    paddingHorizontal: 17,
    paddingVertical: 13,
    minHeight: 48,
    backgroundColor: AuthColors.white,
  },
  inputMultiline: {
    paddingTop: 14,
    paddingBottom: 13,
  },
  footer: {
    alignSelf: 'flex-end',
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: '#464554',
    marginTop: 4,
  },
});
