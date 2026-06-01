import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, FontFamily } from '@/src/theme';

type InstituteProfileHeroCardProps = {
  instituteName: string;
  email: string;
  contactNumber: string;
  address: string;
  logoUri?: string;
};

function formatContactNumber(contactNumber: string) {
  const trimmed = contactNumber.trim();
  if (!trimmed) return '—';
  if (trimmed.startsWith('+')) return trimmed;
  return `+62 ${trimmed}`;
}

export function InstituteProfileHeroCard({
  instituteName,
  email,
  contactNumber,
  address,
  logoUri,
}: InstituteProfileHeroCardProps) {
  const displayName = instituteName.trim() || 'Institute';
  const hasLogo = Boolean(logoUri?.trim());

  return (
    <View style={styles.wrapper}>
      <View style={styles.bannerWrap}>
        <LinearGradient
          colors={['#6063EE', '#4648D4', '#2F2EBE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarShadow}>
            {hasLogo ? (
              <Image source={{ uri: logoUri }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <LinearGradient
                colors={['#4648D4', '#2F2EBE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}>
                <Ionicons name="business" size={36} color={AuthColors.white} />
              </LinearGradient>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{displayName}</Text>
            <Ionicons name="checkmark-circle" size={20} color={AuthColors.profileBrand} />
          </View>

          <View style={styles.contactList}>
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={14} color="#464554" />
              <Text style={styles.contactText}>{email.trim() || '—'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={14} color="#464554" />
              <Text style={styles.contactText}>{formatContactNumber(contactNumber)}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={14} color="#464554" />
              <Text style={styles.contactText}>{address.trim() || '—'}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  bannerWrap: {
    width: '100%',
    height: 160,
    backgroundColor: '#E9E6F3',
    overflow: 'hidden',
  },
  banner: {
    flex: 1,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 350,
    marginHorizontal: 20,
    marginTop: -48,
    backgroundColor: AuthColors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarWrap: {
    marginBottom: 16,
  },
  avatarShadow: {
    width: 80,
    height: 80,
    marginTop: -64,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: AuthColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
    overflow: 'hidden',
  },
  avatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    flexShrink: 1,
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
  },
  contactList: {
    marginTop: 4,
    gap: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#464554',
  },
});
