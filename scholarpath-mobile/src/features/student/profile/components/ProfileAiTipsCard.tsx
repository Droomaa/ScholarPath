import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

export function ProfileAiTipsCard() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name="creation" size={22} color={AuthColors.profileBrand} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Tips Akurasi AI</Text>
        <Text style={styles.body}>
          Semakin lengkap profil akademik Anda, semakin akurat mesin rekomendasi kami memberikan
          jalur karier yang tepat.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: AuthColors.profileTipsBackground,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    padding: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: AuthColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...AuthTypography.profileTipsTitle,
    color: AuthColors.profileTipsText,
  },
  body: {
    ...AuthTypography.profileTipsBody,
    color: AuthColors.profileTipsText,
    opacity: 0.8,
  },
});
