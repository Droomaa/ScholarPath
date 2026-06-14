import { StyleSheet, Text, View } from 'react-native';

import { DocumentUploadCard } from '@/src/features/student/program/components/DocumentUploadCard';
import { MANDATORY_CV_REQUIREMENT } from '@/src/features/student/program/constants/mandatory-registration-documents';
import type { UploadedDocument } from '@/src/types/shared/program-registration';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type MandatoryDocumentSectionProps = {
  disabled?: boolean;
  uploaded?: UploadedDocument;
  onUploadPress: () => void;
};

export function MandatoryDocumentSection({
  disabled = false,
  uploaded,
  onUploadPress,
}: MandatoryDocumentSectionProps) {
  return (
    <View style={[styles.section, disabled && styles.sectionDisabled]}>
      <Text style={styles.sectionTitle}>Mandatory Document (PDF)</Text>

      {!disabled ? null : (
        <Text style={styles.sectionHint}>
          Setujui Eligibility & Terms terlebih dahulu untuk mengunggah dokumen.
        </Text>
      )}

      <DocumentUploadCard
        requirement={MANDATORY_CV_REQUIREMENT}
        uploaded={uploaded}
        disabled={disabled}
        largeTitle
        onUploadPress={onUploadPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionDisabled: {
    opacity: 0.55,
  },
  sectionTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 20,
    lineHeight: 28,
    color: AuthColors.textPrimary,
    paddingHorizontal: 4,
  },
  sectionHint: {
    ...AuthTypography.profileInput,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textMuted,
    paddingHorizontal: 4,
  },
});
