import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

export function HomeSearchBar() {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={18}
        color={AuthColors.textPlaceholder}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        placeholder="Cari beasiswa atau olimpiade..."
        placeholderTextColor={AuthColors.textPlaceholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    ...AuthTypography.profileInput,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
    borderRadius: 16,
    paddingVertical: 13,
    paddingLeft: 49,
    paddingRight: 17,
    color: AuthColors.textPrimary,
  },
});
