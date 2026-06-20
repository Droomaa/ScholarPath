import { StyleSheet, Text, View } from 'react-native';

import { DocumentUploadCard } from '@/src/features/student/program/components/DocumentUploadCard';
import type {
  ProgramDocumentRequirement,
  UploadedDocument,
} from '@/src/types/shared/program-registration';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type RequiredDocumentsSectionProps = {
  disabled?: boolean;
  requirements: ProgramDocumentRequirement[];
  documents: Record<string, UploadedDocument>;
  onUploadPress: (documentId: string) => void;
};

export function RequiredDocumentsSection({
  disabled = false,
  requirements,
  documents,
  onUploadPress,
}: RequiredDocumentsSectionProps) {
  return (
    <View style={[styles.section, disabled && styles.sectionDisabled]}>
      <Text style={styles.sectionTitle}>Required Documents (PDF)</Text>

      {!disabled ? null : (
        <Text style={styles.sectionHint}>
          Setujui Eligibility & Terms terlebih dahulu untuk mengunggah dokumen.
        </Text>
      )}

      <View style={styles.documentList}>
        {requirements.map((requirement) => (
          <DocumentUploadCard
            key={requirement.id}
            requirement={requirement}
            uploaded={documents[requirement.id]}
            disabled={disabled}
            largeTitle={requirement.id !== 'achievement'}
            onUploadPress={() => onUploadPress(requirement.id)}
          />
        ))}
      </View>
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
  documentList: {
    gap: 16,
  },
});
