import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type SectionHeaderProps = {
  title: string;
  onSeeAllPress?: () => void;
};

export function SectionHeader({ title, onSeeAllPress }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onSeeAllPress}>
        <Text style={styles.link}>Lihat Semua</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
  },
  link: {
    ...AuthTypography.profileInput,
    color: AuthColors.profileBrand,
  },
});
