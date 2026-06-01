import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type ApplicantUploadedDocument } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ApplicantDocumentRowProps = {
  document: ApplicantUploadedDocument;
  onPress: () => void;
};

const ICON_CONFIG = {
  pdf: { name: 'document-text-outline' as const, bg: '#FEE2E2', color: '#BA1A1A' },
  id: { name: 'card-outline' as const, bg: '#DBEAFE', color: '#2563EB' },
  letter: { name: 'mail-outline' as const, bg: '#DCFCE7', color: '#16A34A' },
  certificate: { name: 'ribbon-outline' as const, bg: '#FEF3C7', color: '#D97706' },
};

export function ApplicantDocumentRow({ document, onPress }: ApplicantDocumentRowProps) {
  const config = ICON_CONFIG[document.iconType];
  const statusLabel =
    document.verificationStatus === 'verified'
      ? `Verified • ${document.sizeLabel}`
      : `Pending Verification • ${document.sizeLabel}`;

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.left}>
        <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
          <Ionicons name={config.name} size={20} color={config.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{document.title}</Text>
          <Text style={styles.meta}>{statusLabel}</Text>
        </View>
      </View>
      <Ionicons name="eye-outline" size={16} color={AuthColors.profileBrand} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.3)',
    borderRadius: 16,
    padding: 17,
    minHeight: 82,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  meta: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: '#767586',
  },
});
