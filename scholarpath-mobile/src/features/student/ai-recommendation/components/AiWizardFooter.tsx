import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthColors, FontFamily } from '@/src/theme';

type AiWizardFooterProps = {
  onBackPress?: () => void;
  onContinuePress: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
  showBack?: boolean;
};

export function AiWizardFooter({
  onBackPress,
  onContinuePress,
  continueDisabled = false,
  continueLabel = 'Lanjutkan',
  showBack = true,
}: AiWizardFooterProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      {showBack ? (
        <Pressable style={styles.backButton} onPress={onBackPress}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={[styles.continueWrap, !showBack && styles.continueWrapFull]}
        onPress={onContinuePress}
        disabled={continueDisabled}>
        <LinearGradient
          colors={[AuthColors.gradientStart, AuthColors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.continueButton, continueDisabled && styles.continueDisabled]}>
          <Text style={styles.continueText}>{continueLabel}</Text>
          <Ionicons name="arrow-forward" size={16} color={AuthColors.white} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 25,
    backgroundColor: 'rgba(252, 248, 255, 0.95)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    width: 117,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(44, 42, 188, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: AuthColors.brandPrimary,
  },
  continueWrap: {
    flex: 1,
  },
  continueWrapFull: {
    flex: 1,
  },
  continueButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: AuthColors.gradientStart,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 4,
  },
  continueDisabled: {
    opacity: 0.5,
  },
  continueText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 16.8,
    letterSpacing: 0.28,
    color: AuthColors.white,
  },
});
