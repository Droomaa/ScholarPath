import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

type ExploreSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function ExploreSearchBar({ value, onChangeText }: ExploreSearchBarProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-outline"
        size={18}
        color={AuthColors.textPlaceholder}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        placeholder="Cari beasiswa atau olimpiade..."
        placeholderTextColor={AuthColors.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
      />
      <View style={styles.filterButton}>
        <Ionicons name="options-outline" size={18} color={AuthColors.profileBrand} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 8,
    minHeight: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    ...AuthTypography.profileInput,
    flex: 1,
    color: AuthColors.textPrimary,
    paddingVertical: 13,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: AuthColors.profileChipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
