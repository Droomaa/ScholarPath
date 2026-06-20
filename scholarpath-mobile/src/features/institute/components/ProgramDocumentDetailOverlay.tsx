import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import {
  getProgramDocumentTemplateLabel,
  hasProgramDocumentTemplate,
  resolveProgramDocumentGuidelines,
} from '@/src/features/institute/utils/program-document-utils';
import { type InstituteProgramDocument } from '@/src/types/institute/institute';
import { AuthColors, FontFamily } from '@/src/theme';

type ProgramDocumentDetailOverlayProps = {
  document: InstituteProgramDocument | null;
  onClose: () => void;
};

async function handleViewTemplate(document: InstituteProgramDocument) {
  const templateUrl = document.templateUrl?.trim();

  if (!templateUrl) {
    Alert.alert('Template unavailable', 'No template file is available for this document yet.');
    return;
  }

  const canOpen = await Linking.canOpenURL(templateUrl);
  if (!canOpen) {
    Alert.alert('Unable to open', 'Could not open this template on your device.');
    return;
  }

  await Linking.openURL(templateUrl);
}

export function ProgramDocumentDetailOverlay({
  document,
  onClose,
}: ProgramDocumentDetailOverlayProps) {
  if (!document) {
    return null;
  }

  const guidelines = resolveProgramDocumentGuidelines(document);
  const showTemplate = hasProgramDocumentTemplate(document);

  return (
    <View style={styles.portal} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={document.icon} size={24} color={AuthColors.profileBrand} />
          </View>
          <Text style={styles.title}>{document.title}</Text>
          <Text style={styles.description}>{document.description}</Text>

          {showTemplate ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.templateButton}
              onPress={() => handleViewTemplate(document)}>
              <Ionicons name="document-outline" size={18} color={AuthColors.profileBrand} />
              <View style={styles.templateTextWrap}>
                <Text style={styles.templateButtonTitle}>View Template</Text>
                <Text style={styles.templateButtonMeta}>
                  {getProgramDocumentTemplateLabel(document)}
                </Text>
              </View>
              <Ionicons name="open-outline" size={16} color={AuthColors.profileBrand} />
            </TouchableOpacity>
          ) : null}

          <Text style={styles.label}>Submission Guidelines</Text>
          {guidelines.map((guideline) => (
            <View key={guideline} style={styles.guidelineRow}>
              <Text style={styles.guidelineBullet}>•</Text>
              <Text style={styles.guidelineText}>{guideline}</Text>
            </View>
          ))}

          <Text style={styles.note}>
            {showTemplate
              ? 'Template URL will come from the backend API in production.'
              : 'Template and guidelines will sync from the backend once the API is connected.'}
          </Text>

          <TouchableOpacity activeOpacity={0.85} style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portal: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 27, 35, 0.45)',
  },
  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: AuthColors.white,
    borderRadius: 16,
    padding: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(70, 72, 212, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    lineHeight: 24,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
    textAlign: 'center',
    marginBottom: 4,
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(70, 72, 212, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(70, 72, 212, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  templateTextWrap: {
    flex: 1,
    gap: 2,
  },
  templateButtonTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 18,
    color: AuthColors.profileBrand,
  },
  templateButtonMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: AuthColors.textMuted,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.textPrimary,
    marginTop: 4,
  },
  guidelineRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  guidelineBullet: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: AuthColors.profileBrand,
  },
  guidelineText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: '#464554',
  },
  note: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: AuthColors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#4648D4',
  },
  buttonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: AuthColors.white,
  },
});
