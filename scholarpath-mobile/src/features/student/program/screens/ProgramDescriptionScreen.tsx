import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useWishlist } from '@/src/context/student/WishlistContext';
import { getProgramById } from '@/src/features/student/explore/constants/explore-programs';
import {
  ProgramDescriptionBottomBar,
  ProgramDescriptionHeader,
  ProgramDescriptionSection,
  ProgramHeroBanner,
  ProgramKeyInfoRow,
  ProgramRequirementsList,
  ProgramShareSheet,
  ProgramTitleCard,
} from '@/src/features/student/program/components';
import { AuthColors, AuthTypography } from '@/src/theme';

export function ProgramDescriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [shareVisible, setShareVisible] = useState(false);

  const program = getProgramById(id ?? '');

  if (!program) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.notFound}>Program tidak ditemukan.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const saved = isWishlisted(program.id);

  return (
    <View style={styles.screen}>
      <ProgramDescriptionHeader
        onBackPress={() => router.back()}
        onSharePress={() => setShareVisible(true)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <ProgramHeroBanner imageUri={program.imageUri} />
        <ProgramTitleCard program={program} />
        <ProgramKeyInfoRow program={program} />
        <ProgramDescriptionSection program={program} />
        <ProgramRequirementsList requirements={program.requirements} />
      </ScrollView>

      <ProgramDescriptionBottomBar
        isWishlisted={saved}
        onWishlistPress={() => toggleWishlist(program.id)}
        onRegisterPress={() => router.push(`/program-register/${program.id}` as Href)}
      />

      <ProgramShareSheet
        visible={shareVisible}
        program={program}
        onClose={() => setShareVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  notFound: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  backLink: {
    ...AuthTypography.profileInput,
    color: AuthColors.profileBrand,
  },
});
