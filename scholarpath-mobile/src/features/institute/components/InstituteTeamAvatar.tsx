import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import {
  getRoleBadgeStyle,
  type InstituteTeamMember,
} from '@/src/features/institute/constants/institute-team-members';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteTeamAvatarProps = {
  member: Pick<InstituteTeamMember, 'initials' | 'avatarColor' | 'avatarUri' | 'name'>;
  size?: number;
};

export function InstituteTeamAvatar({ member, size = 48 }: InstituteTeamAvatarProps) {
  const fontSize = size <= 32 ? 12 : 16;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: member.avatarColor,
        },
      ]}>
      {member.avatarUri ? (
        <Image
          source={{ uri: member.avatarUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          accessibilityLabel={`${member.name} profile photo`}
        />
      ) : (
        <Text style={[styles.initials, { fontSize, lineHeight: fontSize + 2 }]}>
          {member.initials}
        </Text>
      )}
    </View>
  );
}

type InstituteTeamRoleBadgeProps = {
  role: InstituteTeamMember['role'];
};

export function InstituteTeamRoleBadge({ role }: InstituteTeamRoleBadgeProps) {
  const badgeStyle = getRoleBadgeStyle(role);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeStyle.backgroundColor,
          borderColor: badgeStyle.borderColor,
          borderWidth: badgeStyle.borderColor === 'transparent' ? 0 : 1,
        },
      ]}>
      <Text style={[styles.badgeText, { color: badgeStyle.color }]}>{role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: FontFamily.bold,
    color: AuthColors.white,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
