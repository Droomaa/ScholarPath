import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useWishlist } from '@/src/context/student/WishlistContext';
import { ExploreProgram } from '@/src/types/shared/program';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type WishlistProgramCardProps = {
  program: ExploreProgram;
  onSelengkapnyaPress: () => void;
};

export function WishlistProgramCard({ program, onSelengkapnyaPress }: WishlistProgramCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(program.id);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.thumbnailWrap}>
          <Image source={{ uri: program.imageUri }} style={styles.thumbnail} contentFit="cover" />
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {program.title}
          </Text>
          <Text style={styles.provider}>{program.provider}</Text>
          <Pressable
            style={styles.heartButton}
            hitSlop={8}
            onPress={() => toggleWishlist(program.id)}>
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={20}
              color={saved ? '#BA1A1A' : AuthColors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.actionButton} onPress={onSelengkapnyaPress}>
        <Text style={styles.actionButtonText}>Selengkapnya</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.2)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  thumbnailWrap: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: AuthColors.profileProgressTrack,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    lineHeight: 22,
    color: AuthColors.textPrimary,
    paddingRight: 8,
  },
  provider: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
    paddingBottom: 8,
  },
  heartButton: {
    alignSelf: 'flex-start',
  },
  actionButton: {
    height: 38,
    borderRadius: 10,
    backgroundColor: AuthColors.profileBrand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
    color: AuthColors.white,
  },
});
