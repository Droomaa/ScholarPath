import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useApplications } from '@/src/context/shared/ApplicationContext';
import { useStudentSession } from '@/src/context/student/StudentSessionContext';
import { useProgramById } from '@/src/hooks/useProgramById';
import {
  EligibilityTermsSection,
  MandatoryDocumentSection,
  RegistrationFooter,
  RegistrationHeader,
  RegistrationHeroSection,
  RequiredDocumentsSection,
} from '@/src/features/student/program/components';
import { formatDaysLeftLabel } from '@/src/features/student/program/utils/deadline-countdown';
import { pickPdfDocument } from '@/src/features/student/program/utils/pick-pdf-document';
import {
  MANDATORY_CV_DOCUMENT_ID,
  requiresMandatoryCv,
} from '@/src/features/student/program/constants/mandatory-registration-documents';
import { uploadRegistrationDocuments } from '@/src/features/student/program/utils/upload-registration-documents';
import { getProgramRegistrationConfig } from '@/src/features/student/program/utils/program-registration-config';
import { ApiError } from '@/src/services/api/client';
import { parseProgramCompositeId, parsedProgramIdToApiPayload } from '@/src/services/explore';
import { createPendaftaran } from '@/src/services/registration';
import { type ActiveProgramStatus } from '@/src/types/shared/application';
import {
  type ProgramRegistrationDraft,
  type UploadedDocument,
} from '@/src/types/shared/program-registration';
import { AuthColors, AuthTypography, FontFamily } from '@/src/theme';

const emptyDraft: ProgramRegistrationDraft = {
  agreedToTerms: false,
  documents: {},
  motivationAnswer: '',
};

function resolveActiveProgramStatus(
  draft: ProgramRegistrationDraft,
  requiredDocumentIds: string[],
  needsMandatoryCv: boolean
): ActiveProgramStatus {
  const mandatoryCvReady = !needsMandatoryCv || Boolean(draft.documents[MANDATORY_CV_DOCUMENT_ID]);
  const requiredUploaded =
    mandatoryCvReady && requiredDocumentIds.every((docId) => Boolean(draft.documents[docId]));
  const hasProgress =
    draft.agreedToTerms ||
    Object.keys(draft.documents).length > 0 ||
    draft.motivationAnswer.trim().length > 0;

  if (!hasProgress) {
    return 'incomplete_form';
  }
  if (!requiredUploaded || !draft.motivationAnswer.trim()) {
    return 'incomplete_documents';
  }
  return 'incomplete_documents';
}

