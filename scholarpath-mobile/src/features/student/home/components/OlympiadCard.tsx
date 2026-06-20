import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useWishlist } from '@/src/context/student/WishlistContext';
import { OlympiadItem } from '@/src/features/student/home/constants/home-mock-data';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type OlympiadCardProps = {
  item: OlympiadItem;
  onPress?: () => void;
};

export function OlympiadCard({ item, onPress }: OlympiadCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(item.id);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />
        <Pressable
          style={styles.favoriteButton}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            toggleWishlist(item.id);
          }}>
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={16}
            color={saved ? '#FF8A8A' : AuthColors.white}
          />
        </Pressable>
        <View style={[styles.levelBadge, { backgroundColor: item.levelColor }]}>
          <Text style={styles.levelText}>{item.level}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.organizer}>{item.organizer}</Text>
        <View style={styles.footer}>
          <Text style={styles.footerText}>{item.footer}</Text>
          <Ionicons name="chevron-forward" size={14} color="#565E74" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageWrap: {
    height: 96,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  levelText: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
  },
  body: {
    padding: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  organizer: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  footerText: {
    ...AuthTypography.profileInput,
    color: '#565E74',
  },
});
