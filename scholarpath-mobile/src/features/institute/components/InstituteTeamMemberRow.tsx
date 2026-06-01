import { StyleSheet, Text, View } from 'react-native';

import { InstituteTeamAvatar } from '@/src/features/institute/components/InstituteTeamAvatar';
import { type InstituteTeamMember } from '@/src/features/institute/constants/institute-team-members';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteTeamMemberRowProps = {
  member: InstituteTeamMember;
};

export function InstituteTeamMemberRow({ member }: InstituteTeamMemberRowProps) {
  const isActive = member.status === 'active';

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <InstituteTeamAvatar member={member} size={32} />
        <View style={styles.info}>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.role}>{member.role}</Text>
        </View>
      </View>
      <View style={styles.statusWrap}>
        {isActive ? <View style={styles.statusDot} /> : null}
        <Text style={styles.statusText}>{isActive ? 'Active' : 'Inactive'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AuthColors.white,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 17,
    letterSpacing: 0.28,
    color: AuthColors.textPrimary,
  },
  role: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 14,
    color: '#464554',
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
    backgroundColor: '#10B981',
  },
  statusText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    lineHeight: 14,
    color: '#464554',
  },
});
