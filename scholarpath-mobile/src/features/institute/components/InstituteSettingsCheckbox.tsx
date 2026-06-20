import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthColors } from '@/src/theme';

type InstituteSettingsCheckboxProps = {
  checked: boolean;
  onPress: () => void;
};

export function InstituteSettingsCheckbox({ checked, onPress }: InstituteSettingsCheckboxProps) {
  return (
    <Pressable
      style={[styles.box, checked ? styles.boxChecked : styles.boxUnchecked]}
      onPress={onPress}
      hitSlop={8}>
      {checked ? <Ionicons name="checkmark" size={14} color={AuthColors.white} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: '#2C2ABC',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  boxUnchecked: {
    backgroundColor: '#EFECF8',
    borderWidth: 1,
    borderColor: '#C6C5D7',
  },
});
