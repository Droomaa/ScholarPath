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

import {
  INTERESTS_BY_CATEGORY,
  PROFILE_CATEGORIES,
  SKILLS_BY_CATEGORY,
} from '@/src/features/student/profile/constants/profile-options';
import { ProfileCategory } from '@/src/features/student/profile/types/student-profile';
import { AuthColors, AuthTypography } from '@/src/theme';

type PickerMode = 'interests' | 'skills';

type CategoryPickerModalProps = {
  visible: boolean;
  mode: PickerMode;
  selectedItems: string[];
  onClose: () => void;
  onSelect: (item: string) => void;
};

export function CategoryPickerModal({
  visible,
  mode,
  selectedItems,
  onClose,
  onSelect,
}: CategoryPickerModalProps) {
  const insets = useSafeAreaInsets();

  const getOptions = (category: ProfileCategory) =>
    mode === 'interests' ? INTERESTS_BY_CATEGORY[category] : SKILLS_BY_CATEGORY[category];

  const title = mode === 'interests' ? 'Tambah Minat' : 'Tambah Keahlian';

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
            {PROFILE_CATEGORIES.map((category) => (
              <View key={category.id} style={styles.categoryBlock}>
                <Text style={styles.categoryLabel}>{category.label}</Text>
                <View style={styles.optionsWrap}>
                  {getOptions(category.id).map((option) => {
                    const isSelected = selectedItems.includes(option);
                    return (
                      <Pressable
                        key={option}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        disabled={isSelected}
                        onPress={() => {
                          onSelect(option);
                          onClose();
                        }}>
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {option}
                        </Text>
                        {isSelected ? (
                          <Ionicons name="checkmark" size={16} color={AuthColors.profileBrand} />
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
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
    maxHeight: '80%',
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
  categoryBlock: {
    marginBottom: 20,
  },
  categoryLabel: {
    ...AuthTypography.profileLabel,
    color: AuthColors.profileBrand,
    marginBottom: 10,
  },
  optionsWrap: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: AuthColors.profileChipBackground,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
  },
  optionSelected: {
    opacity: 0.6,
  },
  optionText: {
    ...AuthTypography.profileChip,
    color: AuthColors.textSecondary,
    flex: 1,
  },
  optionTextSelected: {
    color: AuthColors.profileBrand,
  },
});
