import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthSpacing, AuthTypography } from '@/src/theme';

const GOOGLE_ICON =
  'https://www.figma.com/api/mcp/asset/00186554-77d6-47a8-9644-559ff11207b5';
const LINKEDIN_ICON =
  'https://www.figma.com/api/mcp/asset/4edf710c-8de9-475e-9ab2-6a10f85b5291';

type SocialLoginButtonsProps = {
  onGooglePress?: () => void;
  onLinkedInPress?: () => void;
};

export function SocialLoginButtons({ onGooglePress, onLinkedInPress }: SocialLoginButtonsProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={onGooglePress}>
        <Image source={{ uri: GOOGLE_ICON }} style={styles.icon} contentFit="contain" />
        <Text style={styles.label}>Google</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onLinkedInPress}>
        <Image source={{ uri: LINKEDIN_ICON }} style={styles.icon} contentFit="contain" />
        <Text style={styles.label}>LinkedIn</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: AuthSpacing.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: AuthSpacing.sm,
    paddingVertical: 13,
    borderRadius: AuthSpacing.inputRadius,
    borderWidth: 1,
    borderColor: AuthColors.borderMedium,
  },
  icon: {
    width: 20,
    height: 20,
  },
  label: {
    ...AuthTypography.button,
    color: AuthColors.textPrimary,
  },
});
