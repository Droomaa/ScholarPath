import type { ReactNode } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useInstituteNotifications } from '@/src/context/institute/InstituteNotificationContext';
import { AuthColors, FontFamily } from '@/src/theme';

type TabConfig = {
  name: string;
  label: string;
  icon: (props: { color: string; focused: boolean }) => ReactNode;
};

const ACTIVE_TAB_SIZE = 58;

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'index',
    label: 'Dashboard',
    icon: ({ color }) => (
      <MaterialCommunityIcons name="view-dashboard-outline" size={18} color={color} />
    ),
  },
  {
    name: 'programs',
    label: 'Programs',
    icon: ({ color }) => (
      <MaterialCommunityIcons name="clipboard-text-outline" size={18} color={color} />
    ),
  },
  {
    name: 'applicants',
    label: 'Applicants',
    icon: ({ color }) => (
      <MaterialCommunityIcons name="account-group-outline" size={18} color={color} />
    ),
  },
  {
    name: 'alerts',
    label: 'Alert',
    icon: ({ color }) => <Ionicons name="notifications-outline" size={18} color={color} />,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: ({ color }) => <MaterialCommunityIcons name="domain" size={20} color={color} />,
  },
];

export function InstituteTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useInstituteNotifications();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG.find((tab) => tab.name === route.name);
        const label = config?.label ?? options.title ?? route.name;
        const color = isFocused ? AuthColors.white : '#464554';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const showBadge = route.name === 'alerts' && unreadCount > 0 && !isFocused;

        return (
          <View key={route.key} style={styles.tabSlot}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.tabPill, isFocused && styles.tabPillActive]}>
              <View style={styles.iconWrap}>
                {config?.icon({ color, focused: isFocused })}
                {showBadge ? <View style={styles.badge} /> : null}
              </View>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[styles.label, isFocused && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(252, 248, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#C7C4D7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: ACTIVE_TAB_SIZE / 2,
    overflow: 'hidden',
  },
  tabPillActive: {
    width: ACTIVE_TAB_SIZE,
    height: ACTIVE_TAB_SIZE,
    borderRadius: ACTIVE_TAB_SIZE / 2,
    backgroundColor: '#6063EE',
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    lineHeight: 12,
    color: '#464554',
    textAlign: 'center',
    maxWidth: ACTIVE_TAB_SIZE - 8,
  },
  labelActive: {
    color: AuthColors.white,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BA1A1A',
  },
});
