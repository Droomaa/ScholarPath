import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExploreProgram } from '@/src/types/shared/program';
import { getProgramRewardInfo } from '@/src/features/student/program/utils/format-prize';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ProgramTitleCardProps = {
  program: ExploreProgram;
};

export function ProgramTitleCard({ program }: ProgramTitleCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{program.categoryTag}</Text>
      </View>
      <Text style={styles.title}>{program.title}</Text>
      <View style={styles.providerRow}>
        <View style={styles.providerIcon}>
          <MaterialCommunityIcons name="domain" size={14} color={AuthColors.textMuted} />
        </View>
        <Text style={styles.provider}>{program.provider}</Text>
        <Ionicons name="checkmark-circle" size={18} color={AuthColors.profileBrand} />
      </View>
    </View>
  );
}

type ProgramKeyInfoRowProps = {
  program: ExploreProgram;
};

export function ProgramKeyInfoRow({ program }: ProgramKeyInfoRowProps) {
  const reward = getProgramRewardInfo(program);

  const items = [
    { label: 'DEADLINE', value: program.deadline ?? '-', icon: 'calendar-outline' as const },
    { label: 'KUOTA', value: program.quota ?? '-', icon: 'people-outline' as const },
    { label: reward.label, value: reward.value, icon: reward.icon },
  ];

  return (
    <View style={styles.keyInfoRow}>
      {items.map((item) => (
        <View key={item.label} style={styles.keyInfoCard}>
          <Ionicons name={item.icon} size={18} color={AuthColors.profileBrand} />
          <Text style={styles.keyInfoLabel}>{item.label}</Text>
          <Text style={styles.keyInfoValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

type ProgramDescriptionSectionProps = {
  program: ExploreProgram;
};

export function ProgramDescriptionSection({ program }: ProgramDescriptionSectionProps) {
  const text = program.longDescription ?? program.description;

  return (
    <LinearGradient
      colors={['#6063EE', '#4648D4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.descriptionCard}>
      <View style={styles.descriptionOrb} />
      <Text style={styles.descriptionTitle}>Deskripsi Program</Text>
      <Text style={styles.descriptionText}>{text}</Text>
    </LinearGradient>
  );
}

type ProgramRequirementsListProps = {
  requirements: string[];
};

export function ProgramRequirementsList({ requirements }: ProgramRequirementsListProps) {
  return (
    <View style={styles.requirementsSection}>
      <Text style={styles.requirementsTitle}>Persyaratan Umum</Text>
      <View style={styles.requirementsList}>
        {requirements.map((requirement) => (
          <View key={requirement} style={styles.requirementItem}>
            <Ionicons name="checkmark-circle" size={20} color={AuthColors.profileBrand} />
            <Text style={styles.requirementText}>{requirement}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

type ProgramDescriptionBottomBarProps = {
  isWishlisted: boolean;
  onWishlistPress: () => void;
  onRegisterPress: () => void;
};

export function ProgramDescriptionBottomBar({
  isWishlisted,
  onWishlistPress,
  onRegisterPress,
}: ProgramDescriptionBottomBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <Pressable style={styles.wishlistButton} onPress={onWishlistPress} hitSlop={8}>
        <Ionicons
          name={isWishlisted ? 'heart' : 'heart-outline'}
          size={22}
          color={isWishlisted ? '#BA1A1A' : AuthColors.profileBrand}
        />
      </Pressable>
      <Pressable style={styles.registerButton} onPress={onRegisterPress}>
        <Text style={styles.registerText}>Registration Now</Text>
        <Ionicons name="arrow-forward" size={16} color={AuthColors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: -48,
    marginHorizontal: 20,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 25,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(96, 99, 238, 0.1)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    color: AuthColors.profileBrand,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    lineHeight: 32,
    color: AuthColors.textPrimary,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
  },
  providerIcon: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileProgressTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  provider: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
    flex: 1,
  },
  keyInfoRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  keyInfoCard: {
    flex: 1,
    backgroundColor: '#F5F2FE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  keyInfoLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
    color: AuthColors.textSecondary,
    textTransform: 'uppercase',
  },
  keyInfoValue: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  descriptionCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    padding: 24,
    gap: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  descriptionOrb: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  descriptionTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: 24,
    lineHeight: 24,
    color: '#FFD400',
  },
  descriptionText: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
    lineHeight: 26,
  },
  requirementsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 18,
  },
  requirementsTitle: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
  },
  requirementsList: {
    gap: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  requirementText: {
    ...AuthTypography.profileInput,
    color: AuthColors.textSecondary,
    flex: 1,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: 'rgba(252, 248, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(199, 196, 215, 0.2)',
  },
  wishlistButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(96, 99, 238, 0.2)',
    backgroundColor: AuthColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: AuthColors.profileBrand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  registerText: {
    ...AuthTypography.profileInput,
    color: AuthColors.white,
  },
});
