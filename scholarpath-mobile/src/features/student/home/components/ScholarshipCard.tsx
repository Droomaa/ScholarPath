import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useWishlist } from '@/src/context/student/WishlistContext';
import { ScholarshipItem } from '@/src/features/student/home/constants/home-mock-data';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ScholarshipCardProps = {
  item: ScholarshipItem;
  showMatch: boolean;
  onPress?: () => void;
};

export function ScholarshipCard({ item, showMatch, onPress }: ScholarshipCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const saved = isWishlisted(item.id);

  return (
    <Pressable style={styles.card} onPress={onPress}>
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
          color={saved ? '#BA1A1A' : AuthColors.textSecondary}
        />
      </Pressable>
      <View style={styles.logoWrap}>
        <MaterialCommunityIcons name="school-outline" size={24} color={AuthColors.textMuted} />
      </View>
      {showMatch && item.matchPercent != null ? (
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{item.matchPercent}% Match</Text>
        </View>
      ) : null}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.provider}>{item.provider}</Text>
      <View style={styles.footer}>
        <Ionicons name="time-outline" size={14} color={AuthColors.textMuted} />
        <Text style={styles.daysLeft}>{item.daysLeft}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: 'rgba(239, 236, 248, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  logoWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: AuthColors.progressInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  matchBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(96, 99, 238, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  matchText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.profileBrand,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
    marginBottom: 4,
  },
  provider: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daysLeft: {
    ...AuthTypography.profileInput,
    color: AuthColors.textMuted,
  },
});
