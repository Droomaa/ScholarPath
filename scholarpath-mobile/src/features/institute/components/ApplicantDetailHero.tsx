import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { type InstituteApplicantDetail } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantDetailHeroProps = {
  applicant: InstituteApplicantDetail;
};

export function ApplicantDetailHero({ applicant }: ApplicantDetailHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        {applicant.avatarUri ? (
          <Image source={{ uri: applicant.avatarUri }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>{applicant.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.name}>{applicant.name}</Text>
      <Text style={styles.programTitle}>{applicant.programTitle.toUpperCase()}</Text>

      <View style={styles.tagsRow}>
        <View style={styles.trackTag}>
          <Text style={styles.trackTagText}>{applicant.trackLabel}</Text>
        </View>
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
    padding: 25,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'rgba(96, 99, 238, 0.2)',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(96, 99, 238, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(96, 99, 238, 0.2)',
  },
  avatarInitial: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    color: AuthColors.profileBrand,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  programTitle: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    color: '#565E74',
    textAlign: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  trackTag: {
    backgroundColor: 'rgba(96, 99, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(96, 99, 238, 0.2)',
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  trackTagText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#6063EE',
  },
});
