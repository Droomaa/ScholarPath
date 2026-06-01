import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type InstituteEditLogoSectionProps = {
  logoUri: string;
  onPickLogo: () => void;
  onRemoveLogo: () => void;
};

export function InstituteEditLogoSection({
  logoUri,
  onPickLogo,
  onRemoveLogo,
}: InstituteEditLogoSectionProps) {
  const hasLogo = logoUri.trim().length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.logoWrap}>
        <Pressable onPress={onPickLogo} style={styles.logoPressable}>
          {hasLogo ? (
            <Image source={{ uri: logoUri }} style={styles.logoImage} contentFit="cover" />
          ) : (
            <LinearGradient
              colors={['#EFECF8', '#E1E0FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoPlaceholder}>
              <Ionicons name="business" size={48} color={AuthColors.profileBrand} />
            </LinearGradient>
          )}
        </Pressable>
        <Pressable style={styles.editButton} onPress={onPickLogo} hitSlop={8}>
          <Ionicons name="pencil" size={14} color={AuthColors.white} />
        </Pressable>
      </View>

      <Text style={styles.title}>Institution Branding</Text>
      <Text style={styles.subtitle}>Upload a clear logo (PNG or JPG).</Text>

      {hasLogo ? (
        <Pressable style={styles.removeButton} onPress={onRemoveLogo}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  logoWrap: {
    position: 'relative',
  },
  logoPressable: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#E1E0FF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFECF8',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4648D4',
    borderWidth: 2,
    borderColor: '#FCF8FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: 'rgba(70, 72, 212, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: -8,
  },
  removeText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#4648D4',
  },
});
