import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  InstituteTeamAvatar,
  InstituteTeamRoleBadge,
} from '@/src/features/institute/components/InstituteTeamAvatar';
import { type InstituteTeamMember } from '@/src/features/institute/constants/institute-team-members';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteTeamAdminCardProps = {
  member: InstituteTeamMember;
};

export function InstituteTeamAdminCard({ member }: InstituteTeamAdminCardProps) {
  const isActive = member.status === 'active';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identity}>
          <InstituteTeamAvatar member={member} size={48} />
          <View style={styles.info}>
            <Text style={styles.name}>{member.name}</Text>
            <Text style={styles.email}>{member.email}</Text>
          </View>
        </View>
        <Pressable
          style={styles.editButton}
          hitSlop={8}
          onPress={() =>
            router.push(`/institute-edit-team-member/${member.id}` as Href)
          }>
          <Ionicons name="pencil" size={18} color={AuthColors.profileBrand} />
        </Pressable>
      </View>

      <View style={styles.bottomRow}>
        <InstituteTeamRoleBadge role={member.role} />
        <View style={styles.statusWrap}>
          {isActive ? <View style={styles.statusDot} /> : null}
          <Text style={styles.statusText}>{isActive ? 'Active' : 'Inactive'}</Text>
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
    padding: 17,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  email: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
  },
  editButton: {
    padding: 8,
    borderRadius: 9999,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
});
