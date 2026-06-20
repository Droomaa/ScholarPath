import type { ReactNode } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthColors, FontFamily } from '@/src/theme';

type TabConfig = {
  name: string;
  label: string;
  icon: (props: { color: string; focused: boolean }) => ReactNode;
};

const ACTIVE_TAB_SIZE = 56;

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'index',
    label: 'Home',
    icon: ({ color, focused }) => (
      <Ionicons name={focused ? 'home' : 'home-outline'} size={20} color={color} />
    ),
  },
  {
    name: 'explore',
    label: 'Eksplor',
    icon: ({ color }) => <Ionicons name="compass-outline" size={20} color={color} />,
  },
  {
    name: 'ai',
    label: 'AI',
    icon: ({ color }) => (
      <MaterialCommunityIcons name="creation" size={20} color={color} />
    ),
  },
  {
    name: 'application',
    label: 'Apply',
    icon: ({ color }) => <Ionicons name="clipboard-outline" size={20} color={color} />,
  },
  {
    name: 'profile',
    label: 'Profil',
    icon: ({ color }) => <Ionicons name="person-outline" size={20} color={color} />,
  },
];

export function StudentTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG.find((tab) => tab.name === route.name);
        const label = config?.label ?? options.title ?? route.name;
        const color = isFocused ? AuthColors.profileBrand : '#565E74';

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

        return (
          <View key={route.key} style={styles.tabSlot}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.tabPill, isFocused && styles.tabPillActive]}>
              {config?.icon({ color, focused: isFocused })}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
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
    paddingTop: 6,
    paddingHorizontal: 4,
    backgroundColor: 'rgba(252, 248, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(199, 196, 215, 0.2)',
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
    backgroundColor: 'rgba(96, 99, 238, 0.12)',
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    lineHeight: 11,
    color: '#565E74',
    textAlign: 'center',
    maxWidth: ACTIVE_TAB_SIZE - 10,
  },
  labelActive: {
    fontFamily: FontFamily.semiBold,
    color: AuthColors.profileBrand,
  },
});
