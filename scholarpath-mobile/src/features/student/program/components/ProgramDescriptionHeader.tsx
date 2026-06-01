import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ProgramDescriptionHeaderProps = {
  onBackPress: () => void;
  onSharePress: () => void;
};

export function ProgramDescriptionHeader({
  onBackPress,
  onSharePress,
}: ProgramDescriptionHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.iconButton} onPress={onBackPress} hitSlop={8}>
        <Ionicons name="arrow-back" size={20} color={AuthColors.profileBrand} />
      </Pressable>
      <View style={styles.logoRow}>
        <MaterialCommunityIcons name="school" size={22} color={AuthColors.profileBrand} />
        <Text style={styles.brand}>ScholarPath</Text>
      </View>
      <Pressable style={styles.iconButton} onPress={onSharePress} hitSlop={8}>
        <Ionicons name="share-social-outline" size={20} color={AuthColors.profileBrand} />
      </Pressable>
    </View>
  );
}

type ProgramHeroBannerProps = {
  imageUri: string;
};

export function ProgramHeroBanner({ imageUri }: ProgramHeroBannerProps) {
  return (
    <View style={styles.hero}>
      <Image source={{ uri: imageUri }} style={styles.heroImage} contentFit="cover" />
      <LinearGradient
        colors={['rgba(252, 248, 255, 0)', 'rgba(252, 248, 255, 0)', AuthColors.background]}
        locations={[0, 0.5, 1]}
        style={styles.heroGradient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    backgroundColor: AuthColors.profileHeaderBlur,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.profileBrand,
  },
  hero: {
    height: 256,
    backgroundColor: AuthColors.progressInactive,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
