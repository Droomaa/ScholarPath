import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useWishlist } from '@/src/context/student/WishlistContext';
import { ExploreCategory } from '@/src/features/student/explore/components/CategoryChips';
import { EXPLORE_PROGRAMS } from '@/src/features/student/explore/constants/explore-programs';
import { WishlistFilterChips, WishlistProgramCard } from '@/src/features/student/wishlist/components';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const { wishlistIds } = useWishlist();
  const [category, setCategory] = useState<ExploreCategory>('semua');

  const savedPrograms = useMemo(() => {
    const programs = EXPLORE_PROGRAMS.filter((program) => wishlistIds.includes(program.id));

    if (category === 'semua') {
      return programs;
    }

    return programs.filter((program) => program.category === category);
  }, [category, wishlistIds]);

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.iconButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.topBarTitle}>Wishlist</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Simpanan Saya</Text>
          <Text style={styles.pageSubtitle}>Daftar beasiswa dan kompetisi pilihanmu.</Text>
        </View>

        <WishlistFilterChips selected={category} onSelect={setCategory} />

        {savedPrograms.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={48} color={AuthColors.textMuted} />
            <Text style={styles.emptyTitle}>Wishlist masih kosong</Text>
            <Text style={styles.emptySubtitle}>
              Simpan program favoritmu dengan menekan ikon bookmark di halaman Eksplorasi.
            </Text>
            <Pressable onPress={() => router.push('/explore' as Href)}>
              <Text style={styles.exploreLink}>Jelajahi program</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {savedPrograms.map((program) => (
              <WishlistProgramCard
                key={program.id}
                program={program}
                onSelengkapnyaPress={() => router.push(`/program/${program.id}` as Href)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: AuthColors.profileHeaderBlur,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  topBarTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.profileBrand,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
    flexGrow: 1,
  },
  header: {
    gap: 4,
  },
  pageTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
  },
  pageSubtitle: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
  },
  list: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 12,
  },
  emptyTitle: {
    ...AuthTypography.profileInput,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  exploreLink: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.profileBrand,
    marginTop: 4,
  },
});