export function ProgramRegisterScreen() {
  const { id, activeId } = useLocalSearchParams<{ id: string; activeId?: string }>();
  const { token } = useStudentSession();
  const { program, isLoading, error } = useProgramById(id ?? '');
  const {
    activePrograms,
    upsertActiveProgram,
    findActiveProgramByProgramId,
    saveRegistrationDraft,
    getRegistrationDraft,
    removeActiveProgram,
    refreshRegistrations,
    updateActiveProgramStatus,
  } = useApplications();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registrationConfig = program ? getProgramRegistrationConfig(program) : null;

  const requiredDocumentIds = useMemo(
    () =>
      (registrationConfig?.requiredDocuments ?? [])
        .filter((doc) => !doc.optional)
        .map((doc) => doc.id),
    [registrationConfig]
  );

  const [draft, setDraft] = useState<ProgramRegistrationDraft>(() =>
    program ? (getRegistrationDraft(program.id) ?? emptyDraft) : emptyDraft
  );

  useEffect(() => {
    if (!program) return;
    setDraft(getRegistrationDraft(program.id) ?? emptyDraft);
  }, [program?.id]);

  useEffect(() => {
    if (!program || !registrationConfig) return;
    if (findActiveProgramByProgramId(program.id)) return;

    upsertActiveProgram({
      id: `active-${program.id}-${Date.now()}`,
      title: program.title,
      provider: program.provider,
      status: 'incomplete_form',
      programId: program.id,
      daysLeft: formatDaysLeftLabel(registrationConfig.deadlineAt),
    });
  }, [program?.id, registrationConfig?.deadlineAt]);

  const activeProgram = useMemo(() => {
    if (activeId) {
      return activePrograms.find((item) => item.id === activeId);
    }
    return program ? findActiveProgramByProgramId(program.id) : undefined;
  }, [activeId, activePrograms, program?.id]);

  if (isLoading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={AuthColors.profileBrand} />
      </View>
    );
  }

  if (!program || !registrationConfig) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <Text style={styles.notFound}>{error ?? 'Program tidak ditemukan.'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const documentsEnabled = draft.agreedToTerms;
  const needsMandatoryCv = requiresMandatoryCv(program.category);

  const isSubmitReady =
    draft.agreedToTerms &&
    (!needsMandatoryCv || Boolean(draft.documents[MANDATORY_CV_DOCUMENT_ID])) &&
    requiredDocumentIds.every((docId) => Boolean(draft.documents[docId])) &&
    draft.motivationAnswer.trim().length > 0;

  const syncDraft = (nextDraft: ProgramRegistrationDraft, showAlert = false) => {
    setDraft(nextDraft);
    saveRegistrationDraft(program.id, nextDraft);

    const status = resolveActiveProgramStatus(nextDraft, requiredDocumentIds, needsMandatoryCv);
    const activeIdToUse = activeProgram?.id ?? `active-${program.id}-${Date.now()}`;

    upsertActiveProgram({
      id: activeIdToUse,
      title: program.title,
      provider: program.provider,
      status,
      programId: program.id,
      daysLeft: formatDaysLeftLabel(registrationConfig.deadlineAt),
    });

    if (activeProgram) {
      updateActiveProgramStatus(activeProgram.id, status);
    }

    if (showAlert) {
      Alert.alert('Draft tersimpan', 'Progress pendaftaranmu telah disimpan.');
    }
  };

  const handleUpload = async (documentId: string) => {
    if (!documentsEnabled) return;

    const uploaded = await pickPdfDocument();
    if (!uploaded) return;

    syncDraft({
      ...draft,
      documents: {
        ...draft.documents,
        [documentId]: uploaded,
      },
    });
  };

  const handleSaveDraft = () => {
    syncDraft(draft, false);
    router.replace('/(tabs)/application' as Href);
  };

  const handleSubmit = async () => {
    if (!isSubmitReady) {
      Alert.alert(
        'Form belum lengkap',
        needsMandatoryCv
          ? 'Setujui syarat, unggah CV wajib, semua dokumen wajib program, dan isi motivasi sebelum submit.'
          : 'Setujui syarat, unggah semua dokumen wajib program, dan isi motivasi sebelum submit.'
      );
      return;
    }

    const activeIdToUse = activeProgram?.id ?? findActiveProgramByProgramId(program.id)?.id;

    if (!activeIdToUse) {
      Alert.alert('Error', 'Program aktif tidak ditemukan.');
      return;
    }

    if (!token) {
      Alert.alert('Login diperlukan', 'Silakan login untuk mendaftar program.');
      return;
    }

    const parsed = parseProgramCompositeId(program.id);
    if (!parsed) {
      Alert.alert('Error', 'Program tidak valid.');
      return;
    }

    setIsSubmitting(true);

    try {
      const documents = await uploadRegistrationDocuments({
        token,
        draftDocuments: draft.documents,
        requiredDocuments: registrationConfig.requiredDocuments,
        includeMandatoryCv: needsMandatoryCv,
      });

      await createPendaftaran(token, {
        ...parsedProgramIdToApiPayload(parsed),
        motivation_text: draft.motivationAnswer.trim(),
        documents,
      });
      removeActiveProgram(activeIdToUse);
      await refreshRegistrations();

      Alert.alert('Berhasil', 'Pendaftaran berhasil dikirim.', [
        {
          text: 'OK',
          onPress: () => router.replace('/application' as Href),
        },
      ]);
    } catch (submitError) {
      const message =
        submitError instanceof ApiError
          ? submitError.message
          : 'Gagal mengirim pendaftaran. Coba lagi.';
      Alert.alert('Pendaftaran gagal', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <RegistrationHeader onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets>
        <RegistrationHeroSection
          title={program.title}
          deadlineAt={registrationConfig.deadlineAt}
        />

        <EligibilityTermsSection
          terms={registrationConfig.eligibilityTerms}
          agreed={draft.agreedToTerms}
          onAgreedChange={(agreed) => syncDraft({ ...draft, agreedToTerms: agreed })}
        />

        {needsMandatoryCv ? (
          <MandatoryDocumentSection
            disabled={!documentsEnabled}
            uploaded={draft.documents[MANDATORY_CV_DOCUMENT_ID] as UploadedDocument | undefined}
            onUploadPress={() => handleUpload(MANDATORY_CV_DOCUMENT_ID)}
          />
        ) : null}

        <RequiredDocumentsSection
          disabled={!documentsEnabled}
          requirements={registrationConfig.requiredDocuments}
          documents={draft.documents}
          onUploadPress={handleUpload}
        />

        <View style={[styles.section, !documentsEnabled && styles.sectionDisabled]}>
          <Text style={styles.motivationLabel}>{registrationConfig.motivationQuestion}</Text>
          <TextInput
            style={styles.motivationInput}
            placeholder="Answer here..."
            placeholderTextColor={AuthColors.textPlaceholder}
            multiline
            textAlignVertical="top"
            editable={documentsEnabled}
            value={draft.motivationAnswer}
            onChangeText={(motivationAnswer) =>
              setDraft((prev) => ({ ...prev, motivationAnswer }))
            }
            onBlur={() => {
              if (documentsEnabled) {
                syncDraft(draft);
              }
            }}
          />
        </View>
      </ScrollView>

      <RegistrationFooter
        onSaveDraftPress={handleSaveDraft}
        onSubmitPress={() => {
          void handleSubmit();
        }}
        submitDisabled={!isSubmitReady}
        isSubmitting={isSubmitting}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AuthColors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 24,
  },
  section: {
    gap: 14,
  },
  sectionDisabled: {
    opacity: 0.55,
  },
  motivationLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.14,
    color: AuthColors.textPrimary,
    paddingHorizontal: 4,
  },
  motivationInput: {
    minHeight: 120,
    backgroundColor: AuthColors.white,
    borderWidth: 1,
    borderColor: AuthColors.profileChipBorder,
    borderRadius: 16,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 17,
    fontFamily: FontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    color: AuthColors.textPrimary,
  },
  notFound: {
    ...AuthTypography.profileInput,
    color: AuthColors.textPrimary,
    textAlign: 'center',
  },
  backLink: {
    ...AuthTypography.profileInput,
    color: AuthColors.profileBrand,
  },
});
