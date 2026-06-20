import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
    isLoading,
    isRefreshing,
    error,
    refreshNotifications,
  } = useInstituteNotifications();

  const hasNotifications = filteredNotifications.length > 0;

  return (
    <View style={styles.screen}>
      <InstituteTopBar />
      <InstituteAlertFilterChips selected={filter} onSelect={setFilter} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void refreshNotifications();
            }}
            tintColor={AuthColors.brandPrimary}
          />
        }>
        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={AuthColors.brandPrimary} />
            <Text style={styles.stateText}>Memuat notifikasi...</Text>
          </View>
        ) : null}

        {!isLoading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => void refreshNotifications()}>
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !error && hasNotifications ? (
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
        ) : null}

        {!isLoading && !error && !hasNotifications ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={AuthColors.textMuted} />
            <Text style={styles.emptyTitle}>No alerts yet</Text>
            <Text style={styles.emptySubtitle}>
              Notifications about applicants, programs, and system updates will appear here.
            </Text>
          </View>
        ) : null}
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
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  stateText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: AuthColors.textSecondary,
  },
  errorCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 22,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: AuthColors.brandPrimary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.white,
  },
});
