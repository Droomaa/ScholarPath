import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ApplicationSectionHeaderProps = {
  title: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
};

export function ApplicationSectionHeader({
  title,
  showSeeAll = false,
  onSeeAllPress,
}: ApplicationSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {showSeeAll ? (
        <Pressable onPress={onSeeAllPress}>
          <Text style={styles.link}>Lihat Semua</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ApplicationEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        Belum ada pendaftaran yang dilakukan, cari program{' '}
        <Text style={styles.emptyLink} onPress={() => router.push('/explore' as Href)}>
          disini
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  link: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.profileBrand,
  },
  emptyContainer: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: '#E4E1ED',
    borderRadius: 16,
    padding: 17,
  },
  emptyText: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
    lineHeight: 22,
  },
  emptyLink: {
    fontFamily: FontFamily.semiBold,
    color: AuthColors.profileBrand,
  },
});
