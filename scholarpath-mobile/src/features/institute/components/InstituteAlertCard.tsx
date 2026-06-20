import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatNotificationTime } from '@/src/features/student/notifications/utils/format-notification-time';
import {
  type InstituteNotification,
  type InstituteNotificationIconType,
} from '@/src/types/institute/institute-notification';
import { AuthColors, FontFamily } from '@/src/theme';

type InstituteAlertCardProps = {
  notification: InstituteNotification;
  onPress: () => void;
};

const iconConfig: Record<
  InstituteNotificationIconType,
  {
    family: 'ionicons' | 'material';
    name: string;
    backgroundColor: string;
    color: string;
  }
> = {
  applicants: {
    family: 'material',
    name: 'school-outline',
    backgroundColor: '#EEF0FF',
    color: AuthColors.profileBrand,
  },
  verified: {
    family: 'ionicons',
    name: 'checkmark-circle',
    backgroundColor: '#ECFDF5',
    color: '#059669',
  },
  deadline: {
    family: 'ionicons',
    name: 'alert-circle',
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
  },
  program: {
    family: 'ionicons',
    name: 'book-outline',
    backgroundColor: '#EEF0FF',
    color: AuthColors.profileBrand,
  },
  system: {
    family: 'ionicons',
    name: 'information-circle-outline',
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
};

export function InstituteAlertCard({ notification, onPress }: InstituteAlertCardProps) {
  const config = iconConfig[notification.icon];
  const isUnread = !notification.read;

  const handlePress = () => {
    onPress();
    if (notification.actionHref) {
      router.push(notification.actionHref as Href);
    }
  };

  return (
    <Pressable
      style={[styles.card, isUnread ? styles.cardUnread : styles.cardRead]}
      onPress={handlePress}>
      {isUnread ? <View style={styles.unreadBar} /> : null}

      <View style={[styles.iconWrap, { backgroundColor: config.backgroundColor }]}>
        {config.family === 'material' ? (
          <MaterialCommunityIcons
            name={config.name as 'school-outline'}
            size={22}
            color={config.color}
          />
        ) : (
          <Ionicons name={config.name as 'checkmark-circle'} size={22} color={config.color} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleCol}>
            {isUnread ? (
              <View style={styles.unreadPill}>
                <Text style={styles.unreadPillText}>Unread</Text>
              </View>
            ) : null}
            <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={2}>
              {notification.title}
            </Text>
          </View>
          <View style={styles.timeCol}>
            <Text style={styles.time}>{formatNotificationTime(notification.createdAt)}</Text>
            {isUnread ? <View style={styles.unreadDot} /> : null}
          </View>
        </View>
        <Text style={[styles.message, isUnread && styles.messageUnread]} numberOfLines={3}>
          {notification.message}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: AuthColors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingRight: 16,
    paddingLeft: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  cardRead: {
    borderWidth: 1,
    borderColor: '#ECEAF4',
    shadowColor: '#1B1B23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: 'rgba(70, 72, 212, 0.22)',
    shadowColor: '#4648D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: AuthColors.profileBrand,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleCol: {
    flex: 1,
    gap: 4,
  },
  unreadPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(70, 72, 212, 0.1)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
    color: AuthColors.profileBrand,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    lineHeight: 21,
    color: '#464554',
  },
  titleUnread: {
    fontFamily: FontFamily.bold,
    color: AuthColors.textPrimary,
  },
  timeCol: {
    alignItems: 'flex-end',
    gap: 6,
    minWidth: 52,
  },
  time: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    color: AuthColors.textMuted,
  },
  message: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: '#767586',
  },
  messageUnread: {
    color: '#464554',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AuthColors.profileBrand,
    borderWidth: 2,
    borderColor: AuthColors.white,
  },
});
