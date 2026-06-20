import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modal</Text>
      <Link href="/register" style={styles.link}>
        <Text style={styles.linkText}>Back to Register</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: AuthColors.background,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: AuthColors.textPrimary,
  },
  link: {
    marginTop: 16,
  },
  linkText: {
    ...AuthTypography.screenSubtitle,
    color: AuthColors.brandPrimary,
  },
});
