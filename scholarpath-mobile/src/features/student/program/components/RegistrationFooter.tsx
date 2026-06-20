import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthColors, FontFamily } from '@/src/theme';

type RegistrationFooterProps = {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  isSubmitting?: boolean;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryDisabled?: boolean;
  showSecondary?: boolean;
};

export function RegistrationFooter({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled = false,
  isSubmitting = false,
  secondaryLabel = 'Save Draft',
  onSecondaryPress,
  secondaryDisabled = false,
  showSecondary = true,
}: RegistrationFooterProps) {
  const insets = useSafeAreaInsets();
  const hasSecondary = showSecondary && onSecondaryPress;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      {hasSecondary ? (
        <Pressable
          style={styles.secondaryButton}
          onPress={onSecondaryPress}
          disabled={isSubmitting || secondaryDisabled}>
          <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
      <Pressable
        style={[
          styles.primaryButton,
          !hasSecondary && styles.primaryButtonFull,
          (primaryDisabled || isSubmitting) && styles.primaryButtonDisabled,
        ]}
        onPress={onPrimaryPress}
        disabled={primaryDisabled || isSubmitting}>
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? 'Memproses...' : primaryLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: AuthColors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(199, 196, 215, 0.4)',
  },
  secondaryButton: {
    minWidth: 108,
    height: 48,
    paddingHorizontal: 16,
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
    color: AuthColors.textSecondary,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: AuthColors.profileBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: AuthColors.white,
  },
});
