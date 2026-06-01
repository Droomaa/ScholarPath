import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthColors, FontFamily } from '@/src/theme';

type RegistrationHeaderProps = {
  onBackPress: () => void;
};

export function RegistrationHeader({ onBackPress }: RegistrationHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.iconButton} onPress={onBackPress} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={AuthColors.profileBrand} />
      </Pressable>
      <Text style={styles.title}>Registration</Text>
      <View style={styles.iconButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: AuthColors.profileHeaderBlur,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.profileBrand,
  },
});
