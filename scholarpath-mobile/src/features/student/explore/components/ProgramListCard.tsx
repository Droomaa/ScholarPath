import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useWishlist } from '@/src/context/student/WishlistContext';
import { ExploreProgram } from '@/src/types/shared/program';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ProgramListCardProps = {
  program: ExploreProgram;
  onSeeMorePress: () => void;
};

export function ProgramListCard({ program, onSeeMorePress }: ProgramListCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(program.id);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: program.imageUri }} style={styles.image} contentFit="cover" />
        <Pressable
          style={styles.bookmarkButton}
          hitSlop={8}
          onPress={() => {
            void toggleWishlist(program.id);
          }}>
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={18}
            color={saved ? AuthColors.profileBrand : AuthColors.textSecondary}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{program.categoryLabel}</Text>
          </View>
          <View style={styles.statusRow}>
            <Ionicons name="time-outline" size={14} color={AuthColors.textMuted} />
            <Text style={styles.statusText}>{program.status}</Text>
          </View>
        </View>

        <Text style={styles.title}>{program.title}</Text>
        <Text style={styles.provider}>{program.provider}</Text>

        <Pressable style={styles.seeMoreButton} onPress={onSeeMorePress}>
          <Text style={styles.seeMoreText}>See More</Text>
          <Ionicons name="arrow-forward" size={14} color={AuthColors.profileBrand} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  imageWrap: {
    position: 'relative',
    height: 140,
    backgroundColor: AuthColors.progressInactive,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: 'rgba(96, 99, 238, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 18,
    color: AuthColors.profileBrand,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    ...AuthTypography.profileInput,
    fontSize: 12,
    lineHeight: 18,
    color: AuthColors.textMuted,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  provider: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  seeMoreText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.profileBrand,
  },
});
