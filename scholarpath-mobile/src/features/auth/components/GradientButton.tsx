import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AuthColors, AuthSpacing, AuthTypography } from '@/src/theme';

type GradientButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'register' | 'login';
};

export function GradientButton({ label, onPress, variant = 'register' }: GradientButtonProps) {
  const colors =
    variant === 'login'
      ? ([AuthColors.loginGradientStart, AuthColors.loginGradientEnd] as const)
      : ([AuthColors.gradientStart, AuthColors.gradientEnd] as const);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.button, variant === 'login' && styles.buttonLogin]}>
        <Text style={[styles.label, variant === 'login' && styles.labelLogin]}>{label}</Text>
        <Ionicons name="arrow-forward" size={variant === 'login' ? 16 : 12} color={AuthColors.white} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: AuthSpacing.inputRadius,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  pressed: {
    opacity: 0.92,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AuthSpacing.sm,
    paddingVertical: AuthSpacing.md,
    borderRadius: AuthSpacing.inputRadius,
  },
  buttonLogin: {
    shadowColor: AuthColors.brandPrimary,
    shadowOpacity: 0.2,
  },
  label: {
    ...AuthTypography.button,
    color: AuthColors.white,
  },
  labelLogin: {
    ...AuthTypography.buttonLarge,
  },
});
