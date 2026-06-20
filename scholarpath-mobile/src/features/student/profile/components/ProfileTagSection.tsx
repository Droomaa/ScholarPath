import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthColors, AuthTypography } from '@/src/theme';

type ProfileTagSectionProps = {
  label: string;
  tags: string[];
  onAddPress: () => void;
  onRemoveTag: (tag: string) => void;
};

export function ProfileTagSection({ label, tags, onAddPress, onRemoveTag }: ProfileTagSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Pressable style={styles.addButton} onPress={onAddPress} hitSlop={8}>
          <Ionicons name="add-circle" size={20} color={AuthColors.profileBrand} />
        </Pressable>
      </View>
      <View style={styles.tagsWrap}>
        {tags.length === 0 ? (
          <Text style={styles.emptyHint}>Tekan + untuk menambahkan pilihan</Text>
        ) : (
          tags.map((tag) => (
            <Pressable key={tag} style={styles.chip} onPress={() => onRemoveTag(tag)}>
              <Text style={styles.chipText}>{tag}</Text>
              <Ionicons name="close" size={14} color={AuthColors.textSecondary} />
            </Pressable>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...AuthTypography.profileLabel,
    color: AuthColors.textSecondary,
    paddingLeft: 4,
  },
  addButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyHint: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textMuted,
    paddingLeft: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: AuthColors.profileChipBackground,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
    borderRadius: 9999,
    paddingHorizontal: 17,
    paddingVertical: 9,
  },
  chipText: {
    ...AuthTypography.profileChip,
    color: AuthColors.textSecondary,
  },
});
