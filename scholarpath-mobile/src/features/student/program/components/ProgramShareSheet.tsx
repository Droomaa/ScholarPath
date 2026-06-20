import type { ReactNode } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { getProgramShareMessage } from '@/src/features/student/explore/constants/explore-programs';
import { ExploreProgram } from '@/src/types/shared/program';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type ProgramShareSheetProps = {
  visible: boolean;
  program: ExploreProgram | null;
  onClose: () => void;
};

type ShareOption = {
  id: string;
  label: string;
  icon: ReactNode;
  onPress: () => void;
};

export function ProgramShareSheet({ visible, program, onClose }: ProgramShareSheetProps) {
  if (!program) return null;

  const message = getProgramShareMessage(program);

  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <Ionicons name="logo-whatsapp" size={22} color="#25D366" />,
      onPress: async () => {
        const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          await Share.share({ message });
        }
        onClose();
      },
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <Ionicons name="logo-instagram" size={22} color="#E4405F" />,
      onPress: async () => {
        const instagramUrl = 'instagram://app';
        const canOpen = await Linking.canOpenURL(instagramUrl);
        if (canOpen) {
          await Linking.openURL(instagramUrl);
        }
        await Share.share({ message });
        onClose();
      },
    },
    {
      id: 'other',
      label: 'Lainnya',
      icon: <Ionicons name="share-social-outline" size={22} color={AuthColors.profileBrand} />,
      onPress: async () => {
        await Share.share({ message });
        onClose();
      },
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Bagikan Program</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {program.title}
          </Text>
          <View style={styles.options}>
            {shareOptions.map((option) => (
              <Pressable key={option.id} style={styles.option} onPress={option.onPress}>
                <View style={styles.optionIcon}>{option.icon}</View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Batal</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: AuthColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 26,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...AuthTypography.profileSubtitle,
    color: AuthColors.textSecondary,
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  option: {
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AuthColors.profileChipBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textSecondary,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    ...AuthTypography.profileInput,
    color: AuthColors.profileBrand,
  },
});
