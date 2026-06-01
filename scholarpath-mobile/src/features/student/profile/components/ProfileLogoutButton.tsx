import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

type ProfileLogoutButtonProps = {
  onPress: () => void;
};

export function ProfileLogoutButton({ onPress }: ProfileLogoutButtonProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Ionicons name="log-out-outline" size={18} color="#BA1A1A" />
      <Text style={styles.text}>Keluar dari Akun</Text>
    </Pressable>
  );
}

export function ProfileCardIcon({
  name,
}: {
  name: 'person' | 'school' | 'interests' | 'skills';
}) {
  const iconProps = { size: 18, color: AuthColors.profileBrand } as const;

  switch (name) {
    case 'person':
      return <Ionicons name="person-outline" {...iconProps} />;
    case 'school':
      return <MaterialCommunityIcons name="school-outline" size={20} color={AuthColors.profileBrand} />;
    case 'interests':
      return <MaterialCommunityIcons name="creation-outline" size={22} color={AuthColors.profileBrand} />;
    case 'skills':
      return <MaterialCommunityIcons name="medal-outline" size={20} color={AuthColors.profileBrand} />;
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  text: {
    ...AuthTypography.profileInput,
    color: '#BA1A1A',
  },
});
