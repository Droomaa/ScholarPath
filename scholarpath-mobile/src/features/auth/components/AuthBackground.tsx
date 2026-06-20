import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AuthColors } from '@/src/theme';

type AuthBackgroundProps = {
  children: React.ReactNode;
};

export function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <LinearGradient
      colors={[AuthColors.background, AuthColors.background, AuthColors.white]}
      style={styles.container}>
      <View style={styles.orbTopRight} />
      <View style={styles.orbBottomLeft} />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orbTopRight: {
    position: 'absolute',
    top: -98,
    right: -39,
    width: 256,
    height: 256,
    borderRadius: 9999,
    backgroundColor: AuthColors.orbBlue,
    opacity: 0.9,
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: 66,
    left: -39,
    width: 320,
    height: 320,
    borderRadius: 9999,
    backgroundColor: AuthColors.orbPurple,
    opacity: 0.9,
  },
});
