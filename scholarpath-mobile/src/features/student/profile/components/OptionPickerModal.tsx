import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthColors, AuthTypography } from '@/src/theme';

type OptionPickerModalProps = {
  visible: boolean;
  title: string;
  options: readonly string[];
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function OptionPickerModal({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: OptionPickerModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={AuthColors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const isSelected = option === selectedValue;
              return (
                <Pressable
                  key={option}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={20} color={AuthColors.profileBrand} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: AuthColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 9999,
    backgroundColor: AuthColors.profileChipBorder,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    ...AuthTypography.profileTitle,
    fontSize: 18,
    color: AuthColors.textPrimary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: AuthColors.profileChipBackground,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
  },
  optionSelected: {
    borderColor: AuthColors.profileBrand,
  },
  optionText: {
    ...AuthTypography.profileInput,
    flex: 1,
    color: AuthColors.textSecondary,
  },
  optionTextSelected: {
    color: AuthColors.profileBrand,
    fontFamily: AuthTypography.profileLabel.fontFamily,
  },
});
