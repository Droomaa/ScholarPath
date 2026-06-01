import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

type ProfileSaveButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
};

export function ProfileSaveButton({
  onPress,
  disabled = false,
  label = 'Simpan Profil',
}: ProfileSaveButtonProps) {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['rgba(252,248,255,0)', AuthColors.background, AuthColors.background]}
        style={styles.gradient}
        pointerEvents="none"
      />
      <Pressable
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}>
        <Text style={styles.label}>{label}</Text>
        <Ionicons name="document-text-outline" size={18} color={AuthColors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 26,
    backgroundColor: AuthColors.background,
  },
  gradient: {
    position: 'absolute',
    top: -24,
    left: 0,
    right: 0,
    height: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 12,
    backgroundColor: AuthColors.profileBrand,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  label: {
    ...AuthTypography.profileSaveButton,
    color: AuthColors.white,
  },
});
