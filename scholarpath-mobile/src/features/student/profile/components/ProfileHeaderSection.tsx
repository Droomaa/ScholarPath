import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';
import { getFirstName } from '@/src/utils/getFirstName';

type ProfileHeaderSectionProps = {
  fullName: string;
  bio: string;
  profilePhotoUri: string;
  onEditProfilePress?: () => void;
  onEditPhotoPress?: () => void;
};

export function ProfileHeaderSection({
  fullName,
  bio,
  profilePhotoUri,
  onEditProfilePress,
  onEditPhotoPress,
}: ProfileHeaderSectionProps) {
  const firstName = getFirstName(fullName);
  const hasBio = bio.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <LinearGradient
          colors={['#4648D4', '#E1E0FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color={AuthColors.textMuted} />
              </View>
            )}
          </View>
        </LinearGradient>
        <Pressable style={styles.editPhotoButton} onPress={onEditPhotoPress} hitSlop={8}>
          <Ionicons name="pencil" size={14} color={AuthColors.white} />
        </Pressable>
      </View>

      <Text style={styles.greeting}>
        Hi, I am <Text style={styles.greetingName}>{firstName}</Text>
      </Text>

      <Text style={[styles.bio, !hasBio && styles.bioPlaceholder]}>
        {hasBio ? bio : 'describe yourself here'}
      </Text>

      <Pressable style={styles.editProfileButton} onPress={onEditProfilePress}>
        <Ionicons name="settings-outline" size={18} color={AuthColors.white} />
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    padding: 4,
    shadowColor: AuthColors.profileBrand,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 6,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 9999,
    borderWidth: 4,
    borderColor: AuthColors.background,
    overflow: 'hidden',
    backgroundColor: AuthColors.white,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AuthColors.profileChipBackground,
  },
  editPhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileBrand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  greeting: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  greetingName: {
    color: '#0003B5',
  },
  bio: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    maxWidth: 320,
  },
  bioPlaceholder: {
    color: AuthColors.textMuted,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    width: 200,
    maxWidth: '100%',
    backgroundColor: AuthColors.profileBrand,
    borderRadius: 10,
    paddingVertical: 10,
    shadowColor: AuthColors.profileBrand,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  editProfileText: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
  },
});
