import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useInstituteNotifications } from '@/src/context/institute/InstituteNotificationContext';
import {
  InstituteAlertCard,
  InstituteAlertFilterChips,
  InstituteTopBar,
} from '@/src/features/institute/components';
import { NotificationSectionHeader } from '@/src/features/student/notifications/components/NotificationSectionHeader';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export function InstituteAlertsScreen() {
  const {
    sections,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    filteredNotifications,
    unreadCount,
  } = useInstituteNotifications();

  const hasNotifications = filteredNotifications.length > 0;

  return (
    <View style={styles.screen}>
      <InstituteTopBar />
      <InstituteAlertFilterChips selected={filter} onSelect={setFilter} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {hasNotifications ? (
          sections.map((section) => (
            <View key={section.id} style={styles.section}>
              {section.id === 'recent' ? (
                <View style={styles.recentRow}>
                  <Text style={styles.recentLabel}>RECENT</Text>
                  <Pressable
                    onPress={markAllAsRead}
                    disabled={unreadCount === 0}
                    hitSlop={8}>
                    <Text
                      style={[
                        styles.markAllText,
                        unreadCount === 0 && styles.markAllTextDisabled,
                      ]}>
                      Mark all as read
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <NotificationSectionHeader label={section.label} />
              )}
              <View style={styles.list}>
                {section.items.map((notification) => (
                  <InstituteAlertCard
                    key={notification.id}
                    notification={notification}
                    onPress={() => markAsRead(notification.id)}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={AuthColors.textMuted} />
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptySubtitle}>
              Notifications about applicants, programs, and system updates will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  section: {
    gap: 12,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  recentLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 24,
    color: '#767586',
  },
  markAllText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: '#4648D4',
  },
  markAllTextDisabled: {
    opacity: 0.4,
  },
  list: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  emptySubtitle: {
    ...AuthTypography.profileInput,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
});
