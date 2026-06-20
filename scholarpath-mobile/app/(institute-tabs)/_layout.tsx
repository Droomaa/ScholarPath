import { Tabs } from 'expo-router';

import { InstituteTabBar } from '@/src/features/institute/components';

export default function InstituteTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <InstituteTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="programs" options={{ title: 'Programs' }} />
      <Tabs.Screen name="applicants" options={{ title: 'Applicants' }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alerts' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
