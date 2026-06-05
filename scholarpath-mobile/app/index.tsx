import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { AuthColors } from '@/src/theme';

export default function Index() {
  const { isAuthenticated, isHydrating } = useStudentSession();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AuthColors.white }}>
        <ActivityIndicator size="large" color={AuthColors.brandPrimary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/register" />;
}
