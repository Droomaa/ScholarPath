import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthColors, FontFamily } from '@/src/theme';

type RegistrationFooterProps = {
  onSaveDraftPress: () => void;
  onSubmitPress: () => void;
  submitDisabled?: boolean;
};

export function RegistrationFooter({
  onSaveDraftPress,
  onSubmitPress,
  submitDisabled = false,
}: RegistrationFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 20) }]}>
      <Pressable style={styles.secondaryButton} onPress={onSaveDraftPress}>
        <Text style={styles.secondaryButtonText}>Save Draft</Text>
      </Pressable>
      <Pressable
        style={[styles.primaryButton, submitDisabled && styles.primaryButtonDisabled]}
        onPress={onSubmitPress}
        disabled={submitDisabled}>
        <Text style={styles.primaryButtonText}>Submit Application</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(252, 248, 255, 0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(199, 196, 215, 0.3)',
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
    backgroundColor: AuthColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textSecondary,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: AuthColors.profileBrand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.white,
  },
});
