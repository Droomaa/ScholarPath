import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

export function ProfileTopBar() {
  return (
    <View style={styles.container}>
      <View style={styles.logoRow}>
        <MaterialCommunityIcons name="school" size={22} color={AuthColors.profileBrand} />
        <Text style={styles.brand}>ScholarPath</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    ...AuthTypography.profileHeaderBrand,
    color: AuthColors.profileBrand,
  },
});
