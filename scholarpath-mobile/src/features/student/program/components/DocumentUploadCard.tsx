import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatFileSize } from '@/src/features/student/program/utils/format-file-size';
import {
  type ProgramDocumentIcon,
  type ProgramDocumentRequirement,
  type UploadedDocument,
} from '@/src/types/shared/program-registration';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

type DocumentUploadCardProps = {
  requirement: ProgramDocumentRequirement;
  uploaded?: UploadedDocument;
  disabled?: boolean;
  onUploadPress: () => void;
};

const iconMap: Record<
  ProgramDocumentIcon,
  { family: 'ionicons' | 'material'; name: string }
> = {
  document: { family: 'ionicons', name: 'document-text-outline' },
  school: { family: 'material', name: 'school-outline' },
  trophy: { family: 'ionicons', name: 'trophy-outline' },
  essay: { family: 'ionicons', name: 'create-outline' },
};

export function DocumentUploadCard({
  requirement,
  uploaded,
  disabled = false,
  onUploadPress,
}: DocumentUploadCardProps) {
  const iconConfig = iconMap[requirement.icon];
  const hasUpload = Boolean(uploaded);

  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      <View style={styles.iconWrap}>
        {iconConfig.family === 'material' ? (
          <MaterialCommunityIcons
            name={iconConfig.name as 'school-outline'}
            size={22}
            color={AuthColors.profileBrand}
          />
        ) : (
          <Ionicons
            name={iconConfig.name as 'document-text-outline'}
            size={20}
            color={AuthColors.profileBrand}
          />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{requirement.title}</Text>
          <View style={[styles.statusIcon, hasUpload ? styles.statusDone : styles.statusPending]}>
            {hasUpload ? (
              <Ionicons name="checkmark" size={12} color={AuthColors.white} />
            ) : (
              <Ionicons name="ellipsis-horizontal" size={12} color={AuthColors.white} />
            )}
          </View>
        </View>

        <Text style={styles.description}>
          {hasUpload
            ? `${uploaded!.name} (${formatFileSize(uploaded!.size)})`
            : requirement.description}
        </Text>

        <Pressable
          style={[
            styles.actionButton,
            hasUpload ? styles.replaceButton : styles.uploadButton,
            disabled && styles.actionButtonDisabled,
          ]}
          onPress={onUploadPress}
          disabled={disabled}>
          <Text
            style={[
              styles.actionButtonText,
              hasUpload ? styles.replaceButtonText : styles.uploadButtonText,
            ]}>
            {hasUpload ? 'Replace' : 'Upload Document'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: 'rgba(199, 196, 215, 0.1)',
    borderRadius: 16,
    padding: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 99, 238, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
  },
  statusIcon: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDone: {
    backgroundColor: AuthColors.profileBrand,
  },
  statusPending: {
    backgroundColor: '#BA1A1A',
  },
  description: {
    ...AuthTypography.profileInput,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textSecondary,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: AuthColors.profileBrand,
  },
  replaceButton: {
    backgroundColor: AuthColors.profileProgressTrack,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
  },
  uploadButtonText: {
    color: AuthColors.profileBrand,
  },
  replaceButtonText: {
    color: AuthColors.textSecondary,
  },
});
