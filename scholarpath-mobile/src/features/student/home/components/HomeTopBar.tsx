import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotifications } from '@/src/context/student/NotificationContext';
import { AuthColors, FontFamily } from '@/src/theme';

export function HomeTopBar() {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotifications();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.logoRow}>
        <MaterialCommunityIcons name="school" size={22} color={AuthColors.profileBrand} />
        <Text style={styles.brand}>ScholarPath</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.iconButton}
          hitSlop={8}
          onPress={() => router.push('/wishlist' as Href)}>
          <Ionicons name="heart-outline" size={20} color={AuthColors.textSecondary} />
        </Pressable>
        <Pressable
          style={styles.iconButton}
          hitSlop={8}
          onPress={() => router.push('/notifications' as Href)}>
          <Ionicons name="notifications-outline" size={20} color={AuthColors.textSecondary} />
          {unreadCount > 0 ? <View style={styles.badge} /> : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: AuthColors.profileHeaderBlur,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontFamily: FontFamily.extraBold,
    fontSize: 20,
    lineHeight: 24,
    color: AuthColors.profileBrand,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AuthColors.profileBrand,
  },
});
