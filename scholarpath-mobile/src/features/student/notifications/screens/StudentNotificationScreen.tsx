import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotifications } from '@/src/context/student/NotificationContext';
import {
  NotificationCard,
  NotificationFilterChips,
  NotificationSectionHeader,
} from '@/src/features/student/notifications/components';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export function StudentNotificationScreen() {
  const insets = useSafeAreaInsets();
  const {
    sections,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    filteredNotifications,
    unreadCount,
    refresh,
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const hasNotifications = filteredNotifications.length > 0;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.iconButton} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={AuthColors.profileBrand} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable
          style={styles.markAllButton}
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
          hitSlop={8}>
          <Text style={[styles.markAllText, unreadCount === 0 && styles.markAllTextDisabled]}>
            Mark all as read
          </Text>
        </Pressable>
      </View>

      <View style={styles.filterBar}>
        <NotificationFilterChips selected={filter} onSelect={setFilter} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {hasNotifications ? (
          sections.map((section) => (
            <View key={section.id} style={styles.section}>
              <NotificationSectionHeader label={section.label} />
              <View style={styles.list}>
                {section.items.map((notification) => (
                  <NotificationCard
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
            <Text style={styles.emptyTitle}>Belum ada notifikasi</Text>
            <Text style={styles.emptySubtitle}>
              Notifikasi dari aplikasi, program, dan sistem akan muncul di sini.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: AuthColors.profileHeaderBlur,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(199, 196, 215, 0.1)',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  markAllText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.profileBrand,
  },
  markAllTextDisabled: {
    opacity: 0.4,
  },
  filterBar: {
    backgroundColor: AuthColors.profileHeaderBlur,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(199, 196, 215, 0.1)',
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
