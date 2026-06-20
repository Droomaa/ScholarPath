import { Tabs } from 'expo-router';

import { StudentTabBar } from '@/src/features/student/home/components/StudentTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <StudentTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Eksplorasi' }} />
      <Tabs.Screen name="ai" options={{ title: 'AI' }} />
      <Tabs.Screen name="application" options={{ title: 'Application' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
