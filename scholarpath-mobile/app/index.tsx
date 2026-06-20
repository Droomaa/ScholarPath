import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useInstituteSession } from '@/src/context/institute/InstituteSessionContext';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { AuthColors } from '@/src/theme';

export default function Index() {
  const { isAuthenticated: isStudentAuthenticated, isHydrating: isStudentHydrating } =
    useStudentSession();
  const { isAuthenticated: isInstituteAuthenticated, isHydrating: isInstituteHydrating } =
    useInstituteSession();

  const isHydrating = isStudentHydrating || isInstituteHydrating;

  if (isHydrating) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: AuthColors.white,
        }}>
        <ActivityIndicator size="large" color={AuthColors.brandPrimary} />
      </View>
    );
  }

  if (isStudentAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  if (isInstituteAuthenticated) {
    return <Redirect href="/(institute-tabs)" />;
  }

  return <Redirect href="/register" />;
}
